import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, User, Search, Loader2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAllUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InitiateChatManagerProps {
  onChatCreated?: (chatId: string) => void;
}

const InitiateChatManager = ({ onChatCreated }: InitiateChatManagerProps) => {
  const { user: adminUser } = useAuth();
  const { data: users = [], isLoading } = useAllUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
  const [message, setMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (user: typeof users[0]) => {
    setSelectedUser(user);
    setMessage(`Olá ${user.name.split(' ')[0]}! 👋\n\nO MUCA está entrando em contato com você.`);
    setIsDialogOpen(true);
  };

  const handleInitiateChat = async () => {
    if (!selectedUser || !message.trim() || !adminUser) return;

    setIsSending(true);
    try {
      // Check if user already has an open chat
      const { data: existingChat } = await supabase
        .from('support_chats')
        .select('id')
        .eq('user_id', selectedUser.id)
        .eq('status', 'open')
        .single();

      let chatId: string;

      if (existingChat) {
        chatId = existingChat.id;
      } else {
        // Create new chat for the user
        const { data: newChat, error: chatError } = await supabase
          .from('support_chats')
          .insert({
            user_id: selectedUser.id,
            user_name: selectedUser.name,
            user_email: selectedUser.email,
            status: 'open',
          })
          .select('id')
          .single();

        if (chatError) throw chatError;
        chatId = newChat.id;
      }

      // Send the admin message - this will trigger notification for the user
      const { error: messageError } = await supabase
        .from('support_messages')
        .insert({
          chat_id: chatId,
          sender_id: adminUser.id,
          sender_type: 'admin',
          message: message.trim(),
        });

      if (messageError) throw messageError;

      toast.success('✅ Mensagem enviada!', {
        description: `${selectedUser.name} será notificado imediatamente.`,
      });

      setIsDialogOpen(false);
      setSelectedUser(null);
      setMessage('');
      
      if (onChatCreated) {
        onChatCreated(chatId);
      }
    } catch (error) {
      console.error('Error initiating chat:', error);
      toast.error('Erro ao iniciar conversa');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-portal-green" />
            Iniciar Conversa com Usuário
            <Badge variant="outline" className="ml-2">
              <Bell className="h-3 w-3 mr-1" />
              Notifica o usuário
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuário por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users List */}
          <ScrollArea className="h-[300px] border rounded-lg p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-2">
                  {filteredUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <button
                        onClick={() => handleSelectUser(user)}
                        className="w-full p-3 rounded-lg bg-muted hover:bg-muted/80 border border-border hover:border-portal-green/50 transition-all flex items-center justify-between gap-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-portal-green font-mono">
                            R$ {user.balance.toFixed(2)}
                          </span>
                          <Button size="sm" variant="ghost" className="shrink-0">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-portal-green" />
              Iniciar Conversa
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 text-sm">
                <Bell className="h-4 w-4 inline-block mr-2" />
                O usuário receberá uma notificação com som e alerta na tela!
              </div>

              <Textarea
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleInitiateChat} 
              disabled={!message.trim() || isSending}
              className="gap-2"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar e Notificar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InitiateChatManager;
