import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ModuleMedia {
  id: string;
  module_name: string;
  title: string;
  description: string | null;
  media_type: 'video' | 'image';
  media_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Upload file to storage bucket
export const uploadMediaFile = async (file: File, moduleName: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${moduleName}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('module-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('module-media')
    .getPublicUrl(data.path);
  
  return publicUrl;
};

// Delete file from storage bucket
export const deleteMediaFile = async (fileUrl: string): Promise<void> => {
  // Extract path from URL
  const url = new URL(fileUrl);
  const pathParts = url.pathname.split('/module-media/');
  if (pathParts.length > 1) {
    const filePath = pathParts[1];
    await supabase.storage
      .from('module-media')
      .remove([filePath]);
  }
};

export const useModuleMedia = (moduleName?: string) => {
  return useQuery({
    queryKey: ['module_media', moduleName],
    queryFn: async () => {
      let query = supabase
        .from('module_media')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (moduleName) {
        query = query.eq('module_name', moduleName);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ModuleMedia[];
    },
  });
};

export const useAllModuleMedia = () => {
  return useQuery({
    queryKey: ['module_media', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_media')
        .select('*')
        .order('module_name', { ascending: true })
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as ModuleMedia[];
    },
  });
};

export const useCreateModuleMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (media: Omit<ModuleMedia, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('module_media')
        .insert(media)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module_media'] });
    },
  });
};

export const useUpdateModuleMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ModuleMedia> & { id: string }) => {
      const { data, error } = await supabase
        .from('module_media')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module_media'] });
    },
  });
};

export const useDeleteModuleMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('module_media')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module_media'] });
    },
  });
};
