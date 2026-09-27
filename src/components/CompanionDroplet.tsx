import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '../utils/sound';
import { COMPLIMENTS, getRandomItem } from '../utils/compliments';

interface CompanionDropletProps {
  isExcited: boolean;
  isComplete: boolean;
  waterPercent: number;
}

export const CompanionDroplet: React.FC<CompanionDropletProps> = ({
  isExcited,
  isComplete,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);

  // Periodic blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Droplet click interaction
  const handleDropletClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playBubble(1.2);
    const quote = getRandomItem(COMPLIMENTS.dropletQuotes);
    setSpeechBubble(quote);
    setTimeout(() => {
      setSpeechBubble(null);
    }, 3200);
  };

  return (
    <div className="relative flex flex-col items-center pointer-events-auto cursor-pointer select-none">
      {/* Speech bubble */}
      <AnimatePresence>
        {speechBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute -top-14 z-30 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md text-slate-900 text-xs font-medium shadow-lg shadow-black/20 whitespace-nowrap border border-white/50"
          >
            {speechBubble}
            {/* Bubble arrow */}
            <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-white/90 rotate-45 border-r border-b border-white/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Droplet Avatar */}
      <motion.div
        onClick={handleDropletClick}
        animate={
          isExcited
            ? { y: [-15, 0], scale: [1.18, 1], rotate: [0, -6, 6, 0] }
            : { y: [0, -4, 0] }
        }
        transition={
          isExcited
            ? { duration: 0.5, ease: 'easeOut' }
            : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="relative w-14 h-16 filter drop-shadow-[0_4px_10px_rgba(56,189,248,0.4)]"
      >
        <svg viewBox="0 0 100 120" className="w-full h-full">
          <defs>
            <linearGradient id="dropletGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#bae6fd" />
              <stop offset="85%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="innerGleam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
          </defs>


          {/* Crown if goal achieved */}
          {isComplete && (
            <g transform="translate(32, -6) scale(0.7)">
              <polygon
                points="0,18 10,0 24,14 38,0 48,18 0,18"
                fill="#fbbf24"
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <circle cx="10" cy="0" r="2.5" fill="#fef08a" />
              <circle cx="24" cy="14" r="2" fill="#fef08a" />
              <circle cx="38" cy="0" r="2.5" fill="#fef08a" />
            </g>
          )}

          {/* Droplet Body */}
          <path
            d="M50,12 C50,12 16,56 16,80 C16,100 31,114 50,114 C69,114 84,100 84,80 C84,56 50,12 50,12 Z"
            fill="url(#dropletGradient)"
          />

          {/* Glass Highlight */}
          <path
            d="M50,22 C50,22 26,58 26,78 C26,92 34,104 46,106 C36,104 31,90 31,78 C31,60 50,22 50,22 Z"
            fill="url(#innerGleam)"
            opacity="0.75"
          />

          {/* Face */}
          {isBlinking ? (
            // Closed eyes (blink)
            <g stroke="#0f172a" strokeWidth="3" strokeLinecap="round">
              <path d="M36,78 Q42,82 48,78" />
              <path d="M56,78 Q62,82 68,78" />
            </g>
          ) : isExcited ? (
            // Joyful eyes (^ ^)
            <g stroke="#0c4a6e" strokeWidth="3.2" fill="none" strokeLinecap="round">
              <path d="M36,80 L42,74 L48,80" />
              <path d="M56,80 L62,74 L68,80" />
            </g>
          ) : (
            // Open cute sparkling eyes
            <g>
              <ellipse cx="41" cy="77" rx="3.8" ry="4.8" fill="#0c4a6e" />
              <circle cx="39.5" cy="75" r="1.6" fill="#ffffff" />
              <ellipse cx="61" cy="77" rx="3.8" ry="4.8" fill="#0c4a6e" />
              <circle cx="59.5" cy="75" r="1.6" fill="#ffffff" />
            </g>
          )}

          {/* Smile */}
          <path
            d={isExcited ? "M45,86 Q51,94 57,86" : "M46,87 Q51,91 56,87"}
            fill={isExcited ? "#0c4a6e" : "none"}
            stroke="#0c4a6e"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Blush */}
          <ellipse cx="33" cy="83" rx="4.5" ry="2.6" fill="#f43f5e" opacity="0.55" />
          <ellipse cx="69" cy="83" rx="4.5" ry="2.6" fill="#f43f5e" opacity="0.55" />
        </svg>
      </motion.div>
    </div>
  );
};
