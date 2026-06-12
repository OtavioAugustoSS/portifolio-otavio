import { NextResponse } from "next/server";
import { AI_CONTEXT } from "@/data/ai-context";

export const maxDuration = 60;

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;
const TIMEOUT_MS = 60_000;

// Modelo padrão validado por benchmark (1,6–3,4s vs ~10-31s do llama-3.1-70b).
// Defina NVIDIA_MODEL no ambiente para trocar sem alterar código
// (ex.: NVIDIA_MODEL=meta/llama-3.1-70b-instruct).
const MODEL = process.env.NVIDIA_MODEL ?? "meta/llama-4-maverick-17b-128e-instruct";

type ChatMessage = { role: "user" | "assistant"; content: string };

function isValidMessages(val: unknown): val is ChatMessage[] {
  if (!Array.isArray(val) || val.length > MAX_MESSAGES) return false;
  return val.every(
    (m) =>
      typeof m === "object" &&
      m !== null &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.length <= MAX_CONTENT_LENGTH
  );
}

// Chama a NIM com retry automático (1x) em timeout / 5xx / 429.
// Seguro: o retry acontece antes de qualquer byte ser enviado ao cliente.
async function fetchNim(apiKey: string, messages: ChatMessage[], attempt = 0): Promise<Response> {
  let response: Response;
  try {
    response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: AI_CONTEXT },
          ...messages,
        ],
        temperature: 0.3,
        max_tokens: 512,
        stream: true,
      }),
    });
  } catch (err) {
    const isTimeout = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    if (isTimeout && attempt === 0) return fetchNim(apiKey, messages, 1);
    throw err;
  }

  if ((response.status >= 500 || response.status === 429) && attempt === 0) {
    return fetchNim(apiKey, messages, 1);
  }
  return response;
}

// Converte o SSE da NIM (formato OpenAI) em deltas de texto puro.
function sseToTextStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Eventos SSE são separados por linha em branco
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const event of events) {
            for (const line of event.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const payload = line.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const json = JSON.parse(payload);
                const delta: unknown = json?.choices?.[0]?.delta?.content;
                if (typeof delta === "string" && delta.length > 0) {
                  controller.enqueue(encoder.encode(delta));
                }
              } catch {
                // linha SSE malformada — ignora
              }
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
      }
    },
    cancel() {
      upstream.cancel().catch(() => {});
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!isValidMessages(messages)) {
      return NextResponse.json(
        { error: "Payload inválido." },
        { status: 400 }
      );
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "A chave API da Nvidia não foi configurada no servidor (.env.local)." },
        { status: 500 }
      );
    }

    const response = await fetchNim(apiKey, messages);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Erro na API NVIDIA (${response.status}): ${errorText}` },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    if (!response.body) {
      return NextResponse.json(
        { error: "Resposta inesperada da API." },
        { status: 502 }
      );
    }

    // Stream de texto puro: o cliente distingue sucesso (text/plain) de erro (JSON).
    return new Response(sseToTextStream(response.body), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Chat API Error:", message);
    const isTimeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return NextResponse.json(
      { error: isTimeout ? "A IA demorou demais para responder." : "Falha ao se comunicar com a IA." },
      { status: 504 }
    );
  }
}
