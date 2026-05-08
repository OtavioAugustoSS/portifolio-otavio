"use client";

import { useEffect, useRef } from "react";
import { SITE_TITLE } from "@/data/site";

export function TabEffect() {
  const focusIdRef = useRef(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      document.title = SITE_TITLE;
      return;
    }

    const initialTypingSpeed = 100;
    const blurTypingSpeed = 80;
    const eraseSpeed = 50;

    const typeTitle = async (currentFocusId: number) => {
      await new Promise((r) => setTimeout(r, 800));
      if (document.hidden || currentFocusId !== focusIdRef.current) return;

      document.title = "";

      for (let i = 1; i <= SITE_TITLE.length; i += 2) {
        if (document.hidden || currentFocusId !== focusIdRef.current) return;
        document.title = SITE_TITLE.substring(0, Math.min(i, SITE_TITLE.length)) + " |";
        await new Promise((r) => setTimeout(r, initialTypingSpeed));
      }
      if (currentFocusId === focusIdRef.current && !document.hidden) {
        document.title = SITE_TITLE;
      }
    };

    const blurMessages = [
      "</> Ausente...",
      "Aguardando retorno </>",
      "Volte logo!",
      "Dá mais uma olhada"
    ];

    const runBlurLoop = async (currentFocusId: number) => {
      let index = 0;

      while (currentFocusId === focusIdRef.current && document.hidden) {
        const text = blurMessages[index];

        for (let i = 1; i <= text.length; i += 4) {
          if (currentFocusId !== focusIdRef.current || !document.hidden) return;
          document.title = text.substring(0, Math.min(i, text.length)) + " |";
          await new Promise((r) => setTimeout(r, blurTypingSpeed));
        }

        if (currentFocusId !== focusIdRef.current || !document.hidden) return;
        document.title = text;

        await new Promise((r) => setTimeout(r, 4000));

        if (currentFocusId !== focusIdRef.current || !document.hidden) return;

        for (let i = text.length; i >= 0; i -= 4) {
          if (currentFocusId !== focusIdRef.current || !document.hidden) return;
          document.title = text.substring(0, Math.max(i, 0)) + " |";
          await new Promise((r) => setTimeout(r, eraseSpeed));
        }

        index = (index + 1) % blurMessages.length;
      }
    };

    const handleVisibilityChange = () => {
      focusIdRef.current++;
      if (document.hidden) {
        document.title = "";
        runBlurLoop(focusIdRef.current);
      } else {
        document.title = SITE_TITLE;
      }
    };

    focusIdRef.current++;
    typeTitle(focusIdRef.current);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      focusIdRef.current++;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
