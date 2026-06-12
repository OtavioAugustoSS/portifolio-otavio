"use client";

import { motion } from "framer-motion";
import { skillCategories, type ListSkill as Skill } from "@/data/skills";
import { getSkillUsage, isFeatured } from "@/lib/skill-usage";

export type SkillListProps = {
  /** Skill em destaque (controlado pelo SkillsShowcase — pode vir do globo) */
  spotlightId?: string | null;
  onHoverSkill?: (id: string | null) => void;
};

export default function SkillList({ spotlightId = null, onHoverSkill }: SkillListProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col gap-12">
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
          <h3 className="font-mono text-xs tracking-widest uppercase text-zinc-500">
            {category.title}
          </h3>

          <div className="flex flex-wrap gap-4">
            {category.skills.map((skill) => (
              <SkillCard
                key={skill.name}
                skill={skill}
                spotlighted={spotlightId === skill.id}
                onHoverSkill={onHoverSkill}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SkillCard({
  skill,
  spotlighted,
  onHoverSkill,
}: {
  skill: Skill;
  spotlighted: boolean;
  onHoverSkill?: (id: string | null) => void;
}) {
  const usage = getSkillUsage(skill.id);
  const featured = isFeatured(skill.id);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.35, ease: "easeOut" } },
      }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseEnter={() => onHoverSkill?.(skill.id)}
      onMouseLeave={() => onHoverSkill?.(null)}
      className="group relative flex items-center gap-3 px-5 py-2.5 bg-[#121212]/80 backdrop-blur-md border border-[#2b2b2b] rounded-xl cursor-default transition-colors duration-300"
      style={
        {
          "--brand": skill.color,
        } as React.CSSProperties
      }
    >
      {/* Glow colorido em hover OU quando o globo destaca esta skill */}
      <div
        className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
          spotlighted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
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

      {/* Uso real: featured sempre visível, demais só no hover */}
      {usage.count > 0 && (
        <span
          className={`relative z-10 font-mono text-[10px] text-zinc-500 transition-opacity duration-200 ${
            featured || spotlighted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {usage.count} {usage.count > 1 ? "projetos" : "projeto"}
        </span>
      )}
    </motion.div>
  );
}
