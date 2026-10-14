import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, History, Volume2, VolumeX, Sparkles, Heart, ChevronLeft, Zap } from 'lucide-react';
import { useWaterStore } from './hooks/useWaterStore';
import { LiquidVessel } from './components/LiquidVessel';
import { QuickPresets } from './components/QuickPresets';
import { WeekStrip } from './components/WeekStrip';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { CelebrationModal } from './components/CelebrationModal';
import { EasterEggModal } from './components/EasterEggModal';
import { WATER_THEMES } from './utils/themes';
import { COMPLIMENTS_HIM } from './utils/compliments';
import { sound } from './utils/sound';
import type { ProfileId } from './types';

export default function App() {
  // Active profile: always starts on 'her' as requested
  const [activeProfile, setActiveProfile] = useState<ProfileId>('her');

  // Dedicated independent store for each profile
  const herStore = useWaterStore('her');
  const himStore = useWaterStore('him');

  const activeStore = activeProfile === 'her' ? herStore : himStore;

  // Sync sound setting for the currently active profile
  useEffect(() => {
    sound.enabled = activeStore.settings.soundEnabled;
  }, [activeStore.settings.soundEnabled]);

  // Modals state
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // Excited animation trigger for droplet and wave splash
  const [isExcited, setIsExcited] = useState(false);

  const activeTheme =
    WATER_THEMES[activeStore.settings.themeId] ||
    (activeProfile === 'him' ? WATER_THEMES.indigo : WATER_THEMES.aqua);

  // Add water with animation
  const handleAddWater = (amount: number) => {
    setIsExcited(true);
    activeStore.addWater(amount);
    setTimeout(() => {
      setIsExcited(false);
    }, 1200);
  };

  // Format date for selected day
  const getFormattedDate = (dateKey: string) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const formatted = new Intl.DateTimeFormat('uk-UA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const displayDate = getFormattedDate(activeStore.selectedDate);
  const weekHistory = activeStore.getWeekHistory();

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && activeProfile === 'her') {
      sound.playBubble(1.1);
      setActiveProfile('him');
    } else if (direction === 'right' && activeProfile === 'him') {
      sound.playBubble(0.9);
      setActiveProfile('her');
    }
  };

  return (
    <div
      className="relative h-[100dvh] w-full max-w-md mx-auto flex flex-col justify-between px-4 overflow-hidden select-none"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
      }}
    >
      {/* Dynamic Background Atmospheric Lighting */}
      <div
        className="fixed inset-0 pointer-events-none transition-colors duration-1000 -z-10"
        style={{
          background: `radial-gradient(ellipse at 50% 15%, ${activeTheme.surfaceGlow} 0%, #070c17 75%)`,
        }}
      />

      {/* Top Header Bar with Safe-Area clearance */}
      <header className="w-full flex items-center justify-between pb-1 px-1 z-30 select-none flex-shrink-0">
        {/* Date, Greeting & Profile Switcher */}
        <div className="flex flex-col text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wide truncate">
              {displayDate}
            </span>

            {/* Profile Switcher Pill */}
            <div
              onClick={() => setActiveProfile((curr) => (curr === 'her' ? 'him' : 'her'))}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-[10px] font-bold cursor-pointer transition-colors shadow-sm"
              title="Натисни або свайпни, щоб змінити профіль"
            >
              <span
                className={`transition-colors ${
                  activeProfile === 'her' ? 'text-rose-300 font-extrabold' : 'text-slate-500'
                }`}
              >
                Вона
              </span>
              <span className="text-slate-600 text-[9px]">•</span>
              <span
                className={`transition-colors ${
                  activeProfile === 'him' ? 'text-indigo-300 font-extrabold' : 'text-slate-500'
                }`}
              >
                Він
              </span>
            </div>
          </div>

          {activeStore.isViewingToday ? (
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 mt-0.5 font-sans">
              <span>Привіт, {activeStore.settings.userName}</span>
              {activeProfile === 'her' ? (
                <Sparkles size={16} className="text-amber-300 animate-pulse flex-shrink-0" />
              ) : (
                <Zap size={16} className="text-indigo-400 flex-shrink-0" />
              )}
            </h1>
          ) : (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={activeStore.goToToday}
              className="flex items-center gap-1 mt-0.5 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ChevronLeft size={16} className="flex-shrink-0" />
              <span>Повернутися до сьогодні</span>
            </motion.button>
          )}
        </div>

        {/* Action Buttons - large touch targets */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() =>
              activeStore.updateSettings({ soundEnabled: !activeStore.settings.soundEnabled })
            }
            title={activeStore.settings.soundEnabled ? 'Вимкнути звук' : 'Увімкнути звук'}
            className="w-10 h-10 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/[0.2] border border-white/15 backdrop-blur-xl flex items-center justify-center text-slate-200 transition-all shadow-md active:scale-92"
          >
            {activeStore.settings.soundEnabled ? (
              <Volume2 size={17} className={activeProfile === 'him' ? 'text-indigo-400' : 'text-cyan-400'} />
            ) : (
              <VolumeX size={17} className="text-slate-500" />
            )}
          </button>

          {/* History Button */}
          <button
            onClick={() => setShowHistory(true)}
            title="Історія"
            className="w-10 h-10 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/[0.2] border border-white/15 backdrop-blur-xl flex items-center justify-center text-slate-200 transition-all shadow-md active:scale-92"
          >
            <History size={17} />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            title="Налаштування"
            className="w-10 h-10 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/[0.2] border border-white/15 backdrop-blur-xl flex items-center justify-center text-slate-200 transition-all shadow-md active:scale-92"
          >
            <Settings size={17} />
          </button>
        </div>
      </header>

      {/* Center Vessel with horizontal swipe gesture between profiles */}
      <main className="flex-1 flex flex-col items-center justify-between py-0.5 min-h-0 overflow-visible">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={(_, info) => {
            if (info.offset.x < -45 || info.velocity.x < -350) {
              handleSwipe('left');
            } else if (info.offset.x > 45 || info.velocity.x > 350) {
              handleSwipe('right');
            }
          }}
          className="w-full flex flex-col items-center justify-center touch-pan-y cursor-grab active:cursor-grabbing"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProfile}
              initial={{ opacity: 0, scale: 0.95, x: activeProfile === 'him' ? 40 : -40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: activeProfile === 'him' ? -40 : 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="flex flex-col items-center justify-center w-full"
            >
              <LiquidVessel
                total={activeStore.selectedDayRecord.total}
                goal={activeStore.settings.dailyGoal}
                theme={activeTheme}
                onTriggerEasterEgg={activeProfile === 'her' ? () => setShowEasterEgg(true) : undefined}
                isExcited={isExcited}
                companionQuotes={activeProfile === 'him' ? COMPLIMENTS_HIM.dropletQuotes : undefined}
              />
            </motion.div>
          </AnimatePresence>

          {/* iOS-Style Profile Pagination Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-1 mb-0.5">
            <button
              type="button"
              onClick={() => setActiveProfile('her')}
              aria-label="Профіль Сонечко"
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeProfile === 'her'
                  ? 'w-5 bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                  : 'w-1.5 bg-white/25 hover:bg-white/40'
              }`}
            />
            <button
              type="button"
              onClick={() => setActiveProfile('him')}
              aria-label="Профіль Котя"
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeProfile === 'him'
                  ? 'w-5 bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                  : 'w-1.5 bg-white/25 hover:bg-white/40'
              }`}
            />
          </div>
        </motion.div>

        {/* Quick Log Presets */}
        <QuickPresets
          onAddWater={handleAddWater}
          onUndo={activeStore.undoLast}
          lastAddedLog={activeStore.lastAddedLog}
          theme={activeTheme}
        />

        {/* 7-Day History Strip */}
        <WeekStrip
          days={weekHistory}
          theme={activeTheme}
          selectedDateKey={activeStore.selectedDate}
          onSelectDate={activeStore.selectDate}
        />
      </main>

      {/* Bottom Footer Hint */}
      <footer className="w-full text-center py-1 flex-shrink-0">
        {activeProfile === 'her' ? (
          <motion.button
            onClick={() => setShowEasterEgg(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400/80 hover:text-rose-300 transition-colors"
          >
            <Heart size={11} className="text-rose-400/60" />
            <span>Створено з любов'ю спеціально для тебе</span>
          </motion.button>
        ) : (
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400/80">
            <Zap size={11} className="text-indigo-400" />
            <span>Режим чемпіона • Креатин &amp; Вода 💪</span>
          </div>
        )}
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showHistory && (
          <HistoryModal
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            logs={activeStore.selectedDayRecord.logs}
            onDeleteLog={activeStore.deleteLog}
            total={activeStore.selectedDayRecord.total}
            dateLabel={displayDate}
            isToday={activeStore.isViewingToday}
          />
        )}

        {showSettings && (
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            settings={activeStore.settings}
            onUpdateSettings={activeStore.updateSettings}
            profile={activeProfile}
          />
        )}

        {activeStore.celebration && (
          <CelebrationModal
            type={activeStore.celebration}
            onClose={() => activeStore.setCelebration(null)}
            userName={activeStore.settings.userName}
            variant={activeProfile}
          />
        )}

        {showEasterEgg && (
          <EasterEggModal
            isOpen={showEasterEgg}
            onClose={() => setShowEasterEgg(false)}
            message={herStore.settings.customLoveNote}
            userName={herStore.settings.userName}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
