import { CATEGORIES, TYPES_CONTRAT } from '@/lib/constants';
import { submitJob } from './actions';

export default function SubmitPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-bold tracking-tight sm:text-4xl">
          Publier une offre
        </h1>
        <p className="mt-4 text-lg text-slate-400">
          Votre offre sera publiée gratuitement après validation par notre équipe (généralement en moins de 2 heures).
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <form action={submitJob} className="p-6 sm:p-8 space-y-8">
          
          {/* Section: Informations Générales */}
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">1. L'offre</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="titre" className="block text-sm font-medium text-slate-300">
                  Titre du poste <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="titre"
                  id="titre"
                  required
                  placeholder="ex: Développeur Fullstack React/Node.js"
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 py-2.5 px-4 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="entreprise" className="block text-sm font-medium text-slate-300">
                  Nom de l'entreprise (Facultatif)
                </label>
                <input
                  type="text"
                  name="entreprise"
                  id="entreprise"
                  placeholder="Laissez vide pour 'Confidentiel'"
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 py-2.5 px-4 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="ville" className="block text-sm font-medium text-slate-300">
                  Ville <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="ville"
                  id="ville"
                  required
                  placeholder="ex: Douala, Yaoundé, Bafoussam..."
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 py-2.5 px-4 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="categorie" className="block text-sm font-medium text-slate-300">
                  Catégorie <span className="text-red-400">*</span>
                </label>
                <select
                  name="categorie"
                  id="categorie"
                  required
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 py-2.5 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="type_contrat" className="block text-sm font-medium text-slate-300">
                  Type de contrat <span className="text-red-400">*</span>
                </label>
                <select
                  name="type_contrat"
                  id="type_contrat"
                  required
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 py-2.5 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  <option value="">Sélectionnez un contrat</option>
                  {TYPES_CONTRAT.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-300">
                  Description détaillée <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  id="description"
                  required
                  rows={6}
                  placeholder="Missions, profil recherché, avantages..."
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 py-2.5 px-4 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y"
                />
              </div>
            </div>
          </div>

          {/* Section: Modalités */}
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">2. Détails optionnels</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="niveau_experience" className="block text-sm font-medium text-slate-300">
                  Expérience requise
                </label>
                <select
                  name="niveau_experience"
                  id="niveau_experience"
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 py-2.5 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  <option value="Non spécifié">Non spécifié</option>
                  <option value="Débutant">Débutant (0-2 ans)</option>
                  <option value="Junior">Junior (2-5 ans)</option>
                  <option value="Confirmé">Confirmé (5-10 ans)</option>
                  <option value="Senior">Senior (+10 ans)</option>
                </select>
              </div>

              <div>
                <label htmlFor="salaire_fourchette" className="block text-sm font-medium text-slate-300">
                  Fourchette de salaire
                </label>
                <input
                  type="text"
                  name="salaire_fourchette"
                  id="salaire_fourchette"
                  placeholder="ex: 150k - 250k FCFA"
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 py-2.5 px-4 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="langues" className="block text-sm font-medium text-slate-300">
                  Langues
                </label>
                <input
                  type="text"
                  name="langues"
                  id="langues"
                  defaultValue="Français"
                  placeholder="ex: Français, Anglais"
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 py-2.5 px-4 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="flyer" className="block text-sm font-medium text-slate-300">
                  Image / Flyer de l'offre (Optionnel)
                </label>
                <input
                  type="file"
                  name="flyer"
                  id="flyer"
                  accept="image/jpeg, image/png, image/webp"
                  className="mt-1 block w-full text-sm text-slate-400
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary/20 file:text-primary
                    hover:file:bg-primary/30 file:transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section: Contact */}
          <div>
            <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">3. Comment postuler ?</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="contact_methode" className="block text-sm font-medium text-slate-300">
                  Méthode de contact <span className="text-red-400">*</span>
                </label>
                <select
                  name="contact_methode"
                  id="contact_methode"
                  required
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 py-2.5 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  <option value="email">Adresse Email</option>
                  <option value="whatsapp">Numéro WhatsApp</option>
                  <option value="lien">Lien externe (Google Form, etc.)</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact_valeur" className="block text-sm font-medium text-slate-300">
                  Valeur du contact <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="contact_valeur"
                  id="contact_valeur"
                  required
                  placeholder="ex: rh@entreprise.com"
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-900/50 py-2.5 px-4 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Soumettre pour validation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
