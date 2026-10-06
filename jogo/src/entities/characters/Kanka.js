// Kanka — combate à distância. Arremessa chaves, parafusos, porcas e arruelas
// que seguem uma trajetória parabólica real (ver entities/ToolProjectile.js).
//
// Mira:  normal = arco médio  |  ↑ = arco alto  |  ↓ (no ar) = rasante para baixo.
// Ele herda parte da própria velocidade no arremesso: correndo, a ferramenta vai mais longe.

import { Player } from '../Player.js';
import { ToolProjectile } from '../ToolProjectile.js';

export class Kanka extends Player {
  constructor(...args) {
    super(...args);
    this.toolIndex = 0;
  }

  _tryAttack() {
    // Limite de ferramentas na tela (como os tiros do Mega Man).
    const live = this.scene.playerProjectiles.filter((p) => !p.removed).length;
    if (live >= this.def.throwing.maxOnScreen) return;
    super._tryAttack();
  }

  onAttackFrame() {
    if (this.anim.entered(this.attack.def.throwFrame)) this.throwTool();
  }

  throwTool() {
    const t = this.def.throwing;
    const input = this.input;
    const aim = input.down('up') ? t.aim.up : input.down('down') && !this.onGround ? t.aim.down : t.aim.normal;
    const tool = t.tools[this.toolIndex];
    this.toolIndex = (this.toolIndex + 1) % t.tools.length;

    // Decompõe velocidade inicial em componentes (y negativo = para cima).
    const rad = (aim.angle * Math.PI) / 180;
    const speed = aim.speed * tool.speedScale;
    const vx = Math.cos(rad) * speed * this.facing + this.vx * t.inheritVelocity;
    const vy = -Math.sin(rad) * speed + Math.min(0, this.vy) * t.inheritVelocity * 0.5;

    const hand = this.worldBox({ x: t.handOffset.x, y: t.handOffset.y, w: 0, h: 0 });
    this.scene.addPlayerProjectile(new ToolProjectile(this.scene, {
      x: hand.x, y: hand.y, vx, vy, tool, config: t, facing: this.facing,
    }));
  }
}
