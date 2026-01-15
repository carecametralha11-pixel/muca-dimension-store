import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  balance: number;
  isBanned: boolean;
  is_banned: boolean; // Added for compatibility
}

export const useAllUsers = () => {
  return useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: balances, error: balancesError } = await supabase
        .from('user_balances')
        .select('*');

      if (balancesError) throw balancesError;

      const balanceMap = new Map(balances.map(b => [b.user_id, Number(b.balance)]));

      return profiles.map((p): UserProfile => ({
        id: p.id,
        name: p.name,
        email: p.email,
        createdAt: new Date(p.created_at),
        balance: balanceMap.get(p.id) || 0,
        isBanned: p.is_banned || false,
        is_banned: p.is_banned || false,
      }));
    },
  });
};

// Alias for useAllUsers
export const useUsers = useAllUsers;

export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao banir usuário');
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: false })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao desbanir usuário');
    },
  });
};

export const useToggleBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, ban }: { userId: string; ban: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: ban })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: (_, { ban }) => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast.success(ban ? 'Usuário banido!' : 'Usuário desbanido!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar usuário');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Deletar balance
      await supabase.from('user_balances').delete().eq('user_id', userId);
      
      // Deletar roles
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Deletar profile
      const { error } = await supabase.from('profiles').delete().eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast.success('Usuário excluído!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir usuário');
    },
  });
};
