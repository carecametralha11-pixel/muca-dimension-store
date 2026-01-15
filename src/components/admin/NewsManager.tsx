import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Newspaper, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAllNews, useCreateNews, useUpdateNews, useDeleteNews, NewsAnnouncement } from '@/hooks/useNews';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NewsManager = () => {
  const { data: news = [], isLoading } = useAllNews();
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const deleteNews = useDeleteNews();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsAnnouncement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: true,
  });

  const handleOpenDialog = (item?: NewsAnnouncement) => {
    if (item) {
      setEditingNews(item);
      setFormData({
        title: item.title,
        content: item.content,
        is_active: item.is_active,
      });
    } else {
      setEditingNews(null);
      setFormData({
        title: '',
        content: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    if (editingNews) {
      await updateNews.mutateAsync({
        id: editingNews.id,
        title: formData.title,
        content: formData.content,
        is_active: formData.is_active,
      });
    } else {
      await createNews.mutateAsync({
        title: formData.title,
        content: formData.content,
        is_active: formData.is_active,
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta novidade?')) {
      await deleteNews.mutateAsync(id);
    }
  };

  const handleToggleActive = async (item: NewsAnnouncement) => {
    await updateNews.mutateAsync({
      id: item.id,
      title: item.title,
      content: item.content,
      is_active: !item.is_active,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-yellow-500" />
          Gerenciar Novidades
        </h2>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Novidade
        </Button>
      </div>

      {news.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhuma novidade cadastrada ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {news.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        {item.is_active ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                            Ativo
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                            Inativo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/70 whitespace-pre-wrap line-clamp-2">
                        {item.content}
                      </p>
                      <p className="text-xs text-white/40 mt-2">
                        {format(new Date(item.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(item)}
                        title={item.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {item.is_active ? (
                          <Eye className="w-4 h-4 text-green-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-white/50" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <Edit2 className="w-4 h-4 text-blue-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingNews ? 'Editar Novidade' : 'Nova Novidade'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="news-title">Título</Label>
              <Input
                id="news-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Novos cards disponíveis!"
              />
            </div>
            <div>
              <Label htmlFor="news-content">Conteúdo</Label>
              <Textarea
                id="news-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Descreva a novidade..."
                rows={4}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="news-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="news-active">Exibir para todos</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title.trim() || !formData.content.trim() || createNews.isPending || updateNews.isPending}
            >
              {createNews.isPending || updateNews.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsManager;
