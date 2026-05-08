"use client";

import { motion } from "framer-motion";

type Skill = {
  name: string;
  slug: string;
  color: string;
  customIcon?: string;
};

const skillCategories: { title: string; skills: Skill[] }[] = [
  {
    title: "Linguagens",
    skills: [
      { name: "Java",       slug: "java",       color: "#ED8B00", customIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" },
      { name: "Python",     slug: "python",     color: "#3776AB" },
      { name: "JavaScript", slug: "javascript", color: "#F7DF1E" },
      { name: "TypeScript", slug: "typescript", color: "#3178C6" },
      { name: "PHP",        slug: "php",        color: "#777BB4" },
      { name: "SQL",        slug: "mysql",      color: "#4479A1" },
      { name: "C",          slug: "c",          color: "#A8B9CC", customIcon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg" },
    ],
  },
  {
    title: "Bibliotecas e Frameworks",
    skills: [
      { name: "React.js",      slug: "react",       color: "#61DAFB" },
      { name: "Next.js",       slug: "nextdotjs",   color: "#FFFFFF" },
      { name: "Node.js",       slug: "nodedotjs",   color: "#5FA04E" },
      { name: "Tailwind CSS",  slug: "tailwindcss", color: "#06B6D4" },
      { name: "Framer Motion", slug: "framer",      color: "#0055FF" },
      { name: "FastAPI",       slug: "fastapi",     color: "#009688" },
    ],
  },
  {
    title: "Banco de Dados e Ferramentas",
    skills: [
      { name: "MySQL",      slug: "mysql",       color: "#4479A1" },
      { name: "PostgreSQL", slug: "postgresql",  color: "#4169E1" },
      { name: "SQLite",     slug: "sqlite",      color: "#003B57" },
      { name: "Selenium",   slug: "selenium",    color: "#43B02A" },
      { name: "Git",        slug: "git",         color: "#F05032" },
      { name: "Docker",     slug: "docker",      color: "#2496ED" },
      { name: "WordPress",  slug: "wordpress",   color: "#21759B" },
    ],
  },
];

export default function SkillList() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-20 px-4 flex flex-col gap-12">
      {skillCategories.map((category) => (
        <motion.div
          key={category.title}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.06, delayChildren: 0.15 },
            },
          }}
          className="flex flex-col gap-5"
        >
          <h3 className="text-zinc-300 font-semibold text-lg border-b border-white/5 pb-3">
            {category.title}
          </h3>

          <div className="flex flex-wrap gap-4">
            {category.skills.map((skill) => (
              <SkillCard key={skill.name} skill={skill} />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.35, ease: "easeOut" } },
      }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex items-center gap-3 px-5 py-2.5 bg-[#121212]/80 backdrop-blur-md border border-[#2b2b2b] rounded-xl cursor-default transition-colors duration-300"
      style={
        {
          "--brand": skill.color,
        } as React.CSSProperties
      }
    >
      {/* Glow colorido sutil em hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `0 0 18px ${skill.color}30, inset 0 0 0 1px ${skill.color}55`,
        }}
      />

      <img
        src={skill.customIcon || `https://cdn.simpleicons.org/${skill.slug}`}
        alt={skill.name}
        width={22}
        height={22}
        loading="lazy"
        draggable={false}
        className="relative z-10 drop-shadow-sm"
      />
      <span className="relative z-10 text-sm font-medium text-white/90 group-hover:text-white transition-colors">
        {skill.name}
      </span>
    </motion.div>
  );
}
