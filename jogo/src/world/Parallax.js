// Fundo em camadas com parallax: cada camada anda numa fração da câmera, criando
// a sensação de profundidade (céu parado, montanhas lentas, árvores próximas rápidas).

import { PARALLAX_LAYERS, FOREGROUND_LAYER } from '../config/phases.js';

export class Parallax {
  constructor(assets, folder) {
    this.layers = PARALLAX_LAYERS.map((l) => ({ sprite: assets.sprite(folder + l.file), factor: l.factor }));
    this.front = { sprite: assets.sprite(folder + FOREGROUND_LAYER.file), factor: FOREGROUND_LAYER.factor };
  }

  /** Camadas atrás do cenário jogável. */
  drawBack(r, camX, camY) {
    for (const l of this.layers) r.parallax(l.sprite, camX, camY, l.factor);
  }

  /** Camada na frente do jogador (mato em primeiro plano). */
  drawFront(r, camX, camY) {
    r.parallax(this.front.sprite, camX, camY, this.front.factor, 1);
  }
}
