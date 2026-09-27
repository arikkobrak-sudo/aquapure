import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, X } from 'lucide-react';

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  userName: string;
}

export const EasterEggModal: React.FC<EasterEggModalProps> = ({
  isOpen,
  onClose,
  message,
  userName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
      {/* Floating mini hearts in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              y: '105vh',
              x: `${10 + (i * 8)}vw`,
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              y: '-10vh',
              opacity: [0, 0.7, 0],
              scale: [0.5, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeOut',
            }}
            className="absolute text-rose-500/40 text-xl"
          >
            ❤️
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 25 }}
        transition={{ type: 'spring', damping: 18, stiffness: 260 }}
        className="w-full max-w-sm p-6 rounded-3xl bg-gradient-to-b from-rose-950/60 to-slate-950/90 border border-rose-500/30 shadow-[0_25px_60px_-15px_rgba(244,63,94,0.3)] text-center relative overflow-hidden backdrop-blur-xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-rose-300 hover:text-white hover:bg-rose-500/20 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Pulsing Big Heart */}
        <motion.div
          animate={{ scale: [1, 1.15, 1, 1.12, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-rose-500/20 text-rose-400 mb-4 border border-rose-500/40 shadow-lg shadow-rose-500/30"
        >
          <Heart size={32} fill="currentColor" />
        </motion.div>

        <div className="flex items-center justify-center gap-1.5 text-rose-300 text-xs font-semibold tracking-wide uppercase mb-1">
          <Sparkles size={13} />
          <span>Секретна записка для тебе</span>
          <Sparkles size={13} />
        </div>

        <h3 className="text-xl font-bold text-white mb-4">
          Для моєї {userName}
        </h3>

        {/* The boyfriend's note */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-rose-500/20 text-sm text-rose-100/90 leading-relaxed font-normal italic shadow-inner mb-6">
          «{message}»
        </div>

        {/* Sweet footer button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Heart size={15} fill="currentColor" />
          <span>Я теж тебе люблю!</span>
        </button>
      </motion.div>
    </div>
  );
};
