import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Sparkles, Loader2, MessageCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { usePricingTiers, useCreateConsultavelRequest } from '@/hooks/useConsultavelPricing';
import { useCreateChat, useSendMessage, useUserChat } from '@/hooks/useSupportChat';
import { useBalance, useUpdateBalance } from '@/hooks/useBalance';
import ConsultavelWaitingPopup from '@/components/ConsultavelWaitingPopup';
import { toast } from 'sonner';

interface SelectedTierData {
  limit: number;
  price: number;
  chatId: string;
}

// Fixed price for limits above 10k
const FIXED_PRICE_ABOVE_10K = 450;

const ConsultavelTierSelector: React.FC = () => {
  const { user, profile } = useAuth();
  const { data: tiers = [], isLoading } = usePricingTiers();
  const { data: balance = 0 } = useBalance(user?.id);
  const updateBalance = useUpdateBalance();
  const [selectedTier, setSelectedTier] = useState<SelectedTierData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWaitingPopup, setShowWaitingPopup] = useState(false);
  
  const createRequest = useCreateConsultavelRequest();
  const createChat = useCreateChat();
  const sendMessage = useSendMessage();
  const { data: existingChat, refetch: refetchChat } = useUserChat(user?.id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calculate price with the 10k rule
  const getEffectivePrice = (limitAmount: number, originalPrice: number): number => {
    if (limitAmount >= 10000) {
      return FIXED_PRICE_ABOVE_10K;
    }
    return originalPrice;
  };

  const handleSelectTier = async (limitAmount: number, originalPrice: number, tierId: string) => {
    if (!user || !profile) {
      toast.error('Você precisa estar logado para solicitar uma consultável');
      return;
    }

    const effectivePrice = getEffectivePrice(limitAmount, originalPrice);

    // Check balance
    if (balance < effectivePrice) {
      toast.error(`Saldo insuficiente! Você precisa de ${formatCurrency(effectivePrice)}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create or get chat
      let chatId = existingChat?.id;

      if (!chatId) {
        const newChat = await createChat.mutateAsync({
          userId: user.id,
          userName: profile.name,
          userEmail: profile.email,
        });
        chatId = newChat.id;
        await refetchChat();
      }

      // Deduct balance
      const newBalance = balance - effectivePrice;
      await updateBalance.mutateAsync({ userId: user.id, newBalance });

      // Send message with the request
      const message = `🔍 **Solicitação de Consultável ITAU**\n\n💳 Limite: ${formatCurrency(limitAmount)}\n💰 Valor Pago: ${formatCurrency(effectivePrice)}\n\nOlá! Paguei e tenho interesse em uma consultável com limite de ${formatCurrency(limitAmount)}.`;

      await sendMessage.mutateAsync({
        chatId,
        senderId: user.id,
        senderType: 'user',
        message,
      });

      // Create the request record
      await createRequest.mutateAsync({
        user_id: user.id,
        user_name: profile.name,
        user_email: profile.email,
        tier_id: tierId,
        limit_amount: limitAmount,
        price: effectivePrice,
        status: 'pending',
        chat_id: chatId,
      });

      // Set selected tier with chat ID
      setSelectedTier({ limit: limitAmount, price: effectivePrice, chatId });
      
      // Show waiting popup
      setShowWaitingPopup(true);

    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <MessageCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Faça login para continuar</h3>
        <p className="text-muted-foreground">
          Entre na sua conta para solicitar uma consultável.
        </p>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Carregando opções...</p>
      </div>
    );
  }

  if (tiers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Nenhuma opção disponível</h3>
        <p className="text-muted-foreground">
          As opções de consultável serão adicionadas em breve.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 mb-4"
          >
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            <span className="text-orange-500">Consultável</span>{' '}
            <span className="bg-gradient-to-r from-[#003087] to-[#FF6600] bg-clip-text text-transparent">ITAU</span>
          </h2>
          
          <p className="text-muted-foreground max-w-md mx-auto">
            Selecione o limite desejado e aguarde o contato do MUCA em menos de 3 minutos!
          </p>
        </div>

        {/* 10k+ Fixed Price Alert */}
        <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-200">
            <strong>🔥 PROMOÇÃO!</strong> Qualquer limite acima de <strong>R$ 10.000</strong> tem preço fixo de apenas <strong>R$ 450,00</strong>!
          </AlertDescription>
        </Alert>

        {/* Balance Info */}
        <div className="text-center mb-6 p-4 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Seu saldo: </span>
          <span className="font-bold text-primary text-lg">{formatCurrency(balance)}</span>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiers.map((tier, index) => {
            const effectivePrice = getEffectivePrice(tier.limit_amount, tier.price);
            const isAbove10k = tier.limit_amount >= 10000;
            const hasEnoughBalance = balance >= effectivePrice;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card 
                  className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] border-2 ${
                    selectedTier?.limit === tier.limit_amount 
                      ? 'border-orange-500 shadow-lg shadow-orange-500/30' 
                      : 'border-orange-500/30 hover:border-orange-500/70 hover:shadow-lg hover:shadow-orange-500/20'
                  } ${!hasEnoughBalance ? 'opacity-60' : ''}`}
                  style={{
                    boxShadow: '0 0 20px rgba(255, 120, 0, 0.15), inset 0 0 20px rgba(255, 120, 0, 0.05)'
                  }}
                  onClick={() => !isSubmitting && hasEnoughBalance && handleSelectTier(tier.limit_amount, tier.price, tier.id)}
                >
                  {/* Glow Border Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-600/10 pointer-events-none" />
                  
                  {/* 10k+ Badge */}
                  {isAbove10k && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="px-2 py-1 text-xs font-bold bg-orange-500 text-white rounded-full animate-pulse">
                        PROMO!
                      </span>
                    </div>
                  )}
                  
                  <CardContent className="relative p-6">
                    {/* Limit Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-orange-400 uppercase tracking-wide">
                        Limite
                      </span>
                      <CreditCard className="h-5 w-5 text-orange-500" />
                    </div>

                    {/* Limit Amount */}
                    <div className="mb-4">
                      <span className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                        {formatCurrency(tier.limit_amount)}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-lg text-muted-foreground">por apenas</span>
                      <span className="text-2xl font-bold text-orange-500">
                        {formatCurrency(effectivePrice)}
                      </span>
                      {isAbove10k && tier.price !== effectivePrice && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          {formatCurrency(tier.price)}
                        </span>
                      )}
                    </div>

                    {/* Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0"
                      disabled={isSubmitting || !hasEnoughBalance}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasEnoughBalance) {
                          handleSelectTier(tier.limit_amount, tier.price, tier.id);
                        }
                      }}
                    >
                      {isSubmitting && selectedTier?.limit === tier.limit_amount ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Solicitando...
                        </>
                      ) : !hasEnoughBalance ? (
                        'Saldo Insuficiente'
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Solicitar
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          💰 O valor será descontado do seu saldo ao solicitar.
        </motion.p>
      </motion.div>

      {/* Waiting Popup */}
      {selectedTier && (
        <ConsultavelWaitingPopup
          isOpen={showWaitingPopup}
          onClose={() => setShowWaitingPopup(false)}
          limitAmount={selectedTier.limit}
          price={selectedTier.price}
          userName={profile?.name || 'Cliente'}
          chatId={selectedTier.chatId}
        />
      )}
    </>
  );
};

export default ConsultavelTierSelector;