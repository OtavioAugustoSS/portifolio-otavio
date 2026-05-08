import type { Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { BlackHoleBackground } from "@/components/BlackHoleBackground";
import { TabEffect } from "@/components/TabEffect";
import { SITE_TITLE } from "@/data/site";

export const metadata = {
  title: SITE_TITLE,
  description: "Portfólio de Otavio Augusto — Desenvolvedor Full Stack.",
  openGraph: {
    title: SITE_TITLE,
    description: "Portfólio de Otavio Augusto — Desenvolvedor Full Stack.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050508",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased bg-black text-foreground min-h-screen flex flex-col">
        <TabEffect />
        <Navbar />
        <BlackHoleBackground />
        <main className="relative z-10 flex-grow pt-24">
          {children}
        </main>
      </body>
    </html>
  );
}
