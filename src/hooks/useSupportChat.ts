import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface SupportChat {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'open' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date | null;
}

export interface SupportMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderType: 'user' | 'admin';
  message: string;
  isRead: boolean;
  createdAt: Date;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
}

// Hook to check if user is eligible for support chat
export const useIsEligibleForChat = (userId?: string) => {
  return useQuery({
    queryKey: ['chat-eligibility', userId],
    queryFn: async () => {
      if (!userId) return false;

      // Check if user has made any purchases
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (purchasesError) throw purchasesError;
      if (purchases && purchases.length > 0) return true;

      // Check if user has deposited at least R$10
      const { data: payments, error: paymentsError } = await supabase
        .from('pix_payments')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'approved');

      if (paymentsError) throw paymentsError;
      
      const totalDeposited = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      return totalDeposited >= 10;
    },
    enabled: !!userId,
  });
};

// Hook to get or create user's chat
export const useUserChat = (userId?: string) => {
  return useQuery({
    queryKey: ['user-chat', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('support_chats')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name,
        userEmail: data.user_email,
        status: data.status as 'open' | 'closed',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        lastMessageAt: data.last_message_at ? new Date(data.last_message_at) : null,
      } as SupportChat;
    },
    enabled: !!userId,
  });
};

// Hook to create a new chat
export const useCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, userName, userEmail }: { userId: string; userName: string; userEmail: string }) => {
      const { data, error } = await supabase
        .from('support_chats')
        .insert({
          user_id: userId,
          user_name: userName,
          user_email: userEmail,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name,
        userEmail: data.user_email,
        status: data.status as 'open' | 'closed',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        lastMessageAt: data.last_message_at ? new Date(data.last_message_at) : null,
      } as SupportChat;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-chat', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['all-chats'] });
    },
  });
};

// Hook to get chat messages with realtime
export const useChatMessages = (chatId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat-messages-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient]);

  return useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: async () => {
      if (!chatId) return [];

      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map((msg): SupportMessage => ({
        id: msg.id,
        chatId: msg.chat_id,
        senderId: msg.sender_id,
        senderType: msg.sender_type as 'user' | 'admin',
        message: msg.message,
        isRead: msg.is_read,
        createdAt: new Date(msg.created_at),
        attachmentUrl: (msg as any).attachment_url || null,
        attachmentType: (msg as any).attachment_type || null,
      }));
    },
    enabled: !!chatId,
    refetchInterval: 3000, // Fallback polling
  });
};

// Hook to send a message
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, senderId, senderType, message }: { 
      chatId: string; 
      senderId: string; 
      senderType: 'user' | 'admin'; 
      message: string 
    }) => {
      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          chat_id: chatId,
          sender_id: senderId,
          sender_type: senderType,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['all-chats'] });
    },
  });
};

// Hook to send a message with attachment
export const useSendMessageWithAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, senderId, senderType, file }: { 
      chatId: string; 
      senderId: string; 
      senderType: 'user' | 'admin'; 
      file: File;
    }) => {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${chatId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName);

      // Insert message with attachment
      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          chat_id: chatId,
          sender_id: senderId,
          sender_type: senderType,
          message: file.type.startsWith('image/') ? '📷 Imagem' : file.type.startsWith('audio/') ? '🎵 Áudio' : '📎 Anexo',
          attachment_url: urlData.publicUrl,
          attachment_type: file.type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['all-chats'] });
    },
  });
};

// Hook for admins to get all open chats with realtime
export const useAllChats = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('all-chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_chats',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['all-chats'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['all-chats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['all-chats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_chats')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      return data.map((chat): SupportChat => ({
        id: chat.id,
        userId: chat.user_id,
        userName: chat.user_name,
        userEmail: chat.user_email,
        status: chat.status as 'open' | 'closed',
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
        lastMessageAt: chat.last_message_at ? new Date(chat.last_message_at) : null,
      }));
    },
    refetchInterval: 5000, // Fallback polling for admins
  });
};

// Hook to get unread message count for a chat
export const useUnreadCount = (chatId?: string, senderType?: 'user' | 'admin') => {
  return useQuery({
    queryKey: ['unread-count', chatId, senderType],
    queryFn: async () => {
      if (!chatId) return 0;

      const { count, error } = await supabase
        .from('support_messages')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', chatId)
        .eq('is_read', false)
        .neq('sender_type', senderType);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!chatId && !!senderType,
  });
};

// Hook to mark messages as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, senderType }: { chatId: string; senderType: 'user' | 'admin' }) => {
      const { error } = await supabase
        .from('support_messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .neq('sender_type', senderType);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['unread-count', variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.chatId] });
    },
  });
};

// Hook to close a chat
export const useCloseChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string) => {
      const { error } = await supabase
        .from('support_chats')
        .update({ status: 'closed' })
        .eq('id', chatId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-chats'] });
      queryClient.invalidateQueries({ queryKey: ['user-chat'] });
    },
  });
};
