
import { NotificationType } from '../types';

/**
 * Serviço de Notificações Profissional para CyBerPhone
 * Suporta Local Notifications e Web Push via Service Worker
 */

export const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn("Ambiente não suporta notificações.");
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  
  if (permission === 'granted' && isPushSupported()) {
    await registerAndSubscribePush();
  }
  
  return permission;
};

/**
 * Registra o Service Worker e cria a assinatura de Push
 */
const registerAndSubscribePush = async () => {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('SW registrado para Push:', registration);

    // Chave VAPID pública válida (exemplo)
    // Em produção, use process.env.VITE_VAPID_PUBLIC_KEY
    const publicVapidKey = 'BEl62vp9IHZisOV0QXZf8azm2vVvF-W66XlE16-96WqL_K5f3tF7_p03-B5_6-6WqL_K5f3tF7_p03-B5_6-6WqL_K5f3tF7_p03';
    
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
      } catch (subError) {
        console.warn('Assinatura de Push não disponível ou chave inválida:', subError);
        return null;
      }
    }

    // Aqui você enviaria a 'subscription' para o seu backend via Supabase/API
    // console.log('Push Subscription Ativa:', JSON.stringify(subscription));
    return subscription;
  } catch (error) {
    console.error('Falha ao assinar Push:', error);
  }
};

interface ShowNotificationOptions {
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
}

/**
 * Dispara uma notificação local (fallback ou imediata)
 */
export const showNotification = async (title: string, options: ShowNotificationOptions) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  try {
    // Tenta usar o Service Worker para mostrar a notificação (melhor para mobile/background)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, {
        body: options.body,
        icon: options.icon || '/icon-192x192.png',
        tag: options.tag || 'general',
        data: { url: options.url || '/' },
        vibrate: [200, 100, 200]
      } as any);
    } else {
      // Fallback para Notificação de Janela clássica
      const notification = new Notification(title, {
        body: options.body,
        icon: options.icon || '/icon-192x192.png',
      });
      notification.onclick = () => {
        window.focus();
        if (options.url) window.location.href = options.url;
        notification.close();
      };
    }
  } catch (error) {
    console.warn("Erro ao exibir notificação:", error);
  }
};

/**
 * Gera título e corpo da notificação baseado no tipo
 */
export const getNotificationContent = (type: NotificationType, actorName: string, groupName?: string) => {
  switch (type) {
    case NotificationType.MESSAGE:
      return { title: `Nova Mensagem de ${actorName}`, body: 'Toque para responder.' };
    case NotificationType.GROUP_POST:
      return { title: `Nova mensagem em ${groupName}`, body: `${actorName} enviou algo no grupo.` };
    case NotificationType.LIKE:
      return { title: 'Nova Curtida', body: `${actorName} curtiu sua publicação.` };
    case NotificationType.COMMENT:
      return { title: 'Novo Comentário', body: `${actorName} comentou no seu post.` };
    case NotificationType.NEW_FOLLOWER:
      return { title: 'Novo Seguidor', body: `${actorName} começou a te seguir.` };
    case NotificationType.INDICATION:
      return { title: 'Indicação', body: `${actorName} indicou um conteúdo para você.` };
    case NotificationType.AFFILIATE_SALE:
      return { title: 'Venda Realizada!', body: 'Você recebeu uma comissão.' };
    default:
      return { title: 'Nova Notificação', body: 'Você tem uma nova interação no CyBerPhone.' };
  }
};

/**
 * Utilitário para converter chave VAPID
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
