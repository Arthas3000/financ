// HUD durante a fase: retrato + vidas, barra de vida vertical estilo Mega Man,
// tempo e pontuação.

import { VIEW_W } from '../config/constants.js';

const BAR_X = 13;
const BAR_Y = 32;
const BAR_SLOTS = 28; // a moldura comporta 28 marcas (Paulinho, o mais resistente, enche tudo)

export function formatTime(seconds) {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export class Hud {
  constructor(game) {
    this.game = game;
    this.shownHp = null; // a barra desce/sobe uma marca por vez (animação clássica)
    this.tickTimer = 0;
  }

  update(dt, player) {
    if (this.shownHp === null) this.shownHp = player.hp;
    this.tickTimer -= dt;
    if (this.tickTimer <= 0 && this.shownHp !== player.hp) {
      this.shownHp += Math.sign(player.hp - this.shownHp);
      this.tickTimer = 0.03;
    }
  }

  draw(r, { player, lives, score, time, phase }) {
    const { assets, font } = this.game;
    r.image(assets.sprite('hud/moldura_retrato'), 6, 6);
    r.image(assets.sprite(player.def.hudPortrait), 8, 8);
    font.draw(r, `x${lives}`, 32, 14, { color: 'branca' });

    // Barra de vida: só existem marcas até a vida máxima do personagem.
    r.image(assets.sprite('hud/barra_vida'), BAR_X, BAR_Y);
    const full = assets.sprite('hud/vida_cheia');
    const empty = assets.sprite('hud/vida_vazia');
    const low = player.hp <= player.def.maxHp * 0.25 && Math.floor(this.game.time * 6) % 2 === 0;
    for (let i = 0; i < Math.min(BAR_SLOTS, player.def.maxHp); i++) {
      const filled = i < this.shownHp && !(low && i === Math.ceil(this.shownHp) - 1);
      r.image(filled ? full : empty, BAR_X + 2, BAR_Y + 57 - i * 2);
    }

    font.draw(r, phase.title, VIEW_W / 2, 5, { align: 'center', color: 'cinza' });
    font.draw(r, formatTime(time), VIEW_W / 2, 15, { align: 'center', color: 'branca' });
    font.draw(r, 'PONTOS', VIEW_W - 6, 5, { align: 'right', color: 'cinza' });
    font.draw(r, String(score).padStart(6, '0'), VIEW_W - 6, 15, { align: 'right', color: 'amarela' });
  }
}
