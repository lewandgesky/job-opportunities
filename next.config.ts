import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  // Fichier source du service worker
  swSrc: 'app/sw.ts',
  // Fichier de destination généré
  swDest: 'public/sw.js',
  // Désactiver PWA en développement
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  turbopack: {},
};

export default withSerwist(nextConfig);
