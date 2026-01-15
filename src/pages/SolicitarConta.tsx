import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Bike,
  Upload,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  CreditCard,
  Mail,
  Phone,
  Camera,
  FileText,
  MessageCircle,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateAccountRequest, uploadAccountImage } from '@/hooks/useAccountRequests';
import { toast } from 'sonner';

type AccountType = '99' | 'Uber' | null;
type VehicleCategory = 'Carro' | 'Moto' | null;

const SolicitarConta = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createRequest = useCreateAccountRequest();
  
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form fields
  const [vehiclePlate, setVehiclePlate] = useState('');
  
  // 99 specific
  const [firstName, setFirstName] = useState('');
  const [hadPreviousAccount, setHadPreviousAccount] = useState<boolean | null>(null);
  const [facePhoto, setFacePhoto] = useState<File | null>(null);
  const [facePhotoPreview, setFacePhotoPreview] = useState<string | null>(null);
  
  // Uber specific
  const [rgFront, setRgFront] = useState<File | null>(null);
  const [rgBack, setRgBack] = useState<File | null>(null);
  const [rgFrontPreview, setRgFrontPreview] = useState<string | null>(null);
  const [rgBackPreview, setRgBackPreview] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const facePhotoRef = useRef<HTMLInputElement>(null);
  const rgFrontRef = useRef<HTMLInputElement>(null);
  const rgBackRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (s: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = () => {
    if (step === 1 && !accountType) {
      toast.error('Selecione o tipo de conta');
      return false;
    }
    if (step === 2 && !vehicleCategory) {
      toast.error('Selecione a categoria do veículo');
      return false;
    }
    if (step === 3) {
      if (!vehiclePlate.trim()) {
        toast.error('Informe a placa do veículo');
        return false;
      }
      if (accountType === '99') {
        if (!firstName.trim()) {
          toast.error('Informe o primeiro nome');
          return false;
        }
      } else {
        if (!email.trim()) {
          toast.error('Informe o email');
          return false;
        }
        if (!phone.trim()) {
          toast.error('Informe o número de telefone');
          return false;
        }
        if (!rgFront) {
          toast.error('Envie a foto do RG frente');
          return false;
        }
        if (!rgBack) {
          toast.error('Envie a foto do RG verso');
          return false;
        }
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const buildWhatsAppMessage = (requestData: {
    accountType: AccountType;
    vehicleCategory: VehicleCategory;
    vehiclePlate: string;
    firstName?: string;
    hadPreviousAccount?: boolean;
    facePhotoUrl?: string;
    rgFrontUrl?: string;
    rgBackUrl?: string;
    email?: string;
    phone?: string;
  }) => {
    let message = `🚗 *NOVA SOLICITAÇÃO DE CONTA*\n\n`;
    message += `📱 *Plataforma:* ${requestData.accountType}\n`;
    message += `🚘 *Categoria:* ${requestData.vehicleCategory}\n`;
    message += `🔢 *Placa:* ${requestData.vehiclePlate}\n\n`;

    if (requestData.accountType === '99') {
      message += `👤 *Primeiro Nome:* ${requestData.firstName}\n`;
      message += `❓ *Já teve conta 99:* ${requestData.hadPreviousAccount ? 'SIM (foto com sorriso)' : 'NÃO (primeira conta)'}\n`;
      if (requestData.facePhotoUrl) {
        message += `📸 *Foto do Rosto:* ${requestData.facePhotoUrl}\n`;
      } else {
        message += `📸 *Foto do Rosto:* Será enviada separadamente\n`;
      }
    } else {
      message += `📧 *Email:* ${requestData.email}\n`;
      message += `📞 *Telefone:* ${requestData.phone}\n`;
      message += `🪪 *RG Frente:* ${requestData.rgFrontUrl}\n`;
      message += `🪪 *RG Verso:* ${requestData.rgBackUrl}\n`;
    }

    message += `\n✅ Solicitação feita pelo site MUCA`;
    
    return encodeURIComponent(message);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    setIsSubmitting(true);

    try {
      let facePhotoUrl: string | undefined;
      let rgFrontUrl: string | undefined;
      let rgBackUrl: string | undefined;

      // Upload images
      if (accountType === '99' && facePhoto) {
        facePhotoUrl = await uploadAccountImage(facePhoto, 'face-photos');
      }

      if (accountType === 'Uber') {
        if (rgFront) {
          rgFrontUrl = await uploadAccountImage(rgFront, 'rg-front');
        }
        if (rgBack) {
          rgBackUrl = await uploadAccountImage(rgBack, 'rg-back');
        }
      }

      // Create request in database
      await createRequest.mutateAsync({
        user_id: user.id,
        account_type: accountType!,
        vehicle_category: vehicleCategory!,
        vehicle_plate: vehiclePlate,
        first_name: accountType === '99' ? firstName : undefined,
        face_photo_url: facePhotoUrl,
        rg_front_url: rgFrontUrl,
        rg_back_url: rgBackUrl,
        email: accountType === 'Uber' ? email : undefined,
        phone: accountType === 'Uber' ? phone : undefined,
      });

      // Build WhatsApp message
      const message = buildWhatsAppMessage({
        accountType,
        vehicleCategory,
        vehiclePlate,
        firstName: accountType === '99' ? firstName : undefined,
        hadPreviousAccount: accountType === '99' ? hadPreviousAccount ?? undefined : undefined,
        facePhotoUrl,
        rgFrontUrl,
        rgBackUrl,
        email: accountType === 'Uber' ? email : undefined,
        phone: accountType === 'Uber' ? phone : undefined,
      });

      // Redirect to WhatsApp
      window.open(`https://wa.me/5514982097244?text=${message}`, '_blank');
      
      // Redirect back
      navigate('/contas-99-uber');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Erro ao enviar solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/contas-99-uber')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Solicitar Conta
              </span>
            </h1>
            <p className="text-muted-foreground">
              Preencha os dados para solicitar sua conta 99 ou Uber
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    s === step
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black'
                      : s < step
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-8 h-1 mx-1 rounded ${
                      s < step ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Select Account Type */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-yellow-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-yellow-400" />
                      Qual conta você deseja?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAccountType('99')}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          accountType === '99'
                            ? 'border-yellow-500 bg-yellow-500/10'
                            : 'border-border hover:border-yellow-500/50'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                          <span className="text-black font-bold text-2xl">99</span>
                        </div>
                        <p className="font-bold text-lg">Conta 99</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pronta em até 1h30
                        </p>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAccountType('Uber')}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          accountType === 'Uber'
                            ? 'border-gray-400 bg-gray-500/10'
                            : 'border-border hover:border-gray-400/50'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-600 to-black flex items-center justify-center mx-auto mb-4">
                          <span className="text-white font-bold text-lg">Uber</span>
                        </div>
                        <p className="font-bold text-lg">Conta Uber</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          1-7 dias úteis
                        </p>
                      </motion.button>
                    </div>

                    <Button
                      onClick={nextStep}
                      disabled={!accountType}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold"
                    >
                      Continuar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Select Vehicle Category */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-yellow-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-yellow-400" />
                      Qual tipo de veículo?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setVehicleCategory('Carro')}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          vehicleCategory === 'Carro'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-border hover:border-blue-500/50'
                        }`}
                      >
                        <Car className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                        <p className="font-bold text-lg">Carro</p>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setVehicleCategory('Moto')}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          vehicleCategory === 'Moto'
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-border hover:border-green-500/50'
                        }`}
                      >
                        <Bike className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <p className="font-bold text-lg">Moto</p>
                      </motion.button>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={prevStep} className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                      </Button>
                      <Button
                        onClick={nextStep}
                        disabled={!vehicleCategory}
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold"
                      >
                        Continuar
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Form Data */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-yellow-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-yellow-400" />
                      Dados para {accountType}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Vehicle Plate - Common for both */}
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4" />
                        Placa do Veículo
                      </Label>
                      <Input
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                        placeholder="ABC1D23"
                        className="uppercase"
                      />
                    </div>

                    {accountType === '99' ? (
                      <>
                        {/* 99 Form */}
                        <div>
                          <Label className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" />
                            Primeiro Nome
                          </Label>
                          <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Digite seu primeiro nome"
                          />
                        </div>

                        {/* Question about previous account */}
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                            Você já teve conta na 99 antes?
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setHadPreviousAccount(true)}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                hadPreviousAccount === true
                                  ? 'border-yellow-500 bg-yellow-500/10'
                                  : 'border-border hover:border-yellow-500/50'
                              }`}
                            >
                              <p className="font-bold">Sim, já tive</p>
                              <p className="text-xs text-muted-foreground mt-1">Preciso de foto com sorriso</p>
                            </motion.button>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setHadPreviousAccount(false)}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                hadPreviousAccount === false
                                  ? 'border-green-500 bg-green-500/10'
                                  : 'border-border hover:border-green-500/50'
                              }`}
                            >
                              <p className="font-bold">Não, primeira vez</p>
                              <p className="text-xs text-muted-foreground mt-1">Foto normal sem sorriso</p>
                            </motion.button>
                          </div>
                        </div>

                        <div>
                          <Label className="flex items-center gap-2 mb-2">
                            <Camera className="w-4 h-4" />
                            Foto do Rosto
                            {hadPreviousAccount === true && (
                              <span className="text-xs text-red-400 font-bold">(COM SORRISO - OBRIGATÓRIA)</span>
                            )}
                            {hadPreviousAccount === false && (
                              <span className="text-xs text-green-400">(Sem sorriso - normal)</span>
                            )}
                            {hadPreviousAccount === null && (
                              <span className="text-xs text-yellow-400">(Selecione acima primeiro)</span>
                            )}
                          </Label>
                          
                          {/* Instructions based on previous account status */}
                          {hadPreviousAccount === true && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                              <p className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                ATENÇÃO: Instruções para quem já teve conta
                              </p>
                              <ul className="text-sm text-foreground space-y-2">
                                <li className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                  <span>Foto <strong className="text-red-400">COM SORRISO</strong> mostrando os dentes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                  <span>Foto <strong className="text-red-400">NÍTIDA</strong> e bem iluminada</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                  <span><strong className="text-red-400">ENCOSTADO NA PAREDE</strong> (fundo liso)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                  <span>Celular <strong className="text-red-400">ESTICADO NA DIREÇÃO E ALTURA DO ROSTO</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                  <span>Olhar <strong className="text-red-400">BEM PARA A BOLA DA CÂMERA</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                  <span>Foto tirada <strong className="text-red-400">POR VOCÊ MESMO</strong> (selfie)</span>
                                </li>
                              </ul>
                            </div>
                          )}
                          
                          {hadPreviousAccount === false && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                              <p className="text-green-400 font-bold text-sm mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Primeira conta - Instruções simples
                              </p>
                              <ul className="text-sm text-foreground space-y-2">
                                <li className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                  <span>Foto <strong className="text-green-400">SEM SORRISO</strong> (expressão neutra)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                  <span>Foto nítida e bem iluminada</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                  <span>Fundo limpo de preferência</span>
                                </li>
                              </ul>
                            </div>
                          )}

                          <div
                            onClick={() => facePhotoRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                              hadPreviousAccount === true 
                                ? 'border-red-500/50 hover:border-red-500' 
                                : 'border-border hover:border-yellow-500/50'
                            }`}
                          >
                            {facePhotoPreview ? (
                              <img
                                src={facePhotoPreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg mx-auto"
                              />
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  Clique para enviar a foto
                                </p>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            ref={facePhotoRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, setFacePhoto, setFacePhotoPreview)}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Uber Form */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4" />
                              RG Frente
                            </Label>
                            <div
                              onClick={() => rgFrontRef.current?.click()}
                              className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-yellow-500/50 transition-colors"
                            >
                              {rgFrontPreview ? (
                                <img
                                  src={rgFrontPreview}
                                  alt="RG Frente"
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                              ) : (
                                <>
                                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                                  <p className="text-xs text-muted-foreground">Frente do RG</p>
                                </>
                              )}
                            </div>
                            <input
                              type="file"
                              ref={rgFrontRef}
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, setRgFront, setRgFrontPreview)}
                            />
                          </div>

                          <div>
                            <Label className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4" />
                              RG Verso
                            </Label>
                            <div
                              onClick={() => rgBackRef.current?.click()}
                              className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-yellow-500/50 transition-colors"
                            >
                              {rgBackPreview ? (
                                <img
                                  src={rgBackPreview}
                                  alt="RG Verso"
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                              ) : (
                                <>
                                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                                  <p className="text-xs text-muted-foreground">Verso do RG</p>
                                </>
                              )}
                            </div>
                            <input
                              type="file"
                              ref={rgBackRef}
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, setRgBack, setRgBackPreview)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="flex items-center gap-2 mb-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </Label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@exemplo.com"
                          />
                          <p className="text-xs text-red-400 mt-1">
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            NUNCA utilizado na Uber (nem motorista, nem passageiro)
                          </p>
                        </div>

                        <div>
                          <Label className="flex items-center gap-2 mb-2">
                            <Phone className="w-4 h-4" />
                            Telefone
                          </Label>
                          <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(11) 99999-9999"
                          />
                          <p className="text-xs text-red-400 mt-1">
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            NUNCA utilizado na Uber (nem motorista, nem passageiro)
                          </p>
                        </div>
                      </>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={prevStep} className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                      </Button>
                      <Button
                        onClick={nextStep}
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold"
                      >
                        Revisar
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Review & Submit */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-green-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      Confirme seus dados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plataforma:</span>
                        <span className="font-bold">{accountType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Categoria:</span>
                        <span className="font-bold">{vehicleCategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Placa:</span>
                        <span className="font-bold">{vehiclePlate}</span>
                      </div>

                      {accountType === '99' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nome:</span>
                            <span className="font-bold">{firstName}</span>
                          </div>
                          {facePhotoPreview && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Foto:</span>
                              <img
                                src={facePhotoPreview}
                                alt="Foto"
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-bold text-sm">{email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Telefone:</span>
                            <span className="font-bold">{phone}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">RG:</span>
                            <div className="flex gap-2">
                              {rgFrontPreview && (
                                <img
                                  src={rgFrontPreview}
                                  alt="RG Frente"
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              {rgBackPreview && (
                                <img
                                  src={rgBackPreview}
                                  alt="RG Verso"
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Supplier Info */}
                    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span className="font-bold text-yellow-400">Fornecedor: Mike</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Você será redirecionado para o WhatsApp do Mike para finalizar a solicitação.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={prevStep} className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Finalizar no WhatsApp
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SolicitarConta;
