import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface AccountRequest {
  id: string;
  user_id: string;
  account_type: '99' | 'Uber';
  vehicle_category: 'Carro' | 'Moto';
  vehicle_plate: string;
  first_name?: string;
  face_photo_url?: string;
  rg_front_url?: string;
  rg_back_url?: string;
  email?: string;
  phone?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export const useAccountRequests = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['account-requests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AccountRequest[];
    },
    enabled: !!user,
  });
};

export const useAllAccountRequests = () => {
  return useQuery({
    queryKey: ['all-account-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AccountRequest[];
    },
  });
};

export const useCreateAccountRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Omit<AccountRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'admin_notes'>) => {
      const { data, error } = await supabase
        .from('account_requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-account-requests'] });
      toast.success('Solicitação enviada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao enviar solicitação: ' + error.message);
    },
  });
};

export const useUpdateAccountRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AccountRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('account_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-account-requests'] });
      toast.success('Solicitação atualizada!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });
};

export const useDeleteAccountRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('account_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-account-requests'] });
      toast.success('Solicitação removida!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover: ' + error.message);
    },
  });
};

// Upload image to storage
export const uploadAccountImage = async (file: File, folder: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('account-requests')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('account-requests')
    .getPublicUrl(fileName);

  return data.publicUrl;
};
