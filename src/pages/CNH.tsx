import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Image, Play, MessageCircle, Upload, Calendar, Car, Camera, User, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useModuleDescription } from '@/hooks/useModuleDescriptions';
import { useModuleMedia, ModuleMedia } from '@/hooks/useModuleMedia';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useBalance } from '@/hooks/useBalance';
import { useNavigate } from 'react-router-dom';
import selfieExample from '@/assets/selfie-example.png';

const CNH_PRICE = 250;

const CNH = () => {
  const { data: description } = useModuleDescription('cnh');
  const { data: media = [], isLoading: mediaLoading } = useModuleMedia('cnh');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: balance = 0 } = useBalance(user?.id);
  const navigate = useNavigate();

  const [rgFrentePreview, setRgFrentePreview] = useState<string | null>(null);
  const [rgVersoPreview, setRgVersoPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [rgFrenteFile, setRgFrenteFile] = useState<File | null>(null);
  const [rgVersoFile, setRgVersoFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [dataCNH, setDataCNH] = useState('');
  const [categoriaCNH, setCategoriaCNH] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedImage, setSelectedImage] = useState<ModuleMedia | null>(null);

  // Setup realtime subscriptions
  useEffect(() => {
    const descChannel = supabase
      .channel('cnh-desc-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'module_descriptions' },
        () => queryClient.invalidateQueries({ queryKey: ['module_descriptions', 'cnh'] })
      )
      .subscribe();

    const mediaChannel = supabase
      .channel('cnh-media-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'module_media' },
        () => queryClient.invalidateQueries({ queryKey: ['module_media', 'cnh'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(descChannel);
      supabase.removeChannel(mediaChannel);
    };
  }, [queryClient]);

  const images = media.filter(m => m.media_type === 'image');
  const videos = media.filter(m => m.media_type === 'video');

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (url: string | null) => void,
    setFile: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value.slice(0, 14);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCpf(e.target.value));
  };

  const handlePedirCNH = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para pedir CNH.');
      navigate('/auth');
      return;
    }

    if (!rgFrenteFile || !rgVersoFile || !selfieFile) {
      toast.error('Por favor, envie todas as fotos obrigatórias (RG frente, verso e selfie).');
      return;
    }
    if (!nomeCompleto.trim()) {
      toast.error('Por favor, informe seu nome completo.');
      return;
    }
    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
      toast.error('Por favor, informe um CPF válido.');
      return;
    }
    if (!dataNascimento) {
      toast.error('Por favor, informe sua data de nascimento.');
      return;
    }
    if (!dataCNH) {
      toast.error('Por favor, informe a data que foi tirada a CNH.');
      return;
    }
    if (!categoriaCNH) {
      toast.error('Por favor, selecione a categoria da CNH.');
      return;
    }

    if (balance < CNH_PRICE) {
      toast.error(`Saldo insuficiente. Você precisa de R$ ${CNH_PRICE.toFixed(2)} para pedir a CNH. Seu saldo atual é R$ ${balance.toFixed(2)}.`);
      return;
    }

    setIsProcessing(true);

    try {
      // Deduct balance
      const newBalance = balance - CNH_PRICE;
      const { error: balanceError } = await supabase
        .from('user_balances')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (balanceError) {
        throw new Error('Erro ao descontar saldo');
      }

      // Invalidate balance query
      queryClient.invalidateQueries({ queryKey: ['balance', user.id] });

      // Create WhatsApp message with all info
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
      };

      const message = 
        `🎫 *PEDIDO DE CNH*\n\n` +
        `👤 *Nome:* ${nomeCompleto}\n` +
        `📝 *CPF:* ${cpf}\n` +
        `🎂 *Nascimento:* ${formatDate(dataNascimento)}\n` +
        `📅 *Data da CNH:* ${formatDate(dataCNH)}\n` +
        `🚗 *Categoria:* ${categoriaCNH}\n\n` +
        `💰 *Valor pago:* R$ ${CNH_PRICE.toFixed(2)}\n\n` +
        `📸 *FOTOS EM ANEXO:*\n` +
        `- RG Frente\n` +
        `- RG Verso\n` +
        `- Foto Selfie\n\n` +
        `✅ Pagamento confirmado via saldo do site.`;

      toast.success('Pagamento realizado com sucesso! Redirecionando para WhatsApp...');
      
      // Open WhatsApp with message
      setTimeout(() => {
        window.open(`https://wa.me/5548996440121?text=${encodeURIComponent(message)}`, '_blank');
        toast.info('Após abrir o WhatsApp, envie as 3 fotos (RG Frente, RG Verso e Selfie).');
      }, 1000);

    } catch (error) {
      console.error('Error processing CNH request:', error);
      toast.error('Erro ao processar pedido. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const canSubmit = rgFrenteFile && rgVersoFile && selfieFile && dataCNH && categoriaCNH && nomeCompleto && cpf && dataNascimento;
  const hasEnoughBalance = balance >= CNH_PRICE;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-6 md:py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-2"
              >
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6" />
                  </div>
                </div>
                <h1 className="font-grotesk text-2xl md:text-3xl font-bold tracking-tight">
                  {description?.title || 'CNH'}
                </h1>
                {description?.subtitle && (
                  <p className="text-lg text-primary font-medium">
                    {description.subtitle}
                  </p>
                )}
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-lg">
                  Valor: R$ {CNH_PRICE.toFixed(2)}
                </div>
                {/* Scroll Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center mt-4 cursor-pointer"
                  onClick={() => window.scrollBy({ top: window.innerHeight * 0.5, behavior: 'smooth' })}
                >
                  <span className="text-muted-foreground text-xs mb-1">Role para ver mais</span>
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronDown className="w-6 h-6 text-primary" />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Balance Warning */}
              {user && !hasEnoughBalance && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Saldo insuficiente</p>
                    <p className="text-xs text-muted-foreground">
                      Seu saldo: R$ {balance.toFixed(2)} | Necessário: R$ {CNH_PRICE.toFixed(2)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto shrink-0"
                    onClick={() => navigate('/add-balance')}
                  >
                    Adicionar Saldo
                  </Button>
                </motion.div>
              )}

              {/* Description */}
              {description?.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                        {description.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Default description if none set */}
              {!description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                        Produzimos CNH idêntica à original, com acesso total ao app GOV.BR e QR CODE funcional.
                        Nossa qualidade é incomparável - cada documento passa por rigoroso controle de qualidade
                        para garantir autenticidade visual e funcionalidade completa.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Media Gallery Section */}
              {!mediaLoading && media.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="space-y-4"
                >
                  {/* Videos */}
                  {videos.length > 0 && (
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Play className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-muted-foreground">Vídeos de Demonstração</h3>
                      </div>
                      <div className={`flex flex-col items-center gap-4 ${videos.length > 1 ? 'md:flex-row md:justify-center' : ''}`}>
                        {videos.map((video, index) => (
                          <motion.div
                            key={video.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="w-full max-w-2xl rounded-lg overflow-hidden border border-border bg-card"
                          >
                            <video
                              src={video.media_url}
                              controls
                              className="w-full aspect-video object-contain bg-black"
                              preload="metadata"
                            />
                            <div className="p-3 border-t border-border text-center">
                              <p className="text-sm font-medium">{video.title}</p>
                              {video.description && (
                                <p className="text-xs text-muted-foreground mt-1">{video.description}</p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {images.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-muted-foreground">Exemplos</h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {images.map((img, index) => (
                          <motion.div
                            key={img.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-card cursor-pointer"
                            onClick={() => setSelectedImage(img)}
                          >
                            <img
                              src={img.media_url}
                              alt={img.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-2">
                                <p className="text-white text-xs font-medium truncate">{img.title}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Request Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Solicitar CNH - R$ {CNH_PRICE.toFixed(2)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Personal Data Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Dados Pessoais
                      </h3>
                      
                      {/* Nome Completo */}
                      <div className="space-y-2">
                        <Label htmlFor="nome-completo" className="text-sm font-medium">
                          Nome Completo *
                        </Label>
                        <Input
                          id="nome-completo"
                          type="text"
                          value={nomeCompleto}
                          onChange={(e) => setNomeCompleto(e.target.value)}
                          placeholder="Digite seu nome completo"
                          className="w-full"
                        />
                      </div>

                      {/* CPF */}
                      <div className="space-y-2">
                        <Label htmlFor="cpf" className="text-sm font-medium">
                          CPF *
                        </Label>
                        <Input
                          id="cpf"
                          type="text"
                          value={cpf}
                          onChange={handleCpfChange}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          className="w-full"
                        />
                      </div>

                      {/* Data Nascimento */}
                      <div className="space-y-2">
                        <Label htmlFor="data-nascimento" className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Data de Nascimento *
                        </Label>
                        <Input
                          id="data-nascimento"
                          type="date"
                          value={dataNascimento}
                          onChange={(e) => setDataNascimento(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* CNH Data Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Dados da CNH
                      </h3>

                      {/* Data CNH */}
                      <div className="space-y-2">
                        <Label htmlFor="data-cnh" className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Data que foi tirada a CNH *
                        </Label>
                        <Input
                          id="data-cnh"
                          type="date"
                          value={dataCNH}
                          onChange={(e) => setDataCNH(e.target.value)}
                          className="w-full"
                        />
                      </div>

                      {/* Categoria CNH */}
                      <div className="space-y-2">
                        <Label htmlFor="categoria-cnh" className="text-sm font-medium flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          Categoria da CNH *
                        </Label>
                        <Select value={categoriaCNH} onValueChange={setCategoriaCNH}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A - Motocicleta</SelectItem>
                            <SelectItem value="B">B - Carro</SelectItem>
                            <SelectItem value="AB">AB - Moto e Carro</SelectItem>
                            <SelectItem value="C">C - Caminhão</SelectItem>
                            <SelectItem value="D">D - Ônibus</SelectItem>
                            <SelectItem value="E">E - Veículo Articulado</SelectItem>
                            <SelectItem value="ACC">ACC - Ciclomotor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Photos Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Fotos Obrigatórias
                      </h3>

                      {/* RG Frente */}
                      <div className="space-y-2">
                        <Label htmlFor="rg-frente" className="text-sm font-medium">
                          Foto do RG - Frente *
                        </Label>
                        <div 
                          className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => document.getElementById('rg-frente')?.click()}
                        >
                          {rgFrentePreview ? (
                            <img 
                              src={rgFrentePreview} 
                              alt="RG Frente Preview" 
                              className="max-h-40 mx-auto rounded-lg object-contain"
                            />
                          ) : (
                            <div className="py-4">
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Clique para selecionar a foto
                              </p>
                            </div>
                          )}
                          <input
                            id="rg-frente"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, setRgFrentePreview, setRgFrenteFile)}
                          />
                        </div>
                      </div>

                      {/* RG Verso */}
                      <div className="space-y-2">
                        <Label htmlFor="rg-verso" className="text-sm font-medium">
                          Foto do RG - Verso *
                        </Label>
                        <div 
                          className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => document.getElementById('rg-verso')?.click()}
                        >
                          {rgVersoPreview ? (
                            <img 
                              src={rgVersoPreview} 
                              alt="RG Verso Preview" 
                              className="max-h-40 mx-auto rounded-lg object-contain"
                            />
                          ) : (
                            <div className="py-4">
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Clique para selecionar a foto
                              </p>
                            </div>
                          )}
                          <input
                            id="rg-verso"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, setRgVersoPreview, setRgVersoFile)}
                          />
                        </div>
                      </div>

                      {/* Selfie Photo */}
                      <div className="space-y-2">
                        <Label htmlFor="selfie" className="text-sm font-medium">
                          Foto Selfie * <span className="text-xs text-muted-foreground">(Peça para alguém tirar a foto)</span>
                        </Label>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-2">
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            <strong>⚠️ Importante:</strong> A foto deve ser tirada por outra pessoa, como se fosse foto de RG. 
                            Fique de frente, com o rosto centralizado, fundo neutro e boa iluminação.
                          </p>
                        </div>
                        
                        {/* Example selfie reference */}
                        <div className="bg-muted/50 rounded-lg p-4 mb-2">
                          <p className="text-xs text-muted-foreground mb-3 font-medium">📷 Exemplo de como deve ser a foto:</p>
                          <div className="flex items-center justify-center">
                            <img 
                              src={selfieExample} 
                              alt="Exemplo de foto para CNH" 
                              className="w-28 h-36 object-cover rounded-lg border-2 border-border shadow-sm"
                            />
                          </div>
                          <p className="text-[10px] text-center text-muted-foreground mt-3">
                            Rosto centralizado • Fundo neutro • Sem óculos • Expressão neutra
                          </p>
                        </div>

                        <div 
                          className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => document.getElementById('selfie')?.click()}
                        >
                          {selfiePreview ? (
                            <img 
                              src={selfiePreview} 
                              alt="Selfie Preview" 
                              className="max-h-40 mx-auto rounded-lg object-contain"
                            />
                          ) : (
                            <div className="py-4">
                              <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Clique para selecionar a foto selfie
                              </p>
                            </div>
                          )}
                          <input
                            id="selfie"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, setSelfiePreview, setSelfieFile)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Current Balance */}
                    {user && (
                      <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Seu saldo atual:</span>
                        <span className={`font-bold ${hasEnoughBalance ? 'text-green-500' : 'text-destructive'}`}>
                          R$ {balance.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      onClick={handlePedirCNH}
                      disabled={!canSubmit || !hasEnoughBalance || isProcessing}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-5 w-5 mr-2" />
                          Pedir CNH - R$ {CNH_PRICE.toFixed(2)}
                        </>
                      )}
                    </Button>

                    {!user && (
                      <p className="text-xs text-muted-foreground text-center">
                        Você precisa estar logado para solicitar uma CNH.{' '}
                        <button 
                          onClick={() => navigate('/auth')} 
                          className="text-primary underline"
                        >
                          Fazer login
                        </button>
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground text-center">
                      * Ao clicar em "Pedir CNH", o valor será descontado do seu saldo e você será redirecionado para o WhatsApp com todas as informações.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-sm">
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage.media_url}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[85vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-medium">{selectedImage.title}</p>
                {selectedImage.description && (
                  <p className="text-white/70 text-sm mt-1">{selectedImage.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CNH;