'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { uploadImage } from '@/lib/cloudinary';
import { redirect } from 'next/navigation';

export async function submitJob(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (_) {}
        },
      },
    }
  );

  const titre = formData.get('titre') as string;
  const entreprise = (formData.get('entreprise') as string) || 'Confidentiel';
  const ville = formData.get('ville') as string;
  const categorie = formData.get('categorie') as string;
  const type_contrat = formData.get('type_contrat') as string;
  const description = formData.get('description') as string;
  const contact_methode = formData.get('contact_methode') as string;
  const contact_valeur = formData.get('contact_valeur') as string;
  const niveau_experience = formData.get('niveau_experience') as string;
  const salaire_fourchette = formData.get('salaire_fourchette') as string;
  const langues = formData.get('langues') as string;
  const file = formData.get('flyer') as File | null;

  let flyer_url = null;
  let flyer_public_id = null;

  // Traitement du fichier image (Cloudinary)
  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mime = file.type || 'image/jpeg';
    const base64Data = buffer.toString('base64');
    const fileUri = `data:${mime};base64,${base64Data}`;

    const uploadResult = await uploadImage(fileUri);
    if (uploadResult) {
      flyer_url = uploadResult.url;
      flyer_public_id = uploadResult.public_id;
    }
  }

  // Insertion dans Supabase
  const { data, error } = await supabase
    .from('offres_emploi')
    .insert([
      {
        titre,
        entreprise,
        ville,
        categorie,
        type_contrat,
        description,
        contact_methode,
        contact_valeur,
        niveau_experience: niveau_experience || 'Non spécifié',
        salaire_fourchette: salaire_fourchette || null,
        langues: langues || 'Français',
        flyer_url,
        flyer_public_id,
        statut: 'EN_ATTENTE',
      },
    ])
    .select('id')
    .single();

  if (error || !data) {
    console.error('Erreur lors de la création de l\'offre:', error);
    throw new Error('Une erreur est survenue lors de la création de l\'offre.');
  }

  // Redirection vers la page de succès
  redirect(`/submit/success?id=${data.id}`);
}
