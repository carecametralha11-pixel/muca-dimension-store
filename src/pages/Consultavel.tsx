import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Filter, X, ChevronDown, ChevronLeft, ChevronRight, Image as ImageIcon, ArrowDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ConsultavelItem, { ConsultavelItemData } from '@/components/ConsultavelItem';
import ConsultavelPurchaseDialog from '@/components/ConsultavelPurchaseDialog';
import ConsultavelContactForm from '@/components/ConsultavelContactForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useConsultaveis, Consultavel } from '@/hooks/useConsultaveis';
import { useConsultavelImages } from '@/hooks/useConsultavelImages';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

type CategoryType = 'CT' | 'ST' | '';

// Images Gallery Dialog
const ConsultavelImagesGallery = ({ 
  consultavel,
  isOpen,
  onClose 
}: { 
  consultavel: ConsultavelItemData | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { data: images = [], isLoading } = useConsultavelImages(consultavel?.id || '');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [consultavel?.id]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (!isOpen || !consultavel) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-sm">
        <div className="relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">{consultavel.name}</h3>
              <span className="text-white/70 text-sm">
                {images.length > 0 ? `${currentIndex + 1} / ${images.length}` : ''}
              </span>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
              <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma imagem disponível</p>
              <p className="text-sm">Esta consultável ainda não possui imagens extras.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Main Image */}
              <div className="flex items-center justify-center min-h-[60vh] max-h-[80vh]">
                <img
                  src={images[currentIndex]?.image_url}
                  alt={images[currentIndex]?.title || 'Imagem'}
                  className="w-full h-full max-h-[80vh] object-contain"
                />
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === currentIndex
                            ? 'border-primary scale-105'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.image_url}
                          alt={img.title || `Imagem ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ConsultavelPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConsultavel, setSelectedConsultavel] = useState<ConsultavelItemData | null>(null);
  const [viewImagesConsultavel, setViewImagesConsultavel] = useState<ConsultavelItemData | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data: consultaveis, isLoading } = useConsultaveis();
  const queryClient = useQueryClient();

  // Setup realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('consultaveis-page-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultaveis'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['consultaveis'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Map consultaveis to ConsultavelItemData
  const consultaveisData: ConsultavelItemData[] = (consultaveis || []).map(c => ({
    id: c.id,
    type: c.type,
    name: c.name,
    description: c.description,
    price: c.price,
    image_url: c.image_url,
    card_number: (c as any).card_number || null,
    card_expiry: (c as any).card_expiry || null,
    card_cvv: (c as any).card_cvv || null,
    card_level: (c as any).card_level || null,
    bank_name: (c as any).bank_name || null,
    is_active: c.is_active
  }));

  // Extract unique banks and levels
  const { uniqueBanks, uniqueLevels } = (() => {
    const banks = new Set<string>();
    const levels = new Set<string>();
    
    consultaveisData.forEach(c => {
      if (c.bank_name?.trim()) {
        banks.add(c.bank_name.trim().toUpperCase());
      }
      if (c.card_level?.trim()) {
        levels.add(c.card_level.trim().toUpperCase());
      }
    });
    
    return {
      uniqueBanks: Array.from(banks).sort(),
      uniqueLevels: Array.from(levels).sort()
    };
  })();

  const filteredConsultaveis = consultaveisData.filter(c => {
    const matchesCategory = !selectedCategory || c.type === selectedCategory;
    
    const matchesBank = !selectedBank || 
      c.bank_name?.trim().toUpperCase() === selectedBank;
    
    const matchesLevel = !selectedLevel || 
      c.card_level?.trim().toUpperCase() === selectedLevel;
    
    const searchLower = searchQuery.toLowerCase().trim();
    const bin = c.card_number?.slice(0, 6) || '';
    const cardLevel = c.card_level?.toLowerCase() || '';
    const bankName = c.bank_name?.toLowerCase() || '';
    const matchesSearch = !searchQuery || 
      bin.includes(searchLower) ||
      cardLevel.includes(searchLower) ||
      bankName.includes(searchLower);
    
    return matchesCategory && matchesSearch && matchesBank && matchesLevel;
  });

  const ctCount = consultaveisData.filter(c => c.type === 'CT').length;
  const stCount = consultaveisData.filter(c => c.type === 'ST').length;

  const hasActiveFilters = selectedBank || selectedLevel;
  const activeFiltersCount = (selectedBank ? 1 : 0) + (selectedLevel ? 1 : 0);

  const clearFilters = () => {
    setSelectedBank('');
    setSelectedLevel('');
  };

  const categories = [
    { id: '', label: 'Todos', count: consultaveisData.length },
    { id: 'CT', label: 'CT', count: ctCount },
    { id: 'ST', label: 'ST', count: stCount },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-6">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-grotesk text-3xl md:text-4xl font-bold mb-2 text-gradient">
              Consultável
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
                placeholder="Buscar BIN, banco ou nível..."
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
            <div className="flex justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id as CategoryType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  {category.label}
                  <span className="ml-1.5 text-xs opacity-70">({category.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Carregando...</p>
            </div>
          )}

          {/* Consultaveis Grid */}
          {!isLoading && filteredConsultaveis.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              {filteredConsultaveis.map((consultavel, index) => (
                <motion.div
                  key={consultavel.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                >
                  <ConsultavelItem 
                    consultavel={consultavel} 
                    onBuy={setSelectedConsultavel}
                    onViewImages={setViewImagesConsultavel}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State - Show Contact Form when no consultaveis exist */}
          {!isLoading && consultaveisData.length === 0 && (
            <ConsultavelContactForm />
          )}

          {/* Empty State - Show message when filters return no results */}
          {!isLoading && consultaveisData.length > 0 && filteredConsultaveis.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">
                Nenhuma consultável encontrada com os filtros selecionados
              </p>
            </div>
          )}
        </div>

        <ConsultavelPurchaseDialog
          consultavel={selectedConsultavel}
          isOpen={!!selectedConsultavel}
          onClose={() => setSelectedConsultavel(null)}
        />

        <ConsultavelImagesGallery
          consultavel={viewImagesConsultavel}
          isOpen={!!viewImagesConsultavel}
          onClose={() => setViewImagesConsultavel(null)}
        />
      </main>

      <Footer />
    </div>
  );
};

export default ConsultavelPage;
