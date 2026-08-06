import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNowStrict, differenceInHours, differenceInDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Merge des classes Tailwind sans conflit
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Badge temporel dynamique selon le cahier des charges
export function getTimeBadge(date: string | Date): { text: string; variant: 'fresh' | 'recent' | 'normal' | 'old' } {
  const now = new Date();
  const target = new Date(date);
  const hoursAgo = differenceInHours(now, target);
  const daysAgo = differenceInDays(now, target);

  if (hoursAgo < 24) {
    return { text: "Aujourd'hui", variant: 'fresh' };
  }
  if (hoursAgo < 48) {
    return { text: 'Hier', variant: 'recent' };
  }
  if (daysAgo <= 7) {
    return {
      text: formatDistanceToNowStrict(target, { locale: fr, addSuffix: true }),
      variant: 'normal',
    };
  }
  if (daysAgo <= 30) {
    return { text: 'Cette semaine', variant: 'normal' };
  }
  return {
    text: format(target, 'dd MMM yyyy', { locale: fr }),
    variant: 'old',
  };
}

// Formatage de date pour l'affichage
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
}

// Tronquer un texte à une longueur donnée
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

// Générer le lien WhatsApp pour postuler
export function getWhatsAppLink(phone: string, jobTitle: string): string {
  const message = encodeURIComponent(
    `Bonjour, je souhaite postuler pour le poste "${jobTitle}" vu sur job-opportunities.cm. Merci de votre retour.`
  );
  // Nettoyer le numéro de téléphone (garder uniquement les chiffres et le +)
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

// Générer le lien mailto pour postuler
export function getMailtoLink(email: string, jobTitle: string): string {
  const subject = encodeURIComponent(`Candidature: ${jobTitle} — job-opportunities.cm`);
  const body = encodeURIComponent(
    `Bonjour,\n\nJe souhaite postuler pour le poste "${jobTitle}" vu sur job-opportunities.cm.\n\nVeuillez trouver mon CV en pièce jointe.\n\nCordialement.`
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

// Formater le salaire
export function formatSalaire(salaire: string | null): string {
  if (!salaire) return 'Non communiqué';
  return salaire;
}
