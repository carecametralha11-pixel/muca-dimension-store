import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Consultavel {
  id: string;
  type: 'CT' | 'ST';
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  display_order: number;
  image_url: string | null;
  card_number: string | null;
  card_expiry: string | null;
  card_cvv: string | null;
  card_level: string | null;
  bank_name: string | null;
  created_at: string;
  updated_at: string;
}

// Upload consultavel image to storage
export const uploadConsultavelImage = async (file: File, consultavelId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${consultavelId}-${Date.now()}.${fileExt}`;
  const filePath = `consultaveis/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('module-media')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('module-media')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Delete consultavel image from storage
export const deleteConsultavelImage = async (fileUrl: string): Promise<void> => {
  const urlParts = fileUrl.split('/module-media/');
  if (urlParts.length < 2) return;
  
  const filePath = urlParts[1];
  
  await supabase.storage
    .from('module-media')
    .remove([filePath]);
};

export const useConsultaveis = () => {
  return useQuery({
    queryKey: ['consultaveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultaveis')
        .select('*')
        .eq('is_active', true)
        .order('type')
        .order('display_order');

      if (error) throw error;
      return data as Consultavel[];
    },
  });
};

export const useAllConsultaveis = () => {
  return useQuery({
    queryKey: ['consultaveis_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultaveis')
        .select('*')
        .order('type')
        .order('display_order');

      if (error) throw error;
      return data as Consultavel[];
    },
  });
};

export const useCreateConsultavel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (consultavel: Omit<Consultavel, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('consultaveis')
        .insert(consultavel)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultaveis'] });
      queryClient.invalidateQueries({ queryKey: ['consultaveis_all'] });
    },
  });
};

export const useUpdateConsultavel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Consultavel> & { id: string }) => {
      const { data, error } = await supabase
        .from('consultaveis')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultaveis'] });
      queryClient.invalidateQueries({ queryKey: ['consultaveis_all'] });
    },
  });
};

export const useDeleteConsultavel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('consultaveis')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultaveis'] });
      queryClient.invalidateQueries({ queryKey: ['consultaveis_all'] });
    },
  });
};
