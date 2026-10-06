// Mecânico LogMax (fase 1): patrulha, te vê, corre atrás e dá um golpe com a
// ferramenta. O golpe tem 2 quadros de "aviso" antes do dano, então dá para reagir.

import { Enemy } from './Enemy.js';
import { approach } from '../../core/math.js';

export class LogMax extends Enemy {
  think(dt) {
    const atk = this.def.attack;

    if (this.state === 'patrol') {
      this.patrol(dt);
      if (this.seesPlayer()) this.notice();
      return;
    }

    if (this.state === 'engage') {
      const dist = this.distToPlayer();
      if (dist > this.def.giveUpRange || !this.player.alive) { this.engaged = false; return this.setState('patrol'); }
      this.facePlayer();
      const sameHeight = Math.abs(this.player.bottom - this.bottom) < 28;
      if (dist < atk.range && sameHeight && this.cooldown <= 0) {
        this.setState('attack');
        this.anim.play('ataque', { restart: true });
        return;
      }
      if (dist > atk.range * 0.7 && this.walk(this.facing, this.def.chaseSpeed, dt)) this.anim.play('correndo');
      else { this.vx = approach(this.vx, 0, this.def.accel * dt); this.anim.play('parado'); }
      return;
    }

    if (this.state === 'attack') {
      this.vx = approach(this.vx, 0, this.def.accel * dt);
      const f = this.anim.frame;
      if (this.anim.entered(atk.lungeFrame)) {
        this.vx = this.facing * atk.lungeSpeed;
        this.scene.audio.play('audio/sfx/' + atk.sound);
      }
      const box = atk.active[f];
      this.currentHitboxes = box ? [this.worldBox(box)] : null;
      if (box) this.scene.enemyMeleeHit(this, this.currentHitboxes, atk.damage, atk.knockback);
      if (this.anim.finished) {
        this.currentHitboxes = null;
        this.cooldown = atk.cooldown;
        this.setState('engage');
      }
    }
  }
}
