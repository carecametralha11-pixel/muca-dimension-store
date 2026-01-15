import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ModuleDescription {
  id: string;
  module_name: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useModuleDescription = (moduleName: string) => {
  return useQuery({
    queryKey: ['module_description', moduleName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_descriptions')
        .select('*')
        .eq('module_name', moduleName)
        .single();

      if (error) throw error;
      return data as ModuleDescription;
    },
  });
};

export const useAllModuleDescriptions = () => {
  return useQuery({
    queryKey: ['module_descriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_descriptions')
        .select('*')
        .order('module_name');

      if (error) throw error;
      return data as ModuleDescription[];
    },
  });
};

export const useUpdateModuleDescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      title, 
      subtitle, 
      description 
    }: { 
      id: string; 
      title: string; 
      subtitle?: string | null; 
      description?: string | null; 
    }) => {
      const { data, error } = await supabase
        .from('module_descriptions')
        .update({ title, subtitle, description })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['module_descriptions'] });
      queryClient.invalidateQueries({ queryKey: ['module_description', data.module_name] });
    },
  });
};
