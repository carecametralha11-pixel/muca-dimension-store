import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Notification sound URL - using a simple beep sound
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export const useAdminChatNotifications = () => {
  const { isAdmin } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedRef = useRef<number>(0);
  const hasInteractedRef = useRef(false);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
      audioRef.current.volume = 0.7;
      
      // Preload the audio
      audioRef.current.load();

      // Track user interaction for autoplay policy
      const handleInteraction = () => {
        hasInteractedRef.current = true;
        // Remove listeners after first interaction
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };

      document.addEventListener('click', handleInteraction);
      document.addEventListener('keydown', handleInteraction);

      return () => {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    const now = Date.now();
    // Prevent playing too frequently (min 2 seconds between sounds)
    if (now - lastPlayedRef.current < 2000) return;
    
    if (audioRef.current && hasInteractedRef.current) {
      lastPlayedRef.current = now;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.log('Could not play notification sound:', error);
      });
    }
  }, []);

  // Subscribe to new chats and messages for admin
  useEffect(() => {
    if (!isAdmin) return;

    // Subscribe to new chat creation
    const chatChannel = supabase
      .channel('admin-new-chats')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chats',
        },
        (payload) => {
          playNotificationSound();
          toast.info('🔔 Novo chat de suporte!', {
            description: `${(payload.new as any).user_name} iniciou uma conversa.`,
            duration: 10000,
          });
        }
      )
      .subscribe();

    // Subscribe to new messages from users
    const messageChannel = supabase
      .channel('admin-new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
        },
        (payload) => {
          const newMessage = payload.new as any;
          // Only notify for user messages
          if (newMessage.sender_type === 'user') {
            playNotificationSound();
            toast.info('💬 Nova mensagem!', {
              description: 'Um usuário enviou uma mensagem no suporte.',
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [isAdmin, playNotificationSound]);

  return {
    playNotificationSound,
  };
};

export default useAdminChatNotifications;
