import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { pinJob, deleteJob, rejectJob } from '../actions';

export const dynamic = 'force-dynamic';

export default async function PublishedJobsPage() {
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

  const { data: offres, error } = await supabase
    .from('offres_emploi')
    .select('*')
    .eq('statut', 'PUBLIE')
    .order('est_epingle', { ascending: false })
    .order('published_at', { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">Erreur de chargement des offres publiées.</div>;
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Publiées</h1>
          <p className="text-slate-400 mt-1">
            {offres.length} offre{offres.length > 1 ? 's' : ''} en ligne.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {offres.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-slate-400">
            Aucune offre actuellement publiée.
          </div>
        ) : (
          offres.map((offre) => (
            <div key={offre.id} className={`bg-white/5 border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors ${offre.est_epingle ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:bg-white/[0.07]'}`}>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-semibold">
                    Publiée
                  </span>
                  {offre.est_epingle && (
                    <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
                      Épinglée
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    Mise en ligne il y a {offre.published_at ? formatDistanceToNow(new Date(offre.published_at), { addSuffix: false, locale: fr }) : 'N/A'}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{offre.titre}</h3>
                <p className="text-slate-300 mt-1">{offre.entreprise} — {offre.ville}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <span className="bg-white/10 px-3 py-1 rounded-full text-slate-300">
                    {offre.type_contrat}
                  </span>
                  <span className="bg-white/10 px-3 py-1 rounded-full text-slate-300">
                    {offre.categorie}
                  </span>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col gap-3 min-w-[140px]">
                {offre.est_epingle ? (
                  <form action={pinJob.bind(null, offre.id, false)} className="flex-1">
                    <button type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                      Désépingler
                    </button>
                  </form>
                ) : (
                  <form action={pinJob.bind(null, offre.id, true)} className="flex-1">
                    <button type="submit" className="w-full bg-primary/20 hover:bg-primary/30 text-primary font-semibold py-2 px-4 rounded-lg transition-colors text-sm border border-primary/20">
                      Épingler
                    </button>
                  </form>
                )}
                
                <form action={rejectJob.bind(null, offre.id)} className="flex-1">
                  <button type="submit" className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                    Archiver
                  </button>
                </form>
                
                <form action={deleteJob.bind(null, offre.id, offre.flyer_public_id)} className="flex-1">
                  <button type="submit" className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                    Supprimer
                  </button>
                </form>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
