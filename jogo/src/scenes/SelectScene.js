// Seleção de personagem estilo fliperama: 3 cards com retrato, arma e barras de
// status, cronômetro de 30 s (ao zerar, escolhe o personagem marcado) e carimbo
// "PRONTO!" ao confirmar.

import { VIEW_W, VIEW_H, RULES, START_PHASE } from '../config/constants.js';
import { CHARACTERS, CHARACTER_ORDER } from '../config/characters.js';
import { clamp, damp, easeOutBack, easeOutCubic } from '../core/math.js';
import { GameScene } from './GameScene.js';
import { TitleScene } from './TitleScene.js';

const CARD_W = 116;
const CARD_H = 152;
const CARD_Y = 30;
const CARD_GAP = 10;
const STAT_ROWS = [['vida', 'VIDA'], ['forca', 'FORÇA'], ['velocidade', 'VELOC.'], ['alcance', 'ALCANCE']];

export class SelectScene {
  constructor(game) {
    this.game = game;
    this.index = 0;
    this.t = 0;
    this.selectedAt = 0.4; // quando o card atual foi marcado (anima as barras)
    this.timer = RULES.selectSeconds;
    this.state = 'choosing'; // choosing | chosen
    this.chosenAt = 0;
    this.lift = CHARACTER_ORDER.map(() => 0); // quanto cada card está levantado
    const total = CHARACTER_ORDER.length * CARD_W + (CHARACTER_ORDER.length - 1) * CARD_GAP;
    this.cardX = CHARACTER_ORDER.map((_, i) => Math.round((VIEW_W - total) / 2 + i * (CARD_W + CARD_GAP)));
  }

  enter() { this.game.audio.playMusic('audio/musica/selecao'); }

  update(dt) {
    this.t += dt;
    const { input, audio } = this.game;
    CHARACTER_ORDER.forEach((_, i) => { this.lift[i] = damp(this.lift[i], i === this.index ? 3 : 0, 14, dt); });

    if (this.state === 'chosen') {
      if (this.t - this.chosenAt > 1.4) {
        const characterId = CHARACTER_ORDER[this.index];
        this.state = 'leaving';
        this.game.transitionTo(() => new GameScene(this.game, { characterId, phaseIndex: START_PHASE }), { duration: 0.5 });
      }
      return;
    }
    if (this.state !== 'choosing' || this.t < 0.5) return;

    // Cronômetro de fliperama.
    const before = Math.ceil(this.timer);
    this.timer = Math.max(0, this.timer - dt);
    const now = Math.ceil(this.timer);
    if (now !== before && now <= 5) audio.play('audio/sfx/ui_tique', { pitchVar: 0 });
    if (this.timer <= 0) return this._confirm();

    const n = CHARACTER_ORDER.length;
    if (input.pressed('left')) this._move((this.index - 1 + n) % n);
    if (input.pressed('right')) this._move((this.index + 1) % n);

    const p = input.pointer;
    if (p) {
      const hit = this.cardX.findIndex((x) => p.x >= x && p.x < x + CARD_W && p.y >= CARD_Y && p.y < CARD_Y + CARD_H);
      if (p.clicked && hit >= 0) {
        if (hit === this.index) return this._confirm();
        this._move(hit);
      }
    }

    if (input.confirm()) return this._confirm();
    if (input.cancel()) {
      audio.play('audio/sfx/ui_voltar');
      this.state = 'leaving';
      this.game.transitionTo(() => new TitleScene(this.game, { skipIntro: true }));
    }
  }

  _move(i) {
    if (i === this.index) return;
    this.index = i;
    this.selectedAt = this.t;
    this.game.audio.play('audio/sfx/ui_mover');
  }

  _confirm() {
    this.state = 'chosen';
    this.chosenAt = this.t;
    this.game.audio.play('audio/sfx/ui_pronto', { pitchVar: 0 });
  }

  draw(r) {
    const { assets, font, time } = this.game;
    r.image(assets.sprite('ui/selecao_fundo'), 0, 0);
    CHARACTER_ORDER.forEach((id, i) => this._drawCard(r, CHARACTERS[id], i));

    // Título entra de cima (desenhado depois dos cards para ficar sempre visível).
    const titleY = Math.round(4 - (1 - easeOutCubic(clamp(this.t / 0.4, 0, 1))) * 40);
    font.draw(r, 'ESCOLHA SEU LUTADOR', VIEW_W / 2, titleY, { align: 'center', color: 'metal', scale: 2 });

    // Cronômetro (fica vermelho e pisca nos últimos 5 s).
    const secs = Math.ceil(this.timer);
    const urgent = secs <= 5 && this.state === 'choosing';
    if (!urgent || Math.floor(time * 4) % 2 === 0) {
      font.draw(r, String(secs).padStart(2, '0'), VIEW_W - 8, titleY + 2, { align: 'right', color: urgent ? 'vermelha' : 'ciano', scale: 2 });
    }

    // Rodapé: estilo do personagem marcado + ajuda de controles.
    const def = CHARACTERS[CHARACTER_ORDER[this.index]];
    font.draw(r, `ESTILO: ${def.style}`, VIEW_W / 2, VIEW_H - 25, { align: 'center', color: 'amarela' });
    font.draw(r, '< > ESCOLHER    START CONFIRMAR    ESC VOLTAR', VIEW_W / 2, VIEW_H - 13, { align: 'center', color: 'cinza' });
  }

  _drawCard(r, def, i) {
    const { assets, font, time } = this.game;
    const selected = i === this.index;
    const chosen = this.state !== 'choosing';
    // Entrada: os cards sobem de baixo, um depois do outro.
    const enter = easeOutBack(clamp((this.t - 0.1 - i * 0.1) / 0.5, 0, 1));
    const x = this.cardX[i];
    const y = Math.round(CARD_Y - this.lift[i] + (1 - enter) * 200);
    const dim = chosen && !selected ? 0.3 : 1;

    if (selected) r.frame(assets.sprite('ui/card_selecionado'), Math.floor(time * 6), x, y);
    else r.image(assets.sprite('ui/card'), x, y, { alpha: dim });

    const cx = x + CARD_W / 2;
    r.image(assets.sprite(def.portrait), cx - 32, y + 6, { alpha: selected ? 1 : 0.55 * dim });
    font.draw(r, def.name, cx, y + 70, { align: 'center', color: selected ? 'amarela' : 'branca', alpha: dim });
    r.image(assets.sprite(def.weaponIcon), cx - 16, y + 86, { alpha: dim });
    font.draw(r, def.weaponShort ?? def.weapon, cx, y + 102, { align: 'center', color: 'ciano', alpha: dim });

    const full = assets.sprite('ui/status_cheio');
    const empty = assets.sprite('ui/status_vazio');
    STAT_ROWS.forEach(([key, label], row) => {
      const sy = y + 114 + row * 9;
      font.draw(r, label, x + 6, sy, { color: 'branca', alpha: dim });
      // As barras "enchem" uma a uma quando o card é selecionado (efeito fliperama).
      const fill = selected ? clamp((this.t - this.selectedAt) * 14, 0, def.stats[key]) : def.stats[key];
      for (let s = 0; s < 5; s++) {
        r.image(s < fill ? full : empty, x + 56 + s * 10, sy + 3, { alpha: dim });
      }
    });

    // Carimbo "PRONTO!" quando confirmado.
    if (chosen && selected) {
      const p = clamp((this.t - this.chosenAt) / 0.35, 0, 1);
      const sy = y + 40 + Math.round((1 - easeOutBack(p)) * -60);
      font.draw(r, 'PRONTO!', cx, sy, { align: 'center', color: 'vermelha', scale: 2, alpha: p });
    }
  }
}
