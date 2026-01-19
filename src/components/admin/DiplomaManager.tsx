import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Trash2, CheckCircle, XCircle, MessageCircle, Loader2, Clock, Search, Settings, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAllDiplomaOrders, useUpdateDiplomaOrder, useDiplomaConfig, useUpdateDiplomaConfig, DiplomaOrder } from '@/hooks/useDiplomaOrders';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface DiplomaManagerProps {
  onNavigateToChat?: (chatId: string) => void;
}

const DiplomaManager: React.FC<DiplomaManagerProps> = ({ onNavigateToChat }) => {
  const { data: orders = [], isLoading: ordersLoading, refetch } = useAllDiplomaOrders();
  const { data: config, isLoading: configLoading } = useDiplomaConfig();
  const updateOrder = useUpdateDiplomaOrder();
  const updateConfig = useUpdateDiplomaConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when config loads
  React.useEffect(() => {
    if (config) {
      setNewPrice(config.price.toString());
      setIsActive(config.is_active);
    }
  }, [config]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processando</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSaveConfig = async () => {
    if (!config || !newPrice) return;
    
    setIsSaving(true);
    try {
      await updateConfig.mutateAsync({
        id: config.id,
        price: parseFloat(newPrice),
        is_active: isActive,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (order: DiplomaOrder, status: string) => {
    try {
      await updateOrder.mutateAsync({ id: order.id, status });
      toast.success(`Status atualizado para ${status}`);
      refetch();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleContactUser = (order: DiplomaOrder) => {
    if (order.chat_id && onNavigateToChat) {
      onNavigateToChat(order.chat_id);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.course_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (ordersLoading || configLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Diploma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Preço do Diploma</Label>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="diploma-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="diploma-active">Serviço Ativo</Label>
            </div>
            <Button onClick={handleSaveConfig} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Pedidos de Diploma ({orders.length})
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum pedido encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={order.status === 'pending' ? 'border-yellow-500/50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{order.full_name}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>📧 {order.user_email}</p>
                          <p>📋 CPF: {order.cpf}</p>
                          <p>📅 Nascimento: {order.birth_date}</p>
                          <p>📚 Curso: <span className="font-medium">{order.course_type}</span></p>
                          <p>💰 Valor Pago: <span className="font-bold text-primary">{formatCurrency(order.price)}</span></p>
                          <p>🕐 {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(order, 'processing')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Loader2 className="h-4 w-4 mr-1" />
                            Processar
                          </Button>
                        )}
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(order, 'completed')}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Concluir
                          </Button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(order, 'cancelled')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                        {order.chat_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContactUser(order)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiplomaManager;
