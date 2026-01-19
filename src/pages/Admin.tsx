import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  Plus, 
  Edit2, 
  Trash2,
  Package,
  TrendingUp,
  DollarSign,
  Loader2,
  ArrowLeft,
  Wallet,
  Menu,
  X,
  History,
  Minus,
  Video,
  Image,
  Play,
  Upload,
  FileText,
  Search,
  ImagePlus,
  MessageCircle,
  Ban,
  UserX,
  Star,
  Download,
  UploadCloud,
  Database,
  ExternalLink,
  Newspaper,
  Car,
  GraduationCap,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useCards, useCreateCard, useUpdateCard, useDeleteCard, useCreateMultipleCards, useDeleteMultipleCards, useDeleteCardsByCategory, useBulkUpdatePrice } from '@/hooks/useCards';
import { CardsBulkManager } from '@/components/admin/CardsBulkManager';
import { useAllCardMixes, useCreateCardMix, useUpdateCardMix, useDeleteCardMix, CardMix } from '@/hooks/useCardMixes';
import { useAllPurchases } from '@/hooks/usePurchases';
import { useAllUsers, useToggleBanUser, useDeleteUser } from '@/hooks/useUsers';
import { useFeedbacks, useDeleteFeedback, useUpdateFeedback, Feedback } from '@/hooks/useFeedbacks';
import { useUpdateBalance } from '@/hooks/useBalance';
import { useAllModuleMedia, useCreateModuleMedia, useUpdateModuleMedia, useDeleteModuleMedia, ModuleMedia, uploadMediaFile, deleteMediaFile } from '@/hooks/useModuleMedia';
import { useAllModuleDescriptions, useUpdateModuleDescription, ModuleDescription } from '@/hooks/useModuleDescriptions';
import { useAllConsultaveis, useCreateConsultavel, useUpdateConsultavel, useDeleteConsultavel, Consultavel, uploadConsultavelImage, deleteConsultavelImage } from '@/hooks/useConsultaveis';
import { useAllConsultavelImages } from '@/hooks/useConsultavelImages';
import { useTotalEarnings, useAllPixPayments, PixPayment } from '@/hooks/usePixPayments';
import { countOptions } from '@/lib/parseConsultaveis';
import { categories } from '@/data/mockData';
import { Card as CardType } from '@/types';
import { toast } from 'sonner';
import logo from '@/assets/logo-muca.png';
import { ConsultavelImagesManager } from '@/components/admin/ConsultavelImagesManager';
import AdminChatPanel from '@/components/admin/AdminChatPanel';
import NewsManager from '@/components/admin/NewsManager';
import AccountRequestsManager from '@/components/admin/AccountRequestsManager';
import { useCreateBackup, useRestoreBackup } from '@/hooks/useBackup';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import KLRemotaManager from '@/components/admin/KLRemotaManager';
import BanManager from '@/components/admin/BanManager';
import ConsultavelPricingManager from '@/components/admin/ConsultavelPricingManager';
import ConsultavelRequestsManager from '@/components/admin/ConsultavelRequestsManager';
import NotificationsManager from '@/components/admin/NotificationsManager';
import InitiateChatManager from '@/components/admin/InitiateChatManager';

const Admin = () => {
  const { user, isAdmin, logout, isLoading: authLoading } = useAuth();
  const { data: cards = [], isLoading: cardsLoading } = useCards();
  const { data: purchases = [], isLoading: purchasesLoading } = useAllPurchases();
  const { data: users = [], isLoading: usersLoading } = useAllUsers();
  const { data: cardMixes = [], isLoading: mixesLoading } = useAllCardMixes();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();
  const createMultipleCards = useCreateMultipleCards();
  const createCardMix = useCreateCardMix();
  const updateCardMix = useUpdateCardMix();
  const deleteCardMix = useDeleteCardMix();
  const updateBalance = useUpdateBalance();
  const { data: allMedia = [], isLoading: mediaLoading } = useAllModuleMedia();
  const createMedia = useCreateModuleMedia();
  const updateMedia = useUpdateModuleMedia();
  const deleteMedia = useDeleteModuleMedia();
  const { data: moduleDescriptions = [], isLoading: descriptionsLoading } = useAllModuleDescriptions();
  const updateModuleDescription = useUpdateModuleDescription();
  const { data: consultaveis = [], isLoading: consultaveisLoading } = useAllConsultaveis();
  const createConsultavel = useCreateConsultavel();
  const updateConsultavel = useUpdateConsultavel();
  const deleteConsultavel = useDeleteConsultavel();
  const { data: totalEarnings = 0 } = useTotalEarnings();
  const { data: pixPayments = [], isLoading: pixLoading } = useAllPixPayments();
  const { data: allConsultavelImages = [] } = useAllConsultavelImages();
  const { data: feedbacks = [], isLoading: feedbacksLoading } = useFeedbacks();
  const banUser = useToggleBanUser();
  const deleteUser = useDeleteUser();
  const deleteFeedback = useDeleteFeedback();
  const updateFeedback = useUpdateFeedback();
  const createBackup = useCreateBackup();
  const restoreBackup = useRestoreBackup();
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  
  // Enable admin notifications
  useAdminNotifications(isAdmin ?? false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'cards' | 'users' | 'history' | 'media' | 'descriptions' | 'consultaveis' | 'sales' | 'support' | 'feedbacks' | 'news' | 'account-requests' | 'kl-remota' | 'bans' | 'notifications'>('dashboard');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [manageImagesConsultavel, setManageImagesConsultavel] = useState<Consultavel | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isMixDialogOpen, setIsMixDialogOpen] = useState(false);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [isConsultavelDialogOpen, setIsConsultavelDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; balance: number } | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'set' | 'subtract'>('add');
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [editingMix, setEditingMix] = useState<CardMix | null>(null);
  const [editingMedia, setEditingMedia] = useState<ModuleMedia | null>(null);
  const [editingDescription, setEditingDescription] = useState<ModuleDescription | null>(null);
  const [editingConsultavel, setEditingConsultavel] = useState<Consultavel | null>(null);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedbackFormData, setFeedbackFormData] = useState({ userName: '', message: '' });
  const [cardSubcategory, setCardSubcategory] = useState<'FULLDADOS' | 'AUXILIAR' | ''>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '' as 'INFO' | 'CONSULTÁVEL' | '',
    subcategory: '' as 'FULLDADOS' | 'AUXILIAR' | '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cpf: '',
    holderName: '',
    cardLevel: '',
    bankName: '',
  });
  const [bulkFormData, setBulkFormData] = useState({
    cardsText: '',
    price: '',
    bankName: '',
    cardLevel: '',
  });
  const [mixFormData, setMixFormData] = useState({
    name: '',
    description: '',
    card_data: '',
    price: '',
    quantity: '',
    is_active: true,
  });
  const [mediaFormData, setMediaFormData] = useState({
    module_name: '',
    title: '',
    description: '',
    media_type: 'video' as 'video' | 'image',
    media_url: '',
    display_order: 0,
    is_active: true,
  });
  const [descriptionFormData, setDescriptionFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
  });
  const [consultavelFormData, setConsultavelFormData] = useState({
    type: 'CT' as 'CT' | 'ST',
    name: '',
    description: '',
    price: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    card_level: '',
    bank_name: '',
    is_active: true,
    display_order: 0,
  });
  const [consultavelImageFile, setConsultavelImageFile] = useState<File | null>(null);
  const [isUploadingConsultavel, setIsUploadingConsultavel] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const moduleOptions = [
    { value: 'kl-remota', label: 'KL Remota' },
    { value: 'nf', label: 'NF' },
    { value: 'consultavel', label: 'Consultável' },
    { value: 'cnh', label: 'CNH' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-portal-green" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const totalRevenue = purchases.reduce((sum, p) => {
    return p.paymentMethod === 'pix' ? sum + p.price : sum;
  }, 0);

  // Calculate consultáveis count
  const consultaveisCT = consultaveis.filter(c => c.type === 'CT').length;
  const consultaveisST = consultaveis.filter(c => c.type === 'ST').length;
  const totalConsultaveis = consultaveis.length;

  // Calculate media by module
  const mediaByModule = {
    'kl-remota': allMedia.filter(m => m.module_name === 'kl-remota').length,
    'nf': allMedia.filter(m => m.module_name === 'nf').length,
    'consultavel': allMedia.filter(m => m.module_name === 'consultavel').length,
    'cnh': allMedia.filter(m => m.module_name === 'cnh').length,
  };

  const stats = [
    { label: 'Total de Cards', value: cards.length, icon: CreditCard, color: 'text-portal-green' },
    { label: 'Usuários', value: users.length, icon: Users, color: 'text-portal-cyan' },
    { label: 'Vendas', value: purchases.length, icon: Package, color: 'text-space-purple' },
    { label: 'Ganhos PIX', value: `R$ ${totalEarnings.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Comissão', value: `R$ 0,00`, icon: DollarSign, color: 'text-yellow-500' },
    { label: 'Consultáveis', value: totalConsultaveis, icon: Search, color: 'text-amber-500' },
    { label: 'Mídias', value: allMedia.length, icon: Video, color: 'text-blue-500' },
  ];

  const parseDescriptionForCardData = (description: string) => {
    const cardNumberMatch = description.match(/\b(\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4})\b/);
    const expiryMatch = description.match(/\b(\d{2}\/\d{2,4})\b/);
    const cvvMatch = description.match(/(?:cvv|cvc|código|codigo|cod)[:\s]*(\d{3,4})/i) || 
                     description.match(/\b(\d{3})\b(?![\d\/])/);
    const cpfMatch = description.match(/\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b/) ||
                     description.match(/(?:cpf)[:\s]*(\d{11})/i);
    const nameMatch = description.match(/(?:nome|titular|name)[:\s]*([A-Za-zÀ-ÿ\s]+?)(?:\n|$|\||,)/i) ||
                      description.match(/\b([A-Z][A-Za-zÀ-ÿ]+\s+[A-Z][A-Za-zÀ-ÿ\s]+)\b/);
    const levelMatch = description.match(/(?:nivel|nível|level|tipo)[:\s]*(gold|platinum|black|infinite|signature|classic|standard|internacional)/i) ||
                       description.match(/\b(gold|platinum|black|infinite|signature|classic|standard|internacional)\b/i);
    const bankMatch = description.match(/(?:banco|bank|bandeira)[:\s]*([A-Za-zÀ-ÿ\s]+?)(?:\n|$|\||,)/i) ||
                      description.match(/\b(nubank|inter|itau|itaú|bradesco|santander|caixa|bb|banco do brasil|c6|next|neon|original|pan|bmg|safra|sicredi|sicoob|picpay)\b/i);
    
    return {
      cardNumber: cardNumberMatch ? cardNumberMatch[1].replace(/[\s\-]/g, '') : '',
      cardExpiry: expiryMatch ? expiryMatch[1] : '',
      cardCvv: cvvMatch ? cvvMatch[1] : '',
      cpf: cpfMatch ? cpfMatch[1].replace(/[.\-]/g, '') : '',
      holderName: nameMatch ? nameMatch[1].trim() : '',
      cardLevel: levelMatch ? levelMatch[1].charAt(0).toUpperCase() + levelMatch[1].slice(1).toLowerCase() : '',
      bankName: bankMatch ? bankMatch[1].trim() : '',
    };
  };

  const handleDescriptionChange = (description: string) => {
    setFormData(prev => {
      const newData = { ...prev, description };
      if (prev.category === 'INFO') {
        const parsed = parseDescriptionForCardData(description);
        if (parsed.cardNumber && !prev.cardNumber) newData.cardNumber = parsed.cardNumber;
        if (parsed.cardExpiry && !prev.cardExpiry) newData.cardExpiry = parsed.cardExpiry;
        if (parsed.cardCvv && !prev.cardCvv) newData.cardCvv = parsed.cardCvv;
        if (parsed.cpf && !prev.cpf) newData.cpf = parsed.cpf;
        if (parsed.holderName && !prev.holderName) newData.holderName = parsed.holderName;
        if (parsed.cardLevel && !prev.cardLevel) newData.cardLevel = parsed.cardLevel;
        if (parsed.bankName && !prev.bankName) newData.bankName = parsed.bankName;
      }
      return newData;
    });
  };

  const handleOpenDialog = (card?: CardType, subcategory?: 'FULLDADOS' | 'AUXILIAR') => {
    if (card) {
      setEditingCard(card);
      setFormData({
        name: card.name,
        description: card.description,
        price: card.price.toString(),
        category: card.category,
        subcategory: card.subcategory || '',
        cardNumber: card.cardNumber || '',
        cardExpiry: card.cardExpiry || '',
        cardCvv: card.cardCvv || '',
        cpf: card.cpf || '',
        holderName: card.holderName || '',
        cardLevel: card.cardLevel || '',
        bankName: card.bankName || '',
      });
    } else {
      setEditingCard(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'INFO',
        subcategory: subcategory || '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        cpf: '',
        holderName: '',
        cardLevel: '',
        bankName: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleOpenBulkDialog = () => {
    setBulkFormData({ cardsText: '', price: '', bankName: '', cardLevel: '' });
    setIsBulkDialogOpen(true);
  };

  const handleOpenMixDialog = (mix?: CardMix) => {
    if (mix) {
      setEditingMix(mix);
      setMixFormData({
        name: mix.name,
        description: mix.description || '',
        card_data: mix.card_data || '',
        price: mix.price.toString(),
        quantity: mix.quantity.toString(),
        is_active: mix.is_active,
      });
    } else {
      setEditingMix(null);
      setMixFormData({
        name: '',
        description: '',
        card_data: '',
        price: '',
        quantity: '',
        is_active: true,
      });
    }
    setIsMixDialogOpen(true);
  };

  // Parse bulk AUXILIAR cards text
  const parseBulkCards = (text: string): { cardNumber: string; cardExpiry: string; cardCvv: string }[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const cards: { cardNumber: string; cardExpiry: string; cardCvv: string }[] = [];
    
    for (const line of lines) {
      // Format: 2306502908656095 | 02/2026 | 582
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        const cardNumber = parts[0].replace(/\D/g, '');
        const cardExpiry = parts[1];
        const cardCvv = parts[2].replace(/\D/g, '');
        
        if (cardNumber.length >= 13 && cardExpiry && cardCvv.length >= 3) {
          cards.push({ cardNumber, cardExpiry, cardCvv });
        }
      }
    }
    
    return cards;
  };

  const handleSaveBulkCards = async () => {
    const parsedCards = parseBulkCards(bulkFormData.cardsText);
    
    if (parsedCards.length === 0) {
      toast.error('Nenhum card válido encontrado. Use o formato: NUMERO | MM/AAAA | CVV');
      return;
    }
    
    if (!bulkFormData.price || parseFloat(bulkFormData.price) <= 0) {
      toast.error('Informe um preço válido');
      return;
    }
    
    const price = parseFloat(bulkFormData.price);
    
    const cardsToCreate = parsedCards.map((card, index) => ({
      name: `Auxiliar #${Date.now()}-${index + 1}`,
      description: `${card.cardNumber.slice(-4)} | ${card.cardExpiry}`,
      price,
      image: '',
      category: 'INFO' as const,
      subcategory: 'AUXILIAR' as const,
      stock: 1,
      cardNumber: card.cardNumber,
      cardExpiry: card.cardExpiry,
      cardCvv: card.cardCvv,
      bankName: bulkFormData.bankName || undefined,
      cardLevel: bulkFormData.cardLevel || undefined,
    }));
    
    try {
      await createMultipleCards.mutateAsync(cardsToCreate);
      setIsBulkDialogOpen(false);
    } catch (error) {
      console.error('Error creating bulk cards:', error);
    }
  };

  const handleSaveMix = async () => {
    if (!mixFormData.name || !mixFormData.price || !mixFormData.quantity) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const mixData = {
      name: mixFormData.name,
      description: mixFormData.description || null,
      card_data: mixFormData.card_data || null,
      price: parseFloat(mixFormData.price),
      quantity: parseInt(mixFormData.quantity),
      is_active: mixFormData.is_active,
      stock: 1,
    };

    try {
      if (editingMix) {
        await updateCardMix.mutateAsync({ id: editingMix.id, ...mixData });
      } else {
        await createCardMix.mutateAsync(mixData);
      }
      setIsMixDialogOpen(false);
    } catch (error) {
      console.error('Error saving mix:', error);
    }
  };

  const handleSaveCard = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.category !== 'INFO' && formData.category !== 'CONSULTÁVEL') {
      toast.error('Selecione uma categoria válida');
      return;
    }

    if (formData.category === 'INFO') {
      if (!formData.cardNumber || formData.cardNumber.length !== 16) {
        toast.error('O número do cartão deve ter 16 dígitos');
        return;
      }
      if (!formData.cardExpiry) {
        toast.error('Informe o vencimento do cartão');
        return;
      }
      if (!formData.cardCvv || formData.cardCvv.length < 3) {
        toast.error('O CVV deve ter pelo menos 3 dígitos');
        return;
      }
    }

    const cardData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: '',
      category: formData.category as 'INFO' | 'CONSULTÁVEL',
      subcategory: formData.category === 'INFO' ? formData.subcategory as 'FULLDADOS' | 'AUXILIAR' | undefined : undefined,
      stock: 1,
      cardNumber: formData.category === 'INFO' ? formData.cardNumber : undefined,
      cardExpiry: formData.category === 'INFO' ? formData.cardExpiry : undefined,
      cardCvv: formData.category === 'INFO' ? formData.cardCvv : undefined,
      cpf: formData.category === 'INFO' && formData.subcategory === 'FULLDADOS' ? formData.cpf : undefined,
      holderName: formData.category === 'INFO' && formData.subcategory === 'FULLDADOS' ? formData.holderName : undefined,
      cardLevel: formData.category === 'INFO' ? formData.cardLevel : undefined,
      bankName: formData.category === 'INFO' ? formData.bankName : undefined,
    };

    if (editingCard) {
      await updateCard.mutateAsync({ id: editingCard.id, ...cardData });
    } else {
      await createCard.mutateAsync(cardData);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteCard = async (id: string) => {
    await deleteCard.mutateAsync(id);
  };

  const handleOpenBalanceDialog = (userItem: { id: string; name: string; balance: number }) => {
    setSelectedUser(userItem);
    setBalanceAmount('');
    setBalanceOperation('add');
    setIsBalanceDialogOpen(true);
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser || !balanceAmount) {
      toast.error('Informe o valor');
      return;
    }

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount)) {
      toast.error('Valor inválido');
      return;
    }

    let newBalance = selectedUser.balance;
    if (balanceOperation === 'add') {
      newBalance = selectedUser.balance + amount;
    } else if (balanceOperation === 'subtract') {
      newBalance = Math.max(0, selectedUser.balance - amount);
    } else {
      newBalance = amount;
    }

    try {
      await updateBalance.mutateAsync({ userId: selectedUser.id, newBalance });
      toast.success('Saldo atualizado com sucesso!');
      setIsBalanceDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao atualizar saldo');
    }
  };

  const getCategoryDescription = (category: string) => {
    const cat = categories.find(c => c.name === category);
    return cat?.description || '';
  };

  const handleOpenMediaDialog = (media?: ModuleMedia) => {
    if (media) {
      setEditingMedia(media);
      setMediaFormData({
        module_name: media.module_name,
        title: media.title,
        description: media.description || '',
        media_type: media.media_type,
        media_url: media.media_url,
        display_order: media.display_order,
        is_active: media.is_active,
      });
    } else {
      setEditingMedia(null);
      setMediaFormData({
        module_name: '',
        title: '',
        description: '',
        media_type: 'video',
        media_url: '',
        display_order: 0,
        is_active: true,
      });
    }
    setSelectedFile(null);
    setIsMediaDialogOpen(true);
  };

  const handleSaveMedia = async () => {
    if (!mediaFormData.module_name || !mediaFormData.title) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // For new media, file is required
    if (!editingMedia && !selectedFile) {
      toast.error('Selecione um arquivo');
      return;
    }

    setIsUploading(true);
    try {
      let mediaUrl = mediaFormData.media_url;

      // Upload file if selected
      if (selectedFile) {
        mediaUrl = await uploadMediaFile(selectedFile, mediaFormData.module_name);
      }

      const mediaData = {
        ...mediaFormData,
        media_url: mediaUrl,
      };

      if (editingMedia) {
        // If new file uploaded for existing media, delete old file
        if (selectedFile && editingMedia.media_url) {
          await deleteMediaFile(editingMedia.media_url);
        }
        await updateMedia.mutateAsync({ id: editingMedia.id, ...mediaData });
        toast.success('Mídia atualizada com sucesso!');
      } else {
        await createMedia.mutateAsync(mediaData);
        toast.success('Mídia adicionada com sucesso!');
      }
      setIsMediaDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error saving media:', error);
      toast.error('Erro ao salvar mídia');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    const media = allMedia.find(m => m.id === id);
    try {
      // Delete file from storage
      if (media?.media_url) {
        await deleteMediaFile(media.media_url);
      }
      await deleteMedia.mutateAsync(id);
      toast.success('Mídia removida com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover mídia');
    }
  };

  const handleOpenDescriptionDialog = (desc: ModuleDescription) => {
    setEditingDescription(desc);
    setDescriptionFormData({
      title: desc.title,
      subtitle: desc.subtitle || '',
      description: desc.description || '',
    });
    setIsDescriptionDialogOpen(true);
  };

  const handleSaveDescription = async () => {
    if (!editingDescription || !descriptionFormData.title) {
      toast.error('Preencha o título');
      return;
    }

    try {
      await updateModuleDescription.mutateAsync({
        id: editingDescription.id,
        title: descriptionFormData.title,
        subtitle: descriptionFormData.subtitle || null,
        description: descriptionFormData.description || null,
      });
      toast.success('Descrição atualizada com sucesso!');
      setIsDescriptionDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao atualizar descrição');
    }
  };

  const handleOpenConsultavelDialog = (consultavel?: Consultavel) => {
    if (consultavel) {
      setEditingConsultavel(consultavel);
      setConsultavelFormData({
        type: consultavel.type,
        name: consultavel.name,
        description: consultavel.description || '',
        price: consultavel.price.toString(),
        card_number: consultavel.card_number || '',
        card_expiry: consultavel.card_expiry || '',
        card_cvv: consultavel.card_cvv || '',
        card_level: consultavel.card_level || '',
        bank_name: consultavel.bank_name || '',
        is_active: consultavel.is_active,
        display_order: consultavel.display_order,
      });
    } else {
      setEditingConsultavel(null);
      setConsultavelFormData({
        type: 'CT',
        name: '',
        description: '',
        price: '',
        card_number: '',
        card_expiry: '',
        card_cvv: '',
        card_level: '',
        bank_name: '',
        is_active: true,
        display_order: 0,
      });
    }
    setConsultavelImageFile(null);
    setIsConsultavelDialogOpen(true);
  };

  const handleSaveConsultavel = async () => {
    if (!consultavelFormData.card_number || consultavelFormData.card_number.length < 6) {
      toast.error('O número do cartão deve ter pelo menos 6 dígitos (BIN)');
      return;
    }
    if (!consultavelFormData.price || parseFloat(consultavelFormData.price) <= 0) {
      toast.error('Informe um preço válido');
      return;
    }

    setIsUploadingConsultavel(true);
    try {
      let imageUrl = editingConsultavel?.image_url || null;

      // Upload new image if selected
      if (consultavelImageFile) {
        // Delete old image if exists
        if (editingConsultavel?.image_url) {
          await deleteConsultavelImage(editingConsultavel.image_url);
        }
        imageUrl = await uploadConsultavelImage(consultavelImageFile, editingConsultavel?.id || Date.now().toString());
      }

      // Generate name from BIN if not provided
      const cardName = consultavelFormData.name || `${consultavelFormData.type} - ${consultavelFormData.card_number.slice(0, 6)}`;

      const data = {
        type: consultavelFormData.type,
        name: cardName,
        description: consultavelFormData.description || null,
        price: parseFloat(consultavelFormData.price),
        is_active: consultavelFormData.is_active,
        display_order: consultavelFormData.display_order,
        image_url: imageUrl,
        card_number: consultavelFormData.card_number,
        card_expiry: consultavelFormData.card_expiry || null,
        card_cvv: consultavelFormData.card_cvv || null,
        card_level: consultavelFormData.card_level || null,
        bank_name: consultavelFormData.bank_name || null,
      };

      if (editingConsultavel) {
        await updateConsultavel.mutateAsync({ id: editingConsultavel.id, ...data });
        toast.success('Consultável atualizada com sucesso!');
      } else {
        await createConsultavel.mutateAsync(data);
        toast.success('Consultável criada com sucesso!');
      }
      setIsConsultavelDialogOpen(false);
      setConsultavelImageFile(null);
    } catch (error) {
      toast.error('Erro ao salvar consultável');
    } finally {
      setIsUploadingConsultavel(false);
    }
  };

  const handleDeleteConsultavel = async (id: string) => {
    const consultavel = consultaveis.find(c => c.id === id);
    try {
      // Delete image if exists
      if (consultavel?.image_url) {
        await deleteConsultavelImage(consultavel.image_url);
      }
      await deleteConsultavel.mutateAsync(id);
      toast.success('Consultável removida com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover consultável');
    }
  };

  // Get user info for purchases
  const getUserInfo = (userId: string) => {
    const userItem = users.find(u => u.id === userId);
    return userItem || { name: 'Usuário Desconhecido', email: 'N/A' };
  };

  const [selectedSale, setSelectedSale] = useState<typeof purchases[0] | null>(null);
  const [isSaleDetailOpen, setIsSaleDetailOpen] = useState(false);

  const handleViewSaleDetails = (purchase: typeof purchases[0]) => {
    setSelectedSale(purchase);
    setIsSaleDetailOpen(true);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'cards', label: 'Cards', icon: CreditCard },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'bans', label: 'Banimentos', icon: Ban },
    { id: 'sales', label: 'Vendas', icon: Package },
    { id: 'account-requests', label: 'Contas 99/Uber', icon: Car },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'media', label: 'Mídias', icon: Video },
    { id: 'descriptions', label: 'Descrições', icon: FileText },
    { id: 'consultaveis', label: 'Consultáveis', icon: Search },
    { id: 'kl-remota', label: 'KL Remota', icon: GraduationCap },
    { id: 'news', label: 'Novidades', icon: Newspaper },
    { id: 'feedbacks', label: 'Feedbacks', icon: Star },
    { id: 'support', label: 'Suporte', icon: MessageCircle },
  ];

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="MUCA" className="h-10 w-auto" />
          <div>
            <span className="font-orbitron text-lg font-bold text-portal-green">MUCA</span>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 top-[73px] z-40 bg-background/95 backdrop-blur-sm"
          >
            <motion.nav
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="p-4 space-y-2"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-exo transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-portal-green/20 to-portal-cyan/20 text-portal-green border border-portal-green/30'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
              <div className="pt-4 border-t border-border space-y-2">
                <Link to="/cards" className="block">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para Store
                  </Button>
                </Link>
                <Button variant="ghost" onClick={logout} className="w-full text-destructive hover:text-destructive">
                  Sair
                </Button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r-2 border-border p-6 flex-col min-h-screen">
        <div className="flex items-center gap-3 mb-10">
          <img src={logo} alt="MUCA" className="h-12 w-auto" />
          <div>
            <span className="font-orbitron text-lg font-bold text-portal-green">MUCA</span>
            <p className="text-xs text-muted-foreground">Painel Admin</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-exo transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-portal-green/20 to-portal-cyan/20 text-portal-green border border-portal-green/30'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="space-y-2 mt-auto">
          <Link to="/cards">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Store
            </Button>
          </Link>
          <Button variant="ghost" onClick={logout} className="w-full text-destructive hover:text-destructive">
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 lg:space-y-8"
          >
            <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-foreground">
              Dashboard
            </h1>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:border-portal-green/50 transition-colors">
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex flex-col items-start gap-2">
                        <stat.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${stat.color} opacity-70`} />
                        <div className="min-w-0 w-full">
                          <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                          <p className={`font-orbitron text-lg lg:text-xl font-bold ${stat.color} truncate`}>
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Backup & Restore Section */}
            <Card className="border-2 border-portal-green/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <Download className="h-5 w-5 text-portal-green" />
                  Backup & Restauração
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Backup Rápido (JSON) */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-portal-cyan">Backup Rápido (Produtos e Dados)</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Exporta cards, consultáveis, mídias, feedbacks e compras. <strong>Não inclui logins de usuários.</strong>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={() => createBackup.mutate()}
                      disabled={createBackup.isPending}
                      className="bg-portal-green hover:bg-portal-green/80"
                    >
                      {createBackup.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Fazer Backup Rápido
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      ref={backupFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const data = JSON.parse(event.target?.result as string);
                              if (confirm('Tem certeza que deseja restaurar este backup? Os dados existentes serão atualizados.')) {
                                restoreBackup.mutate(data);
                              }
                            } catch (error) {
                              toast.error('Arquivo de backup inválido');
                            }
                          };
                          reader.readAsText(file);
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                    <Button 
                      variant="outline"
                      onClick={() => backupFileInputRef.current?.click()}
                      disabled={restoreBackup.isPending}
                      className="border-portal-cyan/50 text-portal-cyan hover:bg-portal-cyan/10"
                    >
                      {restoreBackup.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <UploadCloud className="h-4 w-4 mr-2" />
                      )}
                      Importar Backup Rápido
                    </Button>
                  </div>
                </div>

                {/* Backup Completo (Banco de Dados) */}
              </CardContent>
            </Card>

            {/* All Users List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <Users className="h-5 w-5 text-portal-cyan" />
                  Todos os Usuários ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-portal-green" />
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    Nenhum usuário cadastrado.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {users.map((userItem) => (
                      <div
                        key={userItem.id}
                        className="p-3 rounded-lg bg-muted border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm truncate">{userItem.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{userItem.email}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {new Date(userItem.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="font-orbitron font-bold text-portal-green text-sm">
                            R$ {userItem.balance.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Sales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <TrendingUp className="h-5 w-5 text-portal-green" />
                    Vendas Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {purchasesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-portal-green" />
                    </div>
                  ) : purchases.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">
                      Nenhuma venda realizada ainda.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      {purchases.slice(0, 10).map((purchase) => (
                        <div
                          key={purchase.id}
                          className="p-3 rounded-lg bg-muted border border-border flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground text-xs truncate">{purchase.cardName}</p>
                            <p className="text-xs text-muted-foreground">
                              {purchase.cardCategory} • {new Date(purchase.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <p className="font-orbitron font-bold text-portal-green text-xs shrink-0">
                            R$ {purchase.price.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Consultáveis Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Search className="h-5 w-5 text-amber-500" />
                    Resumo Consultáveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                      <p className="text-xs text-muted-foreground">Consultável CT</p>
                      <p className="font-orbitron text-xl font-bold text-amber-500">{consultaveisCT}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20">
                      <p className="text-xs text-muted-foreground">Consultável ST</p>
                      <p className="font-orbitron text-xl font-bold text-orange-500">{consultaveisST}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Media by Module */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <Video className="h-5 w-5 text-blue-500" />
                  Mídias por Módulo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.entries(mediaByModule).map(([module, count]) => (
                    <div key={module} className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                      <p className="text-xs text-muted-foreground capitalize">{module.replace('-', ' ')}</p>
                      <p className="font-orbitron text-xl font-bold text-blue-500">{count}</p>
                      <p className="text-xs text-muted-foreground">mídias</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="font-orbitron text-base lg:text-lg">Resumo por Categoria (Cards)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="p-3 lg:p-4 rounded-lg bg-muted border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span className="font-orbitron font-bold text-foreground text-sm">{cat.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                      <p className="text-portal-green font-bold mt-2 text-sm">
                        {cards.filter(c => c.category === cat.name).length} cards
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <NotificationsManager isAdmin={isAdmin ?? false} />
          </motion.div>
        )}

        {/* Cards Management */}
        {activeTab === 'cards' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-foreground">
                Gerenciar Cards
              </h1>
            </div>

            {/* INFO Category with subcategories */}
            <Card className="border-2 border-portal-cyan/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <span className="text-lg">📋</span>
                  <span className="font-orbitron text-portal-cyan">INFO</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* FULLDADOS Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-orbitron font-bold text-amber-500">FULLDADOS</h3>
                      <p className="text-xs text-muted-foreground">Cards completos com todos os dados do titular</p>
                    </div>
                    <Button size="sm" onClick={() => handleOpenDialog(undefined, 'FULLDADOS')} className="bg-amber-500 hover:bg-amber-600">
                      <Plus className="h-4 w-4 mr-1" />
                      Novo FullDados
                    </Button>
                  </div>
                  
                  {/* Bulk Manager for FULLDADOS */}
                  <CardsBulkManager cards={cards} subcategory="FULLDADOS" />

                  <div className="grid gap-2">
                    {cards.filter(c => c.category === 'INFO' && c.subcategory === 'FULLDADOS').map((card) => (
                      <div key={card.id} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-amber-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{card.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-muted-foreground">****{card.cardNumber?.slice(-4)}</p>
                            {card.bankName && <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{card.bankName}</span>}
                            {card.cardLevel && <span className="text-xs bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">{card.cardLevel}</span>}
                          </div>
                        </div>
                        <p className="font-orbitron text-amber-500 font-bold text-sm">R$ {card.price.toFixed(2)}</p>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(card)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCard(card.id)} disabled={deleteCard.isPending}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {cards.filter(c => c.category === 'INFO' && c.subcategory === 'FULLDADOS').length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhum card FULLDADOS cadastrado.</p>
                    )}
                  </div>
                </div>

                {/* AUXILIAR Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-orbitron font-bold text-portal-cyan">AUXILIAR</h3>
                      <p className="text-xs text-muted-foreground">Cards auxiliares somente com número, validade e CVV</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleOpenBulkDialog} className="border-portal-cyan/50 text-portal-cyan hover:bg-portal-cyan/10">
                        <FileText className="h-4 w-4 mr-1" />
                        Add em Massa
                      </Button>
                      <Button size="sm" onClick={() => handleOpenDialog(undefined, 'AUXILIAR')} className="bg-portal-cyan hover:bg-portal-cyan/80">
                        <Plus className="h-4 w-4 mr-1" />
                        Novo Auxiliar
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bulk Manager for AUXILIAR */}
                  <CardsBulkManager cards={cards} subcategory="AUXILIAR" />

                  <div className="grid gap-2">
                    {cards.filter(c => c.category === 'INFO' && c.subcategory === 'AUXILIAR').map((card) => (
                      <div key={card.id} className="p-3 rounded-lg bg-portal-cyan/10 border border-portal-cyan/30 flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-portal-cyan shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">****{card.cardNumber?.slice(-4)}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-muted-foreground">{card.cardExpiry}</p>
                            {card.bankName && <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{card.bankName}</span>}
                            {card.cardLevel && <span className="text-xs bg-portal-cyan/20 text-portal-cyan px-1.5 py-0.5 rounded">{card.cardLevel}</span>}
                          </div>
                        </div>
                        <p className="font-orbitron text-portal-cyan font-bold text-sm">R$ {card.price.toFixed(2)}</p>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(card)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCard(card.id)} disabled={deleteCard.isPending}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {cards.filter(c => c.category === 'INFO' && c.subcategory === 'AUXILIAR').length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhum card AUXILIAR cadastrado.</p>
                    )}
                  </div>
                </div>

                {/* Cards without subcategory (legacy) */}
                {cards.filter(c => c.category === 'INFO' && !c.subcategory).length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div>
                      <h3 className="font-orbitron font-bold text-muted-foreground">SEM CATEGORIA</h3>
                      <p className="text-xs text-muted-foreground">Cards antigos sem subcategoria definida</p>
                    </div>
                    <div className="grid gap-2">
                      {cards.filter(c => c.category === 'INFO' && !c.subcategory).map((card) => (
                        <div key={card.id} className="p-3 rounded-lg bg-muted border border-border flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{card.name}</p>
                            <p className="text-xs text-muted-foreground">****{card.cardNumber?.slice(-4)}</p>
                          </div>
                          <p className="font-orbitron text-portal-green font-bold text-sm">R$ {card.price.toFixed(2)}</p>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(card)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCard(card.id)} disabled={deleteCard.isPending}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* MIX de AUXILIAR Section */}
            <Card className="border-2 border-space-purple/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-base lg:text-lg">
                    <Package className="h-5 w-5 text-space-purple" />
                    <span className="font-orbitron text-space-purple">MIX de AUXILIAR</span>
                  </div>
                  <Button size="sm" onClick={() => handleOpenMixDialog()} className="bg-space-purple hover:bg-space-purple/80">
                    <Plus className="h-4 w-4 mr-1" />
                    Novo Mix
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">Combos promocionais de cards auxiliares</p>
                
                {mixesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-space-purple" />
                  </div>
                ) : cardMixes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum MIX cadastrado.</p>
                ) : (
                  <div className="grid gap-3">
                    {cardMixes.map((mix) => (
                      <div key={mix.id} className={`p-4 rounded-lg bg-space-purple/10 border border-space-purple/30 ${!mix.is_active ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-orbitron font-bold text-space-purple">{mix.name}</p>
                            {mix.description && <p className="text-xs text-muted-foreground mt-1">{mix.description}</p>}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs bg-space-purple/20 text-space-purple px-2 py-1 rounded">
                                {mix.quantity} cards
                              </span>
                              {!mix.is_active && (
                                <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                                  Inativo
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="font-orbitron text-xl font-bold text-space-purple">R$ {mix.price.toFixed(2)}</p>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenMixDialog(mix)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => deleteCardMix.mutate(mix.id)}
                              disabled={deleteCardMix.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-foreground">
              Usuários & Gerenciamento
            </h1>

            {usersLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-portal-green" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 lg:h-10 lg:w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-exo text-sm">
                  Nenhum usuário cadastrado.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 lg:gap-4">
                {users.map((userItem) => (
                  <Card key={userItem.id} className={`transition-colors ${userItem.isBanned ? 'border-destructive/50 bg-destructive/5' : 'hover:border-portal-green/30'}`}>
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border shrink-0 ${
                            userItem.isBanned 
                              ? 'bg-destructive/20 border-destructive/30' 
                              : 'bg-gradient-to-br from-portal-green/20 to-portal-cyan/20 border-portal-green/30'
                          }`}>
                            <Users className={`h-5 w-5 lg:h-6 lg:w-6 ${userItem.isBanned ? 'text-destructive' : 'text-portal-green'}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-orbitron font-bold text-foreground text-sm truncate">{userItem.name}</h3>
                              {userItem.isBanned && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-destructive/20 text-destructive rounded">BANIDO</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{userItem.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center flex-wrap justify-between sm:justify-end gap-2">
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-portal-green/10 border border-portal-green/30">
                            <Wallet className="h-4 w-4 text-portal-green" />
                            <span className="font-orbitron text-sm font-bold text-portal-green">
                              R$ {userItem.balance.toFixed(2)}
                            </span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenBalanceDialog(userItem)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Saldo</span>
                          </Button>
                          <Button 
                            variant={userItem.isBanned ? "default" : "outline"}
                            size="sm"
                            className={userItem.isBanned ? 'bg-portal-green hover:bg-portal-green/80' : 'text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/10'}
                            onClick={() => banUser.mutate({ userId: userItem.id, ban: !userItem.isBanned })}
                            disabled={banUser.isPending}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            {userItem.isBanned ? 'Desbanir' : 'Banir'}
                          </Button>
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja EXCLUIR permanentemente o usuário "${userItem.name}"? Esta ação não pode ser desfeita.`)) {
                                deleteUser.mutate(userItem.id);
                              }
                            }}
                            disabled={deleteUser.isPending}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Excluir</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Sales Detailed View */}
        {activeTab === 'sales' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-foreground">
              Vendas Detalhadas
            </h1>

            <p className="text-muted-foreground text-sm">
              Visualize todas as vendas realizadas, dados do produto vendido e informações do cliente.
            </p>

            {purchasesLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-portal-green" />
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 lg:h-10 lg:w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-exo text-sm">
                  Nenhuma venda realizada ainda.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {purchases.map((purchase) => {
                  const userInfo = getUserInfo(purchase.userId);
                  return (
                    <Card key={purchase.id} className="hover:border-portal-green/30 transition-colors">
                      <CardContent className="p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Product Info */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-portal-green/10 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-portal-green" />
                              </div>
                              <div>
                                <h3 className="font-orbitron font-bold text-foreground">{purchase.cardName}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {purchase.cardCategory} • {purchase.cardLevel || 'N/A'} • {purchase.bankName || 'N/A'}
                                </p>
                              </div>
                            </div>

                            {/* Customer Info */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                              <Users className="h-4 w-4 text-portal-cyan shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{userInfo.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{userInfo.email}</p>
                              </div>
                            </div>

                            {/* Card Data Preview */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                              <div className="p-2 rounded bg-muted">
                                <span className="text-muted-foreground">Número:</span>
                                <p className="font-mono">****{purchase.cardNumber?.slice(-4) || 'N/A'}</p>
                              </div>
                              <div className="p-2 rounded bg-muted">
                                <span className="text-muted-foreground">Validade:</span>
                                <p className="font-mono">{purchase.cardExpiry || 'N/A'}</p>
                              </div>
                              <div className="p-2 rounded bg-muted">
                                <span className="text-muted-foreground">CVV:</span>
                                <p className="font-mono">{purchase.cardCvv || 'N/A'}</p>
                              </div>
                              <div className="p-2 rounded bg-muted">
                                <span className="text-muted-foreground">Pagamento:</span>
                                <p>{purchase.paymentMethod === 'balance' ? 'Saldo' : 'PIX'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <p className="font-orbitron text-xl font-bold text-portal-green">
                              R$ {purchase.price.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(purchase.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewSaleDetails(purchase)}
                            >
                              <Search className="h-4 w-4 mr-1" />
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-foreground">
              Histórico Geral
            </h1>

            {(purchasesLoading || pixLoading) ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-portal-green" />
              </div>
            ) : (purchases.length === 0 && pixPayments.filter(p => p.status === 'approved').length === 0) ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <History className="h-8 w-8 lg:h-10 lg:w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-exo text-sm">
                  Nenhuma transação realizada ainda.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Sales Section */}
                <div>
                  <h2 className="font-orbitron text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5 text-portal-green" />
                    Vendas ({purchases.length})
                  </h2>
                  {purchases.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">Nenhuma venda realizada.</p>
                  ) : (
                    <div className="grid gap-4">
                      {purchases.map((purchase) => {
                        const purchaseUser = users.find(u => u.id === purchase.userId);
                        return (
                          <Card key={purchase.id} className="hover:border-portal-green/30 transition-colors">
                            <CardContent className="p-4 lg:p-5">
                              {/* Header with buyer info */}
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 pb-3 border-b border-border">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-foreground">
                                      {purchaseUser?.name || 'Usuário não encontrado'}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                      {purchaseUser?.email || purchase.userId.slice(0, 8) + '...'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-orbitron font-bold text-portal-green text-lg">
                                    R$ {purchase.price.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {purchase.paymentMethod === 'balance' ? '💰 Saldo' : '📱 PIX'}
                                  </p>
                                </div>
                              </div>

                              {/* Product Info */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-semibold text-foreground">{purchase.cardName}</span>
                                  <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                                    {purchase.cardCategory}
                                  </span>
                                </div>

                                {/* Card Data - Only show if available */}
                                {(purchase.cardNumber || purchase.holderName || purchase.bankName) && (
                                  <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Dados do Produto</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {purchase.cardNumber && (
                                        <div>
                                          <span className="text-muted-foreground">Número:</span>
                                          <span className="ml-2 font-mono text-foreground">
                                            {purchase.cardNumber.slice(0, 4)}****{purchase.cardNumber.slice(-4)}
                                          </span>
                                        </div>
                                      )}
                                      {purchase.cardExpiry && (
                                        <div>
                                          <span className="text-muted-foreground">Validade:</span>
                                          <span className="ml-2 font-mono text-foreground">{purchase.cardExpiry}</span>
                                        </div>
                                      )}
                                      {purchase.holderName && (
                                        <div className="col-span-2">
                                          <span className="text-muted-foreground">Titular:</span>
                                          <span className="ml-2 text-foreground">{purchase.holderName}</span>
                                        </div>
                                      )}
                                      {purchase.bankName && (
                                        <div>
                                          <span className="text-muted-foreground">Banco:</span>
                                          <span className="ml-2 text-foreground">{purchase.bankName}</span>
                                        </div>
                                      )}
                                      {purchase.cardLevel && (
                                        <div>
                                          <span className="text-muted-foreground">Nível:</span>
                                          <span className="ml-2 text-foreground">{purchase.cardLevel}</span>
                                        </div>
                                      )}
                                      {purchase.cpf && (
                                        <div>
                                          <span className="text-muted-foreground">CPF:</span>
                                          <span className="ml-2 font-mono text-foreground">
                                            ***{purchase.cpf.slice(-4)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Description if exists */}
                                {purchase.description && (
                                  <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                                    {purchase.description}
                                  </p>
                                )}
                              </div>

                              {/* Footer with date/time */}
                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                                <span className="text-xs text-muted-foreground">
                                  ID: {purchase.id.slice(0, 8)}...
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  📅 {new Date(purchase.createdAt).toLocaleDateString('pt-BR')} às {new Date(purchase.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Balance Additions Section */}
                <div>
                  <h2 className="font-orbitron text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-portal-cyan" />
                    Adições de Saldo ({pixPayments.filter(p => p.status === 'approved').length})
                  </h2>
                  {pixPayments.filter(p => p.status === 'approved').length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">Nenhuma adição de saldo realizada.</p>
                  ) : (
                    <div className="grid gap-3">
                      {pixPayments.filter(p => p.status === 'approved').map((payment) => (
                        <Card key={payment.id} className="hover:border-portal-cyan/30 transition-colors border-portal-cyan/20">
                          <CardContent className="p-3 lg:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="font-orbitron font-bold text-foreground text-sm">Recarga PIX</h3>
                                <p className="text-xs text-muted-foreground">
                                  Usuário: {payment.user_id.slice(0, 8)}...
                                </p>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3">
                                <p className="font-orbitron font-bold text-portal-cyan text-sm">
                                  + R$ {Number(payment.amount).toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {payment.paid_at 
                                    ? new Date(payment.paid_at).toLocaleDateString('pt-BR')
                                    : new Date(payment.created_at).toLocaleDateString('pt-BR')
                                  }
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Media Management */}
        {activeTab === 'media' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-foreground">
                Gerenciar Mídias
              </h1>
              <Button onClick={() => handleOpenMediaDialog()} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nova Mídia
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {moduleOptions.map(mod => (
                <div key={mod.value} className="p-3 lg:p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Video className="h-5 w-5 text-primary" />
                    <span className="font-orbitron font-bold text-foreground text-sm">{mod.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {allMedia.filter(m => m.module_name === mod.value).length} mídias cadastradas
                  </p>
                </div>
              ))}
            </div>

            {mediaLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-portal-green" />
              </div>
            ) : allMedia.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Video className="h-8 w-8 lg:h-10 lg:w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-exo text-sm">
                  Nenhuma mídia cadastrada. Clique em "Nova Mídia" para adicionar.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 lg:gap-4">
                {allMedia.map((media) => (
                  <Card key={media.id} className="hover:border-portal-green/30 transition-colors">
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-portal-green/20 to-portal-cyan/20 flex items-center justify-center border border-portal-green/30 shrink-0">
                          {media.media_type === 'video' ? (
                            <Play className="h-5 w-5 lg:h-6 lg:w-6 text-portal-green" />
                          ) : (
                            <Image className="h-5 w-5 lg:h-6 lg:w-6 text-portal-green" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-orbitron font-bold text-foreground text-sm truncate">{media.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            <span className="text-primary">
                              {moduleOptions.find(m => m.value === media.module_name)?.label || media.module_name}
                            </span>
                            {' • '}
                            {media.media_type === 'video' ? 'Vídeo' : 'Imagem'}
                            {!media.is_active && ' • Inativo'}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenMediaDialog(media)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteMedia(media.id)}
                            disabled={deleteMedia.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Descriptions Management */}
        {activeTab === 'descriptions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-foreground">
                Descrições dos Módulos
              </h1>
            </div>

            <p className="text-muted-foreground text-sm">
              Edite as descrições que aparecem nas páginas dos cursos. As alterações são aplicadas em tempo real.
            </p>

            {descriptionsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-portal-green" />
              </div>
            ) : moduleDescriptions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 lg:h-10 lg:w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-exo text-sm">
                  Nenhum módulo cadastrado.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {moduleDescriptions.map((desc) => (
                  <Card key={desc.id} className="hover:border-portal-green/30 transition-colors">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs font-semibold bg-portal-green/20 text-portal-green rounded">
                              {desc.module_name}
                            </span>
                          </div>
                          <h3 className="font-orbitron font-bold text-foreground text-lg">{desc.title}</h3>
                          {desc.subtitle && (
                            <p className="text-sm text-muted-foreground">{desc.subtitle}</p>
                          )}
                          {desc.description && (
                            <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
                              <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">
                                {desc.description}
                              </p>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenDescriptionDialog(desc)}
                          className="shrink-0"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Consultáveis Management */}
        {activeTab === 'consultaveis' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-foreground">
                Gerenciar Consultáveis
              </h1>
              <Button onClick={() => handleOpenConsultavelDialog()} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nova Consultável
              </Button>
            </div>

            <p className="text-muted-foreground text-sm mb-6">
              Adicione consultáveis CT ou ST que ficarão disponíveis para os clientes solicitarem.
            </p>

            {/* Requests Manager */}
            <div className="mb-8">
              <ConsultavelRequestsManager 
                onNavigateToChat={(chatId) => {
                  setSelectedChatId(chatId);
                  setActiveTab('support');
                }} 
              />
            </div>

            {/* Pricing Tiers Manager */}
            <div className="mb-8">
              <ConsultavelPricingManager />
            </div>

            {consultaveisLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-portal-green" />
              </div>
            ) : consultaveis.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 lg:h-10 lg:w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-exo text-sm">
                  Nenhuma consultável cadastrada. Clique em "Nova Consultável" para adicionar.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* CT Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="px-2 py-1 text-xs bg-portal-cyan/20 text-portal-cyan rounded">CT</span>
                    Consultável CT
                  </h3>
                  <div className="grid gap-3">
                    {consultaveis.filter(c => c.type === 'CT').map((item) => {
                      const imageCount = allConsultavelImages.filter(img => img.consultavel_id === item.id).length;
                      return (
                        <Card key={item.id} className={`${!item.is_active ? 'opacity-50' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Image Preview */}
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="w-16 h-16 rounded-lg object-cover border border-border shrink-0"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border border-border shrink-0">
                                  <Image className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-medium">{item.name}</p>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs bg-portal-cyan/20 text-portal-cyan px-2 py-1 rounded">
                                      {countOptions(item.description)} opções
                                    </span>
                                    <span className="text-xs bg-portal-green/20 text-portal-green px-2 py-1 rounded flex items-center gap-1">
                                      <Image className="h-3 w-3" />
                                      {imageCount}
                                    </span>
                                  </div>
                                </div>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-line mt-1">{item.description}</p>
                                )}
                                {imageCount === 0 && (
                                  <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                                    <Upload className="h-3 w-3" />
                                    Sem imagens cadastradas
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-portal-green hover:text-portal-green"
                                  onClick={() => setManageImagesConsultavel(item)}
                                  title="Gerenciar imagens"
                                >
                                  <ImagePlus className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenConsultavelDialog(item)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteConsultavel(item.id)}
                                  disabled={deleteConsultavel.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {consultaveis.filter(c => c.type === 'CT').length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhuma consultável CT cadastrada.</p>
                    )}
                  </div>
                </div>

                {/* ST Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="px-2 py-1 text-xs bg-space-purple/20 text-space-purple rounded">ST</span>
                    Consultável ST
                  </h3>
                  <div className="grid gap-3">
                    {consultaveis.filter(c => c.type === 'ST').map((item) => {
                      const imageCount = allConsultavelImages.filter(img => img.consultavel_id === item.id).length;
                      return (
                        <Card key={item.id} className={`${!item.is_active ? 'opacity-50' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Image Preview */}
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="w-16 h-16 rounded-lg object-cover border border-border shrink-0"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border border-border shrink-0">
                                  <Image className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-medium">{item.name}</p>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs bg-space-purple/20 text-space-purple px-2 py-1 rounded">
                                      {countOptions(item.description)} opções
                                    </span>
                                    <span className="text-xs bg-portal-green/20 text-portal-green px-2 py-1 rounded flex items-center gap-1">
                                      <Image className="h-3 w-3" />
                                      {imageCount}
                                    </span>
                                  </div>
                                </div>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-line mt-1">{item.description}</p>
                                )}
                                {imageCount === 0 && (
                                  <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                                    <Upload className="h-3 w-3" />
                                    Sem imagens cadastradas
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-portal-green hover:text-portal-green"
                                  onClick={() => setManageImagesConsultavel(item)}
                                  title="Gerenciar imagens"
                                >
                                  <ImagePlus className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenConsultavelDialog(item)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteConsultavel(item.id)}
                                  disabled={deleteConsultavel.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {consultaveis.filter(c => c.type === 'ST').length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhuma consultável ST cadastrada.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Bans Management */}
        {activeTab === 'bans' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-foreground">
              Gerenciar Banimentos
            </h1>
            <p className="text-muted-foreground text-sm">
              Configure a mensagem de banimento com voz e gerencie usuários banidos.
            </p>
            <BanManager />
          </motion.div>
        )}


        {activeTab === 'support' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-foreground">
              Suporte ao Cliente
            </h1>
            <p className="text-muted-foreground text-sm">
              Gerencie as conversas de suporte com os clientes em tempo real.
            </p>
            
            {/* Initiate Chat with Any User */}
            <InitiateChatManager />
            
            {/* Chat Panel */}
            <AdminChatPanel initialChatId={selectedChatId} />
          </motion.div>
        )}

        {/* KL Remota Management */}
        {activeTab === 'kl-remota' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-foreground">
              Gerenciar KL Remota
            </h1>
            <p className="text-muted-foreground text-sm">
              Configure o preço, adicione arquivos e vídeos que serão liberados após o pagamento.
            </p>
            <KLRemotaManager />
          </motion.div>
        )}

        {/* Feedbacks Management */}
        {activeTab === 'feedbacks' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-foreground">
              Feedbacks dos Clientes
            </h1>
            <p className="text-muted-foreground text-sm">
              Gerencie os feedbacks públicos dos clientes.
            </p>

            {feedbacksLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-portal-green" />
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 lg:h-10 lg:w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-exo text-sm">
                  Nenhum feedback ainda.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {feedbacks.map((feedback) => (
                  <Card key={feedback.id} className="hover:border-yellow-500/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{feedback.user_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(feedback.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{feedback.message}</p>
                          {feedback.image_url && (
                            <img src={feedback.image_url} alt="Feedback" className="w-full max-w-xs h-32 object-cover rounded-lg" />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingFeedback(feedback);
                              setFeedbackFormData({ 
                                userName: feedback.user_name, 
                                message: feedback.message 
                              });
                              setIsFeedbackDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteFeedback.mutate(feedback.id)}
                            disabled={deleteFeedback.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6"
          >
            <NewsManager />
          </motion.div>
        )}

        {/* Account Requests Tab */}
        {activeTab === 'account-requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6"
          >
            <AccountRequestsManager />
          </motion.div>
        )}
      </main>

      {/* Card Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-orbitron">
              {editingCard ? 'Editar Card' : `Novo Card ${formData.subcategory || ''}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {formData.subcategory === 'FULLDADOS' && (
              <Input
                placeholder="Nome do Card *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            )}
            
            {formData.category === 'INFO' && (
              <Select
                value={formData.subcategory}
                onValueChange={(value: 'FULLDADOS' | 'AUXILIAR') => setFormData({ ...formData, subcategory: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo *" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULLDADOS">📋 FULLDADOS</SelectItem>
                  <SelectItem value="AUXILIAR">💳 AUXILIAR</SelectItem>
                </SelectContent>
              </Select>
            )}

            {formData.subcategory === 'FULLDADOS' && (
              <Textarea
                placeholder="Descrição do Card (cole os dados aqui)"
                value={formData.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                rows={3}
              />
            )}

            {formData.category === 'INFO' && formData.subcategory && (
              <div className="space-y-3 p-4 rounded-lg bg-portal-cyan/5 border border-portal-cyan/30">
                <p className="text-xs text-portal-cyan font-semibold">Dados do Cartão</p>
                <Input
                  placeholder="Número do Cartão (16 dígitos) *"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                  maxLength={16}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Vencimento *"
                    value={formData.cardExpiry}
                    onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                  />
                  <Input
                    placeholder="CVV *"
                    value={formData.cardCvv}
                    onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    maxLength={4}
                  />
                </div>
                {formData.subcategory === 'FULLDADOS' && (
                  <>
                    <Input
                      placeholder="CPF"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                      maxLength={11}
                    />
                    <Input
                      placeholder="Nome do Titular"
                      value={formData.holderName}
                      onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                    />
                  </>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Nível (ex: Gold, Platinum)"
                    value={formData.cardLevel}
                    onChange={(e) => setFormData({ ...formData, cardLevel: e.target.value })}
                  />
                  <Input
                    placeholder="Banco (ex: Nubank)"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </div>
              </div>
            )}

            <Input
              type="number"
              placeholder="Preço *"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveCard}
              disabled={createCard.isPending || updateCard.isPending}
            >
              {(createCard.isPending || updateCard.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                editingCard ? 'Salvar' : 'Criar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk AUXILIAR Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-orbitron">Adicionar Cards AUXILIAR em Massa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-portal-cyan/10 border border-portal-cyan/30">
              <p className="text-xs text-portal-cyan">Formato: NUMERO | MM/AAAA | CVV (cada linha é um card)</p>
              <p className="text-xs text-muted-foreground mt-1">Exemplo: 2306502908656095 | 02/2026 | 582</p>
            </div>
            <Textarea
              placeholder="Cole os cards aqui, um por linha..."
              value={bulkFormData.cardsText}
              onChange={(e) => setBulkFormData({ ...bulkFormData, cardsText: e.target.value })}
              rows={6}
              className="font-mono text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Banco (ex: Nubank)"
                value={bulkFormData.bankName}
                onChange={(e) => setBulkFormData({ ...bulkFormData, bankName: e.target.value })}
              />
              <Input
                placeholder="Nível (ex: Gold, Platinum)"
                value={bulkFormData.cardLevel}
                onChange={(e) => setBulkFormData({ ...bulkFormData, cardLevel: e.target.value })}
              />
            </div>
            <Input
              type="number"
              placeholder="Preço por card *"
              value={bulkFormData.price}
              onChange={(e) => setBulkFormData({ ...bulkFormData, price: e.target.value })}
            />
            {bulkFormData.cardsText && (
              <p className="text-sm text-muted-foreground">
                Cards detectados: <span className="text-portal-cyan font-bold">{parseBulkCards(bulkFormData.cardsText).length}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveBulkCards} disabled={createMultipleCards.isPending}>
              {createMultipleCards.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar Cards'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mix Dialog */}
      <Dialog open={isMixDialogOpen} onOpenChange={setIsMixDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-orbitron">{editingMix ? 'Editar Mix' : 'Novo Mix de AUXILIAR'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome do Mix *"
              value={mixFormData.name}
              onChange={(e) => setMixFormData({ ...mixFormData, name: e.target.value })}
            />
            <Textarea
              placeholder="Descrição (exibida antes da compra)"
              value={mixFormData.description}
              onChange={(e) => setMixFormData({ ...mixFormData, description: e.target.value })}
              rows={2}
            />
            <Textarea
              placeholder="Dados dos Cards (revelados após a compra) *"
              value={mixFormData.card_data}
              onChange={(e) => setMixFormData({ ...mixFormData, card_data: e.target.value })}
              rows={4}
              className="font-mono text-xs"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Quantidade de Cards *"
                value={mixFormData.quantity}
                onChange={(e) => setMixFormData({ ...mixFormData, quantity: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Preço Total *"
                value={mixFormData.price}
                onChange={(e) => setMixFormData({ ...mixFormData, price: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch checked={mixFormData.is_active} onCheckedChange={(checked) => setMixFormData({ ...mixFormData, is_active: checked })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMixDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveMix} disabled={createCardMix.isPending || updateCardMix.isPending}>
              {(createCardMix.isPending || updateCardMix.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : editingMix ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Balance Dialog */}
      <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-orbitron">
              Editar Saldo
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="font-medium text-foreground">{selectedUser.name}</p>
                <p className="text-sm text-muted-foreground">Saldo atual:</p>
                <p className="font-orbitron text-2xl font-bold text-portal-green">
                  R$ {selectedUser.balance.toFixed(2)}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Operação</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setBalanceOperation('add')}
                    className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                      balanceOperation === 'add'
                        ? 'border-portal-green bg-portal-green/10'
                        : 'border-border hover:border-portal-green/50'
                    }`}
                  >
                    <Plus className={`h-5 w-5 ${balanceOperation === 'add' ? 'text-portal-green' : 'text-muted-foreground'}`} />
                    <span className="text-xs">Adicionar</span>
                  </button>
                  <button
                    onClick={() => setBalanceOperation('subtract')}
                    className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                      balanceOperation === 'subtract'
                        ? 'border-destructive bg-destructive/10'
                        : 'border-border hover:border-destructive/50'
                    }`}
                  >
                    <Minus className={`h-5 w-5 ${balanceOperation === 'subtract' ? 'text-destructive' : 'text-muted-foreground'}`} />
                    <span className="text-xs">Remover</span>
                  </button>
                  <button
                    onClick={() => setBalanceOperation('set')}
                    className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                      balanceOperation === 'set'
                        ? 'border-portal-cyan bg-portal-cyan/10'
                        : 'border-border hover:border-portal-cyan/50'
                    }`}
                  >
                    <Edit2 className={`h-5 w-5 ${balanceOperation === 'set' ? 'text-portal-cyan' : 'text-muted-foreground'}`} />
                    <span className="text-xs">Definir</span>
                  </button>
                </div>
              </div>

              <Input
                type="number"
                placeholder="Valor"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
              />

              {balanceAmount && (
                <p className="text-sm text-muted-foreground">
                  Novo saldo: <span className="text-portal-green font-bold">
                    R$ {(
                      balanceOperation === 'add' 
                        ? selectedUser.balance + parseFloat(balanceAmount || '0')
                        : balanceOperation === 'subtract'
                          ? Math.max(0, selectedUser.balance - parseFloat(balanceAmount || '0'))
                          : parseFloat(balanceAmount || '0')
                    ).toFixed(2)}
                  </span>
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsBalanceDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateBalance}
              disabled={updateBalance.isPending || !balanceAmount}
            >
              {updateBalance.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Dialog */}
      <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-orbitron">
              {editingMedia ? 'Editar Mídia' : 'Nova Mídia'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Select
              value={mediaFormData.module_name}
              onValueChange={(value) => setMediaFormData({ ...mediaFormData, module_name: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Módulo *" />
              </SelectTrigger>
              <SelectContent>
                {moduleOptions.map((mod) => (
                  <SelectItem key={mod.value} value={mod.value}>
                    {mod.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Título *"
              value={mediaFormData.title}
              onChange={(e) => setMediaFormData({ ...mediaFormData, title: e.target.value })}
            />

            <Textarea
              placeholder="Descrição (opcional)"
              value={mediaFormData.description}
              onChange={(e) => setMediaFormData({ ...mediaFormData, description: e.target.value })}
              rows={2}
            />

            <Select
              value={mediaFormData.media_type}
              onValueChange={(value: 'video' | 'image') => setMediaFormData({ ...mediaFormData, media_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Mídia *" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="image">Imagem</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <Label htmlFor="media_file">
                {mediaFormData.media_type === 'video' ? 'Arquivo de Vídeo *' : 'Arquivo de Imagem *'}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="media_file"
                  type="file"
                  accept={mediaFormData.media_type === 'video' ? 'video/*' : 'image/*'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                    }
                  }}
                  className="cursor-pointer"
                />
              </div>
              {selectedFile && (
                <p className="text-xs text-portal-green flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  {selectedFile.name}
                </p>
              )}
              {editingMedia && !selectedFile && mediaFormData.media_url && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Arquivo atual:</p>
                  <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
                    {mediaFormData.media_type === 'image' ? (
                      <img 
                        src={mediaFormData.media_url} 
                        alt="Preview" 
                        className="w-full max-h-48 object-contain"
                      />
                    ) : (
                      <video 
                        src={mediaFormData.media_url} 
                        controls 
                        className="w-full max-h-48"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione novo arquivo para substituir.
                  </p>
                </div>
              )}
            </div>

            <Input
              type="number"
              placeholder="Ordem de exibição"
              value={mediaFormData.display_order}
              onChange={(e) => setMediaFormData({ ...mediaFormData, display_order: parseInt(e.target.value) || 0 })}
            />

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Ativo (visível para clientes)</Label>
              <Switch
                id="is_active"
                checked={mediaFormData.is_active}
                onCheckedChange={(checked) => setMediaFormData({ ...mediaFormData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsMediaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveMedia}
              disabled={createMedia.isPending || updateMedia.isPending || isUploading}
            >
              {(createMedia.isPending || updateMedia.isPending || isUploading) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                editingMedia ? 'Salvar' : 'Adicionar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Description Dialog */}
      <Dialog open={isDescriptionDialogOpen} onOpenChange={setIsDescriptionDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-orbitron">
              Editar Descrição do Módulo
            </DialogTitle>
          </DialogHeader>

          {editingDescription && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted border border-border">
                <p className="text-xs text-muted-foreground">Módulo</p>
                <p className="font-semibold text-portal-green">{editingDescription.module_name}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc_title">Título *</Label>
                <Input
                  id="desc_title"
                  placeholder="Ex: Curso KL Remota"
                  value={descriptionFormData.title}
                  onChange={(e) => setDescriptionFormData({ ...descriptionFormData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc_subtitle">Subtítulo</Label>
                <Input
                  id="desc_subtitle"
                  placeholder="Ex: Aprenda as técnicas mais avançadas..."
                  value={descriptionFormData.subtitle}
                  onChange={(e) => setDescriptionFormData({ ...descriptionFormData, subtitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc_description">Descrição do Curso</Label>
                <Textarea
                  id="desc_description"
                  placeholder="Digite a descrição completa do curso. Use quebras de linha para organizar. Emojis serão formatados automaticamente."
                  value={descriptionFormData.description}
                  onChange={(e) => setDescriptionFormData({ ...descriptionFormData, description: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Dica: Use emojis no início das linhas (ex: 👨🏾‍💻 Instalação) ou hífens (-) para criar listas formatadas.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDescriptionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveDescription}
              disabled={updateModuleDescription.isPending}
            >
              {updateModuleDescription.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consultável Dialog */}
      <Dialog open={isConsultavelDialogOpen} onOpenChange={setIsConsultavelDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-orbitron">
              {editingConsultavel ? 'Editar Consultável' : 'Nova Consultável'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select
                value={consultavelFormData.type}
                onValueChange={(value: 'CT' | 'ST') => setConsultavelFormData({ ...consultavelFormData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CT">Consultável CT</SelectItem>
                  <SelectItem value="ST">Consultável ST</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Card Data Section */}
            <div className="space-y-3 p-4 rounded-lg bg-portal-cyan/5 border border-portal-cyan/30">
              <p className="text-xs text-portal-cyan font-semibold">Dados do Cartão</p>
              <Input
                placeholder="Número do Cartão (mínimo 6 dígitos) *"
                value={consultavelFormData.card_number}
                onChange={(e) => setConsultavelFormData({ ...consultavelFormData, card_number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                maxLength={16}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Validade (MM/AA)"
                  value={consultavelFormData.card_expiry}
                  onChange={(e) => setConsultavelFormData({ ...consultavelFormData, card_expiry: e.target.value })}
                />
                <Input
                  placeholder="CVV"
                  value={consultavelFormData.card_cvv}
                  onChange={(e) => setConsultavelFormData({ ...consultavelFormData, card_cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  maxLength={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Nível (ex: Gold, Platinum)"
                  value={consultavelFormData.card_level}
                  onChange={(e) => setConsultavelFormData({ ...consultavelFormData, card_level: e.target.value })}
                />
                <Input
                  placeholder="Banco (ex: Nubank)"
                  value={consultavelFormData.bank_name}
                  onChange={(e) => setConsultavelFormData({ ...consultavelFormData, bank_name: e.target.value })}
                />
              </div>
            </div>

            <Input
              type="number"
              placeholder="Preço *"
              value={consultavelFormData.price}
              onChange={(e) => setConsultavelFormData({ ...consultavelFormData, price: e.target.value })}
            />

            <div className="space-y-2">
              <Label htmlFor="cons_name">Nome (opcional)</Label>
              <Input
                id="cons_name"
                placeholder="Gerado automaticamente se vazio"
                value={consultavelFormData.name}
                onChange={(e) => setConsultavelFormData({ ...consultavelFormData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cons_description">Descrição (opcional)</Label>
              <Textarea
                id="cons_description"
                placeholder="Informações adicionais..."
                value={consultavelFormData.description}
                onChange={(e) => setConsultavelFormData({ ...consultavelFormData, description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="cons_image">Foto do Cartão</Label>
              <Input
                id="cons_image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setConsultavelImageFile(file);
                  }
                }}
                className="cursor-pointer"
              />
              {consultavelImageFile && (
                <p className="text-xs text-portal-green flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  {consultavelImageFile.name}
                </p>
              )}
              {editingConsultavel?.image_url && !consultavelImageFile && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Imagem atual:</p>
                  <img 
                    src={editingConsultavel.image_url} 
                    alt="Preview" 
                    className="w-full max-h-32 object-contain rounded-lg border border-border"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="cons_active">Ativo (visível para clientes)</Label>
              <Switch
                id="cons_active"
                checked={consultavelFormData.is_active}
                onCheckedChange={(checked) => setConsultavelFormData({ ...consultavelFormData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsConsultavelDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveConsultavel}
              disabled={createConsultavel.isPending || updateConsultavel.isPending || isUploadingConsultavel}
            >
              {(createConsultavel.isPending || updateConsultavel.isPending || isUploadingConsultavel) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                editingConsultavel ? 'Salvar' : 'Criar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sale Detail Dialog */}
      <Dialog open={isSaleDetailOpen} onOpenChange={setIsSaleDetailOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-orbitron">
              Detalhes da Venda
            </DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4">
              {/* Product Section */}
              <div className="p-4 rounded-lg bg-portal-green/10 border border-portal-green/30">
                <h3 className="font-orbitron font-bold text-portal-green mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Produto Vendido
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="font-medium">{selectedSale.cardName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoria:</span>
                    <span>{selectedSale.cardCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nível:</span>
                    <span>{selectedSale.cardLevel || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Banco:</span>
                    <span>{selectedSale.bankName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço:</span>
                    <span className="font-orbitron font-bold text-portal-green">R$ {selectedSale.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Card Data Section */}
              <div className="p-4 rounded-lg bg-portal-cyan/10 border border-portal-cyan/30">
                <h3 className="font-orbitron font-bold text-portal-cyan mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Dados do Cartão
                </h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Número:</span>
                    <span>{selectedSale.cardNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Validade:</span>
                    <span>{selectedSale.cardExpiry || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CVV:</span>
                    <span>{selectedSale.cardCvv || 'N/A'}</span>
                  </div>
                  {selectedSale.cpf && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CPF:</span>
                      <span>{selectedSale.cpf}</span>
                    </div>
                  )}
                  {selectedSale.holderName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Titular:</span>
                      <span>{selectedSale.holderName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Section */}
              <div className="p-4 rounded-lg bg-space-purple/10 border border-space-purple/30">
                <h3 className="font-orbitron font-bold text-space-purple mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Cliente
                </h3>
                <div className="space-y-2 text-sm">
                  {(() => {
                    const userInfo = getUserInfo(selectedSale.userId);
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nome:</span>
                          <span className="font-medium">{userInfo.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="truncate ml-2">{userInfo.email}</span>
                        </div>
                      </>
                    );
                  })()}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-mono text-xs">{selectedSale.userId}</span>
                  </div>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="p-4 rounded-lg bg-muted border border-border">
                <h3 className="font-orbitron font-bold text-foreground mb-3 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Transação
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID da Venda:</span>
                    <span className="font-mono text-xs">{selectedSale.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pagamento:</span>
                    <span>{selectedSale.paymentMethod === 'balance' ? 'Saldo' : 'PIX'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-portal-green">{selectedSale.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span>{new Date(selectedSale.createdAt).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {selectedSale.description && (
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h3 className="font-orbitron font-bold text-foreground mb-2 text-sm">Descrição</h3>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{selectedSale.description}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaleDetailOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consultavel Images Manager */}
      {manageImagesConsultavel && (
        <ConsultavelImagesManager
          consultavelId={manageImagesConsultavel.id}
          consultavelName={manageImagesConsultavel.name}
          isOpen={!!manageImagesConsultavel}
          onClose={() => setManageImagesConsultavel(null)}
        />
      )}

      {/* Feedback Edit Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-orbitron">Editar Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Usuário</Label>
              <Input
                value={feedbackFormData.userName}
                onChange={(e) => setFeedbackFormData({ ...feedbackFormData, userName: e.target.value })}
                placeholder="Nome do usuário"
              />
            </div>
            <div>
              <Label>Mensagem</Label>
              <Textarea
                value={feedbackFormData.message}
                onChange={(e) => setFeedbackFormData({ ...feedbackFormData, message: e.target.value })}
                placeholder="Mensagem do feedback"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeedbackDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={async () => {
                if (editingFeedback && feedbackFormData.message.trim()) {
                  await updateFeedback.mutateAsync({
                    feedbackId: editingFeedback.id,
                    message: feedbackFormData.message,
                    userName: feedbackFormData.userName
                  });
                  setIsFeedbackDialogOpen(false);
                  setEditingFeedback(null);
                }
              }}
              disabled={updateFeedback.isPending}
            >
              {updateFeedback.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
