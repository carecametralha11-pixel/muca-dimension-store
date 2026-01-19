import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Sparkles, MessageCircle, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useClientNotifications } from '@/hooks/useClientNotifications';
import { openSupportChat } from '@/components/chat/SupportChatWidget';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientNotification {
  id: string;
  type: 'promo' | 'chat' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const ClientNotificationWidget: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const { hasAdminResponse, resetAdminResponse } = useClientNotifications();

  // Add notification when admin responds
  useEffect(() => {
    if (hasAdminResponse) {
      const newNotification: ClientNotification = {
        id: `admin-${Date.now()}`,
        type: 'chat',
        title: 'Nova mensagem do suporte!',
        message: 'O administrador respondeu sua mensagem. Clique para abrir o chat.',
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
      resetAdminResponse();
    }
  }, [hasAdminResponse, resetAdminResponse]);

  // Add promotional notification on mount (example)
  useEffect(() => {
    const hasSeenPromo = localStorage.getItem('seen_promo_notification');
    if (!hasSeenPromo && user) {
      setTimeout(() => {
        const promoNotification: ClientNotification = {
          id: 'promo-welcome',
          type: 'promo',
          title: '🎉 Bem-vindo ao MUCA!',
          message: 'Confira nossas ofertas exclusivas e adicione saldo para aproveitar!',
          timestamp: new Date(),
          read: false,
        };
        setNotifications(prev => [promoNotification, ...prev]);
        localStorage.setItem('seen_promo_notification', 'true');
      }, 3000);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: ClientNotification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );

    if (notification.type === 'chat') {
      setIsOpen(false);
      openSupportChat();
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getIcon = (type: ClientNotification['type']) => {
    switch (type) {
      case 'promo':
        return <Percent className="h-4 w-4 text-yellow-500" />;
      case 'chat':
        return <MessageCircle className="h-4 w-4 text-primary" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-500" />;
    }
  };

  // Don't show while loading, for non-logged-in users, or for admins
  if (isLoading || !user || isAdmin) return null;

  return (
    <>
      {/* Notification Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 left-6 z-[9998]"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-white hover:bg-gray-100 shadow-xl border-2 border-yellow-500 relative"
              title="Notificações"
            >
              <Bell className="h-6 w-6 text-yellow-600" />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.div>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-[9998] w-[320px] sm:w-[360px] h-[450px] bg-card border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span className="font-semibold">Notificações</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {unreadCount} novas
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={markAllAsRead}
                >
                  Marcar como lidas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:text-destructive"
                  onClick={clearNotifications}
                >
                  Limpar
                </Button>
              </div>
            )}

            {/* Notifications List */}
            <ScrollArea className="flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
                  <p className="text-muted-foreground text-sm">
                    Você receberá notificações de promoções e mensagens do suporte aqui.
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        !notification.read ? 'bg-primary/5 border-primary/20' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            notification.type === 'promo' ? 'bg-yellow-100' :
                            notification.type === 'chat' ? 'bg-primary/10' : 'bg-blue-100'
                          }`}>
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm truncate">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <span className="text-xs text-muted-foreground mt-2 block">
                              {format(notification.timestamp, 'dd/MM HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ClientNotificationWidget;
