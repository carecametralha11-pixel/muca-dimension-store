import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wallet, Check, Loader2, Package, Eye, EyeOff, Copy, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CardMix, useUpdateCardMix } from '@/hooks/useCardMixes';
import { useAuth } from '@/contexts/AuthContext';
import { useBalance, useUpdateBalance } from '@/hooks/useBalance';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface MixPurchaseDialogProps {
  mix: CardMix | null;
  isOpen: boolean;
  onClose: () => void;
}

interface MixPurchase {
  mixId: string;
  mixName: string;
  cardData: string | null;
  price: number;
  quantity: number;
}

const MixPurchaseDialog = ({ mix, isOpen, onClose }: MixPurchaseDialogProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: balance = 0 } = useBalance(user?.id);
  const updateBalance = useUpdateBalance();
  const updateMix = useUpdateCardMix();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'terms' | 'select' | 'confirm' | 'success'>('terms');
  const [purchasedMix, setPurchasedMix] = useState<MixPurchase | null>(null);
  const [showData, setShowData] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!mix) return null;

  const canAfford = balance >= mix.price;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
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

    setIsProcessing(true);
    try {
      // First, update mix stock to prevent duplicate purchases
      await updateMix.mutateAsync({
        id: mix.id,
        stock: mix.stock - 1,
      });

      // Then update balance
      await updateBalance.mutateAsync({
        userId: user.id,
        newBalance: balance - mix.price,
      });

      setPurchasedMix({
        mixId: mix.id,
        mixName: mix.name,
        cardData: mix.card_data,
        price: mix.price,
        quantity: mix.quantity,
      });
      
      // Force refetch to update UI immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['card-mixes'] }),
        queryClient.invalidateQueries({ queryKey: ['balance', user.id] }),
      ]);
      
      setStep('success');
      toast.success('Compra realizada com sucesso!');
    } catch (error: any) {
      console.error('Erro na compra:', error);
      // Rollback stock if purchase failed
      try {
        await updateMix.mutateAsync({ id: mix.id, stock: mix.stock });
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
    setPurchasedMix(null);
    setShowData(false);
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
                ⚠ GARANTO MEU MATERIAL, NÃO O SEU TRAMPO.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="accept-mix-terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-portal-green"
              />
              <label htmlFor="accept-mix-terms" className="text-sm text-muted-foreground cursor-pointer">
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
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-5 w-5 text-portal-cyan" />
                <h3 className="font-orbitron font-bold text-foreground">{mix.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{mix.quantity} cards inclusos</p>
              <p className="font-orbitron text-2xl font-bold text-portal-green mt-2">
                R$ {mix.price.toFixed(2)}
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
                    Saldo insuficiente! Você precisa de mais R$ {(mix.price - balance).toFixed(2)}
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
              <p className="font-orbitron font-bold text-xl text-foreground">{mix.name}</p>
              <p className="text-sm text-muted-foreground">{mix.quantity} cards</p>
              <p className="font-orbitron text-3xl font-bold text-portal-green mt-2">
                R$ {mix.price.toFixed(2)}
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

        {step === 'success' && purchasedMix && (
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
              <p className="text-sm text-muted-foreground mt-1">
                {purchasedMix.mixName} - {purchasedMix.quantity} cards
              </p>
            </div>

            {/* Card Data */}
            <div className="p-4 rounded-lg bg-muted border border-portal-green/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-orbitron font-bold text-foreground">Dados dos Cards</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowData(!showData)}
                >
                  {showData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              <div className="p-2 rounded bg-background/50">
                {showData ? (
                  <div className="space-y-2">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-mono break-all">
                      {purchasedMix.cardData || 'Dados não disponíveis'}
                    </pre>
                    {purchasedMix.cardData && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleCopy(purchasedMix.cardData!)}
                      >
                        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        {copied ? 'Copiado!' : 'Copiar Dados'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Clique no ícone do olho para revelar os dados
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Guarde esses dados em um local seguro.
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

export default MixPurchaseDialog;
