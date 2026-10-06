// Loop principal com passo fixo + gerenciador de cenas com transição em fade.
//
// Por que passo fixo? A física roda sempre a 60 Hz, então o pulo tem a mesma altura
// num monitor de 60 Hz ou de 144 Hz, e a jogabilidade fica determinística.

import { FIXED_DT } from '../config/constants.js';

const MAX_STEPS_PER_FRAME = 5; // evita "espiral da morte" se a aba travar

export class Game {
  constructor({ renderer, input, audio, assets, font }) {
    this.renderer = renderer;
    this.input = input;
    this.audio = audio;
    this.assets = assets;
    this.font = font;
    this.scene = null;
    this.transition = null; // { phase: 'out'|'in', t, duration, next, color }
    this.accumulator = 0;
    this.lastTime = 0;
    this.time = 0; // tempo total de jogo (segundos), útil para animações de UI
    this._frame = this._frame.bind(this);
  }

  start(scene) {
    this.setScene(scene);
    requestAnimationFrame((t) => { this.lastTime = t; requestAnimationFrame(this._frame); });
  }

  /** Troca imediata de cena. */
  setScene(scene) {
    this.scene?.exit?.();
    this.scene = scene;
    scene.enter?.();
  }

  /**
   * Troca com fade: escurece, troca a cena, clareia.
   * `makeScene` é uma função para a nova cena só ser criada no meio do fade.
   */
  transitionTo(makeScene, { duration = 0.35, color = '#000' } = {}) {
    if (this.transition) return;
    this.transition = { phase: 'out', t: 0, duration, makeScene, color };
  }

  get transitioning() { return !!this.transition; }

  _frame(now) {
    const elapsed = Math.min(0.25, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.accumulator += elapsed;

    let steps = 0;
    while (this.accumulator >= FIXED_DT && steps < MAX_STEPS_PER_FRAME) {
      this._update(FIXED_DT);
      this.accumulator -= FIXED_DT;
      steps++;
    }
    if (steps === MAX_STEPS_PER_FRAME) this.accumulator = 0;

    this._draw();
    requestAnimationFrame(this._frame);
  }

  _update(dt) {
    this.input.update();
    this.time += dt;
    if (this.input.pressed('mute')) this.audio.toggleMute();

    const tr = this.transition;
    if (tr) {
      tr.t += dt;
      if (tr.phase === 'out' && tr.t >= tr.duration) {
        this.setScene(tr.makeScene());
        tr.phase = 'in';
        tr.t = 0;
      } else if (tr.phase === 'in' && tr.t >= tr.duration) {
        this.transition = null;
      }
      // Durante o fade de saída a cena antiga congela; no de entrada a nova já anima.
      if (tr.phase === 'out') return;
    }
    this.scene?.update(dt);
  }

  _draw() {
    const r = this.renderer;
    r.clear();
    this.scene?.draw(r);
    const tr = this.transition;
    if (tr) {
      const p = Math.min(1, tr.t / tr.duration);
      r.fade(tr.phase === 'out' ? p : 1 - p, tr.color);
    }
  }
}
