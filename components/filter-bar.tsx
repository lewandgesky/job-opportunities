'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { SearchInput } from './search-input';
import { VILLES, CATEGORIES, TYPES_CONTRAT, CATEGORIE_ICONS } from '@/lib/constants';
import type { Categorie } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lire les filtres depuis l'URL
  const currentVille = searchParams.get('ville') || '';
  const currentCategorie = searchParams.get('categorie') || '';
  const currentContrat = searchParams.get('contrat') || '';
  const currentSearch = searchParams.get('search') || '';

  const hasActiveFilters =
    currentVille || currentCategorie || currentContrat || currentSearch;

  // Mettre à jour l'URL avec les nouveaux filtres
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const resetFilters = useCallback(() => {
    router.push('/', { scroll: false });
  }, [router]);

  // Compteur des filtres actifs
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (currentVille) count++;
    if (currentCategorie) count++;
    if (currentContrat) count++;
    if (currentSearch) count++;
    return count;
  }, [currentVille, currentCategorie, currentContrat, currentSearch]);

  return (
    <div className="glass sticky top-[57px] z-40 border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-4 py-3 space-y-3">
        {/* Ligne 1 : Recherche + Ville + Reset */}
        <div className="flex items-center gap-3">
          {/* Recherche textuelle */}
          <div className="flex-1 min-w-0">
            <SearchInput
              value={currentSearch}
              onChange={(val) => updateFilter('search', val)}
            />
          </div>

          {/* Select Ville */}
          <div className="relative shrink-0">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
            <select
              value={currentVille}
              onChange={(e) => updateFilter('ville', e.target.value)}
              className={cn(
                'appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] py-2.5 pl-9 pr-8 text-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20',
                currentVille
                  ? 'text-[var(--color-text)] font-medium'
                  : 'text-[var(--color-text-muted)]'
              )}
              aria-label="Filtrer par ville"
            >
              <option value="">Toutes les villes</option>
              {VILLES.map((ville) => (
                <option key={ville} value={ville}>
                  {ville}
                </option>
              ))}
            </select>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] hover:bg-red-50/50"
              aria-label="Réinitialiser les filtres"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Ligne 2 : Catégories (pills scrollables) */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  updateFilter('categorie', currentCategorie === cat ? '' : cat)
                }
                data-active={currentCategorie === cat}
                className={cn(
                  'filter-pill inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                  currentCategorie === cat
                    ? 'border-transparent bg-[var(--color-primary)] text-white shadow-md'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary-light)] hover:text-[var(--color-primary)]'
                )}
                aria-label={`Filtrer par ${cat}`}
                aria-pressed={currentCategorie === cat}
              >
                <span>{CATEGORIE_ICONS[cat as Categorie]}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Ligne 3 : Types de contrat (pills) */}
        <div className="flex items-center gap-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 pl-6">
            {TYPES_CONTRAT.map((contrat) => (
              <button
                key={contrat}
                onClick={() =>
                  updateFilter(
                    'contrat',
                    currentContrat === contrat ? '' : contrat
                  )
                }
                className={cn(
                  'inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                  currentContrat === contrat
                    ? 'border-transparent bg-[var(--color-accent)] text-white shadow-md'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-light)] hover:text-[var(--color-accent)]'
                )}
                aria-label={`Filtrer par ${contrat}`}
                aria-pressed={currentContrat === contrat}
              >
                {contrat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
