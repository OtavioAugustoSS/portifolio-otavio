"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home as HomeIcon } from "lucide-react";

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

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      // Find which section is currently in view
      const sections = ["home", "sobre-mim", "skills", "projetos"];
      let current = "";
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the section top is above 300px from viewport top, it's considered active
          if (rect.top <= 300 && rect.bottom >= 300) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 pt-6 px-4 md:px-12 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
          <span className="font-bold text-lg text-primary">OA</span>
        </div>
        <span className="hidden sm:block font-semibold tracking-wide text-foreground">Otavio Augusto</span>
      </div>

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
            <Link 
              key={item.id}
              href={`#${item.id}`}
              className={`relative px-5 py-2 text-sm font-medium transition-all z-10 flex flex-col items-center justify-center ${isActive ? 'text-white drop-shadow-md' : 'text-zinc-400 hover:text-white'}`}
              aria-label={item.title || (typeof item.label === "string" ? item.label : undefined)}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-[#27272a]/80 shadow-lg border border-white/5 rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Social Icons */}
      <div className="flex items-center gap-4">
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
    </nav>
  );
}
