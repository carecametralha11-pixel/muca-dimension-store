import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, User, CreditCard, Calendar, BookOpen, Loader2, CheckCircle, AlertCircle, Sparkles, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useBalance, useUpdateBalance } from '@/hooks/useBalance';
import { useDiplomaConfig, useCreateDiplomaOrder } from '@/hooks/useDiplomaOrders';
import { useCreateChat, useSendMessage, useUserChat } from '@/hooks/useSupportChat';
import { toast } from 'sonner';

const courseTypes = [
  'Administração',
  'Ciências Contábeis',
  'Direito',
  'Enfermagem',
  'Engenharia Civil',
  'Engenharia Elétrica',
  'Engenharia de Produção',
  'Farmácia',
  'Medicina',
  'Nutrição',
  'Pedagogia',
  'Psicologia',
  'Sistemas de Informação',
  'Outro',
];

const DiplomaOrderForm: React.FC = () => {
  const { user, profile } = useAuth();
  const { data: balance = 0 } = useBalance(user?.id);
  const { data: config, isLoading: configLoading } = useDiplomaConfig();
  const updateBalance = useUpdateBalance();
  const createOrder = useCreateDiplomaOrder();
  const createChat = useCreateChat();
  const sendMessage = useSendMessage();
  const { data: existingChat, refetch: refetchChat } = useUserChat(user?.id);

  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [courseType, setCourseType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const price = config?.price || 0;
  const hasEnoughBalance = balance >= price;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    if (formatted.length <= 14) {
      setCpf(formatted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      toast.error('Você precisa estar logado');
      return;
    }

    if (!fullName.trim() || !cpf.trim() || !birthDate.trim() || !courseType) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (cpf.replace(/\D/g, '').length !== 11) {
      toast.error('CPF inválido');
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
      const message = `🎓 **Pedido de Diploma UNINTER**\n\n👤 Nome Completo: ${fullName}\n📋 CPF: ${cpf}\n📅 Data de Nascimento: ${birthDate}\n📚 Curso: ${courseType}\n💰 Valor Pago: ${formatCurrency(price)}\n\nAguardando processamento.`;

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
        cpf: cpf.replace(/\D/g, ''),
        birth_date: birthDate,
        course_type: courseType,
        price,
        status: 'pending',
        chat_id: chatId,
      });

      setShowSuccess(true);
      setFullName('');
      setCpf('');
      setBirthDate('');
      setCourseType('');

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

  if (configLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config?.is_active) {
    return (
      <Alert className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Este serviço está temporariamente indisponível.
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
        <Card className="border-emerald-500/50 bg-emerald-500/5">
          <CardContent className="py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-16 h-16 bg-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <CheckCircle className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2 text-emerald-500">Pedido Realizado!</h3>
            <p className="text-muted-foreground mb-4">
              Seu diploma está sendo processado. Aguarde o contato do administrador pelo chat do site!
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
            <GraduationCap className="h-5 w-5 text-primary" />
            Solicitar Diploma
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Info Alert */}
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Diploma UNINTER</strong><br />
              ✅ Credenciado e VÁLIDO<br />
              ✅ ORIGINAL com QR Code<br />
              ✅ Dados do aluno no site da faculdade
            </AlertDescription>
          </Alert>

          {/* Price */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted mb-6">
            <span className="font-medium">Valor:</span>
            <Badge variant="default" className="text-lg px-4 py-1">
              {formatCurrency(price)}
            </Badge>
          </div>

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
                placeholder="Nome completo conforme documento"
                required
              />
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                CPF
              </Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                required
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Nascimento
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>

            {/* Course Type */}
            <div className="space-y-2">
              <Label htmlFor="courseType" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Tipo de Curso
              </Label>
              <Select value={courseType} onValueChange={setCourseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o curso" />
                </SelectTrigger>
                <SelectContent>
                  {courseTypes.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Balance Info */}
            <div className="p-4 rounded-lg bg-muted space-y-2">
              <div className="flex justify-between text-sm">
                <span>Valor a pagar:</span>
                <span className="font-bold text-primary">{formatCurrency(price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Seu saldo:</span>
                <span className={hasEnoughBalance ? 'text-emerald-500' : 'text-destructive'}>
                  {formatCurrency(balance)}
                </span>
              </div>
              {!hasEnoughBalance && (
                <p className="text-xs text-destructive mt-2">
                  Saldo insuficiente. Adicione mais saldo para continuar.
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !hasEnoughBalance || !courseType}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <GraduationCap className="h-4 w-4 mr-2" />
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

export default DiplomaOrderForm;
