import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card as CardType } from '@/types';

export interface Purchase {
  id: string;
  userId: string;
  cardId: string;
  cardName: string;
  cardCategory: string;
  price: number;
  paymentMethod: string;
  status: string;
  createdAt: Date;
  description?: string;
  // Card data
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cpf?: string;
  holderName?: string;
  cardLevel?: string;
  bankName?: string;
}

const mapDbToPurchase = (row: any): Purchase => ({
  id: row.id,
  userId: row.user_id,
  cardId: row.card_id,
  cardName: row.card_name,
  cardCategory: row.card_category,
  price: Number(row.price),
  paymentMethod: row.payment_method,
  status: row.status,
  createdAt: new Date(row.created_at),
  description: row.description,
  cardNumber: row.card_number,
  cardExpiry: row.card_expiry,
  cardCvv: row.card_cvv,
  cpf: row.cpf,
  holderName: row.holder_name,
  cardLevel: row.card_level,
  bankName: row.bank_name,
});

export const usePurchases = (userId?: string) => {
  return useQuery({
    queryKey: ['purchases', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        throw error;
      }
      return data.map(mapDbToPurchase);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
};

export const useAllPurchases = () => {
  return useQuery({
    queryKey: ['all-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all purchases:', error);
        throw error;
      }
      return data.map(mapDbToPurchase);
    },
  });
};

interface CreatePurchaseData {
  userId: string;
  cardId: string;
  cardName: string;
  cardCategory: string;
  price: number;
  paymentMethod: string;
  status: string;
  card: CardType;
}

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchase: CreatePurchaseData) => {
      console.log('useCreatePurchase: Iniciando insert...', purchase);
      
      const insertData = {
        user_id: purchase.userId,
        card_id: purchase.cardId,
        card_name: purchase.cardName,
        card_category: purchase.cardCategory,
        price: purchase.price,
        payment_method: purchase.paymentMethod,
        status: purchase.status,
        description: purchase.card.description || null,
        card_number: purchase.card.cardNumber || null,
        card_expiry: purchase.card.cardExpiry || null,
        card_cvv: purchase.card.cardCvv || null,
        cpf: purchase.card.cpf || null,
        holder_name: purchase.card.holderName || null,
        card_level: purchase.card.cardLevel || null,
        bank_name: purchase.card.bankName || null,
      };

      console.log('useCreatePurchase: Data to insert:', insertData);

      const { data, error } = await supabase
        .from('purchases')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('useCreatePurchase: ERROR creating purchase:', error);
        console.error('useCreatePurchase: Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('useCreatePurchase: Purchase saved successfully!', data);
      return mapDbToPurchase(data);
    },
    onSuccess: (data, variables) => {
      console.log('useCreatePurchase: onSuccess callback', data);
      queryClient.invalidateQueries({ queryKey: ['purchases', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['all-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
    onError: (error) => {
      console.error('useCreatePurchase: onError callback', error);
    }
  });
};
