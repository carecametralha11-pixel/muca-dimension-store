import { useState, useMemo } from 'react';
import { Trash2, DollarSign, Check, X, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useDeleteMultipleCards, useDeleteCardsByCategory, useBulkUpdatePrice } from '@/hooks/useCards';
import { Card as CardType } from '@/types';
import { toast } from 'sonner';

interface CardsBulkManagerProps {
  cards: CardType[];
  subcategory: 'FULLDADOS' | 'AUXILIAR';
}

export const CardsBulkManager = ({ cards, subcategory }: CardsBulkManagerProps) => {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [priceFilterType, setPriceFilterType] = useState<'selected' | 'bank' | 'level'>('selected');
  const [priceFilterValue, setPriceFilterValue] = useState('');

  const deleteMultiple = useDeleteMultipleCards();
  const deleteByCategory = useDeleteCardsByCategory();
  const bulkUpdatePrice = useBulkUpdatePrice();

  const filteredCards = cards.filter(c => c.category === 'INFO' && c.subcategory === subcategory);

  const uniqueBanks = useMemo(() => {
    const banks = new Set<string>();
    filteredCards.forEach(card => {
      if (card.bankName) banks.add(card.bankName);
    });
    return Array.from(banks).sort();
  }, [filteredCards]);

  const uniqueLevels = useMemo(() => {
    const levels = new Set<string>();
    filteredCards.forEach(card => {
      if (card.cardLevel) levels.add(card.cardLevel);
    });
    return Array.from(levels).sort();
  }, [filteredCards]);

  const toggleSelectAll = () => {
    if (selectedCards.size === filteredCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(filteredCards.map(c => c.id)));
    }
  };

  const toggleSelectCard = (cardId: string) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedCards.size === 0) return;
    
    try {
      await deleteMultiple.mutateAsync(Array.from(selectedCards));
      setSelectedCards(new Set());
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting cards:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteByCategory.mutateAsync({ category: 'INFO', subcategory });
      setIsDeleteAllDialogOpen(false);
    } catch (error) {
      console.error('Error deleting all cards:', error);
    }
  };

  const handleBulkPriceUpdate = async () => {
    if (!newPrice || parseFloat(newPrice) < 0) {
      toast.error('Informe um preço válido');
      return;
    }

    const price = parseFloat(newPrice);

    try {
      if (priceFilterType === 'selected') {
        if (selectedCards.size === 0) {
          toast.error('Selecione ao menos um card');
          return;
        }
        await bulkUpdatePrice.mutateAsync({ ids: Array.from(selectedCards), price });
      } else if (priceFilterType === 'bank' && priceFilterValue) {
        await bulkUpdatePrice.mutateAsync({ filterBy: 'bank_name', filterValue: priceFilterValue, price });
      } else if (priceFilterType === 'level' && priceFilterValue) {
        await bulkUpdatePrice.mutateAsync({ filterBy: 'card_level', filterValue: priceFilterValue, price });
      } else {
        toast.error('Selecione um filtro válido');
        return;
      }
      
      setSelectedCards(new Set());
      setIsPriceDialogOpen(false);
      setNewPrice('');
      setPriceFilterValue('');
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  };

  const getAffectedCount = () => {
    if (priceFilterType === 'selected') {
      return selectedCards.size;
    } else if (priceFilterType === 'bank' && priceFilterValue) {
      return filteredCards.filter(c => c.bankName === priceFilterValue).length;
    } else if (priceFilterType === 'level' && priceFilterValue) {
      return filteredCards.filter(c => c.cardLevel === priceFilterValue).length;
    }
    return 0;
  };

  if (filteredCards.length === 0) return null;

  return (
    <>
      {/* Bulk Actions Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedCards.size === filteredCards.length && filteredCards.length > 0}
            onCheckedChange={toggleSelectAll}
            className="border-muted-foreground"
          />
          <span className="text-sm text-muted-foreground">
            {selectedCards.size > 0 ? `${selectedCards.size} selecionados` : 'Selecionar todos'}
          </span>
        </div>

        <div className="flex-1" />

        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsPriceDialogOpen(true)}
          className="border-portal-green/50 text-portal-green hover:bg-portal-green/10"
        >
          <DollarSign className="h-4 w-4 mr-1" />
          Alterar Preços
        </Button>

        {selectedCards.size > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir ({selectedCards.size})
          </Button>
        )}

        <Button
          size="sm"
          variant="destructive"
          onClick={() => setIsDeleteAllDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Excluir Todos ({filteredCards.length})
        </Button>
      </div>

      {/* Card Selection List */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className={`p-2 rounded-lg border flex items-center gap-3 cursor-pointer transition-colors ${
              selectedCards.has(card.id)
                ? 'bg-portal-green/10 border-portal-green/30'
                : 'bg-muted/30 border-border hover:bg-muted/50'
            }`}
            onClick={() => toggleSelectCard(card.id)}
          >
            <Checkbox
              checked={selectedCards.has(card.id)}
              onCheckedChange={() => toggleSelectCard(card.id)}
              className="border-muted-foreground"
            />
            <div className="flex-1 min-w-0 flex items-center gap-4">
              <span className="text-sm font-mono">****{card.cardNumber?.slice(-4)}</span>
              {card.bankName && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded">{card.bankName}</span>
              )}
              {card.cardLevel && (
                <span className="text-xs bg-space-purple/20 text-space-purple px-2 py-0.5 rounded">{card.cardLevel}</span>
              )}
            </div>
            <span className="font-orbitron text-sm font-bold text-portal-green">
              R$ {card.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Delete Selected Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir Cards Selecionados</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir {selectedCards.size} cards. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={deleteMultiple.isPending}
            >
              {deleteMultiple.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Excluir {selectedCards.size} Cards
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Dialog */}
      <Dialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir Todos os Cards {subcategory}</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir TODOS os {filteredCards.length} cards da categoria {subcategory}. Esta ação não pode ser desfeita!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAllDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAll}
              disabled={deleteByCategory.isPending}
            >
              {deleteByCategory.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Excluir Todos ({filteredCards.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Price Update Dialog */}
      <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Preços em Lote</DialogTitle>
            <DialogDescription>
              Altere o preço de múltiplos cards de uma vez
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Filtrar por:</Label>
              <Select value={priceFilterType} onValueChange={(v) => {
                setPriceFilterType(v as 'selected' | 'bank' | 'level');
                setPriceFilterValue('');
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="selected">Cards Selecionados ({selectedCards.size})</SelectItem>
                  <SelectItem value="bank">Por Banco</SelectItem>
                  <SelectItem value="level">Por Nível</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {priceFilterType === 'bank' && (
              <div className="space-y-2">
                <Label>Banco:</Label>
                <Select value={priceFilterValue} onValueChange={setPriceFilterValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueBanks.map(bank => (
                      <SelectItem key={bank} value={bank}>
                        {bank} ({filteredCards.filter(c => c.bankName === bank).length} cards)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {priceFilterType === 'level' && (
              <div className="space-y-2">
                <Label>Nível:</Label>
                <Select value={priceFilterValue} onValueChange={setPriceFilterValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueLevels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level} ({filteredCards.filter(c => c.cardLevel === level).length} cards)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Novo Preço (R$):</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {getAffectedCount() > 0 && (
              <div className="p-3 rounded-lg bg-portal-green/10 border border-portal-green/30">
                <p className="text-sm text-portal-green">
                  <strong>{getAffectedCount()}</strong> cards serão atualizados para <strong>R$ {parseFloat(newPrice || '0').toFixed(2)}</strong>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPriceDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleBulkPriceUpdate}
              disabled={bulkUpdatePrice.isPending || getAffectedCount() === 0}
              className="bg-portal-green hover:bg-portal-green/80"
            >
              {bulkUpdatePrice.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <DollarSign className="h-4 w-4 mr-2" />
              )}
              Atualizar Preços
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
