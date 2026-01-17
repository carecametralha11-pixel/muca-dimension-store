import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3b12f888a07e48acb180e99221df375d',
  appName: 'muca-dimension-store',
  webDir: 'dist',
  server: {
    url: 'https://3b12f888-a07e-48ac-b180-e99221df375d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
