// Base de tudo que existe no mundo: um corpo retangular (x, y = canto superior esquerdo)
// com velocidade, direção e um Animator. Os sprites são desenhados com os pés no centro
// inferior do corpo.

import { Animator } from '../core/Animator.js';

export class Entity {
  constructor(scene, { x, y, w, h, sprites }) {
    this.scene = scene;
    // (x, y) recebidos = pés (centro inferior). Convertemos para o canto superior esquerdo.
    this.w = w;
    this.h = h;
    this.x = x - w / 2;
    this.y = y - h;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1 = direita, -1 = esquerda
    this.onGround = false;
    this.removed = false;
    this.anim = sprites ? new Animator(scene.game.assets, sprites) : null;
  }

  get centerX() { return this.x + this.w / 2; }
  get centerY() { return this.y + this.h / 2; }
  get top() { return this.y; }
  get bottom() { return this.y + this.h; }
  get box() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  /**
   * Converte uma caixa da config (relativa aos pés, olhando p/ direita) em coordenadas
   * do mundo, espelhando quando a entidade olha para a esquerda.
   */
  worldBox(b) {
    const x = this.facing === 1 ? this.centerX + b.x : this.centerX - b.x - b.w;
    return { x, y: this.bottom + b.y, w: b.w, h: b.h };
  }

  /** Desenha o sprite atual com os pés no centro inferior do corpo. */
  drawSprite(r, { alpha = 1 } = {}) {
    this.anim?.draw(r, this.centerX, this.bottom, { flipX: this.facing === -1, alpha });
  }
}
