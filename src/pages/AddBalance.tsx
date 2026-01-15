import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Wallet, QrCode, Copy, Check, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useBalance } from '@/hooks/useBalance';
import { usePixPayment } from '@/hooks/usePixPayments';
import PaymentSuccessDialog from '@/components/PaymentSuccessDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AddBalance = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { data: balance = 0 } = useBalance(user?.id);
  const [amount, setAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{ qr_code: string; qr_code_base64: string } | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);

  const { data: payment } = usePixPayment(currentPaymentId || undefined);

  // Check for pending payment on mount (in case user left and came back)
  useEffect(() => {
    const checkPendingPayment = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('pix_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setCurrentPaymentId(data.id);
        setQrCodeData({
          qr_code: data.qr_code || '',
          qr_code_base64: data.qr_code_base64 || '',
        });
        setAmount(data.amount.toString());
        setShowQR(true);
      }
    };

    checkPendingPayment();
  }, [user]);

  // Watch for payment approval
  useEffect(() => {
    if (payment?.status === 'approved') {
      setPaidAmount(Number(payment.amount));
      setShowSuccessDialog(true);
      setShowQR(false);
      setCurrentPaymentId(null);
      setQrCodeData(null);
      setAmount('');
    }
  }, [payment?.status, payment?.amount]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleGenerateQR = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Informe um valor válido');
      return;
    }

    try {
      setIsProcessing(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await supabase.functions.invoke('create-pix-payment', {
        body: { amount: parseFloat(amount) },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar pagamento');
      }

      setCurrentPaymentId(result.payment.id);
      setQrCodeData({
        qr_code: result.payment.qr_code,
        qr_code_base64: result.payment.qr_code_base64,
      });
      setShowQR(true);
      toast.success('QR Code gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error(error.message || 'Erro ao gerar QR Code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPix = () => {
    if (qrCodeData?.qr_code) {
      navigator.clipboard.writeText(qrCodeData.qr_code);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleCancelPayment = () => {
    setShowQR(false);
    setCurrentPaymentId(null);
    setQrCodeData(null);
    setAmount('');
  };

  const quickAmounts = [20, 30, 50, 100, 200, 500];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-grotesk text-3xl font-bold mb-2">Adicionar Saldo</h1>
            <p className="text-muted-foreground">Adicione créditos via PIX</p>
          </div>

          <div className="max-w-md mx-auto space-y-6">
            {/* Current Balance */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Atual</p>
                    <p className="font-grotesk text-2xl font-bold">
                      R$ {balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!showQR ? (
              <Card>
                <CardHeader>
                  <CardTitle>Quanto deseja adicionar?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Quick amounts */}
                  <div className="grid grid-cols-3 gap-2">
                    {quickAmounts.map((value) => (
                      <button
                        key={value}
                        onClick={() => setAmount(value.toString())}
                        className={`p-3 rounded-lg border font-medium transition-colors ${
                          amount === value.toString()
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border hover:border-foreground/50'
                        }`}
                      >
                        R$ {value}
                      </button>
                    ))}
                  </div>

                  {/* Custom amount */}
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Ou digite um valor:</label>
                    <Input
                      type="number"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                    />
                  </div>

                  <Button 
                    onClick={handleGenerateQR} 
                    className="w-full"
                    disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gerando QR Code...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4 mr-2" />
                        Gerar QR Code PIX
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Escaneie o QR Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm mb-1">Valor a pagar:</p>
                    <p className="font-grotesk text-2xl font-bold">
                      R$ {parseFloat(amount).toFixed(2)}
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    {qrCodeData?.qr_code_base64 ? (
                      <img 
                        src={`data:image/png;base64,${qrCodeData.qr_code_base64}`}
                        alt="QR Code PIX"
                        className="w-48 h-48 rounded-lg"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-secondary rounded-lg flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Aguardando pagamento...
                      </span>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      O saldo será adicionado automaticamente após a confirmação
                    </p>
                  </div>

                  {/* Copy PIX Key */}
                  <Button 
                    variant="outline" 
                    onClick={handleCopyPix}
                    className="w-full"
                    disabled={!qrCodeData?.qr_code}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Código PIX
                      </>
                    )}
                  </Button>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleCancelPayment}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Link to="/profile" className="flex-1">
                      <Button variant="secondary" className="w-full">
                        Ver Perfil
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warning about no refunds */}
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-5">
                <h3 className="font-grotesk font-semibold mb-2 text-destructive">⚠️ Atenção</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Não realizamos reembolso de PIX.</strong> Deposite apenas o valor que pretende utilizar. Verifique os produtos disponíveis antes de adicionar saldo.
                </p>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-grotesk font-semibold mb-4">Como funciona?</h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-secondary text-foreground flex items-center justify-center text-xs font-medium shrink-0">1</span>
                    <span>Escolha o valor que deseja adicionar</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-secondary text-foreground flex items-center justify-center text-xs font-medium shrink-0">2</span>
                    <span>Escaneie o QR Code PIX ou copie o código</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-secondary text-foreground flex items-center justify-center text-xs font-medium shrink-0">3</span>
                    <span>O saldo será adicionado automaticamente após o pagamento</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      <PaymentSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        amount={paidAmount}
      />
    </div>
  );
};

export default AddBalance;
