import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Wallet, Menu, X, Home, CreditCard, Plus, GraduationCap, FileText, Search, IdCard, History, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBalance } from '@/hooks/useBalance';
import logo from '@/assets/logo-muca.png';

const Navbar = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const { data: balance = 0 } = useBalance(user?.id);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const SUPPORT_URL = 'https://wa.me/5544996440121';

  const navItems = [
    { to: '/', label: 'Início', icon: Home },
    ...(user ? [
      { to: '/profile?tab=purchases', label: 'Histórico', icon: History },
      { to: '/profile', label: 'Perfil', icon: User },
    ] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo + Developer */}
          <div className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-2.5">
              <img 
                src={logo} 
                alt="MUCA" 
                className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
              />
              <span className="font-grotesk text-base md:text-lg font-bold text-foreground whitespace-nowrap">
                𝓔𝓼𝓽𝓮𝓵𝓲𝓸 𝓜𝓤𝓒𝓐
              </span>
            </Link>
            <span className="text-muted-foreground">•</span>
            <a 
              href="https://wa.me/5514982097244" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Desenvolvido por Mike
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.to + item.label} to={item.to}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-foreground font-medium"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                Suporte
              </Button>
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {/* Balance */}
                <Link to="/add-balance">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors">
                    <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>R$ {balance.toFixed(2)}</span>
                  </div>
                </Link>

                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                )}

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="font-medium">
                  Entrar
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="py-3 space-y-1">
                {user && (
                  <Link to="/add-balance" onClick={handleNavClick}>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary mb-2">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">R$ {balance.toFixed(2)}</span>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                )}

                {navItems.map((item) => (
                  <Link key={item.to + item.label} to={item.to} onClick={handleNavClick}>
                    <Button variant="ghost" className="w-full justify-start">
                      <item.icon className="h-4 w-4 mr-2 text-muted-foreground" />
                      {item.label}
                    </Button>
                  </Link>
                ))}

                <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={handleNavClick}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Headphones className="h-4 w-4 mr-2 text-muted-foreground" />
                    Suporte
                  </Button>
                </a>

                {user && isAdmin && (
                  <Link to="/admin" onClick={handleNavClick}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                      Admin
                    </Button>
                  </Link>
                )}

                {user ? (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                ) : (
                  <Link to="/auth" onClick={handleNavClick}>
                    <Button className="w-full mt-2">
                      Entrar
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
