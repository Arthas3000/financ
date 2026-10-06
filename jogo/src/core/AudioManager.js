// Áudio com Web Audio API: música em loop sem emenda audível, crossfade entre
// faixas e efeitos sonoros com leve variação de tom para não soarem repetitivos.

export class AudioManager {
  constructor() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    this.ctx = Ctx ? new Ctx() : null;
    this.buffers = new Map();   // id → AudioBuffer
    this.meta = new Map();      // id → { volume, loop }
    this.lastPlay = new Map();  // id → tempo do último disparo (anti-empilhamento)
    this.music = null;          // { id, source, gain }
    this.muted = false;
    if (!this.ctx) return;
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    this.musicBus = this.ctx.createGain();
    this.musicBus.connect(this.master);
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.connect(this.master);
  }

  /** Navegadores só liberam áudio depois de um clique/tecla. */
  unlock() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  async load(id, url, meta = {}) {
    this.meta.set(id, { volume: meta.volume ?? 1, loop: !!meta.loop });
    if (!this.ctx) return;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Áudio não encontrado: ${url}`);
    const data = await res.arrayBuffer();
    // A forma com callbacks funciona também no Safari antigo.
    const buffer = await new Promise((ok, fail) => this.ctx.decodeAudioData(data, ok, fail));
    this.buffers.set(id, buffer);
  }

  /** Toca um efeito sonoro. `pitchVar` = variação aleatória de velocidade (0.05 = ±5%). */
  play(id, { volume = 1, rate = 1, pitchVar = 0.04, minGap = 0.03 } = {}) {
    const buffer = this.buffers.get(id);
    if (!buffer) return;
    const now = this.ctx.currentTime;
    if (now - (this.lastPlay.get(id) ?? -1) < minGap) return;
    this.lastPlay.set(id, now);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = rate * (1 + (Math.random() * 2 - 1) * pitchVar);
    const gain = this.ctx.createGain();
    gain.gain.value = volume * (this.meta.get(id)?.volume ?? 1);
    src.connect(gain).connect(this.sfxBus);
    src.start();
  }

  /** Troca a música com crossfade. Chamar com a mesma faixa já tocando não faz nada. */
  playMusic(id, { fade = 0.6 } = {}) {
    if (!this.ctx) return;
    if (this.music?.id === id) return;
    this.stopMusic(fade);
    const buffer = this.buffers.get(id);
    if (!buffer) return;
    const meta = this.meta.get(id);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = meta.loop;
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(meta.volume, now + Math.max(0.02, fade));
    src.connect(gain).connect(this.musicBus);
    src.start();
    this.music = { id, source: src, gain };
  }

  stopMusic(fade = 0.4) {
    if (!this.music) return;
    const { source, gain } = this.music;
    const now = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.02, fade));
    source.stop(now + fade + 0.05);
    this.music = null;
  }

  /** Abafa a música (ex.: pausa) sem pará-la. */
  duckMusic(on) {
    if (!this.ctx) return;
    this.musicBus.gain.setTargetAtTime(on ? 0.35 : 1, this.ctx.currentTime, 0.05);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.02);
    return this.muted;
  }
}
