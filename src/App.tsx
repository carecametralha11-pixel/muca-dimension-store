import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SecurityProtection from "@/components/SecurityProtection";
import SupportChatWidget from "@/components/chat/SupportChatWidget";
import ScrollToTop from "@/components/ScrollToTop";
import GlobalBanOverlay from "@/components/GlobalBanOverlay";
import ClientNotificationWidget from "@/components/ClientNotificationWidget";
import { Loader2 } from "lucide-react";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Cards = lazy(() => import("./pages/Cards"));
const Profile = lazy(() => import("./pages/Profile"));
const AddBalance = lazy(() => import("./pages/AddBalance"));
const Admin = lazy(() => import("./pages/Admin"));
const KLRemota = lazy(() => import("./pages/KLRemota"));
const NF = lazy(() => import("./pages/NF"));
const Consultavel = lazy(() => import("./pages/Consultavel"));
const CNH = lazy(() => import("./pages/CNH"));
const Atestados = lazy(() => import("./pages/Atestados"));
const PedirAtestado = lazy(() => import("./pages/PedirAtestado"));
const Contas99Uber = lazy(() => import("./pages/Contas99Uber"));
const SolicitarConta = lazy(() => import("./pages/SolicitarConta"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

// Initialize push notifications for native platforms
const usePushNotificationsInit = () => {
  useEffect(() => {
    const initPushNotifications = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          const { initializePushNotifications } = await import('./services/pushNotifications');
          await initializePushNotifications();
        }
      } catch (error) {
        console.log('Push notifications not available:', error);
      }
    };
    
    initPushNotifications();
  }, []);
};

const AppContent = () => {
  usePushNotificationsInit();
  
  return (
    <AuthProvider>
      <TooltipProvider>
        <SecurityProtection />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/add-balance" element={<ProtectedRoute><AddBalance /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/kl-remota" element={<ProtectedRoute><KLRemota /></ProtectedRoute>} />
              <Route path="/nf" element={<ProtectedRoute><NF /></ProtectedRoute>} />
              <Route path="/consultavel" element={<ProtectedRoute><Consultavel /></ProtectedRoute>} />
              <Route path="/cnh" element={<ProtectedRoute><CNH /></ProtectedRoute>} />
              <Route path="/atestados" element={<ProtectedRoute><Atestados /></ProtectedRoute>} />
              <Route path="/pedir-atestado" element={<ProtectedRoute><PedirAtestado /></ProtectedRoute>} />
              <Route path="/contas-99-uber" element={<ProtectedRoute><Contas99Uber /></ProtectedRoute>} />
              <Route path="/solicitar-conta" element={<ProtectedRoute><SolicitarConta /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <SupportChatWidget />
          <ClientNotificationWidget />
          <GlobalBanOverlay />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;
