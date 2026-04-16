"use client";

import { useEffect, useRef } from "react";

export function TabEffect() {
  const originalTitle = "Otavio Augusto • Software Engineer";
  const initialTypingSpeed = 100; // 100ms com saltos de 2 letras
  const blurTypingSpeed = 80;    
  const eraseSpeed = 50;  

  useEffect(() => {
    let focusId = 0; // Utilizado para interromper loops se a pessoa focar/desfocar a aba

    const typeTitle = async (currentFocusId: number) => {
      await new Promise((r) => setTimeout(r, 800)); // DELAY INICIAL 
      if (document.hidden || currentFocusId !== focusId) return;

      document.title = "";

      for (let i = 1; i <= originalTitle.length; i += 2) {
        if (document.hidden || currentFocusId !== focusId) return;
        const curIndex = Math.min(i, originalTitle.length);
        document.title = originalTitle.substring(0, curIndex) + " |";
        await new Promise((r) => setTimeout(r, initialTypingSpeed));
      }
      if (currentFocusId === focusId && !document.hidden) {
        document.title = originalTitle; // Fixa sem a barra
      }
    };

    // 1. Roda o script de apresentação quando o componente carrega a primeira vez
    focusId++;
    typeTitle(focusId);

    // 2. Loop de Mensagens e Animações Invisíveis (Blur)
    const blurMessages = [
      "</> Ausente...",
      "Aguardando retorno </>",
      "Volte logo!",
      "Dá mais uma olhada"
    ];

    const runBlurLoop = async (currentFocusId: number) => {
      let index = 0;

      while (currentFocusId === focusId && document.hidden) {
        const text = blurMessages[index];

        // TRUQUE: O navegador restringe o Javascript nativo a rodar apenas 1 vez por segundo (1000ms) em abas ausentes!
        // Para driblar isso e ficar "4x mais rápido", inserimos blocos de 4 letras de uma vez no título da aba.
        for (let i = 1; i <= text.length; i += 4) {
          if (currentFocusId !== focusId || !document.hidden) return;
          const curIndex = Math.min(i, text.length);
          document.title = text.substring(0, curIndex) + " |";
          await new Promise((r) => setTimeout(r, blurTypingSpeed));
        }

        if (currentFocusId !== focusId || !document.hidden) return;
        document.title = text; // Fixa sem barra

        // Pausa muito maior para o recrutador conseguir ler a frase parada
        await new Promise((r) => setTimeout(r, 4000));

        if (currentFocusId !== focusId || !document.hidden) return;

        // Efeito de Apagar a frase (Backspace) 4x mais rápido
        for (let i = text.length; i >= 0; i -= 4) {
          if (currentFocusId !== focusId || !document.hidden) return;
          const curIndex = Math.max(i, 0);
          document.title = text.substring(0, curIndex) + " |";
          await new Promise((r) => setTimeout(r, eraseSpeed));
        }

        index = (index + 1) % blurMessages.length;
      }
    };

    const handleVisibilityChange = () => {
      focusId++; // Ao focar ou desfocar, cancela as threads de loops pendentes incrementando o ID
      if (document.hidden) {
        document.title = "";
        runBlurLoop(focusId);
      } else {
        document.title = originalTitle; // Quando a pessoa bate os olhos na aba restaura na hora, ou faz a reescrita se desejar. Mas restaurar seco é mais limpo.
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      focusId++; // Paralisa qualquer execução ativa do setTimeout na limpeza
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
