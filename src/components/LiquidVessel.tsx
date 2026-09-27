import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CompanionDroplet } from './CompanionDroplet';
import type { WaterTheme } from '../types';
import { sound } from '../utils/sound';

interface LiquidVesselProps {
  total: number;
  goal: number;
  theme: WaterTheme;
  onTriggerEasterEgg: () => void;
  isExcited: boolean;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  alpha: number;
  wobble: number;
  wobbleSpeed: number;
}

export const LiquidVessel: React.FC<LiquidVesselProps> = ({
  total,
  goal,
  theme,
  onTriggerEasterEgg,
  isExcited,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Percent ratio
  const ratio = Math.min(1.02, total / (goal || 2000));
  const percent = Math.min(100, Math.round((total / (goal || 2000)) * 100));

  // Current liquid Y coordinate for positioning the companion
  const [companionY, setCompanionY] = useState<number>(200);

  // Long press handling for the romantic easter egg
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [pressProgress, setPressProgress] = useState<number>(0);
  const pressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLongPress = useCallback(() => {
    setIsPressing(true);
    setPressProgress(0);

    const startTime = Date.now();
    const duration = 1200;

    pressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const prog = Math.min(1, elapsed / duration);
      setPressProgress(prog);
      if (prog >= 1) {
        clearInterval(pressIntervalRef.current!);
      }
    }, 30);

    longPressTimerRef.current = setTimeout(() => {
      setIsPressing(false);
      setPressProgress(0);
      sound.playHeartbeat();
      onTriggerEasterEgg();
    }, duration);
  }, [onTriggerEasterEgg]);

  const cancelLongPress = useCallback(() => {
    setIsPressing(false);
    setPressProgress(0);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (pressIntervalRef.current) {
      clearInterval(pressIntervalRef.current);
      pressIntervalRef.current = null;
    }
  }, []);

  // Canvas wave animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = 230;
    const height = 230;
    canvas.width = width * 2; // Retina scale
    canvas.height = height * 2;
    ctx.scale(2, 2);

    let currentY = height - ratio * height * 0.88 - 12;
    let wavePhase = 0;
    let waveImpulse = isExcited ? 14 : 3.5;

    // Bubbles pool
    const bubbles: Bubble[] = [];
    const spawnBubble = (extraY?: number) => {
      bubbles.push({
        x: Math.random() * (width - 36) + 18,
        y: extraY !== undefined ? extraY : height - 8,
        radius: Math.random() * 2 + 1,
        speed: Math.random() * 1.1 + 0.7,
        alpha: Math.random() * 0.5 + 0.3,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.05 + 0.03,
      });
    };

    // Initial bubbles
    for (let i = 0; i < 7; i++) {
      spawnBubble(Math.random() * height * 0.5 + height * 0.5);
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const targetY = height - ratio * height * 0.87 - 12;
      currentY += (targetY - currentY) * 0.06;
      wavePhase += 0.032;

      // Dampen impulse
      if (waveImpulse > 3.2) {
        waveImpulse *= 0.975;
      }

      setCompanionY(currentY);

      // Random bubble spawn
      if (Math.random() < 0.08 && bubbles.length < 22 && ratio > 0.05) {
        spawnBubble();
      }

      // Clip to circular vessel inner body
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, width / 2 - 5, 0, Math.PI * 2);
      ctx.clip();

      if (ratio > 0.01) {
        // Back Wave
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 4) {
          const y =
            currentY +
            Math.sin(x * 0.024 + wavePhase + 1.2) * (waveImpulse * 0.7) +
            Math.cos(x * 0.016 + wavePhase * 0.8) * 2.5;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = theme.waveColor2;
        ctx.fill();

        // Front Wave
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 4) {
          const y =
            currentY +
            Math.sin(x * 0.03 + wavePhase) * waveImpulse +
            Math.cos(x * 0.02 + wavePhase * 1.1) * 2.5;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        // Gradient for front wave
        const grad = ctx.createLinearGradient(0, currentY, 0, height);
        grad.addColorStop(0, theme.waveColor1);
        grad.addColorStop(1, theme.waveColor2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Wave surface crest glow (meniscus highlight)
        ctx.beginPath();
        for (let x = 0; x <= width; x += 4) {
          const y =
            currentY +
            Math.sin(x * 0.03 + wavePhase) * waveImpulse +
            Math.cos(x * 0.02 + wavePhase * 1.1) * 2.5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = theme.surfaceGlow;
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Render Bubbles
        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];
          b.y -= b.speed;
          b.wobble += b.wobbleSpeed;
          const wobbleX = b.x + Math.sin(b.wobble) * 2;

          // Pop if above surface
          if (b.y <= currentY + 4) {
            bubbles.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(wobbleX, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha})`;
          ctx.fill();

          // Bubble highlight
          ctx.beginPath();
          ctx.arc(wobbleX - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
        }
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [ratio, theme, isExcited]);

  return (
    <div className="relative flex flex-col items-center justify-center my-auto select-none flex-shrink-0">
      {/* Outer Glow Halo based on water theme */}
      <div
        className="absolute w-60 h-60 rounded-full transition-all duration-700 blur-3xl opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${theme.primary} 0%, transparent 70%)`,
        }}
      />

      {/* Long Press Circular Progress Indicator */}
      {isPressing && (
        <svg className="absolute w-[248px] h-[248px] -rotate-90 pointer-events-none z-20">
          <circle
            cx="124"
            cy="124"
            r="118"
            fill="none"
            stroke="rgba(244, 63, 94, 0.8)"
            strokeWidth="3.5"
            strokeDasharray={2 * Math.PI * 118}
            strokeDashoffset={2 * Math.PI * 118 * (1 - pressProgress)}
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Glass Vessel Sphere Container */}
      <motion.div
        ref={containerRef}
        onMouseDown={startLongPress}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onTouchCancel={cancelLongPress}
        animate={isPressing ? { scale: 0.96 } : { scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        className="relative w-[230px] h-[230px] rounded-full p-2 cursor-pointer backdrop-blur-xl bg-slate-900/50 border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_0_20px_rgba(255,255,255,0.12)] overflow-hidden transition-shadow"
      >
        {/* Canvas for liquid wave and bubbles */}
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-full block pointer-events-none"
        />

        {/* Floating Companion on the water surface */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-auto transition-all duration-150 ease-out z-10"
          style={{
            top: `${Math.max(30, Math.min(175, companionY - 44))}px`,
          }}
        >
          <CompanionDroplet
            isExcited={isExcited}
            isComplete={percent >= 100}
            waterPercent={percent}
          />
        </div>

        {/* Glass Specular Gloss Highlight (top left curved reflection) */}
        <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-br from-white/30 via-white/5 to-transparent opacity-90" />

        {/* Bottom subtle rim reflection */}
        <div className="absolute inset-x-6 bottom-2 h-10 rounded-full pointer-events-none bg-gradient-to-t from-white/15 to-transparent blur-sm" />

        {/* Inner Glass Rim Shadow */}
        <div className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_2px_6px_rgba(255,255,255,0.3),inset_0_-6px_12px_rgba(0,0,0,0.5)]" />
      </motion.div>

      {/* Numerical Progress Display */}
      <div className="mt-3 flex flex-col items-center">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm font-sans">
            {total.toLocaleString('uk-UA')}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            / {goal.toLocaleString('uk-UA')} мл
          </span>
        </div>

        {/* Percent Pill */}
        <div className="mt-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: theme.primary }}
          />
          <span className="text-[11px] font-semibold text-slate-300">
            {percent}% виконано
          </span>
        </div>
      </div>
    </div>
  );
};
