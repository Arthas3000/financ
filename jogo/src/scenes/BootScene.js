// Tela de carregamento: carrega todos os assets mostrando o progresso.

import { VIEW_W, VIEW_H } from '../config/constants.js';
import { TitleScene } from './TitleScene.js';

export class BootScene {
  constructor(game) {
    this.game = game;
    this.progress = 0;
    this.shown = 0;
    this.done = false;
    this.t = 0;
  }

  enter() {
    this.game.assets.load({ onProgress: (p) => { this.progress = p; } }).then(() => { this.done = true; });
  }

  update(dt) {
    this.t += dt;
    // A barra anda suave até o progresso real.
    this.shown += (this.progress - this.shown) * Math.min(1, dt * 10);
    if (this.done && this.shown > 0.98 && this.t > 0.5) {
      this.game.transitionTo(() => new TitleScene(this.game), { duration: 0.4 });
      this.done = false;
    }
  }

  draw(r) {
    const { assets, font } = this.game;
    const frame = assets.sprite('ui/carregando_moldura');
    const bar = assets.sprite('ui/carregando_barra');
    const x = Math.round((VIEW_W - 128) / 2), y = Math.round(VIEW_H / 2);
    font.draw(r, 'CARREGANDO', VIEW_W / 2, y - 16, { align: 'center', color: 'amarela' });
    r.image(frame, x, y);
    if (bar) r.crop(bar, 0, 0, Math.round(bar.image.width * this.shown), bar.image.height, x + 2, y + 2);
    font.draw(r, `${Math.round(this.shown * 100)}%`, VIEW_W / 2, y + 16, { align: 'center', color: 'cinza' });
  }
}
