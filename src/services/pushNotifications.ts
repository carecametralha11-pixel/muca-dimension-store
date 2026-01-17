import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export interface PushNotificationService {
  register: () => Promise<void>;
  getToken: () => Promise<string | null>;
  addListener: (callback: (notification: any) => void) => void;
}

class PushNotificationServiceImpl implements PushNotificationService {
  private token: string | null = null;
  private listeners: ((notification: any) => void)[] = [];

  async register(): Promise<void> {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications are only available on native platforms');
      return;
    }

    try {
      // Request permission
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }

      // Register for push notifications
      await PushNotifications.register();

      // Listen for registration success
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token:', token.value);
        this.token = token.value;
        // Here you could send the token to your backend
        this.saveTokenToBackend(token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
      });

      // Listen for push notifications received
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
        this.listeners.forEach(listener => listener(notification));
      });

      // Listen for action on push notification
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Push notification action performed:', action);
      });

    } catch (error) {
      console.error('Error registering push notifications:', error);
    }
  }

  async getToken(): Promise<string | null> {
    return this.token;
  }

  addListener(callback: (notification: any) => void): void {
    this.listeners.push(callback);
  }

  private async saveTokenToBackend(token: string): Promise<void> {
    // TODO: Save the token to your Supabase backend
    // This would typically involve calling an edge function or
    // storing the token in a user_devices table
    console.log('Token to save:', token);
  }
}

export const pushNotificationService = new PushNotificationServiceImpl();

// Initialize push notifications when the app starts
export const initializePushNotifications = async (): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    await pushNotificationService.register();
  }
};
