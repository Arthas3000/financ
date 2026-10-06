// Final do jogo: o herói comemora sobre a floresta e os créditos sobem.

import { VIEW_W, VIEW_H } from '../config/constants.js';
import { CHARACTERS } from '../config/characters.js';
import { Animator } from '../core/Animator.js';
import { Parallax } from '../world/Parallax.js';
import { TitleScene } from './TitleScene.js';
import { saveHighScore, loadHighScore } from './highscore.js';

const CREDITS = [
  'PARABÉNS!',
  '',
  'A FLORESTA ESTÁ SALVA',
  'DOS MECÂNICOS DA',
  'LOGMAX E DA PONSSEE.',
  '',
  'ESTRELANDO',
  'SAMURAI JEFF',
  'KANKA',
  'PAULINHO',
  '',
  'OBRIGADO POR JOGAR!',
];

export class EndingScene {
  constructor(game, { characterId, score }) {
    this.game = game;
    this.score = score;
    this.def = CHARACTERS[characterId];
    this.anim = new Animator(game.assets, this.def.sprites);
    this.anim.play('vitoria');
    this.parallax = new Parallax(game.assets, 'cenarios/fase2/');
    this.newRecord = score > loadHighScore();
    saveHighScore(score);
    this.t = 0;
  }

  enter() { this.game.audio.playMusic('audio/musica/final'); }

  update(dt) {
    this.t += dt;
    this.anim.update(dt);
    if (this.t > 3 && (this.game.input.confirm() || this.t > 30)) {
      this.t = -999; // evita disparar duas vezes
      this.game.transitionTo(() => new TitleScene(this.game), { duration: 1 });
    }
  }

  draw(r) {
    const { font, time } = this.game;
    this.parallax.drawBack(r, time * 20, 24);
    r.fade(0.35);
    this.anim.draw(r, 70, 190);
    const scroll = Math.max(0, this.t) * 14;
    CREDITS.forEach((line, i) => {
      const y = Math.round(VIEW_H + 10 + i * 14 - scroll);
      if (y < -12 || y > VIEW_H) return;
      font.draw(r, line, VIEW_W / 2 + 40, y, { align: 'center', color: i === 0 ? 'metal' : 'branca', scale: i === 0 ? 2 : 1 });
    });
    font.draw(r, `PONTOS ${String(this.score).padStart(6, '0')}`, VIEW_W - 8, 8, { align: 'right', color: 'amarela' });
    if (this.newRecord && Math.floor(time * 3) % 2 === 0) {
      font.draw(r, 'NOVO RECORDE!', VIEW_W - 8, 20, { align: 'right', color: 'vermelha' });
    }
  }
}
