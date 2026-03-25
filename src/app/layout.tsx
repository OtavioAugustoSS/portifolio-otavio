import "./globals.css";
import Navbar from "@/components/Navbar";
import { BlackHoleBackground } from "@/components/BlackHoleBackground";

export const metadata = {
  title: "Otávio Augusto - Portfolio v2",
  description: "Construindo uma nova versão épica.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased bg-black text-foreground min-h-screen">
        <Navbar />
        <BlackHoleBackground />
        <main className="relative z-10 flex-grow pt-24">
          {children}
        </main>
      </body>
    </html>
  );
}
