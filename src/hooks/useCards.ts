import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/types';
import { toast } from 'sonner';

// Convert database row to Card type
const mapDbToCard = (row: any): Card => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  price: Number(row.price),
  image: row.image || '',
  category: row.category as 'INFO' | 'CONSULTÁVEL',
  subcategory: row.subcategory as 'FULLDADOS' | 'AUXILIAR' | null,
  stock: row.stock,
  createdAt: new Date(row.created_at),
  cardNumber: row.card_number,
  cardExpiry: row.card_expiry,
  cardCvv: row.card_cvv,
  cpf: row.cpf,
  holderName: row.holder_name,
  cardLevel: row.card_level,
  bankName: row.bank_name,
});

export const useCards = (includesSold = false) => {
  return useQuery({
    queryKey: ['cards', includesSold],
    queryFn: async () => {
      let query = supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Por padrão, só mostrar cards com estoque > 0 (não vendidos)
      if (!includesSold) {
        query = query.gt('stock', 0);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map(mapDbToCard);
    },
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook para admin ver todos os cards (incluindo vendidos)
export const useAllCards = () => {
  return useQuery({
    queryKey: ['all-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(mapDbToCard);
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
};

export const useCreateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (card: Omit<Card, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('cards')
        .insert({
          name: card.name,
          description: card.description,
          price: card.price,
          image: card.image,
          category: card.category,
          subcategory: card.subcategory,
          stock: card.stock,
          card_number: card.cardNumber,
          card_expiry: card.cardExpiry,
          card_cvv: card.cardCvv,
          cpf: card.cpf,
          holder_name: card.holderName,
          card_level: card.cardLevel,
          bank_name: card.bankName,
        })
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Falha ao criar card');
      return mapDbToCard(data[0]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['all-cards'] });
      toast.success('Card criado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error creating card:', error);
      toast.error('Erro ao criar card. Verifique se você tem permissão de admin.');
    },
  });
};

// Hook para criar múltiplos cards de uma vez (para AUXILIAR)
export const useCreateMultipleCards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cards: Omit<Card, 'id' | 'createdAt'>[]) => {
      const cardsToInsert = cards.map(card => ({
        name: card.name,
        description: card.description,
        price: card.price,
        image: card.image || '',
        category: card.category,
        subcategory: card.subcategory,
        stock: card.stock,
        card_number: card.cardNumber,
        card_expiry: card.cardExpiry,
        card_cvv: card.cardCvv,
        cpf: card.cpf,
        holder_name: card.holderName,
        card_level: card.cardLevel,
        bank_name: card.bankName,
      }));

      const { data, error } = await supabase
        .from('cards')
        .insert(cardsToInsert)
        .select();

      if (error) throw error;
      return data.map(mapDbToCard);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['all-cards'] });
      toast.success(`${data.length} cards criados com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Error creating multiple cards:', error);
      toast.error('Erro ao criar cards. Verifique se você tem permissão de admin.');
    },
  });
};

export const useUpdateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...card }: Partial<Card> & { id: string }) => {
      const { data, error } = await supabase
        .from('cards')
        .update({
          name: card.name,
          description: card.description,
          price: card.price,
          image: card.image,
          category: card.category,
          subcategory: card.subcategory,
          stock: card.stock,
          card_number: card.cardNumber,
          card_expiry: card.cardExpiry,
          card_cvv: card.cardCvv,
          cpf: card.cpf,
          holder_name: card.holderName,
          card_level: card.cardLevel,
          bank_name: card.bankName,
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Card não encontrado');
      return mapDbToCard(data[0]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['all-cards'] });
      toast.success('Card atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error updating card:', error);
      toast.error('Erro ao atualizar card.');
    },
  });
};

// Hook para marcar card como vendido (stock = 0) - usado no fluxo de compra
export const useMarkCardAsSold = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cards')
        .update({ stock: 0 })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['all-cards'] });
    },
    onError: (error: any) => {
      console.error('Error marking card as sold:', error);
    },
  });
};

export const useDeleteCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First check if the card is sold (stock = 0)
      const { data: card, error: fetchError } = await supabase
        .from('cards')
        .select('stock')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      
      if (card && card.stock === 0) {
        throw new Error('Não é possível excluir um card vendido');
      }

      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['all-cards'] });
      toast.success('Card removido com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error deleting card:', error);
      toast.error(error.message || 'Erro ao remover card.');
    },
  });
};

// Hook para deletar múltiplos cards (apenas cards disponíveis, não vendidos)
export const useDeleteMultipleCards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      // Only delete cards with stock > 0 (not sold)
      const { error } = await supabase
        .from('cards')
        .delete()
        .in('id', ids)
        .gt('stock', 0);

      if (error) throw error;
      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['all-cards'] });
      toast.success(`${count} cards removidos!`);
    },
    onError: (error: any) => {
      console.error('Error deleting multiple cards:', error);
      toast.error('Erro ao remover cards.');
    },
  });
};

// Hook para deletar cards por categoria/subcategoria (apenas cards disponíveis, não vendidos)
export const useDeleteCardsByCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ category, subcategory }: { category?: 'INFO' | 'CONSULTÁVEL'; subcategory?: string }) => {
      let query = supabase.from('cards').delete();
      
      if (category) {
        query = query.eq('category', category);
      }
      if (subcategory) {
        query = query.eq('subcategory', subcategory);
      }
      // Only delete cards with stock > 0 (not sold)
      query = query.gt('stock', 0);

      const { error, count } = await query;
      if (error) throw error;
      return count || 0;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['all-cards'] });
      toast.success('Cards disponíveis da categoria removidos!');
    },
    onError: (error: any) => {
      console.error('Error deleting cards by category:', error);
      toast.error('Erro ao remover cards da categoria.');
    },
  });
};

// Hook para atualizar preço de múltiplos cards
export const useBulkUpdatePrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      ids, 
      price,
      filterBy,
      filterValue 
    }: { 
      ids?: string[]; 
      price: number;
      filterBy?: 'bank_name' | 'card_level';
      filterValue?: string;
    }) => {
      let query = supabase.from('cards').update({ price });
      
      if (ids && ids.length > 0) {
        query = query.in('id', ids);
      } else if (filterBy && filterValue) {
        query = query.eq(filterBy, filterValue);
      }

      const { error, count } = await query;
      if (error) throw error;
      return count || 0;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['all-cards'] });
      toast.success('Preços atualizados com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error updating prices:', error);
      toast.error('Erro ao atualizar preços.');
    },
  });
};
