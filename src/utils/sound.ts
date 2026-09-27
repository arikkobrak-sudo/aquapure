// Procedural Web Audio API sound generator for tactile water ASMR
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Soft tactile water bubble 'bloop'
  public playBubble(pitchMultiplier: number = 1.0) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600 * pitchMultiplier, now);
      filter.Q.setValueAtTime(3.5, now);

      osc.type = 'sine';
      const startFreq = 260 * pitchMultiplier;
      const endFreq = 720 * pitchMultiplier;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.11);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Water pouring splash with subtle staggered bubbles
  public playPour() {
    if (!this.enabled) return;
    this.playBubble(0.85);
    setTimeout(() => this.playBubble(1.15), 60);
    setTimeout(() => this.playBubble(1.4), 130);
  }

  // Crystal glass celebration chime (C6 - E6 - G6 chord)
  public playCrystalChime() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const freqs = [1046.5, 1318.51, 1567.98]; // C6, E6, G6
      const baseTime = this.ctx.currentTime;

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, baseTime + idx * 0.05);

        const startTime = baseTime + idx * 0.05;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.7);
      });
    } catch {
      // AudioContext fallback
    }
  }

  // Romantic gentle heartbeat for easter egg
  public playHeartbeat() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const playThump = (timeOffset: number, freq: number, vol: number) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + timeOffset;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
      };

      playThump(0, 68, 0.22);
      playThump(0.18, 55, 0.16);
    } catch {
      // AudioContext fallback
    }
  }
}

export const sound = new SoundEngine();
