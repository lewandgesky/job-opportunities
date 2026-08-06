import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ignoreReport, deleteJob } from '../actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
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

  const { data: signalements, error } = await supabase
    .from('signalements')
    .select(`
      id,
      motif,
      description,
      statut,
      created_at,
      offre_id,
      offres_emploi (
        titre,
        entreprise,
        flyer_public_id
      )
    `)
    .eq('statut', 'EN_ATTENTE')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">Erreur de chargement des signalements.</div>;
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Signalements</h1>
          <p className="text-slate-400 mt-1">
            {signalements?.length || 0} signalement{signalements?.length !== 1 ? 's' : ''} en attente.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {!signalements || signalements.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-slate-400">
            Aucun signalement à traiter. Tout va bien ! 🎉
          </div>
        ) : (
          signalements.map((sig: any) => (
            <div key={sig.id} className="bg-white/5 border border-red-500/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6 hover:bg-white/[0.07] transition-colors">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-semibold">
                    {sig.motif}
                  </span>
                  <span className="text-xs text-slate-400">
                    Signalé il y a {formatDistanceToNow(new Date(sig.created_at), { addSuffix: false, locale: fr })}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Offre concernée :{' '}
                  <Link href={`/offre/${sig.offre_id}`} className="text-primary hover:underline" target="_blank">
                    {sig.offres_emploi?.titre} ({sig.offres_emploi?.entreprise})
                  </Link>
                </h3>
                {sig.description && (
                  <div className="mt-3 bg-red-500/5 border border-red-500/10 p-3 rounded-lg">
                    <p className="text-sm text-slate-300 italic">"{sig.description}"</p>
                  </div>
                )}
              </div>

              <div className="flex flex-row sm:flex-col gap-3 min-w-[150px]">
                <form action={deleteJob.bind(null, sig.offre_id, sig.offres_emploi?.flyer_public_id)} className="flex-1">
                  <button type="submit" className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 px-4 rounded-lg transition-colors text-sm border border-red-500/20">
                    Supprimer l'offre
                  </button>
                </form>
                
                <form action={ignoreReport.bind(null, sig.id)} className="flex-1">
                  <button type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                    Ignorer ce rapport
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
