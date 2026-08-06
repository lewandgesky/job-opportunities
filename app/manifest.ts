import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'job-opportunities.cm',
    short_name: 'Jobs CM',
    description: 'La plateforme gratuite pour trouver un emploi au Cameroun.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      // Dans l'idéal, rajouter des PNG 192x192 et 512x512 dans /public
    ],
  };
}
