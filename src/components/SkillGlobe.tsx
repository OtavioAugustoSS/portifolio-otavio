"use client";

import { fetchSimpleIcons, renderSimpleIcon } from "react-icon-cloud";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Cloud = dynamic(() => import("react-icon-cloud").then((mod) => mod.Cloud), { ssr: false });

const cloudProps = {
  containerProps: {
    style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
    },
  },
  options: {
    reverse: true,
    depth: 1.2, // Exagerando o motor de 3D nativo do Canvas
    wheelZoom: false,
    imageScale: 2, 
    activeCursor: "default",
    tooltip: "none", 
    initial: [0.70, -0.70], // Auto-rotação contínua e visível (era 0.015 que parava)
    radiusX: 0.8, // Encolhe a órbita em 20% criando padding interno p/ não cortar ícones na borda
    radiusY: 0.8,
    radiusZ: 0.8,
    clickToFront: 500,
    dragControl: true, 
    decel: 0.99, // Freio muito suave: o globo perde velocidade lentamente após soltar o mouse
    maxSpeed: 0.003, // Limite baixo para arrastar suavemente sem girar como tornado
    minSpeed: 0.04, // Mantém a rotação contínua mesmo após parar o arrasto
    outlineColour: "transparent",
    imageMode: "both", 
    imagePosition: "top",
    imagePadding: 4,
    textColour: "rgba(255, 255, 255, 0.6)", 
    textHeight: 12,
    textFont: "Inter, sans-serif",
    weight: true, 
    weightMode: "size",
    frontSelect: true,
    shape: "sphere"
  },
};

const iconSlugs = [
  "python", "javascript", "mysql", "postgresql", "sqlite",
  "typescript", "css3", "html5", "selenium", "php",
  "wordpress", "woocommerce", "react", "nodedotjs",
  "github", "git"
];

export default function SkillGlobe() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchSimpleIcons({ slugs: iconSlugs }).then(setData);
  }, []);

  const renderCustomIcon = (icon: any) => {
    // Voltando pra exata arquitetura que você amou onde as logomarcas não perdem a cor oficial 
    const bgHex = "#080510"; 
    const fallbackHex = "#ffffff";
    const minContrastRatio = 2; 

    const nativeReactNode = renderSimpleIcon({
      icon,
      bgHex,
      fallbackHex,
      minContrastRatio,
      size: 48, 
      aProps: {
        href: undefined,
        target: undefined,
        rel: undefined,
        onClick: (e: any) => e.preventDefault(),
      },
    });

    return (
      <a key={icon.slug} href="#" onClick={(e) => e.preventDefault()} style={{pointerEvents: 'auto'}}>
        {nativeReactNode.props.children}
        <span style={{ fontWeight: 800 }}>{icon.title.toUpperCase()}</span>
      </a>
    );
  };

  if (!data) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="w-10 h-10 border-t-2 border-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center max-w-[500px] w-full aspect-square relative z-20">
      
      {/* 🔴 Núcleo 3D de Fundo para Profundidade */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

      {/* 🌐 Fundo da Esfera (Malha Wireframe ajustada perfeitamente na proporção da Órbita - Agora com 80% pra casar com o radiusY do Canvas) */}
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] opacity-[0.25] pointer-events-none text-purple-400" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.15" />
        <ellipse cx="50" cy="50" rx="49" ry="35" fill="none" stroke="currentColor" strokeWidth="0.15" />
        <ellipse cx="50" cy="50" rx="49" ry="20" fill="none" stroke="currentColor" strokeWidth="0.15" />
        <ellipse cx="50" cy="50" rx="49" ry="5" fill="none" stroke="currentColor" strokeWidth="0.15" />
        <ellipse cx="50" cy="50" rx="35" ry="49" fill="none" stroke="currentColor" strokeWidth="0.15" />
        <ellipse cx="50" cy="50" rx="20" ry="49" fill="none" stroke="currentColor" strokeWidth="0.15" />
        <ellipse cx="50" cy="50" rx="5" ry="49" fill="none" stroke="currentColor" strokeWidth="0.15" />
      </svg>

      <div className="relative w-full h-full flex items-center justify-center">
        {/* @ts-ignore */}
        <Cloud {...cloudProps}>
          {Object.values(data.simpleIcons).filter(Boolean).map((icon: any) =>
            renderCustomIcon(icon)
          )}
        </Cloud>
      </div>
    </div>
  );
}
