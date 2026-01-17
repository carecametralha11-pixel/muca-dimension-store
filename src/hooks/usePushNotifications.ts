import { useEffect, useState, useCallback } from 'react';
import { pushNotificationService, initializePushNotifications } from '@/services/pushNotifications';

interface PushNotification {
  id: string;
  title: string;
  body: string;
  data: any;
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<PushNotification | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Check if we're on a native platform using dynamic import
        const isNative = await pushNotificationService.checkPlatform();
        setIsSupported(isNative);

        if (isNative) {
          await initializePushNotifications();
          setIsRegistered(true);
          const currentToken = await pushNotificationService.getToken();
          setToken(currentToken);

          pushNotificationService.addListener((notification) => {
            setLastNotification({
              id: notification.id || Date.now().toString(),
              title: notification.title || 'Notificação',
              body: notification.body || '',
              data: notification.data || {}
            });
          });
        }
      } catch (error) {
        console.log('Push notifications not available:', error);
      }
    };

    init();
  }, []);

  const register = useCallback(async () => {
    if (!isSupported) return;
    
    try {
      await pushNotificationService.register();
      setIsRegistered(true);
      const newToken = await pushNotificationService.getToken();
      setToken(newToken);
    } catch (error) {
      console.error('Failed to register push notifications:', error);
    }
  }, [isSupported]);

  return {
    isSupported,
    isRegistered,
    token,
    lastNotification,
    register
  };
};

export default usePushNotifications;
