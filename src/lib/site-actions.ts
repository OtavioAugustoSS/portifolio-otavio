// ═════════════════════════════════════════════════════════════════════════════
//  AÇÕES DE NAVEGAÇÃO NA PÁGINA — ponte entre o chat de IA e as seções do site
//  ► A IA encerra respostas com tags como [[goto:projetos]] ou
//    [[projeto:pixelplace]]; aqui elas são validadas, removidas do texto e
//    transformadas em chips de ação no chat.
//  ► Comunicação via CustomEvent no window — ProjectsSection escuta e abre o
//    modal sem precisar de context/provider.
// ═════════════════════════════════════════════════════════════════════════════

import { projects } from "@/data/projects";

export const SECTIONS = ["sobre-mim", "skills", "projetos"] as const;
export type SectionId = (typeof SECTIONS)[number];

export type SiteAction =
  | { type: "goto"; section: SectionId }
  | { type: "project"; id: string };

export const SITE_ACTION_EVENT = "site:action";

export function dispatchSiteAction(action: SiteAction): void {
  window.dispatchEvent(new CustomEvent<SiteAction>(SITE_ACTION_EVENT, { detail: action }));
}

const PROJECT_IDS = new Set(projects.map((p) => p.id));
// Consome o whitespace ANTES da tag para não sobrar espaço duplo ao removê-la
// (sem achatar quebras de linha legítimas da resposta).
const TAG_REGEX = /\s*\[\[\s*(goto|projeto)\s*:\s*([\w-]+)\s*\]\]/gi;

/**
 * Extrai a primeira tag de ação VÁLIDA do texto e remove TODAS as tags
 * (válidas ou não) da versão exibida. Robusto a drift do modelo:
 * tag malformada/desconhecida → só é removida, sem ação.
 */
export function parseActionTag(raw: string): { clean: string; action: SiteAction | null } {
  let action: SiteAction | null = null;

  const clean = raw.replace(TAG_REGEX, (_match, kind: string, value: string) => {
    if (!action) {
      const v = value.toLowerCase();
      if (kind.toLowerCase() === "goto" && (SECTIONS as readonly string[]).includes(v)) {
        action = { type: "goto", section: v as SectionId };
      } else if (kind.toLowerCase() === "projeto" && PROJECT_IDS.has(v)) {
        action = { type: "project", id: v };
      }
    }
    return "";
  }).trim();

  return { clean, action };
}

/**
 * Durante o streaming: esconde um sufixo que PODE ser uma tag ainda incompleta
 * (ex.: "...resposta [[proj"), para a tag nunca piscar na tela.
 */
export function splitVisible(raw: string): string {
  // remove tags completas já recebidas
  let visible = raw.replace(TAG_REGEX, "");
  // esconde início de tag não fechada no fim do texto ("[", "[[", "[[proj...")
  visible = visible.replace(/\[{1,2}[^\]]*$/, "");
  return visible.trimEnd();
}

/** Rótulo do chip de ação exibido sob a resposta da IA. */
export function actionLabel(action: SiteAction): string {
  if (action.type === "goto") {
    const labels: Record<SectionId, string> = {
      "sobre-mim": "Ver Sobre Mim",
      "skills": "Ver Habilidades",
      "projetos": "Ver Projetos",
    };
    return labels[action.section];
  }
  const project = projects.find((p) => p.id === action.id);
  return project ? `Abrir ${project.title.split("—")[0].trim()}` : "Abrir projeto";
}
