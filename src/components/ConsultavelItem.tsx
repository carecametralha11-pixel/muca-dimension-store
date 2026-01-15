import { memo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ConsultavelItemData {
  id: string;
  type: 'CT' | 'ST';
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  card_number: string | null;
  card_expiry: string | null;
  card_cvv: string | null;
  card_level: string | null;
  bank_name: string | null;
  is_active: boolean;
}

interface ConsultavelItemProps {
  consultavel: ConsultavelItemData;
  onBuy: (consultavel: ConsultavelItemData) => void;
  onViewImages?: (consultavel: ConsultavelItemData) => void;
}

const ConsultavelItem = memo(({ consultavel, onBuy, onViewImages }: ConsultavelItemProps) => {
  const isCT = consultavel.type === 'CT';
  
  // Format display for card number - show first 6 digits with asterisks
  const displayBin = consultavel.card_number?.slice(0, 6) || '';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="h-full"
    >
      <div className="h-full rounded-lg border border-border bg-card hover:border-primary/30 transition-all overflow-hidden flex flex-col">
        {/* Image */}
        {consultavel.image_url ? (
          <div 
            className="relative aspect-[4/3] cursor-pointer group"
            onClick={() => onViewImages?.(consultavel)}
          >
            <img 
              src={consultavel.image_url} 
              alt={consultavel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        ) : (
          <div 
            className="aspect-[4/3] bg-muted flex items-center justify-center cursor-pointer"
            onClick={() => onViewImages?.(consultavel)}
          >
            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        <div className="p-3 flex flex-col flex-1">
          {/* Header Row - Type & Level */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide shrink-0 ${
              isCT 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}>
              {isCT ? 'CT' : 'ST'}
            </span>
            
            {consultavel.card_level && (
              <span className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-medium uppercase text-muted-foreground truncate max-w-[80px]">
                {consultavel.card_level}
              </span>
            )}
          </div>

          {/* BIN Number with asterisks */}
          <div className="mb-2">
            <p className="font-mono text-lg font-bold text-foreground tracking-wide">
              {displayBin ? (
                <>
                  {displayBin} <span className="text-muted-foreground">••••</span>
                </>
              ) : (
                <span className="text-muted-foreground text-sm">Sem BIN</span>
              )}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              {consultavel.card_expiry && (
                <span className="font-medium">{consultavel.card_expiry}</span>
              )}
              {consultavel.bank_name && (
                <>
                  {consultavel.card_expiry && <span>•</span>}
                  <span className="font-medium truncate">{consultavel.bank_name}</span>
                </>
              )}
            </div>
          </div>

          {/* Price and Buy - Footer */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
            <p className="font-bold text-base text-foreground">
              R$ {consultavel.price.toFixed(2)}
            </p>
            <Button 
              onClick={() => onBuy(consultavel)}
              size="sm"
              className="h-7 px-2.5 text-[10px] gap-1"
            >
              <ShoppingBag className="h-3 w-3" />
              Comprar
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ConsultavelItem.displayName = 'ConsultavelItem';

export default ConsultavelItem;
