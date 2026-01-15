import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Car,
  Bike,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  CreditCard,
  User,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAllAccountRequests, useUpdateAccountRequest, useDeleteAccountRequest, AccountRequest } from '@/hooks/useAccountRequests';
import { supabase } from '@/integrations/supabase/client';

const AccountRequestsManager = () => {
  const { data: requests = [], isLoading, refetch } = useAllAccountRequests();
  const updateRequest = useUpdateAccountRequest();
  const deleteRequest = useDeleteAccountRequest();
  
  const [selectedRequest, setSelectedRequest] = useState<AccountRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [adminNotes, setAdminNotes] = useState('');

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('account-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'account_requests'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const filteredRequests = requests.filter(r => 
    statusFilter === 'all' || r.status === statusFilter
  );

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Pendente</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Processando</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openDetail = (request: AccountRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async (status: AccountRequest['status']) => {
    if (!selectedRequest) return;
    
    await updateRequest.mutateAsync({
      id: selectedRequest.id,
      status,
      admin_notes: adminNotes
    });
    
    setIsDetailOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Solicitações de Contas 99/Uber</h2>
          {pendingCount > 0 && (
            <p className="text-yellow-400 text-sm mt-1">
              <AlertCircle className="inline w-4 h-4 mr-1" />
              {pendingCount} solicitação(ões) pendente(s)
            </p>
          )}
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="processing">Processando</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`${request.status === 'pending' ? 'border-yellow-500/50' : 'border-border'}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        request.account_type === '99' 
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                          : 'bg-gradient-to-br from-gray-600 to-black'
                      }`}>
                        {request.vehicle_category === 'Carro' 
                          ? <Car className="w-6 h-6 text-white" />
                          : <Bike className="w-6 h-6 text-white" />
                        }
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{request.account_type} {request.vehicle_category}</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Placa: <span className="font-mono">{request.vehicle_plate}</span>
                          {request.account_type === '99' && request.first_name && (
                            <> • Nome: {request.first_name}</>
                          )}
                          {request.account_type === 'Uber' && request.email && (
                            <> • {request.email}</>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetail(request)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Solicitação de Conta {selectedRequest?.account_type}
              {selectedRequest && getStatusBadge(selectedRequest.status)}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plataforma:</span>
                  <span className="font-bold">{selectedRequest.account_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="font-bold flex items-center gap-1">
                    {selectedRequest.vehicle_category === 'Carro' 
                      ? <Car className="w-4 h-4" /> 
                      : <Bike className="w-4 h-4" />
                    }
                    {selectedRequest.vehicle_category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Placa:</span>
                  <span className="font-mono font-bold">{selectedRequest.vehicle_plate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span>{new Date(selectedRequest.created_at).toLocaleString('pt-BR')}</span>
                </div>
              </div>

              {/* Account Type Specific Info */}
              {selectedRequest.account_type === '99' ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-yellow-400 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Dados 99
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Primeiro Nome:</span>
                    <span className="font-bold">{selectedRequest.first_name || '-'}</span>
                  </div>
                  {selectedRequest.face_photo_url && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Foto do Rosto:</p>
                      <a 
                        href={selectedRequest.face_photo_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img 
                          src={selectedRequest.face_photo_url} 
                          alt="Foto do rosto" 
                          className="w-32 h-32 object-cover rounded-lg border border-yellow-500/30"
                        />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-gray-300 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Dados Uber
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Mail className="w-4 h-4" /> Email:
                    </span>
                    <span className="font-bold text-sm">{selectedRequest.email || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Phone className="w-4 h-4" /> Telefone:
                    </span>
                    <span className="font-bold">{selectedRequest.phone || '-'}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {selectedRequest.rg_front_url && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">RG Frente:</p>
                        <a 
                          href={selectedRequest.rg_front_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <img 
                            src={selectedRequest.rg_front_url} 
                            alt="RG Frente" 
                            className="w-full h-24 object-cover rounded-lg border border-gray-500/30"
                          />
                        </a>
                      </div>
                    )}
                    {selectedRequest.rg_back_url && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">RG Verso:</p>
                        <a 
                          href={selectedRequest.rg_back_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <img 
                            src={selectedRequest.rg_back_url} 
                            alt="RG Verso" 
                            className="w-full h-24 object-cover rounded-lg border border-gray-500/30"
                          />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label>Notas do Admin</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adicione notas sobre esta solicitação..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleUpdateStatus('processing')}
                      className="bg-blue-500 hover:bg-blue-600"
                      disabled={updateRequest.isPending}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Processar
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus('completed')}
                      className="bg-green-500 hover:bg-green-600"
                      disabled={updateRequest.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Concluir
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus('cancelled')}
                      variant="destructive"
                      disabled={updateRequest.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </>
                )}
                {selectedRequest.status === 'processing' && (
                  <>
                    <Button
                      onClick={() => handleUpdateStatus('completed')}
                      className="bg-green-500 hover:bg-green-600"
                      disabled={updateRequest.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Concluir
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus('cancelled')}
                      variant="destructive"
                      disabled={updateRequest.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountRequestsManager;
