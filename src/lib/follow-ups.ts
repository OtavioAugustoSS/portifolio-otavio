// ═════════════════════════════════════════════════════════════════════════════
//  SUGESTÕES DE CONTINUAÇÃO — chips que aparecem depois de cada resposta da IA
//  ► Determinísticas: saem da ação que a resposta emitiu ([[projeto:x]] /
//    [[goto:y]]) + dos dados do site. Sem chamada extra ao modelo e sem risco
//    de sugerir algo que a IA não sabe responder.
//  ► Não repetem perguntas já feitas na conversa.
// ═════════════════════════════════════════════════════════════════════════════

import { projects } from "@/data/projects";
import { PROFILE } from "@/data/profile";
import type { SiteAction } from "./site-actions";

export type Suggestion = { label: string; prompt: string };

const short = (title: string) => title.split("—")[0].trim();

/** Tecnologia mais "falável" de um projeto (a primeira da stack). */
function mainTech(projectId: string): string | null {
  const p = projects.find((x) => x.id === projectId);
  return p?.technologies[0]?.name ?? null;
}

/** Próximo projeto na ordem do site — para "e o próximo?" sem sortear. */
function nextProject(projectId: string) {
  const i = projects.findIndex((p) => p.id === projectId);
  return projects[(i + 1) % projects.length];
}

function forAction(action: SiteAction | undefined): Suggestion[] {
  if (!action) {
    return [
      { label: "Projetos", prompt: "Quais projetos o Otavio já desenvolveu?" },
      { label: "Stack principal", prompt: "Qual é a stack principal do Otavio?" },
      { label: "Contato", prompt: "Como posso entrar em contato com o Otavio profissionalmente?" },
    ];
  }

  if (action.type === "project") {
    const p = projects.find((x) => x.id === action.id);
    if (!p) return forAction(undefined);
    const name = short(p.title);
    const tech = mainTech(p.id);
    const next = nextProject(p.id);
    return [
      { label: "Como funciona por dentro?", prompt: `Como o ${name} funciona por dentro?` },
      ...(tech ? [{ label: `Outros projetos com ${tech}`, prompt: `Que outros projetos do Otavio usam ${tech}?` }] : []),
      { label: `E o ${short(next.title)}?`, prompt: `Me fala do ${short(next.title)}.` },
    ];
  }

  switch (action.section) {
    case "projetos":
      return [
        { label: "Qual o mais complexo?", prompt: "Qual é o projeto mais complexo do Otavio?" },
        { label: "Projetos com IA", prompt: "Quais projetos do Otavio usam inteligência artificial?" },
        { label: "Freelances", prompt: "Que trabalhos freelance o Otavio já fez?" },
      ];
    case "skills":
      return [
        { label: "O que usa no trabalho", prompt: `Quais tecnologias o Otavio usa na ${(PROFILE.experience.find((e) => e.period === "Atual") ?? PROFILE.experience[0]).company}?` },
        { label: "Projetos em Python", prompt: "Quais projetos o Otavio fez em Python?" },
        { label: "Projetos em TypeScript", prompt: "Quais projetos o Otavio fez em TypeScript?" },
      ];
    case "sobre-mim":
      return [
        { label: "Experiência anterior", prompt: "O que o Otavio fez no emprego anterior?" },
        { label: "Formação", prompt: "Qual é a formação do Otavio?" },
        { label: "Projetos", prompt: "Quais projetos o Otavio já desenvolveu?" },
      ];
  }
}

/**
 * Até 3 sugestões para depois de uma resposta, sem repetir o que o visitante
 * já perguntou (comparação normalizada, ignorando caixa e pontuação).
 */
export function suggestFollowUps(action: SiteAction | undefined, asked: string[]): Suggestion[] {
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const seen = new Set(asked.map(norm));
  const pool = [...forAction(action), ...forAction(undefined)];
  const out: Suggestion[] = [];
  for (const s of pool) {
    if (seen.has(norm(s.prompt)) || out.some((o) => o.prompt === s.prompt)) continue;
    out.push(s);
    if (out.length === 3) break;
  }
  return out;
}
