import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
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
    const isNative = Capacitor.isNativePlatform();
    setIsSupported(isNative);

    if (isNative) {
      initializePushNotifications().then(() => {
        setIsRegistered(true);
        pushNotificationService.getToken().then(setToken);
      });

      pushNotificationService.addListener((notification) => {
        setLastNotification({
          id: notification.id,
          title: notification.title,
          body: notification.body,
          data: notification.data
        });
      });
    }
  }, []);

  const register = useCallback(async () => {
    if (!isSupported) return;
    
    await pushNotificationService.register();
    setIsRegistered(true);
    const newToken = await pushNotificationService.getToken();
    setToken(newToken);
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
