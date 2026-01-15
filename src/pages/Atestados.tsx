import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  DollarSign, 
  Home, 
  Briefcase, 
  Shield, 
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  Star,
  Zap,
  ExternalLink,
  Eye,
  Stamp,
  MessageCircle,
  MapPin,
  Megaphone,
  TrendingUp,
  Layout,
  BadgeCheck,
  Calculator,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const benefits = [
  {
    icon: DollarSign,
    title: 'Preço Fixo de R$25',
    description: 'Cada atestado custa apenas R$25, não importa a quantidade de dias. O restante é 100% SEU LUCRO!',
  },
  {
    icon: TrendingUp,
    title: 'Você Define o Preço',
    description: 'Você coloca o preço que quiser no atestado. Quanto mais dias, mais você pode cobrar!',
  },
  {
    icon: Clock,
    title: 'Geração Automática',
    description: 'A plataforma gera atestados automaticamente, todos credenciados com assinatura e carimbo.',
  },
  {
    icon: Eye,
    title: 'Prévia antes de Pagar',
    description: 'Visualize o atestado com os dados do cliente antes de confirmar a compra.',
  },
];

const panelFeatures = [
  {
    icon: Layout,
    title: '+20 Matrizes Universais',
    description: 'Acesso a mais de 20 modelos de atestados universais prontos para uso.',
  },
  {
    icon: BadgeCheck,
    title: 'Credenciado',
    description: 'Todos os atestados vêm com assinatura e carimbo autênticos.',
  },
  {
    icon: Zap,
    title: '100% Automático',
    description: 'Sistema gera o atestado instantaneamente após inserir os dados.',
  },
  {
    icon: MapPin,
    title: 'Todas as Cidades',
    description: 'Não achou a matriz? Entre em contato! Temos TODAS disponíveis de todos os estados.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Cadastre-se',
    description: 'Faça seu registro na plataforma e acesse o painel completo.',
  },
  {
    number: '02',
    title: 'Acesse o Painel',
    description: 'Você terá acesso a +20 matrizes universais automáticas e credenciadas.',
  },
  {
    number: '03',
    title: 'Divulgue',
    description: 'Anuncie! A partir de R$10/dia em anúncios você atrai clientes do Brasil todo.',
  },
  {
    number: '04',
    title: 'Lucre',
    description: 'Receba seu lucro instantaneamente via PIX. Você define o preço!',
  },
];

const Atestados = () => {
  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' });
  };

  // State for floating scroll arrow visibility
  const [showFloatingArrow, setShowFloatingArrow] = useState(true);
  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Hide arrow when near bottom (within 200px)
      const nearBottom = scrollTop + windowHeight >= documentHeight - 200;
      setIsNearBottom(nearBottom);
      
      // Show arrow only when there's more content to scroll
      setShowFloatingArrow(!nearBottom && documentHeight > windowHeight + 100);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black overflow-hidden">
      {/* Floating Scroll Arrow - Mobile Only */}
      <AnimatePresence>
        {showFloatingArrow && !isNearBottom && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 z-50 md:hidden"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center cursor-pointer bg-emerald-500/90 backdrop-blur-sm rounded-full p-3 shadow-lg shadow-emerald-500/30"
              onClick={() => window.scrollBy({ top: window.innerHeight * 0.5, behavior: 'smooth' })}
            >
              <ChevronDown className="w-6 h-6 text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] animate-pulse delay-300" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <Navbar />
      
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="py-16 md:py-24 relative min-h-[calc(100vh-56px)] flex flex-col justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-8"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Sistema 100% Automático</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black mb-6"
              >
                <span className="text-white">Revenda Atestados</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                  Por Apenas R$25
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-lg md:text-xl text-white/60 mb-4 max-w-2xl mx-auto"
              >
                Preço fixo de R$25 por atestado, independente da quantidade de dias.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-lg md:text-xl text-emerald-400 font-semibold mb-6 max-w-2xl mx-auto"
              >
                VOCÊ define o preço de venda e fica com TODO o lucro!
              </motion.p>

              {/* Read Full Page Warning */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.5 }}
                className="max-w-lg mx-auto mb-6"
              >
                <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-sm text-amber-300">
                    Quer ser revendedor e ganhar de casa? <strong>Leia a página completa até embaixo!</strong>
                  </span>
                </div>
              </motion.div>

              {/* Price Example */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="max-w-lg mx-auto mb-10"
              >
                <Card className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500/40">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Calculator className="w-5 h-5 text-emerald-400" />
                      <span className="text-white font-semibold">Exemplo de Lucro</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-white/50 mb-1">Você paga</p>
                        <p className="text-xl md:text-2xl font-bold text-red-400">R$25</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">Você vende por</p>
                        <p className="text-xl md:text-2xl font-bold text-white">R$230</p>
                        <p className="text-[10px] text-white/40">(14 dias - preço sugerido)</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50 mb-1">Seu lucro</p>
                        <p className="text-xl md:text-2xl font-bold text-emerald-400">R$205</p>
                      </div>
                    </div>
                    <p className="text-xs text-center text-white/50 mt-3">
                      * O preço de venda é definido por VOCÊ. Quanto mais dias, mais pode cobrar!
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <a href="https://facilatestado.site/auth?ref=K89CZ6JV" target="_blank" rel="noopener noreferrer">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold px-8 py-6 text-lg shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:scale-105"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Acessar Painel
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-3 gap-6 mt-12 max-w-md mx-auto"
              >
                {[
                  { value: 'R$25', label: 'Preço Fixo' },
                  { value: '+20', label: 'Matrizes' },
                  { value: '24/7', label: 'Suporte' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
                    <p className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Animated Scroll Arrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
            onClick={scrollToContent}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs text-white/50">Role para ver mais</span>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <ChevronDown className="w-5 h-5 text-emerald-400" />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Por Que Escolher Nossa Plataforma?
              </h2>
              <p className="text-white/60">Vantagens exclusivas para revendedores</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all hover:-translate-y-2 h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                        <benefit.icon className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                      <p className="text-sm text-white/60">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Your Profit Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent" />
                
                <CardContent className="p-8 md:p-12 relative">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 mb-4">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-green-300">Seu Lucro, Suas Regras</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      VOCÊ é Quem Define o Preço!
                    </h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80">
                          <span className="text-white font-semibold">Preço fixo de R$25</span> - esse é o único custo que você paga
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80">
                          <span className="text-white font-semibold">Você coloca o preço</span> que quiser no atestado para o cliente
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80">
                          <span className="text-white font-semibold">Mais dias = mais valor</span> - atestados de 14 dias valem mais que de 3 dias
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80">
                          <span className="text-white font-semibold">Lucro de R$50 a R$200+</span> dependendo do preço que você cobra
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80">
                          <span className="text-white font-semibold">Sem limite de vendas</span> - quanto mais vender, mais lucra
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80">
                          <span className="text-white font-semibold">Recebimento via PIX</span> - você recebe do cliente na hora
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Panel Features Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                O Que Você Recebe no Painel
              </h2>
              <p className="text-white/60">Acesso completo ao sistema automático de atestados</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {panelFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-white/5 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:-translate-y-2 h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                        <feature.icon className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-white/60">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Contact Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 max-w-2xl mx-auto"
            >
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                  <MessageCircle className="w-10 h-10 text-amber-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Não encontrou a matriz que precisa?</h4>
                    <p className="text-sm text-white/60">
                      Entre em contato conosco! Temos TODAS as matrizes disponíveis de todos os estados e cidades do Brasil. 
                      A matriz que você precisa será adicionada ao painel.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Advertising Section - Your Responsibility */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {/* Warning Card - Investment Required */}
              <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/40">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <AlertCircle className="w-6 h-6 text-amber-400" />
                    <span className="text-xl font-bold text-amber-300">TODO SUCESSO REQUER INVESTIMENTO!</span>
                  </div>
                  <p className="text-white/80 text-sm md:text-base">
                    O lucro vem das <strong className="text-amber-300">SUAS vendas</strong>. Se você não divulgar, não terá clientes. 
                    Se não tiver clientes, não terá lucro. <strong className="text-white">Simples assim!</strong>
                  </p>
                </CardContent>
              </Card>

              {/* Main Advertising Card */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
                
                <CardContent className="p-8 md:p-12 relative">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Megaphone className="w-12 h-12 text-blue-400" />
                      </div>
                    </div>
                    
                    <div className="text-center md:text-left">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Sua Parte: Divulgar e Lucrar!
                      </h2>
                      
                      <p className="text-white/70 mb-4">
                        Como revendedor, <span className="text-red-400 font-bold">100% da responsabilidade de divulgar é SUA</span>. 
                        Com apenas <span className="text-blue-400 font-bold">R$10 por dia</span> em 
                        anúncios pagos, você atrai clientes do <span className="text-white font-semibold">Brasil inteiro</span>!
                      </p>

                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
                        <p className="text-red-300 text-sm font-medium">
                          ⚠️ Sem divulgação = Sem clientes = Sem lucro. Nós fornecemos o sistema, você faz as vendas!
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        {[
                          'Facebook Ads',
                          'Instagram Ads',
                          'TikTok Ads',
                          'Grupos WhatsApp',
                        ].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm bg-white/5 px-3 py-1.5 rounded-full text-white/80 border border-white/10">
                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Como Funciona?
              </h2>
              <p className="text-white/60">4 passos simples para começar a lucrar</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className="bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all h-full">
                    <CardContent className="p-6">
                      <div className="text-5xl font-black text-emerald-500/20 mb-4">
                        {step.number}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-white/60">{step.description}</p>
                    </CardContent>
                  </Card>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-emerald-500/30" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Important Info Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30">
                <CardContent className="p-8 md:p-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
                    Resumo do Sistema
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80">
                          <span className="text-white font-semibold">Preço fixo de R$25</span> por atestado, independente da quantidade de dias
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80">
                          <span className="text-white font-semibold">VOCÊ define o preço</span> de venda e fica com 100% do lucro
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80">
                          <span className="text-white font-semibold">+20 matrizes universais</span> prontas no painel
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80">
                          <span className="text-white font-semibold">Geração 100% automática</span> com assinatura e carimbo
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80">
                          <span className="text-white font-semibold">Prévia do atestado</span> com dados do cliente antes de pagar
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80">
                          <span className="text-white font-semibold">Todas as matrizes disponíveis</span> - entre em contato se não encontrar
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80">
                          <span className="text-white font-semibold">R$10/dia em anúncios</span> atrai clientes do Brasil todo
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80">
                          <span className="text-white font-semibold">Suporte 24/7</span> para todas as suas dúvidas
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <Card className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-emerald-500/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
                
                <CardContent className="p-8 md:p-12 text-center relative">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 mb-6">
                    <Stamp className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-300">Atestados Credenciados</span>
                  </div>

                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                    Comece a Lucrar Hoje!
                  </h2>
                  
                  <p className="text-white/60 mb-8 max-w-lg mx-auto">
                    Acesse o painel agora e tenha acesso a +20 matrizes de atestados universais, 
                    100% automáticos e credenciados com assinatura e carimbo.
                  </p>

                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {['R$25 Fixo', 'Você Define o Preço', 'Automático', 'Credenciado'].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-white/80">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {item}
                      </div>
                    ))}
                  </div>

                  <a href="https://facilatestado.site/auth?ref=K89CZ6JV" target="_blank" rel="noopener noreferrer">
                    <Button 
                      size="lg"
                      className="bg-white text-black hover:bg-white/90 font-bold px-10 py-6 text-lg shadow-xl hover:scale-105 transition-all"
                    >
                      Acessar Painel Agora
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Atestados;
