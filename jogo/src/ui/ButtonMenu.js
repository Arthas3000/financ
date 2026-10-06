// Lista vertical de botões, usada na tela inicial, na pausa e em confirmações.
// Navegação por teclado/controle (↑ ↓ + confirmar) ou mouse/toque (passar por cima
// seleciona, clicar confirma). Toca os sons de interface e anima a entrada.

import { easeOutBack, clamp } from '../core/math.js';

const BTN_W = 128;
const BTN_H = 20;

export class ButtonMenu {
  /**
   * @param items [{ label, action }]
   * @param opts  { x (centro), y (topo do 1º botão), spacing, index, slideFrom: 'left'|'right'|'alt' }
   */
  constructor(game, items, { x, y, spacing = 26, index = 0, slideFrom = 'alt' } = {}) {
    this.game = game;
    this.items = items;
    this.x = x;
    this.y = y;
    this.spacing = spacing;
    this.index = index;
    this.slideFrom = slideFrom;
    this.t = 0;              // tempo desde que apareceu (anima a entrada)
    this.blink = 0;          // piscar ao confirmar
    this.locked = false;     // depois de confirmar, ignora entradas
  }

  /** Retorna o item confirmado neste passo (ou null). */
  update(dt) {
    this.t += dt;
    this.blink = Math.max(0, this.blink - dt);
    if (this.locked || this.t < 0.25) return null;
    const { input } = this.game;
    const n = this.items.length;

    if (input.pressed('up')) this._select((this.index - 1 + n) % n);
    if (input.pressed('down')) this._select((this.index + 1) % n);

    const p = input.pointer;
    if (p) {
      const hit = this.items.findIndex((_, i) => this._contains(i, p.x, p.y));
      if (hit >= 0 && p.moved) this._select(hit);
      p.moved = false;
      if (p.clicked && hit >= 0) { this.index = hit; return this._confirm(); }
    }
    if (input.confirm()) return this._confirm();
    return null;
  }

  _select(i) {
    if (i === this.index) return;
    this.index = i;
    this.game.audio.play('audio/sfx/ui_mover');
  }

  _confirm() {
    this.locked = true;
    this.blink = 0.6;
    this.game.audio.play('audio/sfx/ui_confirmar', { pitchVar: 0 });
    return this.items[this.index];
  }

  /** Destrava (ex.: voltar de um diálogo). */
  unlock() { this.locked = false; this.blink = 0; }

  _buttonPos(i) {
    // Entrada animada: cada botão desliza de um lado, com pequeno atraso entre eles.
    const p = clamp((this.t - i * 0.08) / 0.45, 0, 1);
    const fromLeft = this.slideFrom === 'left' || (this.slideFrom === 'alt' && i % 2 === 0);
    const off = (1 - easeOutBack(p)) * 260 * (fromLeft ? -1 : 1);
    return { x: Math.round(this.x - BTN_W / 2 + off), y: this.y + i * this.spacing };
  }

  _contains(i, px, py) {
    const { x, y } = this._buttonPos(i);
    return px >= x && px < x + BTN_W && py >= y && py < y + BTN_H;
  }

  draw(r) {
    const { assets, font, time } = this.game;
    const normal = assets.sprite('ui/botao');
    const selected = assets.sprite('ui/botao_selecionado');
    const cursor = assets.sprite('ui/cursor');
    this.items.forEach((item, i) => {
      const { x, y } = this._buttonPos(i);
      const sel = i === this.index;
      // Ao confirmar, o botão escolhido pisca rápido (feedback clássico de fliperama).
      const hidden = sel && this.blink > 0 && Math.floor(this.blink * 20) % 2 === 0;
      if (sel) r.frame(selected, Math.floor(time * selected.fps), x + 2, y);
      else r.image(normal, x, y);
      if (!hidden) {
        font.draw(r, item.label, x + BTN_W / 2 + (sel ? 2 : 0), y + 5, { align: 'center', color: sel ? 'amarela' : 'branca' });
      }
      if (sel && cursor) r.frame(cursor, Math.floor(time * cursor.fps), x - 16, y + 2);
    });
  }
}
