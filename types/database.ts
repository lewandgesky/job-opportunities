// Types correspondant au schéma SQL de la base de données Supabase

export interface OffreEmploi {
  id: string;
  titre: string;
  entreprise: string;
  ville: string;
  categorie: string;
  type_contrat: string;
  description: string;

  // Contact candidature
  contact_methode: 'whatsapp' | 'email' | 'lien';
  contact_valeur: string;

  // Médias
  flyer_url: string | null;
  flyer_public_id: string | null;

  // Métadonnées offre
  niveau_experience: string;
  salaire_fourchette: string | null;
  langues: string;
  date_limite: string | null;

  // Workflow & Statut
  statut: 'EN_ATTENTE' | 'PUBLIE' | 'REJETE' | 'EXPIRE' | 'DESACTIVE';

  // Sponsoring
  est_epingle: boolean;
  date_epingle: string | null;
  duree_epingle_jours: number;

  // Métadonnées système
  created_at: string;
  updated_at: string;
  published_at: string | null;
  expires_at: string;

  // Tracking
  vues_count: number;
  candidatures_count: number;

  // Admin
  admin_notes: string | null;
  submitted_by_ip: string | null;
}

export interface PushSubscription {
  id: string;
  one_signal_id: string;
  categories: string[];
  ville_preferee: string | null;
  created_at: string;
  last_active: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: 'VALIDATE' | 'REJECT' | 'DELETE' | 'EDIT';
  offre_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface Signalement {
  id: string;
  offre_id: string;
  motif: string;
  description: string | null;
  contact_signalant: string | null;
  statut: 'EN_ATTENTE' | 'TRAITE' | 'IGNORE';
  created_at: string;
}

// Types utilitaires pour les filtres
export interface OffresFilters {
  ville?: string;
  categorie?: string;
  type_contrat?: string;
  search?: string;
}

// Type pour la réponse API standardisée
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
