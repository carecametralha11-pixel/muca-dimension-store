import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, DollarSign, CreditCard, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateChat, useSendMessage, useUserChat } from '@/hooks/useSupportChat';
import { toast } from 'sonner';

interface ConsultavelContactFormProps {
  onChatStarted?: () => void;
}

const ConsultavelContactForm: React.FC<ConsultavelContactFormProps> = ({ onChatStarted }) => {
  const { user, profile } = useAuth();
  const [valorConsultavel, setValorConsultavel] = useState('');
  const [limiteDesejado, setLimiteDesejado] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createChat = useCreateChat();
  const sendMessage = useSendMessage();
  const { data: existingChat, refetch: refetchChat } = useUserChat(user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      toast.error('Você precisa estar logado para entrar em contato');
      return;
    }

    if (!valorConsultavel || !limiteDesejado) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsSubmitting(true);

    try {
      let chatId = existingChat?.id;

      // Create chat if doesn't exist
      if (!chatId) {
        const newChat = await createChat.mutateAsync({
          userId: user.id,
          userName: profile.name,
          userEmail: profile.email,
        });
        chatId = newChat.id;
        await refetchChat();
      }

      // Send message with the form data
      const message = `🔍 **Interesse em Consultável**\n\n💰 Valor que pretendo pagar: R$ ${valorConsultavel}\n💳 Limite desejado: R$ ${limiteDesejado}\n\nOlá! Tenho interesse em uma consultável com as especificações acima.`;

      await sendMessage.mutateAsync({
        chatId,
        senderId: user.id,
        senderType: 'user',
        message,
      });

      toast.success('Mensagem enviada! O suporte entrará em contato.');
      onChatStarted?.();
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Erro ao iniciar chat. Tente novamente.');
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
          Entre na sua conta para solicitar uma consultável personalizada.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
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
          Solicite sua Consultável
        </h2>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          Preencha o formulário abaixo e nossa equipe entrará em contato para encontrar a melhor opção para você!
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: DollarSign, title: 'Preço Flexível', desc: 'Você define seu orçamento' },
          { icon: CreditCard, title: 'Limite Personalizado', desc: 'Escolha o limite ideal' },
          { icon: MessageCircle, title: 'Atendimento Rápido', desc: 'Resposta em minutos' },
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
          >
            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-4 text-center">
                <feature.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-sm">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-card to-card/80 border-primary/20">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="valor" className="text-sm font-medium flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Valor que pretende pagar (R$)
                  </Label>
                  <Input
                    id="valor"
                    type="number"
                    placeholder="Ex: 150"
                    value={valorConsultavel}
                    onChange={(e) => setValorConsultavel(e.target.value)}
                    className="h-12 text-lg"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="limite" className="text-sm font-medium flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Limite desejado (R$)
                  </Label>
                  <Input
                    id="limite"
                    type="number"
                    placeholder="Ex: 5000"
                    value={limiteDesejado}
                    onChange={(e) => setLimiteDesejado(e.target.value)}
                    className="h-12 text-lg"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Iniciando chat...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Entrar em Contato
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Ao enviar, você será direcionado ao nosso chat de suporte para continuar o atendimento.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ConsultavelContactForm;
