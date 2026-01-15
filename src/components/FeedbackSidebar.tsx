import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, Send, Image, X, Star, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFeedbacks, useCanPostFeedback, useCreateFeedback, Feedback } from '@/hooks/useFeedbacks';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const FeedbackSidebar = () => {
  const { user, profile, isAdmin } = useAuth();
  const { data: feedbacks = [], isLoading } = useFeedbacks();
  const { data: canPost = false } = useCanPostFeedback(user?.id, isAdmin);
  const createFeedback = useCreateFeedback();
  
  const [isExpanded, setIsExpanded] = useState(true);
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

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: isExpanded ? 320 : 48 }}
        animate={{ width: isExpanded ? 320 : 48 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex fixed right-0 top-16 h-[calc(100vh-4rem)] bg-black/40 backdrop-blur-xl border-l border-white/10 flex-col z-40"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white/10 hover:bg-white/20 rounded-l-lg flex items-center justify-center border border-white/10 border-r-0 transition-colors"
        >
          {isExpanded ? (
            <ChevronRight className="w-4 h-4 text-white/60" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white/60" />
          )}
        </button>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-yellow-500" />
                <h2 className="font-semibold text-white text-sm tracking-wide">Feedbacks</h2>
                <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
                  {feedbacks.length}
                </span>
              </div>
              
              {user && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!canPost}
                      className="w-full border-white/20 hover:bg-white/10 text-xs"
                      title={!canPost ? 'Você precisa ter comprado algo ou depositado pelo menos R$20' : ''}
                    >
                      <MessageSquarePlus className="w-3 h-3 mr-2" />
                      Deixar Feedback
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-black/90 border-white/20">
                    <DialogHeader>
                      <DialogTitle className="text-white">Enviar Feedback</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Textarea
                        placeholder="Conte sua experiência com nossos serviços..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        maxLength={500}
                        className="resize-none bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      />
                      <div className="text-xs text-white/40 text-right">
                        {message.length}/500
                      </div>

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
                            htmlFor="feedback-image-sidebar"
                            className="flex items-center justify-center gap-2 p-4 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors"
                          >
                            <Image className="h-5 w-5 text-white/40" />
                            <span className="text-sm text-white/40">
                              Adicionar imagem (opcional)
                            </span>
                          </label>
                          <input
                            id="feedback-image-sidebar"
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
                        className="w-full bg-white text-black hover:bg-white/90"
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
              
              {user && !canPost && (
                <p className="mt-2 text-xs text-yellow-500/70 text-center">
                  Deposite R$20+ ou compre algo para comentar
                </p>
              )}
            </div>

            {/* Feedbacks List - Max 2 visible with scroll */}
            <div className="flex-1 overflow-hidden">
              <div className="p-3 space-y-3 h-full overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-white/40 text-sm">
                    Carregando...
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="text-center py-8 text-white/40 text-sm">
                    Nenhum feedback ainda.
                    <br />
                    Seja o primeiro!
                  </div>
                ) : (
                  <AnimatePresence>
                    {feedbacks.map((feedback, index) => (
                      <FeedbackItem key={feedback.id} feedback={feedback} index={index} />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Collapsed State */}
        {!isExpanded && (
          <div className="flex flex-col items-center py-4 gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-white/40 [writing-mode:vertical-lr] rotate-180">
              Feedbacks
            </span>
          </div>
        )}
      </motion.aside>

      {/* Mobile Bottom Sheet Style */}
      <MobileFeedbackSection 
        feedbacks={feedbacks}
        isLoading={isLoading}
        canPost={canPost}
        user={user}
        profile={profile}
      />
    </>
  );
};

const FeedbackItem = ({ feedback, index }: { feedback: Feedback; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: Math.min(index * 0.03, 0.1) }}
      className="p-3 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors flex-shrink-0"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30">
          <User className="w-3.5 h-3.5 text-yellow-500/80" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-white truncate">{feedback.user_name}</p>
          <p className="text-[10px] text-white/40">
            {format(new Date(feedback.created_at), "d 'de' MMM", { locale: ptBR })}
          </p>
        </div>
      </div>
      <p className="text-xs text-white/70 leading-relaxed line-clamp-4">{feedback.message}</p>
      {feedback.image_url && (
        <img
          src={feedback.image_url}
          alt="Feedback"
          className="mt-2 w-full h-24 object-cover rounded-md border border-white/10"
          loading="lazy"
        />
      )}
    </motion.div>
  );
};

// Mobile Feedback Section
const MobileFeedbackSection = ({ 
  feedbacks, 
  isLoading, 
  canPost, 
  user, 
  profile 
}: { 
  feedbacks: Feedback[];
  isLoading: boolean;
  canPost: boolean;
  user: any;
  profile: any;
}) => {
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

  return (
    <section className="lg:hidden py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-white/70">Feedbacks</span>
            <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
              {feedbacks.length}
            </span>
          </div>

          {user && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canPost}
                  className="border-white/20 hover:bg-white/10 text-xs h-8"
                  title={!canPost ? 'Você precisa ter comprado algo ou depositado pelo menos R$20' : ''}
                >
                  <MessageSquarePlus className="w-3 h-3 mr-1" />
                  Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-black/90 border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Enviar Feedback</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Textarea
                    placeholder="Conte sua experiência..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    maxLength={500}
                    className="resize-none bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                  <div className="text-xs text-white/40 text-right">
                    {message.length}/500
                  </div>

                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="feedback-image-mobile"
                      className="flex items-center justify-center gap-2 p-3 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors"
                    >
                      <Image className="h-4 w-4 text-white/40" />
                      <span className="text-xs text-white/40">Imagem (opcional)</span>
                      <input
                        id="feedback-image-mobile"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={!message.trim() || createFeedback.isPending}
                    className="w-full bg-white text-black hover:bg-white/90"
                  >
                    {createFeedback.isPending ? 'Enviando...' : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {user && !canPost && (
          <p className="mb-4 text-xs text-yellow-500/70 text-center bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
            Deposite R$20+ ou compre algo para comentar
          </p>
        )}

        {/* Horizontal Scroll Feedbacks */}
        {isLoading ? (
          <div className="text-center py-8 text-white/40 text-sm">
            Carregando...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-sm bg-white/[0.02] rounded-xl border border-white/10">
            Nenhum feedback ainda. Seja o primeiro!
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {feedbacks.slice(0, 10).map((feedback, index) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-[280px] snap-center p-4 rounded-xl bg-white/[0.03] border border-white/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white truncate">{feedback.user_name}</p>
                    <p className="text-[10px] text-white/30">
                      {format(new Date(feedback.created_at), "d 'de' MMM", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-white/70 leading-relaxed line-clamp-4">{feedback.message}</p>
                {feedback.image_url && (
                  <img
                    src={feedback.image_url}
                    alt="Feedback"
                    className="mt-3 w-full h-24 object-cover rounded-lg"
                    loading="lazy"
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeedbackSidebar;
