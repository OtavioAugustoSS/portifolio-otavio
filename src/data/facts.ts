// ═════════════════════════════════════════════════════════════════════════════
//  FATOS EXTRAS — conhecimento exclusivo da IA (sem contraparte na página)
//  ► Trabalhos freelancer, detalhes técnicos e contexto de carreira que não
//    viram card no site mas que a IA deve saber responder.
//  ► A página NÃO renderiza nada daqui; só o buildAiContext() consome.
// ═════════════════════════════════════════════════════════════════════════════

export type ExtraFact = { title: string; body: string };

export const EXTRA_FACTS: ExtraFact[] = [
  {
    title: "Objetivo atual",
    body: "Crescer como Desenvolvedor de Software, aprimorar a stack PHP no estágio e seguir entregando projetos freelancer de alto rigor técnico.",
  },
  {
    title: "Arquitetura B2B/B2C para E-commerce (freelance)",
    body: "Implementação de fluxos com regras fiscais dinâmicas (PF/PJ e ICMS) via Hooks/Filters mantendo o core intacto do WooCommerce. Otimização do funil de checkout com requisições assíncronas (Receita Federal e ViaCEP), eliminando recarregamentos e reduzindo abandono de carrinho. Stack: WordPress, HTML, CSS, PHP, JavaScript, WooCommerce, APIs REST.",
  },
  {
    title: "Sistema ERP em Notion (E-commerce)",
    body: "ERP customizado com Kanban de Operações e Motor de Lucro Real (calcula margem usando rateio de fixos e variáveis). Possui alerta de Estoque Dinâmico pela Curva ABC e conciliação de Fluxo de Caixa.",
  },
  {
    title: "Jogos de Ritmo",
    body: "2 jogos rítmicos de PC construídos em equipe, com sistema de pontuação, escolha de músicas e mapeamento de keybinds. Um em Python e outro em C.",
  },
  {
    title: "Detalhe técnico — Painel RaizTech",
    body: "Co-desenvolvimento da plataforma de gestão de irrigadores inteligentes: arquitetura de dados para ingestão contínua de alto volume de telemetria sem perda de performance, com métricas em tempo real para redução de desperdícios hídricos e energéticos. Stack completa: React, TypeScript, Vite, Tailwind CSS, Recharts, React Query, Supabase, MySQL, MongoDB.",
  },
  {
    title: "Detalhe técnico — Participa DF",
    body: "Plataforma desenvolvida em Hackathon seguindo as diretrizes de acessibilidade WCAG 2.1 AA. Back-end assíncrono para mídias pesadas com integração NLP (IA) processando análise de sentimentos e classificação de urgência, eliminando triagens manuais.",
  },
  {
    title: "Tecnologias adicionais (fora das listas do site)",
    body: "SQLAlchemy, Zustand, Prisma, React Query, Recharts, MongoDB, Supabase, Vite, Render, APScheduler, WooCommerce, APIs REST, Web Scraping, Google Gemini API, WhatsApp Cloud API.",
  },
];
