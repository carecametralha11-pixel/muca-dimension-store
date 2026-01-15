import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface KLRemotaConfig {
  id: string;
  price: number;
  is_active: boolean;
  updated_at: string;
  created_at: string;
}

export interface KLRemotaFile {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface KLRemotaPurchase {
  id: string;
  user_id: string;
  price: number;
  status: string;
  created_at: string;
}

// Hook to get KL Remota config (price)
export const useKLRemotaConfig = () => {
  return useQuery({
    queryKey: ['kl_remota_config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kl_remota_config')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data as KLRemotaConfig;
    },
  });
};

// Hook to update KL Remota config
export const useUpdateKLRemotaConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, price, is_active }: { id: string; price: number; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('kl_remota_config')
        .update({ price, is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kl_remota_config'] });
      toast.success('Configuração atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating config:', error);
      toast.error('Erro ao atualizar configuração');
    },
  });
};

// Hook to get all KL Remota files (admin)
export const useAllKLRemotaFiles = () => {
  return useQuery({
    queryKey: ['kl_remota_files_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kl_remota_files')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as KLRemotaFile[];
    },
  });
};

// Hook to get accessible KL Remota files (for users who purchased)
export const useKLRemotaFiles = () => {
  return useQuery({
    queryKey: ['kl_remota_files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kl_remota_files')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as KLRemotaFile[];
    },
  });
};

// Hook to create KL Remota file
export const useCreateKLRemotaFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: { title: string; description?: string; file_url: string; file_type: string; display_order?: number; is_active?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('kl_remota_files')
        .insert({ ...file, created_by: user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kl_remota_files_all'] });
      queryClient.invalidateQueries({ queryKey: ['kl_remota_files'] });
      toast.success('Arquivo adicionado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating file:', error);
      toast.error('Erro ao adicionar arquivo');
    },
  });
};

// Hook to update KL Remota file
export const useUpdateKLRemotaFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KLRemotaFile> & { id: string }) => {
      const { data, error } = await supabase
        .from('kl_remota_files')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kl_remota_files_all'] });
      queryClient.invalidateQueries({ queryKey: ['kl_remota_files'] });
      toast.success('Arquivo atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating file:', error);
      toast.error('Erro ao atualizar arquivo');
    },
  });
};

// Hook to delete KL Remota file
export const useDeleteKLRemotaFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('kl_remota_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kl_remota_files_all'] });
      queryClient.invalidateQueries({ queryKey: ['kl_remota_files'] });
      toast.success('Arquivo removido com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting file:', error);
      toast.error('Erro ao remover arquivo');
    },
  });
};

// Hook to check if user has purchased KL Remota
export const useHasKLRemotaPurchase = () => {
  return useQuery({
    queryKey: ['kl_remota_user_purchase'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('kl_remota_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    },
  });
};

// Hook to purchase KL Remota
export const usePurchaseKLRemota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ price }: { price: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Get user balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;
      
      const currentBalance = balanceData?.balance || 0;

      if (currentBalance < price) {
        throw new Error('Saldo insuficiente');
      }

      // Deduct balance
      const newBalance = currentBalance - price;
      const { error: updateError } = await supabase
        .from('user_balances')
        .upsert({ user_id: user.id, balance: newBalance });

      if (updateError) throw updateError;

      // Create purchase record
      const { data, error } = await supabase
        .from('kl_remota_purchases')
        .insert({
          user_id: user.id,
          price,
          status: 'completed',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kl_remota_user_purchase'] });
      queryClient.invalidateQueries({ queryKey: ['kl_remota_files'] });
      queryClient.invalidateQueries({ queryKey: ['user_balance'] });
      toast.success('Compra realizada com sucesso! Os arquivos foram liberados.');
    },
    onError: (error: Error) => {
      console.error('Error purchasing:', error);
      toast.error(error.message || 'Erro ao realizar compra');
    },
  });
};

// Hook to get all KL Remota purchases (admin)
export const useAllKLRemotaPurchases = () => {
  return useQuery({
    queryKey: ['kl_remota_purchases_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kl_remota_purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as KLRemotaPurchase[];
    },
  });
};

// Upload file to storage
export const uploadKLFile = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `kl-remota/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('module-files')
    .upload(filePath, file);

  if (uploadError) {
    // Try to create bucket if it doesn't exist
    const { error: bucketError } = await supabase.storage.createBucket('module-files', {
      public: false,
    });
    
    if (!bucketError || bucketError.message.includes('already exists')) {
      const { error: retryError } = await supabase.storage
        .from('module-files')
        .upload(filePath, file);
      if (retryError) throw retryError;
    } else {
      throw uploadError;
    }
  }

  const { data: urlData } = supabase.storage
    .from('module-files')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

// Delete file from storage
export const deleteKLFile = async (fileUrl: string): Promise<void> => {
  const path = fileUrl.split('/module-files/')[1];
  if (path) {
    await supabase.storage.from('module-files').remove([path]);
  }
};
