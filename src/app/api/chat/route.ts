import { NextResponse } from "next/server";
import { aiContextFor } from "@/data/ai-context";
import { NO_INFO_TAG } from "@/lib/site-actions";

export const maxDuration = 60;

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;
const TIMEOUT_MS = 60_000;

// Modelo padrão validado por benchmark (set/2026): TTFT <1s, resposta completa
// em ~1–3s. É um modelo de raciocínio: o `enable_thinking: false` abaixo é
// OBRIGATÓRIO — sem ele leva 30s+ e vaza o raciocínio dentro do texto.
// Substitui minimaxai/minimax-m3 (end of life em 2026-09-09 → HTTP 410 "Gone").
// Na mesma medição, deepseek-v4.1-flash / glm-5.3 / kimi-k3 / gemma-4 não
// mandaram nem o 1º byte em 45s (fila saturada na NIM).
// Defina NVIDIA_MODEL no ambiente para trocar sem alterar código.
const MODEL = process.env.NVIDIA_MODEL ?? "nvidia/nemotron-3-super-120b-a12b";

type ChatMessage = { role: "user" | "assistant"; content: string };

// ─── Limite de requisições por IP ─────────────────────────────────────────────
// A rota é pública e gasta a NVIDIA_API_KEY. Janela deslizante em memória:
// cada instância serverless tem a sua, então é proteção contra abuso casual
// (script martelando), não um limite global exato. Só vale em produção — em
// dev o scripts/ai-eval.mjs dispara dezenas de perguntas seguidas.
const RATE_LIMITS = [
  { windowMs: 60_000, max: 10 },      // conversa normal: bem abaixo disso
  { windowMs: 3_600_000, max: 80 },
];
const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || request.headers.get("x-real-ip") || "desconhecido";
}

/** Registra o acesso e devolve em quantos segundos liberar (0 = liberado). */
function rateLimit(ip: string, now = Date.now()): number {
  const longest = RATE_LIMITS[RATE_LIMITS.length - 1].windowMs;
  const list = (hits.get(ip) ?? []).filter((t) => now - t < longest);
  // Retry-After = a MAIOR espera entre as janelas estouradas: responder só a
  // de 1 min quando a de 1 h também está cheia gera um 429 atrás do outro.
  let wait = 0;
  for (const { windowMs, max } of RATE_LIMITS) {
    const inWindow = list.filter((t) => now - t < windowMs);
    if (inWindow.length >= max) {
      wait = Math.max(wait, Math.ceil((inWindow[inWindow.length - max] + windowMs - now) / 1000));
    }
  }
  if (wait > 0) {
    hits.set(ip, list);
    return wait;
  }
  list.push(now);
  hits.set(ip, list);
  // faxina ocasional para o Map não crescer sem fim numa instância quente
  if (hits.size > 5_000) {
    for (const [k, v] of hits) if (!v.length || now - v[v.length - 1] > longest) hits.delete(k);
  }
  return 0;
}

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

// Tentativas totais por pergunta. A sobrecarga da NIM costuma falhar rápido
// (~0,7s), então tentar de novo sai barato — mas em rajada falha junto,
// por isso a espera crescente entre as tentativas. Com 4 tentativas (~5s)
// ainda sobravam ~10% de 503 em sequência de perguntas; 6 (~12s) cobre a rajada.
const MAX_ATTEMPTS = 6;
const RETRY_DELAYS_MS = [400, 800, 1500, 2500, 4000];

class RetryableNimError extends Error {}

function fetchNim(apiKey: string, messages: ChatMessage[], signal: AbortSignal): Promise<Response> {
  return fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: aiContextFor() },
        ...messages,
      ],
      // 0.6: varia a redação entre respostas sem perder a precisão dos fatos
      // (medido com scripts/ai-eval.mjs; 0.3 repetia quase a mesma frase).
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: 512,
      stream: true,
      // Desliga o raciocínio (modelos que não conhecem a flag a ignoram).
      chat_template_kwargs: { enable_thinking: false },
    }),
  });
}

type SseItem = { text: string } | { error: string };

// Lê o SSE da NIM (formato OpenAI) e produz deltas de texto ou erros.
// ⚠️ A NIM responde HTTP 200 e manda a sobrecarga DENTRO do stream:
// `data: {"error":{"message":"Service temporarily overloaded","code":503}}`.
async function* readSse(upstream: ReadableStream<Uint8Array>): AsyncGenerator<SseItem> {
  const decoder = new TextDecoder();
  const reader = upstream.getReader();
  let buffer = "";
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
          let json;
          try {
            json = JSON.parse(payload);
          } catch {
            continue; // linha SSE malformada — ignora
          }
          if (json?.error) {
            yield { error: String(json.error.message ?? "erro desconhecido") };
            continue;
          }
          const delta: unknown = json?.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta.length > 0) yield { text: delta };
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}

// Só começa uma nova tentativa se ainda sobrar tempo para a RESPOSTA inteira
// caber no prazo: gastar o prazo tentando cortava o texto no meio.
const RETRY_BUDGET_MS = 25_000;

/** Espera que termina antes se o sinal abortar (cliente saiu / prazo). */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => { clearTimeout(t); resolve(); }, { once: true });
  });
}

// Abre o stream e só o entrega depois que chegar o 1º texto de verdade.
// Timeout / 5xx / 429 / erro dentro do stream / stream vazio → tenta de novo.
// Seguro: tudo isso acontece antes de qualquer byte ser enviado ao cliente.
// `signal` junta o prazo total (= maxDuration) com a desconexão do cliente:
// se o visitante fecha a aba, as tentativas e o fetch da NIM param de gastar a chave.
async function openNimStream(
  apiKey: string,
  messages: ChatMessage[],
  signal: AbortSignal,
): Promise<{ first: string; rest: AsyncGenerator<SseItem> } | Response> {
  const started = Date.now();
  let lastError = "";

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0 && Date.now() - started > RETRY_BUDGET_MS) break;
    signal.throwIfAborted();
    const response = await fetchNim(apiKey, messages, signal);

    if (response.status >= 500 || response.status === 429) {
      lastError = `HTTP ${response.status}`;
      await response.body?.cancel();
      if (attempt < MAX_ATTEMPTS - 1) await sleep(RETRY_DELAYS_MS[attempt], signal);
      continue;
    }
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Erro na API NVIDIA (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }
    if (!response.body) throw new RetryableNimError("Resposta inesperada da API.");

    // next() manual: sair de um for-await fecharia o gerador junto.
    const items = readSse(response.body);
    const head = await items.next();
    if (!head.done && "text" in head.value) return { first: head.value.text, rest: items };

    await items.return(undefined); // cancela o stream que falhou
    lastError = head.done || !("error" in head.value) ? "stream vazio" : head.value.error;
    console.warn(`Chat API: tentativa ${attempt + 1}/${MAX_ATTEMPTS} falhou (${lastError})`);
    if (attempt < MAX_ATTEMPTS - 1) await sleep(RETRY_DELAYS_MS[attempt], signal);
  }
  throw new RetryableNimError(lastError);
}

// Converte os deltas em texto puro para o cliente.
// Erro DEPOIS do 1º texto (a NIM às vezes manda o 503 no meio) encerra o stream
// com erro, em vez de fechar normal: fechar normal fazia o cliente guardar o
// trecho cortado como se fosse a resposta completa.
function toTextStream(
  first: string,
  rest: AsyncGenerator<SseItem>,
  abortUpstream: () => void,
  question: string,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let full = first;
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(first));
      try {
        for await (const item of rest) {
          if ("text" in item) {
            full += item.text;
            controller.enqueue(encoder.encode(item.text));
          } else {
            console.warn("Chat API: erro no meio do stream:", item.error);
            throw new Error(item.error);
          }
        }
        controller.close();
        // Memória que cresce com o uso: perguntas que a IA não soube responder
        // ficam nos logs (Vercel → Logs, filtrar por "sem-info") para virar
        // fato novo em src/data/facts.ts.
        if (full.toLowerCase().includes(NO_INFO_TAG)) {
          console.info(`[sem-info] pergunta sem resposta no contexto: ${JSON.stringify(question.slice(0, 300))}`);
        }
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      // rest.return() sozinho só roda quando o próximo chunk chegar (o gerador
      // está parado num read); abortar o fetch corta a NIM na hora.
      abortUpstream();
      rest.return(undefined).catch(() => {});
    },
  });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    const retryAfter = rateLimit(clientIp(request));
    if (retryAfter > 0) {
      return NextResponse.json(
        { error: "Muitas perguntas seguidas. Espere alguns segundos e tente de novo." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }
  }

  let messages: unknown;
  try {
    messages = (await request.json())?.messages;
  } catch {
    messages = undefined; // JSON inválido → cai no 400 abaixo
  }

  try {
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

    const upstream = new AbortController();
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(TIMEOUT_MS), upstream.signal]);
    const opened = await openNimStream(apiKey, messages, signal);
    if (opened instanceof Response) return opened;

    // Stream de texto puro: o cliente distingue sucesso (text/plain) de erro (JSON).
    const question = messages[messages.length - 1]?.content ?? "";
    return new Response(toTextStream(opened.first, opened.rest, () => upstream.abort(), question), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });

  } catch (error: unknown) {
    // O visitante saiu/abortou: não há ninguém para responder nem erro a logar.
    if (request.signal.aborted) return new Response(null, { status: 499 });
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Chat API Error:", message);
    const isTimeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    if (error instanceof RetryableNimError) {
      return NextResponse.json(
        { error: "A IA está sobrecarregada no momento. Tente de novo em instantes." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: isTimeout ? "A IA demorou demais para responder." : "Falha ao se comunicar com a IA." },
      { status: 504 }
    );
  }
}
