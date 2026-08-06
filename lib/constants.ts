// Villes prédéfinies pour le marché camerounais
export const VILLES = [
  'Douala',
  'Yaoundé',
  'Bafoussam',
  'Garoua',
  'Bamenda',
  'Kribi',
  'Buea',
  'Limbe',
  'Maroua',
  'Ngaoundéré',
  'Ebolowa',
  'Bertoua',
  'Remote / Télétravail',
] as const;

export type Ville = (typeof VILLES)[number];

// Catégories d'emploi
export const CATEGORIES = [
  'Tech & Web',
  'Comptabilité & Finance',
  'Commerce & Vente',
  'BTP & Artisanat',
  'Enseignement',
  'Transport & Logistique',
  'Santé & Médical',
  'Hôtellerie & Restauration',
  "Stages & Job d'été",
  'Administration & Secrétariat',
  'Autres',
] as const;

export type Categorie = (typeof CATEGORIES)[number];

// Types de contrat
export const TYPES_CONTRAT = [
  'CDI',
  'CDD',
  'Stage',
  'Freelance',
  'Alternance',
] as const;

export type TypeContrat = (typeof TYPES_CONTRAT)[number];

// Niveaux d'expérience
export const NIVEAUX_EXPERIENCE = [
  'Débutant',
  'Junior',
  'Confirmé',
  'Senior',
  'Non spécifié',
] as const;

export type NiveauExperience = (typeof NIVEAUX_EXPERIENCE)[number];

// Méthodes de contact
export const CONTACT_METHODES = ['whatsapp', 'email', 'lien'] as const;

export type ContactMethode = (typeof CONTACT_METHODES)[number];

// Statuts des offres
export const STATUTS_OFFRE = [
  'EN_ATTENTE',
  'PUBLIE',
  'REJETE',
  'EXPIRE',
  'DESACTIVE',
] as const;

export type StatutOffre = (typeof STATUTS_OFFRE)[number];

// Couleurs associées aux catégories (pour les badges)
export const CATEGORIE_COLORS: Record<Categorie, string> = {
  'Tech & Web': '#6366f1',
  'Comptabilité & Finance': '#0ea5e9',
  'Commerce & Vente': '#f59e0b',
  'BTP & Artisanat': '#ef4444',
  'Enseignement': '#10b981',
  'Transport & Logistique': '#8b5cf6',
  'Santé & Médical': '#ec4899',
  'Hôtellerie & Restauration': '#f97316',
  "Stages & Job d'été": '#14b8a6',
  'Administration & Secrétariat': '#6b7280',
  'Autres': '#a855f7',
};

// Couleurs associées aux types de contrat
export const CONTRAT_COLORS: Record<TypeContrat, string> = {
  'CDI': '#10b981',
  'CDD': '#0ea5e9',
  'Stage': '#f59e0b',
  'Freelance': '#8b5cf6',
  'Alternance': '#ec4899',
};

// Icônes emoji pour les catégories (utilisé dans les filtres)
export const CATEGORIE_ICONS: Record<Categorie, string> = {
  'Tech & Web': '💻',
  'Comptabilité & Finance': '📊',
  'Commerce & Vente': '🛒',
  'BTP & Artisanat': '🏗️',
  'Enseignement': '📚',
  'Transport & Logistique': '🚛',
  'Santé & Médical': '⚕️',
  'Hôtellerie & Restauration': '🏨',
  "Stages & Job d'été": '🎓',
  'Administration & Secrétariat': '📋',
  'Autres': '📌',
};
