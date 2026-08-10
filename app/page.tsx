import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FilterBar } from '@/components/filter-bar';
import { JobList } from '@/components/job-list';
import type { OffreEmploi } from '@/types/database';
import { Briefcase, TrendingUp, Users, Zap } from 'lucide-react';

// Données chargées côté serveur (SSR pour le SEO)
async function getOffres(searchParams: {
  ville?: string;
  categorie?: string;
  contrat?: string;
  search?: string;
}): Promise<OffreEmploi[]> {
  const supabase = await createClient();

  let query = supabase
    .from('offres_emploi')
    .select('*')
    .eq('statut', 'PUBLIE')
    .order('est_epingle', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  // Appliquer les filtres
  if (searchParams.ville) {
    query = query.eq('ville', searchParams.ville);
  }
  if (searchParams.categorie) {
    query = query.eq('categorie', searchParams.categorie);
  }
  if (searchParams.contrat) {
    query = query.eq('type_contrat', searchParams.contrat);
  }
  if (searchParams.search) {
    // Recherche full-text PostgreSQL
    query = query.textSearch('description_search', searchParams.search, {
      type: 'websearch',
      config: 'french',
    });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erreur lors du chargement des offres:', error);
    return [];
  }

  return (data as OffreEmploi[]) || [];
}

// Obtenir les compteurs pour les KPI
async function getStats(): Promise<{
  totalOffres: number;
  totalVues: number;
}> {
  const supabase = await createClient();

  const { count } = await supabase
    .from('offres_emploi')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'PUBLIE');

  return {
    totalOffres: count || 0,
    totalVues: 0,
  };
}

export default async function HomePage(props: {
  searchParams: Promise<{
    ville?: string;
    categorie?: string;
    contrat?: string;
    search?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const [offres, stats] = await Promise.all([
    getOffres(searchParams),
    getStats(),
  ]);

  const hasFilters =
    searchParams.ville ||
    searchParams.categorie ||
    searchParams.contrat ||
    searchParams.search;

  return (
    <>
      <Header />

      {/* Hero section (affiché uniquement sans filtres actifs) */}
      {!hasFilters && (
        <section className="relative overflow-hidden border-b border-[var(--color-border)]">
          {/* Gradient de fond subtil */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-[var(--color-accent)]/5 pointer-events-none" />

          <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                Trouvez votre prochain{' '}
                <span className="gradient-text">emploi</span> au Cameroun
              </h1>
              <p className="text-base sm:text-lg text-[var(--color-text-secondary)] mb-6">
                Offres d&apos;emploi, stages et missions freelance.
              </p>

              {/* Mini KPI */}
              <div className="inline-flex items-center gap-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-6 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                    <Briefcase className="h-4 w-4 text-[var(--color-primary)]" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-[var(--color-text)]">
                      {stats.totalOffres}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                      Offres
                    </p>
                  </div>
                </div>
                <div className="h-8 w-px bg-[var(--color-border)]" />
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Zap className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider leading-tight">
                      Gratuit
                      <br />& rapide
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Barre de filtres */}
      <Suspense>
        <FilterBar />
      </Suspense>

      {/* Liste des offres */}
      <main className="mx-auto max-w-6xl px-4 py-6 flex-1">
        {/* Compteur résultats */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {offres.length > 0 ? (
              <>
                <span className="font-semibold text-[var(--color-text)]">
                  {offres.length}
                </span>{' '}
                offre{offres.length > 1 ? 's' : ''} trouvée
                {offres.length > 1 ? 's' : ''}
              </>
            ) : hasFilters ? (
              'Aucune offre ne correspond à vos critères'
            ) : (
              'Aucune offre publiée pour le moment'
            )}
          </p>
        </div>

        <JobList offres={offres} />
      </main>

      <Footer />
    </>
  );
}
