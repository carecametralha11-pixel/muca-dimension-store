import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.muca.store',
  appName: 'MUCA Store',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
      overlaysWebView: false
    }
  },
  android: {
    backgroundColor: '#000000'
  },
  ios: {
    backgroundColor: '#000000'
  }
};

export default config;
