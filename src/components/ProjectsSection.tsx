"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ArrowUpRight } from "lucide-react";

// SVG inline do GitHub
const GithubIcon = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"/>
    <path d="M9 18c-4.5 1.6-5-2.8-5-2.8"/>
  </svg>
);

// ═════════════════════════════════════════════════════════════════════════════
//  DADOS DOS PROJETOS
//  ► Para adicionar um projeto, crie um novo objeto no array abaixo.
//  ► Imagens ficam em: /public/projects/nome.png
//  ► Cada projeto tem um campo "repoUrl" com o link do GitHub.
// ═════════════════════════════════════════════════════════════════════════════
const projects: Project[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "assistente-pessoal",
    title: "Assistente Pessoal IA — WhatsApp",
    description: "Agente inteligente para WhatsApp com NLP, gerenciamento de agendas e notificações via APScheduler.",
    image: "/projects/botWhats.png", 
    repoUrl: "https://github.com/OtavioAugustoSS/Wpp-Scheduler-Bot", 
    technologies: [
      { name: "Python",     slug: "python" },
      { name: "FastAPI",    slug: "fastapi" },
      { name: "Docker",     slug: "docker" },
      { name: "SQLite",     slug: "sqlite" },
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
    image: "/projects/botWhats.png", 
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
    image: "/projects/botWhats.png", 
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
      { name: "Next.js",       slug: "nextdotjs" },
      { name: "TypeScript",    slug: "typescript" },
      { name: "Tailwind CSS",  slug: "tailwindcss" },
      { name: "Framer Motion", slug: "framer" },
    ],
    details: {
      overview:
        "Portfólio construído por mim, com design bento-grid, animações fluidas e um assistente de IA integrado que responde perguntas sobre meu perfil em linguagem natural.",
      howItWorks: [
        "Layout bento-grid interativo com revelação de fotos ao hover em cada seção do Sobre Mim",
        "Globo 3D animado exibindo o tech stack com Three.js / React Three Fiber",
        "Chat IA usando NVIDIA NIM (Llama 3.1) com contexto personalizado do portfólio",
        "Seção de projetos com modal de detalhes e carrossel de tecnologias",
      ],
      techList: ["Next.js 16 (App Router)", "TypeScript", "Tailwind CSS", "Framer Motion", "NVIDIA NIM API", "Three.js / React Three Fiber"],
    },
  },
];

// ─── Tipo do projeto ──────────────────────────────────────────────────────────
type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  repoUrl: string;
  technologies: { name: string; slug: string }[];
  details: { overview: string; howItWorks: string[]; techList: string[] };
};

// ═════════════════════════════════════════════════════════════════════════════
//  SEÇÃO PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════
export default function ProjectsSection() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onDetails={() => setSelected(project)}
            />
          ))}
        </div>
      </div>

      {/* Portal: modal renderizado direto no body para evitar z-index issues */}
      {mounted && selected && createPortal(
        <AnimatePresence>
          <ProjectModal project={selected} onClose={() => setSelected(null)} />
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  CARD DE PROJETO
// ═════════════════════════════════════════════════════════════════════════════
function ProjectCard({ project, index, onDetails }: { project: Project; index: number; onDetails: () => void }) {
  const [imgHovered, setImgHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
      className="flex flex-col rounded-2xl border border-white/8 bg-[#0d0d13] overflow-hidden"
    >
      {/* Imagem com blur + botão ao hover */}
      <div
        className="relative h-52 w-full overflow-hidden bg-[#111119] cursor-pointer"
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
        onClick={onDetails}
      >
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className={`object-cover object-center transition-all duration-300 ${imgHovered ? "scale-105 blur-sm brightness-50" : ""}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${imgHovered ? "blur-sm brightness-50" : ""}`}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, rgba(139,92,246,0.4) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center">
                <span className="text-xl text-primary">⬡</span>
              </div>
              <p className="text-[10px] text-zinc-600 tracking-widest uppercase">screenshot</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d13]/70 via-transparent to-transparent pointer-events-none" />

        <AnimatePresence>
          {imgHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <span className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold tracking-wide shadow-[0_0_24px_rgba(139,92,246,0.6)]">
                Ver Detalhes
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ícones das tecnologias (cores originais) */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5">
        {project.technologies.map((tech) => (
          <img key={tech.slug} src={`https://cdn.simpleicons.org/${tech.slug}`} width={18} height={18} alt={tech.name} title={tech.name} loading="lazy" />
        ))}
      </div>

      {/* Texto */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-5 gap-3">
        <h3 className="text-[15px] font-bold text-white leading-snug tracking-tight">{project.title}</h3>
        <p className="text-[13px] text-zinc-400 leading-relaxed flex-1">{project.description}</p>
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex items-center justify-center gap-2.5 w-full py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 text-[13px] font-medium hover:border-primary/40 hover:text-white hover:bg-primary/10 transition-all duration-200"
        >
          <GithubIcon size={15} />
          GitHub
        </a>
      </div>
    </motion.article>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  MODAL DE DETALHES (renderizado via createPortal no body)
// ═════════════════════════════════════════════════════════════════════════════
function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  // Fechar com ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Bloquear scroll do body enquanto modal aberto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Painel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d13] shadow-2xl flex flex-col [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {project.technologies.slice(0, 5).map((tech) => (
                  <img key={tech.slug} src={`https://cdn.simpleicons.org/${tech.slug}`} width={15} height={15} alt={tech.name} title={tech.name} loading="lazy" />
                ))}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight leading-snug">{project.title}</h2>
              <div className="h-px w-10 bg-primary/60 mt-2" />
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all shrink-0 mt-0.5 ml-4"
            >
              <X size={15} />
            </button>
          </div>

          {/* Imagem (se existir) */}
          {project.image && (
            <div className="relative h-44 w-full shrink-0">
              <Image src={project.image} alt={project.title} fill className="object-cover" sizes="512px" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d13] via-transparent to-transparent" />
            </div>
          )}

          {/* Corpo */}
          <div className="flex flex-col gap-6 p-6">
            <div>
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-2">Sobre o Projeto</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">{project.details.overview}</p>
            </div>

            <div>
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-3">Como Funciona</h3>
              <ul className="flex flex-col gap-2.5">
                {project.details.howItWorks.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
                    <span className="text-sm text-zinc-300 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-3">Tecnologias Utilizadas</h3>
              <div className="flex flex-wrap gap-2">
                {project.details.techList.map((tech) => (
                  <span key={tech} className="text-[11px] px-2.5 py-1 rounded-md border border-white/10 bg-white/5 text-zinc-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl border border-primary/40 bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 hover:border-primary/60 transition-all duration-200 group"
            >
              <GithubIcon size={16} />
              Ver no GitHub
              <ArrowUpRight size={14} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </motion.div>
    </>
  );
}
