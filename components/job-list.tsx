'use client';

import { JobCard } from './job-card';
import type { OffreEmploi } from '@/types/database';
import { SearchX } from 'lucide-react';

interface JobListProps {
  offres: OffreEmploi[];
}

export function JobList({ offres }: JobListProps) {
  if (offres.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-bg-elevated)] mb-4">
          <SearchX className="h-8 w-8 text-[var(--color-text-muted)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">
          Aucune offre trouvée
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] max-w-sm">
          Essayez de modifier vos filtres ou votre recherche pour trouver des opportunités.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {offres.map((offre, index) => (
        <JobCard key={offre.id} offre={offre} index={index} />
      ))}
    </div>
  );
}
