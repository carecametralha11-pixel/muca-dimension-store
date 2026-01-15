import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ConsultavelImage {
  id: string;
  consultavel_id: string;
  image_url: string;
  title: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Upload image to storage
export const uploadConsultavelImage = async (file: File, consultavelId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${consultavelId}-${Date.now()}.${fileExt}`;
  const filePath = `consultavel-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('module-media')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('module-media')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Delete image from storage
export const deleteConsultavelImageFile = async (fileUrl: string): Promise<void> => {
  const urlParts = fileUrl.split('/module-media/');
  if (urlParts.length < 2) return;
  
  const filePath = urlParts[1];
  
  await supabase.storage
    .from('module-media')
    .remove([filePath]);
};

// Get images for a specific consultavel
export const useConsultavelImages = (consultavelId: string) => {
  return useQuery({
    queryKey: ['consultavel_images', consultavelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultavel_images')
        .select('*')
        .eq('consultavel_id', consultavelId)
        .order('display_order');

      if (error) throw error;
      return data as ConsultavelImage[];
    },
    enabled: !!consultavelId,
  });
};

// Get all images (for admin)
export const useAllConsultavelImages = () => {
  return useQuery({
    queryKey: ['consultavel_images_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultavel_images')
        .select('*')
        .order('consultavel_id')
        .order('display_order');

      if (error) throw error;
      return data as ConsultavelImage[];
    },
  });
};

// Create image
export const useCreateConsultavelImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: Omit<ConsultavelImage, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('consultavel_images')
        .insert(image)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['consultavel_images', data.consultavel_id] });
      queryClient.invalidateQueries({ queryKey: ['consultavel_images_all'] });
    },
  });
};

// Update image
export const useUpdateConsultavelImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ConsultavelImage> & { id: string }) => {
      const { data, error } = await supabase
        .from('consultavel_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['consultavel_images', data.consultavel_id] });
      queryClient.invalidateQueries({ queryKey: ['consultavel_images_all'] });
    },
  });
};

// Delete image
export const useDeleteConsultavelImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, consultavelId, imageUrl }: { id: string; consultavelId: string; imageUrl: string }) => {
      // Delete from storage first
      await deleteConsultavelImageFile(imageUrl);
      
      // Then delete from database
      const { error } = await supabase
        .from('consultavel_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { consultavelId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['consultavel_images', data.consultavelId] });
      queryClient.invalidateQueries({ queryKey: ['consultavel_images_all'] });
    },
  });
};
