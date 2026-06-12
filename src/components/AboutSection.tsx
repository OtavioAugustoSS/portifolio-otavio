"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { PROFILE, type PhotoKey, type TimelineItem } from "@/data/profile";
import { dispatchSiteAction } from "@/lib/site-actions";

// ─── Fotos do quadro central (legendas em PROFILE.photoCaptions) ─────────────
const PHOTO_MAP: Record<PhotoKey, string> = {
  default: "/profile/profile2.jpeg",
  brasilia: "/places/brasilia-city.webp",
  ucb: "/assets/ucb.jpg",
  craft: "/assets/craft-pc.jpg",
};

// ─── "O que eu construo" — cada linha abre o projeto correspondente ──────────
const BUILDS: { title: string; detail: string; projectId: string }[] = [
  {
    title: "Bots de WhatsApp com IA",
    detail: "Atendentes virtuais que conversam com clientes reais, sem alucinar.",
    projectId: "chatbot-barbearia",
  },
  {
    title: "ERPs e dashboards",
    detail: "Gestão, orçamento e precificação para operações de verdade.",
    projectId: "erp-cloud",
  },
  {
    title: "Tempo real na web",
    detail: "Canvas colaborativo multiplayer, estilo r/place.",
    projectId: "pixelplace",
  },
];

export default function AboutSection() {
  const [activePhoto, setActivePhoto] = useState<PhotoKey>("default");
  const resetPhoto = () => setActivePhoto("default");

  // Pré-carrega as fotos secundárias — sem flash no primeiro hover
  useEffect(() => {
    (Object.keys(PHOTO_MAP) as PhotoKey[]).forEach((key) => {
      if (key === "default") return;
      const img = new window.Image();
      img.src = PHOTO_MAP[key];
    });
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-10 lg:gap-y-14">

        {/* ── Lead — manifesto tipográfico, sem card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-7 max-lg:order-1 flex flex-col justify-center gap-7"
        >
          {PROFILE.bio.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="text-2xl md:text-3xl xl:text-4xl font-medium tracking-tight leading-[1.3] text-zinc-400 text-pretty"
            >
              {renderHighlighted(paragraph, PROFILE.bioHighlights)}
            </p>
          ))}
        </motion.div>

        {/* ── Coluna direita: foto + mapa (dissolve no mobile via contents) ── */}
        <div className="max-lg:contents lg:col-span-5 lg:row-span-2 lg:flex lg:flex-col lg:gap-5">
          <PhotoBlock photoKey={activePhoto} className="max-lg:order-2" />
          <LocationBlock
            className="max-lg:order-5"
            onEnter={() => setActivePhoto("brasilia")}
            onLeave={resetPhoto}
          />
        </div>

        {/* ── Trajetória — timeline com tudo visível ── */}
        <TimelineBlock
          className="lg:col-span-4 max-lg:order-3"
          items={PROFILE.timeline}
          onHoverItem={(key) => key && setActivePhoto(key)}
          onLeave={resetPhoto}
        />

        {/* ── O que eu construo — único card tintado ── */}
        <BuildsBlock className="lg:col-span-3 lg:self-start max-lg:order-4" />
      </div>
    </div>
  );
}

// ─── Destaque de frases da bio (data-driven, sem gradiente) ──────────────────

function renderHighlighted(
  text: string,
  highlights: { phrase: string; tone: "white" | "primary" }[]
) {
  const escaped = highlights.map((h) =>
    h.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "g"));
  return parts.map((part, i) => {
    const hit = highlights.find((h) => h.phrase === part);
    if (!hit) return <span key={i}>{part}</span>;
    return (
      <span
        key={i}
        className={
          hit.tone === "primary"
            ? "text-primary font-semibold"
            : "text-white font-semibold"
        }
      >
        {part}
      </span>
    );
  });
}

// ─── Foto central — moldura de corner-ticks + legenda dinâmica ───────────────

function PhotoBlock({ photoKey, className = "" }: { photoKey: PhotoKey; className?: string }) {
  const src = PHOTO_MAP[photoKey];
  const caption = PROFILE.photoCaptions[photoKey];

  return (
    <div className={`flex flex-col lg:flex-1 ${className}`}>
      {/* Moldura: ticks ficam fora do overflow-hidden */}
      <div className="relative flex-1">
        <span aria-hidden className="absolute -top-1.5 -left-1.5 h-4 w-4 border-t-2 border-l-2 border-primary/60 z-10" />
        <span aria-hidden className="absolute -top-1.5 -right-1.5 h-4 w-4 border-t-2 border-r-2 border-primary/60 z-10" />
        <span aria-hidden className="absolute -bottom-1.5 -left-1.5 h-4 w-4 border-b-2 border-l-2 border-primary/60 z-10" />
        <span aria-hidden className="absolute -bottom-1.5 -right-1.5 h-4 w-4 border-b-2 border-r-2 border-primary/60 z-10" />

        <div className="relative h-full min-h-[320px] lg:min-h-[440px] max-lg:aspect-[4/5] max-lg:h-auto overflow-hidden rounded-sm bg-[#0b0b10]">
          {/* Placeholder por baixo, sempre */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <span className="text-2xl font-black text-primary">OA</span>
            </div>
          </div>

          {/* Crossfade sync, keyed pelo src (marcos que compartilham foto não piscam) */}
          <AnimatePresence initial={false}>
            <motion.div
              key={src}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={src}
                alt={caption}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className={`object-cover ${photoKey === "default" ? "object-top" : "object-center"}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Legenda dinâmica */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={photoKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-3 font-mono text-[11px] text-zinc-500"
        >
          {caption}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// ─── Trajetória — timeline vertical, conteúdo todo visível ───────────────────

function TimelineBlock({
  items,
  onHoverItem,
  onLeave,
  className = "",
}: {
  items: TimelineItem[];
  onHoverItem: (key?: PhotoKey) => void;
  onLeave: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="font-mono text-xs tracking-widest uppercase text-zinc-500 mb-7">
        Trajetória
      </h3>
      <motion.ol
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } },
        }}
        className="relative border-l border-white/10 pl-6 space-y-9"
      >
        {items.map((item) => (
          <motion.li
            key={item.title}
            variants={{
              hidden: { opacity: 0, x: -8 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } },
            }}
            tabIndex={0}
            onMouseEnter={() => onHoverItem(item.photoKey)}
            onMouseLeave={onLeave}
            onFocus={() => onHoverItem(item.photoKey)}
            onBlur={onLeave}
            className="group relative outline-none cursor-default"
          >
            <span
              aria-hidden
              className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/10 transition-transform duration-200 group-hover:scale-125 group-focus-visible:scale-125"
            />
            <p className="font-mono text-xs text-primary">{item.period}</p>
            <h4 className="text-base font-semibold text-white mt-1">{item.title}</h4>
            <p className="text-sm text-zinc-400 leading-relaxed mt-1">{item.detail}</p>
          </motion.li>
        ))}
      </motion.ol>
    </div>
  );
}

// ─── Localização — mapa escuro + relógio GMT-3 ao vivo ───────────────────────

function LocationBlock({
  onEnter,
  onLeave,
  className = "",
}: {
  onEnter: () => void;
  onLeave: () => void;
  className?: string;
}) {
  return (
    <div
      className={`relative h-[170px] shrink-0 overflow-hidden rounded-2xl border border-white/10 ${className}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <Image
        src="/places/brasilia-map.jpg"
        alt="Mapa de Brasília"
        fill
        sizes="(max-width: 1024px) 100vw, 40vw"
        className="object-cover object-center opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10" />

      <div className="absolute bottom-0 left-0 p-5 z-10 flex flex-col gap-0.5">
        <h3 className="text-2xl font-bold text-white tracking-tight">Brasília, DF</h3>
        <p className="font-mono text-xs text-zinc-400">{PROFILE.location.coords}</p>
        <LiveClock />
      </div>
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setNow(formatter.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="font-mono text-sm text-primary tabular-nums">
      {now ?? "--:--:--"} <span className="text-zinc-500">GMT-3</span>
    </p>
  );
}

// ─── O que eu construo — único card tintado, linhas abrem projetos ───────────

function BuildsBlock({ className = "" }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`rounded-xl border border-primary/15 bg-primary/5 p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-white">O que eu construo</h3>

      <div className="mt-2">
        {BUILDS.map((build) => (
          <button
            key={build.projectId}
            onClick={() => dispatchSiteAction({ type: "project", id: build.projectId })}
            className="group flex w-full items-center justify-between gap-3 border-b border-white/5 py-4 text-left last:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-sm"
          >
            <span>
              <span className="block text-[15px] font-medium text-zinc-100 group-hover:text-white transition-colors">
                {build.title}
              </span>
              <span className="block text-xs text-zinc-500 mt-0.5 leading-relaxed">
                {build.detail}
              </span>
            </span>
            <ArrowUpRight
              size={16}
              className="shrink-0 text-primary transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </button>
        ))}
      </div>

      <a
        href="#contato"
        className="mt-5 inline-block text-xs text-zinc-500 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-sm"
      >
        aberto a freelas e estágio, me chama →
      </a>
    </motion.div>
  );
}
