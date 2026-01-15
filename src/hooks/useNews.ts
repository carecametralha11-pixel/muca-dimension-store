import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface NewsAnnouncement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Hook para buscar novidades ativas (todos podem ver)
export const useActiveNews = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('news-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news_announcements'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['active-news'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['active-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as NewsAnnouncement[];
    },
  });
};

// Hook para buscar todas as novidades (admin)
export const useAllNews = () => {
  return useQuery({
    queryKey: ['all-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NewsAnnouncement[];
    },
  });
};

// Hook para criar novidade
export const useCreateNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      title, 
      content,
      is_active = true
    }: { 
      title: string; 
      content: string;
      is_active?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('news_announcements')
        .insert({
          title,
          content,
          is_active,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-news'] });
      queryClient.invalidateQueries({ queryKey: ['active-news'] });
      toast.success('Novidade criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar novidade');
    },
  });
};

// Hook para atualizar novidade
export const useUpdateNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id,
      title, 
      content,
      is_active
    }: { 
      id: string;
      title: string; 
      content: string;
      is_active: boolean;
    }) => {
      const { data, error } = await supabase
        .from('news_announcements')
        .update({
          title,
          content,
          is_active,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-news'] });
      queryClient.invalidateQueries({ queryKey: ['active-news'] });
      toast.success('Novidade atualizada!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar novidade');
    },
  });
};

// Hook para deletar novidade
export const useDeleteNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news_announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-news'] });
      queryClient.invalidateQueries({ queryKey: ['active-news'] });
      toast.success('Novidade excluída!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir novidade');
    },
  });
};
