import "./globals.css";
import Navbar from "@/components/Navbar";
import { BlackHoleBackground } from "@/components/BlackHoleBackground";

export const metadata = {
  title: "Otavio Augusto • Software Engineer",
  description: "Construindo uma nova versão épica.",
};

import { TabEffect } from "@/components/TabEffect";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased bg-black text-foreground min-h-screen">
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
