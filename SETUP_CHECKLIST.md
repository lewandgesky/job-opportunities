# SETUP CHECKLIST : Configuration des Services Externes

Voici la procédure complète pour configurer les services externes nécessaires au projet (Supabase et Cloudinary) et obtenir les clés nécessaires pour le fichier `.env.local`.

---

## 1. Configuration de Supabase (Base de données & Auth)

Supabase est notre Backend-as-a-Service pour la base de données PostgreSQL, l'authentification et le temps réel.

### Étape 1.1 : Créer le projet
1. Rends-toi sur [Supabase (supabase.com)](https://supabase.com) et crée un compte (ou connecte-toi avec GitHub).
2. Clique sur **"New Project"**.
3. Sélectionne une organisation, donne un nom au projet (ex: `job-opportunities-cm`), choisis un mot de passe de base de données fort et sélectionne la région la plus proche (ex: `eu-west-3` Paris ou Londres).
4. Clique sur **"Create new project"**. La création prend quelques minutes.

### Étape 1.2 : Récupérer les clés API
1. Une fois le projet créé, dans le menu de gauche, va dans **Project Settings** (l'icône d'engrenage tout en bas) > **API**.
2. Tu auras besoin de deux éléments pour le `.env.local` :
   - **Project URL** -> C'est ta `NEXT_PUBLIC_SUPABASE_URL`.
   - **Project API Keys (anon / public)** -> C'est ta `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - **Project API Keys (service_role / secret)** -> C'est ta `SUPABASE_SERVICE_ROLE_KEY` (attention, elle ne doit **JAMAIS** être exposée au client).

### Étape 1.3 : Exécuter le schéma SQL
1. Dans le menu de gauche de ton dashboard Supabase, va dans **SQL Editor**.
2. Clique sur **"New query"**.
3. Ouvre le fichier `schema.sql` qui se trouve à la racine du projet (je vais le générer juste après), copie tout son contenu, et colle-le dans l'éditeur.
4. Clique sur **Run** (ou `Cmd+Enter` / `Ctrl+Enter`).
5. Toutes les tables, politiques RLS (Row Level Security), triggers et index seront créés automatiquement.

### Étape 1.4 : Configurer l'Authentification (pour l'admin)
1. Va dans **Authentication** > **Providers**.
2. Assure-toi que **Email** est activé.
3. Désactive "Confirm email" (pour l'instant, pour simplifier la création de l'admin) ou garde-le actif si tu préfères vérifier ton adresse email.

---

## 2. Configuration de Cloudinary (Stockage des images)

Cloudinary va gérer le stockage, l'optimisation et la distribution (CDN) des flyers téléchargés par les recruteurs.

### Étape 2.1 : Créer le compte
1. Rends-toi sur [Cloudinary (cloudinary.com)](https://cloudinary.com) et inscris-toi pour un compte gratuit.
2. Une fois connecté, tu arriveras sur le **Dashboard**.

### Étape 2.2 : Récupérer les clés API
Sur la page d'accueil de ton dashboard Cloudinary (section "Account Details" ou "Product Environment Credentials"), tu trouveras :
1. **Cloud Name** -> C'est ton `CLOUDINARY_CLOUD_NAME`.
2. **API Key** -> C'est ta `CLOUDINARY_API_KEY`.
3. **API Secret** -> C'est ton `CLOUDINARY_API_SECRET`.

*(Ces trois clés iront dans ton fichier `.env.local` et ne doivent pas être publiques)*.

---

## 3. Configuration de OneSignal (Notifications Push)

OneSignal permet d'envoyer des notifications Push aux utilisateurs (web et mobile).

### Étape 3.1 : Créer l'application OneSignal
1. Rends-toi sur [OneSignal (onesignal.com)](https://onesignal.com/) et connecte-toi.
2. Ajoute une nouvelle application (New App/Website).
3. Sélectionne "Web" comme plateforme.
4. Sur la page de configuration, renseigne l'URL de ton site (pour l'instant, mets `http://localhost:3000` si tu es en développement).

### Étape 3.2 : Récupérer les clés
1. Dans les paramètres de l'application OneSignal (Settings > Keys & IDs), tu trouveras :
   - **OneSignal App ID** -> C'est ton `NEXT_PUBLIC_ONESIGNAL_APP_ID`.
   - **REST API Key** -> C'est ton `ONESIGNAL_REST_API_KEY`.

---

## 4. Création du fichier `.env.local`

À la racine de ton projet (dans le dossier `job-opportunities`), crée un fichier nommé `.env.local` (ou modifie-le s'il existe déjà) et remplis-le avec les clés que tu viens de récupérer :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://ton-id-projet.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJh..."
SUPABASE_SERVICE_ROLE_KEY="eyJh..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="ton-cloud-name"
CLOUDINARY_API_KEY="ta-cle-api"
CLOUDINARY_API_SECRET="ton-secret-api"

# OneSignal
NEXT_PUBLIC_ONESIGNAL_APP_ID="ton-app-id-onesignal"
ONESIGNAL_REST_API_KEY="ta-cle-rest-api"

# Admin Initial (optionnel, utilisé par nos scripts pour créer le premier compte)
ADMIN_EMAIL="ton-email-admin@job-opportunities.cm"
ADMIN_PASSWORD="TonMotDePasseSuperSecret123!"
```

C'est tout pour l'instant ! OneSignal pourra être configuré plus tard pour la Phase 2. Une fois que tu auras fait ça, l'application pourra communiquer avec la base de données et uploader des images.
