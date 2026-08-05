# Cahier des Charges – Opportuna Job Platform

## Vision
Construire la plateforme d'opportunités d'emploi de référence pour les talents tech/design/product en France et en Europe. Pas un nième job board, mais un **agent de carrière intelligent** qui inverse le paradigme : ce n'est plus le candidat qui cherche, c'est le job qui le trouve.

## Problèmes adressés
- Spam d'offres non pertinentes (LinkedIn, Welcome to the Jungle = bruit)
- Candidatures à l'aveugle sans feedback
- Manque de transparence salaire / culture / stack
- Expérience candidate déshumanisée

## Objectifs produit
- **Match IA > 90%** : parser GitHub, portfolio, CV, contributions
- **3 offres / jour max** mais ultra qualifiées
- **One-click apply** en 45s avec lettre auto-générée
- **Temps de réponse recruteur < 2.4 jours** garanti

## Fonctionnalités Core (MVP réalisé)

### 1. Recherche & Matching Intelligent
- Barre de recherche sémantique (titre, compétence, entreprise)
- Command palette (⌘K)
- Filtres : catégorie, type contrat, remote, salaire
- Score de match radial (0-100%) avec breakdown : fit tech, fit culture, salaire marché
- Raccourci `/` pour focus recherche

### 2. Listing & Détails
- Liste avec match, tags, salaire transparent, nombre de candidats
- Détail sticky avec benefits, stack, insights
- Sauvegarde / favoris (localStorage)
- Alerte marché : insights salariaux temps réel

### 3. Candidature Express
- Modale apply avec CV déjà attaché
- Boost IA du message (ex: détection d'expérience Rust)
- Feedback immédiat, suivi candidatures (applied state)

### 4. Profil Candidat
- Score complétude 92%
- Breakdown Tech / Design / Impact
- Progression visuelle

### 5. Expérience Premium
- Design system Linear + Stripe inspired
- Glassmorphism, gradients mesh, micro-interactions Framer Motion
- 100% responsive : drawer mobile pour détails
- Dark section pour conversion apply
- Temps de chargement < 1.2s (Vite)

### 6. Social Proof & Trust
- Logos entreprises (Mistral, Qonto, Alan...)
- Ticker live : candidatures récentes
- Stats live : offres, entreprises, taux succès

## Stack Technique
- **Frontend** : React 18, Vite 5, Tailwind 3, Framer Motion, Lucide
- **Data** : Mock JSON local (extensible vers API Supabase/Postgres)
- **Hosting** : Vercel / Netlify ready, build statique
- **PWA Ready**, SEO meta, accessibilité

## Architecture future prévue
- Backend : Supabase (auth, jobs table, RLS), Edge Functions pour parsing CV via Mistral AI
- Scraper quotidien : WelcomeToTheJungle, LinkedIn, Otta (compliance)
- Matching Engine : Python + vector DB (pgvector) + embeddings
- Notifications : email + WhatsApp via Resend/Twilio
- Tableau de bord recruteur : ATS light

## Critères de succès
- TTFB < 200ms
- Taux de clic apply > 18% (vs 3% industrie)
- NPS candidat > 65
- Temps candidature < 60s

## Roadmap
- V1 (actuelle) : Frontend formidable livré
- V2 : Auth + profil complet + upload CV PDF parsing
- V3 : Messagerie recruteur + entretiens intégrés
- V4 : Mobile app React Native

---
Réalisé avec obsession par Lewand Gesky – Paris, 2026.
