import React from 'react';
import { motion } from 'framer-motion';
import type { WaterTheme } from '../types';

interface WeekDayItem {
  dateKey: string;
  dayOfWeek: string;
  dayNum: number;
  isToday: boolean;
  total: number;
  goal: number;
  percent: number;
}

interface WeekStripProps {
  days: WeekDayItem[];
  theme: WaterTheme;
  selectedDateKey: string;
  onSelectDate: (dateKey: string) => void;
}

export const WeekStrip: React.FC<WeekStripProps> = ({
  days,
  theme,
  selectedDateKey,
  onSelectDate,
}) => {
  return (
    <div className="w-full max-w-sm px-4 mt-2.5 relative">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Останні 7 днів
        </span>
        <span className="text-[11px] text-slate-500 font-medium">
          Твій ритм
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 p-1.5 rounded-2xl glass-card">
        {days.map((d) => {
          const isComplete = d.percent >= 100;
          const isSelected = d.dateKey === selectedDateKey;

          return (
            <motion.div
              key={d.dateKey}
              onClick={() => onSelectDate(d.dateKey)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-white/15 border-2 shadow-inner'
                  : d.isToday
                  ? 'bg-white/10 border border-white/20 shadow-inner'
                  : 'bg-white/[0.02] hover:bg-white/[0.05] border border-transparent'
              }`}
              style={
                isSelected
                  ? { borderColor: theme.primary }
                  : undefined
              }
            >
              {/* Day of week */}
              <span
                className={`text-[10px] font-semibold mb-0.5 ${
                  isSelected ? 'text-white' : 'text-slate-400'
                }`}
              >
                {d.dayOfWeek}
              </span>

              {/* Day number */}
              <span
                className={`text-xs font-bold mb-1.5 ${
                  isSelected || d.isToday ? 'text-white' : 'text-slate-300'
                }`}
              >
                {d.dayNum}
              </span>

              {/* Water droplet miniature progress */}
              <div className="relative w-5 h-6 flex items-center justify-center">
                <svg viewBox="0 0 24 30" className="w-full h-full overflow-hidden">
                  <defs>
                    <clipPath id={`clip-${d.dateKey}`}>
                      <path d="M12,2 C12,2 3,13 3,19 C3,24 7,28 12,28 C17,28 21,24 21,19 C21,13 12,2 12,2 Z" />
                    </clipPath>
                  </defs>

                  {/* Empty outline / background */}
                  <path
                    d="M12,2 C12,2 3,13 3,19 C3,24 7,28 12,28 C17,28 21,24 21,19 C21,13 12,2 12,2 Z"
                    fill="rgba(255, 255, 255, 0.08)"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1.5"
                  />

                  {/* Filled water level */}
                  <g clipPath={`url(#clip-${d.dateKey})`}>
                    <rect
                      x="0"
                      y={28 - (d.percent / 100) * 26}
                      width="24"
                      height="30"
                      fill={isComplete ? '#38bdf8' : theme.primary}
                      opacity={d.percent > 0 ? 0.9 : 0}
                    />
                  </g>
                </svg>

                {/* Subtle star if 100% completed */}
                {isComplete && (
                  <span className="absolute -top-1.5 -right-1 text-[8px]">✨</span>
                )}
              </div>

              {/* Percentage label */}
              <span className="text-[9px] font-medium text-slate-400 mt-1">
                {d.percent}%
              </span>

              {/* Today dot indicator */}
              {d.isToday && (
                <div
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
