import Link from 'next/link';

export default async function SubmitSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 mb-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-display font-bold mb-4">
        Offre soumise avec succès !
      </h1>
      
      <p className="text-lg text-slate-400 max-w-lg mb-8">
        Votre offre d'emploi a été enregistrée et est actuellement <strong>en attente de validation</strong> par notre équipe. 
        Elle sera publiée sous peu (généralement en moins de 2 heures).
      </p>

      {id && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 w-full max-w-md">
          <p className="text-sm text-slate-400 mb-2">Référence de l'offre :</p>
          <code className="text-primary font-mono bg-primary/10 px-3 py-1 rounded">
            {id}
          </code>
        </div>
      )}

      <div className="flex gap-4">
        <Link
          href="/"
          className="bg-white/10 hover:bg-white/20 text-white font-medium py-2.5 px-6 rounded-full transition-colors"
        >
          Retour à l'accueil
        </Link>
        <Link
          href="/submit"
          className="bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-6 rounded-full shadow-lg shadow-primary/25 transition-all"
        >
          Publier une autre offre
        </Link>
      </div>
    </div>
  );
}
