import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  QrCode, 
  MapPin, 
  User,
  Calendar,
  Clock,
  Stethoscope,
  Send,
  Shield,
  Sparkles,
  Globe,
  Smartphone,
  Printer,
  MessageCircle,
  IdCard,
  HeartPulse,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '5548996440121';

const features = [
  {
    icon: Printer,
    title: 'Versão Física',
    description: 'Atestado impresso com todos os elementos de autenticidade, pronto para entrega.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: QrCode,
    title: 'Versão Digital',
    description: 'Atestado digital com QR Code contendo todos os dados do paciente para validação.',
    color: 'from-emerald-500 to-green-500',
  },
  {
    icon: Globe,
    title: 'Todos os Estados',
    description: 'Cobertura nacional! Atestados credenciados para todas as cidades e estados do Brasil.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Shield,
    title: '100% Credenciado',
    description: 'Todos os atestados vêm com assinatura e carimbo autênticos de profissionais de saúde.',
    color: 'from-amber-500 to-orange-500',
  },
];

const PedirAtestado = () => {
  const [formData, setFormData] = useState({
    cidade: '',
    estado: '',
    nomeCompleto: '',
    cpf: '',
    cid: '',
    quantidadeDias: '',
    dataAtendimento: '',
    horarioAtendimento: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    if (formatted.length <= 14) {
      setFormData(prev => ({ ...prev, cpf: formatted }));
    }
  };

  const validateForm = () => {
    const { cidade, estado, nomeCompleto, cpf, cid, quantidadeDias, dataAtendimento, horarioAtendimento } = formData;
    
    if (!cidade.trim() || cidade.length < 2) {
      toast.error('Por favor, informe a cidade.');
      return false;
    }
    if (!estado.trim() || estado.length < 2) {
      toast.error('Por favor, informe o estado.');
      return false;
    }
    if (!nomeCompleto.trim() || nomeCompleto.length < 5) {
      toast.error('Por favor, informe o nome completo.');
      return false;
    }
    if (!cpf.trim() || cpf.replace(/\D/g, '').length !== 11) {
      toast.error('Por favor, informe um CPF válido.');
      return false;
    }
    if (!cid.trim() || cid.length < 2) {
      toast.error('Por favor, informe o CID (sintoma ou doença).');
      return false;
    }
    if (!quantidadeDias.trim() || parseInt(quantidadeDias) < 1) {
      toast.error('Por favor, informe a quantidade de dias.');
      return false;
    }
    if (!dataAtendimento.trim()) {
      toast.error('Por favor, informe a data do atendimento.');
      return false;
    }
    if (!horarioAtendimento.trim()) {
      toast.error('Por favor, informe o horário do atendimento.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    const message = `🏥 *PEDIDO DE ATESTADO MÉDICO*

📍 *Localização:*
• Cidade: ${formData.cidade}
• Estado: ${formData.estado}

👤 *Dados do Paciente:*
• Nome Completo: ${formData.nomeCompleto}
• CPF: ${formData.cpf}

🩺 *Informações do Atestado:*
• CID/Sintoma/Doença: ${formData.cid}
• Quantidade de Dias: ${formData.quantidadeDias} dia(s)
• Data do Atendimento: ${formData.dataAtendimento}
• Horário do Atendimento: ${formData.horarioAtendimento}

_Aguardo o envio dos modelos de atestado disponíveis para minha cidade._`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast.success('Redirecionando para o WhatsApp...');
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[200px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <Navbar />
      
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="py-12 md:py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 mb-6"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">Atestados Profissionais Credenciados</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black mb-6"
              >
                <span className="text-white">Atestados</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-green-400">
                  Físicos & Digitais
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-lg md:text-xl text-white/60 mb-4 max-w-3xl mx-auto"
              >
                Atestados médicos credenciados para <span className="text-emerald-400 font-semibold">todos os estados e cidades do Brasil</span>.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-base md:text-lg text-white/50 mb-8 max-w-2xl mx-auto"
              >
                Versão digital com <span className="text-cyan-400 font-semibold">QR Code</span> contendo todos os dados do paciente para validação instantânea.
              </motion.p>

              {/* Feature Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-all h-full group">
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 group-hover:scale-110 transition-transform`}>
                          <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
                            <feature.icon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">{feature.title}</h3>
                        <p className="text-xs text-white/50">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-8 md:py-16 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
                
                <CardContent className="p-6 md:p-10 relative">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 mb-4">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      Peça Seu Atestado
                    </h2>
                    <p className="text-white/60 text-sm">
                      Preencha os dados abaixo e entraremos em contato via WhatsApp
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Localização */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-white mb-2">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium">Localização</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cidade" className="text-white/70 text-sm">Cidade</Label>
                          <Input
                            id="cidade"
                            name="cidade"
                            placeholder="Ex: São Paulo"
                            value={formData.cidade}
                            onChange={handleInputChange}
                            className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-500"
                            maxLength={50}
                          />
                        </div>
                        <div>
                          <Label htmlFor="estado" className="text-white/70 text-sm">Estado</Label>
                          <Input
                            id="estado"
                            name="estado"
                            placeholder="Ex: SP"
                            value={formData.estado}
                            onChange={handleInputChange}
                            className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-500"
                            maxLength={30}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dados do Paciente */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-white mb-2">
                        <User className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium">Dados do Paciente</span>
                      </div>
                      <div>
                        <Label htmlFor="nomeCompleto" className="text-white/70 text-sm">Nome Completo</Label>
                        <Input
                          id="nomeCompleto"
                          name="nomeCompleto"
                          placeholder="Digite seu nome completo"
                          value={formData.nomeCompleto}
                          onChange={handleInputChange}
                          className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-500"
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cpf" className="text-white/70 text-sm">CPF</Label>
                        <Input
                          id="cpf"
                          name="cpf"
                          placeholder="000.000.000-00"
                          value={formData.cpf}
                          onChange={handleCPFChange}
                          className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Informações do Atestado */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-white mb-2">
                        <Stethoscope className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium">Informações do Atestado</span>
                      </div>
                      <div>
                        <Label htmlFor="cid" className="text-white/70 text-sm">CID (Sintoma ou Doença)</Label>
                        <Input
                          id="cid"
                          name="cid"
                          placeholder="Ex: Gripe, Dor de cabeça, etc."
                          value={formData.cid}
                          onChange={handleInputChange}
                          className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-500"
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantidadeDias" className="text-white/70 text-sm">Quantidade de Dias de Atestado</Label>
                        <Input
                          id="quantidadeDias"
                          name="quantidadeDias"
                          type="number"
                          min="1"
                          max="30"
                          placeholder="Ex: 3"
                          value={formData.quantidadeDias}
                          onChange={handleInputChange}
                          className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="dataAtendimento" className="text-white/70 text-sm">Data do Atendimento</Label>
                          <Input
                            id="dataAtendimento"
                            name="dataAtendimento"
                            type="date"
                            value={formData.dataAtendimento}
                            onChange={handleInputChange}
                            className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-500 [color-scheme:dark]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="horarioAtendimento" className="text-white/70 text-sm">Horário do Atendimento</Label>
                          <Input
                            id="horarioAtendimento"
                            name="horarioAtendimento"
                            type="time"
                            value={formData.horarioAtendimento}
                            onChange={handleInputChange}
                            className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-cyan-500 [color-scheme:dark]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <MessageCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-white/80 mb-1">
                            <span className="text-white font-semibold">Após clicar no botão</span>, você será redirecionado ao nosso WhatsApp.
                          </p>
                          <p className="text-xs text-white/60">
                            Lá enviaremos todos os modelos de atestado credenciados disponíveis para sua cidade e estado!
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold py-6 text-lg shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      {isSubmitting ? 'Redirecionando...' : 'Enviar Pedido via WhatsApp'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-8 flex flex-wrap justify-center gap-4"
              >
                {[
                  { icon: Shield, text: 'Credenciado' },
                  { icon: QrCode, text: 'QR Code Digital' },
                  { icon: Globe, text: 'Todo Brasil' },
                  { icon: Smartphone, text: 'Atendimento Rápido' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-sm text-white/50">
                    <item.icon className="w-4 h-4 text-emerald-400" />
                    {item.text}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PedirAtestado;
