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
  const [customAmount, setCustomAmount] = useState<string>('200');

  const numericAmount = Number(customAmount);
  const isValid = !isNaN(numericAmount) && numericAmount > 0;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onAddWater(numericAmount);
      setShowCustomModal(false);
    }
  };

  const handleOpenModal = () => {
    setCustomAmount('200');
    setShowCustomModal(true);
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
          onClick={handleOpenModal}
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
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCustomModal(false);
            }}
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] sm:pt-4 bg-black/70 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-full max-w-xs p-4 sm:p-5 rounded-3xl glass-panel text-center relative shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-10 h-10 rounded-2xl mx-auto flex items-center justify-center bg-cyan-500/10 text-cyan-400 mb-2 border border-cyan-500/20">
                <Droplets size={20} />
              </div>

              <h3 className="text-base font-bold text-white mb-0.5">
                Додати свій об'єм
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Скільки мілілітрів водички випито?
              </p>

              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="relative inline-flex items-center">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="3000"
                      placeholder="0"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-36 py-2 px-3 text-center text-3xl font-extrabold text-white bg-white/5 border border-white/15 rounded-2xl focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                      autoFocus
                    />
                    {customAmount && (
                      <button
                        type="button"
                        onClick={() => setCustomAmount('')}
                        className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
                        title="Очистити"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <span className="ml-2 text-sm text-slate-400 font-semibold">
                    мл
                  </span>
                </div>

                {/* Quick adjustment chips */}
                <div className="flex justify-center gap-1.5">
                  {[150, 250, 350, 500].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setCustomAmount(String(quick))}
                      className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                        customAmount === String(quick)
                          ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                      }`}
                    >
                      {quick}
                    </button>
                  ))}
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={isValid ? Math.min(1000, Math.max(50, numericAmount)) : 200}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    Назад
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-xs text-slate-950 flex items-center justify-center gap-1.5 shadow-lg transition-all ${
                      isValid ? 'opacity-100' : 'opacity-40 cursor-not-allowed'
                    }`}
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
