import { redirect } from 'next/navigation';

// La page /admin redirige vers la liste des offres en attente
export default function AdminPage() {
  redirect('/admin/pending');
}
