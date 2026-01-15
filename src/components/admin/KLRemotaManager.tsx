import { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Edit2, 
  Trash2, 
  Upload, 
  Download, 
  Video, 
  FileText,
  Settings,
  DollarSign,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  useKLRemotaConfig,
  useUpdateKLRemotaConfig,
  useAllKLRemotaFiles,
  useCreateKLRemotaFile,
  useUpdateKLRemotaFile,
  useDeleteKLRemotaFile,
  useAllKLRemotaPurchases,
  uploadKLFile,
  deleteKLFile,
  KLRemotaFile
} from '@/hooks/useKLRemota';

const KLRemotaManager = () => {
  const { data: config, isLoading: configLoading } = useKLRemotaConfig();
  const updateConfig = useUpdateKLRemotaConfig();
  const { data: files = [], isLoading: filesLoading } = useAllKLRemotaFiles();
  const { data: purchases = [], isLoading: purchasesLoading } = useAllKLRemotaPurchases();
  const createFile = useCreateKLRemotaFile();
  const updateFile = useUpdateKLRemotaFile();
  const deleteFile = useDeleteKLRemotaFile();

  const [priceInput, setPriceInput] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<KLRemotaFile | null>(null);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileFormData, setFileFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    file_type: 'file' as 'file' | 'video' | 'bypass',
    display_order: 0,
    is_active: true,
  });

  // Initialize price input when config loads
  useState(() => {
    if (config) {
      setPriceInput(config.price.toString());
      setIsActive(config.is_active);
    }
  });

  const handleSaveConfig = async () => {
    if (!config) return;
    
    const price = parseFloat(priceInput);
    if (isNaN(price) || price < 0) {
      toast.error('Insira um preço válido');
      return;
    }

    await updateConfig.mutateAsync({ id: config.id, price, is_active: isActive });
  };

  const handleOpenFileDialog = (file?: KLRemotaFile) => {
    if (file) {
      setEditingFile(file);
      setFileFormData({
        title: file.title,
        description: file.description || '',
        file_url: file.file_url,
        file_type: file.file_type as 'file' | 'video' | 'bypass',
        display_order: file.display_order || 0,
        is_active: file.is_active ?? true,
      });
    } else {
      setEditingFile(null);
      setFileFormData({
        title: '',
        description: '',
        file_url: '',
        file_type: 'file',
        display_order: files.length,
        is_active: true,
      });
    }
    setSelectedUploadFile(null);
    setIsFileDialogOpen(true);
  };

  const handleFileUpload = async () => {
    if (!selectedUploadFile) return;
    
    setIsUploading(true);
    try {
      const url = await uploadKLFile(selectedUploadFile);
      setFileFormData(prev => ({ ...prev, file_url: url }));
      toast.success('Arquivo enviado com sucesso!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveFile = async () => {
    if (!fileFormData.title || !fileFormData.file_url) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingFile) {
        await updateFile.mutateAsync({ id: editingFile.id, ...fileFormData });
      } else {
        await createFile.mutateAsync(fileFormData);
      }
      setIsFileDialogOpen(false);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const handleDeleteFile = async (file: KLRemotaFile) => {
    if (!confirm(`Tem certeza que deseja excluir "${file.title}"?`)) return;
    
    try {
      await deleteKLFile(file.file_url);
      await deleteFile.mutateAsync(file.id);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'bypass': return <Download className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getFileTypeName = (type: string) => {
    switch (type) {
      case 'video': return 'Vídeo';
      case 'bypass': return 'Bypass';
      default: return 'Arquivo';
    }
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Config Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuração KL Remota
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Preço (R$)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={priceInput || config?.price || ''}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">Módulo Ativo</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <span className="text-sm text-muted-foreground">
                  {isActive ? 'Ativo' : 'Desativado'}
                </span>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleSaveConfig} 
            disabled={updateConfig.isPending}
            className="w-full md:w-auto"
          >
            {updateConfig.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Salvar Configuração
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Preço Atual</p>
                <p className="text-2xl font-bold text-emerald-500">
                  R$ {config?.price?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Arquivos</p>
                <p className="text-2xl font-bold text-blue-500">{files.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Vendas</p>
                <p className="text-2xl font-bold text-purple-500">{purchases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Files Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Arquivos (Liberados após pagamento)
          </CardTitle>
          <Button onClick={() => handleOpenFileDialog()} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {filesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum arquivo adicionado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getFileIcon(file.file_type)}
                    </div>
                    <div>
                      <p className="font-medium">{file.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {getFileTypeName(file.file_type)} • 
                        {file.is_active ? ' Ativo' : ' Desativado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(file.file_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenFileDialog(file)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFile(file)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Purchases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Vendas Recentes do KL Remota
          </CardTitle>
        </CardHeader>
        <CardContent>
          {purchasesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : purchases.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma venda ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {purchases.slice(0, 10).map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">
                      R$ {purchase.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(purchase.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-500">
                    {purchase.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Dialog */}
      <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFile ? 'Editar Arquivo' : 'Adicionar Arquivo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={fileFormData.title}
                onChange={(e) => setFileFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Vídeo de Instalação"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={fileFormData.description}
                onChange={(e) => setFileFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional..."
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={fileFormData.file_type}
                onValueChange={(value: 'file' | 'video' | 'bypass') => 
                  setFileFormData(prev => ({ ...prev, file_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">Arquivo</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="bypass">Bypass</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload de Arquivo</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  onChange={(e) => setSelectedUploadFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFileUpload}
                  disabled={!selectedUploadFile || isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL do Arquivo *</Label>
              <Input
                value={fileFormData.file_url}
                onChange={(e) => setFileFormData(prev => ({ ...prev, file_url: e.target.value }))}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                Faça upload acima ou cole uma URL diretamente
              </p>
            </div>

            <div className="space-y-2">
              <Label>Ordem de Exibição</Label>
              <Input
                type="number"
                value={fileFormData.display_order}
                onChange={(e) => setFileFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={fileFormData.is_active}
                onCheckedChange={(checked) => setFileFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Arquivo Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFileDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFile} disabled={createFile.isPending || updateFile.isPending}>
              {(createFile.isPending || updateFile.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KLRemotaManager;
