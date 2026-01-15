import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, X, User, Clock, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useAllChats,
  useChatMessages,
  useSendMessage,
  useMarkAsRead,
  useCloseChat,
  type SupportChat
} from '@/hooks/useSupportChat';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const AdminChatPanel: React.FC = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chats, isLoading: loadingChats } = useAllChats();
  const { data: messages, isLoading: loadingMessages } = useChatMessages(selectedChat?.id);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const closeChat = useCloseChat();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when chat is selected
  useEffect(() => {
    if (selectedChat?.id) {
      markAsRead.mutate({ chatId: selectedChat.id, senderType: 'admin' });
    }
  }, [selectedChat?.id]);

  // Notify when new chat is created
  useEffect(() => {
    if (chats && chats.length > 0) {
      const openChats = chats.filter(c => c.status === 'open');
      if (openChats.length > 0 && !selectedChat) {
        // Show notification for new chats
        toast.info('Novo chat de suporte recebido!', {
          description: `${openChats[0].userName} iniciou uma conversa.`,
        });
      }
    }
  }, [chats?.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat || !user) return;

    await sendMessage.mutateAsync({
      chatId: selectedChat.id,
      senderId: user.id,
      senderType: 'admin',
      message: message.trim(),
    });
    setMessage('');
  };

  const handleCloseChat = async () => {
    if (!selectedChat) return;
    
    await closeChat.mutateAsync(selectedChat.id);
    toast.success('Chat encerrado com sucesso!');
    setSelectedChat(null);
  };

  const openChats = chats?.filter(c => c.status === 'open') || [];
  const closedChats = chats?.filter(c => c.status === 'closed') || [];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Central de Suporte
          {openChats.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {openChats.length} {openChats.length === 1 ? 'ativo' : 'ativos'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex gap-4 overflow-hidden p-4 pt-0">
        {/* Chat List */}
        <div className="w-1/3 border-r border-border pr-4 overflow-hidden flex flex-col">
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Conversas</h3>
          <ScrollArea className="flex-1">
            {loadingChats ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : chats && chats.length > 0 ? (
              <div className="space-y-2">
                {openChats.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Abertos</p>
                    {openChats.map((chat) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        isSelected={selectedChat?.id === chat.id}
                        onClick={() => setSelectedChat(chat)}
                      />
                    ))}
                  </div>
                )}
                {closedChats.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Encerrados</p>
                    {closedChats.map((chat) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        isSelected={selectedChat?.id === chat.id}
                        onClick={() => setSelectedChat(chat)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhuma conversa ainda
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedChat.userName}</p>
                    <p className="text-xs text-muted-foreground">{selectedChat.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedChat.status === 'open' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCloseChat}
                      disabled={closeChat.isPending}
                    >
                      {closeChat.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCheck className="h-4 w-4 mr-1" />
                          Encerrar
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedChat(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-3 pr-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            msg.senderType === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="text-sm break-words">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.senderType === 'admin' 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {format(msg.createdAt, 'HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-muted-foreground text-sm">
                      Nenhuma mensagem ainda
                    </p>
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              {selectedChat.status === 'open' && (
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-border mt-3">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Digite sua resposta..."
                      className="flex-1"
                      disabled={sendMessage.isPending}
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!message.trim() || sendMessage.isPending}
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Selecione uma conversa para visualizar
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Chat List Item Component
const ChatListItem: React.FC<{
  chat: SupportChat;
  isSelected: boolean;
  onClick: () => void;
}> = ({ chat, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-colors ${
        isSelected
          ? 'bg-primary/10 border border-primary/30'
          : 'bg-muted/50 hover:bg-muted border border-transparent'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm truncate">{chat.userName}</span>
        <Badge variant={chat.status === 'open' ? 'default' : 'secondary'} className="text-xs">
          {chat.status === 'open' ? 'Aberto' : 'Fechado'}
        </Badge>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>
          {chat.lastMessageAt 
            ? formatDistanceToNow(chat.lastMessageAt, { addSuffix: true, locale: ptBR })
            : formatDistanceToNow(chat.createdAt, { addSuffix: true, locale: ptBR })}
        </span>
      </div>
    </button>
  );
};

export default AdminChatPanel;
