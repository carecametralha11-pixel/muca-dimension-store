import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Request notification permission
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Send browser notification
const sendBrowserNotification = (title: string, body: string, icon?: string) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'admin-notification',
      requireInteraction: true,
    });

    // Play notification sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleHQGDm+s1OSqWw4AFVWP0+6idBQAAAAAAAAAAAAAAAAAMCEARQAAAQAAAAAAAA==');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }
  return null;
};

// Format user name from purchase data
const formatUserInfo = async (userId: string) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', userId)
    .single();
  
  return profile ? { name: profile.name, email: profile.email } : { name: 'Usuário', email: '' };
};

export const useAdminNotifications = (isAdmin: boolean) => {
  const hasRequestedPermission = useRef(false);
  const lastPurchaseRef = useRef<string | null>(null);
  const lastChatRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!isAdmin) return;

    // Request notification permission on mount
    if (!hasRequestedPermission.current) {
      hasRequestedPermission.current = true;
      requestNotificationPermission().then(granted => {
        if (granted) {
          toast.success('Notificações ativadas!', {
            description: 'Você receberá alertas de novas vendas e chats.',
          });
        }
      });
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    // Subscribe to new purchases
    const purchasesChannel = supabase
      .channel('admin-purchases-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'purchases',
        },
        async (payload) => {
          // Skip initial load notifications
          if (isInitialLoadRef.current) return;
          
          const purchase = payload.new;
          
          // Prevent duplicate notifications
          if (lastPurchaseRef.current === purchase.id) return;
          lastPurchaseRef.current = purchase.id;
          
          const userInfo = await formatUserInfo(purchase.user_id);
          
          const title = '💰 Nova Venda!';
          const body = `${userInfo.name} comprou ${purchase.card_name} por R$ ${Number(purchase.price).toFixed(2)}`;
          
          // Browser notification
          sendBrowserNotification(title, body);
          
          // In-app toast
          toast.success(title, {
            description: body,
            duration: 10000,
          });
        }
      )
      .subscribe();

    // Subscribe to new support chats
    const chatsChannel = supabase
      .channel('admin-chats-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chats',
        },
        async (payload) => {
          // Skip initial load notifications
          if (isInitialLoadRef.current) return;
          
          const chat = payload.new;
          
          // Prevent duplicate notifications
          if (lastChatRef.current === chat.id) return;
          lastChatRef.current = chat.id;
          
          const title = '💬 Novo Chat de Suporte!';
          const body = `${chat.user_name} (${chat.user_email}) iniciou uma conversa`;
          
          // Browser notification
          sendBrowserNotification(title, body);
          
          // In-app toast
          toast.info(title, {
            description: body,
            duration: 10000,
          });
        }
      )
      .subscribe();

    // Subscribe to new support messages (for when admin is not on chat tab)
    const messagesChannel = supabase
      .channel('admin-messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: 'sender_type=eq.user',
        },
        async (payload) => {
          // Skip initial load notifications
          if (isInitialLoadRef.current) return;
          
          const message = payload.new;
          
          // Get chat info
          const { data: chat } = await supabase
            .from('support_chats')
            .select('user_name')
            .eq('id', message.chat_id)
            .single();
          
          if (chat) {
            const title = '📩 Nova Mensagem!';
            const body = `${chat.user_name}: ${message.message.slice(0, 50)}${message.message.length > 50 ? '...' : ''}`;
            
            // Browser notification
            sendBrowserNotification(title, body);
            
            // In-app toast
            toast.info(title, {
              description: body,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Mark initial load as complete after a short delay
    const timeout = setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 3000);

    return () => {
      clearTimeout(timeout);
      supabase.removeChannel(purchasesChannel);
      supabase.removeChannel(chatsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [isAdmin]);

  return {
    requestPermission: requestNotificationPermission,
    sendNotification: sendBrowserNotification,
  };
};
