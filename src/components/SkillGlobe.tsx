"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ─── Skills com cor de marca para glow individual ────────────────────────────
const SKILLS = [
  { slug: "python",      name: "Python",      color: "#3776AB" },
  { slug: "javascript",  name: "JavaScript",  color: "#F7DF1E" },
  { slug: "typescript",  name: "TypeScript",  color: "#3178C6" },
  { slug: "react",       name: "React",       color: "#61DAFB" },
  { slug: "nextdotjs",   name: "Next.js",     color: "#FFFFFF" },
  { slug: "nodedotjs",   name: "Node.js",     color: "#5FA04E" },
  { slug: "php",         name: "PHP",         color: "#777BB4" },
  { slug: "mysql",       name: "MySQL",       color: "#4479A1" },
  { slug: "postgresql",  name: "PostgreSQL",  color: "#4169E1" },
  { slug: "sqlite",      name: "SQLite",      color: "#003B57" },
  { slug: "tailwindcss", name: "Tailwind",    color: "#06B6D4" },
  { slug: "fastapi",     name: "FastAPI",     color: "#009688" },
  { slug: "html5",       name: "HTML5",       color: "#E34F26" },
  { slug: "css",         name: "CSS",         color: "#663399" },
  { slug: "selenium",    name: "Selenium",    color: "#43B02A" },
  { slug: "git",         name: "Git",         color: "#F05032" },
  { slug: "docker",      name: "Docker",      color: "#2496ED" },
  { slug: "github",      name: "GitHub",      color: "#FFFFFF" },
  { slug: "wordpress",   name: "WordPress",   color: "#21759B" },
  { slug: "framer",      name: "Framer",      color: "#0055FF" },
];

// ─── Fibonacci Sphere — distribui pontos uniformemente, evita polos ──────────
function fibonacciSphere(samples: number, radius: number) {
  const points: { x: number; y: number; z: number; phi: number; theta: number }[] = [];
  const phi = Math.PI * (Math.sqrt(5) - 1); // golden angle
  const poleAvoidance = 0.85; // y range [-0.85, 0.85] em vez de [-1, 1]

  for (let i = 0; i < samples; i++) {
    const y = (1 - (i / (samples - 1)) * 2) * poleAvoidance;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    points.push({
      x: x * radius,
      y: y * radius,
      z: z * radius,
      phi: Math.atan2(z, x) * (180 / Math.PI),
      theta: Math.acos(y) * (180 / Math.PI),
    });
  }
  return points;
}

const RADIUS = 180;

export default function SkillGlobe() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationDir = useRef(1); // +1 = direita, -1 = esquerda

  const points = useMemo(() => fibonacciSphere(SKILLS.length, RADIUS), []);

  // Preload todas as imagens dos ícones — só dispara animação quando todos estão prontos
  useEffect(() => {
    let loaded = 0;
    const total = SKILLS.length;
    SKILLS.forEach((skill) => {
      const img = new window.Image();
      img.src = `https://cdn.simpleicons.org/${skill.slug}`;
      const done = () => {
        loaded++;
        if (loaded >= total) setIconsLoaded(true);
      };
      img.onload = done;
      img.onerror = done;
    });
  }, []);

  // Entrada só ocorre quando: ícones carregados E globo visível
  useEffect(() => {
    if (iconsLoaded && inView) setEntered(true);
  }, [iconsLoaded, inView]);

  // Drag/auto-rotate via motion values
  const rotateY = useMotionValue(0);
  const rotateX = useMotionValue(-15);
  const springY = useSpring(rotateY, { stiffness: 50, damping: 30, mass: 1 });
  const springX = useSpring(rotateX, { stiffness: 50, damping: 30, mass: 1 });

  // Auto-rotação contínua — só inicia depois da animação de entrada terminar
  useEffect(() => {
    if (!entered) return;

    let rafId = 0;
    let cancelled = false;

    // Aguarda stagger total (~0.025s × 20 = 500ms) + buffer pra spring estabilizar
    const startDelay = setTimeout(() => {
      if (cancelled) return;
      let last = performance.now();

      const tick = (now: number) => {
        if (cancelled) return;
        const delta = (now - last) / 1000;
        last = now;
        rotateY.set(rotateY.get() + delta * 12 * rotationDir.current);
        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    }, 900);

    return () => {
      cancelled = true;
      clearTimeout(startDelay);
      cancelAnimationFrame(rafId);
    };
  }, [entered, rotateY]);

  // Marca quando globo entra viewport — combina com iconsLoaded pra disparar entrada
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Drag — pointerdown no container, move/up no window (não trava se ponteiro sair)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let initialRotY = 0;
    let initialRotX = 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialRotY = rotateY.get();
      initialRotX = rotateX.get();
      e.preventDefault();
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      rotateY.set(initialRotY + dx * 0.5);
      rotateX.set(initialRotX - dy * 0.5);
      // Atualiza direção da auto-rotação baseado no drag horizontal
      if (Math.abs(dx) > 5) rotationDir.current = dx > 0 ? 1 : -1;
    };

    const onUp = () => { dragging = false; };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [rotateY, rotateX]);

  const transform = useTransform<number, string>(
    [springX, springY],
    ([x, y]) => `rotateX(${x}deg) rotateY(${y}deg)`
  );

  // Counter-rotation para ícones — billboard effect (sempre olhando pra câmera)
  const iconCounter = useTransform<number, string>(
    [springX, springY],
    ([x, y]) => `rotateY(${-y}deg) rotateX(${-x}deg)`
  );

  return (
    <div className="flex items-center justify-center max-w-[500px] w-full aspect-square relative z-20">
      {/* Núcleo glow pulsante */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] rounded-full bg-primary/20 blur-[80px] pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Preloader — spinner enquanto ícones não carregaram */}
      {!iconsLoaded && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          exit={{ opacity: 0 }}
        >
          <div className="w-10 h-10 border-t-2 border-primary rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Container 3D — perspective + drag */}
      <div
        ref={containerRef}
        className="relative w-full h-full cursor-grab active:cursor-grabbing select-none touch-none"
        style={{ perspective: "900px", opacity: iconsLoaded ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        {/* Esfera 3D — preenche container, transformOrigin no centro */}
        <motion.div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform,
          }}
        >
          {/* Wireframe esférico — gira junto */}
          <WireframeSphere radius={RADIUS} />

          {/* Ícones distribuídos em esfera — wrapper estático posiciona, motion.div só anima entrada */}
          {SKILLS.map((skill, i) => {
            const p = points[i];
            const isHovered = hovered === skill.slug;

            return (
              <div
                key={skill.slug}
                className="absolute top-1/2 left-1/2"
                style={{
                  width: 40,
                  height: 40,
                  marginLeft: -20,
                  marginTop: -20,
                  transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)`,
                  transformStyle: "preserve-3d",
                }}
                onPointerEnter={() => setHovered(skill.slug)}
                onPointerLeave={() => setHovered(null)}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={entered ? { opacity: 1 } : { opacity: 0 }}
                  transition={{
                    delay: 0.025 * i,
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                  style={{ transformStyle: "preserve-3d", width: "100%", height: "100%" }}
                >
                  {/* Counter-rotate wrapper — cancela rotação do globo, ícone sempre olha pra câmera */}
                  <motion.div
                    style={{ transform: iconCounter, transformStyle: "preserve-3d", width: "100%", height: "100%" }}
                  >
                    <SkillIcon skill={skill} hovered={isHovered} />
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Wireframe Sphere — meridians/parallels que giram com o globo ────────────
function WireframeSphere({ radius }: { radius: number }) {
  const meridians = 8;
  const parallels = 5;

  return (
    <>
      {/* Meridianos (verticais) — rotação eixo Y */}
      {Array.from({ length: meridians }).map((_, i) => {
        const angle = (180 / meridians) * i;
        return (
          <div
            key={`m-${i}`}
            className="absolute top-1/2 left-1/2 rounded-full border border-purple-500/15 pointer-events-none"
            style={{
              width: radius * 2,
              height: radius * 2,
              marginLeft: -radius,
              marginTop: -radius,
              transform: `rotateY(${angle}deg)`,
              transformStyle: "preserve-3d",
            }}
          />
        );
      })}

      {/* Paralelos (horizontais) — empilhados ao longo do Y */}
      {Array.from({ length: parallels }).map((_, i) => {
        const t = (i + 1) / (parallels + 1);
        const y = (t - 0.5) * 2 * radius;
        const r = Math.sqrt(radius * radius - y * y);
        return (
          <div
            key={`p-${i}`}
            className="absolute top-1/2 left-1/2 rounded-full border border-purple-500/20 pointer-events-none"
            style={{
              width: r * 2,
              height: r * 2,
              marginLeft: -r,
              marginTop: -r,
              transform: `translateY(${y}px) rotateX(90deg)`,
              transformStyle: "preserve-3d",
            }}
          />
        );
      })}
    </>
  );
}

// ─── Ícone individual com glow + label ───────────────────────────────────────
function SkillIcon({
  skill,
  hovered,
}: {
  skill: { slug: string; name: string; color: string };
  hovered: boolean;
}) {
  return (
    <motion.div
      className="relative flex flex-col items-center gap-1"
      animate={{ scale: hovered ? 1.4 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Glow individual ao hover */}
      {hovered && (
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none"
          style={{ backgroundColor: skill.color, opacity: 0.6, transform: "scale(1.5)" }}
        />
      )}

      {/* Ícone (CDN simpleicons) */}
      <img
        src={`https://cdn.simpleicons.org/${skill.slug}`}
        alt={skill.name}
        width={40}
        height={40}
        draggable={false}
        className="relative z-10 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
        style={{
          filter: hovered ? `drop-shadow(0 0 8px ${skill.color})` : undefined,
          willChange: "transform",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
        }}
      />

      {/* Label que aparece ao hover */}
      {hovered && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap pointer-events-none"
          style={{ textShadow: "0 0 8px rgba(0,0,0,0.9)" }}
        >
          {skill.name}
        </motion.span>
      )}
    </motion.div>
  );
}
