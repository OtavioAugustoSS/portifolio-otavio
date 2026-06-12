// ═════════════════════════════════════════════════════════════════════════════
//  DADOS DOS PROJETOS — fonte única de verdade
//  ► Para adicionar um projeto, crie um novo objeto no array abaixo.
//  ► Imagens ficam em: /public/projects/nome.png
//  ► Cada projeto tem um campo "repoUrl" com o link do GitHub.
//  ► Tudo aqui alimenta TANTO os cards da página QUANTO o contexto da IA
//    (src/data/ai-context.ts) — adicionar um projeto ensina a IA automaticamente.
// ═════════════════════════════════════════════════════════════════════════════

export type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  repoUrl: string;
  technologies: { name: string; slug: string }[];
  details: { overview: string; howItWorks: string[]; techList: string[] };
};

export const projects: Project[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "pixelplace",
    title: "PixelPlace — Canvas Colaborativo em Tempo Real",
    description: "Clone do r/place: canvas de pixel art multiplayer ao vivo com salas, cursores, template compartilhado e timelapse.",
    image: "/projects/pixelplace.png",
    repoUrl: "https://github.com/OtavioAugustoSS/pixelplace",
    technologies: [
      { name: "Node.js",    slug: "nodedotjs" },
      { name: "Express",    slug: "express/white" },
      { name: "JavaScript", slug: "javascript" },
      { name: "HTML5",      slug: "html5" },
    ],
    details: {
      overview:
        "Canvas colaborativo de pixel art em tempo real no estilo r/place. Jogadores criam salas e pintam juntos num canvas compartilhado de 512×512 com paleta de 32 cores e cooldown por usuário. Sincronização ao vivo via WebSocket, com cursores dos outros jogadores, painel de quem está online, template de referência compartilhado, minimapa e timelapse da evolução do canvas. Sem frameworks de frontend — Canvas HTML5 e JavaScript puro.",
      howItWorks: [
        "Servidor Express + WebSocket (ws) escopa cada sala; no connect envia um snapshot binário e faz broadcast incremental de cada pixel",
        "Cooldown por usuário validado no servidor (o cliente só exibe o timer), evitando flood de pinturas",
        "Frontend em Canvas HTML5 com zoom/pan, grade ao ampliar, minimapa de navegação e animação de pop ao pintar",
        "Template compartilhado: a imagem é reduzida e quantizada na paleta e vira overlay semitransparente pra todos traçarem juntos",
        "Persistência append-only (JSONL + snapshot binário) que sobrevive a kill -9, com replay e timelapse 1×/4×/16×",
      ],
      techList: ["Node.js", "Express", "WebSocket (ws)", "JavaScript (ES Modules)", "HTML5 Canvas", "node:test (TDD)", "Playwright (E2E)"],
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "assistente-pessoal",
    title: "Assistente Pessoal IA — WhatsApp",
    description: "Agente inteligente para WhatsApp com NLP, gerenciamento de agendas e notificações via APScheduler.",
    image: "/projects/bot-assistente.png",
    repoUrl: "https://github.com/OtavioAugustoSS/Wpp-Scheduler-Bot",
    technologies: [
      { name: "Python",     slug: "python" },
      { name: "FastAPI",    slug: "fastapi" },
      { name: "Docker",     slug: "docker" },
      { name: "SQLite",     slug: "sqlite/4DB6E4" },
    ],
    details: {
      overview:
        "Agente Inteligente para WhatsApp desenvolvido com FastAPI e a API da NVIDIA. Ao invés de um chatbot padrão, o assistente interpreta intenções em linguagem natural, extrai datas e regras de recorrência e salva no banco de dados com injeção de contexto. Deploy automatizado via Docker no Render.",
      howItWorks: [
        "Usuário envia mensagem em linguagem natural, o agente identifica a intenção",
        "Extrai datas, horários e regras de recorrência",
        "Salva o agendamento no SQLite via SQLAlchemy com injeção de contexto",
        "APScheduler gerencia os gatilhos de tempo e notifica proativamente via WhatsApp Cloud API",
        "Deploy containerizado com Docker no Render para execução contínua",
      ],
      techList: ["Python", "FastAPI (Uvicorn)", "NVIDIA NIM API (NLP)", "SQLite", "SQLAlchemy (ORM)", "APScheduler", "Docker", "WhatsApp Cloud API", "Render (Deploy)"],
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "bot-passagens",
    title: "Bot Monitor de Passagens Aéreas",
    description: "Bot que monitora e notifica promoções de voos em tempo real para grupos de WhatsApp.",
    image: "/projects/bot-passagens.png",
    repoUrl: "https://github.com/OtavioAugustoSS/Bot_WhatsApp_Passagens",
    technologies: [
      { name: "Python",   slug: "python" },
      { name: "Selenium", slug: "selenium" },
      { name: "MySQL",    slug: "mysql" },
    ],
    details: {
      overview:
        "Solução de automação que monitora, analisa e notifica promoções de passagens aéreas em tempo real para grupos de WhatsApp. Não apenas busca preços, mas aplica regras de negócio para identificar oportunidades de compra com base na antecedência do voo. O projeto conta com um filtro de regiões configurável para melhor filtragem de promoções por região desejada.",
      howItWorks: [
        "Web Scraping de preços de passagens via Selenium",
        "Aplica regras de negócio por antecedência: Curto, Médio e Longo prazo",
        "Filtra por região de origem/destino configurável",
        "Envia alertas automáticos com detalhes da promoção para grupos de WhatsApp",
        "Persiste histórico de preços no MySQL para análise de tendências",
      ],
      techList: ["Python", "Selenium WebDriver", "MySQL", "WhatsApp API", "Web Scraping"],
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "chatbot-psicologo",
    title: "Chatbot Clínico — Psicólogo",
    description: "Chatbot LGPD-compliant para clínica de psicologia com agendamento via Google Calendar e lembretes automáticos.",
    image: "/projects/bot-psicologo.png",
    repoUrl: "https://github.com/OtavioAugustoSS/Chatbot-WhatsApp-Psicologo",
    technologies: [
      { name: "Python",      slug: "python" },
      { name: "FastAPI",     slug: "fastapi" },
      { name: "MySQL",       slug: "mysql" },
      { name: "Google",      slug: "google" },
    ],
    details: {
      overview:
        "Chatbot de Autoatendimento Clínico integrado ao WhatsApp focado em privacidade (LGPD) e automação de rotinas para a área da saúde. Realiza triagem de novos pacientes, agendamento via Google Calendar em tempo real, envio de lembretes automáticos e notificações por e-mail para a secretaria.",
      howItWorks: [
        "Triagem Automatizada: captura de leads via Botões Interativos da Meta, categorizando turnos e modalidades",
        "Agendamento real: busca vagas no Google Calendar via List Messages do WhatsApp e agenda sem intervenção humana",
        "Sistema Anti-Faltas: detecta consultas vindouras e envia lembretes 24h e 1h antes",
        "Notificações Assíncronas: dispara e-mails para a secretaria a cada nova marcação",
        "Filtro LGPD: bloqueio nativo do processamento de mídias (fotos/áudios/vídeos) enviados pelo paciente",
      ],
      techList: ["Python 3.13", "FastAPI", "MySQL 8.0", "SQLAlchemy", "Meta WhatsApp Cloud API", "Google Calendar API", "SMTP", "APScheduler"],
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "chatbot-barbearia",
    title: "Chatbot Recepcionista — Barbearias",
    description: "Recepcionista digital com IA via NVIDIA Llama 3.1 70B para WhatsApp, adaptável para qualquer barbearia.",
    image: "/projects/bot-barbearia.png",
    repoUrl: "https://github.com/OtavioAugustoSS/chatbot-barbearia",
    technologies: [
      { name: "Python",   slug: "python" },
      { name: "FastAPI",  slug: "fastapi" },
      { name: "MySQL",    slug: "mysql" },
      { name: "NVIDIA",   slug: "nvidia" },
    ],
    details: {
      overview:
        "Recepcionista digital com IA integrada ao WhatsApp para barbearias. Usa NVIDIA Llama 3.1 70B para entender linguagem natural e MySQL como base de conhecimento, garantindo respostas precisas sobre preços, horários e barbeiros sem alucinação. Arquitetura modular pensada para ser adaptada a qualquer barbearia, trocando apenas a base de dados.",
      howItWorks: [
        "Cliente envia mensagem no WhatsApp; bot interpreta a intenção via NVIDIA Llama 3.1 70B",
        "Para informações operacionais (preços, horários, barbeiros), consulta MySQL antes de responder, eliminando alucinação da IA",
        "Pedidos de agendamento são roteados para sistema externo de booking (ex: AppBarber)",
        "Suporte a handoff humano: estado da conversa é gerenciado em banco para desativar o bot quando atendente assume",
        "Sistema de comandos administrativos para gerenciar e resetar estados durante operação",
      ],
      techList: ["Python", "FastAPI", "MySQL", "NVIDIA Llama 3.1 70B API", "Meta WhatsApp Cloud API"],
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "erp-cloud",
    title: "ERP Cloud — Gestão de Gráfica",
    description: "Sistema ERP moderno para gestão de clientes, pedidos e estoque de uma empresa de comunicação visual.",
    image: "/projects/erp-dru.png",
    repoUrl: "https://github.com/OtavioAugustoSS/ERP-Cloud-DruSign",
    technologies: [
      { name: "TypeScript",  slug: "typescript" },
      { name: "MySQL",       slug: "mysql" },
      { name: "HTML5",       slug: "html5" },
      { name: "JavaScript",  slug: "javascript" },
    ],
    details: {
      overview:
        "ERP Cloud desenvolvido para a Dru Sign, empresa de comunicação visual. Centraliza pedidos, estoque, fluxo financeiro, orçamentos e ordens de serviço.",
      howItWorks: [
        "Gestão avançada de clientes (CRM) e pedidos com pipeline de produção detalhado em etapas.",
        "Ferramentas específicas para comunicação visual, incluindo precificação por m² e verificação de arquivos.",
        "Dashboard industrial com métricas em tempo real, sistema de notificações automáticas e chat interno.",
      ],
      techList: ["TypeScript", "JavaScript", "HTML", "MySQL", "CSS"],
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "participa-df",
    title: "Participa DF — Ouvidoria GovTech",
    description: "Plataforma PWA de ouvidoria governamental com IA, acessível offline e sem instalação.",
    image: "/projects/ouvidoria.png",
    repoUrl: "https://github.com/OtavioAugustoSS/Hackathon_DF_Ouvidoria",
    technologies: [
      { name: "React",       slug: "react" },
      { name: "TypeScript",  slug: "typescript" },
      { name: "Python",      slug: "python" },
      { name: "CSS3",        slug: "css" },
    ],
    details: {
      overview:
        "Plataforma de ouvidoria governamental construída como PWA para desburocratização das demandas dos cidadãos. Funciona offline e em redes instáveis, sem necessidade de instalação, e usa IA para processar as solicitações.",
      howItWorks: [
        "Funciona como PWA: acessível offline e em redes instáveis sem instalação",
        "Cidadão registra demanda via interface web simples",
        "IA processa e categoriza a solicitação automaticamente",
        "Notificação e acompanhamento do status da demanda em tempo real",
      ],
      techList: ["React.js", "TypeScript", "CSS", "Python", "PWA (Service Workers)"],
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "raiztech-iot",
    title: "Painel IoT — RaizTech Agronegócio",
    description: "Dashboard para monitoramento de irrigadores inteligentes com dados em tempo real de umidade e temperatura.",
    image: "/projects/painel-raiztech.jpg",
    repoUrl: "https://github.com/OtavioAugustoSS/Painel-de-controle-raiztech",
    technologies: [
      { name: "TypeScript",  slug: "typescript" },
      { name: "JavaScript",  slug: "javascript" },
      { name: "MySQL",       slug: "mysql" },
      { name: "HTML5",       slug: "html5" },
    ],
    details: {
      overview:
        "Dashboard IoT para cruzamento de dados de irrigadores inteligentes no agronegócio. Monitora em tempo real a umidade do solo, temperatura, nível de irrigação e eficiência hídrica, reduzindo desperdícios com cálculos inteligentes.",
      howItWorks: [
        "Recebe dados dos sensores IoT dos irrigadores em tempo real",
        "Processa e exibe umidade do solo, temperatura e nível de irrigação",
        "Calcula eficiência hídrica e gera alertas de desperdício",
        "Painel com gráficos históricos e comparativos por zona de irrigação",
      ],
      techList: ["TypeScript", "JavaScript", "MySQL", "HTML", "CSS", "IoT Sensors API"],
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "portfolio",
    title: "Portfólio Pessoal",
    description: "Este portfólio — Next.js 16, Framer Motion e assistente de IA interativo integrado.",
    image: "/projects/portfolio-v2.png",
    repoUrl: "https://github.com/OtavioAugustoSS/portifolio-otavio",
    technologies: [
      { name: "Next.js",       slug: "nextdotjs/white" },
      { name: "TypeScript",    slug: "typescript" },
      { name: "Tailwind CSS",  slug: "tailwindcss" },
      { name: "Framer Motion", slug: "framer" },
    ],
    details: {
      overview:
        "Portfólio construído por mim, com design bento-grid, animações fluidas e um assistente de IA integrado que responde perguntas sobre meu perfil em linguagem natural.",
      howItWorks: [
        "Layout bento-grid interativo com revelação de fotos ao hover em cada seção do Sobre Mim",
        "Globo 3D animado exibindo o tech stack em CSS puro (Fibonacci sphere, sem Three.js)",
        "Chat IA usando NVIDIA NIM com contexto gerado automaticamente a partir dos dados do site",
        "Seção de projetos com modal de detalhes e carrossel de tecnologias",
      ],
      techList: ["Next.js 16 (App Router)", "TypeScript", "Tailwind CSS", "Framer Motion", "NVIDIA NIM API", "CSS 3D Transforms"],
    },
  },
];
