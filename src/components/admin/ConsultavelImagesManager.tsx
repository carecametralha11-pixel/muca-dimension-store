import { useState } from 'react';
import { Image, Plus, Trash2, Loader2, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useConsultavelImages,
  useCreateConsultavelImage,
  useDeleteConsultavelImage,
  uploadConsultavelImage,
} from '@/hooks/useConsultavelImages';
import { toast } from 'sonner';

interface ConsultavelImagesManagerProps {
  consultavelId: string;
  consultavelName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ConsultavelImagesManager = ({
  consultavelId,
  consultavelName,
  isOpen,
  onClose,
}: ConsultavelImagesManagerProps) => {
  const { data: images = [], isLoading } = useConsultavelImages(consultavelId);
  const createImage = useCreateConsultavelImage();
  const deleteImage = useDeleteConsultavelImage();
  
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageTitle, setImageTitle] = useState('');

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Selecione pelo menos uma imagem');
      return;
    }

    setIsUploading(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const imageUrl = await uploadConsultavelImage(file, consultavelId);
        
        await createImage.mutateAsync({
          consultavel_id: consultavelId,
          image_url: imageUrl,
          title: imageTitle || file.name.split('.')[0],
          display_order: images.length + i,
          is_active: true,
        });
      }
      
      toast.success(`${selectedFiles.length} imagem(ns) adicionada(s) com sucesso!`);
      setSelectedFiles(null);
      setImageTitle('');
      
      // Reset file input
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Erro ao fazer upload das imagens');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      await deleteImage.mutateAsync({
        id: imageId,
        consultavelId,
        imageUrl,
      });
      toast.success('Imagem removida com sucesso!');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Erro ao remover imagem');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-orbitron flex items-center gap-2">
            <Image className="h-5 w-5" />
            Imagens de {consultavelName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="p-4 rounded-lg border border-dashed border-border bg-muted/50 space-y-3">
            <Label htmlFor="image-upload" className="text-sm font-medium">
              Adicionar Novas Imagens
            </Label>
            <div className="flex gap-2">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="flex-1"
              />
            </div>
            {selectedFiles && selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {selectedFiles.length} arquivo(s) selecionado(s)
                </p>
                <Input
                  placeholder="Título (opcional)"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                />
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar Imagens
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Images Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Imagens Cadastradas ({images.length})
              </Label>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma imagem cadastrada</p>
                <p className="text-xs">Adicione imagens para que os clientes vejam</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative group rounded-lg overflow-hidden border border-border"
                  >
                    <img
                      src={image.image_url}
                      alt={image.title || 'Imagem'}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteImage(image.id, image.image_url)}
                        disabled={deleteImage.isPending}
                      >
                        {deleteImage.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {image.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1.5">
                        <p className="text-xs text-white truncate">{image.title}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
