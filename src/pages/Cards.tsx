import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Filter, X, ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CardItem from '@/components/CardItem';
import CategoryFilter from '@/components/CategoryFilter';
import PurchaseDialog from '@/components/PurchaseDialog';
import MixItem from '@/components/MixItem';
import MixPurchaseDialog from '@/components/MixPurchaseDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCards } from '@/hooks/useCards';
import { useCardMixes, CardMix } from '@/hooks/useCardMixes';
import { Card as CardType } from '@/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type CategoryType = 'FULLDADOS' | 'AUXILIAR' | 'MIX' | '';

const Cards = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [selectedMix, setSelectedMix] = useState<CardMix | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data: cards, isLoading } = useCards();
  const { data: mixes, isLoading: mixesLoading } = useCardMixes();

  // Extract unique banks and levels from cards
  const { uniqueBanks, uniqueLevels } = useMemo(() => {
    const banks = new Set<string>();
    const levels = new Set<string>();
    
    (cards || []).forEach(card => {
      if (card.bankName && card.bankName.trim()) {
        banks.add(card.bankName.trim().toUpperCase());
      }
      if (card.cardLevel && card.cardLevel.trim()) {
        levels.add(card.cardLevel.trim().toUpperCase());
      }
    });
    
    return {
      uniqueBanks: Array.from(banks).sort(),
      uniqueLevels: Array.from(levels).sort()
    };
  }, [cards]);

  // Filter active mixes with stock
  const availableMixes = (mixes || []).filter(mix => mix.is_active && mix.stock > 0);

  const filteredCards = (cards || []).filter(card => {
    const matchesCategory = !selectedCategory || 
      selectedCategory === 'MIX' || 
      card.subcategory === selectedCategory;
    
    const matchesBank = !selectedBank || 
      card.bankName?.trim().toUpperCase() === selectedBank;
    
    const matchesLevel = !selectedLevel || 
      card.cardLevel?.trim().toUpperCase() === selectedLevel;
    
    const searchLower = searchQuery.toLowerCase().trim();
    const bin = card.cardNumber?.slice(0, 6) || '';
    const cardLevel = card.cardLevel?.toLowerCase() || '';
    const matchesSearch = !searchQuery || 
      bin.includes(searchLower) ||
      cardLevel.includes(searchLower);
    
    return matchesCategory && matchesSearch && matchesBank && matchesLevel;
  });

  const showCards = selectedCategory !== 'MIX';
  const showMixes = selectedCategory === '' || selectedCategory === 'MIX';

  const hasActiveFilters = selectedBank || selectedLevel;
  const activeFiltersCount = (selectedBank ? 1 : 0) + (selectedLevel ? 1 : 0);

  const clearFilters = () => {
    setSelectedBank('');
    setSelectedLevel('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-6">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-grotesk text-3xl md:text-4xl font-bold mb-2 text-gradient">
              Cards
            </h1>
            <p className="text-muted-foreground text-sm">
              Selecione uma categoria para explorar
            </p>
            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center mt-4 cursor-pointer"
              onClick={() => window.scrollBy({ top: window.innerHeight * 0.5, behavior: 'smooth' })}
            >
              <span className="text-muted-foreground text-xs mb-1">Role para ver mais</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronDown className="w-6 h-6 text-primary" />
              </motion.div>
            </motion.div>
          </div>

          {/* Search + Filter Button Row */}
          <div className="flex gap-2 mb-4 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar BIN ou nível..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-lg bg-card border-border text-sm"
              />
            </div>
            
            {(uniqueBanks.length > 0 || uniqueLevels.length > 0) && (
              <Button
                variant={filtersOpen || hasActiveFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="h-10 px-3 gap-1.5 shrink-0"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-background text-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className={`h-3 w-3 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
              </Button>
            )}
          </div>

          {/* Collapsible Filters */}
          <AnimatePresence>
            {filtersOpen && (uniqueBanks.length > 0 || uniqueLevels.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mb-4"
              >
                <div className="max-w-2xl mx-auto p-4 rounded-xl bg-card border border-border space-y-4">
                  {/* Bank Filter */}
                  {uniqueBanks.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Banco</p>
                      <div className="flex flex-wrap gap-1.5">
                        {uniqueBanks.map((bank) => (
                          <button
                            key={bank}
                            onClick={() => setSelectedBank(selectedBank === bank ? '' : bank)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                              selectedBank === bank
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Level Filter */}
                  {uniqueLevels.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Nível</p>
                      <div className="flex flex-wrap gap-1.5">
                        {uniqueLevels.map((level) => (
                          <button
                            key={level}
                            onClick={() => setSelectedLevel(selectedLevel === level ? '' : level)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                              selectedLevel === level
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3 w-3" />
                      Limpar filtros
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Filter */}
          <div className="mb-6">
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Loading */}
          {(isLoading || mixesLoading) && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Carregando...</p>
            </div>
          )}

          {/* Cards Grid - 2 columns on mobile, 3 on tablet, 4 on desktop */}
          {!isLoading && showCards && filteredCards.length > 0 && (
            <div className="mb-8">
              {selectedCategory && (
                <h2 className="font-grotesk text-lg font-bold text-foreground mb-4">
                  {selectedCategory === 'FULLDADOS' ? 'FULL DADOS' : 'AUXILIAR'}
                </h2>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                {filteredCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  >
                    <CardItem card={card} onBuy={setSelectedCard} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Mixes Section */}
          {!mixesLoading && showMixes && availableMixes.length > 0 && (
            <div className="mb-8">
              <h2 className="font-grotesk text-lg font-bold text-foreground mb-4">
                MIX
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {availableMixes.map((mix, index) => (
                  <motion.div
                    key={mix.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  >
                    <MixItem mix={mix} onBuy={setSelectedMix} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !mixesLoading && filteredCards.length === 0 && availableMixes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">
                Nenhum item encontrado
              </p>
            </div>
          )}
        </div>

        <PurchaseDialog
          card={selectedCard}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
        />

        <MixPurchaseDialog
          mix={selectedMix}
          isOpen={!!selectedMix}
          onClose={() => setSelectedMix(null)}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Cards;
