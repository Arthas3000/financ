// Constantes globais do jogo.

/** Resolução interna (16:9). O canvas é ampliado em escala inteira para manter o pixel art nítido. */
export const VIEW_W = 384;
export const VIEW_H = 216;

/** Tamanho do tile em pixels. */
export const TILE = 16;

/** Passo fixo da simulação (60 atualizações por segundo, independente do monitor). */
export const FIXED_DT = 1 / 60;

/** Pasta raiz dos assets. */
export const ASSET_ROOT = 'assets/';

/** Abra o jogo com ?debug na URL para ver hitboxes e caixas de colisão. */
export const DEBUG = new URLSearchParams(location.search).has('debug');

/** Fase inicial (útil para testar: ?fase=2). */
export const START_PHASE = Math.max(0, (parseInt(new URLSearchParams(location.search).get('fase'), 10) || 1) - 1);

/** Regras de jogo de fliperama. */
export const RULES = {
  lives: 3,
  continueSeconds: 9,
  selectSeconds: 30,
  timeBonusLimit: 300, // segundos; bônus = (limite - tempo) * 10
  timeBonusPerSecond: 10,
};
