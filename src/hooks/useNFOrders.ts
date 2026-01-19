import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NFOrder {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  full_name: string;
  delivery_address: string;
  quantity: number;
  price: number;
  status: string;
  chat_id: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch all NF orders (admin)
export const useAllNFOrders = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['nf-orders-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nf_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as NFOrder[];
    },
  });
};

// Create NF order
export const useCreateNFOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (order: Omit<NFOrder, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('nf_orders')
        .insert(order)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nf-orders-all'] });
    },
    onError: (error: any) => {
      console.error('Error creating NF order:', error);
      toast.error('Erro ao criar pedido');
    },
  });
};

// Update NF order status
export const useUpdateNFOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NFOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from('nf_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nf-orders-all'] });
      toast.success('Pedido atualizado!');
    },
    onError: (error: any) => {
      console.error('Error updating NF order:', error);
      toast.error('Erro ao atualizar pedido');
    },
  });
};

// Calculate NF price
export const calculateNFPrice = (quantity: number): number => {
  // Pricing: R$130 per 1000, above 4000 is R$100 per 1000 extra
  if (quantity <= 4000) {
    return (quantity / 1000) * 130;
  }
  
  const basePrice = 4 * 130; // First 4000
  const extraQuantity = quantity - 4000;
  const extraPrice = (extraQuantity / 1000) * 100;
  
  return basePrice + extraPrice;
};
