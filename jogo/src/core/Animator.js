// Toca animações a partir das tiras de sprites do manifesto.
// Cada personagem/inimigo tem uma pasta; o nome da animação é o nome do arquivo:
//   new Animator(assets, 'personagens/kanka/').play('correndo')

export class Animator {
  constructor(assets, basePath) {
    this.assets = assets;
    this.basePath = basePath;
    this.name = null;
    this.sprite = null;
    this.time = 0;
    this.frame = 0;
    this.prevFrame = -1;
    this.speed = 1;
    this.finished = false;
  }

  /** Troca de animação. Se já estiver tocando, continua de onde estava (a menos que restart). */
  play(name, { restart = false, speed = 1 } = {}) {
    this.speed = speed;
    if (this.name === name && !restart) return;
    this.name = name;
    this.sprite = this.assets.sprite(this.basePath + name);
    this.time = 0;
    this.frame = 0;
    this.prevFrame = -1;
    this.fresh = true; // o 1º update não deve "engolir" a entrada no quadro 0
    this.finished = false;
  }

  update(dt) {
    const s = this.sprite;
    if (this.fresh) this.fresh = false;
    else this.prevFrame = this.frame;
    if (!s || s.fps <= 0) return;
    this.time += dt * this.speed;
    let f = Math.floor(this.time * s.fps);
    if (s.loop) f %= s.frames;
    else if (f >= s.frames) { f = s.frames - 1; this.finished = true; }
    this.frame = f;
  }

  /** Verdadeiro só no passo em que a animação ENTROU no quadro `index` (para disparar eventos). */
  entered(index) { return this.frame === index && this.prevFrame !== index; }

  /** Duração total (segundos) da animação atual. */
  get duration() { return this.sprite ? this.sprite.frames / Math.max(1, this.sprite.fps) : 0; }

  /** Desenha com os pés (centro inferior do quadro) em (footX, footY). */
  draw(r, footX, footY, opts = {}) {
    const s = this.sprite;
    if (!s) return;
    r.frame(s, this.frame, footX - s.frameW / 2, footY - s.frameH, opts);
  }
}
