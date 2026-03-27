"use client";

import AiChat from "@/components/AiChat";
import SkillGlobe from "@/components/SkillGlobe";
import SkillList from "@/components/SkillList";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 relative z-20" id="home">
        {/* Title */}
        <motion.div 
          className="mb-12 text-center mt-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-2 text-white"
            style={{ textShadow: "0px 2px 20px rgba(0,0,0,0.9)" }}
          >
            Olá, sou o <motion.span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(90deg, #d966ff 0%, #d966ff 42%, #ffffff 50%, #d966ff 58%, #d966ff 100%)",
                backgroundSize: "300% auto",
                WebkitTextStroke: "1px rgba(217, 102, 255, 0.6)",
              }}
              animate={{ backgroundPosition: ["200% center", "-100% center"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              Otavio Augusto
            </motion.span>
          </h1>
        </motion.div>

        {/* Ai Chat Component centered in Hero */}
        <motion.div 
          className="w-full max-w-3xl z-20 mb-4 md:mb-0"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <AiChat />
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="relative md:absolute md:bottom-8 md:left-1/2 md:-translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500 cursor-pointer z-50 mt-6 md:mt-0 w-full md:w-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          onClick={() => document.getElementById('sobre-mim')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-[10px] tracking-widest uppercase font-semibold text-white/60">Scroll para explorar</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ArrowDown size={20} />
          </motion.div>
        </motion.div>
      </div>

      {/* Landing Page Content Sections */}
      <div className="relative z-20 bg-black/60 backdrop-blur-xl border-t border-white/5">
        <section id="sobre-mim" className="min-h-screen pt-24 pb-16 px-4 flex flex-col items-center">
          <div className="text-center mb-10 z-20">
            <span className="text-primary tracking-[0.2em] text-xs font-bold uppercase">Quem sou eu</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 text-white">
              Sobre <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Mim</span>
            </h2>
          </div>
          <AboutSection />
        </section>
        
        <section id="skills" className="min-h-screen py-32 px-4 flex flex-col items-center justify-center border-t border-white/5 relative overflow-hidden">
          {/* Fundo Nebulosa sutil para o Globo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
          
          <div className="text-center mb-8 z-20">
            <span className="text-primary tracking-[0.2em] text-xs font-bold uppercase">TECH STACK</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 text-white">
              Minhas <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Habilidades</span>
            </h2>
          </div>
          
          <div className="w-full flex justify-center z-20 mt-10">
            <SkillGlobe />
          </div>

          <div className="w-full z-20 mt-12 pb-12">
            <SkillList />
          </div>
        </section>
        
        <section id="projetos" className="min-h-screen pt-32 pb-24 px-4 flex flex-col items-center border-t border-white/5">
          <div className="text-center mb-12 z-20">
            <span className="text-primary tracking-[0.2em] text-xs font-bold uppercase">O que construí</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 text-white">
              Meus <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Projetos</span>
            </h2>
          </div>
          <ProjectsSection />
        </section>
      </div>
    </>
  );
}
