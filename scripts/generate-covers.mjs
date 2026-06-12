// Gera capas únicas para os cards de projeto (SVG → PNG via sharp).
// Uso: node scripts/generate-covers.mjs
import sharp from "sharp";
import { mkdirSync } from "fs";

const W = 1200, H = 800;

// Paleta base do site
const BG1 = "#0d0d13";
const BG2 = "#13101d";

/** Moldura comum: fundo, glow radial na cor do projeto, grade de pontos. */
function frame(accent, accentSoft, inner) {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BG1}"/>
      <stop offset="100%" stop-color="${BG2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.46" r="0.55">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.32"/>
      <stop offset="55%" stop-color="${accent}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.5" cy="0.46" r="0.22">
      <stop offset="0%" stop-color="${accentSoft}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${accentSoft}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.6" fill="#8b5cf6" opacity="0.13"/>
    </pattern>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <ellipse cx="${W / 2}" cy="${H * 0.46}" rx="320" ry="260" fill="url(#glow2)"/>
  ${inner}
  <!-- vinheta -->
  <rect width="${W}" height="${H}" fill="black" opacity="0.12"/>
  <rect x="0" y="${H - 220}" width="${W}" height="220" fill="url(#fade)"/>
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BG1}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${BG1}" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
</svg>`;
}

/** Bolhas de chat do WhatsApp (motivo comum: todos são bots de WhatsApp). */
function chatBubbles(x, y, accent) {
  return `<g transform="translate(${x},${y})" opacity="0.85">
    <rect x="0" y="0" rx="16" ry="16" width="170" height="44" fill="#1b1b22" stroke="#ffffff14"/>
    <circle cx="26" cy="22" r="6" fill="${accent}" opacity="0.9"/>
    <rect x="44" y="16" width="100" height="12" rx="6" fill="#3f3f46"/>
    <rect x="60" y="58" rx="16" ry="16" width="140" height="44" fill="${accent}" opacity="0.92"/>
    <rect x="80" y="74" width="90" height="12" rx="6" fill="#ffffff" opacity="0.85"/>
  </g>`;
}

const cx = W / 2, cy = H * 0.44;

// ─── 1. Assistente Pessoal — calendário + relógio ─────────────────────────────
const assistente = frame("#8b5cf6", "#a78bfa", `
  <g transform="translate(${cx - 130},${cy - 140})">
    <!-- calendário -->
    <rect x="0" y="26" width="220" height="200" rx="22" fill="#17151f" stroke="#8b5cf6" stroke-width="5"/>
    <rect x="0" y="26" width="220" height="56" rx="22" fill="#8b5cf6" opacity="0.9"/>
    <rect x="0" y="58" width="220" height="24" fill="#8b5cf6" opacity="0.9"/>
    <rect x="42" y="0" width="16" height="48" rx="8" fill="#c4b5fd"/>
    <rect x="162" y="0" width="16" height="48" rx="8" fill="#c4b5fd"/>
    <!-- dias -->
    ${[0, 1, 2].map(r => [0, 1, 2, 3].map(c =>
      `<rect x="${26 + c * 46}" y="${104 + r * 38}" width="28" height="22" rx="6" fill="#2b2838"/>`
    ).join("")).join("")}
    <rect x="118" y="142" width="28" height="22" rx="6" fill="#8b5cf6"/>
    <!-- relógio sobreposto -->
    <g transform="translate(196,156)">
      <circle r="64" fill="#17151f" stroke="#a78bfa" stroke-width="6"/>
      <line x1="0" y1="0" x2="0" y2="-36" stroke="#e9d5ff" stroke-width="7" stroke-linecap="round"/>
      <line x1="0" y1="0" x2="26" y2="12" stroke="#a78bfa" stroke-width="7" stroke-linecap="round"/>
      <circle r="7" fill="#c4b5fd"/>
    </g>
  </g>
  ${chatBubbles(96, H - 320, "#8b5cf6")}
`);

// ─── 2. Bot Passagens — avião + gráfico de preço ──────────────────────────────
const passagens = frame("#38bdf8", "#7dd3fc", `
  <!-- trilha pontilhada -->
  <path d="M 150 ${cy + 130} C 380 ${cy - 10}, 700 ${cy - 190}, ${cx + 320} ${cy - 150}"
        fill="none" stroke="#7dd3fc" stroke-width="5" stroke-dasharray="2 26" stroke-linecap="round" opacity="0.8"/>
  <!-- avião -->
  <g transform="translate(${cx + 60},${cy - 120}) rotate(24)">
    <path d="M 0 0 L 200 36 L 0 72 L 36 36 Z" fill="#e0f2fe"/>
    <path d="M 36 36 L -64 10 L -36 36 L -64 62 Z" fill="#7dd3fc"/>
  </g>
  <!-- gráfico de preços caindo -->
  <g transform="translate(${cx - 320},${cy + 10})">
    <rect x="0" y="60" width="44" height="150" rx="8" fill="#1d2a36" stroke="#38bdf833"/>
    <rect x="64" y="96" width="44" height="114" rx="8" fill="#1d2a36" stroke="#38bdf833"/>
    <rect x="128" y="126" width="44" height="84" rx="8" fill="#1d2a36" stroke="#38bdf833"/>
    <rect x="192" y="156" width="44" height="54" rx="8" fill="#38bdf8" opacity="0.9"/>
    <path d="M 22 40 L 86 76 L 150 106 L 214 140" fill="none" stroke="#e0f2fe" stroke-width="6" stroke-linecap="round"/>
    <path d="M 214 140 l -26 -8 m 26 8 l -8 -26" stroke="#e0f2fe" stroke-width="6" stroke-linecap="round" fill="none"/>
  </g>
  ${chatBubbles(W - 330, H - 320, "#38bdf8")}
`);

// ─── 3. Chatbot Psicólogo — coração + linha de pulso + calendário ─────────────
const psicologo = frame("#2dd4bf", "#5eead4", `
  <g transform="translate(${cx},${cy - 20})">
    <!-- coração -->
    <path d="M 0 96 C -28 64, -120 28, -120 -38 C -120 -92, -64 -118, 0 -56 C 64 -118, 120 -92, 120 -38 C 120 28, 28 64, 0 96 Z"
          fill="#152022" stroke="#2dd4bf" stroke-width="7"/>
    <!-- pulso (ECG) -->
    <path d="M -150 0 L -60 0 L -34 -44 L -6 38 L 18 -16 L 34 0 L 150 0"
          fill="none" stroke="#5eead4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" filter="url(#soft)" opacity="0.65"/>
    <path d="M -150 0 L -60 0 L -34 -44 L -6 38 L 18 -16 L 34 0 L 150 0"
          fill="none" stroke="#99f6e4" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <!-- mini agenda LGPD -->
  <g transform="translate(${cx + 190},${cy + 90})">
    <rect width="120" height="110" rx="14" fill="#152022" stroke="#2dd4bf" stroke-width="4"/>
    <rect width="120" height="30" rx="14" fill="#2dd4bf" opacity="0.85"/>
    <rect y="16" width="120" height="14" fill="#2dd4bf" opacity="0.85"/>
    <circle cx="34" cy="66" r="9" fill="#2b3b3a"/>
    <circle cx="62" cy="66" r="9" fill="#5eead4"/>
    <circle cx="90" cy="66" r="9" fill="#2b3b3a"/>
    <rect x="22" y="84" width="76" height="10" rx="5" fill="#2b3b3a"/>
  </g>
  ${chatBubbles(96, H - 320, "#2dd4bf")}
`);

// ─── 4. Chatbot Barbearia — tesoura + pente ───────────────────────────────────
const barbearia = frame("#f59e0b", "#fbbf24", `
  <g transform="translate(${cx - 30},${cy})">
    <!-- tesoura -->
    <g stroke="#fbbf24" stroke-width="9" stroke-linecap="round" fill="none">
      <line x1="-26" y1="-12" x2="170" y2="-96"/>
      <line x1="-26" y1="12" x2="170" y2="96"/>
    </g>
    <circle cx="-78" cy="-48" r="40" fill="none" stroke="#f59e0b" stroke-width="10"/>
    <circle cx="-78" cy="48" r="40" fill="none" stroke="#f59e0b" stroke-width="10"/>
    <circle cx="-22" cy="0" r="12" fill="#fde68a"/>
    <!-- pente -->
    <g transform="translate(110,-10) rotate(28)">
      <rect x="0" y="0" width="190" height="34" rx="12" fill="#1f1a12" stroke="#f59e0b" stroke-width="5"/>
      ${[0, 1, 2, 3, 4, 5, 6].map(i =>
        `<rect x="${16 + i * 24}" y="30" width="10" height="44" rx="5" fill="#f59e0b" opacity="0.9"/>`
      ).join("")}
    </g>
  </g>
  <!-- listras de barbearia -->
  <g transform="translate(110,${cy - 170}) rotate(-18)" opacity="0.85">
    <rect x="0" y="0" width="56" height="240" rx="28" fill="#1f1a12" stroke="#f59e0b55" stroke-width="3"/>
    ${[0, 1, 2, 3].map(i =>
      `<rect x="6" y="${18 + i * 56}" width="44" height="22" rx="11" fill="${i % 2 ? "#f59e0b" : "#e4e4e7"}" opacity="0.9"/>`
    ).join("")}
  </g>
  ${chatBubbles(W - 330, H - 320, "#f59e0b")}
`);

const covers = [
  ["bot-assistente.png", assistente],
  ["bot-passagens.png", passagens],
  ["bot-psicologo.png", psicologo],
  ["bot-barbearia.png", barbearia],
];

mkdirSync("public/projects", { recursive: true });
for (const [name, svg] of covers) {
  const out = `public/projects/${name}`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
  console.log("ok:", out);
}
