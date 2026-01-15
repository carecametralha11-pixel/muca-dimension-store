import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Image, Mic, MicOff, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useIsEligibleForChat, 
  useUserChat, 
  useCreateChat, 
  useChatMessages, 
  useSendMessage,
  useMarkAsRead,
  useSendMessageWithAttachment
} from '@/hooks/useSupportChat';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const SupportChatWidget: React.FC = () => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: isEligible, isLoading: checkingEligibility } = useIsEligibleForChat(user?.id);
  const { data: existingChat, isLoading: loadingChat } = useUserChat(user?.id);
  const { data: messages, isLoading: loadingMessages } = useChatMessages(existingChat?.id);
  const createChat = useCreateChat();
  const sendMessage = useSendMessage();
  const sendMessageWithAttachment = useSendMessageWithAttachment();
  const markAsRead = useMarkAsRead();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && existingChat?.id) {
      markAsRead.mutate({ chatId: existingChat.id, senderType: 'user' });
    }
  }, [isOpen, existingChat?.id]);

  const handleStartChat = async () => {
    if (!user || !profile) return;
    
    await createChat.mutateAsync({
      userId: user.id,
      userName: profile.name,
      userEmail: profile.email,
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !existingChat || !user) return;

    await sendMessage.mutateAsync({
      chatId: existingChat.id,
      senderId: user.id,
      senderType: 'user',
      message: message.trim(),
    });
    setMessage('');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !existingChat || !user) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use imagens ou áudio.');
      return;
    }

    try {
      await sendMessageWithAttachment.mutateAsync({
        chatId: existingChat.id,
        senderId: user.id,
        senderType: 'user',
        file,
      });
      toast.success('Arquivo enviado!');
    } catch (error) {
      console.error('Error sending file:', error);
      toast.error('Erro ao enviar arquivo.');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
        
        if (existingChat && user) {
          try {
            await sendMessageWithAttachment.mutateAsync({
              chatId: existingChat.id,
              senderId: user.id,
              senderType: 'user',
              file: audioFile,
            });
            toast.success('Áudio enviado!');
          } catch (error) {
            console.error('Error sending audio:', error);
            toast.error('Erro ao enviar áudio.');
          }
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Não foi possível acessar o microfone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMessage = (msg: any) => {
    const isAttachment = msg.attachmentUrl && msg.attachmentType;
    
    return (
      <div
        key={msg.id}
        className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[80%] rounded-lg px-3 py-2 ${
            msg.senderType === 'user'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          {isAttachment ? (
            msg.attachmentType?.startsWith('image/') ? (
              <img 
                src={msg.attachmentUrl} 
                alt="Imagem" 
                className="max-w-full rounded-md max-h-48 object-cover cursor-pointer"
                onClick={() => window.open(msg.attachmentUrl, '_blank')}
              />
            ) : msg.attachmentType?.startsWith('audio/') ? (
              <audio controls className="max-w-full">
                <source src={msg.attachmentUrl} type={msg.attachmentType} />
                Seu navegador não suporta áudio.
              </audio>
            ) : (
              <a 
                href={msg.attachmentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline"
              >
                Ver anexo
              </a>
            )
          ) : (
            <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
          )}
          <p className={`text-xs mt-1 ${
            msg.senderType === 'user' 
              ? 'text-primary-foreground/70' 
              : 'text-muted-foreground'
          }`}>
            {format(msg.createdAt, 'HH:mm', { locale: ptBR })}
          </p>
        </div>
      </div>
    );
  };

  // Don't show widget if user is not logged in or not eligible
  if (!user || checkingEligibility) return null;
  if (!isEligible) return null;

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,audio/*"
        onChange={handleFileSelect}
      />

      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 z-50 w-[350px] sm:w-[400px] h-[500px] bg-card border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold">Suporte</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {loadingChat ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !existingChat ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Iniciar Conversa</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Clique no botão abaixo para iniciar uma conversa com nosso suporte.
                  </p>
                  <Button 
                    onClick={handleStartChat}
                    disabled={createChat.isPending}
                  >
                    {createChat.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Iniciar Chat
                  </Button>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : messages && messages.length > 0 ? (
                      <div className="space-y-3">
                        {messages.map(renderMessage)}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-muted-foreground text-sm">
                          Envie uma mensagem para iniciar a conversa.
                        </p>
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-4 border-t border-border">
                    {isRecording ? (
                      <div className="flex items-center justify-between bg-destructive/10 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                          <span className="text-sm font-medium">Gravando... {formatTime(recordingTime)}</span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={stopRecording}
                        >
                          <MicOff className="h-4 w-4 mr-1" />
                          Parar
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 shrink-0"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={sendMessageWithAttachment.isPending}
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 shrink-0"
                            onClick={startRecording}
                            disabled={sendMessageWithAttachment.isPending}
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          className="flex-1"
                          disabled={sendMessage.isPending || sendMessageWithAttachment.isPending}
                        />
                        <Button 
                          type="submit" 
                          size="icon"
                          disabled={!message.trim() || sendMessage.isPending || sendMessageWithAttachment.isPending}
                        >
                          {sendMessage.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </form>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportChatWidget;
