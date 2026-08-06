import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from './providers';
import { OneSignalInit } from '@/components/onesignal-init';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'job-opportunities.cm — Offres d\'emploi au Cameroun',
    template: '%s | job-opportunities.cm',
  },
  description:
    'Trouvez votre prochain emploi, stage ou mission freelance au Cameroun. Plateforme 100% gratuite, rapide et accessible même en connexion lente.',
  keywords: [
    'emploi',
    'Cameroun',
    'offre emploi',
    'stage',
    'Douala',
    'Yaoundé',
    'travail',
    'job',
    'recrutement',
  ],
  authors: [{ name: 'job-opportunities.cm' }],
  openGraph: {
    type: 'website',
    locale: 'fr_CM',
    url: 'https://job-opportunities.cm',
    siteName: 'job-opportunities.cm',
    title: 'job-opportunities.cm — Offres d\'emploi au Cameroun',
    description:
      'Trouvez votre prochain emploi, stage ou mission freelance au Cameroun. 100% gratuit.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'job-opportunities.cm',
    description: 'Offres d\'emploi au Cameroun — 100% gratuit',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1120' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <OneSignalInit />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
