import { NextResponse } from "next/server";
import { AI_CONTEXT } from "@/data/ai-context";

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;

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

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [
          { role: "system", content: AI_CONTEXT },
          ...messages,
        ],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Erro na API NVIDIA (${response.status}): ${errorText}` },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (typeof reply !== "string") {
      return NextResponse.json(
        { error: "Resposta inesperada da API." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Chat API Error:", message);
    return NextResponse.json(
      { error: "Falha ao se comunicar com a IA." },
      { status: 500 }
    );
  }
}
