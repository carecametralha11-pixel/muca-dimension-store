import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, CheckCircle, Shield, Package, Play, ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useModuleMedia, ModuleMedia } from '@/hooks/useModuleMedia';
import { useModuleDescription } from '@/hooks/useModuleDescriptions';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import NFOrderForm from '@/components/NFOrderForm';

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

const NF = () => {
  const { data: media = [], isLoading: mediaLoading } = useModuleMedia('nf');
  const { data: moduleDesc, isLoading: descLoading } = useModuleDescription('nf');
  const queryClient = useQueryClient();
  const [selectedMedia, setSelectedMedia] = useState<ModuleMedia | null>(null);

  useEffect(() => {
    const mediaChannel = supabase
      .channel('nf-media')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'module_media',
          filter: 'module_name=eq.nf'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['module_media', 'nf'] });
        }
      )
      .subscribe();

    const descChannel = supabase
      .channel('nf-description')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'module_descriptions',
          filter: 'module_name=eq.nf'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['module_description', 'nf'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(mediaChannel);
      supabase.removeChannel(descChannel);
    };
  }, [queryClient]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-3"
              >
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-foreground/10 flex items-center justify-center">
                    <Banknote className="h-7 w-7" />
                  </div>
                </div>
                <h1 className="font-grotesk text-3xl md:text-4xl font-bold tracking-tight">
                  {moduleDesc?.title || 'NF'}
                </h1>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                  {moduleDesc?.subtitle || 'Faça seu pedido de forma rápida e segura.'}
                </p>
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

              {/* Order Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <NFOrderForm />
              </motion.div>

              {/* Videos/Images Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="space-y-4"
              >
                <h2 className="font-grotesk text-xl font-bold text-center flex items-center justify-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Fotos e Vídeos
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

              {/* Info Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="grid md:grid-cols-3 gap-4"
              >
                <Card className="md:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-primary" />
                      O que oferecemos?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    <p>
                      Notas de alta qualidade, acabamento profissional e todos os detalhes necessários.
                    </p>
                  </CardContent>
                </Card>

                <Card className="md:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-primary" />
                      Envio Discreto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    <p>
                      Enviamos de forma discreta e segura. Embalagem sem identificação.
                    </p>
                  </CardContent>
                </Card>

                <Card className="md:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Características</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {[
                      'Alta qualidade',
                      'Textura realista',
                      'Envio rápido',
                      'Atendimento 24h'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Dynamic Description from Admin */}
              {moduleDesc?.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                >
                  <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
                    <CardContent className="p-4 space-y-2 text-left text-sm">
                      {formatDescription(moduleDesc.description)}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />

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
    </div>
  );
};

export default NF;
