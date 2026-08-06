'use client';

import Link from 'next/link';
import { MapPin, Building2, Clock, Pin, Briefcase, Globe } from 'lucide-react';
import { cn, getTimeBadge, truncateText } from '@/lib/utils';
import type { OffreEmploi } from '@/types/database';
import { CATEGORIE_COLORS, CONTRAT_COLORS } from '@/lib/constants';
import type { Categorie, TypeContrat } from '@/lib/constants';

interface JobCardProps {
  offre: OffreEmploi;
  index?: number;
}

export function JobCard({ offre, index = 0 }: JobCardProps) {
  const timeBadge = getTimeBadge(offre.created_at);

  return (
    <Link
      href={`/offre/${offre.id}`}
      className={cn(
        'job-card group block rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 sm:p-5',
        'animate-fade-in-up',
        offre.est_epingle && 'pinned-border'
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Ligne 1 : Badge épinglé + badge temporel */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {offre.est_epingle && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
              <Pin className="h-3 w-3" />
              À la une
            </span>
          )}
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
              timeBadge.variant === 'fresh' &&
                'bg-emerald-500/10 text-emerald-600 animate-subtle-pulse',
              timeBadge.variant === 'recent' &&
                'bg-blue-500/10 text-blue-600',
              timeBadge.variant === 'normal' &&
                'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]',
              timeBadge.variant === 'old' &&
                'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
            )}
          >
            <Clock className="h-3 w-3" />
            {timeBadge.text}
          </span>
        </div>
      </div>

      {/* Ligne 2 : Titre */}
      <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors leading-snug mb-2">
        {offre.titre}
      </h3>

      {/* Ligne 3 : Entreprise • Ville • Contrat */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-sm text-[var(--color-text-secondary)] mb-3">
        <span className="inline-flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          {offre.entreprise}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          {offre.ville}
        </span>
      </div>

      {/* Ligne 4 : Description tronquée */}
      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-3 line-clamp-2">
        {truncateText(offre.description, 150)}
      </p>

      {/* Ligne 5 : Tags catégorie + contrat + niveau + langue */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Catégorie */}
        <span
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-white"
          style={{
            backgroundColor:
              CATEGORIE_COLORS[offre.categorie as Categorie] || '#6b7280',
          }}
        >
          <Briefcase className="h-3 w-3" />
          {offre.categorie}
        </span>

        {/* Type de contrat */}
        <span
          className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
          style={{
            backgroundColor:
              CONTRAT_COLORS[offre.type_contrat as TypeContrat] || '#6b7280',
          }}
        >
          {offre.type_contrat}
        </span>

        {/* Niveau */}
        {offre.niveau_experience && offre.niveau_experience !== 'Non spécifié' && (
          <span className="inline-flex items-center rounded-lg bg-[var(--color-bg-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
            {offre.niveau_experience}
          </span>
        )}

        {/* Langues */}
        {offre.langues && offre.langues !== 'Français' && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-bg-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
            <Globe className="h-3 w-3" />
            {offre.langues}
          </span>
        )}
      </div>
    </Link>
  );
}
