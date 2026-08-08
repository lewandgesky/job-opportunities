'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Wand2, Upload, FileText } from 'lucide-react';
import { importJobAction } from '../actions';
import { VILLES, CATEGORIES, TYPES_CONTRAT, NIVEAUX_EXPERIENCE, CONTACT_METHODES } from '@/lib/constants';
import clsx from 'clsx';

export default function AdminImportPage() {
  const router = useRouter();
  
  // States AI Parsing
  const [rawText, setRawText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  
  // States Formulaire (rempli par l'IA)
  const [parsedData, setParsedData] = useState<any>(null);
  const [formKey, setFormKey] = useState(0); // Force React à re-monter le form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 4Mo');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageBase64(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleParse = async () => {
    if (!rawText.trim() && !imageBase64) {
      setParseError('Veuillez entrer du texte ou une image.');
      return;
    }
    
    setIsParsing(true);
    setParseError('');
    
    try {
      const res = await fetch('/api/parse-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText, imageBase64 }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'analyse');
      }
      
      // Log pour debug
      console.log('🤖 Résultat IA:', JSON.stringify(data.data, null, 2));
      
      setParsedData(data.data);
      setFormKey(prev => prev + 1); // Force le re-render du formulaire
    } catch (err: any) {
      setParseError(err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const formData = new FormData(e.currentTarget);
      
      // Si on a uploadé une image pour l'IA, on la réinjecte dans le form
      // pour la sauvegarder sur Cloudinary (optionnel)
      if (fileInputRef.current?.files?.[0]) {
        formData.set('flyer', fileInputRef.current.files[0]);
      }

      await importJobAction(formData);
      router.push('/admin/published');
    } catch (err: any) {
      setSubmitError(err.message || 'Erreur inconnue');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Wand2 className="text-[var(--color-primary)] h-8 w-8" />
          Import Magique IA
        </h1>
        <p className="text-slate-400 mt-2">
          Collez le texte brut depuis WhatsApp ou uploadez un flyer. L'IA Gemini extraira automatiquement toutes les informations pour pré-remplir l'offre.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLONNE GAUCHE : Entrée des données brutes */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-400" />
              Source brute
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Texte de l'offre (ex: Message WhatsApp)</label>
                <textarea
                  className="w-full h-48 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  placeholder="Collez le texte brut ici..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ou uploadez un Flyer (Image)</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-primary/50 transition-colors rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center text-center">
                    <Upload className="h-6 w-6 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-300">Cliquez pour choisir une image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </label>
                  {imageBase64 && (
                    <div className="h-24 w-24 rounded-lg overflow-hidden border border-slate-700 relative flex-shrink-0 bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageBase64} alt="Aperçu" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              {parseError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                  {parseError}
                </div>
              )}

              <button
                onClick={handleParse}
                disabled={isParsing || (!rawText.trim() && !imageBase64)}
                className="w-full py-3 bg-[var(--color-primary)] hover:brightness-110 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isParsing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
                {isParsing ? 'Analyse en cours...' : 'Générer l\'offre avec l\'IA'}
              </button>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : Formulaire pré-rempli */}
        <div className={clsx("transition-all duration-500", !parsedData && "opacity-30 pointer-events-none")}>
          <div className="bg-white/5 border border-[var(--color-primary)]/20 p-6 rounded-2xl relative overflow-hidden">
            {/* Déco */}
            <div className="absolute top-0 right-0 p-3 bg-[var(--color-primary)]/10 rounded-bl-2xl text-xs font-bold text-[var(--color-primary)]">
              RÉSULTAT IA
            </div>
            
            <h2 className="text-xl font-semibold mb-6">Vérifier & Publier</h2>
            
            <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Titre de l'offre</label>
                <input required type="text" name="titre" defaultValue={parsedData?.titre || ''} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Entreprise</label>
                  <input required type="text" name="entreprise" defaultValue={parsedData?.entreprise || 'Confidentiel'} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Ville</label>
                  <select name="ville" defaultValue={parsedData?.ville || 'Douala'} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white">
                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Catégorie</label>
                  <select name="categorie" defaultValue={parsedData?.categorie || CATEGORIES[0]} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Type de contrat</label>
                  <select name="type_contrat" defaultValue={parsedData?.type_contrat || 'CDD'} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white">
                    {TYPES_CONTRAT.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description détaillée</label>
                <textarea required name="description" defaultValue={parsedData?.description || ''} className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white resize-y" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Contact principal</label>
                  <select name="contact_methode" defaultValue={parsedData?.contact_methode || 'whatsapp'} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white">
                    {CONTACT_METHODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Valeur (ex: +237...)</label>
                  <input required type="text" name="contact_valeur" defaultValue={parsedData?.contact_valeur || ''} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                </div>
              </div>

              {/* Second contact (optionnel, rempli par l'IA si 2 moyens détectés) */}
              {parsedData?.contact_methode_2 && parsedData.contact_methode_2 !== 'aucun' && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-emerald-400 mb-1">Contact secondaire</label>
                    <select name="contact_methode_2" defaultValue={parsedData?.contact_methode_2} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white">
                      {CONTACT_METHODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-400 mb-1">Valeur secondaire</label>
                    <input type="text" name="contact_valeur_2" defaultValue={parsedData?.contact_valeur_2 || ''} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Expérience</label>
                  <select name="niveau_experience" defaultValue={parsedData?.niveau_experience || 'Non spécifié'} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white">
                    {NIVEAUX_EXPERIENCE.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Salaire</label>
                  <input type="text" name="salaire_fourchette" defaultValue={parsedData?.salaire_fourchette || ''} placeholder="Ex: 50 000 FCFA" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Langues</label>
                  <input type="text" name="langues" defaultValue={parsedData?.langues || 'Français'} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                </div>
              </div>

              {submitError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 mt-4">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !parsedData}
                className="w-full mt-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Publier directement'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
