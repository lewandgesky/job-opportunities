import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { approveJob, rejectJob, deleteJob } from '../actions';

export const dynamic = 'force-dynamic';

export default async function PendingJobsPage() {
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
    .eq('statut', 'EN_ATTENTE')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">Erreur de chargement des offres en attente.</div>;
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">En Attente</h1>
          <p className="text-slate-400 mt-1">
            {offres.length} offre{offres.length > 1 ? 's' : ''} à modérer.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {offres.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-slate-400">
            Aucune offre en attente de validation.
          </div>
        ) : (
          offres.map((offre) => (
            <div key={offre.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white/[0.07] transition-colors">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-xs font-semibold">
                    En Attente
                  </span>
                  <span className="text-xs text-slate-400">
                    Il y a {formatDistanceToNow(new Date(offre.created_at), { addSuffix: false, locale: fr })}
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
                {offre.flyer_url && (
                  <a href={offre.flyer_url} target="_blank" rel="noreferrer" className="inline-block mt-4 text-primary text-sm hover:underline">
                    Voir le flyer joint ↗
                  </a>
                )}
              </div>

              <div className="flex flex-row sm:flex-col gap-3 min-w-[140px]">
                <form action={approveJob.bind(null, offre.id, true)} className="flex-1">
                  <button type="submit" className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold py-2 px-4 rounded-lg transition-colors text-sm border border-green-500/20">
                    Approuver
                  </button>
                </form>
                <form action={rejectJob.bind(null, offre.id)} className="flex-1">
                  <button type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                    Rejeter
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
