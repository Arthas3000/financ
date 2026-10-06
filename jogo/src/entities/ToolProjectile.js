// Ferramenta arremessada pelo Kanka — física de projétil com gravidade realista.
//
// Integração semi-implícita de Euler a 60 Hz:
//     vy += g · dt
//     x  += vx · dt
//     y  += vy · dt
// Com vx constante e g constante isso descreve uma parábola: y(x) = y0 + tanθ·x − g·x² / (2·v0²·cos²θ).
// Ao tocar o chão a ferramenta quica (perde energia: restitution/friction), faz "tlim"
// e some pouco depois. Ela gira no ar (o sprite é rotacionado em torno do centro).

import { TILE } from '../config/constants.js';
import { SOLID, ONE_WAY } from '../world/Level.js';

/** Mesma gravidade usada para arcos de projéteis em todo o jogo (px/s²). */
export const PROJECTILE_GRAVITY = 900;

export class ToolProjectile {
  constructor(scene, { x, y, vx, vy, tool, config, facing }) {
    this.scene = scene;
    this.x = x; // centro
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.tool = tool;
    this.cfg = config;
    this.sprite = scene.game.assets.sprite(tool.sprite);
    this.rotation = 0;
    this.spin = tool.spin * facing; // rad/s
    this.bounces = 0;
    this.life = Infinity;
    this.removed = false;
    this.damage = tool.damage;
    this.facing = facing;
    this.id = Symbol('ferramenta'); // cada ferramenta acerta um inimigo só uma vez
  }

  get box() {
    const s = this.cfg.hitSize;
    return { x: this.x - s / 2, y: this.y - s / 2, w: s, h: s };
  }

  update(dt) {
    const level = this.scene.level;
    const half = this.cfg.hitSize / 2;

    this.vy += PROJECTILE_GRAVITY * this.tool.gravityScale * dt;
    this.rotation += this.spin * dt;

    // Eixo X: bateu na parede → rebate perdendo força.
    this.x += this.vx * dt;
    if (level.isSolidAt(this.x + Math.sign(this.vx) * half, this.y)) {
      this.x -= this.vx * dt;
      this.vx *= -0.45;
      this._bounce();
    }

    // Eixo Y: chão (sólido ou ponte vinda de cima) → quica.
    const prevBottom = this.y + half;
    this.y += this.vy * dt;
    const bottom = this.y + half;
    const cell = level.cell(Math.floor(this.x / TILE), Math.floor(bottom / TILE));
    const tileTop = Math.floor(bottom / TILE) * TILE;
    if (this.vy > 0 && (cell === SOLID || (cell === ONE_WAY && prevBottom <= tileTop + 0.5))) {
      this.y = tileTop - half;
      this.vy = -this.vy * this.cfg.restitution;
      this.vx *= this.cfg.friction;
      this.spin *= 0.5;
      this._bounce();
    } else if (this.vy < 0 && level.isSolidAt(this.x, this.y - half)) {
      this.vy = 0;
    }

    // Acertou um inimigo?
    if (this.scene.projectileHit(this)) {
      this.scene.spawnEffect('efeitos/faisca_acerto', this.x, this.y + 16);
      this.removed = true;
      return;
    }

    this.life -= dt;
    if (this.life <= 0 || this.y > level.height + 32 || !this.scene.camera.isVisible(this.box, 64)) this.removed = true;
  }

  _bounce() {
    this.bounces++;
    this.scene.audio.play('audio/sfx/ferramenta_quica', { minGap: 0.06 });
    this.scene.spawnEffect('efeitos/faisca_metal', this.x, this.y + 8);
    if (this.bounces > this.cfg.bounces) this.removed = true;
    else this.life = Math.min(this.life, this.cfg.lifeAfterBounce);
  }

  draw(r) {
    const s = this.sprite;
    if (!s) return;
    // Pisca nos últimos instantes antes de sumir.
    const alpha = this.life < 0.2 ? 0.5 : 1;
    r.frame(s, 0, this.x - s.frameW / 2, this.y - s.frameH / 2, { rotation: this.rotation, flipX: this.facing < 0, alpha });
  }
}
