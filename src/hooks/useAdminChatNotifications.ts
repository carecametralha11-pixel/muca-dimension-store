import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAdminChatNotifications = () => {
  const { isAdmin } = useAuth();
  const lastPlayedRef = useRef<number>(0);

  const playNotificationSound = useCallback(() => {
    const now = Date.now();
    // Prevent playing too frequently (min 2 seconds between sounds)
    if (now - lastPlayedRef.current < 2000) return;
    
    lastPlayedRef.current = now;
    console.log('Playing notification sound...');
    
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 1.0;
      audio.play().then(() => {
        console.log('Notification sound played successfully');
      }).catch((error) => {
        console.log('Could not play notification sound:', error);
      });
    } catch (e) {
      console.log('Error creating audio:', e);
    }
  }, []);

  // Subscribe to new chats and messages for admin
  useEffect(() => {
    if (!isAdmin) {
      console.log('Not admin, skipping chat notifications subscription');
      return;
    }

    console.log('Setting up admin chat notifications subscriptions...');

    // Subscribe to new chat creation
    const chatChannel = supabase
      .channel('admin-new-chats-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chats',
        },
        (payload) => {
          console.log('New chat received:', payload);
          playNotificationSound();
          toast.info('🔔 Novo chat de suporte!', {
            description: `${(payload.new as any).user_name} iniciou uma conversa.`,
            duration: 10000,
          });
        }
      )
      .subscribe((status) => {
        console.log('Chat channel subscription status:', status);
      });

    // Subscribe to new messages from users
    const messageChannel = supabase
      .channel('admin-new-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
        },
        (payload) => {
          const newMessage = payload.new as any;
          console.log('New message received:', newMessage);
          // Only notify for user messages
          if (newMessage.sender_type === 'user') {
            console.log('User message, playing notification...');
            playNotificationSound();
            toast.info('💬 Nova mensagem!', {
              description: 'Um usuário enviou uma mensagem no suporte.',
              duration: 5000,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Message channel subscription status:', status);
      });

    return () => {
      console.log('Cleaning up admin chat notification subscriptions');
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [isAdmin, playNotificationSound]);

  return {
    playNotificationSound,
  };
};

export default useAdminChatNotifications;
