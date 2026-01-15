import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PaymentSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
}

const PaymentSuccessDialog = ({ isOpen, onClose, amount }: PaymentSuccessDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-gradient-to-b from-background to-secondary/30 overflow-hidden">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative py-8 px-4 text-center"
            >
              {/* Background sparkles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      y: [-20, -60],
                      x: [0, (i % 2 === 0 ? 10 : -10)]
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="absolute"
                    style={{
                      left: `${15 + i * 14}%`,
                      bottom: '30%',
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-foreground/30" />
                  </motion.div>
                ))}
              </div>

              {/* Success icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                className="mx-auto mb-6 w-20 h-20 rounded-full bg-foreground flex items-center justify-center"
              >
                <CheckCircle2 className="h-10 w-10 text-background" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-grotesk text-2xl font-bold mb-2"
              >
                Pagamento Confirmado!
              </motion.h2>

              {/* Amount */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
              >
                <span className="text-4xl font-grotesk font-bold">
                  R$ {amount.toFixed(2)}
                </span>
                <p className="text-muted-foreground mt-1">
                  adicionados à sua conta
                </p>
              </motion.div>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-6 max-w-xs mx-auto"
              >
                Seu saldo foi atualizado com sucesso. Aproveite os melhores materiais disponíveis!
              </motion.p>

              {/* Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button onClick={onClose} size="lg" className="px-8">
                  Continuar Comprando
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessDialog;
