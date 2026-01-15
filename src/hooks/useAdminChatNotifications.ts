import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAdminChatNotifications = () => {
  const { isAdmin } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedRef = useRef<number>(0);
  const isInitializedRef = useRef(false);

  // Initialize audio element with local file
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitializedRef.current) {
      // Use local notification sound
      audioRef.current = new Audio('/notification.mp3');
      audioRef.current.volume = 1.0;
      audioRef.current.preload = 'auto';
      
      // Try to load and unlock audio on any user interaction
      const unlockAudio = () => {
        if (audioRef.current) {
          // Play and immediately pause to unlock audio
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              audioRef.current?.pause();
              audioRef.current!.currentTime = 0;
              isInitializedRef.current = true;
              console.log('Audio unlocked successfully');
            }).catch(() => {
              console.log('Audio unlock failed, will retry on next interaction');
            });
          }
        }
      };

      // Try to unlock immediately
      unlockAudio();

      // Also try on any user interaction
      const handleInteraction = () => {
        if (!isInitializedRef.current) {
          unlockAudio();
        }
      };

      document.addEventListener('click', handleInteraction);
      document.addEventListener('keydown', handleInteraction);
      document.addEventListener('touchstart', handleInteraction);

      return () => {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      };
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    const now = Date.now();
    // Prevent playing too frequently (min 2 seconds between sounds)
    if (now - lastPlayedRef.current < 2000) return;
    
    console.log('Attempting to play notification sound...');
    
    if (audioRef.current) {
      lastPlayedRef.current = now;
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Notification sound played successfully');
        }).catch((error) => {
          console.log('Could not play notification sound:', error);
          // Try creating a new audio instance as fallback
          const fallbackAudio = new Audio('/notification.mp3');
          fallbackAudio.volume = 1.0;
          fallbackAudio.play().catch(e => console.log('Fallback also failed:', e));
        });
      }
    } else {
      // If ref is null, create new audio and play
      const newAudio = new Audio('/notification.mp3');
      newAudio.volume = 1.0;
      newAudio.play().catch(e => console.log('New audio failed:', e));
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
