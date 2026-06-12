# PRODUCT.md — Portfólio Otavio Augusto

## O que é

Portfólio pessoal single-page de **Otavio Augusto** (Desenvolvedor Full Stack, Brasília-DF): hero com chat de IA que responde sobre ele, bento-grid "Sobre Mim", globo 3D de skills em CSS puro, grade de projetos com modal e footer de contato. Conteúdo 100% em PT-BR. Hospedado na Vercel.

## Público e objetivo

Recrutadores, clientes freelance (Workana) e colegas de tecnologia. Objetivo: demonstrar capacidade técnica real (a IA integrada É a demo) e converter visitas em contato (e-mail no footer).

## Register

`brand` — o design é o produto. Identidade: dark espacial (vídeo de buraco negro), roxo/violeta (#a855f7 primária, #8b5cf6 em superfícies), glassmorphism contido, animações Framer Motion com spring suave.

## Diferencial técnico

O chat de IA (NVIDIA NIM, streaming) tem o contexto **gerado automaticamente dos mesmos dados que renderizam o site** (`src/data/*`): projetos, skills e perfil têm fonte única. A IA também navega a página (tags `[[goto:...]]` / `[[projeto:<id>]]` viram chips de ação que rolam até seções e abrem modais).

## Decisões de produto

- Uma página só; navegação por âncoras com scroll-spy.
- Chat é a peça central do hero, com estado de boas-vindas e sugestões.
- Cards de projeto com capas únicas (programáticas, família visual do site).
- Acessibilidade: `prefers-reduced-motion` respeitado (Framer + vídeo), foco visível, toque substitui hover onde importa.
