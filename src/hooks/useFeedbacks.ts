import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface Feedback {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  image_url: string | null;
  created_at: string;
}

// Hook para buscar todos os feedbacks
export const useFeedbacks = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('feedbacks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedbacks'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['feedbacks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feedback[];
    },
  });
};

// Hook para verificar se usuário pode enviar feedback
export const useCanPostFeedback = (userId?: string, isAdmin?: boolean) => {
  return useQuery({
    queryKey: ['can-post-feedback', userId, isAdmin],
    queryFn: async () => {
      if (!userId) return false;

      // Admins can always post feedback
      if (isAdmin) return true;

      // Verificar se fez alguma compra (verificação principal)
      const { data: purchases } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      const hasPurchases = purchases && purchases.length > 0;
      if (hasPurchases) return true;

      // Verificar pagamentos PIX aprovados totalizando pelo menos R$20
      const { data: pixPayments } = await supabase
        .from('pix_payments')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'approved');

      const totalDeposited = pixPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      
      return totalDeposited >= 20;
    },
    enabled: !!userId,
  });
};

// Hook para criar feedback
export const useCreateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      userName, 
      message, 
      imageFile 
    }: { 
      userId: string; 
      userName: string; 
      message: string; 
      imageFile?: File;
    }) => {
      let imageUrl: string | null = null;

      // Upload da imagem se existir
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('feedback-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('feedback-images')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('feedbacks')
        .insert({
          user_id: userId,
          user_name: userName,
          message,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast.success('Feedback enviado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao enviar feedback');
    },
  });
};

// Hook para editar feedback (admin)
export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      feedbackId, 
      message, 
      userName 
    }: { 
      feedbackId: string; 
      message: string; 
      userName?: string;
    }) => {
      const updateData: { message: string; user_name?: string } = { message };
      if (userName) {
        updateData.user_name = userName;
      }

      const { error } = await supabase
        .from('feedbacks')
        .update(updateData)
        .eq('id', feedbackId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast.success('Feedback atualizado!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar feedback');
    },
  });
};

// Hook para deletar feedback (admin)
export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedbackId: string) => {
      // Primeiro pegar a imagem para deletar
      const { data: feedback } = await supabase
        .from('feedbacks')
        .select('image_url')
        .eq('id', feedbackId)
        .single();

      // Deletar imagem do storage se existir
      if (feedback?.image_url) {
        const fileName = feedback.image_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('feedback-images').remove([fileName]);
        }
      }

      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast.success('Feedback excluído!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir feedback');
    },
  });
};
