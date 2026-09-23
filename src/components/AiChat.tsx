"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, RotateCcw, ArrowDown } from "lucide-react";
import {
  type SiteAction,
  dispatchSiteAction,
  parseActionTag,
  splitVisible,
  actionLabel,
  actionTag,
} from "@/lib/site-actions";
import { suggestFollowUps } from "@/lib/follow-ups";

const MAX_INPUT_LENGTH = 500;

// ─── Memória da conversa ──────────────────────────────────────────────────────
// A conversa sobrevive a um F5/voltar para a página (localStorage), mas só as
// últimas mensagens vão para a API: o servidor aceita no máximo 20, e histórico
// longo só deixa a resposta mais lenta sem melhorar o contexto.
const STORAGE_KEY = "portfolio-ai-chat-v1";
const MAX_STORED_MESSAGES = 40;
const MAX_HISTORY_SENT = 12; // + a pergunta nova = 13 (servidor: máx 20)

// ─── Ritmo de digitação ───────────────────────────────────────────────────────
// A NIM não entrega os deltas num ritmo constante: medindo o stream real dá pra
// ver fases de ~490ms entre chunks (arrastado) alternando com rajadas de ~13ms.
// Pintar cada chunk assim que chega repassa essa irregularidade pra tela — o
// texto trava e dispara. Por isso os chunks entram num buffer e a revelação tem
// ritmo próprio: acelera quando o buffer enche, desacelera quando esvazia.
// O ritmo é proporcional ao que está represado (pending / TAU), o que se
// auto-regula: em regime, revelar na mesma taxa em que chega. Por isso o piso
// durante o stream é baixo — um piso alto esvaziaria o buffer antes do próximo
// chunk e recriaria justamente o "trava e dispara" que se quer eliminar.
const REVEAL_TAU = 0.35;        // s — tempo alvo para alcançar o buffer
const DRAIN_TAU = 0.12;         // s — idem, depois que o stream fechou
const MIN_CPS_STREAMING = 8;    // chars/s — piso anti-congelamento
const MIN_CPS_DRAINING = 60;    // chars/s — piso na sobra final (não arrasta o fim)
const MAX_CPS_STREAMING = 240;  // chars/s — teto durante o stream
const MAX_CPS_DRAINING = 520;   // chars/s — teto na sobra final
const STICK_THRESHOLD_PX = 48;  // distância do fim em que o scroll ainda "gruda"

interface Message {
  id: string;
  type: "ai" | "user";
  text: string;
  action?: SiteAction;
  isError?: boolean;
}

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  // Ocupado = esperando o 1º byte OU ainda revelando a resposta. Enviar nesse
  // meio-tempo abortava o stream e deixava a resposta anterior cortada.
  const busy = isTyping || streamingId !== null;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const rafRef = useRef<number>(0);
  const lastPromptRef = useRef<string>("");
  // Só puxa o scroll se o usuário estiver acompanhando o fim da conversa —
  // se ele subiu para reler algo, a digitação não arrasta a viewport.
  const stickToBottomRef = useRef(true);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const el = scrollContainerRef.current;
    if (!el || !stickToBottomRef.current) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    stickToBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD_PX;
  };

  // Depende de messages.length (não de messages) porque a revelação atualiza o
  // texto a cada frame — quem acompanha o texto crescendo é o loop de revelação.
  useEffect(() => {
    stickToBottomRef.current = true;
    scrollToBottom();
  }, [messages.length, isTyping]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Restaura a conversa salva (no effect, não no useState: o SSR renderiza
  // vazio e ler o storage no 1º render quebraria a hidratação).
  const restoredRef = useRef(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved) && saved.length) {
        setMessages(saved.filter((m): m is Message =>
          typeof m?.id === "string" && (m.type === "ai" || m.type === "user") && typeof m.text === "string"
        ));
      }
    } catch { /* storage indisponível ou corrompido — começa do zero */ }
    restoredRef.current = true;
  }, []);

  // Salva só fora do streaming (evita escrever a cada frame) e sem bolhas de erro.
  useEffect(() => {
    if (!restoredRef.current || streamingId) return;
    try {
      // Lista vazia NÃO apaga: no 1º render ela ainda está vazia (a restauração
      // é assíncrona) e apagaria o que ia ser restaurado. Quem limpa é o reset.
      const keep = messages.filter(m => !m.isError).slice(-MAX_STORED_MESSAGES);
      if (keep.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(keep));
    } catch { /* cota cheia / modo privado — a conversa só não persiste */ }
  }, [messages, streamingId]);

  const resetConversation = () => {
    abortRef.current?.abort();
    cancelAnimationFrame(rafRef.current);
    setStreamingId(null);
    setIsTyping(false);
    setMessages([]);
    lastPromptRef.current = "";
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* sem storage */ }
  };

  // A IA fala SOBRE o Otavio em 3ª pessoa — perguntar "você" confunde o modelo.
  const predefinedActions = [
    { label: "Trabalho", prompt: "Onde o Otavio trabalha e qual a experiência profissional dele?" },
    { label: "Sobre ele", prompt: "Pode me contar um pouco sobre o Otavio?" },
    { label: "Habilidades", prompt: "Quais são as principais habilidades técnicas do Otavio?" },
    { label: "Projetos", prompt: "Quais projetos o Otavio já desenvolveu?" },
    { label: "Contato", prompt: "Como posso entrar em contato com o Otavio profissionalmente?" }
  ];

  // Depois de uma resposta, os chips viram continuações daquele assunto;
  // sem conversa, ficam os atalhos fixos. Baseado na última resposta VÁLIDA
  // (não na última mensagem) para os chips não trocarem enquanto a IA digita.
  const lastAnswer = [...messages].reverse().find(m => m.type === "ai" && !m.isError && m.text && m.id !== streamingId);
  const chips = lastAnswer
    ? suggestFollowUps(
        lastAnswer.action,
        messages.filter(m => m.type === "user").map(m => m.text)
      )
    : predefinedActions;

  const runAction = (action: SiteAction) => {
    if (action.type === "goto") {
      document.getElementById(action.section)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      dispatchSiteAction(action);
    }
  };

  const pushErrorMessage = (text: string) => {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), type: "ai", text, isError: true }]);
  };

  /**
   * Consome o stream para um buffer e revela o texto em ritmo próprio.
   * Retorna o texto BRUTO completo (com a tag de ação, se houver) só depois que
   * o último caractere já apareceu na tela.
   */
  const revealStream = async (body: ReadableStream<Uint8Array>, aiId: string): Promise<string> => {
    const instant =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raw = "";        // tudo que chegou do servidor
    let target = "";     // o que já é seguro exibir (sem tag parcial piscando)
    let shown = 0;       // quantos chars de `target` já estão na tela
    let carry = 0;       // resto fracionário de char entre frames
    let done = false;    // stream fechou
    let started = false;

    const openBubble = () => {
      if (started) return;
      started = true;
      setIsTyping(false);
      setStreamingId(aiId);
      setMessages(prev => [...prev, { id: aiId, type: "ai", text: "" }]);
    };

    const paint = (text: string) => {
      setMessages(prev => prev.map(m => (m.id === aiId ? { ...m, text } : m)));
      scrollToBottom("auto");
    };

    const revealed = new Promise<void>((resolve) => {
      let last = performance.now();

      const tick = (now: number) => {
        // clamp: aba em background acumula dt gigante e despejaria tudo de uma vez
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;

        shown = Math.min(shown, target.length);
        const pending = target.length - shown;

        if (pending > 0) {
          const cps = Math.min(
            Math.max(
              pending / (done ? DRAIN_TAU : REVEAL_TAU),
              done ? MIN_CPS_DRAINING : MIN_CPS_STREAMING
            ),
            done ? MAX_CPS_DRAINING : MAX_CPS_STREAMING
          );
          carry += cps * dt;
          const step = Math.floor(carry);
          if (step > 0) {
            carry -= step;
            shown += Math.min(step, pending);
            paint(target.slice(0, shown));
          }
        } else {
          carry = 0;
        }

        if (done && shown >= target.length) {
          resolve();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    });

    const reader = body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done: closed, value } = await reader.read();
        if (closed) break;
        raw += decoder.decode(value, { stream: true });
        target = splitVisible(raw);
        if (!started && target) openBubble();
        if (instant && started) {
          shown = target.length;
          paint(target);
        }
      }
    } finally {
      // Fecha o loop de revelação mesmo se o fetch for abortado
      done = true;
      reader.releaseLock();
      await revealed;
      cancelAnimationFrame(rafRef.current);
      setStreamingId(null);
    }

    // Sem texto visível (stream vazio ou só uma tag) o chamador trata como falha
    return started ? raw : "";
  };

  const handleSend = async (textToSend: string) => {
    const messageText = typeof textToSend === "string" ? textToSend : inputValue;
    if (!messageText.trim() || busy) return;
    lastPromptRef.current = messageText;

    const newUserMsg: Message = { id: crypto.randomUUID(), type: "user", text: messageText };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // Histórico SEM mensagens de erro (não são falas reais da IA). A resposta
    // volta COM a tag que ela usou: o modelo vê o próprio formato e o mantém.
    const history = messages
      .filter(msg => !msg.isError && msg.text)
      .slice(-MAX_HISTORY_SENT)
      .map(msg => ({
        role: msg.type === "ai" ? "assistant" : "user",
        // o servidor recusa conteúdo > 2000 chars; uma resposta longa não pode
        // travar todas as perguntas seguintes da conversa
        content: (msg.type === "ai" && msg.action ? `${msg.text} ${actionTag(msg.action)}` : msg.text).slice(0, 2000),
      }));
    // A API espera que a conversa comece pelo visitante
    while (history.length && history[0].role !== "user") history.shift();
    history.push({ role: "user", content: messageText });

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    let aiId: string | null = null; // id da bolha em streaming, se ela chegou a abrir

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      });

      const contentType = res.headers.get("content-type") ?? "";

      // Sucesso = stream de texto puro; erro = JSON
      if (res.ok && contentType.includes("text/plain") && res.body) {
        aiId = crypto.randomUUID();
        const raw = await revealStream(res.body, aiId);

        // Stream terminou: extrai a tag de ação e fixa o texto final limpo
        const { clean, action } = parseActionTag(raw);
        if (!raw) {
          // stream vazio — trata como falha
          pushErrorMessage("A IA não retornou resposta. Tente novamente em instantes.");
        } else {
          setMessages(prev => prev.map(m =>
            m.id === aiId ? { ...m, text: clean, action: action ?? undefined } : m
          ));
          // O chip de ação entra DEPOIS do texto, na mesma mensagem (o length não
          // muda) — sem isso ele nascia escondido abaixo da dobra no celular.
          requestAnimationFrame(() => scrollToBottom());
        }
      } else {
        let serverError = "";
        try {
          const data = await res.json();
          serverError = typeof data?.error === "string" ? data.error : "";
        } catch { /* corpo não-JSON */ }
        pushErrorMessage(
          serverError.includes("demorou")
            ? "Ops, a IA demorou demais para responder."
            : serverError || "Não consegui falar com a IA agora."
        );
      }
    } catch (_error) {
      if ((_error as Error).name === "AbortError") return;
      if (aiId) {
        // Caiu no MEIO da resposta: o trecho parcial não pode ficar como se fosse
        // a resposta completa (nem entrar no histórico) — vira erro com retry.
        const partialId = aiId;
        setMessages(prev => prev.filter(m => m.id !== partialId));
        pushErrorMessage("A resposta foi interrompida no meio. Tente de novo.");
      } else {
        pushErrorMessage("Sem conexão com o servidor. Verifique sua internet e tente de novo.");
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-[#0a0a0c]/80 dark:bg-zinc-950/60 backdrop-blur-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col h-[500px]">

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600 transition-colors"
      >

        {/* Boas-vindas — some na primeira mensagem */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center justify-center flex-1 h-full gap-4 select-none pointer-events-none text-center px-6"
          >
            <div className="w-12 h-12 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/25 flex items-center justify-center">
              <Sparkles size={20} className="text-[#a78bfa]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-zinc-300">
                Oi! Eu sou a IA deste portfólio.
              </p>
              <p className="text-[13px] text-zinc-400 leading-relaxed max-w-xs">
                Pergunte qualquer coisa sobre o Otavio: projetos, experiência, habilidades ou contato.
              </p>
            </div>
            <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
              ou toque numa sugestão abaixo <ArrowDown size={11} />
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] px-5 py-3.5 text-sm md:text-base leading-relaxed ${
                  msg.type === "user"
                    ? "bg-[#8b5cf6] text-white rounded-2xl rounded-tr-sm"
                    : msg.isError
                      ? "bg-[#1c1017] text-zinc-300 rounded-2xl rounded-tl-sm border border-red-400/20"
                      : "bg-[#18181b] text-zinc-300 rounded-2xl rounded-tl-sm border border-white/5"
                }`}
              >
                {msg.text}
                {/* Cursor: nos vãos em que a NIM ainda não mandou texto, sinaliza
                    que a resposta continua vindo em vez de parecer travada. */}
                {msg.id === streamingId && (
                  <motion.span
                    aria-hidden
                    className="inline-block w-[2px] h-[0.95em] ml-0.5 -mb-[0.1em] rounded-full bg-[#a78bfa]"
                    animate={{ opacity: [1, 0.15, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>

              {/* Chip de retry para erros */}
              {msg.isError && (
                <button
                  onClick={() => handleSend(lastPromptRef.current)}
                  disabled={busy || !lastPromptRef.current}
                  className="mt-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border border-white/10 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/60"
                >
                  <RotateCcw size={12} />
                  Tentar de novo
                </button>
              )}

              {/* Chip de ação sugerida pela IA */}
              {msg.action && (
                <button
                  onClick={() => runAction(msg.action!)}
                  className="mt-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#8b5cf6]/15 hover:bg-[#8b5cf6]/25 text-[#c4b5fd] border border-[#8b5cf6]/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/60"
                >
                  {actionLabel(msg.action)}
                  <ArrowDown size={12} />
                </button>
              )}
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-1.5 px-5 py-4 bg-[#18181b] rounded-2xl rounded-tl-sm border border-white/5 w-fit">
                <span className="text-xs font-medium text-zinc-400 mr-2">A inteligência está mapeando...</span>
                <motion.div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} />
                <motion.div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} />
                <motion.div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Chips */}
      <div className="px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-t border-white/5 bg-[#0a0a0c]/50 [mask-image:linear-gradient(to_right,black_85%,transparent)]">
         {messages.length > 0 && (
           <button
             onClick={resetConversation}
             aria-label="Começar uma nova conversa"
             title="Nova conversa"
             className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-medium bg-transparent hover:bg-[#27272a] text-zinc-400 hover:text-zinc-200 border border-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/60"
           >
             <RotateCcw size={13} />
             Nova conversa
           </button>
         )}
         {chips.map((action) => (
           <button
             key={action.prompt}
             onClick={() => handleSend(action.prompt)}
             disabled={busy}
             className="whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-[#18181b]/80 hover:bg-[#27272a] text-zinc-300 border border-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/60"
           >
             {action.label}
           </button>
         ))}
      </div>

      {/* Input Area */}
      <div className="px-6 pb-6 pt-2 bg-[#0a0a0c]/50">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.slice(0, MAX_INPUT_LENGTH))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) handleSend(inputValue);
            }}
            placeholder="Pergunte sobre o Otavio..."
            className="w-full bg-[#18181b]/60 border border-white/10 rounded-full pl-6 pr-12 py-4 text-sm text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-[#8b5cf6]/50 transition-all disabled:opacity-50"
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={busy || !inputValue.trim()}
            aria-label="Enviar mensagem"
            className="absolute right-2 p-2.5 rounded-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
