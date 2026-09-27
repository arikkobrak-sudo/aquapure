import { useState, useEffect, useCallback } from 'react';
import type { WaterLog, DayRecord, UserSettings } from '../types';

import { sound } from '../utils/sound';

const STORAGE_KEYS = {
  SETTINGS: 'aquapure_settings_v1',
  HISTORY: 'aquapure_history_v1',
};

const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Сонечко',
  dailyGoal: 2000,
  soundEnabled: true,
  themeId: 'aqua',
  customLoveNote: 'Ти робиш цей світ красивішим і теплішим щодня. Не забувай пити водичку і берегти себе, моє сонечко! Люблю тебе до місяця і назад ❤️',
};

const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useWaterStore = () => {
  // Load settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Sync sound setting
  useEffect(() => {
    sound.enabled = settings.soundEnabled;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // storage quota or disabled
    }
  }, [settings]);

  // Load history
  const [history, setHistory] = useState<Record<string, DayRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [currentDateKey, setCurrentDateKey] = useState<string>(getTodayDateString);

  // Keep date synced when phone wakes up or passes midnight
  useEffect(() => {
    const checkDate = () => {
      const nowKey = getTodayDateString();
      setCurrentDateKey((prev) => (prev !== nowKey ? nowKey : prev));
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkDate();
      }
    };

    const timer = setInterval(checkDate, 30000);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Current day record
  const currentDayRecord: DayRecord = history[currentDateKey] || {
    date: currentDateKey,
    total: 0,
    goal: settings.dailyGoal,
    logs: [],
  };


  // Tracking last added for Undo
  const [lastAddedLog, setLastAddedLog] = useState<WaterLog | null>(null);

  // Celebration trigger: '50' or '100' or null
  const [celebration, setCelebration] = useState<'50' | '100' | null>(null);

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: Record<string, DayRecord>) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
    } catch {
      // ignore
    }
  }, []);

  // Add water
  const addWater = useCallback((amount: number) => {
    if (amount <= 0) return;

    sound.playPour();

    const nowKey = getTodayDateString();
    const existing = history[nowKey] || {
      date: nowKey,
      total: 0,
      goal: settings.dailyGoal,
      logs: [],
    };

    const previousTotal = existing.total;
    const newTotal = previousTotal + amount;
    const goal = settings.dailyGoal;

    const newLog: WaterLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      amount,
      timestamp: Date.now(),
    };

    const updatedDay: DayRecord = {
      ...existing,
      goal,
      total: newTotal,
      logs: [newLog, ...existing.logs],
    };

    const updatedHistory = {
      ...history,
      [nowKey]: updatedDay,
    };

    saveHistory(updatedHistory);
    setLastAddedLog(newLog);

    // Trigger celebration milestones cleanly
    if (previousTotal < goal * 0.5 && newTotal >= goal * 0.5 && newTotal < goal) {
      setTimeout(() => setCelebration('50'), 350);
    } else if (previousTotal < goal && newTotal >= goal) {
      setTimeout(() => {
        sound.playCrystalChime();
        setCelebration('100');
      }, 350);
    }
  }, [history, settings.dailyGoal, saveHistory]);


  // Undo last logged portion
  const undoLast = useCallback(() => {
    if (!lastAddedLog) return;
    const logToRemove = lastAddedLog;
    setLastAddedLog(null);
    sound.playBubble(0.7);

    const nowKey = getTodayDateString();
    setHistory((prev) => {
      const existing = prev[nowKey];
      if (!existing) return prev;

      const updatedLogs = existing.logs.filter((l) => l.id !== logToRemove.id);
      const updatedTotal = Math.max(0, existing.total - logToRemove.amount);

      const updatedDay: DayRecord = {
        ...existing,
        total: updatedTotal,
        logs: updatedLogs,
      };

      const updatedHistory = {
        ...prev,
        [nowKey]: updatedDay,
      };

      saveHistory(updatedHistory);
      return updatedHistory;
    });
  }, [lastAddedLog, saveHistory]);

  // Delete specific log
  const deleteLog = useCallback((logId: string) => {
    const nowKey = getTodayDateString();
    sound.playBubble(0.65);
    setHistory((prev) => {
      const existing = prev[nowKey];
      if (!existing) return prev;

      const logItem = existing.logs.find((l) => l.id === logId);
      if (!logItem) return prev;

      const updatedLogs = existing.logs.filter((l) => l.id !== logId);
      const updatedTotal = Math.max(0, existing.total - logItem.amount);

      const updatedDay: DayRecord = {
        ...existing,
        total: updatedTotal,
        logs: updatedLogs,
      };

      const updatedHistory = {
        ...prev,
        [nowKey]: updatedDay,
      };

      saveHistory(updatedHistory);
      return updatedHistory;
    });
  }, [saveHistory]);

  // Update settings
  const updateSettings = useCallback((newPartial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      return updated;
    });
  }, []);

  // Last 7 days history
  const getWeekHistory = useCallback(() => {
    const result = [];
    const dayNames = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${day}`;

      const rec = history[dateKey];
      const total = rec ? rec.total : 0;
      const goal = rec ? rec.goal : settings.dailyGoal;
      const percent = Math.min(100, Math.round((total / (goal || 2000)) * 100));

      result.push({
        dateKey,
        dayOfWeek: dayNames[d.getDay()],
        dayNum: d.getDate(),
        isToday: i === 0,
        total,
        goal,
        percent,
      });
    }

    return result;
  }, [history, settings.dailyGoal]);

  return {
    settings,
    todayRecord: currentDayRecord,
    lastAddedLog,
    celebration,
    setCelebration,
    addWater,
    undoLast,
    deleteLog,
    updateSettings,
    getWeekHistory,
  };
};
