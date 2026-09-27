import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RotateCcw, Droplets, Check, X } from 'lucide-react';
import type { WaterTheme, WaterLog } from '../types';


interface QuickPresetsProps {
  onAddWater: (amount: number) => void;
  onUndo: () => void;
  lastAddedLog: WaterLog | null;
  theme: WaterTheme;
}

const PRESETS = [
  { amount: 150, label: '150 мл', sub: 'Чашка', icon: '☕' },
  { amount: 250, label: '250 мл', sub: 'Склянка', icon: '🥛' },
  { amount: 350, label: '350 мл', sub: 'Горнятко', icon: '🫖' },
  { amount: 500, label: '500 мл', sub: 'Пляшка', icon: '💧' },
];

export const QuickPresets: React.FC<QuickPresetsProps> = ({
  onAddWater,
  onUndo,
  lastAddedLog,
  theme,
}) => {
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<number>(200);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAmount > 0) {
      onAddWater(customAmount);
      setShowCustomModal(false);
    }
  };

  return (
    <div className="w-full max-w-sm px-4 flex flex-col items-center">
      {/* 4 Preset Pill Buttons */}
      <div className="grid grid-cols-4 gap-2.5 w-full">
        {PRESETS.map((preset) => (
          <motion.button
            key={preset.amount}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onAddWater(preset.amount)}
            className="flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] backdrop-blur-md transition-colors shadow-lg shadow-black/20 group"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">
              {preset.icon}
            </span>
            <span className="text-xs font-bold text-slate-100 font-sans">
              +{preset.amount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {preset.sub}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Custom & Quick Action Row */}
      <div className="flex items-center gap-2 mt-3 w-full">
        {/* Custom Amount Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowCustomModal(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 backdrop-blur-md transition-colors"
        >
          <Plus size={14} className="text-cyan-400" />
          <span>Інший об'єм</span>
        </motion.button>

        {/* Undo Button if available */}
        <AnimatePresence>
          {lastAddedLog && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: 'auto' }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUndo}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-medium backdrop-blur-md transition-colors whitespace-nowrap"
            >
              <RotateCcw size={13} />
              <span>Скасувати +{lastAddedLog.amount} мл</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Amount Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-full max-w-xs p-5 rounded-3xl glass-panel text-center relative"
            >
              <button
                onClick={() => setShowCustomModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-cyan-500/10 text-cyan-400 mb-3 border border-cyan-500/20">
                <Droplets size={24} />
              </div>

              <h3 className="text-base font-bold text-white mb-1">
                Додати свій об'єм
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Скільки мілілітрів водички випито?
              </p>

              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div className="relative flex items-center justify-center">
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    step="10"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="w-36 py-2 px-3 text-center text-3xl font-extrabold text-white bg-white/5 border border-white/15 rounded-2xl focus:outline-none focus:border-cyan-400"
                    autoFocus
                  />
                  <span className="ml-2 text-sm text-slate-400 font-semibold">
                    мл
                  </span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
                  >
                    Назад
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl font-semibold text-xs text-slate-950 flex items-center justify-center gap-1.5 shadow-lg"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Check size={14} />
                    <span>Додати</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
