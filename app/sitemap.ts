import type { MetadataRoute } from 'next';
import { createStaticClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createStaticClient();

  // Récupérer les 100 dernières offres publiées
  const { data: offres } = await supabase
    .from('offres_emploi')
    .select('id, updated_at')
    .eq('statut', 'PUBLIE')
    .order('created_at', { ascending: false })
    .limit(100);

  const baseUrl = 'https://job-opportunities.cm';

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ];

  // Pages dynamiques (offres)
  const offrePages: MetadataRoute.Sitemap = (offres || []).map((offre) => ({
    url: `${baseUrl}/offre/${offre.id}`,
    lastModified: new Date(offre.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...offrePages];
}
