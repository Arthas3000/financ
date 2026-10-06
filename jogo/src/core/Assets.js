// Carrega tudo o que está em assets/manifest.json.
// O "id" de cada asset é o caminho sem extensão: 'personagens/kanka/correndo'.

import { ASSET_ROOT } from '../config/constants.js';

const stripExt = (path) => path.replace(/\.[^.]+$/, '');

export class Assets {
  constructor(audio) {
    this.audio = audio;
    this.manifest = null;
    this.sprites = new Map(); // id → { image, frameW, frameH, frames, fps, loop }
    this.data = new Map();    // id → objeto JSON
    this.missing = [];
  }

  async loadManifest() {
    const res = await fetch(ASSET_ROOT + 'manifest.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Não foi possível ler assets/manifest.json');
    this.manifest = await res.json();
  }

  /** Lista plana de entradas do manifesto. */
  entries(kind) {
    return this.manifest[kind].flatMap((group) => group.itens);
  }

  /**
   * Carrega um subconjunto (ex.: só o que a tela de carregamento precisa).
   * `onProgress(0..1)` é chamado a cada arquivo concluído.
   */
  async load({ bootOnly = false, onProgress = () => {} } = {}) {
    const images = this.entries('imagens').filter((e) => !!e.boot === bootOnly);
    const sounds = bootOnly ? [] : this.entries('audio');
    const data = bootOnly ? this.manifest.dados : [];
    const total = images.length + sounds.length + data.length;
    let done = 0;
    const tick = () => onProgress(++done / Math.max(1, total));

    const jobs = [
      ...images.map((e) => this._loadImage(e).then(tick)),
      ...sounds.map((e) =>
        this.audio
          .load(stripExt(e.arquivo), ASSET_ROOT + e.arquivo, e)
          .catch((err) => this._warn(e.arquivo, err))
          .then(tick)),
      ...data.map((file) =>
        fetch(ASSET_ROOT + file)
          .then((r) => r.json())
          .then((json) => this.data.set(stripExt(file), json))
          .catch((err) => this._warn(file, err))
          .then(tick)),
    ];
    await Promise.all(jobs);
  }

  _loadImage(entry) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const [frameW, frameH] = entry.quadro ?? [img.width, img.height];
        this.sprites.set(stripExt(entry.arquivo), {
          image: img,
          frameW,
          frameH,
          frames: entry.quadros ?? 1,
          fps: entry.fps ?? 0,
          loop: entry.loop ?? false,
        });
        resolve();
      };
      // Um asset faltando não derruba o jogo: ele só não aparece (e avisamos no console).
      img.onerror = () => { this._warn(entry.arquivo, 'arquivo não encontrado'); resolve(); };
      img.src = ASSET_ROOT + entry.arquivo;
    });
  }

  _warn(file, err) {
    this.missing.push(file);
    console.warn(`[assets] ${file}: ${err}`);
  }

  sprite(id) { return this.sprites.get(id) ?? null; }
  json(id) { return this.data.get(id) ?? null; }
}
