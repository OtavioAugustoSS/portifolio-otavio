// ═════════════════════════════════════════════════════════════════════════════
//  PERFIL — fonte única de verdade sobre o Otavio
//  ► Alimenta a seção Sobre Mim (bio, info cards) E o contexto da IA.
//  ► Atualizou emprego/faculdade/contato? Mude AQUI — site e IA acompanham.
// ═════════════════════════════════════════════════════════════════════════════

export type Experience = {
  company: string;
  role: string;
  period: "Atual" | "Anterior";
  stack?: string;
  activities: string[];
};

/** Chaves das fotos do quadro central do Sobre Mim (ver PHOTO_MAP no componente). */
export type PhotoKey = "default" | "brasilia" | "ucb" | "craft";

export type TimelineItem = {
  period: string;     // exibido em fonte mono ("2024", "hoje"...)
  title: string;
  detail: string;
  photoKey?: PhotoKey; // hover no marco troca a foto central
};

export const PROFILE = {
  name: "Otavio Augusto",
  role: "Full Stack Developer",
  headline: "Desenvolvedor Full Stack com foco em Engenharia de Dados",
  location: {
    city: "Brasília, DF",
    origin: "Unaí - MG",
    coords: "15.7942° S, 47.8822° O",
    timezone: "GMT-3",
  },
  education: {
    course: "Engenharia de Software",
    institution: "Universidade Católica de Brasília (UCB)",
    status: "Cursando",
    continuous: "Cursos frequentes na DIO (Digital Innovation One) para certificados e aprimoramento",
  },
  languages: ["Inglês avançado"],

  // Parágrafos do lead do "Sobre Mim" (renderizados na página e lidos pela IA)
  bio: [
    "Saí de Unaí-MG no meio de 2024 com uma meta simples: viver de programação. Mudei para Brasília e entrei em Engenharia de Software na UCB.",
    "Hoje estagio na Protesto24H trabalhando com PHP e sigo ativo como freelancer na Workana, construindo bots, ERPs e sistemas que clientes reais usam.",
  ],

  // Frases da bio destacadas no lead (match exato; tone: white | primary)
  bioHighlights: [
    { phrase: "Unaí-MG", tone: "white" },
    { phrase: "viver de programação", tone: "primary" },
    { phrase: "Engenharia de Software na UCB", tone: "white" },
    { phrase: "Protesto24H", tone: "white" },
    { phrase: "Workana", tone: "white" },
  ] as { phrase: string; tone: "white" | "primary" }[],

  // Trajetória — marcos visíveis na timeline do Sobre Mim
  timeline: [
    {
      period: "2024",
      title: "De Unaí-MG para Brasília",
      detail: "Mudei de cidade no meio do ano para estudar e trabalhar com software.",
      photoKey: "brasilia",
    },
    {
      period: "desde 2024",
      title: "Engenharia de Software na UCB",
      detail: "Cursando, com ênfase em sistemas e engenharia de dados.",
      photoKey: "ucb",
    },
    {
      period: "2024 a 2025",
      title: "Primeiro full stack na DruSign",
      detail: "ERP de gestão em Next.js e geração de fachadas com IA que ajudou a fechar vendas.",
      photoKey: "craft",
    },
    {
      period: "hoje",
      title: "Protesto24H + freelance",
      detail: "Estágio com PHP em produção e projetos para clientes na Workana.",
      photoKey: "craft",
    },
  ] satisfies TimelineItem[],

  // Legendas da foto central, por chave
  photoCaptions: {
    default: "esse sou eu · Brasília, DF",
    brasilia: "Brasília, DF",
    ucb: "UCB · Águas Claras",
    craft: "setup de guerra",
  } satisfies Record<PhotoKey, string>,

  experience: [
    {
      company: "Protesto24H",
      role: "Desenvolvedor de Software (Estágio)",
      period: "Atual",
      stack: "PHP (framework proprietário interno da empresa)",
      activities: [
        "Pesquisa tecnológica para fundamentar decisões de desenvolvimento",
        "Acompanhamento da gestão de ferramentas, fluxos e processos internos",
        "Assessoria no desenvolvimento de novas soluções de software para a operação da empresa",
      ],
    },
    {
      company: "DruSign Placas e Comunicação Visual LTDA",
      role: "Desenvolvedor Full Stack",
      period: "Anterior",
      stack: "TypeScript, Next.js, React, Tailwind CSS, Zustand, Prisma, MySQL",
      activities: [
        "Desenvolvimento de ERP com Next.js e React para otimizar a gestão de serviços",
        "Criação de interfaces com Zustand para estado global na manipulação de orçamentos e precificação",
        "Modelagem do banco de dados MySQL com Prisma ORM e TypeScript prevenindo falhas transacionais",
        "Sistema de geração de fachadas integrado à IA (Google Gemini) entregando pré-visualizações fiéis que impulsionaram diretamente o fechamento de vendas",
      ],
    },
  ] satisfies Experience[],

  contacts: {
    email: "otavioaugustoss990@gmail.com",
    github: "https://github.com/OtavioAugustoSS",
    linkedin: "https://www.linkedin.com/in/otavio-augusto-980258367",
    workana: "https://www.workana.com/freelancer/871e75f307471c5252415edeeaf33a08",
  },
};
