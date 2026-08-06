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
        'Stages & Job d''été', 'Administration & Secrétariat', 'Autres'
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
    categories TEXT[] DEFAULT '{}', -- ['Tech & Web', 'Stages & Job d''été']
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
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Activer RLS
ALTER TABLE offres_emploi ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE signalements ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire les offres PUBLIE
CREATE POLICY "Offres publiques visibles" ON offres_emploi
    FOR SELECT USING (statut = 'PUBLIE');

-- Politique: Insertion publique pour le formulaire (si formulaire public)
CREATE POLICY "Insertion formulaire" ON offres_emploi
    FOR INSERT WITH CHECK (statut = 'EN_ATTENTE');
