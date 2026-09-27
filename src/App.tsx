import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, History, Volume2, VolumeX, Sparkles, Heart } from 'lucide-react';
import { useWaterStore } from './hooks/useWaterStore';
import { LiquidVessel } from './components/LiquidVessel';
import { QuickPresets } from './components/QuickPresets';
import { WeekStrip } from './components/WeekStrip';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { CelebrationModal } from './components/CelebrationModal';
import { EasterEggModal } from './components/EasterEggModal';
import { WATER_THEMES } from './utils/themes';

export default function App() {
  const {
    settings,
    todayRecord,
    lastAddedLog,
    celebration,
    setCelebration,
    addWater,
    undoLast,
    deleteLog,
    updateSettings,
    getWeekHistory,
  } = useWaterStore();

  // Modals state
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // Excited animation trigger for droplet and wave splash
  const [isExcited, setIsExcited] = useState(false);

  const activeTheme = WATER_THEMES[settings.themeId] || WATER_THEMES.aqua;

  // Add water with animation
  const handleAddWater = (amount: number) => {
    setIsExcited(true);
    addWater(amount);
    setTimeout(() => {
      setIsExcited(false);
    }, 1200);
  };

  // Ukrainian formatted date
  const todayFormatted = new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const capitalizedDate =
    todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  const weekHistory = getWeekHistory();

  return (
    <div className="relative min-h-[100dvh] w-full max-w-md mx-auto flex flex-col justify-between py-6 px-4 overflow-hidden">
      {/* Dynamic Background Atmospheric Lighting */}
      <div
        className="fixed inset-0 pointer-events-none transition-colors duration-1000 -z-10"
        style={{
          background: `radial-gradient(ellipse at 50% 20%, ${activeTheme.surfaceGlow} 0%, #070c17 75%)`,
        }}
      />

      {/* Top Header Bar */}
      <header className="w-full flex items-center justify-between pt-1 pb-2 px-1">
        {/* Date & Personalized Greeting */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span>{capitalizedDate}</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 mt-0.5 font-sans">
            <span>Привіт, {settings.userName}</span>
            <Sparkles size={16} className="text-amber-300 animate-pulse" />
          </h1>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() =>
              updateSettings({ soundEnabled: !settings.soundEnabled })
            }
            title={settings.soundEnabled ? 'Вимкнути звук' : 'Увімкнути звук'}
            className="w-9 h-9 rounded-xl glass-btn flex items-center justify-center text-slate-300 hover:text-white"
          >
            {settings.soundEnabled ? (
              <Volume2 size={16} className="text-cyan-400" />
            ) : (
              <VolumeX size={16} className="text-slate-500" />
            )}
          </button>

          {/* History Button */}
          <button
            onClick={() => setShowHistory(true)}
            title="Історія за сьогодні"
            className="w-9 h-9 rounded-xl glass-btn flex items-center justify-center text-slate-300 hover:text-white"
          >
            <History size={16} />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            title="Налаштування"
            className="w-9 h-9 rounded-xl glass-btn flex items-center justify-center text-slate-300 hover:text-white"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Center Vessel (Living Liquid & Floating Companion) */}
      <main className="flex-1 flex flex-col items-center justify-center py-2">
        <LiquidVessel
          total={todayRecord.total}
          goal={settings.dailyGoal}
          theme={activeTheme}
          onTriggerEasterEgg={() => setShowEasterEgg(true)}
          isExcited={isExcited}
        />

        {/* Quick Log Presets */}
        <QuickPresets
          onAddWater={handleAddWater}
          onUndo={undoLast}
          lastAddedLog={lastAddedLog}
          theme={activeTheme}
        />

        {/* 7-Day History Strip */}
        <WeekStrip days={weekHistory} theme={activeTheme} />
      </main>

      {/* Subtle Bottom Romantic Footer Hint */}
      <footer className="w-full text-center py-2">
        <motion.button
          onClick={() => setShowEasterEgg(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400/80 hover:text-rose-300 transition-colors"
        >
          <Heart size={11} className="text-rose-400/60" />
          <span>Створено з любов'ю спеціально для тебе</span>
        </motion.button>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showHistory && (
          <HistoryModal
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            logs={todayRecord.logs}
            onDeleteLog={deleteLog}
            total={todayRecord.total}
          />
        )}

        {showSettings && (
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        )}

        {celebration && (
          <CelebrationModal
            type={celebration}
            onClose={() => setCelebration(null)}
            userName={settings.userName}
          />
        )}

        {showEasterEgg && (
          <EasterEggModal
            isOpen={showEasterEgg}
            onClose={() => setShowEasterEgg(false)}
            message={settings.customLoveNote}
            userName={settings.userName}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
