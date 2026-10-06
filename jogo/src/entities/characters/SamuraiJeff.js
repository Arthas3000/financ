// Samurai Jeff — corpo a corpo com o Sabre da Oregon (sabre de motosserra).
// A corrente "morde" várias vezes enquanto a lâmina passa pelo inimigo (hitInterval
// curto na config), por isso o golpe dá vários acertos pequenos em sequência.
// Combo de 2 golpes no chão + giro no ar: tudo definido em config/characters.js.

import { Player } from '../Player.js';

export class SamuraiJeff extends Player {
  // Toda a lógica de golpe corpo a corpo genérica está em Player; o que é exclusivo
  // do Jeff é o tremor leve da motosserra enquanto o sabre está ativo.
  onAttackFrame(frame) {
    if (this.attack.def.active?.[frame] && this.anim.entered(frame)) this.scene.shake(0.6, 0.05);
  }
}
