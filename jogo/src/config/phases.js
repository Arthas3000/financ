// Lista de fases, na ordem em que são jogadas.

import { FASE1_SECTIONS } from '../world/levels/fase1.js';
import { FASE2_SECTIONS } from '../world/levels/fase2.js';

export const PHASES = [
  {
    id: 'fase1',
    title: 'FASE 1',
    name: 'FLORESTA DE PINUS',
    folder: 'cenarios/fase1/',
    music: 'audio/musica/fase1',
    enemy: 'logmax',          // fase 1 só tem LogMax
    sections: FASE1_SECTIONS,
  },
  {
    id: 'fase2',
    title: 'FASE 2',
    name: 'FLORESTA DE EUCALIPTO',
    folder: 'cenarios/fase2/',
    music: 'audio/musica/fase2',
    enemy: 'ponssee',         // fase 2 só tem Ponssee
    sections: FASE2_SECTIONS,
  },
];

/** Camadas de parallax: quanto cada uma acompanha a câmera (0 = parada, 1 = junto com o chão). */
export const PARALLAX_LAYERS = [
  { file: 'parallax_0_ceu', factor: 0 },
  { file: 'parallax_1_montanhas', factor: 0.1 },
  { file: 'parallax_2_arvores_longe', factor: 0.25 },
  { file: 'parallax_3_arvores_meio', factor: 0.45 },
  { file: 'parallax_4_arvores_perto', factor: 0.7 },
];
/** Desenhada NA FRENTE do jogador, mais rápida que o chão: dá profundidade (estilo Mario). */
export const FOREGROUND_LAYER = { file: 'parallax_5_primeiro_plano', factor: 1.25 };
