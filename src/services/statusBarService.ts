import { Capacitor } from '@capacitor/core';

export const configureStatusBar = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    
    // Set dark content (light icons on dark background)
    await StatusBar.setStyle({ style: Style.Dark });
    
    // Set background color
    await StatusBar.setBackgroundColor({ color: '#000000' });
    
    // Make sure status bar doesn't overlay content
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (error) {
    console.log('StatusBar not available:', error);
  }
};
