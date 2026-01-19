import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Check if user has ever made a successful deposit
export const useHasDeposited = (userId?: string) => {
  return useQuery({
    queryKey: ['has-deposited', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('pix_payments')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .limit(1);
      
      if (error) throw error;
      return data && data.length > 0;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
