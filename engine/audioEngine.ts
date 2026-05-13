/**
 * Audio Engine — Phase 3
 * Procedurally generates all sounds using Web Audio API.
 * No audio files needed. Everything is synthesized.
 *
 * Sounds:
 *  thud     — low-frequency impact boom
 *  glitch   — rapid pitched noise burst
 *  drone    — sustained ominous hum
 *  ping     — clean notification chime
 *  static   — white noise crackle
 *  heartbeat— slow horror LFO beat
 *  error    — descending error tone
 */

class AudioEngineClass {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isUnlocked = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4;
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  /** Must be called from a user gesture to unlock AudioContext */
  unlock(): void {
    if (this.isUnlocked) return;
    const ctx = this.getContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
    this.isUnlocked = true;
  }

  setMasterVolume(vol: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        Math.min(1, Math.max(0, vol)),
        this.getContext()!.currentTime,
        0.1
      );
    }
  }

  private output(): GainNode | null {
    return this.masterGain;
  }

  playThud(intensity: number): void {
    const ctx = this.getContext();
    if (!ctx || !this.output()) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120 * intensity + 40, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);
    gain.gain.setValueAtTime(0.8 * intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(this.output()!);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  playGlitch(intensity: number): void {
    const ctx = this.getContext();
    if (!ctx || !this.output()) return;
    const t = ctx.currentTime;

    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      const freq = 300 + Math.random() * 2000;
      osc.frequency.setValueAtTime(freq, t + i * 0.03);
      osc.frequency.setValueAtTime(freq * 0.5, t + i * 0.03 + 0.015);
      gain.gain.setValueAtTime(0.15 * intensity, t + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.03 + 0.05);
      osc.connect(gain);
      gain.connect(this.output()!);
      osc.start(t + i * 0.03);
      osc.stop(t + i * 0.03 + 0.06);
    }
  }

  playDrone(intensity: number, duration: number = 2): void {
    const ctx = this.getContext();
    if (!ctx || !this.output()) return;
    const t = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = "sawtooth";
    osc2.type = "sawtooth";
    osc1.frequency.value = 55;
    osc2.frequency.value = 55.8; // slight detune for thickness

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.linearRampToValueAtTime(400 * intensity, t + duration * 0.5);
    filter.frequency.linearRampToValueAtTime(100, t + duration);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25 * intensity, t + 0.5);
    gain.gain.linearRampToValueAtTime(0, t + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.output()!);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
  }

  playPing(intensity: number): void {
    const ctx = this.getContext();
    if (!ctx || !this.output()) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.3);
    gain.gain.setValueAtTime(0.3 * intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc.connect(gain);
    gain.connect(this.output()!);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  playStatic(intensity: number): void {
    const ctx = this.getContext();
    if (!ctx || !this.output()) return;
    const t = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2000 + Math.random() * 1000;
    filter.Q.value = 0.5;

    source.buffer = buffer;
    gain.gain.setValueAtTime(0.4 * intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.output()!);
    source.start(t);
  }

  playHeartbeat(intensity: number): void {
    const ctx = this.getContext();
    if (!ctx || !this.output()) return;
    const t = ctx.currentTime;

    const playBeat = (delay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(80, t + delay);
      osc.frequency.exponentialRampToValueAtTime(40, t + delay + 0.08);
      gain.gain.setValueAtTime(0.6 * intensity, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.15);
      osc.connect(gain);
      gain.connect(this.output()!);
      osc.start(t + delay);
      osc.stop(t + delay + 0.2);
    };

    playBeat(0);
    playBeat(0.2);
  }

  playError(intensity: number): void {
    const ctx = this.getContext();
    if (!ctx || !this.output()) return;
    const t = ctx.currentTime;

    const freqs = [440, 349, 262];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15 * intensity, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.1);
      osc.connect(gain);
      gain.connect(this.output()!);
      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.12);
    });
  }

  play(type: string, intensity: number): void {
    if (!this.isUnlocked) return;
    try {
      switch (type) {
        case "thud":      this.playThud(intensity); break;
        case "glitch":    this.playGlitch(intensity); break;
        case "drone":     this.playDrone(intensity); break;
        case "ping":      this.playPing(intensity); break;
        case "static":    this.playStatic(intensity); break;
        case "heartbeat": this.playHeartbeat(intensity); break;
        case "error":     this.playError(intensity); break;
      }
    } catch {
      // AudioContext may be blocked — fail silently
    }
  }
}

export const audioEngine = new AudioEngineClass();