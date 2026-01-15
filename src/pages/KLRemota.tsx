import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowRight, Play, ChevronDown, Lock, Download, Check, Loader2, ShoppingCart, FileText, Video, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useModuleMedia, ModuleMedia } from '@/hooks/useModuleMedia';
import { useModuleDescription } from '@/hooks/useModuleDescriptions';
import { useKLRemotaConfig, useKLRemotaFiles, useHasKLRemotaPurchase, usePurchaseKLRemota } from '@/hooks/useKLRemota';
import { useBalance } from '@/hooks/useBalance';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const formatDescription = (text: string) => {
  return text.split('\n').map((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return <br key={index} />;
    
    const hasEmoji = /^[\u{1F300}-\u{1F9FF}]/u.test(trimmedLine);
    const hasBullet = trimmedLine.startsWith('-') || trimmedLine.startsWith('•');
    
    if (hasEmoji) {
      return (
        <div key={index} className="flex items-start gap-2 py-1">
          <span className="text-lg">{trimmedLine.slice(0, 2)}</span>
          <span className="flex-1">{trimmedLine.slice(2).trim()}</span>
        </div>
      );
    }
    
    if (hasBullet) {
      return (
        <div key={index} className="flex items-start gap-2 py-1 pl-4">
          <span className="text-primary">•</span>
          <span className="flex-1">{trimmedLine.slice(1).trim()}</span>
        </div>
      );
    }
    
    return <p key={index} className="py-1">{trimmedLine}</p>;
  });
};

const MediaSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="aspect-video w-full" />
        <CardContent className="p-2">
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const KLRemota = () => {
  const { data: media = [], isLoading: mediaLoading } = useModuleMedia('kl-remota');
  const { data: moduleDesc, isLoading: descLoading } = useModuleDescription('kl-remota');
  const { data: config, isLoading: configLoading } = useKLRemotaConfig();
  const { data: klFiles = [], isLoading: filesLoading } = useKLRemotaFiles();
  const { data: hasPurchased, isLoading: purchaseLoading } = useHasKLRemotaPurchase();
  const { data: userBalance = 0 } = useBalance();
  const purchaseKL = usePurchaseKLRemota();
  const queryClient = useQueryClient();
  const [selectedMedia, setSelectedMedia] = useState<ModuleMedia | null>(null);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [showFloatingArrow, setShowFloatingArrow] = useState(true);

  // Setup realtime subscription for live updates
  useEffect(() => {
    const mediaChannel = supabase
      .channel('kl-remota-media')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'module_media',
          filter: 'module_name=eq.kl-remota'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['module_media', 'kl-remota'] });
        }
      )
      .subscribe();

    const descChannel = supabase
      .channel('kl-remota-description')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'module_descriptions',
          filter: 'module_name=eq.kl-remota'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['module_description', 'kl-remota'] });
        }
      )
      .subscribe();

    const purchaseChannel = supabase
      .channel('kl-remota-purchases')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kl_remota_purchases'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['kl_remota_user_purchase'] });
          queryClient.invalidateQueries({ queryKey: ['kl_remota_files'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(mediaChannel);
      supabase.removeChannel(descChannel);
      supabase.removeChannel(purchaseChannel);
    };
  }, [queryClient]);

  // Handle scroll for floating arrow
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Hide arrow when near bottom (within 200px)
      if (scrollPosition + windowHeight >= documentHeight - 200) {
        setShowFloatingArrow(false);
      } else {
        setShowFloatingArrow(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePurchase = async () => {
    if (!config) return;
    
    if (userBalance < config.price) {
      toast.error('Saldo insuficiente! Adicione saldo para continuar.');
      setIsPurchaseDialogOpen(false);
      return;
    }

    try {
      await purchaseKL.mutateAsync({ price: config.price });
      setIsPurchaseDialogOpen(false);
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'bypass': return <Download className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const isLoading = configLoading || purchaseLoading;
  const price = config?.price || 0;
  const canPurchase = price > 0 && config?.is_active;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Header - more compact */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-3"
              >
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-foreground/10 flex items-center justify-center">
                    <GraduationCap className="h-7 w-7" />
                  </div>
                </div>
                <h1 className="font-grotesk text-3xl md:text-4xl font-bold tracking-tight">
                  {moduleDesc?.title || 'Curso KL Remota'}
                </h1>
                {moduleDesc?.subtitle && (
                  <p className="text-base text-muted-foreground max-w-xl mx-auto">
                    {moduleDesc.subtitle}
                  </p>
                )}

                {/* Price and Purchase Section */}
                {isLoading ? (
                  <Skeleton className="h-20 w-64 mx-auto" />
                ) : hasPurchased ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/30"
                  >
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span className="font-semibold text-emerald-500">Acesso Liberado!</span>
                  </motion.div>
                ) : canPurchase ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30">
                      <span className="text-sm text-muted-foreground">Preço:</span>
                      <span className="text-2xl font-bold text-primary">R$ {price.toFixed(2)}</span>
                    </div>
                    <div>
                      <Button 
                        size="lg" 
                        onClick={() => setIsPurchaseDialogOpen(true)}
                        className="font-semibold px-8 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Comprar Agora
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Seu saldo: R$ {userBalance.toFixed(2)}
                    </p>
                  </motion.div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">Módulo indisponível no momento</span>
                  </div>
                )}

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

              {/* Videos Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="space-y-4"
              >
                <h2 className="font-grotesk text-xl font-bold text-center flex items-center justify-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Vídeos do Curso
                </h2>
                {mediaLoading ? (
                  <MediaSkeleton />
                ) : media.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {media.map((item) => (
                      <Card 
                        key={item.id} 
                        className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:scale-[1.02]"
                        onClick={() => setSelectedMedia(item)}
                      >
                        <div className="relative aspect-video bg-muted">
                          {item.media_type === 'video' ? (
                            <>
                              <video
                                src={item.media_url}
                                className="w-full h-full object-cover"
                                preload="metadata"
                                muted
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                  <Play className="h-5 w-5 text-black ml-0.5" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <img
                              src={item.media_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              loading="eager"
                            />
                          )}
                        </div>
                        <CardContent className="p-2">
                          <p className="font-medium text-xs truncate">{item.title}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    Nenhuma mídia disponível ainda.
                  </p>
                )}
              </motion.div>

              {/* Dynamic Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {descLoading ? (
                  <Card className="border-primary/20">
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                  </Card>
                ) : moduleDesc?.description ? (
                  <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
                    <CardContent className="p-4 space-y-2 text-left text-sm">
                      {formatDescription(moduleDesc.description)}
                    </CardContent>
                  </Card>
                ) : null}
              </motion.div>

              {/* Files Section - Only shown after purchase */}
              {hasPurchased && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="font-grotesk text-xl font-bold text-center flex items-center justify-center gap-2">
                    <Download className="h-5 w-5 text-emerald-500" />
                    Arquivos Liberados
                  </h2>
                  
                  {filesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : klFiles.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {klFiles.map((file) => (
                        <Card 
                          key={file.id} 
                          className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 hover:border-emerald-500/40 transition-all"
                        >
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500">
                                {getFileIcon(file.file_type)}
                              </div>
                              <div>
                                <p className="font-medium">{file.title}</p>
                                {file.description && (
                                  <p className="text-xs text-muted-foreground">{file.description}</p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(file.file_url, '_blank')}
                              className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Baixar
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-emerald-500/20">
                      <CardContent className="p-6 text-center">
                        <Check className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <p className="font-medium text-emerald-500">Compra confirmada!</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Os arquivos serão disponibilizados em breve pelo administrador.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Locked Files Preview - Show when not purchased */}
              {!hasPurchased && canPurchase && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="font-grotesk text-xl font-bold text-center flex items-center justify-center gap-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    Conteúdo Exclusivo
                  </h2>
                  <Card className="border-dashed border-2 border-muted-foreground/30">
                    <CardContent className="p-8 text-center">
                      <Lock className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Arquivos Bloqueados</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Após a compra, você terá acesso a:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                        <li className="flex items-center justify-center gap-2">
                          <Video className="w-4 h-4" />
                          Vídeo de instalação completo
                        </li>
                        <li className="flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" />
                          Arquivos do Bypass
                        </li>
                        <li className="flex items-center justify-center gap-2">
                          <FileText className="w-4 h-4" />
                          Todos os arquivos da KL Remota
                        </li>
                      </ul>
                      <Button 
                        onClick={() => setIsPurchaseDialogOpen(true)}
                        className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Desbloquear por R$ {price.toFixed(2)}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-center"
              >
                <a href="https://wa.me/5548996440121" target="_blank" rel="noopener noreferrer">
                  <Button size="default" className="font-medium bg-green-600 hover:bg-green-700 text-white">
                    Dúvidas? Chamar no WhatsApp
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground mt-3">
                  Entre em contato para mais informações!
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Floating Mobile Scroll Arrow */}
      <AnimatePresence>
        {showFloatingArrow && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="md:hidden fixed bottom-24 right-4 z-40"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              onClick={() => window.scrollBy({ top: window.innerHeight * 0.5, behavior: 'smooth' })}
              className="p-3 rounded-full bg-primary/90 text-primary-foreground shadow-lg cursor-pointer"
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Popup */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-2xl w-[90vw] max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>{selectedMedia?.title}</DialogTitle>
            {selectedMedia?.description && (
              <p className="text-sm text-muted-foreground">{selectedMedia.description}</p>
            )}
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedMedia?.media_type === 'video' ? (
              <video
                src={selectedMedia.media_url}
                className="w-full max-h-[60vh] rounded-lg bg-black"
                controls
                autoPlay
                controlsList="nodownload"
              />
            ) : (
              <img
                src={selectedMedia?.media_url}
                alt={selectedMedia?.title}
                className="w-full rounded-lg object-contain max-h-[60vh]"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Confirmar Compra
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Produto:</span>
                <span className="font-medium">KL Remota Completo</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Preço:</span>
                <span className="font-bold text-lg text-primary">R$ {price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm">Seu saldo:</span>
                <span className={`font-medium ${userBalance >= price ? 'text-emerald-500' : 'text-destructive'}`}>
                  R$ {userBalance.toFixed(2)}
                </span>
              </div>
            </div>

            {userBalance < price && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Saldo insuficiente! Você precisa de mais R$ {(price - userBalance).toFixed(2)}.
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Após a confirmação, o valor será debitado do seu saldo e os arquivos serão liberados imediatamente.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsPurchaseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePurchase}
              disabled={purchaseKL.isPending || userBalance < price}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
            >
              {purchaseKL.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Confirmar Compra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KLRemota;
