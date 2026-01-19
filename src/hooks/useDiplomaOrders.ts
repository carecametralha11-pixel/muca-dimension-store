import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DiplomaOrder {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  full_name: string;
  cpf: string;
  birth_date: string;
  course_type: string;
  price: number;
  status: string;
  chat_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiplomaConfig {
  id: string;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch diploma config
export const useDiplomaConfig = () => {
  return useQuery({
    queryKey: ['diploma-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diploma_config')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as DiplomaConfig;
    },
  });
};

// Update diploma config
export const useUpdateDiplomaConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DiplomaConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from('diploma_config')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diploma-config'] });
      toast.success('Configuração atualizada!');
    },
    onError: (error: any) => {
      console.error('Error updating diploma config:', error);
      toast.error('Erro ao atualizar configuração');
    },
  });
};

// Fetch all diploma orders (admin)
export const useAllDiplomaOrders = () => {
  return useQuery({
    queryKey: ['diploma-orders-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diploma_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DiplomaOrder[];
    },
  });
};

// Create diploma order
export const useCreateDiplomaOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (order: Omit<DiplomaOrder, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('diploma_orders')
        .insert(order)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diploma-orders-all'] });
    },
    onError: (error: any) => {
      console.error('Error creating diploma order:', error);
      toast.error('Erro ao criar pedido');
    },
  });
};

// Update diploma order status
export const useUpdateDiplomaOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DiplomaOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from('diploma_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diploma-orders-all'] });
      toast.success('Pedido atualizado!');
    },
    onError: (error: any) => {
      console.error('Error updating diploma order:', error);
      toast.error('Erro ao atualizar pedido');
    },
  });
};
