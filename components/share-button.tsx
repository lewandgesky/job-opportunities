'use client';

import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // L'utilisateur a annulé le partage
      }
    } else {
      // Fallback: copier le lien dans le presse-papier
      try {
        await navigator.clipboard.writeText(url);
        alert('Lien copié !');
      } catch {
        // Fallback si le clipboard échoue aussi
        prompt('Copiez ce lien :', url);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      aria-label="Partager cette offre"
    >
      <Share2 className="h-4 w-4" />
      <span className="hidden sm:inline">Partager</span>
    </button>
  );
}
