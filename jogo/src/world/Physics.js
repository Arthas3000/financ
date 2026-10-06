// Física de corpos retangulares (AABB) contra a grade de tiles.
//
// Resolve um eixo de cada vez (primeiro X, depois Y): é o método clássico dos jogos de
// plataforma 8/16-bit — estável, sem "grudar" em paredes e sem atravessar quinas.
// A velocidade máxima de queda (~440 px/s ≈ 7 px por passo) é menor que um tile, então
// não há risco de atravessar o chão (tunneling).

import { TILE } from '../config/constants.js';
import { SOLID, ONE_WAY } from './Level.js';

const EPS = 0.001;

/**
 * Move `body` ({x, y, w, h, vx, vy}) e resolve colisões.
 * Preenche: body.onGround, body.hitWall (-1/0/1), body.hitCeiling, body.groundType.
 * body.dropThrough > 0 ignora pontes (atravessar para baixo).
 */
export function moveBody(body, level, dt) {
  // ── Eixo X ──
  body.x += body.vx * dt;
  body.hitWall = 0;
  const top = Math.floor(body.y / TILE);
  const bottom = Math.floor((body.y + body.h - EPS) / TILE);
  if (body.vx > 0) {
    const cx = Math.floor((body.x + body.w - EPS) / TILE);
    for (let cy = top; cy <= bottom; cy++) {
      if (level.cell(cx, cy) === SOLID) { body.x = cx * TILE - body.w; body.vx = 0; body.hitWall = 1; break; }
    }
  } else if (body.vx < 0) {
    const cx = Math.floor(body.x / TILE);
    for (let cy = top; cy <= bottom; cy++) {
      if (level.cell(cx, cy) === SOLID) { body.x = (cx + 1) * TILE; body.vx = 0; body.hitWall = -1; break; }
    }
  }

  // ── Eixo Y ──
  const prevBottom = body.y + body.h;
  body.y += body.vy * dt;
  body.onGround = false;
  body.hitCeiling = false;
  const left = Math.floor(body.x / TILE);
  const right = Math.floor((body.x + body.w - EPS) / TILE);
  if (body.vy >= 0) {
    const cy = Math.floor((body.y + body.h - EPS) / TILE);
    const tileTop = cy * TILE;
    for (let cx = left; cx <= right; cx++) {
      const c = level.cell(cx, cy);
      const landsOnBridge = c === ONE_WAY && !(body.dropThrough > 0) && prevBottom <= tileTop + 0.5;
      if (c === SOLID || landsOnBridge) {
        body.y = tileTop - body.h;
        body.vy = 0;
        body.onGround = true;
        body.groundType = c;
        break;
      }
    }
  } else {
    const cy = Math.floor(body.y / TILE);
    for (let cx = left; cx <= right; cx++) {
      if (level.cell(cx, cy) === SOLID) { body.y = (cy + 1) * TILE; body.vy = 0; body.hitCeiling = true; break; }
    }
  }
}

/** O corpo está em cima de uma ponte (para o comando ↓ + pulo atravessar)? */
export function standingOnBridge(body, level) {
  const cy = Math.floor((body.y + body.h + 1) / TILE);
  const left = Math.floor(body.x / TILE);
  const right = Math.floor((body.x + body.w - EPS) / TILE);
  let bridge = false;
  for (let cx = left; cx <= right; cx++) {
    const c = level.cell(cx, cy);
    if (c === SOLID) return false;
    if (c === ONE_WAY) bridge = true;
  }
  return bridge;
}
