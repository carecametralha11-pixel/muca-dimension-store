import logo from '@/assets/logo-muca.png';

const Footer = () => {
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="MUCA" 
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="font-grotesk font-semibold">𝓔𝓼𝓽𝓮𝓵𝓲𝓸 𝓜𝓤𝓒𝓐</span>
          </div>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground text-center">
            Quem manda na net é ele! 1 por todos e todos por 1
          </p>

          {/* Copyright + Developer */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} Estelio MUCA</span>
            <span>•</span>
            <a 
              href="https://wa.me/5514982097244" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Desenvolvido por Mike
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
