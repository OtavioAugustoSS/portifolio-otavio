// ═════════════════════════════════════════════════════════════════════════════
//  USO REAL DAS SKILLS — cruza o registro de skills com os projetos do site
//  ► "Usado em N projetos" no globo e na lista vem daqui, calculado dos dados
//    reais de projects.ts (technologies + techList). Determinístico e SSR-safe
//    (computado uma vez no escopo do módulo).
//  ► Match por TOKEN com boundary: "java" NÃO casa com "javascript",
//    "git" NÃO casa com "github", "c" NÃO casa com "css".
// ═════════════════════════════════════════════════════════════════════════════

import { SKILLS } from "@/data/skills";
import { projects } from "@/data/projects";

export type SkillUsage = { count: number; titles: string[] };

/** Skills com count >= threshold ganham destaque visual (stack do dia a dia). */
export const FEATURED_THRESHOLD = 3;

// Aliases por skill id — cuidado com tokens curtos ("js"/"ts" fora: o "." de
// "Next.js" conta como boundary e vazaria pro JavaScript/TypeScript).
const ALIASES: Record<string, string[]> = {
  java: ["java"],
  python: ["python", "python 3.13"],
  javascript: ["javascript"],
  typescript: ["typescript"],
  php: ["php"],
  sql: ["sql", "mysql", "postgresql", "sqlite", "sqlalchemy"], // SQL-a-linguagem: qualquer projeto com banco SQL/ORM
  c: ["c"],
  html5: ["html", "html5"],
  css: ["css", "css3"],
  react: ["react", "react.js", "reactjs"],
  nextdotjs: ["next.js", "nextjs"],
  nodedotjs: ["node.js", "nodejs", "node"],
  tailwindcss: ["tailwind", "tailwind css", "tailwindcss"],
  framer: ["framer", "framer motion"],
  fastapi: ["fastapi"],
  mysql: ["mysql"],
  postgresql: ["postgresql", "postgres"],
  sqlite: ["sqlite"],
  selenium: ["selenium"],
  git: ["git"],
  docker: ["docker"],
  github: ["github"],
  wordpress: ["wordpress"],
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Token presente com fronteiras não-alfanuméricas (início/fim contam). */
function hasToken(haystack: string, alias: string): boolean {
  return new RegExp(`(^|[^a-z0-9])${escapeRegex(alias)}($|[^a-z0-9])`).test(haystack);
}

// Por projeto: um "palheiro" normalizado com todos os nomes de tecnologia
const PROJECT_HAYSTACKS = projects.map((p) => ({
  title: p.title,
  strings: [
    ...p.technologies.map((t) => t.name.toLowerCase()),
    ...p.details.techList.map((t) => t.toLowerCase()),
  ],
}));

const USAGE = new Map<string, SkillUsage>(
  SKILLS.map((skill) => {
    const aliases = ALIASES[skill.id] ?? [skill.name.toLowerCase()];
    const titles = PROJECT_HAYSTACKS
      .filter((proj) =>
        proj.strings.some((str) => aliases.some((a) => hasToken(str, a)))
      )
      .map((proj) => proj.title);
    return [skill.id, { count: titles.length, titles }];
  })
);

export function getSkillUsage(skillId: string): SkillUsage {
  return USAGE.get(skillId) ?? { count: 0, titles: [] };
}

export function isFeatured(skillId: string): boolean {
  return getSkillUsage(skillId).count >= FEATURED_THRESHOLD;
}
