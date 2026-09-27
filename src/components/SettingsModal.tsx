import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, VolumeX, Sparkles, Heart, Target, User } from 'lucide-react';
import type { UserSettings } from '../types';

import { WATER_THEMES } from '../utils/themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [userName, setUserName] = useState(settings.userName);
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [themeId, setThemeId] = useState(settings.themeId);
  const [customLoveNote, setCustomLoveNote] = useState(settings.customLoveNote);
  const [showLoveNoteEditor, setShowLoveNoteEditor] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSettings({
      userName: userName.trim() || 'Сонечко',
      dailyGoal: Number(dailyGoal) || 2000,
      soundEnabled,
      themeId,
      customLoveNote: customLoveNote.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="w-full max-w-sm max-h-[90vh] flex flex-col rounded-3xl glass-panel relative overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Налаштування</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-300/90 font-medium">Спільна база онлайн</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >

            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-left">
          {/* User Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
              <User size={13} className="text-cyan-400" />
              <span>Звернення / Ім'я</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Наприклад: Сонечко чи Оля"
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/15 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Daily Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Target size={13} className="text-cyan-400" />
                <span>Денна ціль</span>
              </label>
              <span className="text-xs font-bold text-cyan-400 font-sans">
                {dailyGoal} мл
              </span>
            </div>

            <input
              type="range"
              min="1200"
              max="3500"
              step="100"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1200 мл</span>
              <span>2000 мл</span>
              <span>3500 мл</span>
            </div>
          </div>

          {/* Color Themes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Колір та настрій води
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(WATER_THEMES).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeId(t.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                    themeId === t.id
                      ? 'bg-white/10 border-white/40 shadow-sm'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                    }}
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{t.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{t.subname}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-cyan-500/10 text-cyan-400">
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">ASMR звуки води</p>
                <p className="text-[10px] text-slate-400">Булькання та кришталевий дзвін</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Secret Love Note Section */}
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <div
              onClick={() => setShowLoveNoteEditor(!showLoveNoteEditor)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Heart size={15} className="text-rose-400" />
                <span className="text-xs font-semibold text-rose-200">
                  Твоя секретна записка ❤️
                </span>
              </div>
              <span className="text-[10px] text-rose-300 font-medium underline">
                {showLoveNoteEditor ? 'Згорнути' : 'Редагувати'}
              </span>
            </div>

            {showLoveNoteEditor && (
              <div className="mt-2.5 space-y-1.5">
                <p className="text-[10px] text-rose-300/80 leading-relaxed">
                  Ця записка з'явиться, коли вона затисне пальчиком склянку на 1.5 секунди:
                </p>
                <textarea
                  rows={3}
                  value={customLoveNote}
                  onChange={(e) => setCustomLoveNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900/60 border border-rose-500/30 text-xs text-rose-100 placeholder-rose-300/40 focus:outline-none focus:border-rose-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
          >
            Скасувати
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-colors"
          >
            Зберегти
          </button>
        </div>
      </motion.div>
    </div>
  );
};
