import { createRoot } from "react-dom/client";
import { Capacitor } from '@capacitor/core';
import App from "./App.tsx";
import "./index.css";

// Initialize push notifications for native platforms
const initApp = async () => {
  if (Capacitor.isNativePlatform()) {
    const { initializePushNotifications } = await import('./services/pushNotifications');
    await initializePushNotifications();
  }
};

initApp();

createRoot(document.getElementById("root")!).render(<App />);
