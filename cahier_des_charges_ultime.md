# CAHIER DES CHARGES ULTIME + PROMPT ULTIME
## job-opportunities.cm — Plateforme Emploi PWA 100% Gratuite
**Version:** 2.0 | **Date:** Août 2026 | **Cible:** Cameroun | **Budget Infra:** 0 FCFA

---

# PARTIE I : CAHIER DES CHARGES ULTIME

---

## 1. VISION & CONTRAINTES NON-NÉGOCIABLES

### 1.1 Mission
Centraliser et simplifier la recherche d'emploi/stage au Cameroun via une PWA ultra-légère, fonctionnelle en 2G/3G instable, sans coût d'infrastructure.

### 1.2 Contraintes Absolues
- **Budget infra mensuel:** 0 FCFA (stack gratuite pérenne uniquement)
- **Temps de chargement initial:** < 1,5s sur connexion 3G lente (400kbps)
- **Poids page d'accueil:** < 300 KB (hors images flyers)
- **Accessibilité:** Aucune inscription obligatoire pour consulter
- **Offline:** Liste des offres consultable hors-ligne après première visite
- **SEO:** Chaque offre doit être indexable par Google (SSR/SSG obligatoire)

---

## 2. STACK TECHNIQUE DÉTAILLÉE

| Couche | Technologie | Version/Plan | Justification & Quota |
|--------|-------------|--------------|----------------------|
| **Framework** | Next.js 14+ (App Router) | Latest stable | SSR natif pour le SEO, PWA via next-pwa, SSG pour les pages statiques |
| **Langage** | TypeScript | Strict mode | Typage fort, maintenance, scalabilité |
| **Styling** | Tailwind CSS 3.4+ | — | Purge automatique, bundle CSS minuscule |
| **UI Components** | shadcn/ui + Radix | — | Accessible, léger, pas de lib lourde type MUI |
| **Hébergement** | Vercel (Hobby) | Gratuit | Deploy GitHub, CDN Edge, HTTPS auto, 100 GB BP/mois, 10s serverless functions |
| **Base de données** | Supabase (Free Tier) | Gratuit | PostgreSQL 500 MB, Auth JWT, Row Level Security, 500K requêtes/mois, Realtime |
| **Stockage images** | Cloudinary (Free) | Gratuit | 25 GB/mois, compression auto WebP/AVIF, transformations URL, CDN |
| **Notifications Push** | OneSignal (Free) | Gratuit | Jusqu'à 10 000 abonnés, segmentation par catégorie, Web Push API |
| **Analytics** | Plausible (self-hosté) OU Vercel Analytics | Gratuit | RGPD-friendly, léger, pas de cookie banner |
| **Monitoring** | Vercel Monitoring + Supabase Logs | Gratuit | Alertes basiques |
| **WhatsApp** | WhatsApp Business API (via Meta Cloud) OU WhatsApp Business App manuel | Gratuit (App) | Point d'entrée recruteur |

### 2.1 Alternatives de secours
- Si Vercel Hobby insuffisant → Netlify (mêmes quotas)
- Si Supabase 500 MB atteint → Archivage automatique des offres > 90 jours en JSON compressé sur GitHub
- Si Cloudinary saturé → Supabase Storage (1 GB gratuit) avec compression client-side

---

## 3. ARCHITECTURE & FLUX DE DONNÉES

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   RECRUTEUR     │────▶│  WhatsApp       │────▶│   ADMIN         │
│   (Mobile)      │     │  Business App   │     │   (Next.js /admin)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CANDIDAT      │◀────│   Next.js PWA   │◀────│   Supabase      │
│   (Mobile/Web)  │     │   (Vercel Edge) │     │   PostgreSQL    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │                                               │
        ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│  OneSignal Push │◀──────────────────────────│  Edge Function  │
│  (Notifications)│     (Webhook on INSERT)     │  (Supabase)     │
└─────────────────┘                           └─────────────────┘
```

---

## 4. BASE DE DONNÉES — SCHÉMA SQL COMPLET

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table principale des offres
CREATE TABLE offres_emploi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titre VARCHAR(255) NOT NULL,
    entreprise VARCHAR(255) NOT NULL DEFAULT 'Confidentiel',
    ville VARCHAR(100) NOT NULL,
    categorie VARCHAR(100) NOT NULL CHECK (categorie IN (
        'Tech & Web', 'Comptabilité & Finance', 'Commerce & Vente', 
        'BTP & Artisanat', 'Enseignement', 'Transport & Logistique', 
        'Santé & Médical', 'Hôtellerie & Restauration', 
        'Stages & Job d'été', 'Administration & Secrétariat', 'Autres'
    )),
    type_contrat VARCHAR(50) NOT NULL CHECK (type_contrat IN ('CDI', 'CDD', 'Stage', 'Freelance', 'Alternance')),
    description TEXT NOT NULL,
    description_search TSVECTOR, -- pour recherche full-text

    -- Contact candidature
    contact_methode VARCHAR(20) NOT NULL CHECK (contact_methode IN ('whatsapp', 'email', 'lien')),
    contact_valeur VARCHAR(255) NOT NULL,

    -- Médias
    flyer_url TEXT, -- URL Cloudinary
    flyer_public_id TEXT, -- ID Cloudinary pour suppression

    -- Métadonnées offre
    niveau_experience VARCHAR(50) CHECK (niveau_experience IN ('Débutant', 'Junior', 'Confirmé', 'Senior', 'Non spécifié')) DEFAULT 'Non spécifié',
    salaire_fourchette VARCHAR(100),
    langues VARCHAR(100) DEFAULT 'Français',
    date_limite DATE,

    -- Workflow & Statut
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'PUBLIE', 'REJETE', 'EXPIRE', 'DESACTIVE')),

    -- Sponsoring & Monetisation
    est_epingle BOOLEAN DEFAULT FALSE,
    date_epingle TIMESTAMP WITH TIME ZONE,
    duree_epingle_jours INT DEFAULT 7,

    -- Métadonnées système
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),

    -- Tracking
    vues_count INT DEFAULT 0,
    candidatures_count INT DEFAULT 0,

    -- Admin
    admin_notes TEXT,
    submitted_by_ip INET,

    CONSTRAINT chk_date_limite CHECK (date_limite IS NULL OR date_limite >= CURRENT_DATE)
);

-- Index critiques pour performance
CREATE INDEX idx_offres_statut_date ON offres_emploi(statut, created_at DESC);
CREATE INDEX idx_offres_categorie ON offres_emploi(categorie) WHERE statut = 'PUBLIE';
CREATE INDEX idx_offres_ville ON offres_emploi(ville) WHERE statut = 'PUBLIE';
CREATE INDEX idx_offres_type_contrat ON offres_emploi(type_contrat) WHERE statut = 'PUBLIE';
CREATE INDEX idx_offres_epingle ON offres_emploi(est_epingle, date_epingle DESC) WHERE statut = 'PUBLIE';
CREATE INDEX idx_offres_search ON offres_emploi USING GIN (description_search);
CREATE INDEX idx_offres_expires ON offres_emploi(expires_at) WHERE statut = 'PUBLIE';

-- Table des catégories de notification (pour OneSignal)
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    one_signal_id VARCHAR(255) UNIQUE NOT NULL,
    categories TEXT[] DEFAULT '{}', -- ['Tech & Web', 'Stages & Job d'été']
    ville_preferee VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des logs admin (audit trail)
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id),
    action VARCHAR(50) NOT NULL, -- 'VALIDATE', 'REJECT', 'DELETE', 'EDIT'
    offre_id UUID REFERENCES offres_emploi(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des signalements utilisateurs
CREATE TABLE signalements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offre_id UUID REFERENCES offres_emploi(id) ON DELETE CASCADE,
    motif VARCHAR(100) NOT NULL,
    description TEXT,
    contact_signalant VARCHAR(255),
    statut VARCHAR(20) DEFAULT 'EN_ATTENTE' CHECK (statut IN ('EN_ATTENTE', 'TRAITE', 'IGNORE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_offres_updated_at BEFORE UPDATE ON offres_emploi
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger pour TSVECTOR (recherche full-text)
CREATE OR REPLACE FUNCTION offres_emploi_search_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.description_search := to_tsvector('french', 
        COALESCE(NEW.titre, '') || ' ' || 
        COALESCE(NEW.entreprise, '') || ' ' || 
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.ville, '') || ' ' ||
        COALESCE(NEW.categorie, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_offres_search_update BEFORE INSERT OR UPDATE ON offres_emploi
    FOR EACH ROW EXECUTE FUNCTION offres_emploi_search_update();

-- Vue pour les offres actives (simplifie les requêtes publiques)
CREATE VIEW offres_actives AS
SELECT * FROM offres_emploi 
WHERE statut = 'PUBLIE' 
  AND expires_at > NOW()
ORDER BY est_epingle DESC, created_at DESC;
```

### 4.1 Row Level Security (RLS) — Politiques Supabase

```sql
-- Activer RLS
ALTER TABLE offres_emploi ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE signalements ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire les offres PUBLIE
CREATE POLICY "Offres publiques visibles" ON offres_emploi
    FOR SELECT USING (statut = 'PUBLIE');

-- Politique: Seul l'admin peut tout voir/modifier (via service role côté serveur)
-- Les appels admin passent par API Routes Next.js avec service_role key

-- Politique: Insertion publique pour le formulaire (si formulaire public)
-- Ou bien: Désactiver l'insert publique et passer par Edge Function
CREATE POLICY "Insertion formulaire" ON offres_emploi
    FOR INSERT WITH CHECK (statut = 'EN_ATTENTE');
```

---

## 5. SPÉCIFICATIONS FONCTIONNELLES — INTERFACE PUBLIQUE

### 5.1 Page d'Accueil (`/`)
- **SSR obligatoire** pour le SEO
- Liste immédiate des offres, tri par défaut: `est_epingle DESC, created_at DESC`
- Badges temporels dynamiques:
  - `Aujourd'hui` (moins de 24h)
  - `Hier` (24h-48h)
  - `Il y a X jours` (2-7 jours)
  - `Cette semaine` (7-30 jours)
  - Date exacte (> 30 jours)
- **Mode dégradé:** Si connexion lente détectée (via Navigator.connection), masquer les flyers et afficher du texte uniquement avec bouton "Charger les images"
- **Skeleton loading** pendant le fetch SSR

### 5.2 Barre de Filtres (Sticky Header)
- **Ville:** Select avec recherche incrémentale. Villes prédéfinies: Douala, Yaoundé, Bafoussam, Garoua, Bamenda, Kribi, Buea, Limbe, Maroua, Ngaoundéré, Ebolowa, Bertoua, + "Remote / Télétravail"
- **Catégorie:** Pills horizontales scrollables (mobile) ou dropdown (desktop)
- **Type de contrat:** Multi-select pills: CDI, CDD, Stage, Freelance, Alternance
- **Recherche texte:** Input avec debounce 300ms, recherche full-text PostgreSQL (tsvector)
- **Reset filtres:** Bouton visible dès qu'un filtre est actif
- **URL sync:** Tous les filtres doivent être reflétés dans l'URL (`?ville=Douala&categorie=Tech&search=developpeur`) pour partage direct

### 5.3 Carte Offre (Job Card)
```
┌─────────────────────────────────────┐
│ [EPINGLE] Titre du Poste            │
│ Entreprise • Ville • Type Contrat   │
│ [Badge: Aujourd'hui]                │
│ [Miniature flyer si présent]        │
│ Description tronquée (2 lignes)     │
│ Niveau: Confirmé | Langue: FR/EN    │
│ [WhatsApp] [Email] [Voir +]         │
└─────────────────────────────────────┘
```
- Clic sur la carte → Page détail (`/offre/[id]`)
- Miniature flyer: thumbnail Cloudinary 200x200px WebP qualité 60

### 5.4 Page Détail Offre (`/offre/[id]`)
- **SSG avec revalidation ISR** (revalidate: 60s) pour SEO + performance
- Meta tags dynamiques (Open Graph, Twitter Card) avec image flyer si dispo
- Affichage complet:
  - Titre + entreprise + badges
  - Flyer en haute résolution (Cloudinary `q_auto,f_webp,w_800`)
  - Description complète (formaté avec sauts de ligne)
  - Détails: Ville, Catégorie, Contrat, Niveau, Salaire, Langues, Date limite
  - Date de publication + Date d'expiration
- **Boutons d'action:**
  - "Postuler sur WhatsApp" (vert, `https://wa.me/[num]?text=Bonjour,%20je%20souhaite%20postuler...`)
  - "Envoyer un Email" (bleu, `mailto:` avec sujet pré-rempli)
  - "Partager" (native Web Share API ou fallback copier lien)
  - "Signaler cette offre" (lien vers formulaire de signalement)

### 5.5 Modal Flyer (`/offre/[id]?modal=flyer`)
- Overlay avec backdrop blur
- Image haute qualité lazy-loadée
- Bouton télécharger (optionnel)
- Fermeture par clic extérieur, touche ESC, bouton X

### 5.6 Système de Notifications Push
- **Bannière d'abonnement:** Apparaît après 30s ou 3 pages vues. Non intrusive, en bas de l'écran.
- **Flow:**
  1. Utilisateur clique "Activer les alertes"
  2. Demande permission navigateur
  3. Si accordé → Enregistrement OneSignal + sélection catégories
  4. Stockage `one_signal_id` + catégories dans `push_subscriptions`
- **Sélection catégories:** Checkboxes des 10 catégories disponibles
- **Désabonnement:** Accessible depuis footer "Gérer mes alertes"
- **Limitation iOS:** Mentionner "Disponible sur Android et Chrome Desktop. iOS limité."

### 5.7 Mode Offline (Service Worker)
- Cache des pages visitées (Cache-First pour les pages, Network-First pour les données)
- Page d'accueil en cache dès la première visite
- Indicateur "Vous êtes hors-ligne" discret en haut
- Bouton "Rafraîchir" visible en offline pour tenter reconnexion

### 5.8 SEO & Performance
- **Sitemap XML:** Généré dynamiquement (`/sitemap.xml`) avec toutes les offres PUBLIE
- **robots.txt:** Autorise tout, pointe vers sitemap
- **Meta tags par offre:**
  ```
  title: "{titre} — {entreprise} | job-opportunities.cm"
  description: "{description tronquée 160 caractères}"
  og:image: {flyer_url ou logo par défaut}
  ```
- **Schema.org JobPosting:** JSON-LD sur chaque page offre
- **Core Web Vitals cibles:** LCP < 2.5s, FID < 100ms, CLS < 0.1

---

## 6. MODULE ADMINISTRATION (`/admin`)

### 6.1 Authentification
- Page `/admin/login` — Formulaire email/password
- Supabase Auth avec JWT, session persistante (localStorage + refresh token)
- **Sécurité:**
  - Rate limiting sur `/api/auth/*` (5 tentatives/minute par IP)
  - Mot de passe minimum: 12 caractères, 1 majuscule, 1 chiffre
  - Session expire après 24h d'inactivité
  - 2FA optionnelle (TOTP via authenticator app) — recommandée

### 6.2 Dashboard (`/admin`)
Layout avec sidebar responsive (drawer mobile).

#### Onglet 1: Offres en Attente (`/admin/pending`)
- Compteur badge avec nombre d'offres en attente
- Cartes avec:
  - Miniature flyer (si présent)
  - Titre, entreprise, ville, catégorie
  - Date de soumission
  - Boutons: [👁 Prévisualiser] [✅ Approuver] [❌ Rejeter]
- **Prévisualisation:** Modal ou drawer latéral montrant le rendu EXACT de la page publique
- **Actions rapides:**
  - Approuver → `statut = 'PUBLIE'`, `published_at = NOW()`, trigger notification push
  - Rejeter → `statut = 'REJETE'`, champ obligatoire `admin_notes` (raison du rejet)
  - Éditer → Modification inline des champs avant validation

#### Onglet 2: Offres Publiées (`/admin/published`)
- Table avec tri/pagination (25 par page)
- Colonnes: Titre, Entreprise, Vues, Candidatures, Date pub, Expiration, Actions
- Actions: [Éditer] [Désactiver] [Supprimer définitivement]
- **Filtres:** Par catégorie, ville, statut, date range
- **Recherche:** Full-text sur titre + entreprise

#### Onglet 3: Statistiques (`/admin/stats`)
- KPI cards:
  - Total offres publiées (ce mois / total)
  - Offres en attente
  - Vues totales (somme `vues_count`)
  - Abonnés Push (count `push_subscriptions`)
  - Top 5 catégories les plus consultées
- Graphique simple (line chart) des vues sur 30 jours
- Graphique des soumissions par jour (7 derniers jours)

#### Onglet 4: Signalements (`/admin/reports`)
- Liste des signalements avec motif, offre concernée, statut
- Actions: [Marquer traité] [Supprimer l'offre] [Ignorer]

### 6.3 API Routes Admin (Next.js)
Toutes les actions admin passent par des API Routes sécurisées:
```
POST /api/admin/offres/[id]/approve
POST /api/admin/offres/[id]/reject
POST /api/admin/offres/[id]/delete
GET  /api/admin/stats
```
- Vérification JWT côté serveur
- Utilisation de `service_role` key Supabase (bypass RLS)
- Logging systématique dans `admin_logs`

---

## 7. FLUX OPÉRATIONNEL WHATSAPP (DÉTAILLÉ)

### 7.1 Point de Contact WhatsApp
- Numéro WhatsApp Business dédié (pas de numéro perso)
- **Message rapide configuré:**
  ```
  Bonjour ! Merci de votre intérêt pour job-opportunities.cm.

  Pour déposer une offre, merci de me communiquer :
  1. Titre du poste
  2. Nom de l'entreprise
  3. Ville
  4. Type de contrat
  5. Description
  6. Comment postuler (WhatsApp ou Email)
  7. Flyer (optionnel)

  Je vous enverrai ensuite le lien du formulaire sécurisé.
  ```

### 7.2 Workflow Complet
```
Étape 1: Recruteur contacte via WhatsApp
    ↓
Étape 2: Admin vérifie la qualité (pas de spam, informations complètes)
    ↓
Étape 3: Admin génère un lien de formulaire pré-rempli unique
    → Lien: /submit?token=UUID_TEMPORAIRE (valide 24h)
    → Token stocké dans table temp_tokens (offre_id, expires_at)
    ↓
Étape 4: Recruteur remplit le formulaire (vérification token)
    → Upload flyer (Cloudinary)
    → Validation côté client + serveur
    → Soumission → statut 'EN_ATTENTE'
    ↓
Étape 5: Admin reçoit notification (email ou WhatsApp auto) "Nouvelle offre en attente"
    ↓
Étape 6: Admin se connecte à /admin, prévisualise, valide ou rejette
    ↓
Étape 7: Si validé → Publication instantanée + Push aux abonnés de la catégorie
```

### 7.3 Formulaire Public de Soumission (`/submit`)
- Accessible UNIQUEMENT avec token valide (paramètre URL)
- Si token invalide/expiré → Message "Lien expiré. Contactez-nous sur WhatsApp."
- Champs du formulaire:
  - Titre (text, max 255)
  - Entreprise (text, default "Confidentiel")
  - Ville (select avec autocomplete)
  - Catégorie (select)
  - Type de contrat (select)
  - Description (textarea, min 100 caractères)
  - Niveau d'expérience (select)
  - Salaire fourchette (text, optionnel)
  - Langues (multi-select: Français, Anglais, Bilingue)
  - Date limite (date picker, optionnel)
  - Contact méthode (radio: WhatsApp / Email / Lien externe)
  - Contact valeur (text avec validation format)
  - Flyer (file upload, max 5 Mo, formats: jpg, png, pdf)
  - Captcha simple (hCaptcha ou reCAPTCHA v2 invisible) — anti-spam
- **Upload flyer:**
  - Compression côté client (browser-image-compression) avant envoi
  - Upload vers Cloudinary via API Route sécurisée (pas de clé API exposée)
  - Transformation auto: WebP, qualité 80, max 1200px largeur

---

## 8. MONÉTISATION & BUSINESS MODEL

### 8.1 Revenus Programmatiques (Phase 3)
- **Adsterra** (format In-Page Push + Native Banner) — acceptation rapide, seuil bas
- **Google AdSense** (format display léger) — validation stricte, attendre 3-6 mois
- **Placement:** 1 bloc entre le header et la liste, 1 bloc en bas de page. JAMAIS entre les cartes offres (trop intrusif).
- **Estimation:** 5 000 — 12 000 FCFA/mois à 100 DAU

### 8.2 Revenus Directs (Phase 3+)
| Service | Prix | Condition |
|---------|------|-----------|
| Offre à la une (7 jours) | 2 500 FCFA | Paiement MTN MoMo / Orange Money |
| Diffusion Push prioritaire | 3 000 FCFA | Alerte à TOUS les abonnés, pas seulement la catégorie |
| Bannière partenaire (école/cabinet) | 10 000 FCFA/mois | Bannière 728x90 en haut de page, 1 partenaire max |

### 8.3 Paiement Mobile Money
- Intégration **Notch Pay** ou **CinetPay** (API disponible Cameroun)
- OU paiement manuel: recruteur envoie sur numéro MoMo, admin valide manuellement dans l'interface
- Statut de paiement stocké dans table `paiements` (lié à `offre_id`)

---

## 9. SÉCURITÉ

- **CSP (Content Security Policy):** Configurer dans next.config.js
- **HTTPS forcé:** Vercel le gère nativement
- **Clés API:** UNIQUEMENT dans variables d'environnement Vercel, jamais côté client
- **Uploads:** Validation type MIME côté serveur, limite taille, scan basique
- **Injection SQL:** Impossible avec Supabase client/RLS, mais vérifier dans les API Routes
- **XSS:** Échappement automatique React, mais sanitizer les descriptions si rich text un jour
- **Rate Limiting:** API Routes protégées via `lru-cache` ou middleware Vercel
- **Backup:** Export automatique hebdomadaire de la DB Supabase (via pg_dump ou fonction schedulée)

---

## 10. PERFORMANCE & OPTIMISATION

- **Images:** Next.js Image component avec Cloudinary loader, formats AVIF/WebP auto
- **Bundle:** Code-splitting par route, dynamic imports pour les modales
- **Données:** React Query (TanStack Query) avec staleTime de 5 minutes, prefetching
- **Font:** System font stack (pas de Google Fonts externe), ou font locale optimisée
- **CSS:** Tailwind purge, pas de CSS-in-JS lourd
- **Analytics:** Script async, chargé après interaction utilisateur

---

## 11. FEUILLE DE ROUTE

| Phase | Durée | Objectifs |
|-------|-------|-----------|
| **Phase 0** | Semaine 1 | Setup projet Next.js + Supabase + Cloudinary + CI/CD Vercel |
| **Phase 1** | Semaines 2-4 | Développement PWA (accueil, filtres, fiche offre, admin CRUD) |
| **Phase 2** | Semaines 5-6 | Notifications Push, formulaire soumission, mode offline, SEO |
| **Phase 3** | Semaine 7 | Tests utilisateurs (10 bêta-testeurs), corrections, optimisation |
| **Phase 4** | Mois 2 | Lancement communautaire (groupes WhatsApp, Facebook, LinkedIn) |
| **Phase 5** | Mois 3 | Intégration ads, activation options payantes, premier recruteur payant |
| **Phase 6** | Mois 4+ | Itération, analytics, amélioration continue |

---

# PARTIE II : PROMPT ULTIME POUR IA

---

## INSTRUCTIONS POUR L'IA

**Rôle:** Tu es un développeur full-stack senior spécialisé en Next.js, TypeScript, Supabase et PWA. Tu maîtrises le développement pour marchés émergents (Afrique) avec contraintes de bande passante.

**Mission:** Génère un projet Next.js 14+ complet, fonctionnel, prêt pour le déploiement sur Vercel, respectant 100% des spécifications ci-dessous.

---

## CONTEXTE DU PROJET

Nom: job-opportunities.cm
Type: Progressive Web App (PWA) de recherche d'emploi
Cible: Cameroun (connexions lentes, mobile-first)
Budget infra: 0 FCFA (stack gratuite uniquement)
Langue: Français (UI + contenu)

---

## STACK TECHNIQUE OBLIGATOIRE

```
Framework:        Next.js 14+ (App Router)
Langage:          TypeScript (strict: true)
Styling:          Tailwind CSS 3.4+
UI Library:       shadcn/ui (utiliser les composants: Button, Card, Dialog, Input, Select, Badge, Tabs, Sheet, Toast)
Database:         Supabase (PostgreSQL)
Auth:             Supabase Auth (JWT)
Storage Images:   Cloudinary (SDK Node.js côté serveur)
Push Notifs:      OneSignal (SDK Web)
PWA:              next-pwa
Icons:            Lucide React
Forms:            React Hook Form + Zod (validation)
Data Fetching:    Server Components + Server Actions (Next.js) pour les lectures
                  API Routes pour les mutations admin et uploads
State Client:     React Query (TanStack Query) pour le cache client
Date/Time:        date-fns (locale fr)
Compression:      browser-image-compression (côté client avant upload)
```

**INTERDIT:**
- Aucune librairie UI lourde (Material-UI, Ant Design)
- Aucun backend externe payant (Firebase payant, AWS, etc.)
- Aucun cookie banner (utiliser Vercel Analytics ou rien)

---

## STRUCTURE DU PROJET ATTENDUE

```
job-opportunities/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Page d'accueil (SSR)
│   │   ├── offre/[id]/page.tsx         # Page détail offre (SSG + ISR)
│   │   ├── offre/[id]/flyer/page.tsx  # Modal/overlay flyer
│   │   ├── submit/page.tsx             # Formulaire soumission (token requis)
│   │   ├── layout.tsx                  # Layout public avec PWA manifest
│   │   └── loading.tsx                 # Skeleton loading
│   ├── admin/
│   │   ├── page.tsx                    # Dashboard (redirect pending)
│   │   ├── login/page.tsx              # Page login
│   │   ├── pending/page.tsx            # Offres en attente
│   │   ├── published/page.tsx          # Offres publiées
│   │   ├── stats/page.tsx              # Statistiques
│   │   ├── reports/page.tsx            # Signalements
│   │   └── layout.tsx                  # Layout admin avec sidebar
│   ├── api/
│   │   ├── admin/
│   │   │   ├── offres/[id]/approve/route.ts
│   │   │   ├── offres/[id]/reject/route.ts
│   │   │   ├── offres/[id]/delete/route.ts
│   │   │   └── stats/route.ts
│   │   ├── submit/route.ts             # Création offre (token check)
│   │   ├── upload/route.ts             # Upload Cloudinary sécurisé
│   │   ├── auth/
│   │   │   └── callback/route.ts
│   │   └── onesignal/
│   │       └── subscribe/route.ts
│   ├── sitemap.ts                      # Sitemap dynamique
│   └── robots.ts                       # robots.txt
├── components/
│   ├── ui/                             # shadcn/ui components
│   ├── job-card.tsx
│   ├── job-list.tsx
│   ├── filter-bar.tsx
│   ├── search-input.tsx
│   ├── push-notification-banner.tsx
│   ├── offline-indicator.tsx
│   ├── flyer-modal.tsx
│   ├── share-button.tsx
│   ├── report-form.tsx
│   ├── admin/
│   │   ├── sidebar.tsx
│   │   ├── pending-card.tsx
│   │   ├── stats-chart.tsx
│   │   └── data-table.tsx
│   └── layout/
│       ├── header.tsx
│       └── footer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Client Supabase côté client
│   │   ├── server.ts                   # Client Supabase côté serveur
│   │   └── admin.ts                    # Client Supabase service_role (API routes)
│   ├── cloudinary.ts                   # Config + upload helper
│   ├── onesignal.ts                    # Config OneSignal
│   ├── utils.ts                        # Helpers (cn, formatDate, etc.)
│   └── constants.ts                    # Villes, catégories, types contrat
├── hooks/
│   ├── use-offline.ts
│   ├── use-push-subscription.ts
│   └── use-filters.ts
├── types/
│   └── database.ts                     # Types générés Supabase
├── public/
│   ├── manifest.json
│   ├── sw.js                           # (généré par next-pwa)
│   └── icons/                          # Icons PWA (192x192, 512x512)
├── middleware.ts                       # Auth guard /admin
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## SPÉCIFICATIONS DÉTAILLÉES PAR MODULE

### MODULE 1: PAGE D'ACCUEIL (`/`)
- **SSR via Server Component:** Fetch initial des offres avec Supabase server client
- **Filtres côté client:** Après hydration, React Query gère les filtres avec debounce
- **URL sync:** useEffect synchronise les filtres avec query params (pour partage)
- **Tri:** `est_epingle DESC, created_at DESC`
- **Pagination:** Infinite scroll (cursor-based) ou pagination classique 20 offres/page
- **Badges temporels:** Fonction utilitaire `getTimeBadge(date)` retournant le badge texte + couleur
- **Mode dégradé:** Détection `navigator.connection?.effectiveType`. Si '2g' ou 'slow-2g', masquer les images et afficher bouton "Afficher les flyers"
- **Skeleton:** 5 skeleton cards pendant le loading initial

### MODULE 2: FILTRES & RECHERCHE
- **Ville:** Combobox shadcn (searchable) avec les 13 villes + Remote
- **Catégorie:** ToggleGroup (pills) sur mobile, Select sur desktop
- **Type contrat:** Multi-select avec badges de sélection
- **Recherche texte:** Input avec icône loupe, debounce 300ms. Appel RPC Supabase `search_offres(query)` utilisant la colonne `description_search` (tsvector)
- **Reset:** Bouton visible si au moins un filtre actif

### MODULE 3: PAGE DÉTAIL OFFRE (`/offre/[id]`)
- **SSG:** `generateStaticParams` pour pré-render les 50 dernières offres + fallback `blocking`
- **ISR:** `revalidate: 60` (regénération toutes les minutes)
- **Meta dynamiques:** `generateMetadata` retournant title, description, Open Graph
- **Schema.org:** JSON-LD `<script type="application/ld+json">` avec type JobPosting
- **Flyer:** Next.js Image avec Cloudinary loader. Si pas de flyer, afficher placeholder avec initiales entreprise
- **Boutons action:**
  - WhatsApp: `https://wa.me/${num}?text=${encodedMessage}` — s'ouvre dans nouvel onglet
  - Email: `mailto:` avec sujet pré-rempli
  - Partager: `navigator.share()` si dispo, sinon copier lien + toast "Lien copié !"
  - Signaler: lien vers `/offre/[id]/report`

### MODULE 4: FORMULAIRE SOUMISSION (`/submit`)
- **Protection token:** Vérification du paramètre `token` dans l'URL. Si absent ou invalide → redirect page "Lien invalide"
- **Formulaire:** React Hook Form + Zod schema strict
- **Upload flyer:**
  1. Input file accept="image/*"
  2. Compression côté client avec `browser-image-compression` (max 1 Mo, max 1200px)
  3. Upload vers API Route `/api/upload` qui upload sur Cloudinary
  4. Retour URL + public_id stockés dans le form
- **Soumission:** POST vers `/api/submit` qui:
  1. Vérifie le token (table temp_tokens)
  2. Insère dans `offres_emploi` avec statut 'EN_ATTENTE'
  3. Invalide le token
  4. Retourne succès
- **UX:** Étapes visuelles (Stepper), validation en temps réel, bouton submit désactivé si invalide

### MODULE 5: ADMIN — AUTH & LAYOUT
- **Middleware:** `middleware.ts` vérifie la session Supabase sur toutes les routes `/admin/*`. Si pas authentifié → redirect `/admin/login`
- **Login:** Formulaire simple email/password. Supabase Auth. Session stockée dans cookie.
- **Layout admin:** Sidebar fixe (desktop), Sheet drawer (mobile). Navigation entre les onglets.
- **Protection API:** Toutes les routes `/api/admin/*` vérifient le JWT dans le header Authorization.

### MODULE 6: ADMIN — OFFRES EN ATTENTE
- **Fetch:** Server Component ou API Route avec service_role key
- **Cards:** Affichage compact. Clic → Drawer latéral avec prévisualisation complète (rendu exact de la page publique)
- **Actions:**
  - Approuver: `POST /api/admin/offres/[id]/approve` → update statut + published_at + log admin + trigger notification
  - Rejeter: Modal avec textarea "Raison du rejet" (obligatoire) → update statut + admin_notes
- **Toast feedback:** "Offre approuvée et publiée" / "Offre rejetée"

### MODULE 7: ADMIN — STATISTIQUES
- **KPI Cards:** 4 cards en grille (offres publiées, en attente, vues totales, abonnés push)
- **Graphiques:** Utiliser `recharts` (léger) pour:
  - Line chart: vues sur 30 derniers jours (données agrégées depuis `admin_logs` ou `offres_emploi`)
  - Bar chart: soumissions par jour (7 derniers jours)
- **Données:** API Route `/api/admin/stats` avec requêtes SQL agrégées

### MODULE 8: NOTIFICATIONS PUSH
- **Bannière:** Composant `PushNotificationBanner` affiché conditionnellement (après 30s ou 3 pages vues). Non affiché si déjà abonné ou déjà refusé (localStorage).
- **Flow:**
  1. Clic "Activer" → `OneSignal.User.PushSubscription.optIn()`
  2. Si succès → Modal de sélection des catégories (checkboxes)
  3. Enregistrement dans `push_subscriptions` via `/api/onesignal/subscribe`
- **Trigger push:** Edge Function Supabase ou API Route appelée lors de l'approbation d'une offre. Envoi ciblé par catégorie via OneSignal API.

### MODULE 9: PWA & MODE OFFLINE
- **Manifest:** `manifest.json` avec name, short_name, icons, theme_color (#0F172A), background_color (#ffffff), display: standalone
- **next-pwa:** Config dans `next.config.js` avec:
  - `dest: 'public'`
  - `register: true`
  - `skipWaiting: true`
  - Runtime caching pour les pages et les images Cloudinary
- **Offline indicator:** Composant fixe en haut de l'écran si `navigator.onLine === false`
- **Fallback:** Page `/offline` statique affichée si l'utilisateur est offline et la page n'est pas en cache

### MODULE 10: SEO & MÉTA-DONNÉES
- **Sitemap:** `app/sitemap.ts` retournant URLs statiques + URLs dynamiques des offres PUBLIE (limité aux 100 dernières pour performance)
- **Robots:** `app/robots.ts` allow all, sitemap URL
- **Meta par défaut:** Dans `app/layout.tsx`
- **Meta offre:** Dans `app/offre/[id]/page.tsx` via `generateMetadata`

---

## RÈGLES DE CODE STRICTES

1. **TypeScript strict:** Aucun `any`. Toutes les fonctions typées. Types générés Supabase utilisés partout.
2. **Server Components par défaut:** Tous les composants sont des Server Components sauf si interaction client nécessaire (marqués `'use client'`).
3. **Données sensibles:** Aucune clé API côté client. `NEXT_PUBLIC_*` UNIQUEMENT pour les clés publiques (Supabase anon key, OneSignal app ID). Clés privées uniquement dans API Routes.
4. **Error handling:** Toutes les API Routes retournent JSON structuré: `{ success: boolean, data?: T, error?: string }`. Try/catch systématique.
5. **Loading states:** Skeletons pour les données async, boutons avec état `loading` pendant les mutations.
6. **Responsive:** Mobile-first. Breakpoints Tailwind standard. Testé sur 320px minimum.
7. **Accessibilité:** Tous les boutons ont des aria-labels, contrastes WCAG AA, navigation clavier fonctionnelle.
8. **Performance:** Pas de re-render inutile. `React.memo` sur les cartes si liste > 20 items. Images optimisées.

---

## ENVIRONNEMENT (.env.example)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# OneSignal
NEXT_PUBLIC_ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=

# Admin (optionnel: pour créer le premier compte admin)
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

---

## LIVRABLES ATTENDUS

L'IA doit fournir:
1. **Tous les fichiers de code** listés dans la structure du projet, complets et fonctionnels
2. **Le schéma SQL complet** (fichier `schema.sql`) prêt à exécuter dans Supabase SQL Editor
3. **Un fichier `README.md`** avec:
   - Instructions d'installation (npm install)
   - Configuration des variables d'environnement
   - Setup Supabase (création tables, RLS, triggers)
   - Setup Cloudinary
   - Setup OneSignal
   - Déploiement Vercel
   - Création du premier compte admin
4. **Un fichier `SETUP_CHECKLIST.md`** avec les étapes à suivre manuellement (création projets Supabase/Cloudinary/etc.)

---

## CRITÈRES D'ACCEPTATION

Le projet sera considéré comme réussi si:
- [ ] La page d'accueil charge en < 1,5s sur 3G simulée (Lighthouse)
- [ ] Le formulaire de soumission fonctionne end-to-end (WhatsApp → token → formulaire → admin → publication)
- [ ] L'admin peut se connecter, voir les offres en attente, les approuver/rejeter
- [ ] Les notifications Push fonctionnent sur Android Chrome
- [ ] La PWA est installable (manifest + service worker OK)
- [ ] Le mode offline affiche les offres déjà visitées
- [ ] Le SEO est fonctionnel (meta tags dynamiques, sitemap, schema.org)
- [ ] Aucune erreur TypeScript (`npm run build` passe sans erreur)
- [ ] Le design est responsive et professionnel (mobile-first)

---

## NOTES FINALES POUR L'IA

- **Ne génère PAS de fausses données.** Utilise des types et des mocks uniquement si nécessaire pour la démo.
- **Ne laisse PAS de TODOs dans le code.** Tout doit être implémenté.
- **Commente le code** en français pour les parties métier complexes.
- **Privilégie la simplicité.** Pas d'over-engineering. Si une solution simple fonctionne, utilise-la.
- **Pense au contexte camerounais:** Connexions lentes, mobile-first, WhatsApp comme canal dominant, paiement mobile money.
- **Le projet doit être déployable en 1 clic sur Vercel** (bouton Deploy possible si tu génères le fichier `vercel.json` ou instructions claires).
