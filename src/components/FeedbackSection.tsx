import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, Send, Image, X, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFeedbacks, useCanPostFeedback, useCreateFeedback, Feedback } from '@/hooks/useFeedbacks';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const FeedbackSection = () => {
  const { user, profile } = useAuth();
  const { data: feedbacks = [], isLoading } = useFeedbacks();
  const { data: canPost = false } = useCanPostFeedback(user?.id);
  const createFeedback = useCreateFeedback();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem deve ter no máximo 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user || !profile || !message.trim()) {
      toast.error('Escreva uma mensagem de feedback');
      return;
    }

    try {
      await createFeedback.mutateAsync({
        userId: user.id,
        userName: profile.name,
        message: message.trim(),
        imageFile: imageFile || undefined,
      });
      setMessage('');
      setImageFile(null);
      setImagePreview(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  if (feedbacks.length === 0 && !user) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/30" />
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-white/50 uppercase tracking-[0.2em]">
                Feedbacks dos Clientes
              </span>
              <Star className="w-4 h-4 text-yellow-500" />
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/30" />
            </div>

            {user && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canPost}
                    className="border-white/20 hover:bg-white/10"
                    title={!canPost ? 'Você precisa ter comprado algo ou depositado pelo menos R$20' : ''}
                  >
                    <MessageSquarePlus className="w-4 h-4 mr-2" />
                    Deixar Feedback
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Enviar Feedback</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Textarea
                      placeholder="Conte sua experiência com nossos serviços..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      maxLength={500}
                      className="resize-none"
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {message.length}/500
                    </div>

                    {/* Image preview */}
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <label
                          htmlFor="feedback-image"
                          className="flex items-center justify-center gap-2 p-4 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors"
                        >
                          <Image className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Adicionar imagem (opcional)
                          </span>
                        </label>
                        <input
                          id="feedback-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    )}

                    <Button
                      onClick={handleSubmit}
                      disabled={!message.trim() || createFeedback.isPending}
                      className="w-full"
                    >
                      {createFeedback.isPending ? (
                        'Enviando...'
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Info for non-eligible users */}
          {user && !canPost && (
            <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-sm text-center">
              Para deixar um feedback, você precisa ter comprado algo ou depositado pelo menos R$20.
            </div>
          )}

          {/* Feedbacks Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Carregando feedbacks...
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum feedback ainda. Seja o primeiro!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence>
                {feedbacks.map((feedback, index) => (
                  <FeedbackCard key={feedback.id} feedback={feedback} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const FeedbackCard = ({ feedback, index }: { feedback: Feedback; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-white/[0.02] border-white/10 hover:border-white/20 transition-colors overflow-hidden">
        <CardContent className="p-4">
          {/* User info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <p className="font-medium text-sm text-white">{feedback.user_name}</p>
              <p className="text-xs text-white/40">
                {format(new Date(feedback.created_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-white/80 mb-3 leading-relaxed">{feedback.message}</p>

          {/* Image */}
          {feedback.image_url && (
            <div className="mt-3">
              <img
                src={feedback.image_url}
                alt="Feedback"
                className="w-full h-40 object-cover rounded-lg"
                loading="lazy"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeedbackSection;
