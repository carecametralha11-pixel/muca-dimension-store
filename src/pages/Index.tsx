import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Search, 
  GraduationCap, 
  Banknote, 
  IdCard, 
  ArrowRight,
  Zap,
  Shield,
  Star,
  Users,
  FileText,
  Car,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeedbackSidebar from '@/components/FeedbackSidebar';
import NewsCard from '@/components/NewsCard';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo-muca.png';

const services = [
  {
    title: 'Contas 99 e Uber',
    description: 'Trabalhe mesmo sem CNH ou com impedimentos',
    icon: Car,
    href: '/contas-99-uber',
  },
  {
    title: 'Atestados',
    description: 'Revenda e ganhe dinheiro de casa',
    icon: FileText,
    href: '/atestados',
  },
  {
    title: 'Cards Premium',
    description: 'Cards exclusivos com dados completos e verificados',
    icon: CreditCard,
    href: '/cards',
  },
  {
    title: 'Consultáveis',
    description: 'Consultas CT e ST com várias faixas disponíveis',
    icon: Search,
    href: '/consultavel',
  },
  {
    title: 'KL Remota',
    description: 'Cursos completos sobre acesso remoto',
    icon: GraduationCap,
    href: '/kl-remota',
  },
  {
    title: 'NF',
    description: 'Cédulas premium com detalhes perfeitos',
    icon: Banknote,
    href: '/nf',
  },
  {
    title: 'CNH',
    description: 'Documento idêntico com acesso GOV.BR',
    icon: IdCard,
    href: '/cnh',
  }
];

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-black overflow-hidden">
      {/* Animated Background - Monochrome */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[120px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <Navbar />
      
      {/* Feedback Sidebar - Desktop on right side */}
      <FeedbackSidebar />
      
      <main className="flex-1 relative z-10 lg:mr-[320px]">
        <section className="py-4 md:py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-8 md:mb-12"
              >
                {/* Logo with elegant glow */}
                <div className="relative inline-block mb-4">
                  <div className="absolute -inset-4 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -inset-8 bg-white/5 rounded-full blur-3xl animate-pulse" />
                  <motion.img 
                    src={logo} 
                    alt="Estelio MUCA" 
                    className="relative w-20 h-20 md:w-32 md:h-32 rounded-full object-cover ring-2 ring-white/30 shadow-2xl shadow-white/10"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </div>

                {/* Title - Elegant typography */}
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-3 tracking-tight flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4"
                >
                  <span className="text-white">𝓔𝓼𝓽𝓮𝓵𝓲𝓸</span>
                  <span className="text-white/60">𝓜𝓤𝓒𝓐</span>
                </motion.h1>

                {/* Decorative line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="w-24 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto mb-3"
                />

                {/* Subtitle */}
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-neutral-400 text-sm md:text-lg max-w-2xl mx-auto mb-4 font-light tracking-wide"
                >
                  Plataforma <span className="text-white font-medium">exclusiva</span> de serviços premium
                  <br />
                  <span className="text-neutral-500 text-xs md:text-base">Qualidade incomparável • Entrega instantânea</span>
                </motion.p>

                {/* CTA Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex flex-wrap justify-center gap-3"
                >
                  <a href="https://wa.me/5548996440121" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-white text-black hover:bg-white/90 font-semibold px-6 py-4 text-sm shadow-xl shadow-white/10 transition-all hover:shadow-white/20 hover:scale-105">
                      <Zap className="w-4 h-4 mr-2" />
                      Falar no WhatsApp
                    </Button>
                  </a>
                  <a href="https://chat.whatsapp.com/BF9dIopxJ21GoLozTDdDVq?mode=ems_copy_t" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-white/20 hover:bg-white/10 hover:border-white/40 font-semibold px-6 py-4 text-sm hover:scale-105 transition-all text-white">
                      <Users className="w-4 h-4 mr-2" />
                      Grupo de Referência
                    </Button>
                  </a>
                  {!user && (
                    <Link to="/auth">
                      <Button variant="outline" className="border-white/20 hover:bg-white/10 hover:border-white/40 font-semibold px-6 py-4 text-sm hover:scale-105 transition-all text-white">
                        Criar Conta
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </motion.div>

                {/* Scroll Down Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="mt-4 flex flex-col items-center"
                >
                  <Button
                    onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
                    variant="outline"
                    className="border-white/30 hover:bg-white/10 hover:border-white/50 font-semibold px-8 py-6 text-base transition-all text-white group"
                  >
                    Ver Módulos
                    <motion.div
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                      className="ml-2"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </motion.div>

              {/* News Card */}
              <NewsCard />

              {/* Services Grid */}
              <motion.div
                id="services-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                {/* Section title */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/30" />
                  <Star className="w-4 h-4 text-white/50" />
                  <span className="text-sm font-medium text-white/50 uppercase tracking-[0.3em]">Serviços</span>
                  <Star className="w-4 h-4 text-white/50" />
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/30" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
                  {services.map((service, index) => (
                    <Link key={service.title} to={service.href}>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index + 0.5, duration: 0.5 }}
                        whileHover={{ y: -10, scale: 1.02 }}
                        className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.05] transition-all duration-500 h-full backdrop-blur-sm overflow-hidden"
                      >
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                        </div>
                        
                        {/* Icon */}
                        <div className="relative w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-5 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-white/20 transition-all duration-300">
                          <service.icon className="h-7 w-7 text-white/70 group-hover:text-black transition-colors duration-300" />
                        </div>
                        
                        {/* Content */}
                        <h3 className="relative font-bold text-lg mb-2 text-white">
                          {service.title}
                        </h3>
                        <p className="relative text-sm text-neutral-500 group-hover:text-neutral-400 transition-colors leading-relaxed">
                          {service.description}
                        </p>
                        
                        {/* Arrow */}
                        <div className="relative mt-5 flex items-center">
                          <div className="h-[1px] flex-1 bg-white/0 group-hover:bg-white/20 transition-all duration-300" />
                          <ArrowRight className="w-5 h-5 ml-2 text-white/0 group-hover:text-white transition-all duration-300 group-hover:translate-x-1" />
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="mt-14 pt-10 border-t border-white/10"
              >
                <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
                  {[
                    { icon: CreditCard, value: '500+', label: 'Cards Vendidos' },
                    { icon: Zap, value: '24/7', label: 'Suporte Ativo' },
                    { icon: Shield, value: '100%', label: 'Garantido' }
                  ].map((stat, index) => (
                    <motion.div 
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="text-center group cursor-default"
                    >
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                        <stat.icon className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" />
                      </div>
                      <p className="text-3xl md:text-4xl font-black text-white mb-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
