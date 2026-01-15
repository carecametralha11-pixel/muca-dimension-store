import { 
  Car, 
  Bike, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  Shield, 
  Clock, 
  Users, 
  Zap,
  FileX,
  AlertTriangle,
  Banknote,
  MessageCircle,
  Star,
  TrendingUp,
  Smartphone,
  UserCheck,
  Timer,
  Wrench,
  DollarSign,
  Crown,
  Camera,
  FileText,
  Mail,
  Phone,
  CreditCard,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const supplierInfo = {
  name: "Mike",
  experience: "8 anos",
  description: "Fornecedor e referência há 8 anos em Contas 99 e Uber e outros serviços"
};

const documentRequirements = {
  "99": [
    { icon: User, text: "Primeiro Nome", required: true },
    { icon: Camera, text: "Foto do Rosto", required: false, note: "Depende se já teve conta na plataforma" },
    { icon: CreditCard, text: "Placa do Veículo (digitada)", required: true }
  ],
  "uber": [
    { icon: FileText, text: "Foto do RG (Frente e Verso)", required: true },
    { icon: Mail, text: "Email", required: true, note: "NUNCA utilizado na Uber (nem motorista, nem passageiro)" },
    { icon: Phone, text: "Número de Celular", required: true, note: "NUNCA utilizado na Uber (nem motorista, nem passageiro)" },
    { icon: CreditCard, text: "Placa do Veículo (digitada)", required: true }
  ]
};

const benefits = [
  {
    icon: FileX,
    title: "Sem CNH? Sem Problema",
    description: "Criamos contas mesmo para quem não possui CNH válida ou está com ela suspensa"
  },
  {
    icon: AlertTriangle,
    title: "Antecedentes Criminais",
    description: "Pessoas com antecedentes podem trabalhar normalmente com nossas contas"
  },
  {
    icon: Wrench,
    title: "Veículo Atrasado, Antigo ou Leilão",
    description: "Colocamos para rodar com a mesma placa, modelo e cor - não importa a situação!"
  },
  {
    icon: UserCheck,
    title: "No Nome e Facial do Cliente",
    description: "As contas são feitas no nome e na FACIAL do próprio cliente - 100% seguro"
  }
];

const platforms = [
  {
    name: "99 Carro",
    icon: Car,
    color: "from-yellow-500 to-orange-500",
    description: "Transporte de passageiros com carro"
  },
  {
    name: "99 Moto",
    icon: Bike,
    color: "from-yellow-400 to-yellow-600",
    description: "Entregas e transporte de moto"
  },
  {
    name: "Uber Carro",
    icon: Car,
    color: "from-gray-700 to-black",
    description: "Corridas de passageiros com carro"
  },
  {
    name: "Uber Moto",
    icon: Bike,
    color: "from-green-500 to-green-700",
    description: "Mobilidade rápida com motocicletas"
  }
];

const steps = [
  {
    number: "01",
    title: "Entre em Contato",
    description: "Fale conosco pelo WhatsApp e informe qual plataforma deseja (99 ou Uber)"
  },
  {
    number: "02",
    title: "Envie os Documentos",
    description: "Envie os documentos e foto para criação da conta no seu nome e facial"
  },
  {
    number: "03",
    title: "Aguarde a Liberação",
    description: "99: até 1h30 | Uber: até 7 dias úteis (geralmente 1 dia)"
  },
  {
    number: "04",
    title: "Comece a Trabalhar",
    description: "Baixe o app, faça login e comece a ganhar dinheiro!"
  }
];

const faqs = [
  {
    question: "As contas são seguras?",
    answer: "Sim! As contas são criadas no nome e na FACIAL do próprio cliente, garantindo total segurança e legitimidade."
  },
  {
    question: "Quanto tempo demora para a conta ficar pronta?",
    answer: "Contas 99: em até 1 hora e meia você já está na rua trabalhando! Contas Uber: precisam passar pela verificação de segurança, geralmente 1 dia útil, prazo máximo de 7 dias úteis."
  },
  {
    question: "E se meu veículo estiver atrasado ou for de leilão?",
    answer: "Não tem problema! Colocamos seu veículo para rodar com a mesma placa, modelo e cor, independente da situação documental ou origem."
  },
  {
    question: "Posso revender as contas?",
    answer: "Sim! O preço fixo para REVENDA é de R$200 tanto para contas 99 quanto Uber. Você define o valor de venda ao seu cliente e fica com o lucro!"
  },
  {
    question: "Preciso ter CNH válida?",
    answer: "Não! Criamos contas mesmo para quem não tem CNH ou está com ela suspensa/cassada."
  },
  {
    question: "E se eu tiver antecedentes criminais?",
    answer: "Sem problemas! Pessoas com antecedentes podem trabalhar normalmente com nossas contas."
  }
];

const Contas99Uber = () => {
  const scrollToContent = () => {
    window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <Navbar />

      <main className="relative">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Reseller Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-4"
            >
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-green-300 text-sm font-medium">
                <strong>REVENDEDORES:</strong> Preço fixo R$200 para revenda!
              </span>
            </motion.div>

            {/* Warning Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-4 py-2 mb-8"
            >
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 text-sm font-medium">
                Quer trabalhar de motorista? <strong>Leia a página completa!</strong>
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent">
                Contas 99 e Uber
              </span>
            </motion.h1>

            {/* Subtitle with platform types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap justify-center gap-3 mb-6"
            >
              <span className="bg-yellow-500/20 border border-yellow-500/40 rounded-full px-4 py-2 text-yellow-300 font-semibold">
                99 Moto & Carro
              </span>
              <span className="bg-gray-700/50 border border-gray-500/40 rounded-full px-4 py-2 text-gray-300 font-semibold">
                Uber Moto & Carro
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl sm:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto"
            >
              Criamos contas para você trabalhar mesmo com 
              <span className="text-yellow-400 font-semibold"> impedimentos</span>. 
              Sem CNH, com antecedentes ou veículo atrasado - 
              <span className="text-orange-400 font-semibold"> nós resolvemos!</span>
            </motion.p>

            {/* Vehicle info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-8 max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wrench className="w-5 h-5 text-orange-400" />
                <span className="text-orange-300 font-bold">Veículo com Problemas?</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Mesmo se o veículo estiver <strong className="text-orange-400">atrasado, antigo ou de leilão</strong>, 
                colocamos para rodar com a <strong className="text-orange-400">mesma placa, modelo e cor!</strong>
              </p>
            </motion.div>

            {/* Platforms Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto"
            >
              {platforms.map((platform, index) => (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`bg-gradient-to-br ${platform.color} p-4 rounded-2xl shadow-lg`}
                >
                  <platform.icon className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white font-bold text-lg">{platform.name}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-yellow-500/30"
              >
                <Link to="/solicitar-conta">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Solicitar Minha Conta Agora
                </Link>
              </Button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-col items-center cursor-pointer"
              onClick={scrollToContent}
            >
              <span className="text-muted-foreground text-sm mb-2">Role para ver mais</span>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronDown className="w-8 h-8 text-yellow-400" />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Account Info Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-blue-400">Como as Contas</span>{" "}
                <span className="text-cyan-400">São Criadas?</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* 99 Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-3xl p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <span className="text-black font-bold text-2xl">99</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-400">Conta 99</h3>
                    <p className="text-muted-foreground">Moto & Carro</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                    <span className="text-foreground">Feita no <strong>nome e FACIAL do cliente</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Timer className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-foreground">Em até <strong className="text-green-400">1 hora e meia</strong> você está na rua!</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-foreground">Revenda: <strong className="text-green-400">R$200</strong> (preço fixo)</span>
                  </div>
                </div>
              </motion.div>

              {/* Uber Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-700/20 to-gray-900/20 border border-gray-500/30 rounded-3xl p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-600 to-black flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Uber</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-300">Conta Uber</h3>
                    <p className="text-muted-foreground">Moto & Carro</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    <span className="text-foreground">Feita no <strong>nome e FACIAL do cliente</strong></span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Timer className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">
                      Verificação de segurança: <strong className="text-yellow-400">geralmente 1 dia útil</strong>
                      <br />
                      <span className="text-sm text-muted-foreground">(prazo máximo: 7 dias úteis)</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-foreground">Revenda: <strong className="text-green-400">R$200</strong> (preço fixo)</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Supplier Section - Mike */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-3xl p-8 md:p-12 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Fornecedor: <span className="text-purple-400">{supplierInfo.name}</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                {supplierInfo.description}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-full px-6 py-2">
                  <span className="text-purple-300 font-semibold">⭐ {supplierInfo.experience} de experiência</span>
                </div>
                <div className="bg-green-500/20 border border-green-500/30 rounded-full px-6 py-2">
                  <span className="text-green-300 font-semibold">✓ Referência no mercado</span>
                </div>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-full px-6 py-2">
                  <span className="text-blue-300 font-semibold">🔒 Confiável e Seguro</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Required Documents Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-cyan-400">Documentos Necessários</span>{" "}
                <span className="text-foreground">Para Cada Conta</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Veja o que você precisa enviar para criar sua conta. É simples e rápido!
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* 99 Documents */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-3xl p-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <span className="text-black font-bold text-2xl">99</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-400">Conta 99</h3>
                    <p className="text-muted-foreground">Documentos necessários</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {documentRequirements["99"].map((doc, index) => (
                    <div key={index} className="flex items-start gap-4 bg-background/30 rounded-xl p-4">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                        <doc.icon className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{doc.text}</span>
                          {doc.required ? (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Obrigatório</span>
                          ) : (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">Condicional</span>
                          )}
                        </div>
                        {doc.note && (
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {doc.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Uber Documents */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-700/20 to-gray-900/20 border border-gray-500/30 rounded-3xl p-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-600 to-black flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Uber</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-300">Conta Uber</h3>
                    <p className="text-muted-foreground">Documentos necessários</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {documentRequirements["uber"].map((doc, index) => (
                    <div key={index} className="flex items-start gap-4 bg-background/30 rounded-xl p-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center flex-shrink-0">
                        <doc.icon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{doc.text}</span>
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Obrigatório</span>
                        </div>
                        {doc.note && (
                          <p className="text-sm text-red-400/80 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {doc.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* CTA to Request Account */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-cyan-500/30"
              >
                <Link to="/solicitar-conta">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Solicitar Minha Conta Agora
                </Link>
              </Button>
              <p className="text-muted-foreground text-sm mt-4">
                Preencha o formulário e você será redirecionado para o WhatsApp do Mike
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-yellow-400">Sem Burocracia,</span>{" "}
                <span className="text-orange-400">Só Trabalho</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Entendemos que muitas pessoas enfrentam dificuldades para conseguir trabalhar. 
                Por isso, oferecemos soluções para todos os casos.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-yellow-500/50 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <benefit.icon className="w-7 h-7 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-transparent via-yellow-500/5 to-transparent">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Por Que Escolher <span className="text-yellow-400">Nossa Solução?</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30">
                  <Shield className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-3">100% Seguro</h3>
                <p className="text-muted-foreground">
                  Contas feitas no nome e facial do cliente - total segurança e legitimidade
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30">
                  <Clock className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Liberação Rápida</h3>
                <p className="text-muted-foreground">
                  99 em até 1h30 | Uber geralmente em 1 dia útil
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30">
                  <Users className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-3">+5.000 Clientes</h3>
                <p className="text-muted-foreground">
                  Mais de 5 mil pessoas já estão trabalhando com nossas contas
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Reseller Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-3xl p-8 md:p-12"
            >
              <div className="text-center mb-8">
                <DollarSign className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  <span className="text-green-400">Seja um Revendedor</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Ganhe dinheiro revendendo contas 99 e Uber! Preço fixo para revenda.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-background/50 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-yellow-400 font-bold text-xl">99</span>
                  </div>
                  <p className="text-3xl font-bold text-green-400 mb-2">R$200</p>
                  <p className="text-muted-foreground">Preço fixo para revenda</p>
                  <p className="text-sm text-yellow-400 mt-2">Você define o preço de venda!</p>
                </div>

                <div className="bg-background/50 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-300 font-bold text-sm">Uber</span>
                  </div>
                  <p className="text-3xl font-bold text-green-400 mb-2">R$200</p>
                  <p className="text-muted-foreground">Preço fixo para revenda</p>
                  <p className="text-sm text-yellow-400 mt-2">Você define o preço de venda!</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-foreground">Você paga R$200, vende pelo preço que quiser</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-foreground">Todo o lucro é seu - sem comissões</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-foreground">Suporte completo para você e seus clientes</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-foreground">Sem limite de vendas - quanto mais vender, mais ganha</span>
                </div>
              </div>

              <div className="text-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-green-500/30"
                >
                  <a href="https://wa.me/5514982097244?text=Olá%20Mike!%20Quero%20ser%20revendedor%20de%20contas%2099%20e%20Uber." target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Quero Ser Revendedor
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Como <span className="text-yellow-400">Funciona?</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Processo simples e rápido para você começar a trabalhar
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 h-full hover:border-yellow-500/50 transition-all">
                    <span className="text-6xl font-bold text-yellow-500/20 absolute top-4 right-4">
                      {step.number}
                    </span>
                    <h3 className="text-xl font-bold text-foreground mb-2 relative z-10">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground relative z-10">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-3xl p-8 md:p-12 text-center"
            >
              <Banknote className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Investimento que <span className="text-yellow-400">Retorna Rápido</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Com nossa conta, você pode recuperar o investimento em poucos dias de trabalho. 
                Muitos clientes faturam mais de <span className="text-yellow-400 font-bold">R$200 por dia</span> trabalhando 
                com 99 e Uber!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-background/50 rounded-xl p-6">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-green-400">R$200+</p>
                  <p className="text-muted-foreground text-sm">Média diária</p>
                </div>
                <div className="bg-background/50 rounded-xl p-6">
                  <Users className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-yellow-400">+5.000</p>
                  <p className="text-muted-foreground text-sm">Clientes satisfeitos</p>
                </div>
                <div className="bg-background/50 rounded-xl p-6">
                  <Star className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-orange-400">100%</p>
                  <p className="text-muted-foreground text-sm">Satisfação</p>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-yellow-500/30"
              >
                <Link to="/solicitar-conta">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Começar Agora
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-transparent via-yellow-500/5 to-transparent">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Perguntas <span className="text-yellow-400">Frequentes</span>
              </h2>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:border-yellow-500/30 transition-all"
                >
                  <h3 className="text-lg font-bold text-foreground mb-2 flex items-start gap-3">
                    <span className="text-yellow-400">Q:</span>
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground pl-7">
                    <span className="text-green-400 font-semibold">R:</span> {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Pronto para <span className="text-yellow-400">Começar a Trabalhar?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Não perca mais tempo! Entre em contato agora e tenha sua conta pronta rapidamente. 
                99 em até 1h30, Uber geralmente em 1 dia útil.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-yellow-500/30"
                >
                  <Link to="/solicitar-conta">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Solicitar Conta (Cliente)
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10 font-bold text-lg px-8 py-6 rounded-xl"
                >
                  <a href="https://wa.me/5514982097244?text=Olá%20Mike!%20Quero%20ser%20revendedor%20de%20contas%2099%20e%20Uber." target="_blank" rel="noopener noreferrer">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Ser Revendedor (R$200)
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contas99Uber;
