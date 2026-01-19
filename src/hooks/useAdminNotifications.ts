import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

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

// Play notification sound with high volume
const playNotificationSound = (loud = false) => {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = loud ? 1.0 : 0.8;
    audio.play().catch((e) => {
      console.log('Could not play notification sound:', e);
    });
    
    // Play twice for urgent notifications
    if (loud) {
      setTimeout(() => {
        const audio2 = new Audio('/notification.mp3');
        audio2.volume = 1.0;
        audio2.play().catch(() => {});
      }, 500);
    }
  } catch (e) {
    console.log('Error creating audio:', e);
  }
};

// Send browser notification
const sendBrowserNotification = (title: string, body: string, icon?: string, urgent = false) => {
  // Always play sound
  playNotificationSound(urgent);

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: `admin-notification-${Date.now()}`,
      requireInteraction: urgent,
    });

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
  const lastNotificationRef = useRef<Record<string, string>>({});
  const isInitialLoadRef = useRef(true);
  const queryClient = useQueryClient();

  const showNotification = useCallback((type: string, title: string, body: string, urgent = false) => {
    // Prevent duplicate notifications
    const key = `${type}-${body}`;
    const now = Date.now().toString();
    if (lastNotificationRef.current[type] === key) return;
    lastNotificationRef.current[type] = key;

    // Browser notification
    sendBrowserNotification(title, body, undefined, urgent);

    // In-app toast
    if (urgent) {
      toast.error(title, {
        description: body,
        duration: 15000,
      });
    } else {
      toast.success(title, {
        description: body,
        duration: 10000,
      });
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    // Request notification permission on mount
    if (!hasRequestedPermission.current) {
      hasRequestedPermission.current = true;
      requestNotificationPermission().then(granted => {
        if (granted) {
          toast.success('🔔 Notificações ativadas!', {
            description: 'Você receberá alertas de vendas, depósitos, chats e solicitações.',
          });
        }
      });
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    // Subscribe to new purchases (cards sold)
    const purchasesChannel = supabase
      .channel('admin-purchases-notifications-v2')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'purchases',
        },
        async (payload) => {
          if (isInitialLoadRef.current) return;
          
          const purchase = payload.new as any;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', purchase.user_id)
            .single();
          
          const userName = profile?.name || 'Usuário';
          const title = '💰 Nova Venda!';
          const body = `${userName} comprou ${purchase.card_name} por R$ ${Number(purchase.price).toFixed(2)}`;
          
          showNotification('purchase', title, body, true);
          queryClient.invalidateQueries({ queryKey: ['purchases'] });
        }
      )
      .subscribe();

    // Subscribe to PIX payments (deposits)
    const pixChannel = supabase
      .channel('admin-pix-notifications-v2')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pix_payments',
        },
        async (payload) => {
          if (isInitialLoadRef.current) return;
          
          const payment = payload.new as any;
          const oldPayment = payload.old as any;
          
          // Only notify when status changes to approved
          if (payment.status === 'approved' && oldPayment.status !== 'approved') {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', payment.user_id)
              .single();
            
            const userName = profile?.name || 'Usuário';
            const title = '💵 Depósito PIX Confirmado!';
            const body = `${userName} depositou R$ ${Number(payment.amount).toFixed(2)}`;
            
            showNotification('pix', title, body, true);
            queryClient.invalidateQueries({ queryKey: ['pix-payments'] });
          }
        }
      )
      .subscribe();

    // Subscribe to new support chats
    const chatsChannel = supabase
      .channel('admin-chats-notifications-v2')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chats',
        },
        async (payload) => {
          if (isInitialLoadRef.current) return;
          
          const chat = payload.new as any;
          const title = '💬 Novo Chat de Suporte!';
          const body = `${chat.user_name} iniciou uma conversa`;
          
          showNotification('chat', title, body, true);
          queryClient.invalidateQueries({ queryKey: ['support-chats'] });
        }
      )
      .subscribe();

    // Subscribe to new support messages from users
    const messagesChannel = supabase
      .channel('admin-messages-notifications-v2')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: 'sender_type=eq.user',
        },
        async (payload) => {
          if (isInitialLoadRef.current) return;
          
          const message = payload.new as any;
          
          const { data: chat } = await supabase
            .from('support_chats')
            .select('user_name')
            .eq('id', message.chat_id)
            .single();
          
          if (chat) {
            const title = '📩 Nova Mensagem!';
            const msgPreview = message.message.slice(0, 40) + (message.message.length > 40 ? '...' : '');
            const body = `${chat.user_name}: ${msgPreview}`;
            
            showNotification('message', title, body, false);
            queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
          }
        }
      )
      .subscribe();

    // Subscribe to consultavel requests
    const requestsChannel = supabase
      .channel('admin-consultavel-requests-v2')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'consultavel_requests',
        },
        async (payload) => {
          if (isInitialLoadRef.current) return;
          
          const request = payload.new as any;
          const title = '🔔 NOVA SOLICITAÇÃO DE CONSULTÁVEL!';
          const body = `${request.user_name} quer limite de R$ ${request.limit_amount} por R$ ${Number(request.price).toFixed(2)}`;
          
          showNotification('consultavel', title, body, true);
          queryClient.invalidateQueries({ queryKey: ['consultavel-requests-all'] });
        }
      )
      .subscribe();

    // Subscribe to balance updates (manual credits added by admin)
    const balanceChannel = supabase
      .channel('admin-balance-notifications-v2')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_balances',
        },
        async (payload) => {
          if (isInitialLoadRef.current) return;
          
          const balance = payload.new as any;
          const oldBalance = payload.old as any;
          
          const diff = Number(balance.balance) - Number(oldBalance.balance);
          
          if (diff > 0 && diff !== Number(balance.balance)) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', balance.user_id)
              .single();
            
            const userName = profile?.name || 'Usuário';
            const title = '💳 Saldo Atualizado!';
            const body = `${userName} agora tem R$ ${Number(balance.balance).toFixed(2)} (+R$ ${diff.toFixed(2)})`;
            
            showNotification('balance', title, body, false);
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
      supabase.removeChannel(pixChannel);
      supabase.removeChannel(chatsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(balanceChannel);
    };
  }, [isAdmin, showNotification, queryClient]);

  return {
    requestPermission: requestNotificationPermission,
    sendNotification: sendBrowserNotification,
    playSound: playNotificationSound,
  };
};
