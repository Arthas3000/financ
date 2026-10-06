// Tela inicial estilo fliperama:
//   1) o logo cai e quica sobre a floresta em parallax;
//   2) "PRESSIONE START" pisca (inserir ficha);
//   3) os botões "INICIAR JOGO" e "SAIR" deslizam para dentro.

import { VIEW_W, VIEW_H } from '../config/constants.js';
import { clamp, easeOutBounce } from '../core/math.js';
import { Parallax } from '../world/Parallax.js';
import { ButtonMenu } from '../ui/ButtonMenu.js';
import { SelectScene } from './SelectScene.js';
import { GoodbyeScene } from './GoodbyeScene.js';
import { loadHighScore } from './highscore.js';

export class TitleScene {
  /** skipIntro: ao voltar de outras telas, já mostra o menu. */
  constructor(game, { skipIntro = false } = {}) {
    this.game = game;
    this.t = skipIntro ? 2 : 0;
    this.state = skipIntro ? 'menu' : 'press';
    this.parallax = new Parallax(game.assets, 'cenarios/fase1/');
    this.highScore = loadHighScore();
    this.menu = this._mainMenu();
    this.dialog = null;
    this.pending = null; // { at, action } — ação adiada (deixa o botão piscar antes de sair)
  }

  enter() { this.game.audio.playMusic('audio/musica/titulo'); }

  _mainMenu() {
    return new ButtonMenu(this.game, [
      { label: 'INICIAR JOGO', action: 'start' },
      { label: 'SAIR', action: 'exit' },
    ], { x: VIEW_W / 2, y: 140 });
  }

  update(dt) {
    this.t += dt;
    const { input, audio } = this.game;
    if (this.pending && this.t >= this.pending.at) {
      this.pending.action();
      this.pending = null;
    }

    if (this.state === 'press') {
      if (this.t > 0.9 && (input.confirm() || input.pointer?.clicked)) {
        audio.unlock();
        audio.play('audio/sfx/ui_ficha', { pitchVar: 0 });
        this.state = 'menu';
        this.menu = this._mainMenu();
      }
      return;
    }

    if (this.state === 'menu') {
      const chosen = this.menu.update(dt);
      if (chosen?.action === 'start') {
        this.state = 'leaving';
        this.pending = { at: this.t + 0.45, action: () => this.game.transitionTo(() => new SelectScene(this.game), { duration: 0.4 }) };
      } else if (chosen?.action === 'exit') {
        this.state = 'confirmExit';
        this.dialog = new ButtonMenu(this.game, [
          { label: 'NÃO', action: 'no' },
          { label: 'SIM', action: 'yes' },
        ], { x: VIEW_W / 2, y: 122, spacing: 24 });
      } else if (input.cancel()) {
        audio.play('audio/sfx/ui_voltar');
        this.state = 'press';
      }
      return;
    }

    if (this.state === 'confirmExit') {
      const chosen = this.dialog.update(dt);
      if (chosen?.action === 'yes') {
        this.state = 'leaving';
        audio.stopMusic(0.6);
        this.pending = { at: this.t + 0.4, action: () => this.game.transitionTo(() => new GoodbyeScene(this.game), { duration: 0.6 }) };
      } else if (chosen?.action === 'no' || (!chosen && input.cancel())) {
        if (!chosen) audio.play('audio/sfx/ui_voltar');
        this.state = 'menu';
        this.dialog = null;
        this.menu.unlock();
      }
    }
  }

  draw(r) {
    const { assets, font, time } = this.game;
    // Floresta passando devagar ao fundo (a "câmera" anda sozinha).
    const camX = time * 28;
    this.parallax.drawBack(r, camX, 12);
    this.parallax.drawFront(r, camX, 12);
    r.image(assets.sprite('ui/vinheta'), 0, 0);

    // Logo: cai quicando e depois flutua.
    const logo = assets.sprite('ui/logo');
    if (logo) {
      const p = clamp(this.t / 1.1, 0, 1);
      const drop = (1 - easeOutBounce(p)) * -150;
      const bob = p >= 1 ? Math.round(Math.sin(time * 2) * 2) : 0;
      r.image(logo, Math.round((VIEW_W - logo.frameW) / 2), 10 + drop + bob);
    }

    if (this.state === 'press') {
      if (this.t > 1.1 && Math.floor(time * 2.5) % 2 === 0) {
        font.draw(r, 'PRESSIONE START', VIEW_W / 2, 150, { align: 'center', color: 'amarela', scale: 1 });
      }
      font.draw(r, 'ENTER  /  START  /  TOQUE', VIEW_W / 2, 166, { align: 'center', color: 'cinza' });
    } else {
      this.menu.draw(r);
    }

    font.draw(r, `RECORDE ${String(this.highScore).padStart(6, '0')}`, VIEW_W / 2, VIEW_H - 24, { align: 'center', color: 'ciano' });
    font.draw(r, '© 2026  FÚRIA NA FLORESTA', VIEW_W / 2, VIEW_H - 12, { align: 'center', color: 'cinza' });

    if (this.state === 'confirmExit' || (this.state === 'leaving' && this.dialog)) {
      r.fade(0.55);
      r.nineSlice(assets.sprite('ui/painel'), VIEW_W / 2 - 90, 92, 180, 84);
      font.draw(r, 'SAIR DO JOGO?', VIEW_W / 2, 104, { align: 'center', color: 'amarela' });
      this.dialog.draw(r);
    }
  }
}
