import React from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, Clock, Droplets } from 'lucide-react';
import type { WaterLog } from '../types';
import { getUkrainianPlural } from '../utils/compliments';



interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: WaterLog[];
  onDeleteLog: (id: string) => void;
  total: number;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  logs,
  onDeleteLog,
  total,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="w-full max-w-sm max-h-[85vh] flex flex-col rounded-3xl glass-panel relative overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              <Droplets size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Історія за сьогодні</h3>
              <p className="text-xs text-slate-400">
                Загалом: {total} мл • {logs.length} {getUkrainianPlural(logs.length, 'порція', 'порції', 'порцій')}
              </p>

            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Logs List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Droplets size={32} className="mx-auto mb-2 opacity-30 text-cyan-400" />
              Ще немає записів за сьогодні. Час випити першу склянку! 💧
            </div>
          ) : (
            logs.map((log) => {
              const timeStr = new Date(log.timestamp).toLocaleTimeString('uk-UA', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <motion.div
                  key={log.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Clock size={13} className="text-slate-500" />
                      <span>{timeStr}</span>
                    </div>
                    <span className="text-sm font-bold text-white font-sans">
                      +{log.amount} мл
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteLog(log.id)}
                    title="Видалити запис"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
          >
            Закрити
          </button>
        </div>
      </motion.div>
    </div>
  );
};
