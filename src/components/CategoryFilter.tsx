import { motion } from 'framer-motion';
import { Database, FileText, Package } from 'lucide-react';

type CategoryType = 'FULLDADOS' | 'AUXILIAR' | 'MIX' | '';

interface CategoryFilterProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

const categories = [
  { id: 'FULLDADOS', label: 'FULL DADOS', icon: Database },
  { id: 'AUXILIAR', label: 'AUXILIAR', icon: FileText },
  { id: 'MIX', label: 'MIX', icon: Package },
] as const;

const CategoryFilter = ({ 
  selectedCategory, 
  onSelectCategory,
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((category) => {
        const isActive = selectedCategory === category.id;
        const Icon = category.icon;
        
        return (
          <motion.button
            key={category.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCategory(isActive ? '' : category.id as CategoryType)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full
              font-grotesk font-medium text-sm
              transition-all duration-200 border
              ${isActive 
                ? 'bg-foreground text-background border-foreground' 
                : 'bg-transparent text-foreground border-border hover:border-foreground/50'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{category.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
