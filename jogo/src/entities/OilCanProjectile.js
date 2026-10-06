// Lata de óleo arremessada pelo Ponssee. Ela é MIRADA: dado o tempo de voo T,
// resolvemos a equação do movimento para que a parábola termine onde o jogador está:
//     vx = Δx / T
//     vy = (Δy − ½·g·T²) / T
// Ao tocar o chão ela estoura num respingo.

import { SOLID, ONE_WAY } from '../world/Level.js';
import { TILE } from '../config/constants.js';
import { overlaps } from '../core/math.js';

export class OilCanProjectile {
  constructor(scene, { x, y, targetX, targetY, cfg }) {
    this.scene = scene;
    this.cfg = cfg;
    this.x = x;
    this.y = y;
    const T = cfg.flightTime;
    this.vx = (targetX - x) / T;
    this.vy = (targetY - y - 0.5 * cfg.gravity * T * T) / T;
    this.rotation = 0;
    this.spin = Math.sign(this.vx || 1) * 10;
    this.sprite = scene.game.assets.sprite(cfg.sprite);
    this.removed = false;
  }

  get box() { return { x: this.x - 5, y: this.y - 5, w: 10, h: 10 }; }

  update(dt) {
    const level = this.scene.level;
    this.vy += this.cfg.gravity * dt;
    const prevBottom = this.y + 5;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.spin * dt;

    const player = this.scene.player;
    if (player.alive && overlaps(this.box, player.box)) {
      if (player.hurt(this.cfg.damage, this.x, this.cfg.knockback)) return this._splash();
    }
    const bottom = this.y + 5;
    const cell = level.cell(Math.floor(this.x / TILE), Math.floor(bottom / TILE));
    const tileTop = Math.floor(bottom / TILE) * TILE;
    if ((this.vy > 0 && (cell === SOLID || (cell === ONE_WAY && prevBottom <= tileTop + 0.5))) ||
        level.isSolidAt(this.x, this.y)) {
      this.y = Math.min(this.y, tileTop - 5);
      return this._splash();
    }
    if (this.y > level.height + 32) this.removed = true;
  }

  _splash() {
    this.removed = true;
    this.scene.audio.play('audio/sfx/lata_respingo');
    this.scene.spawnEffect('efeitos/respingo_oleo', this.x, this.y + 5);
  }

  draw(r) {
    const s = this.sprite;
    if (s) r.frame(s, 0, this.x - s.frameW / 2, this.y - s.frameH / 2, { rotation: this.rotation });
  }
}
