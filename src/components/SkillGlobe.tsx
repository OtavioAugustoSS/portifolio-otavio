"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform } from "framer-motion";
import { globeSkills as SKILLS, type GlobeSkill } from "@/data/skills";
import { getSkillUsage, isFeatured } from "@/lib/skill-usage";

export type SkillGlobeProps = {
  /** Skill em destaque (controlado pelo SkillsShowcase — pode vir da lista) */
  spotlightId?: string | null;
  onHoverSkill?: (id: string | null) => void;
};

// ─── Fibonacci Sphere — distribui pontos uniformemente, evita polos ──────────
function fibonacciSphere(samples: number, radius: number) {
  const points: { x: number; y: number; z: number }[] = [];
  const phi = Math.PI * (Math.sqrt(5) - 1); // golden angle
  const poleAvoidance = 0.85; // y range [-0.85, 0.85] em vez de [-1, 1]

  for (let i = 0; i < samples; i++) {
    const y = (1 - (i / (samples - 1)) * 2) * poleAvoidance;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;

    points.push({
      x: Math.cos(theta) * radiusAtY * radius,
      y: y * radius,
      z: Math.sin(theta) * radiusAtY * radius,
    });
  }
  return points;
}

const BASE_SPEED = 12;        // deg/s de cruzeiro
const FLING_MIN = 80;         // deg/s mínimos pra inércia
const FLING_MAX = 480;        // clamp da inércia
const DEG = Math.PI / 180;

const GLOBE_ID_SET = new Set(SKILLS.map((s) => s.id));
const BASE_SCALES = SKILLS.map((s) => (isFeatured(s.id) ? 1.15 : 1));

export default function SkillGlobe({ spotlightId = null, onHoverSkill }: SkillGlobeProps) {
  const [entered, setEntered] = useState(false);
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [radius, setRadius] = useState(180); // 180 no SSR e no 1º paint — sem hydration mismatch
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Estado do loop em refs (re-render de hover NÃO reinicia nada) ──
  const rotationDir = useRef(1);
  const speedRef = useRef(0);
  const draggingRef = useRef(false);   // só drag CAPTURADO
  const startedRef = useRef(false);    // gate de 900ms pós-entrada
  const spotlightRef = useRef<string | null>(null);
  const reducedRef = useRef(false);
  const radiusRef = useRef(180);
  const velocitySamples = useRef<{ t: number; y: number }[]>([]);
  const depthRefs = useRef<(HTMLDivElement | null)[]>([]);
  const posRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const points = useMemo(() => fibonacciSphere(SKILLS.length, radius), [radius]);
  const pointsRef = useRef(points);
  useEffect(() => {
    pointsRef.current = points;
    radiusRef.current = radius;
  }, [points, radius]);

  // Spotlight só pausa/destaca se a skill existe NO GLOBO (lista tem ids extras)
  useEffect(() => {
    spotlightRef.current = spotlightId && GLOBE_ID_SET.has(spotlightId) ? spotlightId : null;
  }, [spotlightId]);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

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

  // Aguarda o stagger de entrada (~500ms) + buffer antes da auto-rotação
  useEffect(() => {
    if (!entered) return;
    const t = setTimeout(() => {
      startedRef.current = true;
    }, 900);
    return () => clearTimeout(t);
  }, [entered]);

  // Raio responsivo — segue a largura real do container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () =>
      setRadius(Math.round(Math.min(180, Math.max(100, el.clientWidth * 0.36))));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Marca quando globo entra viewport
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

  // Rotação via motion values + springs
  const rotateY = useMotionValue(0);
  const rotateX = useMotionValue(-15);
  const springY = useSpring(rotateY, { stiffness: 50, damping: 30, mass: 1 });
  const springX = useSpring(rotateX, { stiffness: 50, damping: 30, mass: 1 });

  // ── Drag com captura por threshold (touch) + amostras pra inércia ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let dragging = false;
    let captured = false;
    let startX = 0;
    let startY = 0;
    let initialRotY = 0;
    let initialRotX = 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      captured = e.pointerType === "mouse";
      draggingRef.current = captured;
      startX = e.clientX;
      startY = e.clientY;
      initialRotY = rotateY.get();
      initialRotX = rotateX.get();
      velocitySamples.current = [];
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      let dx = e.clientX - startX;
      let dy = e.clientY - startY;

      if (!captured) {
        // gesto mais vertical que horizontal → deixa o navegador rolar a página
        if (Math.abs(dx) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) { dragging = false; return; }
        captured = true;
        draggingRef.current = true;
        startX = e.clientX;
        startY = e.clientY;
        initialRotY = rotateY.get();
        initialRotX = rotateX.get();
        dx = 0;
        dy = 0;
      }

      const newRotY = initialRotY + dx * 0.5;
      rotateY.set(newRotY);
      rotateX.set(initialRotX - dy * 0.5);
      if (Math.abs(dx) > 5) rotationDir.current = dx > 0 ? 1 : -1;

      // janela de ~120ms pra estimar a velocidade angular no soltar
      const now = e.timeStamp;
      velocitySamples.current.push({ t: now, y: newRotY });
      while (
        velocitySamples.current.length > 2 &&
        now - velocitySamples.current[0].t > 120
      ) {
        velocitySamples.current.shift();
      }
    };

    const onUp = () => {
      if (captured) {
        const samples = velocitySamples.current;
        if (samples.length >= 2) {
          const first = samples[0];
          const last = samples[samples.length - 1];
          const dtMs = last.t - first.t;
          if (dtMs > 16) {
            const velocity = ((last.y - first.y) / dtMs) * 1000; // deg/s
            if (Math.abs(velocity) > FLING_MIN) {
              speedRef.current = Math.max(-FLING_MAX, Math.min(FLING_MAX, velocity));
              rotationDir.current = velocity > 0 ? 1 : -1;
            }
          }
        }
      }
      dragging = false;
      captured = false;
      draggingRef.current = false;
      velocitySamples.current = [];
    };

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

  // ── Loop unificado: speed-model + integração + depth pass ──
  useAnimationFrame((_, delta) => {
    // clamp: ao voltar de aba em background não dá salto gigante de rotação
    const dt = Math.min(delta / 1000, 0.05);

    // 1. Modelo de velocidade: pausa em hover/drag, cruzeiro caso contrário
    const paused = !!spotlightRef.current || draggingRef.current;
    const cruise = reducedRef.current ? 0 : BASE_SPEED * rotationDir.current;
    const target = paused || !startedRef.current ? 0 : cruise;
    // freia rápido (pausa responsiva), acelera/decai de fling suavemente
    const tau = target === 0 ? 0.18 : 0.55;
    speedRef.current += (target - speedRef.current) * (1 - Math.exp(-dt / tau));

    // 2. Integra a rotação (NUNCA durante drag capturado — o drag é o dono)
    if (!draggingRef.current && Math.abs(speedRef.current) > 0.01) {
      rotateY.set(rotateY.get() + speedRef.current * dt);
    }

    // 3. Depth pass — sempre roda (sem "pop" quando a rotação começa)
    const rx = springX.get() * DEG;
    const ry = springY.get() * DEG;
    const sinRx = Math.sin(rx);
    const cosRx = Math.cos(rx);
    const sinRy = Math.sin(ry);
    const cosRy = Math.cos(ry);
    const pts = pointsRef.current;
    const r = radiusRef.current;

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      // z em espaço de câmera p/ transform rotateX(rx) rotateY(ry) (CSS: +y desce, +z aproxima)
      const zc = p.y * sinRx + cosRx * (p.z * cosRy - p.x * sinRy);
      const t = (zc / r + 1) / 2; // 0 = fundo, 1 = frente

      const isSpot = spotlightRef.current === SKILLS[i].id;
      let scale = (0.55 + t * 0.57) * BASE_SCALES[i];
      let opacity = 0.3 + t * 0.7;
      if (isSpot) {
        scale = Math.max(scale, 1);
        opacity = 1;
      }

      const depthEl = depthRefs.current[i];
      if (depthEl) {
        depthEl.style.opacity = opacity.toFixed(3);
        depthEl.style.transform = `scale(${scale.toFixed(3)})`;
      }
      const posEl = posRefs.current[i];
      if (posEl) posEl.style.zIndex = String(Math.round(t * 40));
    }
  });

  const transform = useTransform<number, string>(
    [springX, springY],
    ([x, y]) => `rotateX(${x}deg) rotateY(${y}deg)`
  );

  // Counter-rotation para ícones — billboard effect (sempre olhando pra câmera)
  const iconCounter = useTransform<number, string>(
    [springX, springY],
    ([x, y]) => `rotateY(${-y}deg) rotateX(${-x}deg)`
  );

  const handleEnter = (id: string) => {
    if (draggingRef.current) return;
    if (touchClearTimer.current) clearTimeout(touchClearTimer.current);
    onHoverSkill?.(id);
  };

  const handleLeave = () => onHoverSkill?.(null);

  // Touch: tap mostra o tooltip mas libera a rotação sozinho depois
  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    if (touchClearTimer.current) clearTimeout(touchClearTimer.current);
    touchClearTimer.current = setTimeout(() => onHoverSkill?.(null), 1600);
  };

  useEffect(() => () => {
    if (touchClearTimer.current) clearTimeout(touchClearTimer.current);
  }, []);

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
        className="relative w-full h-full cursor-grab active:cursor-grabbing select-none [touch-action:pan-y]"
        style={{ perspective: "900px", opacity: iconsLoaded ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        {/* Esfera 3D */}
        <motion.div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform,
          }}
        >
          {/* Wireframe esférico — gira junto */}
          <WireframeSphere radius={radius} />

          {/* Ícones: posWrapper(translate3d+zIndex) > entrada > billboard > DEPTH > ícone */}
          {SKILLS.map((skill, i) => {
            const p = points[i];
            const isHighlighted = spotlightId === skill.id;

            return (
              <div
                key={skill.slug}
                ref={(el) => { posRefs.current[i] = el; }}
                className="absolute top-1/2 left-1/2"
                style={{
                  width: 40,
                  height: 40,
                  marginLeft: -20,
                  marginTop: -20,
                  transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)`,
                  transformStyle: "preserve-3d",
                }}
                onPointerEnter={() => handleEnter(skill.id)}
                onPointerLeave={handleLeave}
                onPointerUp={handlePointerUp}
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
                  {/* Billboard: cancela a rotação do globo */}
                  <motion.div
                    style={{ transform: iconCounter, transformStyle: "preserve-3d", width: "100%", height: "100%" }}
                  >
                    {/* Depth layer: opacity/scale por frame via ref (abaixo do billboard:
                        opacity<1 aqui NÃO achata o preserve-3d acima) */}
                    <div
                      ref={(el) => { depthRefs.current[i] = el; }}
                      style={{ width: "100%", height: "100%", willChange: "transform, opacity" }}
                    >
                      <SkillIcon skill={skill} hovered={isHighlighted} />
                    </div>
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
            className="absolute top-1/2 left-1/2 rounded-full border border-purple-500/12 pointer-events-none"
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

      {/* Paralelos (horizontais) — equador em destaque */}
      {Array.from({ length: parallels }).map((_, i) => {
        const t = (i + 1) / (parallels + 1);
        const y = (t - 0.5) * 2 * radius;
        const r = Math.sqrt(radius * radius - y * y);
        const isEquator = i === Math.floor(parallels / 2);
        return (
          <div
            key={`p-${i}`}
            className={`absolute top-1/2 left-1/2 rounded-full border pointer-events-none ${
              isEquator ? "border-purple-500/30" : "border-purple-500/12"
            }`}
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

// ─── Ícone individual com glow + tooltip (nome + uso real) ───────────────────
function SkillIcon({ skill, hovered }: { skill: GlobeSkill; hovered: boolean }) {
  const usage = getSkillUsage(skill.id);

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
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
        }}
      />

      {/* Tooltip: nome + uso real nos projetos */}
      {hovered && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 flex flex-col items-center gap-0.5 pointer-events-none whitespace-nowrap"
          style={{ textShadow: "0 0 8px rgba(0,0,0,0.9)" }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">
            {skill.name}
          </span>
          {usage.count > 0 && (
            <span className="font-mono text-[9px] tracking-wider text-zinc-400">
              usado em {usage.count} {usage.count > 1 ? "projetos" : "projeto"}
            </span>
          )}
        </motion.span>
      )}
    </motion.div>
  );
}
