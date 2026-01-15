import { motion } from 'framer-motion';
import { Package, Loader2, ArrowRight } from 'lucide-react';
import { useCards } from '@/hooks/useCards';
import CardItem from './CardItem';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const FeaturedCards = () => {
  const { data: cards, isLoading } = useCards();
  const featuredCards = cards?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Carregando cards...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-grotesk text-2xl md:text-3xl font-bold">
              Cards em Destaque
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Os cards mais recentes disponíveis
            </p>
          </div>
          <Link to="/cards">
            <Button variant="outline" size="sm">
              Ver todos
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Cards Grid */}
        {featuredCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <CardItem card={card} onBuy={() => {}} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Nenhum card disponível ainda</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCards;
