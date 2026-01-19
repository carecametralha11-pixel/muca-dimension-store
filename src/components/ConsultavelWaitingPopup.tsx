import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Loader2, Bell, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useChatMessages, useUserChat } from '@/hooks/useSupportChat';
import { openSupportChat } from '@/components/chat/SupportChatWidget';
import { toast } from 'sonner';

interface ConsultavelWaitingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  limitAmount: number;
  price: number;
  userName: string;
}

const ConsultavelWaitingPopup: React.FC<ConsultavelWaitingPopupProps> = ({
  isOpen,
  onClose,
  limitAmount,
  price,
  userName,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hasAdminResponse, setHasAdminResponse] = useState(false);
  const { data: userChat } = useUserChat();
  const { data: messages } = useChatMessages(userChat?.id);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast.success('Notificações ativadas! Você será avisado quando o MUCA responder.');
      } else {
        toast.error('Notificações bloqueadas. Ative nas configurações do navegador.');
      }
    }
  };

  // Check for admin messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      const adminMessages = messages.filter(m => m.senderType === 'admin');
      if (adminMessages.length > 0) {
        setHasAdminResponse(true);
        // Play sound if notifications enabled
        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('MUCA respondeu!', {
            body: 'O MUCA está pronto para te atender.',
            icon: '/favicon.ico',
          });
        }
        // Play audio notification
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    }
  }, [messages, notificationsEnabled]);

  // Auto-request notification permission on open
  useEffect(() => {
    if (isOpen && 'Notification' in window && Notification.permission === 'default') {
      // Small delay for better UX
      const timer = setTimeout(() => {
        requestNotificationPermission();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleOpenChat = () => {
    openSupportChat();
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-md p-0 overflow-hidden border-primary/30 bg-gradient-to-br from-background via-background to-primary/5"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="relative">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -top-20 -right-20 w-60 h-60 bg-primary rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -bottom-20 -left-20 w-60 h-60 bg-green-500 rounded-full blur-3xl"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 p-8">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              {hasAdminResponse ? (
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </motion.div>
                </div>
              ) : (
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-primary border-r-primary/50"
                  />
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <MessageCircle className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                  >
                    <Sparkles className="h-3 w-3 text-white" />
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-6"
            >
              {hasAdminResponse ? (
                <>
                  <h2 className="text-2xl font-bold text-green-500 mb-2">
                    MUCA Respondeu!
                  </h2>
                  <p className="text-muted-foreground">
                    Clique abaixo para abrir o chat e continuar o atendimento.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2">
                    Aguarde um instante, {userName.split(' ')[0]}!
                  </h2>
                  <p className="text-muted-foreground">
                    O <span className="font-bold text-primary">MUCA</span> já vai entrar em contato com você
                  </p>
                </>
              )}
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-card/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">Limite solicitado:</span>
                <span className="font-bold text-lg">{formatCurrency(limitAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Valor:</span>
                <span className="font-bold text-lg text-primary">{formatCurrency(price)}</span>
              </div>
            </motion.div>

            {/* Waiting Animation or Action Button */}
            {hasAdminResponse ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={handleOpenChat}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Abrir Chat com MUCA
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                {/* Estimated Time */}
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Tempo estimado: menos de 3 minutos</span>
                </div>

                {/* Loading Dots */}
                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="w-3 h-3 rounded-full bg-primary"
                    />
                  ))}
                </div>

                {/* Notification Button */}
                {'Notification' in window && Notification.permission !== 'granted' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <Button
                      variant="outline"
                      onClick={requestNotificationPermission}
                      className="w-full"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Ativar Notificações
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Seja notificado quando o MUCA responder
                    </p>
                  </motion.div>
                )}

                {notificationsEnabled && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 text-green-500 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Notificações ativadas</span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Bottom Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-muted-foreground text-center mt-6"
            >
              Todo o atendimento será realizado pelo chat do site
            </motion.p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultavelWaitingPopup;
