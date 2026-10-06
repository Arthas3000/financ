// Efeitos visuais: animações de uma vez só (poeira, faíscas), partículas com física
// (lascas do sabre, orbes da explosão) e textos de pontuação flutuando.

import { Animator } from '../core/Animator.js';

/** Toca uma tira de sprites uma vez, com o centro inferior em (x, y), e some. */
export class Effect {
  constructor(scene, spriteId, x, y, { flipX = false } = {}) {
    this.anim = new Animator(scene.game.assets, '');
    this.anim.play(spriteId);
    this.x = x;
    this.y = y;
    this.flipX = flipX;
    this.removed = !this.anim.sprite;
  }
  update(dt) {
    this.anim.update(dt);
    if (this.anim.finished || (this.anim.sprite?.loop && this.anim.time > 1)) this.removed = true;
  }
  draw(r) { this.anim.draw(r, this.x, this.y, { flipX: this.flipX }); }
}

/** Partícula com velocidade, gravidade e tempo de vida (desenhada centralizada). */
export class Particle {
  constructor(scene, spriteId, x, y, { vx = 0, vy = 0, gravity = 0, life = 0.6, fadeOut = true } = {}) {
    this.anim = new Animator(scene.game.assets, '');
    this.anim.play(spriteId);
    Object.assign(this, { x, y, vx, vy, gravity, life, maxLife: life, fadeOut });
    this.removed = !this.anim.sprite;
  }
  update(dt) {
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    this.anim.update(dt);
    if (this.life <= 0) this.removed = true;
  }
  draw(r) {
    const s = this.anim.sprite;
    const alpha = this.fadeOut ? Math.min(1, (this.life / this.maxLife) * 3) : 1;
    r.frame(s, this.anim.frame, this.x - s.frameW / 2, this.y - s.frameH / 2, { alpha });
  }
}

/** Texto que sobe e some ("+100"). Usa a fonte pixelada. */
export class ScorePopup {
  constructor(scene, text, x, y, color = 'amarela') {
    Object.assign(this, { scene, text, x, y, color, t: 0 });
    this.removed = false;
  }
  update(dt) {
    this.t += dt;
    this.y -= 28 * dt;
    if (this.t > 0.9) this.removed = true;
  }
  draw(r) {
    const alpha = this.t > 0.6 ? 1 - (this.t - 0.6) / 0.3 : 1;
    this.scene.game.font.draw(r, this.text, this.x - r.offsetX, this.y - r.offsetY, { color: this.color, align: 'center', alpha });
  }
}

/** Explosão de derrota estilo Mega Man: 8 orbes saindo em círculo + 4 mais lentos. */
export function spawnOrbBurst(scene, x, y) {
  const add = (count, speed, offset) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + offset;
      scene.addEffect(new Particle(scene, 'efeitos/explosao_orbe', x, y, {
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 0.7, fadeOut: true,
      }));
    }
  };
  add(8, 110, 0);
  add(4, 55, Math.PI / 4);
}
