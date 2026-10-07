import { useState, useEffect, useCallback } from 'react';
import type { WaterLog, DayRecord, UserSettings } from '../types';
import { sound } from '../utils/sound';
import { supabase } from '../utils/supabase';

const STORAGE_KEYS = {
  SETTINGS: 'aquapure_settings_v1',
  HISTORY: 'aquapure_history_v1',
};

const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Сонечко',
  dailyGoal: 2000,
  soundEnabled: true,
  themeId: 'aqua',
  customLoveNote:
    'Ти робиш цей світ красивішим і теплішим щодня. Не забувай пити водичку і берегти себе, моє сонечко! Люблю тебе до місяця і назад ❤️',
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
      // ignore
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
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  const isViewingToday = selectedDate === getTodayDateString();

  // Navigate to a specific day
  const selectDate = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
  }, []);

  // Keep date synced when phone wakes up or passes midnight
  useEffect(() => {
    const checkDate = () => {
      const nowKey = getTodayDateString();
      setCurrentDateKey((prev) => {
        if (prev !== nowKey) {
          // Midnight rollover: if user was viewing "today", move them to the new today
          setSelectedDate((prevSelected) =>
            prevSelected === prev ? nowKey : prevSelected
          );
          return nowKey;
        }
        return prev;
      });
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

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: Record<string, DayRecord>) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
    } catch {
      // ignore
    }
  }, []);

  // Fetch all data from Supabase and sync
  const fetchCloudData = useCallback(async () => {
    try {
      // 1. Fetch remote settings
      const { data: remoteSettings, error: setErr } = await supabase
        .from('water_tracker_settings')
        .select('*')
        .eq('id', 'main')
        .maybeSingle();

      if (!setErr && remoteSettings) {
        setSettings((prev) => {
          const updated: UserSettings = {
            ...prev,
            userName: remoteSettings.user_name || prev.userName,
            dailyGoal: remoteSettings.daily_goal || prev.dailyGoal,
            themeId: remoteSettings.theme_id || prev.themeId,
            customLoveNote:
              remoteSettings.custom_love_note || prev.customLoveNote,
          };
          try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }

      // 2. Fetch remote logs
      const { data: remoteLogs, error: logErr } = await supabase
        .from('water_tracker_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (!logErr && remoteLogs) {
        setIsCloudConnected(true);
        const newHistoryMap: Record<string, DayRecord> = {};

        remoteLogs.forEach((row) => {
          const logDate: string = row.date;
          if (!newHistoryMap[logDate]) {
            newHistoryMap[logDate] = {
              date: logDate,
              total: 0,
              goal: remoteSettings?.daily_goal || settings.dailyGoal,
              logs: [],
            };
          }
          newHistoryMap[logDate].logs.push({
            id: row.id,
            amount: Number(row.amount),
            timestamp: Number(row.timestamp),
          });
          newHistoryMap[logDate].total += Number(row.amount);
        });

        // Ensure current day exists
        const todayK = getTodayDateString();
        if (!newHistoryMap[todayK]) {
          newHistoryMap[todayK] = {
            date: todayK,
            total: 0,
            goal: remoteSettings?.daily_goal || settings.dailyGoal,
            logs: [],
          };
        }

        saveHistory(newHistoryMap);
      }
    } catch {
      setIsCloudConnected(false);
    }
  }, [saveHistory, settings.dailyGoal]);

  // Realtime Supabase Subscription
  useEffect(() => {
    fetchCloudData();

    const channel = supabase
      .channel('shared_water_tracker')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'water_tracker_logs' },
        () => {
          fetchCloudData();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'water_tracker_settings' },
        (payload) => {
          const newRow = payload.new as {
            user_name?: string;
            daily_goal?: number;
            theme_id?: string;
            custom_love_note?: string;
          };
          if (newRow) {
            setSettings((prev) => {
              const updated = {
                ...prev,
                userName: newRow.user_name || prev.userName,
                dailyGoal: newRow.daily_goal || prev.dailyGoal,
                themeId: newRow.theme_id || prev.themeId,
                customLoveNote:
                  newRow.custom_love_note || prev.customLoveNote,
              };
              try {
                localStorage.setItem(
                  STORAGE_KEYS.SETTINGS,
                  JSON.stringify(updated)
                );
              } catch {}
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        setIsCloudConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCloudData]);

  // Selected day record (could be today or a past day)
  const selectedDayRecord: DayRecord = history[selectedDate] || {
    date: selectedDate,
    total: 0,
    goal: settings.dailyGoal,
    logs: [],
  };

  // Tracking last added for Undo
  const [lastAddedLog, setLastAddedLog] = useState<WaterLog | null>(null);

  // Celebration trigger: '50' or '100' or null
  const [celebration, setCelebration] = useState<'50' | '100' | null>(null);

  // Add water to the currently selected day
  const addWater = useCallback(
    (amount: number) => {
      if (amount <= 0) return;

      sound.playPour();

      const targetDate = selectedDate;
      const existing = history[targetDate] || {
        date: targetDate,
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
        [targetDate]: updatedDay,
      };

      saveHistory(updatedHistory);
      setLastAddedLog(newLog);

      // Async push to Supabase shared cloud table
      supabase
        .from('water_tracker_logs')
        .insert({
          id: newLog.id,
          amount: newLog.amount,
          timestamp: newLog.timestamp,
          date: targetDate,
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase insert error:', error);
        });

      // Trigger celebration milestones ONLY for today
      if (targetDate === getTodayDateString()) {
        if (previousTotal < goal * 0.5 && newTotal >= goal * 0.5 && newTotal < goal) {
          setTimeout(() => setCelebration('50'), 350);
        } else if (previousTotal < goal && newTotal >= goal) {
          setTimeout(() => {
            sound.playCrystalChime();
            setCelebration('100');
          }, 350);
        }
      }
    },
    [history, settings.dailyGoal, saveHistory, selectedDate]
  );

  // Undo last logged portion
  const undoLast = useCallback(() => {
    if (!lastAddedLog) return;
    const logToRemove = lastAddedLog;
    setLastAddedLog(null);
    sound.playBubble(0.7);

    // Find which day this log belongs to by searching history
    let targetKey: string | null = null;
    for (const [dateKey, dayRecord] of Object.entries(history)) {
      if (dayRecord.logs.some((l) => l.id === logToRemove.id)) {
        targetKey = dateKey;
        break;
      }
    }
    if (!targetKey) return;

    const existing = history[targetKey];
    if (!existing) return;

    const updatedLogs = existing.logs.filter((l) => l.id !== logToRemove.id);
    const updatedTotal = Math.max(0, existing.total - logToRemove.amount);

    const updatedDay: DayRecord = {
      ...existing,
      total: updatedTotal,
      logs: updatedLogs,
    };

    const updatedHistory = {
      ...history,
      [targetKey]: updatedDay,
    };

    saveHistory(updatedHistory);

    // Delete from Supabase
    supabase
      .from('water_tracker_logs')
      .delete()
      .eq('id', logToRemove.id)
      .then(() => {});
  }, [lastAddedLog, history, saveHistory]);

  // Delete specific log from the currently selected day
  const deleteLog = useCallback(
    (logId: string) => {
      const targetDate = selectedDate;
      sound.playBubble(0.65);
      const existing = history[targetDate];
      if (!existing) return;

      const logItem = existing.logs.find((l) => l.id === logId);
      if (!logItem) return;

      const updatedLogs = existing.logs.filter((l) => l.id !== logId);
      const updatedTotal = Math.max(0, existing.total - logItem.amount);

      const updatedDay: DayRecord = {
        ...existing,
        total: updatedTotal,
        logs: updatedLogs,
      };

      const updatedHistory = {
        ...history,
        [targetDate]: updatedDay,
      };

      saveHistory(updatedHistory);

      // Delete from Supabase
      supabase
        .from('water_tracker_logs')
        .delete()
        .eq('id', logId)
        .then(() => {});
    },
    [history, saveHistory, selectedDate]
  );

  // Update settings with Supabase sync
  const updateSettings = useCallback((newPartial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      } catch {}

      // Sync settings to Supabase
      supabase
        .from('water_tracker_settings')
        .upsert({
          id: 'main',
          user_name: updated.userName,
          daily_goal: updated.dailyGoal,
          theme_id: updated.themeId,
          custom_love_note: updated.customLoveNote,
          updated_at: new Date().toISOString(),
        })
        .then(() => {});

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
    selectedDate,
    isViewingToday,
    selectedDayRecord,
    lastAddedLog,
    celebration,
    isCloudConnected,
    setCelebration,
    selectDate,
    addWater,
    undoLast,
    deleteLog,
    updateSettings,
    getWeekHistory,
  };
};
