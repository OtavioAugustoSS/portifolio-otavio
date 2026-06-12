// ═════════════════════════════════════════════════════════════════════════════
//  REGISTRO ÚNICO DE SKILLS — fonte única de verdade
//  ► Cada skill existe UMA vez aqui; as superfícies (globo, lista, carrossel)
//    consomem subconjuntos ordenados abaixo. A IA também lê este registro.
//  ► `name` é o rótulo canônico (lista + IA); `shortName` é o compacto
//    (globo/carrossel). Ícones: https://cdn.simpleicons.org/<slug>, exceto
//    `customIcon` (Java e C não existem no Simple Icons).
//  ► A ORDEM dos arrays de ids é load-bearing (posição na esfera Fibonacci,
//    stagger de animação) — não reordene sem motivo visual.
// ═════════════════════════════════════════════════════════════════════════════

export type SkillCategory =
  | "Linguagens"
  | "Bibliotecas e Frameworks"
  | "Banco de Dados e Ferramentas";

export type Skill = {
  id: string;
  name: string;
  shortName?: string;
  slug: string;
  color: string;
  customIcon?: string;
  category: SkillCategory;
};

export const SKILLS: Skill[] = [
  // Linguagens
  { id: "java",       name: "Java",          slug: "java",       color: "#ED8B00", category: "Linguagens", customIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" },
  { id: "python",     name: "Python",        slug: "python",     color: "#3776AB", category: "Linguagens" },
  { id: "javascript", name: "JavaScript",    slug: "javascript", color: "#F7DF1E", category: "Linguagens" },
  { id: "typescript", name: "TypeScript",    slug: "typescript", color: "#3178C6", category: "Linguagens" },
  { id: "php",        name: "PHP",           slug: "php",        color: "#777BB4", category: "Linguagens" },
  { id: "sql",        name: "SQL",           slug: "mysql",      color: "#4479A1", category: "Linguagens" },
  { id: "c",          name: "C",             slug: "c",          color: "#A8B9CC", category: "Linguagens", customIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg" },
  { id: "html5",      name: "HTML5",         slug: "html5",      color: "#E34F26", category: "Linguagens" },
  { id: "css",        name: "CSS",           slug: "css",        color: "#663399", category: "Linguagens" },
  // Bibliotecas e Frameworks
  { id: "react",      name: "React.js",      shortName: "React",   slug: "react",       color: "#61DAFB", category: "Bibliotecas e Frameworks" },
  { id: "nextdotjs",  name: "Next.js",       slug: "nextdotjs/white", color: "#FFFFFF", category: "Bibliotecas e Frameworks" },
  { id: "nodedotjs",  name: "Node.js",       slug: "nodedotjs",   color: "#5FA04E", category: "Bibliotecas e Frameworks" },
  { id: "tailwindcss", name: "Tailwind CSS", shortName: "Tailwind", slug: "tailwindcss", color: "#06B6D4", category: "Bibliotecas e Frameworks" },
  { id: "framer",     name: "Framer Motion", shortName: "Framer",  slug: "framer",      color: "#0055FF", category: "Bibliotecas e Frameworks" },
  { id: "fastapi",    name: "FastAPI",       slug: "fastapi",     color: "#009688", category: "Bibliotecas e Frameworks" },
  // Banco de Dados e Ferramentas
  { id: "mysql",      name: "MySQL",         slug: "mysql",      color: "#4479A1", category: "Banco de Dados e Ferramentas" },
  { id: "postgresql", name: "PostgreSQL",    slug: "postgresql", color: "#4169E1", category: "Banco de Dados e Ferramentas" },
  { id: "sqlite",     name: "SQLite",        slug: "sqlite/4DB6E4", color: "#4DB6E4", category: "Banco de Dados e Ferramentas" },
  { id: "selenium",   name: "Selenium",      slug: "selenium",   color: "#43B02A", category: "Banco de Dados e Ferramentas" },
  { id: "git",        name: "Git",           slug: "git",        color: "#F05032", category: "Banco de Dados e Ferramentas" },
  { id: "docker",     name: "Docker",        slug: "docker",     color: "#2496ED", category: "Banco de Dados e Ferramentas" },
  { id: "github",     name: "GitHub",        slug: "github/white", color: "#FFFFFF", category: "Banco de Dados e Ferramentas" },
  { id: "wordpress",  name: "WordPress",     slug: "wordpress",  color: "#21759B", category: "Banco de Dados e Ferramentas" },
];

const byId = new Map(SKILLS.map((s) => [s.id, s]));

/** Resolve ids → skills; lança erro em build/dev se um id não existir. */
function pick(ids: string[]): Skill[] {
  return ids.map((id) => {
    const s = byId.get(id);
    if (!s) throw new Error(`[skills] id desconhecido: "${id}"`);
    return s;
  });
}

// ─── Globo 3D (SkillGlobe) — 20 itens, ordem original preservada ─────────────
const GLOBE_IDS = [
  "python", "javascript", "typescript", "react", "nextdotjs", "nodedotjs",
  "php", "mysql", "postgresql", "sqlite", "tailwindcss", "fastapi",
  "html5", "css", "selenium", "git", "docker", "github", "wordpress", "framer",
];

export type GlobeSkill = { id: string; slug: string; name: string; color: string };

export const globeSkills: GlobeSkill[] =
  pick(GLOBE_IDS).map((s) => ({ id: s.id, slug: s.slug, name: s.shortName ?? s.name, color: s.color }));

// ─── Lista por categoria (SkillList) — 7/6/7, ordem original preservada ──────
const LIST_IDS: { title: string; ids: string[] }[] = [
  { title: "Linguagens",                    ids: ["java", "python", "javascript", "typescript", "php", "sql", "c"] },
  { title: "Bibliotecas e Frameworks",      ids: ["react", "nextdotjs", "nodedotjs", "tailwindcss", "framer", "fastapi"] },
  { title: "Banco de Dados e Ferramentas",  ids: ["mysql", "postgresql", "sqlite", "selenium", "git", "docker", "wordpress"] },
];

export type ListSkill = { id: string; name: string; slug: string; color: string; customIcon?: string };

export const skillCategories: { title: string; skills: ListSkill[] }[] =
  LIST_IDS.map(({ title, ids }) => ({
    title,
    skills: pick(ids).map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      color: s.color,
      ...(s.customIcon ? { customIcon: s.customIcon } : {}),
    })),
  }));
