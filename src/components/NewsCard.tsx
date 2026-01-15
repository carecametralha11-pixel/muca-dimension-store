import { motion } from 'framer-motion';
import { Newspaper, Bell, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActiveNews } from '@/hooks/useNews';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NewsCard = () => {
  const { data: news = [], isLoading } = useActiveNews();

  if (isLoading || news.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border-yellow-500/30 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl animate-pulse delay-150" />
        </div>

        <CardHeader className="relative pb-3">
          <CardTitle className="flex items-center gap-3 text-yellow-400">
            <div className="relative">
              <Bell className="w-6 h-6" />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
            </div>
            <span className="text-xl font-bold">
              🎉 NOVIDADES
            </span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-yellow-500/50 to-transparent" />
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {news.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-yellow-500/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Newspaper className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </p>
                  <p className="text-xs text-white/40 mt-2">
                    {format(new Date(item.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NewsCard;
