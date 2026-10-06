// Paulinho — armas pesadas. A marretada com a Chave de Engenheiro é lenta para
// começar (preparação), mas no quadro de impacto treme a tela, solta uma onda de
// poeira no chão e arremessa os inimigos longe.

import { Player } from '../Player.js';

export class Paulinho extends Player {
  onAttackFrame() {
    const def = this.attack.def;
    if (def.impactFrame !== undefined && this.anim.entered(def.impactFrame) && this.onGround) {
      this.scene.shake(def.impactShake, 0.25);
      this.scene.audio.play('audio/sfx/chave_impacto');
      this.scene.spawnEffect('efeitos/onda_impacto', this.centerX + this.facing * 28, this.bottom, { flipX: this.facing < 0 });
    }
  }
}
