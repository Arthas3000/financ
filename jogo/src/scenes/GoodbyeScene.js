// "Sair": navegadores só deixam fechar abas abertas por script, então tentamos
// window.close() e, se não der, mostramos uma tela de despedida.

import { VIEW_W, VIEW_H } from '../config/constants.js';
import { TitleScene } from './TitleScene.js';

export class GoodbyeScene {
  constructor(game) {
    this.game = game;
    this.t = 0;
  }

  enter() {
    try { window.close(); } catch { /* não permitido */ }
  }

  update(dt) {
    this.t += dt;
    if (this.t > 1 && (this.game.input.confirm() || this.game.input.pointer?.clicked)) {
      this.game.transitionTo(() => new TitleScene(this.game, { skipIntro: true }));
    }
  }

  draw(r) {
    const { font, time } = this.game;
    font.draw(r, 'OBRIGADO POR JOGAR!', VIEW_W / 2, VIEW_H / 2 - 20, { align: 'center', color: 'metal', scale: 2 });
    font.draw(r, 'PODE FECHAR ESTA ABA.', VIEW_W / 2, VIEW_H / 2 + 8, { align: 'center', color: 'cinza' });
    if (this.t > 1 && Math.floor(time * 2) % 2 === 0) {
      font.draw(r, 'PRESSIONE START PARA VOLTAR', VIEW_W / 2, VIEW_H / 2 + 32, { align: 'center', color: 'amarela' });
    }
  }
}
