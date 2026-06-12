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
} from "@/lib/site-actions";

const MAX_INPUT_LENGTH = 500;

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastPromptRef = useRef<string>("");

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const predefinedActions = [
    { label: "Trabalho", prompt: "Onde você já trabalhou e qual sua experiência profissional?" },
    { label: "Sobre mim", prompt: "Pode me contar um pouco sobre o Otavio?" },
    { label: "Habilidades", prompt: "Quais são as suas principais habilidades técnicas e linguagens de programação?" },
    { label: "Projetos", prompt: "Quais projetos o Otavio já desenvolveu?" },
    { label: "Contato", prompt: "Como posso entrar em contato com o Otavio profissionalmente?" }
  ];

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

  const handleSend = async (textToSend: string) => {
    const messageText = typeof textToSend === "string" ? textToSend : inputValue;
    if (!messageText.trim() || isTyping) return;
    lastPromptRef.current = messageText;

    const newUserMsg: Message = { id: crypto.randomUUID(), type: "user", text: messageText };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // Histórico SEM mensagens de erro (não são falas reais da IA)
    const history = messages
      .filter(msg => !msg.isError)
      .map(msg => ({
        role: msg.type === "ai" ? "assistant" : "user",
        content: msg.text
      }));
    history.push({ role: "user", content: messageText });

    abortRef.current?.abort();
    abortRef.current = new AbortController();

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
        const aiId = crypto.randomUUID();
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let raw = "";
        let started = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            raw += decoder.decode(value, { stream: true });

            if (!started) {
              started = true;
              setIsTyping(false);
              setMessages(prev => [...prev, { id: aiId, type: "ai", text: splitVisible(raw) }]);
            } else {
              const visible = splitVisible(raw);
              setMessages(prev => prev.map(m => (m.id === aiId ? { ...m, text: visible } : m)));
            }
          }
        } finally {
          reader.releaseLock();
        }

        // Stream terminou: extrai a tag de ação e fixa o texto final limpo
        const { clean, action } = parseActionTag(raw);
        if (!started) {
          // stream vazio — trata como falha
          pushErrorMessage("A IA não retornou resposta. Tente novamente em instantes.");
        } else {
          setMessages(prev => prev.map(m =>
            m.id === aiId ? { ...m, text: clean, action: action ?? undefined } : m
          ));
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
      pushErrorMessage("Sem conexão com o servidor. Verifique sua internet e tente de novo.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-[#0a0a0c]/80 dark:bg-zinc-950/60 backdrop-blur-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col h-[500px]">

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
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
              </div>

              {/* Chip de retry para erros */}
              {msg.isError && (
                <button
                  onClick={() => handleSend(lastPromptRef.current)}
                  disabled={isTyping || !lastPromptRef.current}
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
      <div className="px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-t border-white/5 bg-[#0a0a0c]/50">
         {predefinedActions.map((action, idx) => (
           <button
             key={idx}
             onClick={() => handleSend(action.prompt)}
             disabled={isTyping}
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
            disabled={isTyping}
            placeholder="Pergunte qualquer coisa sobre o Otavio..."
            className="w-full bg-[#18181b]/60 border border-white/10 rounded-full pl-6 pr-12 py-4 text-sm text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-[#8b5cf6]/50 transition-all disabled:opacity-50"
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={isTyping || !inputValue.trim()}
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
