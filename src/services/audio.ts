// Web Audio API Sound Synthesizer for Kitchen and Order Alerts

class SoundEffectsService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  // Crisp kitchen bell chime (Double Ding for incoming kitchen tickets)
  public playKitchenBell() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1 (E6 - 1318.5 Hz)
      this.playTone(ctx, 1318.5, now, 0.45, 0.35);
      // Note 2 (B6 - 1975.5 Hz)
      this.playTone(ctx, 1975.5, now + 0.14, 0.55, 0.3);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Pleasant notification chime for client ("Pedido Pronto!" / "Em Fritura")
  public playStatusUpdateChime() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Arpeggio C6 -> G6 -> C7
      this.playTone(ctx, 1046.5, now, 0.25, 0.2);
      this.playTone(ctx, 1567.98, now + 0.1, 0.25, 0.2);
      this.playTone(ctx, 2093.0, now + 0.22, 0.45, 0.25);
    } catch {
      // Audio context might be restricted
    }
  }

  // Cash register / checkout success chime
  public playCashRegisterSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      this.playTone(ctx, 987.77, now, 0.15, 0.25);
      this.playTone(ctx, 1318.51, now + 0.08, 0.35, 0.3);
    } catch {
      // Audio context might be restricted
    }
  }

  private playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number, gainVal: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const soundEffects = new SoundEffectsService();
