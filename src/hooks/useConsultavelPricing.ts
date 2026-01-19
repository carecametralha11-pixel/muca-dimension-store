import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ConsultavelPricingTier {
  id: string;
  limit_amount: number;
  price: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ConsultavelRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  tier_id: string | null;
  limit_amount: number;
  price: number;
  status: string;
  chat_id: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch active pricing tiers
export const usePricingTiers = () => {
  return useQuery({
    queryKey: ['consultavel-pricing-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultavel_pricing_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as ConsultavelPricingTier[];
    },
  });
};

// Fetch all pricing tiers (admin)
export const useAllPricingTiers = () => {
  return useQuery({
    queryKey: ['consultavel-pricing-tiers-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultavel_pricing_tiers')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as ConsultavelPricingTier[];
    },
  });
};

// Create pricing tier
export const useCreatePricingTier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tier: Omit<ConsultavelPricingTier, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('consultavel_pricing_tiers')
        .insert(tier)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultavel-pricing-tiers'] });
      queryClient.invalidateQueries({ queryKey: ['consultavel-pricing-tiers-all'] });
      toast.success('Faixa de preço criada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error creating pricing tier:', error);
      if (error.message?.includes('duplicate')) {
        toast.error('Esse limite já existe!');
      } else {
        toast.error('Erro ao criar faixa de preço');
      }
    },
  });
};

// Update pricing tier
export const useUpdatePricingTier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ConsultavelPricingTier> & { id: string }) => {
      const { data, error } = await supabase
        .from('consultavel_pricing_tiers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultavel-pricing-tiers'] });
      queryClient.invalidateQueries({ queryKey: ['consultavel-pricing-tiers-all'] });
      toast.success('Faixa de preço atualizada!');
    },
    onError: (error: any) => {
      console.error('Error updating pricing tier:', error);
      toast.error('Erro ao atualizar faixa de preço');
    },
  });
};

// Delete pricing tier
export const useDeletePricingTier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('consultavel_pricing_tiers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultavel-pricing-tiers'] });
      queryClient.invalidateQueries({ queryKey: ['consultavel-pricing-tiers-all'] });
      toast.success('Faixa de preço removida!');
    },
    onError: (error: any) => {
      console.error('Error deleting pricing tier:', error);
      toast.error('Erro ao remover faixa de preço');
    },
  });
};

// Fetch all consultavel requests (admin)
export const useAllConsultavelRequests = () => {
  return useQuery({
    queryKey: ['consultavel-requests-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultavel_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ConsultavelRequest[];
    },
  });
};

// Create consultavel request
export const useCreateConsultavelRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: Omit<ConsultavelRequest, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('consultavel_requests')
        .insert(request)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultavel-requests-all'] });
    },
    onError: (error: any) => {
      console.error('Error creating consultavel request:', error);
      toast.error('Erro ao criar solicitação');
    },
  });
};

// Update consultavel request status
export const useUpdateConsultavelRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ConsultavelRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('consultavel_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultavel-requests-all'] });
    },
    onError: (error: any) => {
      console.error('Error updating consultavel request:', error);
      toast.error('Erro ao atualizar solicitação');
    },
  });
};
