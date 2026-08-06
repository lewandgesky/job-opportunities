import Link from 'next/link';
import { Briefcase, MessageCircle } from 'lucide-react';

export function Header() {
  return (
    <header className="glass sticky top-0 z-50 border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] shadow-md transition-transform group-hover:scale-105">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight gradient-text">
              job-opportunities
            </span>
            <span className="text-[10px] font-medium text-[var(--color-text-muted)] leading-tight tracking-wide">
              .cm
            </span>
          </div>
        </Link>

        {/* CTA WhatsApp */}
        <a
          href="https://wa.me/237000000000?text=Bonjour%2C%20je%20souhaite%20d%C3%A9poser%20une%20offre%20d%27emploi%20sur%20job-opportunities.cm"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 hover:shadow-lg active:scale-[0.97]"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Déposer une offre</span>
          <span className="sm:hidden">Déposer</span>
        </a>
      </div>
    </header>
  );
}
