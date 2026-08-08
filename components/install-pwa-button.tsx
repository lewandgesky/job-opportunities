'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Écoute l'événement natif d'installation
    const handleBeforeInstallPrompt = (e: Event) => {
      // Empêche le comportement par défaut (l'affichage de la mini-bannière sur anciens navigateurs)
      e.preventDefault();
      // Sauvegarde l'événement pour pouvoir l'appeler au clic
      setDeferredPrompt(e);
      // Affiche le bouton
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Affiche le prompt natif d'installation
    deferredPrompt.prompt();

    // Attend le choix de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;
    
    // Si l'utilisateur a accepté, on peut masquer le bouton
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    
    // On réinitialise l'événement
    setDeferredPrompt(null);
  };

  // Si l'application n'est pas installable (soit déjà installée, soit pas compatible, soit pas de logo/manifest valide), on ne montre rien
  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 hover:shadow-lg active:scale-[0.97]"
    >
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Installer l'App</span>
      <span className="sm:hidden">Installer</span>
    </button>
  );
}
