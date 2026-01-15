import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import logo from '@/assets/logo-muca.png';
import BanCheckOverlay from '@/components/BanCheckOverlay';
import { supabase } from '@/integrations/supabase/client';

// Play ban message using Web Speech API
const playBanMessageTTS = async () => {
  let message = 'Você foi banido do sistema. Sua conta foi suspensa.';
  
  try {
    const { data } = await (supabase
      .from('ban_messages' as any)
      .select('message')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle() as any);
    
    if (data?.message) {
      message = data.message;
    }
  } catch (error) {
    console.error('Error fetching ban message:', error);
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(voice => 
      voice.lang.includes('pt') || voice.lang.includes('BR')
    );
    if (ptVoice) {
      utterance.voice = ptVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showBanCheck, setShowBanCheck] = useState(false);
  const [isBannedUser, setIsBannedUser] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  // Load voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsBannedUser(false);

    try {
      if (isLogin) {
        // Show the identity check overlay
        setShowBanCheck(true);

        // First, check if user exists and is banned BEFORE attempting login
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_banned')
          .eq('email', formData.email)
          .maybeSingle();

        if (profileData?.is_banned) {
          // User is banned - show banned state and play audio
          setIsBannedUser(true);
          await playBanMessageTTS();
          setIsLoading(false);
          return; // Stay on the overlay
        }

        // Proceed with login if not banned
        const { error } = await login(formData.email, formData.password);
        if (error) {
          setShowBanCheck(false);
          toast.error(error);
        } else {
          // Login successful, overlay will close automatically
          toast.success('Login realizado com sucesso!');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('As senhas não coincidem');
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          toast.error('A senha deve ter pelo menos 6 caracteres');
          setIsLoading(false);
          return;
        }
        if (!formData.name.trim()) {
          toast.error('Informe seu nome');
          setIsLoading(false);
          return;
        }
        const { error } = await register(formData.name, formData.email, formData.password);
        if (error) {
          toast.error(error);
        } else {
          toast.success('Conta criada com sucesso!');
          navigate('/');
        }
      }
    } finally {
      if (!isBannedUser) {
        setIsLoading(false);
      }
    }
  };

  const handleOverlayComplete = () => {
    setShowBanCheck(false);
    if (!isBannedUser) {
      navigate('/');
    }
  };

  return (
    <>
      {/* Ban Check Overlay */}
      <BanCheckOverlay
        isVisible={showBanCheck}
        isBanned={isBannedUser}
        onComplete={handleOverlayComplete}
        banMessage="Sua conta foi banida. Acesso negado ao sistema."
      />

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={logo} alt="MUCA" className="h-16 w-16 rounded-full object-cover ring-2 ring-border" />
            </div>
            <div>
              <CardTitle className="font-grotesk text-xl">
                {isLogin ? 'Entrar' : 'Criar conta'}
              </CardTitle>
              <CardDescription className="mt-1">
                {isLogin 
                  ? 'Entre na sua conta para continuar' 
                  : 'Crie sua conta para começar'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Nome"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Confirmar senha"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-10"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  isLogin ? 'Entrar' : 'Criar conta'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </>
  );
};

export default Auth;
