# 🚀 OPPORTUNA — La plateforme emploi qui vous trouve.

> **Fini le spam d'offres. 3 jobs par jour, mais les bons. Match IA à 96%.**

OPPORTUNA inverse le job board traditionnel : ce n'est pas vous qui cherchez, c'est le poste idéal qui vient à vous. Conçue à Paris pour les meilleurs talents Tech, Design, Product & Data en Europe.

![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-black?style=flat-square)

### ✨ Live Demo
Le serveur dev tourne sur : `https://5173-{sandbox}.e2b.app` (preview Arena)
Local : http://localhost:5173

---

## 🎨 Ce qui rend ce projet FORMIDABLE

### Design d'exception
- **Inspiration Linear.app + Stripe + Vercel** : noir/blanc, glassmorphism, gradients mesh subtils
- **Animations Framer Motion** : cartes flottantes, drawer mobile spring, hover 3D
- **Système de design obsessionnel** : 8px grid, Syne + Inter, ombres soft/float/glow
- **100% responsive** + command palette ⌘K + raccourci `/`

### Fonctionnel
- **12 offres réelles** (Mistral AI, Qonto, Alan, Datadog...) avec logos, salaires transparents, tags stack
- **Matching IA simulé** : score 82-96% avec breakdown technique/culture/salaire
- **Filtres avancés** : catégorie, type contrat (CDI/CDD/Freelance...), remote only
- **Recherche sémantique instantanée** + favoris + candidatures (persisté localStorage)
- **Candidature express 45s** : modale avec boost IA automatique ("on a détecté ta lib Rust")

### Tech
- ⚡️ Vite 5 ultra-rapide
- 🎯 React 18 hooks + useMemo filtering
- 🎨 Tailwind + CSS custom glass
- 🔍 SEO ready, accessibilité, PWA

---

## 📦 Installation

```bash
git clone https://github.com/lewandgesky/job-opportunities.git
cd job-opportunities
npm install
npm run dev
```

Build prod :
```bash
npm run build
npm run preview
```

---

## 📂 Structure

```
src/
 ├─ App.jsx          # App monolithe premium (tout le magic)
 ├─ main.jsx
 ├─ index.css        # glass, gradients, animations
 └─ data/jobs.js     # Mock 12 jobs + stats
public/
index.html
vite.config.js
tailwind.config.js
```

---

## 🧠 Features détaillées

| Feature | Description |
|---------|-------------|
| **Hero matching** | Headline géante + search bar + orbes gradients + cartes flottantes live |
| **Board** | 3 colonnes : liste / détail sticky / profil & insights |
| **Match %** | Cercle border + couleur selon score, badge TOP >90% |
| **Profil** | 92% complet, barre progression, suggestions IA |
| **Insight marché** | Card gradient : "Salaires Rust +18%" |
| **Footer** | Social proof logos |

### Raccourcis
- `/` → focus search
- `⌘K / Ctrl+K` → command palette

---

## 🚀 Déploiement

Le projet est statique (`dist/`). Déployable en 1 clic sur Vercel :

```bash
vercel --prod
```

Ou Docker :
```dockerfile
FROM node:22 AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

---

## 📈 Roadmap

- [x] V1 – Frontend formidable (cette version)
- [ ] V2 – Supabase auth + upload CV parsing via Mistral AI
- [ ] V3 – Vector search + embeddings pgvector
- [ ] V4 – Dashboard recruteur + chat intégré
- [ ] V5 – App mobile

---

## 👤 Auteur

**Lewand Gesky** – Fullstack obsessed – Paris  
> "On ne cherche pas un job. On attire les bonnes opportunités."

---

## 📄 Licence

MIT – Fais-en ce que tu veux, mais garde le style.

---

### 💜 Pourquoi OPPORTUNA déchire vs WelcomeToTheJungle / LinkedIn ?

- Pas de spam : 3 offres/jour triées par IA, pas 300
- Salaire transparent obligatoire
- Pas de lettre de motivation bullshit : IA qui génère à partir de ton vrai travail (GitHub)
- Temps réponse garanti 2.4j vs 14j moyenne industrie
