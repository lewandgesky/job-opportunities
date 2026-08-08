import Link from 'next/link';
import { Briefcase, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          {/* Logo & tagline */}
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
                <img src="/logo.jpg" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <span className="text-sm font-bold gradient-text">
                job-opportunities.cm
              </span>
            </Link>
            <p className="text-xs text-[var(--color-text-muted)] max-w-xs">
              La plateforme gratuite pour trouver un emploi, un stage ou une mission freelance au Cameroun.
            </p>
          </div>

          {/* Liens utiles */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[var(--color-text-secondary)]">
            <a
              href="https://wa.me/237000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--color-primary)]"
            >
              Nous contacter
            </a>
            <Link
              href="#"
              className="transition-colors hover:text-[var(--color-primary)]"
            >
              Gérer mes alertes
            </Link>
          </div>
        </div>

        {/* Divider + copyright */}
        <div className="mt-6 border-t border-[var(--color-border-light)] pt-4 text-center">
          <p className="text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1">
            © {new Date().getFullYear()} job-opportunities.cm — Fait avec{' '}
            <Heart className="h-3 w-3 text-red-500 inline" /> au Cameroun 🇨🇲
          </p>
        </div>
      </div>
    </footer>
  );
}
