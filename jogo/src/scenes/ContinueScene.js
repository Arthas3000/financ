// "CONTINUAR?" com contagem regressiva de fliperama. START continua a fase atual
// (vidas cheias, pontuação zerada, como numa ficha nova); deixar zerar = GAME OVER.

import { VIEW_W, VIEW_H, RULES } from '../config/constants.js';
import { CHARACTERS } from '../config/characters.js';
import { clamp, easeOutBack } from '../core/math.js';
import { GameScene } from './GameScene.js';
import { TitleScene } from './TitleScene.js';
import { saveHighScore } from './highscore.js';

export class ContinueScene {
  constructor(game, { characterId, phaseIndex, score }) {
    this.game = game;
    this.characterId = characterId;
    this.phaseIndex = phaseIndex;
    this.score = score;
    this.count = RULES.continueSeconds + 0.99;
    this.t = 0;
    this.state = 'counting'; // counting | gameover | leaving
    saveHighScore(score);
  }

  enter() { this.game.audio.playMusic('audio/musica/selecao'); }

  update(dt) {
    this.t += dt;
    const { input, audio } = this.game;
    if (this.state === 'counting') {
      const before = Math.floor(this.count);
      this.count -= input.pressed('jump') || input.pressed('attack') ? 1 : dt; // apertar pula 1 segundo
      if (Math.floor(this.count) !== before) audio.play('audio/sfx/ui_tique', { pitchVar: 0 });
      if (this.t > 0.5 && (input.pressed('start') || input.pointer?.clicked)) {
        audio.play('audio/sfx/ui_ficha', { pitchVar: 0 });
        this.state = 'leaving';
        this.game.transitionTo(() => new GameScene(this.game, { characterId: this.characterId, phaseIndex: this.phaseIndex }));
      } else if (this.count < 0) {
        this.state = 'gameover';
        this.t = 0;
        audio.stopMusic(0.1);
        audio.playMusic('audio/musica/game_over', { fade: 0.05 });
      }
    } else if (this.state === 'gameover' && (this.t > 4.5 || (this.t > 1 && input.confirm()))) {
      this.state = 'leaving';
      this.game.transitionTo(() => new TitleScene(this.game), { duration: 0.8 });
    }
  }

  draw(r) {
    const { assets, font, time } = this.game;
    const def = CHARACTERS[this.characterId];
    if (this.state === 'gameover') {
      const p = easeOutBack(clamp(this.t / 0.5, 0, 1));
      font.draw(r, 'GAME OVER', VIEW_W / 2, Math.round(VIEW_H / 2 - 20 - (1 - p) * 60), { align: 'center', color: 'vermelha', scale: 3 });
      font.draw(r, `PONTOS ${String(this.score).padStart(6, '0')}`, VIEW_W / 2, VIEW_H / 2 + 20, { align: 'center', color: 'amarela' });
      return;
    }
    // Retrato "apagado" + contagem.
    r.image(assets.sprite(def.portrait), VIEW_W / 2 - 32, 40, { alpha: 0.5 + 0.2 * Math.sin(time * 4) });
    font.draw(r, 'CONTINUAR?', VIEW_W / 2, 114, { align: 'center', color: 'metal', scale: 2 });
    const n = Math.max(0, Math.floor(this.count));
    const pulse = this.count % 1;
    font.draw(r, String(n), VIEW_W / 2, 138, { align: 'center', color: n <= 3 ? 'vermelha' : 'branca', scale: 3, alpha: 0.4 + pulse * 0.6 });
    if (Math.floor(time * 2.5) % 2 === 0) {
      font.draw(r, 'PRESSIONE START', VIEW_W / 2, VIEW_H - 24, { align: 'center', color: 'amarela' });
    }
  }
}
