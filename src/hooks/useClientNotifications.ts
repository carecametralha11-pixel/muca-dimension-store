import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Play notification sound with HIGH volume
const playNotificationSound = (loud = true) => {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = loud ? 1.0 : 0.8;
    audio.play().catch(() => {});
    
    // Play twice for urgent notifications
    if (loud) {
      setTimeout(() => {
        const audio2 = new Audio('/notification.mp3');
        audio2.volume = 1.0;
        audio2.play().catch(() => {});
      }, 500);
    }
  } catch (e) {
    console.log('Error playing sound:', e);
  }
};

// Request notification permission
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Send LOUD browser notification
const sendBrowserNotification = (title: string, body: string, urgent = true) => {
  playNotificationSound(urgent);

  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `client-notification-${Date.now()}`,
      requireInteraction: urgent, // Keep notification until user interacts
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      // Open the chat when notification is clicked
      window.dispatchEvent(new CustomEvent('openSupportChat'));
    };

    return notification;
  }
  return null;
};

export const useClientNotifications = () => {
  const { user, isAdmin } = useAuth();
  const isInitialLoadRef = useRef(true);
  const [hasAdminResponse, setHasAdminResponse] = useState(false);
  const lastMessageIdRef = useRef<string | null>(null);
  const hasRequestedPermissionRef = useRef(false);

  // Request permission on mount
  useEffect(() => {
    if (user && !isAdmin && !hasRequestedPermissionRef.current) {
      hasRequestedPermissionRef.current = true;
      requestNotificationPermission();
    }
  }, [user, isAdmin]);

  // Listen for admin messages in user's chats
  useEffect(() => {
    if (!user || isAdmin) return;

    // Subscribe to ALL messages in user's chats
    const channel = supabase
      .channel(`client-all-messages-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
        },
        async (payload) => {
          if (isInitialLoadRef.current) return;
          
          const message = payload.new as any;
          
          // Check if this message is for one of user's chats
          const { data: chat } = await supabase
            .from('support_chats')
            .select('id, user_id')
            .eq('id', message.chat_id)
            .single();
          
          if (!chat || chat.user_id !== user.id) return;
          
          // Only notify for admin messages
          if (message.sender_type === 'admin') {
            // Prevent duplicate notifications
            if (lastMessageIdRef.current === message.id) return;
            lastMessageIdRef.current = message.id;
            
            setHasAdminResponse(true);
            
            const title = '🔔 MUCA está chamando você!';
            const body = 'O suporte enviou uma mensagem. Clique para abrir o chat.';
            
            // Send LOUD notification
            sendBrowserNotification(title, body, true);
            
            // Show BIG in-app toast
            toast.success(title, {
              description: body,
              duration: 30000, // Keep for 30 seconds
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

    // Also listen for NEW chats created for this user (admin initiated)
    const chatChannel = supabase
      .channel(`client-new-chats-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chats',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (isInitialLoadRef.current) return;
          
          const chat = payload.new as any;
          
          // Notify user that admin started a conversation
          const title = '💬 Nova conversa iniciada!';
          const body = 'O suporte MUCA quer falar com você!';
          
          sendBrowserNotification(title, body, true);
          
          toast.success(title, {
            description: body,
            duration: 30000,
            action: {
              label: 'Abrir Chat',
              onClick: () => {
                window.dispatchEvent(new CustomEvent('openSupportChat'));
              },
            },
          });
        }
      )
      .subscribe();

    // Mark initial load complete
    setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 2000);

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(chatChannel);
    };
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
              playNotificationSound(true);
              toast.error('Solicitação Recusada', {
                description: 'Infelizmente sua solicitação de consultável foi recusada.',
                duration: 15000,
              });
            } else if (request.status === 'completed') {
              playNotificationSound(true);
              toast.success('Solicitação Concluída!', {
                description: 'Sua solicitação de consultável foi concluída com sucesso!',
                duration: 15000,
              });
            } else if (request.status === 'in_progress') {
              playNotificationSound(true);
              toast.success('🔔 MUCA está atendendo!', {
                description: 'O suporte começou a processar sua solicitação. Verifique o chat!',
                duration: 30000,
                action: {
                  label: 'Abrir Chat',
                  onClick: () => {
                    window.dispatchEvent(new CustomEvent('openSupportChat'));
                  },
                },
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
    requestPermission: requestNotificationPermission,
  };
};

export default useClientNotifications;