import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import { COMPLIMENTS, getRandomItem } from '../utils/compliments';

interface CelebrationModalProps {
  type: '50' | '100' | null;
  onClose: () => void;
  userName: string;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  type,
  onClose,
  userName,
}) => {
  useEffect(() => {
    if (type === '100') {
      // Fire festive delicate water/glass confetti
      const count = 180;
      const defaults = {
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#67e8f9', '#f43f5e', '#fbbf24', '#ffffff'],
      };

      confetti({
        ...defaults,
        particleCount: Math.floor(count * 0.4),
        spread: 60,
      });
      confetti({
        ...defaults,
        particleCount: Math.floor(count * 0.3),
        spread: 100,
      });
      confetti({
        ...defaults,
        particleCount: Math.floor(count * 0.3),
        spread: 140,
        decay: 0.91,
        scalar: 0.8,
      });
    }
  }, [type]);

  if (!type) return null;

  const isFull = type === '100';
  const quote = isFull
    ? getRandomItem(COMPLIMENTS.completed100)
    : getRandomItem(COMPLIMENTS.progress50);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="w-full max-w-xs p-6 rounded-3xl glass-panel text-center relative overflow-hidden"
      >
        {/* Glow behind */}
        <div
          className={`absolute inset-0 opacity-20 pointer-events-none blur-2xl ${
            isFull ? 'bg-amber-400' : 'bg-cyan-400'
          }`}
        />

        {/* Icon Badge */}
        <div
          className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl border ${
            isFull
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
          }`}
        >
          {isFull ? <Sparkles size={32} /> : <Heart size={30} />}
        </div>

        {/* Badge */}
        <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold tracking-wider text-cyan-200 uppercase mb-2">
          {isFull ? '100% Гідратації' : '50% Екватор'}
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-white mb-2">
          {userName}, ти чарівна!
        </h3>

        {/* Compliment */}
        <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
          {quote}
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5 ${
            isFull
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-amber-500/20'
              : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 shadow-cyan-500/20'
          }`}
        >
          <CheckCircle2 size={16} />
          <span>Дякую, продовжую!</span>
        </button>
      </motion.div>
    </div>
  );
};
