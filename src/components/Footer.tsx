import { PROFILE } from "@/data/profile";
import { GithubIcon, LinkedinIcon, WorkanaIcon, MailIcon } from "@/components/icons";

export default function Footer() {
  const { contacts } = PROFILE;

  return (
    <footer id="contato" className="relative z-10 border-t border-white/5 bg-black/70 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Vamos construir algo juntos?
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Aberto a estágios, projetos freelancer e colaborações. A resposta mais
            rápida é pelo e-mail.
          </p>
        </div>

        <a
          href={`mailto:${contacts.email}`}
          className="group flex items-center gap-3 px-6 py-3.5 rounded-full bg-primary/10 border border-primary/40 text-primary font-semibold text-sm hover:bg-primary/20 hover:border-primary/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <MailIcon size={17} />
          {contacts.email}
        </a>

        <div className="flex items-center gap-4">
          <a href={contacts.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-2.5 text-zinc-400 hover:text-white border border-white/10 rounded-full hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            <GithubIcon size={18} />
          </a>
          <a href={contacts.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2.5 text-zinc-400 hover:text-white border border-white/10 rounded-full hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            <LinkedinIcon size={18} />
          </a>
          <a href={contacts.workana} target="_blank" rel="noopener noreferrer" aria-label="Workana" className="p-2.5 text-zinc-400 hover:text-white border border-white/10 rounded-full hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            <WorkanaIcon size={18} />
          </a>
        </div>

        <div className="flex flex-col gap-1 pt-4 border-t border-white/5 w-full max-w-xs">
          <p className="text-xs text-zinc-500">
            {PROFILE.name} · {PROFILE.location.city}
          </p>
          <p className="text-[11px] text-zinc-600">
            Next.js, Tailwind e uma IA que conhece este site melhor que eu.
          </p>
        </div>
      </div>
    </footer>
  );
}
