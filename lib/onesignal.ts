// Helper pour envoyer des notifications Push via l'API REST de OneSignal
// À utiliser uniquement côté serveur (API Routes, Server Actions)

export async function sendPushNotification(
  title: string,
  message: string,
  url: string
) {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  const restApiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !restApiKey) {
    console.warn(
      'OneSignal: Variables manquantes (NEXT_PUBLIC_ONESIGNAL_APP_ID ou ONESIGNAL_REST_API_KEY)'
    );
    return false;
  }

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${restApiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ['All'],
        headings: { en: title, fr: title },
        contents: { en: message, fr: message },
        url: url,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur API OneSignal:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur réseau lors de l\'envoi de la notification Push:', error);
    return false;
  }
}
