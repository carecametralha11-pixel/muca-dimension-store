import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Trash2, 
  MessageCircle, 
  DollarSign, 
  CreditCard,
  User,
  Search,
  Car,
  Wallet,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminNotification, useAdminNotifications } from '@/hooks/useAdminNotifications';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

interface NotificationsManagerProps {
  isAdmin: boolean;
}

const NotificationsManager = ({ isAdmin }: NotificationsManagerProps) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications,
    requestPermission,
    playSound
  } = useAdminNotifications(isAdmin);
  
  const [filter, setFilter] = useState<string>('all');
  const [showClearDialog, setShowClearDialog] = useState(false);

  const getNotificationIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'purchase':
        return <CreditCard className="h-5 w-5 text-portal-green" />;
      case 'pix':
        return <DollarSign className="h-5 w-5 text-emerald-500" />;
      case 'chat':
        return <MessageCircle className="h-5 w-5 text-portal-cyan" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'consultavel':
        return <Search className="h-5 w-5 text-amber-500" />;
      case 'balance':
        return <Wallet className="h-5 w-5 text-purple-500" />;
      case 'account_request':
        return <Car className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: AdminNotification['type']) => {
    switch (type) {
      case 'purchase':
        return 'Venda';
      case 'pix':
        return 'Depósito PIX';
      case 'chat':
        return 'Novo Chat';
      case 'message':
        return 'Mensagem';
      case 'consultavel':
        return 'Consultável';
      case 'balance':
        return 'Saldo';
      case 'account_request':
        return 'Conta 99/Uber';
      default:
        return 'Notificação';
    }
  };

  const getTypeColor = (type: AdminNotification['type']) => {
    switch (type) {
      case 'purchase':
        return 'bg-portal-green/20 text-portal-green border-portal-green/30';
      case 'pix':
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'chat':
        return 'bg-portal-cyan/20 text-portal-cyan border-portal-cyan/30';
      case 'message':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'consultavel':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'balance':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'account_request':
        return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const handleTestNotification = async () => {
    await requestPermission();
    playSound(true);
  };

  const notificationTypes = [
    { value: 'all', label: 'Todas', count: notifications.length },
    { value: 'purchase', label: 'Vendas', count: notifications.filter(n => n.type === 'purchase').length },
    { value: 'pix', label: 'PIX', count: notifications.filter(n => n.type === 'pix').length },
    { value: 'consultavel', label: 'Consultáveis', count: notifications.filter(n => n.type === 'consultavel').length },
    { value: 'chat', label: 'Chats', count: notifications.filter(n => n.type === 'chat').length },
    { value: 'message', label: 'Mensagens', count: notifications.filter(n => n.type === 'message').length },
    { value: 'balance', label: 'Saldo', count: notifications.filter(n => n.type === 'balance').length },
    { value: 'account_request', label: 'Contas', count: notifications.filter(n => n.type === 'account_request').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-orbitron font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-portal-green" />
            Central de Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unreadCount} novas
              </Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Histórico de todas as notificações do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleTestNotification}>
            <Bell className="h-4 w-4 mr-2" />
            Testar Som
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar Todas
            </Button>
          )}
          {notifications.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowClearDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {notificationTypes.map(type => (
              <Button
                key={type.value}
                variant={filter === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(type.value)}
                className="gap-2"
              >
                {type.label}
                {type.count > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {type.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <BellOff className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Nenhuma notificação
                </p>
                <p className="text-sm text-muted-foreground/70">
                  {filter === 'all' 
                    ? 'Você será notificado sobre vendas, depósitos e mensagens' 
                    : 'Nenhuma notificação deste tipo'}
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.02 }}
                    className={`
                      p-4 border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer
                      ${!notification.read ? 'bg-muted/50' : ''}
                      ${notification.urgent && !notification.read ? 'border-l-4 border-l-destructive' : ''}
                    `}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getTypeColor(notification.type).split(' ')[0]}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`${getTypeColor(notification.type)} text-xs`}>
                            {getTypeLabel(notification.type)}
                          </Badge>
                          {notification.urgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgente
                            </Badge>
                          )}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-portal-green rounded-full animate-pulse" />
                          )}
                        </div>
                        <h4 className="font-medium text-foreground truncate">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {notification.body}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          {formatDistanceToNow(notification.timestamp, { 
                            addSuffix: true, 
                            locale: ptBR 
                          })} • {format(notification.timestamp, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                      {notification.read && (
                        <Check className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar todas as notificações?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá remover todas as {notifications.length} notificações do histórico.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearNotifications();
                setShowClearDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Limpar Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationsManager;
