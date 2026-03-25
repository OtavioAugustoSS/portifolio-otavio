"use client";

import { motion } from "framer-motion";

const skillCategories = [
  {
    title: "Linguagens",
    skills: [
      { name: "Python", slug: "python" },
      { name: "JavaScript", slug: "javascript" },
      { name: "TypeScript", slug: "typescript" },
      { name: "PHP", slug: "php" },
      { name: "SQL", slug: "mysql" },
    ]
  },
  {
    title: "Bibliotecas e Frameworks",
    skills: [
      { name: "React.js", slug: "react" },
      { name: "Next.js", slug: "nextdotjs" },
      { name: "Node.js", slug: "nodedotjs" },
      { name: "Tailwind CSS", slug: "tailwindcss" },
      { name: "Framer Motion", slug: "framer" },
    ]
  },
  {
    title: "Banco de Dados e Ferramentas",
    skills: [
      { name: "MySQL", slug: "mysql" },
      { name: "PostgreSQL", slug: "postgresql" },
      { name: "SQLite", slug: "sqlite" },
      { name: "Selenium", slug: "selenium" },
      { name: "Git", slug: "git" },
      { name: "Docker", slug: "docker" },
      { name: "WordPress", slug: "wordpress" },
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "tween", 
      duration: 0.4, 
      ease: "easeOut" 
    } 
  }
};

export default function SkillList() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-20 px-4 flex flex-col gap-12">
      {skillCategories.map((category) => (
        <motion.div 
          key={category.title}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col gap-5"
        >
          {/* Estética de Títulos Puros e Sublinhados Escuros clássico Tech */}
          <h3 className="text-zinc-300 font-semibold text-lg border-b border-white/5 pb-3">
            {category.title}
          </h3>
          
          <motion.div 
            variants={containerVariants}
            className="flex flex-wrap gap-4"
          >
            {category.skills.map((skill) => (
              <motion.div
                key={skill.name}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 px-5 py-2.5 bg-[#121212]/80 backdrop-blur-md border border-[#2b2b2b] rounded-xl hover:border-white/20 transition-all cursor-default shadow-[0_0_15px_rgba(0,0,0,0.4)] hover:shadow-primary/10"
              >
                {/* 
                  Arquitetura CDN Direta: 
                  Usamos o CDN do Simple Icons que já retorna o SVG colorido por padrão.
                  Isso evita problemas de inversão de cores e simplifica o componente.
                */}
                <img 
                  src={`https://cdn.simpleicons.org/${skill.slug}`} 
                  width={22} 
                  height={22} 
                  alt={skill.name} 
                  loading="lazy"
                  className="drop-shadow-sm"
                />
                <span className="text-sm font-medium text-white/90">{skill.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
