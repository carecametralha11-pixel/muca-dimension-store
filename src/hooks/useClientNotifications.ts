import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Play notification sound
const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch (e) {
    console.log('Error playing sound:', e);
  }
};

// Send browser notification
const sendBrowserNotification = (title: string, body: string) => {
  playNotificationSound();

  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: `client-notification-${Date.now()}`,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};

export const useClientNotifications = () => {
  const { user, isAdmin } = useAuth();
  const isInitialLoadRef = useRef(true);
  const [hasAdminResponse, setHasAdminResponse] = useState(false);
  const lastMessageIdRef = useRef<string | null>(null);

  // Listen for admin messages in user's chats
  useEffect(() => {
    if (!user || isAdmin) return;

    // Get user's chat first
    const setupSubscription = async () => {
      const { data: userChat } = await supabase
        .from('support_chats')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .single();

      if (!userChat) return;

      const channel = supabase
        .channel(`client-messages-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'support_messages',
            filter: `chat_id=eq.${userChat.id}`,
          },
          (payload) => {
            if (isInitialLoadRef.current) return;
            
            const message = payload.new as any;
            
            // Only notify for admin messages
            if (message.sender_type === 'admin') {
              // Prevent duplicate notifications
              if (lastMessageIdRef.current === message.id) return;
              lastMessageIdRef.current = message.id;
              
              setHasAdminResponse(true);
              
              const title = '💬 MUCA respondeu!';
              const body = 'O suporte está pronto para te atender.';
              
              sendBrowserNotification(title, body);
              
              toast.success(title, {
                description: body,
                duration: 10000,
                action: {
                  label: 'Abrir Chat',
                  onClick: () => {
                    window.dispatchEvent(new CustomEvent('openSupportChat'));
                  },
                },
              });
            }
          }
        )
        .subscribe();

      // Mark initial load complete
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 2000);

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [user, isAdmin]);

  // Listen for consultavel request status changes
  useEffect(() => {
    if (!user || isAdmin) return;

    const channel = supabase
      .channel(`client-requests-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'consultavel_requests',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (isInitialLoadRef.current) return;
          
          const request = payload.new as any;
          const oldRequest = payload.old as any;
          
          if (request.status !== oldRequest.status) {
            if (request.status === 'rejected') {
              toast.error('Solicitação Recusada', {
                description: 'Infelizmente sua solicitação de consultável foi recusada.',
                duration: 10000,
              });
            } else if (request.status === 'completed') {
              toast.success('Solicitação Concluída!', {
                description: 'Sua solicitação de consultável foi concluída com sucesso!',
                duration: 10000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  return {
    hasAdminResponse,
    resetAdminResponse: () => setHasAdminResponse(false),
  };
};

export default useClientNotifications;
