import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, ShieldAlert, Fingerprint, Eye, AlertTriangle } from 'lucide-react';

interface BanCheckOverlayProps {
  isVisible: boolean;
  isBanned: boolean;
  onComplete?: () => void;
  banMessage?: string;
}

const BanCheckOverlay: React.FC<BanCheckOverlayProps> = ({ 
  isVisible, 
  isBanned, 
  onComplete,
  banMessage = 'Sua conta foi banida. Acesso negado.'
}) => {
  const [phase, setPhase] = useState<'scanning' | 'result'>('scanning');
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setPhase('scanning');
      setScanProgress(0);

      // Animate scan progress
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);

      // After scanning, show result
      const timer = setTimeout(() => {
        setPhase('result');
        if (!isBanned && onComplete) {
          setTimeout(onComplete, 800);
        }
      }, 1800);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isVisible, isBanned, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center"
        >
          <div className="text-center max-w-md px-6">
            {phase === 'scanning' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* Scanning Animation */}
                <div className="relative w-32 h-32 mx-auto">
                  {/* Outer Ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {/* Middle Ring */}
                  <motion.div
                    className="absolute inset-2 rounded-full border-2 border-primary/50"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Inner Circle with Icon */}
                  <motion.div
                    className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
                    animate={{ 
                      boxShadow: [
                        '0 0 0 0 hsl(var(--primary) / 0.4)',
                        '0 0 0 20px hsl(var(--primary) / 0)',
                        '0 0 0 0 hsl(var(--primary) / 0.4)',
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Fingerprint className="w-12 h-12 text-primary" />
                    </motion.div>
                  </motion.div>

                  {/* Scanning Line */}
                  <motion.div
                    className="absolute inset-0 overflow-hidden rounded-full"
                    style={{ clipPath: 'inset(0 0 0 0)' }}
                  >
                    <motion.div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                </div>

                {/* Text */}
                <div className="space-y-3">
                  <motion.div
                    className="flex items-center justify-center gap-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Scan className="w-5 h-5 text-primary" />
                    <span className="text-lg font-medium text-foreground">
                      Analisando Identidade
                    </span>
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="text-primary"
                    >
                      ...
                    </motion.span>
                  </motion.div>

                  {/* Progress Bar */}
                  <div className="w-48 mx-auto">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary/70"
                        style={{ width: `${scanProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Verificando credenciais...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {isBanned ? (
                  <>
                    {/* Banned Result */}
                    <motion.div
                      className="w-24 h-24 mx-auto rounded-full bg-destructive/20 flex items-center justify-center"
                      animate={{ 
                        boxShadow: [
                          '0 0 0 0 hsl(var(--destructive) / 0.4)',
                          '0 0 0 15px hsl(var(--destructive) / 0)',
                        ]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", duration: 0.6 }}
                      >
                        <ShieldAlert className="w-12 h-12 text-destructive" />
                      </motion.div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <h2 className="text-xl font-bold text-destructive flex items-center justify-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        ACESSO NEGADO
                      </h2>
                      <p className="text-muted-foreground">
                        {banMessage}
                      </p>
                    </motion.div>

                    {/* Glitch effect lines */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ duration: 0.1, repeat: 5, repeatDelay: 0.5 }}
                    >
                      <div className="absolute top-1/4 left-0 right-0 h-px bg-destructive/50" />
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-destructive/30" />
                      <div className="absolute top-3/4 left-0 right-0 h-px bg-destructive/50" />
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* Access Granted */}
                    <motion.div
                      className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                    >
                      <Eye className="w-12 h-12 text-green-500" />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="text-xl font-bold text-green-500">
                        IDENTIDADE VERIFICADA
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Acesso autorizado
                      </p>
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BanCheckOverlay;
