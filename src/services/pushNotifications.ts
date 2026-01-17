// Push notification service for native platforms
// Uses dynamic imports to avoid issues on web

export interface PushNotificationService {
  register: () => Promise<void>;
  getToken: () => Promise<string | null>;
  addListener: (callback: (notification: any) => void) => void;
}

class PushNotificationServiceImpl implements PushNotificationService {
  private token: string | null = null;
  private listeners: ((notification: any) => void)[] = [];
  private isNative: boolean = false;

  async checkPlatform(): Promise<boolean> {
    try {
      const { Capacitor } = await import('@capacitor/core');
      this.isNative = Capacitor.isNativePlatform();
      return this.isNative;
    } catch {
      return false;
    }
  }

  async register(): Promise<void> {
    const isNative = await this.checkPlatform();
    
    if (!isNative) {
      console.log('Push notifications are only available on native platforms');
      return;
    }

    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      
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
    // Save the token to Supabase for sending notifications later
    console.log('Push notification token:', token);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // You can save this token to a user_devices table if needed
        console.log('User ID for push token:', user.id);
      }
    } catch (error) {
      console.log('Could not save token to backend:', error);
    }
  }
}

export const pushNotificationService = new PushNotificationServiceImpl();

// Initialize push notifications when the app starts
export const initializePushNotifications = async (): Promise<void> => {
  const isNative = await pushNotificationService.checkPlatform();
  if (isNative) {
    await pushNotificationService.register();
  }
};
