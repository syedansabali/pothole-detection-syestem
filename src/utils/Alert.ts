// Multi-Tone Automotive Audio Synthesizer (Web Audio API)
class SoundAlertManager {
  private ctx: AudioContext | null = null;
  private lastWarningTime = 0;
  private lastSpeedAlertTime = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. Critical Proximity / Impact Beep (<= 6m Pothole)
  playCollisionWarning(frequency = 1046.5) {
    const now = Date.now();
    if (now - this.lastWarningTime < 450) return;
    this.lastWarningTime = now;

    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio beep blocked:', e);
    }
  }

  // 2. High-Confidence Detection Ping (Camera/AI hit)
  playDetectionPing() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1760, this.ctx.currentTime); // High affirmative ping
      osc.frequency.exponentialRampToValueAtTime(2200, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('Audio ping blocked:', e);
    }
  }

  // 3. Over-Speed Warning Tone (Double low-freq alert)
  playOverSpeedAlert() {
    const now = Date.now();
    if (now - this.lastSpeedAlertTime < 2500) return; // 2.5s cooldown
    this.lastSpeedAlertTime = now;

    try {
      this.initContext();
      if (!this.ctx) return;

      [0, 0.14].forEach((delay) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, this.ctx!.currentTime + delay);

        gain.gain.setValueAtTime(0.12, this.ctx!.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + delay + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + delay);
        osc.stop(this.ctx!.currentTime + delay + 0.1);
      });
    } catch (e) {
      console.warn('Audio speed alert blocked:', e);
    }
  }

  // 4. UI Click / Dispatch Feedback Tone
  playActionClick() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio click blocked:', e);
    }
  }
}

export const alertBuzzer = new SoundAlertManager();