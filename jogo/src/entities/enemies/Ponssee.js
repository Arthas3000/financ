// Mecânico Ponssee (fase 2): mantém distância e arremessa latas de óleo em arco,
// mirando onde o jogador VAI estar. Se você chega perto demais, ele recua.

import { Enemy } from './Enemy.js';
import { OilCanProjectile } from '../OilCanProjectile.js';
import { approach, randRange } from '../../core/math.js';

export class Ponssee extends Enemy {
  constructor(...args) {
    super(...args);
    this.cooldown = randRange(0.4, 1.0);
  }

  think(dt) {
    const d = this.def;

    if (this.state === 'patrol') {
      this.patrol(dt);
      if (this.seesPlayer()) this.notice();
      return;
    }

    if (this.state === 'engage') {
      const dist = this.distToPlayer();
      if (dist > d.giveUpRange || !this.player.alive) { this.engaged = false; return this.setState('patrol'); }
      this.facePlayer();

      if (this.cooldown <= 0 && dist < d.sight.range) {
        this.setState('throw');
        this.anim.play('arremesso', { restart: true });
        return;
      }
      // Recuar (de costas, andando para trás) se perto demais; aproximar se longe demais.
      let moved = false;
      if (dist < d.tooClose) moved = this.walk(-this.facing, d.retreatSpeed, dt);
      else if (dist > d.preferredDistance + 50) moved = this.walk(this.facing, d.patrolSpeed, dt);
      else this.vx = approach(this.vx, 0, d.accel * dt);
      this.anim.play(moved ? 'andando' : 'parado');
      return;
    }

    if (this.state === 'throw') {
      this.vx = approach(this.vx, 0, d.accel * dt);
      if (this.anim.entered(d.throw.frame)) this._throwCan();
      if (this.anim.finished) {
        this.cooldown = d.throw.cooldown * randRange(0.85, 1.2);
        this.setState('engage');
      }
    }
  }

  _throwCan() {
    const t = this.def.throw;
    const p = this.player;
    const hand = this.worldBox({ x: t.handOffset.x, y: t.handOffset.y, w: 0, h: 0 });
    // Previsão simples: onde o jogador estará na metade do voo, mirando no tronco dele.
    const targetX = p.centerX + p.vx * t.flightTime * 0.5;
    const targetY = p.bottom - 10;
    this.scene.addEnemyProjectile(new OilCanProjectile(this.scene, { x: hand.x, y: hand.y, targetX, targetY, cfg: t }));
    this.scene.audio.play('audio/sfx/' + t.sound);
  }
}
