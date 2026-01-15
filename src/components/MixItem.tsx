import { motion } from 'framer-motion';
import { Package, Layers, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardMix } from '@/hooks/useCardMixes';

interface MixItemProps {
  mix: CardMix;
  onBuy: (mix: CardMix) => void;
}

const MixItem = ({ mix, onBuy }: MixItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <div className="h-full rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <Package className="h-5 w-5 text-foreground" />
          </div>
          
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground text-background text-[10px] font-bold">
            <Layers className="h-3 w-3" />
            {mix.quantity} cards
          </div>
        </div>

        {/* Mix Name */}
        <h3 className="font-grotesk font-semibold text-sm text-foreground mb-1 line-clamp-1">
          {mix.name}
        </h3>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground line-clamp-2 flex-1 mb-3">
          {mix.description || 'Dados revelados após a compra.'}
        </p>

        {/* Stock */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
            <div 
              className="h-full bg-foreground rounded-full"
              style={{ width: `${Math.min((mix.stock / 10) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {mix.stock} disp.
          </span>
        </div>

        {/* Price and Buy */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Preço</p>
            <p className="font-grotesk text-lg font-bold text-foreground">
              R$ {mix.price.toFixed(2)}
            </p>
          </div>
          <Button 
            onClick={() => onBuy(mix)}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Comprar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MixItem;
