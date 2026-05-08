"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home as HomeIcon, Menu, X } from "lucide-react";

const Github = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"/><path d="M9 18c-4.5 1.6-5-2.8-5-2.8"/></svg>
);

const Linkedin = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const Workana = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <clipPath id="workana-clip">
      <circle cx="12" cy="12" r="9.5" />
    </clipPath>
    <circle cx="12" cy="12" r="9" />
    <g clipPath="url(#workana-clip)">
      <circle cx="12" cy="8" r="7" />
      <circle cx="15.5" cy="14" r="7" />
      <circle cx="8.5" cy="14" r="7" />
    </g>
  </svg>
);

const NAV_SECTIONS = ["home", "sobre-mim", "skills", "projetos"] as const;

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    NAV_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 pt-6 px-4 md:px-12 flex items-center justify-between">
      {/* Brand / Logo (Oculto temporariamente) */}
      <div className="w-[140px] hidden md:block" />

      {/* Center Links (Glassmorphism Pill) */}
      <div className="hidden md:flex items-center px-4 py-2 rounded-full bg-background/40 backdrop-blur-xl border border-white/5 shadow-2xl relative">
        {[
          { id: 'home', label: <HomeIcon size={18} />, title: "Início" },
          { id: 'sobre-mim', label: "Sobre Mim" },
          { id: 'skills', label: "Habilidades" },
          { id: 'projetos', label: "Projetos" }
        ].map((item) => {
          const isActive = activeSection === item.id || (activeSection === '' && item.id === 'home');
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              aria-label={item.title || (typeof item.label === "string" ? item.label : undefined)}
              aria-current={isActive ? "page" : undefined}
              className={`relative px-5 py-2 text-sm font-medium transition-all z-10 flex flex-col items-center justify-center ${isActive ? 'text-white drop-shadow-md' : 'text-zinc-200 hover:text-white'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-[#27272a]/80 shadow-lg border border-white/5 rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Social Icons Desktop */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-3 mr-2">
          <a href="https://github.com/OtavioAugustoSS" target="_blank" rel="noopener noreferrer" className="p-2 text-foreground/70 hover:text-primary hover:bg-primary/10 rounded-full transition-all" aria-label="GitHub">
            <Github size={20} />
          </a>
          <a href="https://www.linkedin.com/in/otavio-augusto-980258367" target="_blank" rel="noopener noreferrer" className="p-2 text-foreground/70 hover:text-primary hover:bg-primary/10 rounded-full transition-all" aria-label="LinkedIn">
            <Linkedin size={20} />
          </a>
          <a href="https://www.workana.com/freelancer/871e75f307471c5252415edeeaf33a08" target="_blank" rel="noopener noreferrer" className="p-2 text-foreground/70 hover:text-primary hover:bg-primary/10 rounded-full transition-all" aria-label="Workana">
            <Workana size={20} />
          </a>
        </div>
      </div>

      {/* === MOBILE HEADER BUTTON === */}
      <div className="md:hidden flex w-full justify-between items-center relative z-50">
         <div className="w-8" />
         <button
           onClick={() => setIsMobileMenuOpen(true)}
           aria-label="Abrir Menu"
           aria-expanded={isMobileMenuOpen}
           className="p-3 text-white hover:bg-white/10 rounded-full transition-colors backdrop-blur-xl bg-black/40 border border-white/10"
         >
           <Menu size={24} />
         </button>
      </div>

      {/* === MOBILE OVERLAY MENU === */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#07070a]/90 backdrop-blur-2xl px-6"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Fechar Menu"
              className="absolute top-10 p-4 text-white hover:text-primary hover:bg-primary/10 border border-white/10 bg-white/5 rounded-full transition-all"
            >
              <X size={26} />
            </button>

            <div className="flex flex-col items-center gap-4 w-full max-w-[280px]">
              {[
                { id: 'home', label: "Início" },
                { id: 'sobre-mim', label: "Sobre Mim" },
                { id: 'skills', label: "Habilidades" },
                { id: 'projetos', label: "Projetos" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setTimeout(() => scrollTo(item.id), 250);
                  }}
                  className="w-full py-4 text-center text-xl font-semibold tracking-wide text-white hover:bg-white/10 active:bg-white/20 border-b border-white/5 transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Social Icons Mobile */}
            <div className="flex items-center justify-center gap-6 mt-12 w-full">
               <a href="https://github.com/OtavioAugustoSS" target="_blank" rel="noopener noreferrer" className="p-3 text-white/50 hover:text-white border border-white/5 rounded-full hover:bg-white/5 transition-all" aria-label="GitHub">
                 <Github size={24} />
               </a>
               <a href="https://www.linkedin.com/in/otavio-augusto-980258367" target="_blank" rel="noopener noreferrer" className="p-3 text-white/50 hover:text-white border border-white/5 rounded-full hover:bg-white/5 transition-all" aria-label="LinkedIn">
                 <Linkedin size={24} />
               </a>
               <a href="https://www.workana.com/freelancer/871e75f307471c5252415edeeaf33a08" target="_blank" rel="noopener noreferrer" className="p-3 text-white/50 hover:text-white border border-white/5 rounded-full hover:bg-white/5 transition-all" aria-label="Workana">
                 <Workana size={24} />
               </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
