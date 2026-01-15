import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface PixPayment {
  id: string;
  user_id: string;
  amount: number;
  external_reference: string;
  mercado_pago_id: string | null;
  status: string;
  qr_code: string | null;
  qr_code_base64: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

export const usePixPayment = (paymentId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!paymentId) return;

    const channel = supabase
      .channel(`pix-payment-${paymentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pix_payments',
          filter: `id=eq.${paymentId}`,
        },
        (payload) => {
          console.log('Payment updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['pix-payment', paymentId] });
          queryClient.invalidateQueries({ queryKey: ['balance'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [paymentId, queryClient]);

  return useQuery({
    queryKey: ['pix-payment', paymentId],
    queryFn: async () => {
      if (!paymentId) return null;
      
      const { data, error } = await supabase
        .from('pix_payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) throw error;
      return data as PixPayment;
    },
    enabled: !!paymentId,
    refetchInterval: 5000, // Poll every 5 seconds as backup
  });
};

export const useAllPixPayments = () => {
  return useQuery({
    queryKey: ['all-pix-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pix_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PixPayment[];
    },
  });
};

export const useTotalEarnings = () => {
  return useQuery({
    queryKey: ['total-earnings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pix_payments')
        .select('amount')
        .eq('status', 'approved');

      if (error) throw error;
      
      const total = data.reduce((sum, payment) => sum + Number(payment.amount), 0);
      return total;
    },
  });
};
