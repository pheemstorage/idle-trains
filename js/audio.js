// Procedural Web Audio API SFX Engine for Idle Trains: Bangkok
// Zero external audio assets — pure browser-native synthesis with anti-clip staging.

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.compressor = null;
    this.muted = false;
    this.rainGain = null;
    this.rainSource = null;
    this.targetRainLevel = 0;
    this._noiseBuffer = null;
    this._lastClackAt = 0;
    this._lastAngryAt = 0;

    try {
      const savedMute = localStorage.getItem('idle_trains_muted');
      if (savedMute === '1') this.muted = true;
    } catch (_) {}
  }

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      this.ctx = new AudioCtx();
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -14;
      this.compressor.knee.value = 18;
      this.compressor.ratio.value = 4;
      this.compressor.attack.value = 0.005;
      this.compressor.release.value = 0.15;

      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0.0001 : 0.68;

      this.compressor.connect(this.master);
      this.master.connect(this.ctx.destination);

      this._createNoiseBuffer();
      this._initRainLoop();
    } catch (_) {
      this.ctx = null;
    }
  }

  _createNoiseBuffer() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const len = sampleRate * 2;
    const buf = this.ctx.createBuffer(1, len, sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this._noiseBuffer = buf;
  }

  _initRainLoop() {
    if (!this.ctx || !this._noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer;
    src.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1450;
    filter.Q.value = 0.55;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.0001;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);
    src.start();

    this.rainSource = src;
    this.rainGain = gain;
    this.setRainLevel(this.targetRainLevel);
  }

  setRainLevel(level) {
    this.targetRainLevel = Math.max(0, Math.min(1, level));
    if (!this.ctx || !this.rainGain) return;
    const now = this.ctx.currentTime;
    const target = this.targetRainLevel > 0.01 ? 0.02 + this.targetRainLevel * 0.085 : 0.0001;
    this.rainGain.gain.cancelScheduledValues(now);
    this.rainGain.gain.setTargetAtTime(target, now, 0.45);
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('idle_trains_muted', this.muted ? '1' : '0');
    } catch (_) {}
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(this.muted ? 0.0001 : 0.68, now, 0.03);
    }
    if (!this.muted) {
      this.unlock();
      this.playTick();
    }
    return this.muted;
  }

  _canPlay() {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return false;
    return true;
  }

  _tone(freq, startOffset, dur, type = 'sine', peak = 0.14, freqEnd = null) {
    if (!this._canPlay()) return;
    const t0 = this.ctx.currentTime + startOffset;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + dur);
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + Math.min(0.014, dur * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  playTick() {
    this._tone(740, 0, 0.04, 'sine', 0.075, 260);
  }

  playCoin() {
    this._tone(1174.66, 0, 0.09, 'triangle', 0.11);
    this._tone(1567.98, 0.055, 0.16, 'sine', 0.12);
  }

  // Iconic Thailand 7-Eleven welcome door chime (bright two-tone melodic ding-dong!)
  playSevenElevenChime() {
    if (!this._canPlay()) return;
    const notes = [
      { f: 659.25, t: 0.0, d: 0.28 },   // E5
      { f: 523.25, t: 0.16, d: 0.28 },  // C5
      { f: 587.33, t: 0.32, d: 0.22 },  // D5
      { f: 392.0,  t: 0.48, d: 0.42 },  // G4
    ];
    for (const n of notes) {
      this._tone(n.f, n.t, n.d, 'sine', 0.14);
      this._tone(n.f * 2, n.t, n.d * 0.55, 'triangle', 0.045);
    }
  }

  // Bangkok BTS / MRT crisp resonant platform arrival chime
  playBtsChime() {
    if (!this._canPlay()) return;
    const partials = [1.0, 2.0, 2.76];
    const base1 = 783.99; // G5
    const base2 = 622.25; // Eb5
    partials.forEach((p, idx) => {
      const amp = 0.09 / (idx + 1);
      this._tone(base1 * p, 0.0, 0.42 / (idx * 0.5 + 1), 'sine', amp);
      this._tone(base2 * p, 0.21, 0.55 / (idx * 0.5 + 1), 'sine', amp);
    });
  }

  playTrainClack() {
    if (!this._canPlay() || !this._noiseBuffer) return;
    const nowMs = performance.now();
    if (nowMs - this._lastClackAt < 1800) return;
    this._lastClackAt = nowMs;

    const scheduleClick = (offset) => {
      const t0 = this.ctx.currentTime + offset;
      const src = this.ctx.createBufferSource();
      src.buffer = this._noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 620;
      filter.Q.value = 3.0;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.045, t0 + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);
      src.start(t0);
      src.stop(t0 + 0.055);
    };
    scheduleClick(0);
    scheduleClick(0.11);
  }

  playBuildStart() {
    this._tone(240, 0, 0.08, 'square', 0.07, 160);
    this._tone(340, 0.07, 0.09, 'triangle', 0.09, 440);
    this._tone(520, 0.14, 0.11, 'sine', 0.08);
  }

  playStationComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      this._tone(f, i * 0.085, 0.34, 'triangle', 0.12);
      this._tone(f * 2, i * 0.085, 0.18, 'sine', 0.04);
    });
  }

  playSkywalkUnlock() {
    const notes = [587.33, 739.99, 880.0, 1174.66, 1479.98];
    notes.forEach((f, i) => {
      this._tone(f, i * 0.065, 0.38, 'sine', 0.11);
    });
  }

  playBreakdownAlarm() {
    this._tone(420, 0, 0.14, 'sawtooth', 0.09, 290);
    this._tone(420, 0.19, 0.16, 'sawtooth', 0.09, 250);
  }

  playRepairDone() {
    this._tone(580, 0, 0.055, 'triangle', 0.09, 760);
    this._tone(880, 0.07, 0.16, 'sine', 0.12);
    this._tone(1318.5, 0.15, 0.22, 'sine', 0.11);
  }

  playAngryBuzz() {
    const nowMs = performance.now();
    if (nowMs - this._lastAngryAt < 4500) return;
    this._lastAngryAt = nowMs;
    this._tone(210, 0, 0.18, 'sawtooth', 0.055, 145);
  }

  playBoatHorn() {
    this._tone(164.81, 0, 0.55, 'triangle', 0.11, 158);
    this._tone(246.94, 0.02, 0.52, 'sine', 0.07, 240);
  }

  playThunder() {
    if (!this._canPlay() || !this._noiseBuffer) return;
    const t0 = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(190, t0);
    filter.frequency.exponentialRampToValueAtTime(52, t0 + 1.6);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(0.24, t0 + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.85);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);
    src.start(t0);
    src.stop(t0 + 1.9);
  }
}

export const sound = new SoundEngine();
