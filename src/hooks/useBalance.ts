import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useBalance = (userId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('balance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_balances',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['balance', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ['balance', userId],
    queryFn: async () => {
      if (!userId) return 0;
      const { data, error } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return Number(data?.balance || 0);
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAllBalances = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('all-balances-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_balances',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['all-balances'] });
          queryClient.invalidateQueries({ queryKey: ['all-users'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['all-balances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_balances')
        .select('*');

      if (error) throw error;
      return data.map((b) => ({
        id: b.id,
        userId: b.user_id,
        balance: Number(b.balance),
      }));
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
};

export const useUpdateBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, newBalance }: { userId: string; newBalance: number }) => {
      // Use upsert to create or update the balance record
      const { error } = await supabase
        .from('user_balances')
        .upsert(
          { user_id: userId, balance: newBalance },
          { onConflict: 'user_id' }
        );

      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['balance', userId] });
      queryClient.invalidateQueries({ queryKey: ['all-balances'] });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
  });
};
