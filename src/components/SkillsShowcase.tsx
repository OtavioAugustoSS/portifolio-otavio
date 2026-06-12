"use client";

import { useState } from "react";
import SkillGlobe from "@/components/SkillGlobe";
import SkillList from "@/components/SkillList";

/**
 * Dono do estado de spotlight compartilhado entre globo e lista:
 * hover numa pill acende o ícone no globo (e pausa a rotação);
 * hover num ícone do globo acende a pill correspondente.
 */
export default function SkillsShowcase() {
  const [spotlight, setSpotlight] = useState<string | null>(null);

  return (
    <>
      <div className="w-full flex justify-center z-20 mt-6">
        <SkillGlobe spotlightId={spotlight} onHoverSkill={setSpotlight} />
      </div>

      <div className="w-full z-20 mt-10">
        <SkillList spotlightId={spotlight} onHoverSkill={setSpotlight} />
      </div>
    </>
  );
}
