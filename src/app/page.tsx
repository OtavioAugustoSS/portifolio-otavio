"use client";

import AiChat from "@/components/AiChat";
import SkillGlobe from "@/components/SkillGlobe";
import SkillList from "@/components/SkillList";
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
            style={{ textShadow: "0px 4px 30px rgba(0,0,0,1), 0px 0px 10px rgba(139, 92, 246, 0.8)" }}
          >
            Olá, sou o <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] via-[#8b5cf6] to-[#c084fc]"
              style={{ backgroundSize: "200% auto" }}
              animate={{ backgroundPosition: ["200% center", "-200% center"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              Otavio Augusto
            </motion.span>
          </h1>
        </motion.div>

        {/* Ai Chat Component centered in Hero */}
        <motion.div 
          className="w-full max-w-3xl z-20"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <AiChat />
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          onClick={() => document.getElementById('sobre-mim')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-xs tracking-widest uppercase font-medium">Scroll para explorar</span>
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
        <section id="sobre-mim" className="min-h-screen pt-32 pb-16 px-4 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-white/20 mb-10">Sobre Mim</h2>
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
        
        <section id="projetos" className="min-h-screen pt-32 pb-16 px-4 flex flex-col items-center border-t border-white/5">
          <h2 className="text-3xl font-bold text-white/20 mb-10">Projetos</h2>
        </section>
      </div>
    </>
  );
}
