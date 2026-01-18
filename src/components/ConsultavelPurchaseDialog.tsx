import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle, Wallet, Copy, Check, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBalance, useUpdateBalance } from '@/hooks/useBalance';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ConsultavelItemData } from './ConsultavelItem';

interface ConsultavelPurchaseDialogProps {
  consultavel: ConsultavelItemData | null;
  isOpen: boolean;
  onClose: () => void;
}

const ConsultavelPurchaseDialog = ({ consultavel, isOpen, onClose }: ConsultavelPurchaseDialogProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: balance = 0 } = useBalance(user?.id);
  const updateBalance = useUpdateBalance();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPurchased(false);
      setPurchaseData(null);
      setCopiedField(null);
    }
  }, [isOpen]);

  if (!consultavel) return null;

  const canAfford = balance >= consultavel.price;
  const displayBin = consultavel.card_number?.slice(0, 6) || '';

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success('Copiado!');
    } catch (err) {
      toast.error('Erro ao copiar');
    }
  };

  const handlePurchase = async () => {
    if (!user || !canAfford || isPurchasing) return;

    setIsPurchasing(true);
    try {
      // Step 1: Create purchase record FIRST with all data
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          card_id: consultavel.id,
          card_name: consultavel.name,
          card_category: 'CONSULTÁVEL',
          card_level: consultavel.card_level,
          bank_name: consultavel.bank_name,
          card_number: consultavel.card_number,
          card_expiry: consultavel.card_expiry,
          card_cvv: consultavel.card_cvv,
          description: consultavel.description,
          price: consultavel.price,
          payment_method: 'balance',
          status: 'completed'
        })
        .select();

      if (purchaseError) throw purchaseError;
      if (!purchaseData || purchaseData.length === 0) throw new Error('Falha ao criar registro');

      // Step 2: Deduct balance
      const newBalance = balance - consultavel.price;
      await updateBalance.mutateAsync({ userId: user.id, newBalance });

      // Step 3: DELETE the consultavel (remove from available)
      const { error: deleteError } = await supabase
        .from('consultaveis')
        .delete()
        .eq('id', consultavel.id);

      if (deleteError) {
        console.error('Error deleting consultavel:', deleteError);
      }

      setPurchaseData({
        cardNumber: consultavel.card_number,
        cardExpiry: consultavel.card_expiry,
        cardCvv: consultavel.card_cvv,
        bankName: consultavel.bank_name,
        cardLevel: consultavel.card_level,
        description: consultavel.description
      });
      
      // Invalidate queries to update lists
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['consultaveis'] }),
        queryClient.invalidateQueries({ queryKey: ['purchases'] }),
        queryClient.invalidateQueries({ queryKey: ['purchases', user.id] }),
        queryClient.invalidateQueries({ queryKey: ['all-purchases'] }),
        queryClient.invalidateQueries({ queryKey: ['balance', user.id] }),
      ]);
      
      setPurchased(true);
      toast.success('Compra realizada com sucesso!');
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Erro ao realizar compra. Tente novamente.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleClose = () => {
    setPurchased(false);
    setPurchaseData(null);
    setCopiedField(null);
    onClose();
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="p-1 hover:bg-muted rounded transition-colors"
    >
      {copiedField === field ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-grotesk">
            {purchased ? 'Compra Realizada!' : 'Confirmar Compra'}
          </DialogTitle>
        </DialogHeader>

        {!purchased ? (
          <div className="space-y-4">
            {/* Card Preview */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              {consultavel.image_url && (
                <img 
                  src={consultavel.image_url} 
                  alt={consultavel.name}
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    consultavel.type === 'CT'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {consultavel.type === 'CT' ? 'CT' : 'ST'}
                  </span>
                  {consultavel.card_level && (
                    <span className="text-xs text-muted-foreground">{consultavel.card_level}</span>
                  )}
                </div>
                <p className="font-mono text-xl font-bold">
                  {displayBin} <span className="text-muted-foreground">•••• ••••</span>
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {consultavel.card_expiry && <span>{consultavel.card_expiry}</span>}
                  {consultavel.bank_name && (
                    <>
                      <span>•</span>
                      <span>{consultavel.bank_name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Balance Info */}
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Seu saldo</span>
                </div>
                <span className={`font-bold ${canAfford ? 'text-green-500' : 'text-destructive'}`}>
                  R$ {balance.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <span className="text-sm">Valor da compra</span>
                <span className="font-bold">R$ {consultavel.price.toFixed(2)}</span>
              </div>
            </div>

            {!canAfford && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive font-medium">
                    Saldo insuficiente! Você precisa de mais R$ {(consultavel.price - balance).toFixed(2)}
                  </span>
                </div>
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

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handlePurchase}
                disabled={!canAfford || isPurchasing}
                className="flex-1"
              >
                {isPurchasing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Confirmar'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-muted font-mono text-sm">
              {purchaseData?.cardNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Número:</span>
                  <div className="flex items-center gap-1">
                    <span>{purchaseData.cardNumber}</span>
                    <CopyButton text={purchaseData.cardNumber} field="number" />
                  </div>
                </div>
              )}
              {purchaseData?.cardExpiry && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Validade:</span>
                  <div className="flex items-center gap-1">
                    <span>{purchaseData.cardExpiry}</span>
                    <CopyButton text={purchaseData.cardExpiry} field="expiry" />
                  </div>
                </div>
              )}
              {purchaseData?.cardCvv && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">CVV:</span>
                  <div className="flex items-center gap-1">
                    <span>{purchaseData.cardCvv}</span>
                    <CopyButton text={purchaseData.cardCvv} field="cvv" />
                  </div>
                </div>
              )}
              {purchaseData?.bankName && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Banco:</span>
                  <span>{purchaseData.bankName}</span>
                </div>
              )}
              {purchaseData?.cardLevel && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nível:</span>
                  <span>{purchaseData.cardLevel}</span>
                </div>
              )}
            </div>

            <Button 
              onClick={() => {
                handleClose();
                navigate('/profile?tab=purchases');
              }} 
              className="w-full"
            >
              Ver no Histórico
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConsultavelPurchaseDialog;
