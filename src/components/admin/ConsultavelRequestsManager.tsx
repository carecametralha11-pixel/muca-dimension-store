import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  MessageCircle, 
  Check, 
  X, 
  Loader2, 
  Clock, 
  CreditCard,
  User,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  useAllConsultavelRequests, 
  useUpdateConsultavelRequest,
  ConsultavelRequest 
} from '@/hooks/useConsultavelPricing';
import { useSendMessage, useAllChats } from '@/hooks/useSupportChat';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const ConsultavelRequestsManager: React.FC = () => {
  const { user } = useAuth();
  const { data: requests = [], isLoading } = useAllConsultavelRequests();
  const { data: allChats = [] } = useAllChats();
  const updateRequest = useUpdateConsultavelRequest();
  const sendMessage = useSendMessage();
  const queryClient = useQueryClient();
  
  const [requestToReject, setRequestToReject] = useState<ConsultavelRequest | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('consultavel-requests-manager')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultavel_requests',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['consultavel-requests-all'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleContactUser = async (request: ConsultavelRequest) => {
    if (!user || !request.chat_id) return;
    
    setProcessingId(request.id);
    
    try {
      // Send automatic message
      await sendMessage.mutateAsync({
        chatId: request.chat_id,
        senderId: user.id,
        senderType: 'admin',
        message: `Olá ${request.user_name.split(' ')[0]}! Vi sua solicitação de consultável com limite de ${formatCurrency(request.limit_amount)}. Estou aqui para te ajudar! 🚀`,
      });

      // Update request status
      await updateRequest.mutateAsync({
        id: request.id,
        status: 'in_progress',
      });

      toast.success('Mensagem enviada!', {
        description: 'O cliente foi notificado e o popup fechará automaticamente.',
      });
    } catch (error) {
      console.error('Error contacting user:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteRequest = async (request: ConsultavelRequest) => {
    setProcessingId(request.id);
    
    try {
      await updateRequest.mutateAsync({
        id: request.id,
        status: 'completed',
      });
      
      toast.success('Solicitação marcada como concluída!');
    } catch (error) {
      console.error('Error completing request:', error);
      toast.error('Erro ao concluir solicitação');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async () => {
    if (!requestToReject || !user) return;
    
    setProcessingId(requestToReject.id);
    
    try {
      // Send rejection message if chat exists
      if (requestToReject.chat_id) {
        await sendMessage.mutateAsync({
          chatId: requestToReject.chat_id,
          senderId: user.id,
          senderType: 'admin',
          message: `Olá ${requestToReject.user_name.split(' ')[0]}, infelizmente não conseguimos atender sua solicitação de consultável com limite de ${formatCurrency(requestToReject.limit_amount)} no momento. Entre em contato novamente em breve!`,
        });
      }

      await updateRequest.mutateAsync({
        id: requestToReject.id,
        status: 'rejected',
      });

      toast.success('Solicitação recusada');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Erro ao recusar solicitação');
    } finally {
      setProcessingId(null);
      setRequestToReject(null);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const inProgressRequests = requests.filter(r => r.status === 'in_progress');
  const otherRequests = requests.filter(r => r.status === 'completed' || r.status === 'rejected');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive" className="animate-pulse">Aguardando</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500">Em Andamento</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Concluído</Badge>;
      case 'rejected':
        return <Badge variant="outline">Recusado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderRequest = (request: ConsultavelRequest) => (
    <motion.div
      key={request.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-lg border ${
        request.status === 'pending' 
          ? 'border-destructive bg-destructive/5' 
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{request.user_name}</span>
            {getStatusBadge(request.status)}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Limite: <strong>{formatCurrency(request.limit_amount)}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span>Valor: <strong>{formatCurrency(request.price)}</strong></span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: ptBR })}</span>
            <span>•</span>
            <span>{request.user_email}</span>
          </div>
        </div>
        
        <div className="flex gap-2 shrink-0">
          {request.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => handleContactUser(request)}
                disabled={processingId === request.id}
              >
                {processingId === request.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Atender
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRequestToReject(request)}
                disabled={processingId === request.id}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {request.status === 'in_progress' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleContactUser(request)}
                disabled={processingId === request.id}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Mensagem
              </Button>
              <Button
                size="sm"
                onClick={() => handleCompleteRequest(request)}
                disabled={processingId === request.id}
                className="bg-green-500 hover:bg-green-600"
              >
                {processingId === request.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Concluir
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Solicitações de Consultável
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="animate-pulse ml-2">
                {pendingRequests.length} pendente{pendingRequests.length > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma solicitação ainda</p>
              <p className="text-sm">As solicitações de consultável aparecerão aqui</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {/* Pending - Most urgent */}
                {pendingRequests.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                      Aguardando Atendimento ({pendingRequests.length})
                    </h4>
                    <AnimatePresence>
                      {pendingRequests.map(renderRequest)}
                    </AnimatePresence>
                  </div>
                )}
                
                {/* In Progress */}
                {inProgressRequests.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-yellow-500 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                      Em Andamento ({inProgressRequests.length})
                    </h4>
                    <AnimatePresence>
                      {inProgressRequests.map(renderRequest)}
                    </AnimatePresence>
                  </div>
                )}
                
                {/* Completed/Rejected */}
                {otherRequests.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Histórico ({otherRequests.length})
                    </h4>
                    <AnimatePresence>
                      {otherRequests.slice(0, 10).map(renderRequest)}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={!!requestToReject} onOpenChange={() => setRequestToReject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recusar Solicitação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja recusar a solicitação de <strong>{requestToReject?.user_name}</strong> 
              para limite de {requestToReject && formatCurrency(requestToReject.limit_amount)}?
              Uma mensagem será enviada ao cliente informando.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updateRequest.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Recusar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConsultavelRequestsManager;
