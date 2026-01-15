import { memo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Card as CardType } from '@/types';
import { Button } from '@/components/ui/button';

interface CardItemProps {
  card: CardType;
  onBuy: (card: CardType) => void;
}

const CardItem = memo(({ card, onBuy }: CardItemProps) => {
  const isFullDados = card.subcategory === 'FULLDADOS';
  
  // Format display for card number - show first 6 digits with asterisks
  const displayBin = card.cardNumber?.slice(0, 6) || '';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="h-full"
    >
      <div className="h-full rounded-lg border border-border bg-card hover:border-primary/30 transition-all p-3 flex flex-col">
        {/* Header Row - Type & Level */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide shrink-0 ${
            isFullDados 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground'
          }`}>
            {isFullDados ? 'FULL' : 'AUX'}
          </span>
          
          {card.cardLevel && (
            <span className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-medium uppercase text-muted-foreground">
              {card.cardLevel}
            </span>
          )}
        </div>

        {/* BIN Number with asterisks */}
        <div className="mb-2">
          <p className="font-mono text-lg font-bold text-foreground tracking-wide">
            {displayBin} <span className="text-muted-foreground">••••</span>
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <span className="font-medium">{card.cardExpiry}</span>
            {card.bankName && (
              <>
                <span>•</span>
                <span className="font-medium">{card.bankName}</span>
              </>
            )}
          </div>
        </div>

        {/* Price and Buy - Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
          <p className="font-bold text-base text-foreground">
            R$ {card.price.toFixed(2)}
          </p>
          <Button 
            onClick={() => onBuy(card)}
            size="sm"
            className="h-7 px-2.5 text-[10px] gap-1"
          >
            <ShoppingBag className="h-3 w-3" />
            Comprar
          </Button>
        </div>
      </div>
    </motion.div>
  );
});

CardItem.displayName = 'CardItem';

export default CardItem;
