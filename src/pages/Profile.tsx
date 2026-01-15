import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { User, Wallet, History, Lock, Loader2, Eye, EyeOff, Copy, Check, PlusCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useBalance } from '@/hooks/useBalance';
import { usePurchases } from '@/hooks/usePurchases';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Profile = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { data: balance = 0 } = useBalance(user?.id);
  const { data: purchases = [], isLoading: purchasesLoading } = usePurchases(user?.id);
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'info' | 'purchases' | 'password'>('info');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Handle tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'purchases') {
      setActiveTab('purchases');
    }
  }, [searchParams]);

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

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Senha atualizada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar senha');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleSensitive = (id: string) => {
    setShowSensitive(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tabs = [
    { id: 'info', label: 'Meus Dados', icon: User },
    { id: 'purchases', label: 'Histórico', icon: History },
    { id: 'password', label: 'Alterar Senha', icon: Lock },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-grotesk text-3xl font-bold mb-2">Meu Perfil</h1>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Balance Card */}
            <Card className="mb-6">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Seu Saldo</p>
                      <p className="font-grotesk text-2xl font-bold">
                        R$ {balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Link to="/add-balance">
                    <Button size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Adicionar Saldo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            {activeTab === 'info' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Informações da Conta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Nome</label>
                      <p className="font-medium">{profile?.name || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Total de Compras</label>
                      <p className="font-medium">{purchases.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'purchases' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Compras</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {purchasesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : purchases.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Você ainda não fez nenhuma compra.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {purchases.map((purchase) => (
                          <div
                            key={purchase.id}
                            className="rounded-lg bg-secondary/50 border border-border overflow-hidden"
                          >
                            <button
                              onClick={() => setExpandedPurchase(expandedPurchase === purchase.id ? null : purchase.id)}
                              className="w-full p-4 flex items-center justify-between text-left hover:bg-secondary transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="font-medium truncate">{purchase.cardName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {purchase.cardCategory} • {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <div className="text-right shrink-0 ml-4">
                                <p className="font-grotesk font-bold">
                                  R$ {purchase.price.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {purchase.paymentMethod === 'balance' ? 'Saldo' : 'PIX'}
                                </p>
                              </div>
                            </button>

                            {expandedPurchase === purchase.id && (purchase.cardNumber || purchase.description) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="border-t border-border p-4 bg-background space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm">Dados do Card</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSensitive(purchase.id)}
                                  >
                                    {showSensitive[purchase.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  {/* Description for CONSULTÁVEL cards */}
                                  {purchase.description && (
                                    <div className="p-2 rounded bg-secondary">
                                      <p className="text-xs text-muted-foreground">Descrição</p>
                                      <p className="text-sm whitespace-pre-wrap">
                                        {showSensitive[purchase.id] ? purchase.description : '******'}
                                      </p>
                                    </div>
                                  )}

                                  {purchase.cardNumber && (
                                    <div className="flex items-center justify-between p-2 rounded bg-secondary">
                                      <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">Número</p>
                                        <p className="font-mono text-sm truncate">
                                          {showSensitive[purchase.id] ? purchase.cardNumber : `${purchase.cardNumber.slice(0, 4)} **** **** ****`}
                                        </p>
                                      </div>
                                      {showSensitive[purchase.id] && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 shrink-0"
                                          onClick={() => handleCopy(purchase.cardNumber!, `${purchase.id}-number`)}
                                        >
                                          {copiedField === `${purchase.id}-number` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                      )}
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center justify-between p-2 rounded bg-secondary">
                                      <div>
                                        <p className="text-xs text-muted-foreground">Validade</p>
                                        <p className="font-mono text-sm">
                                          {showSensitive[purchase.id] ? purchase.cardExpiry : '**/**'}
                                        </p>
                                      </div>
                                      {showSensitive[purchase.id] && purchase.cardExpiry && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => handleCopy(purchase.cardExpiry!, `${purchase.id}-expiry`)}
                                        >
                                          {copiedField === `${purchase.id}-expiry` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                        </Button>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded bg-secondary">
                                      <div>
                                        <p className="text-xs text-muted-foreground">CVV</p>
                                        <p className="font-mono text-sm">
                                          {showSensitive[purchase.id] ? purchase.cardCvv : '***'}
                                        </p>
                                      </div>
                                      {showSensitive[purchase.id] && purchase.cardCvv && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => handleCopy(purchase.cardCvv!, `${purchase.id}-cvv`)}
                                        >
                                          {copiedField === `${purchase.id}-cvv` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  {purchase.holderName && (
                                    <div className="flex items-center justify-between p-2 rounded bg-secondary">
                                      <div>
                                        <p className="text-xs text-muted-foreground">Titular</p>
                                        <p className="text-sm">
                                          {showSensitive[purchase.id] ? purchase.holderName : '******'}
                                        </p>
                                      </div>
                                      {showSensitive[purchase.id] && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => handleCopy(purchase.holderName!, `${purchase.id}-holder`)}
                                        >
                                          {copiedField === `${purchase.id}-holder` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                        </Button>
                                      )}
                                    </div>
                                  )}

                                  {purchase.cpf && (
                                    <div className="flex items-center justify-between p-2 rounded bg-secondary">
                                      <div>
                                        <p className="text-xs text-muted-foreground">CPF</p>
                                        <p className="font-mono text-sm">
                                          {showSensitive[purchase.id] ? purchase.cpf : '***.***.***-**'}
                                        </p>
                                      </div>
                                      {showSensitive[purchase.id] && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => handleCopy(purchase.cpf!, `${purchase.id}-cpf`)}
                                        >
                                          {copiedField === `${purchase.id}-cpf` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                        </Button>
                                      )}
                                    </div>
                                  )}

                                  {/* Copy All Button */}
                                  {showSensitive[purchase.id] && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full mt-2"
                                      onClick={() => {
                                        const allData = [
                                          purchase.cardNumber,
                                          purchase.cardExpiry,
                                          purchase.cardCvv,
                                          purchase.holderName,
                                          purchase.cpf,
                                        ].filter(Boolean).join(' | ');
                                        handleCopy(allData, `${purchase.id}-all`);
                                      }}
                                    >
                                      {copiedField === `${purchase.id}-all` ? (
                                        <>
                                          <Check className="h-4 w-4 mr-2" />
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

                                  <div className="flex gap-2 flex-wrap">
                                    {purchase.cardLevel && (
                                      <span className="px-2 py-1 rounded bg-secondary text-xs font-medium">
                                        {purchase.cardLevel}
                                      </span>
                                    )}
                                    {purchase.bankName && (
                                      <span className="px-2 py-1 rounded bg-secondary text-xs font-medium">
                                        {purchase.bankName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'password' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Nova senha"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirmar nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button 
                      onClick={handlePasswordChange} 
                      disabled={isUpdating}
                      className="w-full"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Salvar Nova Senha'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
