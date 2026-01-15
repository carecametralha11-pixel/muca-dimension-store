import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CardMix {
  id: string;
  name: string;
  description: string | null;
  card_data: string | null;
  price: number;
  quantity: number;
  is_active: boolean;
  stock: number;
  created_at: string;
  updated_at: string;
}

const mapDbToCardMix = (row: any): CardMix => ({
  id: row.id,
  name: row.name,
  description: row.description,
  card_data: row.card_data,
  price: Number(row.price),
  quantity: row.quantity,
  is_active: row.is_active,
  stock: row.stock,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const useCardMixes = () => {
  return useQuery({
    queryKey: ['card-mixes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('card_mixes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(mapDbToCardMix);
    },
    staleTime: 1000 * 30,
  });
};

export const useAllCardMixes = () => {
  return useQuery({
    queryKey: ['all-card-mixes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('card_mixes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(mapDbToCardMix);
    },
    staleTime: 1000 * 30,
  });
};

export const useCreateCardMix = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mix: Omit<CardMix, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('card_mixes')
        .insert({
          name: mix.name,
          description: mix.description,
          card_data: mix.card_data,
          price: mix.price,
          quantity: mix.quantity,
          is_active: mix.is_active,
          stock: mix.stock,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToCardMix(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-mixes'] });
      queryClient.invalidateQueries({ queryKey: ['all-card-mixes'] });
      toast.success('Mix criado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error creating mix:', error);
      toast.error('Erro ao criar mix.');
    },
  });
};

export const useUpdateCardMix = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...mix }: Partial<CardMix> & { id: string }) => {
      const { data, error } = await supabase
        .from('card_mixes')
        .update({
          name: mix.name,
          description: mix.description,
          card_data: mix.card_data,
          price: mix.price,
          quantity: mix.quantity,
          is_active: mix.is_active,
          stock: mix.stock,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToCardMix(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-mixes'] });
      queryClient.invalidateQueries({ queryKey: ['all-card-mixes'] });
      toast.success('Mix atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error updating mix:', error);
      toast.error('Erro ao atualizar mix.');
    },
  });
};

export const useDeleteCardMix = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('card_mixes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-mixes'] });
      queryClient.invalidateQueries({ queryKey: ['all-card-mixes'] });
      toast.success('Mix removido!');
    },
    onError: (error: any) => {
      console.error('Error deleting mix:', error);
      toast.error('Erro ao remover mix.');
    },
  });
};
