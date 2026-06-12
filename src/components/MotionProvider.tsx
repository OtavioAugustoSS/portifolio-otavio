"use client";

import { MotionConfig } from "framer-motion";

/**
 * Respeita prefers-reduced-motion globalmente: animações de transform do
 * Framer Motion viram transições instantâneas para quem ativou a preferência.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
