"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const techStack = [
  { name: "PHP", slug: "php" },
  { name: "Next.js", slug: "nextdotjs" },
  { name: "React", slug: "react" },
  { name: "TypeScript", slug: "typescript" },
  { name: "Python", slug: "python" },
  { name: "Node.js", slug: "nodedotjs" },
  { name: "MySQL", slug: "mysql" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "Selenium", slug: "selenium" },
  { name: "Docker", slug: "docker" },
  { name: "Git", slug: "git" },
  { name: "WordPress", slug: "wordpress" },
  { name: "Tailwind", slug: "tailwindcss" },
];

const PHOTO_MAP: Record<string, string> = {
  default:  "/profile/profile.jpg",
  brasilia: "/places/brasilia-city.webp",
  craft:    "/assets/craft-pc.jpg",
  cards:    "/assets/ucb.jpg",
  about:    "/profile/profile2.jpeg",
};

const hoverCards = [
  {
    id: "estagio",
    label: "ESTÁGIO ATUAL",
    highlight: "Protesto24H",
    isCenter: false,
    description:
      "Estagiário de Desenvolvimento de Software na Protesto24H, atuando com PHP em framework proprietário, pesquisa tecnológica e suporte ao desenvolvimento de novas soluções internas.",
  },
  {
    id: "ucb",
    label: "UNIVERSIDADE",
    highlight: "UCB — Brasília",
    isCenter: true,
    description:
      "Cursando Engenharia de Software na Universidade Católica de Brasília. Com ênfase em sistemas, engenharia de dados e inovação tecnológica.",
  },
  {
    id: "workana",
    label: "FREELANCER",
    highlight: "Plataforma Workana",
    isCenter: false,
    description:
      "Atua ativamente como freelancer na Workana, desenvolvendo sistemas, automações, bots de WhatsApp e aplicações web de alta performance para clientes.",
  },
];

export default function AboutSection() {
  const [hoveredZone, setHoveredZone] = useState<string>("default");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:grid-rows-[180px_1fr]">

        {/* ── [1] Nome Card ── */}
        <BentoCard className="md:col-span-1 md:row-span-1 flex flex-col items-center justify-center text-center p-6 min-h-[180px] gap-3">
          <h2 className="text-3xl font-black tracking-wider text-white uppercase leading-[1.1]">
            Otavio<br />Augusto
          </h2>
          <p className="text-[10px] text-zinc-400 tracking-[0.35em] uppercase">
            Full Stack Developer
          </p>
        </BentoCard>

        {/* ── [2] Info Card Unificado ── */}
        <div
          className="md:col-span-2 md:row-span-1"
          onMouseEnter={() => setHoveredZone("cards")}
          onMouseLeave={() => setHoveredZone("default")}
        >
          <BentoCard className="h-full overflow-hidden min-h-[180px] flex flex-col">
            <p className="hidden md:block text-[9px] text-center text-zinc-600 tracking-widest uppercase pt-3 pb-2">
              PASSE O MOUSE PARA LER
            </p>
            <div className="flex flex-row flex-1 divide-x divide-white/5 overflow-hidden">
              {hoverCards.map((card) => (
                <InfoPanel key={card.id} card={card} />
              ))}
            </div>
          </BentoCard>
        </div>

        {/* ── [3] Sobre Mim Card ── */}
        <BentoCard
          className="md:col-span-1 md:row-span-2 flex flex-col p-8 order-last md:order-none"
          onMouseEnter={() => setHoveredZone("about")}
          onMouseLeave={() => setHoveredZone("default")}
        >
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-sm tracking-[0.2em] font-black text-primary uppercase">Sobre mim</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <p className="text-[15px] text-zinc-300 leading-[1.8] font-medium">
              Me chamo Otavio, nasci em Unaí - MG e na metade de 2024 me mudei para Brasília para realizar meu objetivo de ser um programador de sucesso.
              <br /><br />
              Atualmente atuo como Desenvolvedor de Software estagiando na Protesto24H, onde trabalho com PHP, e sigo ativo como freelancer na Workana, sempre em busca de novos desafios para aprimorar minhas habilidades.
            </p>
          </div>
        </BentoCard>

        {/* ── [4] Foto Central ── */}
        <div className="md:col-span-1 md:row-span-2 flex flex-col gap-3 h-[400px] md:h-auto">
          <BentoCard className="flex-1 overflow-hidden relative min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={hoveredZone}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                {/* Placeholder visível por baixo, sempre */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d12] gap-3">
                  <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <span className="text-2xl font-black text-primary">OA</span>
                  </div>
                </div>

                <Image
                  src={PHOTO_MAP[hoveredZone] ?? PHOTO_MAP.default}
                  alt="Otavio Augusto"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={`relative z-10 ${
                    hoveredZone === "default" || hoveredZone === "about"
                      ? "object-cover object-top"
                      : "object-cover object-center"
                  }`}
                  priority
                />
                {hoveredZone !== "craft" && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20" />
                )}
              </motion.div>
            </AnimatePresence>
          </BentoCard>

          {/* ── [5] Localização card ── */}
          <BentoCard
            className="relative overflow-hidden cursor-default h-[160px]"
            onMouseEnter={() => setHoveredZone("brasilia")}
            onMouseLeave={() => setHoveredZone("default")}
          >
            <div className="absolute inset-0">
              <Image
                src="/places/brasilia-map.jpg"
                alt="Mapa de Brasília"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/20" />
            </div>

            <motion.div
              className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-primary to-transparent opacity-90 pointer-events-none"
              animate={{ left: ["10%", "90%", "10%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />

            <div className="absolute bottom-0 left-0 p-4 z-10">
              <h3 className="text-3xl font-black text-white tracking-tight uppercase leading-none">
                Brasília, DF
              </h3>
              <p className="text-xs text-zinc-400 mt-1 tracking-wide">
                15.7942° S, 47.8822° O
              </p>
              <p className="text-xs text-primary tracking-wide font-medium">
                - GMT-3
              </p>
            </div>
          </BentoCard>
        </div>

        {/* ── [6] Craft Card ── */}
        <BentoCard
          className="md:col-span-1 md:row-span-2 flex flex-col p-6"
          onMouseEnter={() => setHoveredZone("craft")}
          onMouseLeave={() => setHoveredZone("default")}
        >
          <h3 className="text-xl font-black text-white mb-1">Expertise</h3>
          <div className="h-px w-6 bg-primary mb-4" />

          <p className="text-sm text-zinc-300 leading-relaxed">
            <span className="text-white font-semibold">Construindo sistemas que resolvem problemas reais.</span>{" "}
            De ERPs Cloud e automações RPA até bots inteligentes e Web Apps de alta performance.
          </p>

          <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
            Entendo o que a tecnologia moderna pode oferecer e trabalho para traduzir isso em soluções que o negócio realmente precisa.
          </p>

          {/* Carrossel de Tech Stack */}
          <div className="mt-4 overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0d0d12] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0d0d12] to-transparent z-10 pointer-events-none" />
            <motion.div
              className="flex gap-2"
              animate={{ x: ["0%", "-300%"] }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            >
              {[...techStack, ...techStack].map((tech, i) => (
                <div
                  key={`${tech.slug}-${i}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 shrink-0"
                >
                  <Image
                    src={`https://cdn.simpleicons.org/${tech.slug}`}
                    width={14}
                    height={14}
                    alt={tech.name}
                    unoptimized
                  />
                  <span className="text-[11px] text-zinc-300 whitespace-nowrap">{tech.name}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
            Estagiário de Desenvolvimento de Software na Protesto24H e freelancer ativo na Workana, unindo rigor técnico à inovação empresarial.
          </p>

          <div className="flex items-center gap-1.5 mt-4">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] text-green-400">Aberto a colaborações</span>
          </div>
        </BentoCard>

      </div>
    </div>
  );
}

// ─── Componentes Helper ──────────────────────────────────────────────────────

function BentoCard({
  children,
  className = "",
  onMouseEnter,
  onMouseLeave,
}: {
  children: React.ReactNode;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <motion.div
      className={`bg-[#0d0d12]/90 backdrop-blur-md border border-white/5 rounded-2xl relative overflow-hidden ${className}`}
      whileHover={{ borderColor: "rgba(139,92,246,0.25)" }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  );
}

type InfoCard = {
  id: string;
  label: string;
  highlight: string;
  isCenter: boolean;
  description: string;
};

function InfoPanel({ card }: { card: InfoCard }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative flex-1 overflow-hidden cursor-default isolate ${
        card.isCenter ? "border-x border-primary/20" : ""
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="md:absolute md:inset-0 p-3 md:p-5 flex flex-col justify-start md:justify-center gap-1 md:gap-2 h-full">
        <p className="text-[7px] md:text-[9px] tracking-[0.1em] md:tracking-[0.25em] uppercase font-semibold text-primary">
          {card.label}
        </p>
        <p className={`font-bold leading-[1.1] md:leading-snug ${
          card.isCenter ? "text-white text-[11px] md:text-lg" : "text-zinc-100 text-[10px] md:text-base"
        }`}>
          {card.highlight}
        </p>

        <p className="text-[8px] md:text-[11px] text-zinc-300 md:hidden mt-1 leading-[1.3]">
          {card.description}
        </p>
      </div>

      {/* Overlay Animado - Apenas Desktop */}
      <div className="hidden md:block">
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="absolute inset-0 p-5 flex flex-col justify-end bg-[#0d0a18] border-t-2 border-primary/40"
              initial={{ y: "101%" }}
              animate={{ y: "0%" }}
              exit={{ y: "101%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <p className="font-bold text-white text-sm mb-2 leading-snug">
                {card.highlight}
              </p>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
