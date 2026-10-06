// Câmera de side-scroller: segue o jogador com suavização, "olha à frente" na
// direção em que ele corre, só sobe/desce quando necessário (evita enjoo) e treme
// em impactos.

import { VIEW_W, VIEW_H } from '../config/constants.js';
import { clamp, damp, randRange } from './math.js';

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.bounds = { w: VIEW_W, h: VIEW_H };
    this.lookAhead = 0;
    this.shakeTime = 0;
    this.shakePower = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    // Ajustes de "feeling"
    this.lookAheadDist = 40;   // px à frente do jogador
    this.followX = 7;          // velocidade de acompanhamento horizontal
    this.followY = 5;          // velocidade de acompanhamento vertical
    this.screenFocusY = 0.62;  // jogador fica um pouco abaixo do centro
  }

  setBounds(w, h) { this.bounds = { w, h }; }

  /** Posiciona instantaneamente (início de fase / renascimento). */
  snapTo(target) {
    this.lookAhead = target.facing * this.lookAheadDist;
    this.x = this._clampX(target.centerX + this.lookAhead - VIEW_W / 2);
    this.y = this._clampY(target.bottom - VIEW_H * this.screenFocusY);
  }

  follow(target, dt) {
    // Olhar à frente cresce aos poucos quando o jogador corre numa direção.
    const moving = Math.abs(target.vx) > 20;
    const desiredLook = moving ? Math.sign(target.vx) * this.lookAheadDist : target.facing * this.lookAheadDist * 0.5;
    this.lookAhead = damp(this.lookAhead, desiredLook, 2.5, dt);
    this.x = damp(this.x, this._clampX(target.centerX + this.lookAhead - VIEW_W / 2), this.followX, dt);

    // Vertical: acompanha o chão em que o jogador está; no ar só se ele sair da janela.
    const desiredY = target.bottom - VIEW_H * this.screenFocusY;
    const topLimit = this.y + VIEW_H * 0.2;
    const bottomLimit = this.y + VIEW_H * 0.85;
    if (target.onGround || target.top < topLimit || target.bottom > bottomLimit) {
      this.y = damp(this.y, this._clampY(desiredY), this.followY, dt);
    }

    // Tremor
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const p = this.shakePower * Math.max(0, this.shakeTime / this.shakeDuration);
      this.shakeX = randRange(-p, p);
      this.shakeY = randRange(-p, p);
    } else {
      this.shakeX = this.shakeY = 0;
    }
  }

  shake(power = 3, duration = 0.25) {
    if (power < this.shakePower && this.shakeTime > 0) return;
    this.shakePower = power;
    this.shakeTime = this.shakeDuration = duration;
  }

  _clampX(x) { return clamp(x, 0, Math.max(0, this.bounds.w - VIEW_W)); }
  _clampY(y) { return clamp(y, 0, Math.max(0, this.bounds.h - VIEW_H)); }

  /** Posição final usada no desenho (inteira + tremor). */
  get renderX() { return Math.round(this.x + this.shakeX); }
  get renderY() { return Math.round(this.y + this.shakeY); }

  /** Está dentro da tela (com margem)? Usado para ativar inimigos. */
  isVisible(box, margin = 0) {
    return box.x + box.w > this.x - margin && box.x < this.x + VIEW_W + margin &&
      box.y + box.h > this.y - margin && box.y < this.y + VIEW_H + margin;
  }
}
