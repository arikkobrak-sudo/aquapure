import type { WaterTheme } from '../types';


export const WATER_THEMES: Record<string, WaterTheme> = {
  aqua: {
    id: 'aqua',
    name: 'Aqua Crystal',
    subname: 'Гірське джерело',
    primary: '#38bdf8',
    secondary: '#0284c7',
    surfaceGlow: 'rgba(56, 189, 248, 0.4)',
    waveColor1: 'rgba(56, 189, 248, 0.65)',
    waveColor2: 'rgba(2, 132, 199, 0.85)',
    accentBg: 'from-cyan-500/10 to-blue-600/10',
  },
  mint: {
    id: 'mint',
    name: 'Mint Breeze',
    subname: 'Освіжаюча лагуна',
    primary: '#2dd4bf',
    secondary: '#0d9488',
    surfaceGlow: 'rgba(45, 212, 191, 0.4)',
    waveColor1: 'rgba(45, 212, 191, 0.65)',
    waveColor2: 'rgba(13, 148, 136, 0.85)',
    accentBg: 'from-teal-500/10 to-emerald-600/10',
  },
  rose: {
    id: 'rose',
    name: 'Rose Sunset',
    subname: 'Ніжний персик',
    primary: '#fb7185',
    secondary: '#e11d48',
    surfaceGlow: 'rgba(251, 113, 133, 0.4)',
    waveColor1: 'rgba(251, 113, 133, 0.65)',
    waveColor2: 'rgba(225, 29, 72, 0.85)',
    accentBg: 'from-rose-500/10 to-pink-600/10',
  },
  lavender: {
    id: 'lavender',
    name: 'Moonlight Dream',
    subname: 'Зоряна ніч',
    primary: '#a78bfa',
    secondary: '#7c3aed',
    surfaceGlow: 'rgba(167, 139, 250, 0.4)',
    waveColor1: 'rgba(167, 139, 250, 0.65)',
    waveColor2: 'rgba(124, 58, 237, 0.85)',
    accentBg: 'from-purple-500/10 to-indigo-600/10',
  },
};
