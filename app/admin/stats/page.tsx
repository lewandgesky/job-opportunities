import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function AdminStatsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // Récupérer toutes les offres pour faire des stats
  const { data: offres, error } = await supabase
    .from('offres_emploi')
    .select('statut, categorie, type_contrat, vues_count, candidatures_count');

  if (error || !offres) {
    return <div className="p-8 text-red-500">Erreur de chargement des statistiques.</div>;
  }

  // Calculs
  const total = offres.length;
  const publiees = offres.filter(o => o.statut === 'PUBLIE').length;
  const enAttente = offres.filter(o => o.statut === 'EN_ATTENTE').length;
  const rejetees = offres.filter(o => o.statut === 'REJETE').length;

  const totalVues = offres.reduce((acc, curr) => acc + (curr.vues_count || 0), 0);
  const totalCandidatures = offres.reduce((acc, curr) => acc + (curr.candidatures_count || 0), 0);

  // Group by category (Top 5)
  const byCategory = offres.reduce((acc, curr) => {
    acc[curr.categorie] = (acc[curr.categorie] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Statistiques</h1>
        <p className="text-slate-400 mt-1">Aperçu global de l'activité sur la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-sm font-medium text-slate-400 mb-1">Total Offres</p>
          <p className="text-3xl font-bold">{total}</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
          <p className="text-sm font-medium text-primary mb-1">Actives (Publiées)</p>
          <p className="text-3xl font-bold text-primary">{publiees}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
          <p className="text-sm font-medium text-amber-400 mb-1">En attente</p>
          <p className="text-3xl font-bold text-amber-400">{enAttente}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <p className="text-sm font-medium text-red-400 mb-1">Rejetées</p>
          <p className="text-3xl font-bold text-red-400">{rejetees}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vues et Engagement */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Engagement Estimé</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Total des vues d'offres</span>
                <span className="font-bold">{totalVues}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Candidatures (clics estimés)</span>
                <span className="font-bold">{totalCandidatures}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: totalVues > 0 ? `${(totalCandidatures / totalVues) * 100}%` : '0%' }}></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              * Les vues et candidatures sont basées sur le tracker interne de Supabase. Pour une analyse granulaire du trafic, consultez Vercel Analytics.
            </p>
          </div>
        </div>

        {/* Top Catégories */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Top Catégories</h2>
          <div className="space-y-4">
            {topCategories.map(([cat, count], index) => (
              <div key={cat} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 w-4">{index + 1}.</span>
                  <span className="text-slate-300">{cat}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{count}</span>
                  <div className="w-24 bg-slate-800 rounded-full h-1.5 hidden sm:block">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(count / total) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
            {topCategories.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Pas assez de données.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
