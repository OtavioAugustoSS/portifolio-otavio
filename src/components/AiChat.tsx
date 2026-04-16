"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";

interface Message {
  id: number;
  type: "ai" | "user";
  text: string;
}

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const predefinedActions = [
    { label: "Trabalho", prompt: "Onde você já trabalhou e qual sua experiência profissional?" },
    { label: "Sobre mim", prompt: "Pode me contar um pouco sobre o Otavio?" },
    { label: "Habilidades", prompt: "Quais são as suas principais habilidades técnicas e linguagens de programação?" },
    { label: "Contato", prompt: "Como posso entrar em contato com o Otavio profissionalmente?" }
  ];

  const handleSend = async (textToSend: string) => {
    const messageText = typeof textToSend === "string" ? textToSend : inputValue;
    if (!messageText.trim()) return;
    
    // Add user message to UI immediately
    const newUserMsg: Message = { id: Date.now(), type: "user", text: messageText };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // Map existing messages to the format expected by the API
    const history = messages.map(msg => ({
      role: msg.type === "ai" ? "assistant" : "user",
      content: msg.text
    }));
    // Append the new message
    history.push({ role: "user", content: messageText });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { id: Date.now(), type: "ai", text: data.reply }]);
      } else {
        setMessages(prev => [
          ...prev, 
          { id: Date.now(), type: "ai", text: `[Erro]: ${data.error || "A chave da Nvidia não foi configurada ou a API falhou."}` }
        ]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), type: "ai", text: "[Erro Crítico]: Falha na rede ao contactar a rota da API." }]);
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
        
        {messages.length === 0 && (
          <div className="flex items-center justify-center flex-1 h-full opacity-50 select-none pointer-events-none">
            {/* O chat vazio conforme solicitado */}
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[85%] px-5 py-3.5 text-sm md:text-base leading-relaxed ${
                  msg.type === "user" 
                    ? "bg-[#8b5cf6] text-white rounded-2xl rounded-tr-sm" 
                    : "bg-[#18181b] text-zinc-300 rounded-2xl rounded-tl-sm border border-white/5"
                }`}
              >
                {msg.text}
              </div>
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
             className="whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-[#18181b]/80 hover:bg-[#27272a] text-zinc-300 border border-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
            disabled={isTyping}
            placeholder="Pergunte qualquer coisa sobre o Otavio..."
            className="w-full bg-[#18181b]/60 border border-white/10 rounded-full pl-6 pr-12 py-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#8b5cf6]/50 transition-all disabled:opacity-50"
          />
          <button 
            onClick={() => handleSend(inputValue)}
            disabled={isTyping || !inputValue.trim()}
            className="absolute right-2 p-2.5 rounded-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white transition-all disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
