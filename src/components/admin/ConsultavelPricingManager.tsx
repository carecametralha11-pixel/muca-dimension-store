import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, DollarSign, CreditCard, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  useAllPricingTiers,
  useCreatePricingTier,
  useUpdatePricingTier,
  useDeletePricingTier,
  ConsultavelPricingTier,
} from '@/hooks/useConsultavelPricing';
import { toast } from 'sonner';

const ConsultavelPricingManager: React.FC = () => {
  const { data: tiers = [], isLoading } = useAllPricingTiers();
  const createTier = useCreatePricingTier();
  const updateTier = useUpdatePricingTier();
  const deleteTier = useDeletePricingTier();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<ConsultavelPricingTier | null>(null);
  const [tierToDelete, setTierToDelete] = useState<ConsultavelPricingTier | null>(null);
  const [formData, setFormData] = useState({
    limit_amount: '',
    price: '',
    display_order: '0',
    is_active: true,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleOpenDialog = (tier?: ConsultavelPricingTier) => {
    if (tier) {
      setEditingTier(tier);
      setFormData({
        limit_amount: tier.limit_amount.toString(),
        price: tier.price.toString(),
        display_order: tier.display_order.toString(),
        is_active: tier.is_active,
      });
    } else {
      setEditingTier(null);
      setFormData({
        limit_amount: '',
        price: '',
        display_order: tiers.length.toString(),
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.limit_amount || !formData.price) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const data = {
      limit_amount: parseInt(formData.limit_amount),
      price: parseFloat(formData.price),
      display_order: parseInt(formData.display_order) || 0,
      is_active: formData.is_active,
    };

    try {
      if (editingTier) {
        await updateTier.mutateAsync({ id: editingTier.id, ...data });
      } else {
        await createTier.mutateAsync(data);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving tier:', error);
    }
  };

  const handleDelete = async () => {
    if (!tierToDelete) return;
    
    try {
      await deleteTier.mutateAsync(tierToDelete.id);
      setTierToDelete(null);
    } catch (error) {
      console.error('Error deleting tier:', error);
    }
  };

  const handleToggleActive = async (tier: ConsultavelPricingTier) => {
    await updateTier.mutateAsync({
      id: tier.id,
      is_active: !tier.is_active,
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Preços por Limite (Consultável)
          </CardTitle>
          <Button onClick={() => handleOpenDialog()} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Limite
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tiers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma faixa de preço configurada</p>
              <p className="text-sm">Adicione limites e preços para consultáveis</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    tier.is_active 
                      ? 'border-border bg-card' 
                      : 'border-border/50 bg-muted/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-bold text-lg">
                        {formatCurrency(tier.limit_amount)}
                      </span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-lg font-semibold text-primary">
                      {formatCurrency(tier.price)}
                    </span>
                    {!tier.is_active && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">Inativo</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={tier.is_active}
                      onCheckedChange={() => handleToggleActive(tier)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(tier)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTierToDelete(tier)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTier ? 'Editar Faixa de Preço' : 'Nova Faixa de Preço'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="limit_amount">Limite (R$)</Label>
              <Input
                id="limit_amount"
                type="number"
                placeholder="Ex: 5000"
                value={formData.limit_amount}
                onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                O valor do limite da consultável (ex: 1000, 2000, 5000)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="Ex: 250"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                O preço que será cobrado pelo limite acima
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_order">Ordem de Exibição</Label>
              <Input
                id="display_order"
                type="number"
                placeholder="0"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createTier.isPending || updateTier.isPending}
            >
              {(createTier.isPending || updateTier.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!tierToDelete} onOpenChange={() => setTierToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Faixa de Preço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a faixa de limite de {tierToDelete && formatCurrency(tierToDelete.limit_amount)}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTier.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConsultavelPricingManager;
