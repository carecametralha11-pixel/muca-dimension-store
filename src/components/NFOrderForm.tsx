import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useBalance, useUpdateBalance } from '@/hooks/useBalance';
import { useCreateNFOrder, calculateNFPrice } from '@/hooks/useNFOrders';
import { useCreateChat, useSendMessage, useUserChat } from '@/hooks/useSupportChat';
import { toast } from 'sonner';

const NFOrderForm: React.FC = () => {
  const { user, profile } = useAuth();
  const { data: balance = 0 } = useBalance(user?.id);
  const updateBalance = useUpdateBalance();
  const createOrder = useCreateNFOrder();
  const createChat = useCreateChat();
  const sendMessage = useSendMessage();
  const { data: existingChat, refetch: refetchChat } = useUserChat(user?.id);

  const [fullName, setFullName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const quantityOptions = [
    { value: '1000', label: 'R$ 1.000' },
    { value: '2000', label: 'R$ 2.000' },
    { value: '3000', label: 'R$ 3.000' },
    { value: '4000', label: 'R$ 4.000' },
    { value: '5000', label: 'R$ 5.000' },
    { value: '6000', label: 'R$ 6.000' },
    { value: '7000', label: 'R$ 7.000' },
    { value: '8000', label: 'R$ 8.000' },
    { value: '9000', label: 'R$ 9.000' },
    { value: '10000', label: 'R$ 10.000' },
  ];

  const selectedQuantity = parseInt(quantity) || 0;
  const price = calculateNFPrice(selectedQuantity);
  const hasEnoughBalance = balance >= price;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      toast.error('Você precisa estar logado');
      return;
    }

    if (!fullName.trim() || !deliveryAddress.trim() || !quantity) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (!hasEnoughBalance) {
      toast.error('Saldo insuficiente');
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
      const newBalance = balance - price;
      await updateBalance.mutateAsync({ userId: user.id, newBalance });

      // Send message with order details
      const message = `📦 **Pedido de NF**\n\n👤 Nome: ${fullName}\n📍 Endereço: ${deliveryAddress}\n💵 Quantidade: ${formatCurrency(selectedQuantity)}\n💰 Valor Pago: ${formatCurrency(price)}\n\nAguardando preparação do envio.`;

      await sendMessage.mutateAsync({
        chatId,
        senderId: user.id,
        senderType: 'user',
        message,
      });

      // Create order
      await createOrder.mutateAsync({
        user_id: user.id,
        user_name: profile.name,
        user_email: profile.email,
        full_name: fullName,
        delivery_address: deliveryAddress,
        quantity: selectedQuantity,
        price,
        status: 'pending',
        chat_id: chatId,
      });

      setShowSuccess(true);
      setFullName('');
      setDeliveryAddress('');
      setQuantity('');

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Alert className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Faça login para fazer um pedido.
        </AlertDescription>
      </Alert>
    );
  }

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto"
      >
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <CheckCircle className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2 text-green-500">Pedido Realizado!</h3>
            <p className="text-muted-foreground mb-4">
              Seu envio está sendo preparado. Fique de olho no site, o administrador entrará em contato em breve pelo chat!
            </p>
            <Button onClick={() => setShowSuccess(false)} variant="outline">
              Fazer outro pedido
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Fazer Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Pricing Info */}
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <AlertDescription className="text-sm">
              <strong>Preços:</strong><br />
              • Até R$ 4.000: <strong>R$ 130</strong> a cada mil<br />
              • Acima de R$ 4.000: <strong>R$ 100</strong> a cada mil extra
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>

            {/* Delivery Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço de Entrega
              </Label>
              <Textarea
                id="address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Endereço completo com CEP"
                rows={3}
                required
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Quantidade
              </Label>
              <Select value={quantity} onValueChange={setQuantity}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a quantidade" />
                </SelectTrigger>
                <SelectContent>
                  {quantityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Summary */}
            {selectedQuantity > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-lg bg-muted space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span>Quantidade:</span>
                  <span className="font-medium">{formatCurrency(selectedQuantity)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Valor a pagar:</span>
                  <span className="font-bold text-primary">{formatCurrency(price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Seu saldo:</span>
                  <span className={hasEnoughBalance ? 'text-green-500' : 'text-red-500'}>
                    {formatCurrency(balance)}
                  </span>
                </div>
                {!hasEnoughBalance && (
                  <p className="text-xs text-red-500 mt-2">
                    Saldo insuficiente. Adicione mais saldo para continuar.
                  </p>
                )}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !hasEnoughBalance || !quantity}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Confirmar Pedido ({formatCurrency(price)})
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NFOrderForm;
