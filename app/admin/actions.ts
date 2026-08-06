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

