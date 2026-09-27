export interface WaterLog {
  id: string;
  amount: number; // in ml
  timestamp: number;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  total: number; // in ml
  goal: number; // in ml
  logs: WaterLog[];
}

export interface WaterTheme {
  id: string;
  name: string;
  subname: string;
  primary: string;
  secondary: string;
  surfaceGlow: string;
  waveColor1: string;
  waveColor2: string;
  accentBg: string;
}

export interface UserSettings {
  userName: string;
  dailyGoal: number; // default 2000 ml
  soundEnabled: boolean;
  themeId: string;
  customLoveNote: string;
}
