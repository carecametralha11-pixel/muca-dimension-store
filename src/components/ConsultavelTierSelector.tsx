import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Sparkles, Loader2, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePricingTiers, useCreateConsultavelRequest } from '@/hooks/useConsultavelPricing';
import { useCreateChat, useSendMessage, useUserChat } from '@/hooks/useSupportChat';
import ConsultavelWaitingPopup from '@/components/ConsultavelWaitingPopup';
import { toast } from 'sonner';

interface SelectedTierData {
  limit: number;
  price: number;
  chatId: string;
}

const ConsultavelTierSelector: React.FC = () => {
  const { user, profile } = useAuth();
  const { data: tiers = [], isLoading } = usePricingTiers();
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

  const handleSelectTier = async (limitAmount: number, price: number, tierId: string) => {
    if (!user || !profile) {
      toast.error('Você precisa estar logado para solicitar uma consultável');
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

      // Send message with the request
      const message = `🔍 **Solicitação de Consultável**\n\n💳 Limite: ${formatCurrency(limitAmount)}\n💰 Valor: ${formatCurrency(price)}\n\nOlá! Tenho interesse em uma consultável com limite de ${formatCurrency(limitAmount)}.`;

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
        price,
        status: 'pending',
        chat_id: chatId,
      });

      // Set selected tier with chat ID
      setSelectedTier({ limit: limitAmount, price, chatId });
      
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
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-4"
          >
            <Sparkles className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Escolha seu Limite
          </h2>
          
          <p className="text-muted-foreground max-w-md mx-auto">
            Selecione o limite desejado e aguarde o contato do MUCA em menos de 3 minutos!
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card 
                className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 ${
                  selectedTier?.limit === tier.limit_amount 
                    ? 'border-primary shadow-lg shadow-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => !isSubmitting && handleSelectTier(tier.limit_amount, tier.price, tier.id)}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                
                <CardContent className="relative p-6">
                  {/* Limit Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Limite
                    </span>
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>

                  {/* Limit Amount */}
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">
                      {formatCurrency(tier.limit_amount)}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-lg text-muted-foreground">por apenas</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(tier.price)}
                    </span>
                  </div>

                  {/* Button */}
                  <Button
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTier(tier.limit_amount, tier.price, tier.id);
                    }}
                  >
                    {isSubmitting && selectedTier?.limit === tier.limit_amount ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Solicitando...
                      </>
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
          ))}
        </div>

        {/* Info Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          💬 Ao solicitar, você será atendido via chat do site. Nenhum valor será cobrado do saldo.
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
