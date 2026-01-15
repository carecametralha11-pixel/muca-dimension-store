import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Volume2, 
  Ban, 
  UserCheck, 
  Loader2, 
  Search, 
  MessageSquare,
  Trash2,
  Play
} from 'lucide-react';
import { useUsers, useBanUser, useUnbanUser } from '@/hooks/useUsers';
import { useBanMessage, useUpdateBanMessage, useCreateBanMessage, playBanMessage } from '@/hooks/useBanMessage';
import { toast } from 'sonner';

const BanManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [banMessageText, setBanMessageText] = useState('');
  const [userToBan, setUserToBan] = useState<{ id: string; name: string; email: string } | null>(null);
  const [showBanDialog, setShowBanDialog] = useState(false);

  const { data: users, isLoading: loadingUsers } = useUsers();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const { data: banMessage, isLoading: loadingBanMessage } = useBanMessage();
  const updateBanMessage = useUpdateBanMessage();
  const createBanMessage = useCreateBanMessage();

  useEffect(() => {
    if (banMessage?.message) {
      setBanMessageText(banMessage.message);
    }
  }, [banMessage]);

  // Load voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSaveBanMessage = async () => {
    try {
      if (banMessage?.id) {
        await updateBanMessage.mutateAsync({ id: banMessage.id, message: banMessageText });
      } else {
        await createBanMessage.mutateAsync(banMessageText);
      }
      toast.success('Mensagem de banimento salva!');
    } catch (error) {
      console.error('Error saving ban message:', error);
      toast.error('Erro ao salvar mensagem.');
    }
  };

  const handleTestAudio = () => {
    playBanMessage(banMessageText || 'Você foi banido do sistema.');
  };

  const handleBanUser = async () => {
    if (!userToBan) return;
    
    try {
      await banUser.mutateAsync(userToBan.id);
      toast.success(`${userToBan.name} foi banido com sucesso!`);
      setShowBanDialog(false);
      setUserToBan(null);
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Erro ao banir usuário.');
    }
  };

  const handleUnbanUser = async (userId: string, userName: string) => {
    try {
      await unbanUser.mutateAsync(userId);
      toast.success(`${userName} foi desbanido com sucesso!`);
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error('Erro ao desbanir usuário.');
    }
  };

  const openBanDialog = (user: { id: string; name: string; email: string }) => {
    setUserToBan(user);
    setShowBanDialog(true);
  };

  const bannedUsers = filteredUsers.filter(u => u.is_banned);
  const activeUsers = filteredUsers.filter(u => !u.is_banned);

  return (
    <div className="space-y-6">
      {/* Ban Message Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Mensagem de Banimento (TTS)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ban-message">Mensagem que será lida em voz alta quando o usuário for banido</Label>
            <Textarea
              id="ban-message"
              value={banMessageText}
              onChange={(e) => setBanMessageText(e.target.value)}
              placeholder="Digite a mensagem de banimento..."
              className="mt-2"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleTestAudio}
              variant="outline"
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Testar Áudio
            </Button>
            <Button 
              onClick={handleSaveBanMessage}
              disabled={updateBanMessage.isPending || createBanMessage.isPending}
            >
              {(updateBanMessage.isPending || createBanMessage.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Salvar Mensagem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Gerenciar Usuários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuário por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {/* Banned Users */}
                {bannedUsers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-1">
                      <Ban className="h-4 w-4" />
                      Usuários Banidos ({bannedUsers.length})
                    </h4>
                    <div className="space-y-2">
                      {bannedUsers.map(user => (
                        <div 
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                        >
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">Banido</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnbanUser(user.id, user.name)}
                              disabled={unbanUser.isPending}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Desbanir
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Users */}
                {activeUsers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                      Usuários Ativos ({activeUsers.length})
                    </h4>
                    <div className="space-y-2">
                      {activeUsers.map(user => (
                        <div 
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                        >
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openBanDialog(user)}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Banir
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              Confirmar Banimento
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja banir <strong>{userToBan?.name}</strong> ({userToBan?.email})?
              <br /><br />
              O usuário será desconectado imediatamente e ouvirá a mensagem de banimento configurada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {banUser.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Ban className="h-4 w-4 mr-2" />
              )}
              Banir Usuário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BanManager;
