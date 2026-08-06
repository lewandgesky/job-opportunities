import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient, createStaticClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ShareButton } from '@/components/share-button';
import type { OffreEmploi } from '@/types/database';
import { formatDate, getTimeBadge, getWhatsAppLink, getMailtoLink, truncateText } from '@/lib/utils';
import { CATEGORIE_COLORS, CONTRAT_COLORS } from '@/lib/constants';
import type { Categorie, TypeContrat } from '@/lib/constants';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  Briefcase,
  Pin,
  Globe,
  Calendar,
  DollarSign,
  GraduationCap,
  MessageCircle,
  Mail,
  ExternalLink,

  Flag,
} from 'lucide-react';

// ISR: revalidation toutes les 60 secondes
export const revalidate = 60;

// Générer les paramètres statiques pour les 50 dernières offres
export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('offres_emploi')
    .select('id')
    .eq('statut', 'PUBLIE')
    .order('created_at', { ascending: false })
    .limit(50);

  return (data || []).map((offre) => ({ id: offre.id }));
}

// Meta tags dynamiques pour le SEO
export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const supabase = createStaticClient();
  const { data: offre } = await supabase
    .from('offres_emploi')
    .select('*')
    .eq('id', id)
    .eq('statut', 'PUBLIE')
    .single();

  if (!offre) {
    return { title: 'Offre non trouvée' };
  }

  const title = `${offre.titre} — ${offre.entreprise}`;
  const description = truncateText(offre.description, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: offre.flyer_url ? [{ url: offre.flyer_url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

async function getOffre(id: string): Promise<OffreEmploi | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offres_emploi')
    .select('*')
    .eq('id', id)
    .eq('statut', 'PUBLIE')
    .single();

  if (error || !data) return null;
  return data as OffreEmploi;
}

export default async function OffreDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const offre = await getOffre(id);

  if (!offre) {
    notFound();
  }

  const timeBadge = getTimeBadge(offre.created_at);

  // Schema.org JobPosting JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: offre.titre,
    description: offre.description,
    datePosted: offre.published_at || offre.created_at,
    validThrough: offre.date_limite || offre.expires_at,
    hiringOrganization: {
      '@type': 'Organization',
      name: offre.entreprise,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: offre.ville,
        addressCountry: 'CM',
      },
    },
    employmentType: offre.type_contrat,
  };

  return (
    <>
      <Header />

      {/* JSON-LD pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {/* Retour */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux offres
          </Link>

          {/* Carte principale */}
          <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden shadow-md animate-fade-in-up">
            {/* En-tête avec gradient */}
            <div className="relative px-6 pt-6 pb-5 border-b border-[var(--color-border)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent pointer-events-none" />

              <div className="relative">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {offre.est_epingle && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                      <Pin className="h-3 w-3" />
                      À la une
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                    <Clock className="h-3 w-3" />
                    {timeBadge.text}
                  </span>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                    style={{
                      backgroundColor:
                        CONTRAT_COLORS[offre.type_contrat as TypeContrat] ||
                        '#6b7280',
                    }}
                  >
                    {offre.type_contrat}
                  </span>
                </div>

                {/* Titre */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] leading-tight mb-2">
                  {offre.titre}
                </h1>

                {/* Entreprise + Ville */}
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-[var(--color-text-muted)]" />
                    {offre.entreprise}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[var(--color-text-muted)]" />
                    {offre.ville}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium text-white"
                    style={{
                      backgroundColor:
                        CATEGORIE_COLORS[offre.categorie as Categorie] ||
                        '#6b7280',
                    }}
                  >
                    <Briefcase className="h-3 w-3" />
                    {offre.categorie}
                  </span>
                </div>
              </div>
            </div>

            {/* Flyer (si présent) */}
            {offre.flyer_url && (
              <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50">
                <img
                  src={offre.flyer_url}
                  alt={`Flyer pour ${offre.titre}`}
                  className="w-full max-w-lg mx-auto rounded-xl shadow-sm"
                  loading="lazy"
                />
              </div>
            )}

            {/* Corps : Description */}
            <div className="px-6 py-5">
              <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                Description du poste
              </h2>
              <div className="text-sm sm:text-base text-[var(--color-text)] leading-relaxed whitespace-pre-line">
                {offre.description}
              </div>
            </div>

            {/* Détails structurés */}
            <div className="px-6 py-5 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/30">
              <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
                Détails
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="Ville"
                  value={offre.ville}
                />
                <DetailItem
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Catégorie"
                  value={offre.categorie}
                />
                <DetailItem
                  icon={<GraduationCap className="h-4 w-4" />}
                  label="Niveau"
                  value={offre.niveau_experience}
                />
                <DetailItem
                  icon={<Globe className="h-4 w-4" />}
                  label="Langues"
                  value={offre.langues}
                />
                {offre.salaire_fourchette && (
                  <DetailItem
                    icon={<DollarSign className="h-4 w-4" />}
                    label="Salaire"
                    value={offre.salaire_fourchette}
                  />
                )}
                {offre.date_limite && (
                  <DetailItem
                    icon={<Calendar className="h-4 w-4" />}
                    label="Date limite"
                    value={formatDate(offre.date_limite)}
                  />
                )}
                <DetailItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Publié le"
                  value={formatDate(offre.published_at || offre.created_at)}
                />
                <DetailItem
                  icon={<Clock className="h-4 w-4" />}
                  label="Expire le"
                  value={formatDate(offre.expires_at)}
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="px-6 py-5 border-t border-[var(--color-border)]">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Bouton principal de candidature */}
                {offre.contact_methode === 'whatsapp' && (
                  <a
                    href={getWhatsAppLink(offre.contact_valeur, offre.titre)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 hover:shadow-xl active:scale-[0.97] flex-1"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Postuler sur WhatsApp
                  </a>
                )}
                {offre.contact_methode === 'email' && (
                  <a
                    href={getMailtoLink(offre.contact_valeur, offre.titre)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-info)] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 hover:shadow-xl active:scale-[0.97] flex-1"
                  >
                    <Mail className="h-5 w-5" />
                    Envoyer un Email
                  </a>
                )}
                {offre.contact_methode === 'lien' && (
                  <a
                    href={offre.contact_valeur}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 hover:shadow-xl active:scale-[0.97] flex-1"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Postuler en ligne
                  </a>
                )}

                {/* Boutons secondaires */}
                <ShareButton title={offre.titre} />

                <Link
                  href={`/offre/${offre.id}/signaler`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
                >
                  <Flag className="h-4 w-4" />
                  <span className="hidden sm:inline">Signaler</span>
                </Link>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </>
  );
}

// Composant pour les détails structurés
function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[var(--color-bg-card)] px-4 py-3 border border-[var(--color-border-light)]">
      <span className="text-[var(--color-text-muted)]">{icon}</span>
      <div>
        <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-[var(--color-text)]">
          {value}
        </p>
      </div>
    </div>
  );
}

