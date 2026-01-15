import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BanMessage {
  id: string;
  message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Hook to get the active ban message
export const useBanMessage = () => {
  return useQuery({
    queryKey: ['ban-message'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ban_messages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as BanMessage | null;
    },
  });
};

// Hook to update ban message
export const useUpdateBanMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      const { data, error } = await supabase
        .from('ban_messages')
        .update({ message, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ban-message'] });
    },
  });
};

// Hook to create ban message if none exists
export const useCreateBanMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) => {
      const { data, error } = await supabase
        .from('ban_messages')
        .insert({ message })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ban-message'] });
    },
  });
};

// Play ban message using Web Speech API (Google TTS)
export const playBanMessage = (message: string) => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to use a Portuguese voice
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
