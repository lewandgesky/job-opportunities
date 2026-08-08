import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { VILLES, CATEGORIES, TYPES_CONTRAT, NIVEAUX_EXPERIENCE, CONTACT_METHODES } from '@/lib/constants';

// Limiter le temps d'exécution (60s pour les images)
export const maxDuration = 60;

// Schéma Zod strict
const jobSchema = z.object({
  titre: z.string().describe(
    'Le titre du poste. Exemples: "Ménagère", "Agent de Collecte Journalière", "Community Manager". Extraire directement du texte.'
  ),
  entreprise: z.string().describe(
    'Le nom COMPLET de l\'entreprise. Ne JAMAIS tronquer. Exemple: "CAISSE MUNICIPALE D\'AFRIQUE" (pas "CAISSE MUNICIPALE D\'AFR"). Si non mentionnée: "Confidentiel".'
  ),
  ville: z.enum(VILLES as any).describe(
    'La ville. Si un quartier est mentionné (Nkouloun, Ange Raphaël, Montée Aurore, Bali, Bonapriso = Douala. Bastos, Mvan, Omnisport = Yaoundé). Choisir la grande ville.'
  ),
  categorie: z.enum(CATEGORIES as any).describe(
    `IMPORTANT: Ne PAS choisir "Tech & Web" sauf si le poste est lié à l'informatique/développement/web.
Voici le guide OBLIGATOIRE:
- Agent de collecte, vendeur, caissier, Orange Money, commercial = "Commerce & Vente"
- Ménagère, femme de ménage, cuisinier, serveur, nounou = "Hôtellerie & Restauration"
- Community manager, développeur, infographe, IT = "Tech & Web"
- Secrétaire, assistant, réceptionniste = "Administration & Secrétariat"
- Comptable, auditeur, financier = "Comptabilité & Finance"
- Maçon, plombier, électricien, soudeur = "BTP & Artisanat"
- Chauffeur, livreur, magasinier = "Transport & Logistique"
- Professeur, répétiteur, formateur = "Enseignement"
- Infirmier, médecin, pharmacien = "Santé & Médical"
- Stage explicitement mentionné = "Stages & Job d'été"
- Rien d'autre = "Autres"`
  ),
  type_contrat: z.enum(TYPES_CONTRAT as any).describe(
    'CDI si permanent, CDD si temporaire, Stage si stage. Par défaut CDD.'
  ),
  description: z.string().describe(
    'Description COMPLÈTE et professionnelle. Inclure: missions, profil recherché (âge, diplôme, qualités), horaires, conditions. Structurer avec des retours à la ligne. Corriger les fautes. Ne rien omettre du texte original.'
  ),
  contact_methode: z.enum(CONTACT_METHODES as any).describe(
    'Le PREMIER moyen de contact mentionné. "whatsapp" si numéro WhatsApp, "email" si email, "lien" si URL.'
  ),
  contact_valeur: z.string().describe(
    'La valeur du premier contact. Numéro WhatsApp complet (ex: "693178310 / 681140892") ou email complet (ex: "exemple@gmail.com"). Ne JAMAIS tronquer.'
  ),
  contact_methode_2: z.enum([...CONTACT_METHODES, 'aucun'] as any).describe(
    'Le SECOND moyen de contact s\'il existe. Si l\'offre mentionne à la fois un email ET un WhatsApp, le second moyen va ici. "aucun" s\'il n\'y a qu\'un seul moyen de contact.'
  ),
  contact_valeur_2: z.string().nullable().describe(
    'La valeur du second contact. Null si contact_methode_2 est "aucun". Sinon l\'email complet ou le numéro.'
  ),
  niveau_experience: z.enum(NIVEAUX_EXPERIENCE as any).describe(
    '"Débutant" si "expérience non exigée/non requise". "Non spécifié" si rien n\'est dit.'
  ),
  salaire_fourchette: z.string().nullable().describe(
    'Le salaire tel quel avec "FCFA" (ex: "35 000 FCFA", "50 000 FCFA/mois"). Null si non mentionné.'
  ),
  langues: z.string().describe(
    'Langues requises. Par défaut "Français".'
  ),
});

const SYSTEM_PROMPT = `Tu es un expert RH au Cameroun. Tu analyses des offres d'emploi copiées depuis des groupes WhatsApp.

RÈGLES ABSOLUES:
1. CATÉGORIE: Un "agent de collecte" = "Commerce & Vente". Une "ménagère" = "Hôtellerie & Restauration". NE JAMAIS mettre "Tech & Web" sauf pour les métiers informatiques (développeur, community manager, etc.).
2. ENTREPRISE: Recopier le nom EN ENTIER. "CAISSE MUNICIPALE D'AFRIQUE" → "CAISSE MUNICIPALE D'AFRIQUE" (pas de troncature).
3. CONTACTS: Si l'offre donne un email ET un WhatsApp, utiliser contact_methode pour le premier ET contact_methode_2 pour le second.
4. SALAIRE: Extraire tel quel avec "FCFA".
5. QUARTIERS → VILLES: Nkouloun, Ange Raphaël, Montée Aurore, Bonabéri, Bali, Akwa = Douala. Bastos, Mvan, Nlongkak = Yaoundé.
6. EXPÉRIENCE: Si "expérience non exigée" → "Débutant".

EXEMPLES:

Texte: "CAISSE MUNICIPALE D'AFRIQUE située a Douala-nkouloun... 5 agents de collecte journalière... Envoyer CV par mail au caissemunicipaledafrique19@gmail.com Ou pas WhatsApp au 693178310/ 681140892"
Résultat attendu:
- titre: "Agent de Collecte Journalière"
- entreprise: "CAISSE MUNICIPALE D'AFRIQUE"
- ville: "Douala"
- categorie: "Commerce & Vente" (PAS "Tech & Web")
- contact_methode: "email"
- contact_valeur: "caissemunicipaledafrique19@gmail.com"
- contact_methode_2: "whatsapp"
- contact_valeur_2: "693178310 / 681140892"
- niveau_experience: "Débutant" (car "Expérience: non exigée")

Texte: "Besoin d'une ménagère... Ange Raphaël... Salaire 35000fcfa... 698959516 WhatsApp uniquement"
Résultat attendu:
- titre: "Ménagère"
- ville: "Douala"
- categorie: "Hôtellerie & Restauration" (PAS "Tech & Web")
- salaire: "35 000 FCFA"
- contact_methode: "whatsapp"
- contact_valeur: "698959516"
- contact_methode_2: "aucun"
- contact_valeur_2: null`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, imageBase64 } = body;

    if (!text && !imageBase64) {
      return new Response(JSON.stringify({ error: 'Texte ou image requis' }), { status: 400 });
    }

    const messages: any[] = [];
    const userContent: any[] = [];
    
    if (text) {
      userContent.push({ type: 'text', text: `Analyse cette offre d'emploi camerounaise et extrais les informations structurées. ATTENTION: choisis bien la catégorie (un agent de collecte = "Commerce & Vente", pas "Tech & Web").\n\n${text}` });
    }

    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      userContent.push({ type: 'image', image: base64Data });
      if (!text) {
        userContent.push({ type: 'text', text: 'Analyse ce flyer d\'offre d\'emploi camerounaise et extrais toutes les informations.' });
      }
    }

    messages.push({ role: 'user', content: userContent });

    const googleProvider = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const { object } = await generateObject({
      model: googleProvider('gemini-2.5-flash'),
      system: SYSTEM_PROMPT,
      schema: jobSchema,
      messages: messages as any,
    });

    return new Response(JSON.stringify({ success: true, data: object }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erreur Parse AI:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erreur interne' }), { status: 500 });
  }
}
