'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { sendPushNotification } from '@/lib/onesignal';
import { deleteImage } from '@/lib/cloudinary';

/**
 * Approuve une offre et la publie.
 * Déclenche une notification Push.
 */
export async function approveJob(id: string, notify = true) {
  const supabase = createAdminClient();

  const { data: offre, error } = await supabase
    .from('offres_emploi')
    .update({ 
      statut: 'PUBLIE', 
      published_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select('titre, entreprise, ville')
    .single();

  if (error || !offre) {
    console.error('Erreur approbation:', error);
    throw new Error('Erreur lors de l\'approbation.');
  }

  // Envoi de la notification Push
  if (notify) {
    const url = `https://job-opportunities.cm/offre/${id}`;
    const message = `Nouvelle offre : ${offre.titre} chez ${offre.entreprise} à ${offre.ville}`;
    await sendPushNotification('Nouveau Job Disponible !', message, url);
  }

  revalidatePath('/');
  revalidatePath('/admin/pending');
  revalidatePath('/admin/published');
}

/**
 * Rejette une offre (la garde dans la BDD avec statut REJETE)
 */
export async function rejectJob(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('offres_emploi')
    .update({ statut: 'REJETE' })
    .eq('id', id);

  if (error) throw new Error('Erreur rejet');
  
  revalidatePath('/admin/pending');
}

/**
 * Supprime définitivement une offre et son flyer associé sur Cloudinary
 */
export async function deleteJob(id: string, flyerPublicId?: string | null) {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('offres_emploi')
    .delete()
    .eq('id', id);

  if (error) throw new Error('Erreur suppression');

  // Nettoyage Cloudinary
  if (flyerPublicId) {
    await deleteImage(flyerPublicId);
  }

  revalidatePath('/');
  revalidatePath('/admin/published');
  revalidatePath('/admin/pending');
}

/**
 * Épingle une offre (mise en avant)
 */
export async function pinJob(id: string, isPinned: boolean) {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('offres_emploi')
    .update({ 
      est_epingle: isPinned,
      date_epingle: isPinned ? new Date().toISOString() : null
    })
    .eq('id', id);

  if (error) throw new Error('Erreur epinglage');

  revalidatePath('/');
  revalidatePath('/admin/published');
}

/**
 * Ignore un signalement (le marque comme TRAITE)
 */
export async function ignoreReport(reportId: string) {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('signalements')
    .update({ statut: 'TRAITE' })
    .eq('id', reportId);

  if (error) throw new Error('Erreur traitement signalement');

  revalidatePath('/admin/reports');
}

/**
 * Importe une offre d'emploi directement depuis l'admin (souvent après parsing IA)
 * Le statut est automatiquement mis à 'PUBLIE'.
 */
export async function importJobAction(formData: FormData) {
  const supabase = createAdminClient();

  const titre = formData.get('titre') as string;
  const entreprise = formData.get('entreprise') as string;
  const ville = formData.get('ville') as string;
  const categorie = formData.get('categorie') as string;
  const type_contrat = formData.get('type_contrat') as string;
  let description = formData.get('description') as string;
  let contact_methode = formData.get('contact_methode') as string;
  let contact_valeur = formData.get('contact_valeur') as string;
  const niveau_experience = formData.get('niveau_experience') as string;
  const salaire_fourchette = formData.get('salaire_fourchette') as string;
  const langues = formData.get('langues') as string;

  // Gestion du double contact (email + whatsapp)
  const contact_methode_2 = formData.get('contact_methode_2') as string | null;
  const contact_valeur_2 = formData.get('contact_valeur_2') as string | null;

  if (contact_methode_2 && contact_valeur_2) {
    // On a deux contacts. Prioriser WhatsApp comme bouton principal (plus utile pour les candidats).
    // L'autre contact sera ajouté à la description.
    if (contact_methode === 'whatsapp') {
      // WhatsApp est déjà le principal → ajouter le second (email/lien) dans la description
      const label2 = contact_methode_2 === 'email' ? '📧 Email' : contact_methode_2 === 'lien' ? '🔗 Lien' : '📱 WhatsApp';
      description += `\n\n${label2} : ${contact_valeur_2}`;
    } else if (contact_methode_2 === 'whatsapp') {
      // Le second est WhatsApp → on l'utilise comme principal, et on met le premier dans la description
      const label1 = contact_methode === 'email' ? '📧 Email' : contact_methode === 'lien' ? '🔗 Lien' : '📱 Contact';
      description += `\n\n${label1} : ${contact_valeur}`;
      contact_methode = 'whatsapp';
      contact_valeur = contact_valeur_2;
    } else {
      // Aucun n'est WhatsApp → garder le premier, ajouter le second dans la description
      const label2 = contact_methode_2 === 'email' ? '📧 Email' : '🔗 Lien';
      description += `\n\n${label2} : ${contact_valeur_2}`;
    }
  }

  // L'upload de flyer n'est pas géré ici pour simplifier (l'IA analyse l'image locale, l'admin peut l'uploader s'il veut, 
  // mais on peut le rajouter. Pour l'instant on se concentre sur les textes).
  // Si on veut uploader l'image, on réutilise Cloudinary.
  const file = formData.get('flyer') as File | null;
  let flyer_url = null;
  let flyer_public_id = null;

  if (file && file.size > 0) {
    const fromSubmitActions = await import('@/app/submit/actions');
    // On doit extraire la logique Cloudinary, mais vu que la méthode est uploadImage(buffer), on peut l'utiliser directement.
    const { uploadImage } = await import('@/lib/cloudinary');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Resize si besoin
    const sharp = await import('sharp');
    const optimizedBuffer = await sharp.default(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Cloudinary upload (attend une data URI en base64)
    const base64Data = optimizedBuffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64Data}`;

    const uploadResult = await uploadImage(dataUri, 'job_flyers');
    
    if (!uploadResult) {
      throw new Error("L'upload de l'image a échoué. Veuillez réessayer.");
    }
    
    flyer_url = uploadResult.url; // la fonction uploadImage renvoie { url, public_id }
    flyer_public_id = uploadResult.public_id;
  }

  const { data, error } = await supabase
    .from('offres_emploi')
    .insert([
      {
        titre,
        entreprise: entreprise || 'Confidentiel',
        ville,
        categorie,
        type_contrat,
        description,
        contact_methode,
        contact_valeur,
        niveau_experience,
        salaire_fourchette: salaire_fourchette || null,
        langues: langues || 'Français',
        flyer_url,
        flyer_public_id,
        statut: 'PUBLIE', // On publie directement
        published_at: new Date().toISOString(),
      },
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Erreur import:', error);
    throw new Error('Erreur lors de la publication de l\'offre.');
  }

  // Envoi de la notification Push via OneSignal
  try {
    const { sendPushNotification } = await import('@/lib/onesignal');
    await sendPushNotification(
      `Nouvelle offre : ${titre} (${ville})`,
      `${entreprise} recrute en ${type_contrat}. Postulez maintenant !`,
      `https://job-opportunities.cm/offre/${data.id}`,
      categorie
    );
  } catch (err) {
    console.error('Erreur envoi notification push:', err);
    // On ne bloque pas si la notif échoue
  }

  revalidatePath('/');
  revalidatePath('/admin/published');
}


