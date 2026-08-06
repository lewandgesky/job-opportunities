'use client';

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export function OneSignalInit() {
  useEffect(() => {
    const initOneSignal = async () => {
      const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

      if (!appId) {
        console.warn('OneSignal: NEXT_PUBLIC_ONESIGNAL_APP_ID manquant');
        return;
      }

      try {
        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: true,
            prenotify: true,
            showCredit: false,
            text: {
              'tip.state.unsubscribed': "S'abonner aux alertes emploi",
              'tip.state.subscribed': "Vous êtes abonné",
              'tip.state.blocked': "Notifications bloquées",
              'message.prenotify': "Cliquez pour recevoir des alertes",
              'message.action.subscribed': "Merci de votre abonnement !",
              'message.action.resubscribed': "Vous êtes de nouveau abonné",
              'message.action.unsubscribed': "Vous ne recevrez plus d'alertes",
              'message.action.subscribing': "Abonnement en cours...",
              'dialog.main.title': "Gérer les alertes",
              'dialog.main.button.subscribe': "S'ABONNER",
              'dialog.main.button.unsubscribe': "SE DÉSABONNER",
              'dialog.blocked.title': "Débloquer les notifications",
              'dialog.blocked.message': "Veuillez autoriser les notifications dans les paramètres de votre navigateur.",
            }
          },
        });
      } catch (error) {
        console.error('Erreur initialisation OneSignal:', error);
      }
    };

    initOneSignal();
  }, []);

  return null;
}
