import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wallet, Check, Loader2, Copy, Eye, EyeOff, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card as CardType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useBalance, useUpdateBalance } from '@/hooks/useBalance';
import { useCreatePurchase, Purchase } from '@/hooks/usePurchases';
import { useUpdateCard } from '@/hooks/useCards';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PurchaseDialogProps {
  card: CardType | null;
  isOpen: boolean;
  onClose: () => void;
}

const PurchaseDialog = ({ card, isOpen, onClose }: PurchaseDialogProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: balance = 0, refetch: refetchBalance } = useBalance(user?.id);
  const updateBalance = useUpdateBalance();
  const createPurchase = useCreatePurchase();
  const updateCard = useUpdateCard();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'terms' | 'select' | 'confirm' | 'success'>('terms');
  const [purchasedCard, setPurchasedCard] = useState<Purchase | null>(null);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (!card) return null;

  const canAfford = balance >= card.price;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para comprar');
      return;
    }

    if (!canAfford) {
      toast.error('Saldo insuficiente');
      return;
    }

    // Prevent double-click
    if (isProcessing) {
      return;
    }

    console.log('=== INICIANDO COMPRA ===');
    console.log('User ID:', user.id);
    console.log('Card:', card);

    setIsProcessing(true);
    try {
      // First, update card stock to 0 to prevent duplicate purchases
      await updateCard.mutateAsync({
        id: card.id,
        stock: 0,
      });

      // Then create purchase and update balance
      const [purchase] = await Promise.all([
        createPurchase.mutateAsync({
          userId: user.id,
          cardId: card.id,
          cardName: card.name,
          cardCategory: card.category,
          price: card.price,
          paymentMethod: 'balance',
          status: 'completed',
          card: card,
        }),
        updateBalance.mutateAsync({
          userId: user.id,
          newBalance: balance - card.price,
        }),
      ]);

      // Force refetch to update UI immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cards'] }),
        queryClient.invalidateQueries({ queryKey: ['all-cards'] }),
        queryClient.invalidateQueries({ queryKey: ['purchases', user.id] }),
        queryClient.invalidateQueries({ queryKey: ['balance', user.id] }),
      ]);

      setPurchasedCard(purchase);
      setStep('success');
      toast.success('Compra realizada com sucesso!');
    } catch (error: any) {
      console.error('Erro na compra:', error);
      // Rollback stock if purchase failed
      try {
        await updateCard.mutateAsync({ id: card.id, stock: 1 });
      } catch (rollbackError) {
        console.error('Erro ao restaurar stock:', rollbackError);
      }
      toast.error(error.message || 'Erro ao processar compra');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('terms');
    setPurchasedCard(null);
    setShowSensitiveData(false);
    setAcceptedTerms(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl">
            {step === 'terms' ? 'Termos de Compra' : step === 'success' ? 'Compra Realizada!' : 'Confirmar Compra'}
          </DialogTitle>
        </DialogHeader>

        {step === 'terms' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="p-4 rounded-lg bg-muted border border-border space-y-3">
              <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                ✅ GARANTIA DE LIVE.{'\n\n'}
                ✅ INFO VIRGEM{'\n\n'}
                🕣 PRAZO DE TROCA 10 MINUTOS MEDIANTE PRINT, E APENAS PARA DIE. 🌐 TESTE REALIZADO NO GPAY{'\n\n'}
                ⚠ GARANTO MEU MATERIAL, NÃO O SEU TRAMPO.{'\n\n'}
                ❌ NÃO REALIZAMOS REEMBOLSO DE PIX.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="accept-terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-portal-green"
              />
              <label htmlFor="accept-terms" className="text-sm text-muted-foreground cursor-pointer">
                Li e estou ciente dos termos acima
              </label>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={() => setStep('select')} 
                className="flex-1"
                disabled={!acceptedTerms}
              >
                Continuar
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="p-4 rounded-lg bg-muted border border-border">
              <h3 className="font-orbitron font-bold text-foreground">{card.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{card.category}</p>
              <p className="font-orbitron text-2xl font-bold text-portal-green mt-2">
                R$ {card.price.toFixed(2)}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Método de Pagamento</p>
              
              <div className={`w-full p-4 rounded-lg border-2 ${canAfford ? 'border-portal-green bg-portal-green/10' : 'border-destructive bg-destructive/10'} flex items-center gap-3`}>
                <Wallet className={`h-5 w-5 ${canAfford ? 'text-portal-green' : 'text-destructive'}`} />
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">Saldo do Site</p>
                  <p className={`text-sm ${canAfford ? 'text-portal-green' : 'text-destructive'}`}>
                    Disponível: R$ {balance.toFixed(2)}
                  </p>
                </div>
                {canAfford && <Check className="h-5 w-5 text-portal-green" />}
              </div>

              {/* Show reload button when balance is insufficient */}
              {!canAfford && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                  <p className="text-sm text-destructive font-medium mb-3">
                    Saldo insuficiente! Você precisa de mais R$ {(card.price - balance).toFixed(2)}
                  </p>
                  <Button 
                    onClick={() => {
                      handleClose();
                      navigate('/add-balance');
                    }}
                    className="w-full gap-2"
                    variant="default"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Recarregar Saldo
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('terms')} className="flex-1">
                Voltar
              </Button>
              <Button 
                onClick={() => setStep('confirm')} 
                className="flex-1"
                disabled={!canAfford}
              >
                Continuar
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">Você está prestes a comprar:</p>
              <p className="font-orbitron font-bold text-xl text-foreground">{card.name}</p>
              <p className="font-orbitron text-3xl font-bold text-portal-green mt-2">
                R$ {card.price.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Pagamento via: Saldo do Site
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                Voltar
              </Button>
              <Button 
                onClick={handlePurchase} 
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Confirmar Compra'
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'success' && purchasedCard && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-portal-green/20 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-portal-green" />
              </div>
              <h3 className="font-orbitron text-xl font-bold text-portal-green">
                Compra Concluída!
              </h3>
            </div>

            {/* Card Data */}
            <div className="p-4 rounded-lg bg-muted border border-portal-green/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-orbitron font-bold text-foreground">{purchasedCard.cardName}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSensitiveData(!showSensitiveData)}
                >
                  {showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {/* Description for CONSULTÁVEL cards */}
              {purchasedCard.description && (
                <div className="p-2 rounded bg-background/50">
                  <p className="text-xs text-muted-foreground">Descrição</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {showSensitiveData ? purchasedCard.description : '******'}
                  </p>
                </div>
              )}

              {purchasedCard.cardNumber && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-background/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Número</p>
                      <p className="font-mono text-sm text-foreground">
                        {showSensitiveData ? purchasedCard.cardNumber : `${purchasedCard.cardNumber.slice(0, 4)} **** **** ****`}
                      </p>
                    </div>
                    {showSensitiveData && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopy(purchasedCard.cardNumber!, 'number')}
                      >
                        {copiedField === 'number' ? <Check className="h-4 w-4 text-portal-green" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <div>
                        <p className="text-xs text-muted-foreground">Validade</p>
                        <p className="font-mono text-sm text-foreground">
                          {showSensitiveData ? purchasedCard.cardExpiry : '**/**'}
                        </p>
                      </div>
                      {showSensitiveData && purchasedCard.cardExpiry && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(purchasedCard.cardExpiry!, 'expiry')}
                        >
                          {copiedField === 'expiry' ? <Check className="h-3 w-3 text-portal-green" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <div>
                        <p className="text-xs text-muted-foreground">CVV</p>
                        <p className="font-mono text-sm text-foreground">
                          {showSensitiveData ? purchasedCard.cardCvv : '***'}
                        </p>
                      </div>
                      {showSensitiveData && purchasedCard.cardCvv && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(purchasedCard.cardCvv!, 'cvv')}
                        >
                          {copiedField === 'cvv' ? <Check className="h-3 w-3 text-portal-green" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  </div>

                  {purchasedCard.holderName && (
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <div>
                        <p className="text-xs text-muted-foreground">Titular</p>
                        <p className="text-sm text-foreground">
                          {showSensitiveData ? purchasedCard.holderName : '******'}
                        </p>
                      </div>
                      {showSensitiveData && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(purchasedCard.holderName!, 'holder')}
                        >
                          {copiedField === 'holder' ? <Check className="h-3 w-3 text-portal-green" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  )}

                  {purchasedCard.cpf && (
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <div>
                        <p className="text-xs text-muted-foreground">CPF</p>
                        <p className="font-mono text-sm text-foreground">
                          {showSensitiveData ? purchasedCard.cpf : '***.***.***-**'}
                        </p>
                      </div>
                      {showSensitiveData && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(purchasedCard.cpf!, 'cpf')}
                        >
                          {copiedField === 'cpf' ? <Check className="h-3 w-3 text-portal-green" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Copy All Button */}
                  {showSensitiveData && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const allData = [
                          purchasedCard.cardNumber,
                          purchasedCard.cardExpiry,
                          purchasedCard.cardCvv,
                          purchasedCard.holderName,
                          purchasedCard.cpf,
                        ].filter(Boolean).join(' | ');
                        handleCopy(allData, 'all');
                      }}
                    >
                      {copiedField === 'all' ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-portal-green" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Todos os Dados
                        </>
                      )}
                    </Button>
                  )}

                  <div className="flex gap-2">
                    {purchasedCard.cardLevel && (
                      <span className="px-2 py-1 rounded bg-portal-cyan/20 text-portal-cyan text-xs font-semibold">
                        {purchasedCard.cardLevel}
                      </span>
                    )}
                    {purchasedCard.bankName && (
                      <span className="px-2 py-1 rounded bg-portal-green/20 text-portal-green text-xs font-semibold">
                        {purchasedCard.bankName}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Os dados estão salvos no seu histórico de compras.
            </p>

            <Button 
              onClick={() => {
                handleClose();
                navigate('/profile?tab=purchases');
              }} 
              className="w-full"
            >
              Ver no Histórico
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;
