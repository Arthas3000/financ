// Monta a fase a partir dos trechos ASCII: grade de colisão, escolha automática do
// tile certo (borda, topo com grama, miolo de terra...), decorações e pontos de spawn.

import { TILE } from '../config/constants.js';

/**
 * Índices no tileset.png (grade 4x4 de 16x16 px), lidos da esquerda p/ direita, de cima p/ baixo:
 *   0 grama-esq    1 grama-meio    2 grama-dir     3 grama-isolada
 *   4 terra-esq    5 terra-meio    6 terra-dir     7 terra-isolada
 *   8 bloco        9 ponte-esq    10 ponte-meio   11 ponte-dir
 *  12 toco-topo   13 toco-corpo   14 troncos      15 terra-variação (raízes)
 */
export const TILE_INDEX = {
  GRASS_L: 0, GRASS_M: 1, GRASS_R: 2, GRASS_ONE: 3,
  DIRT_L: 4, DIRT_M: 5, DIRT_R: 6, DIRT_ONE: 7,
  BLOCK: 8, BRIDGE_L: 9, BRIDGE_M: 10, BRIDGE_R: 11,
  STUMP_TOP: 12, STUMP: 13, LOGS: 14, DIRT_ALT: 15,
};

/** Tipos de colisão. */
export const SOLID = 1;
export const ONE_WAY = 2; // só colide por cima (dá pra pular através, por baixo)

const TILE_CHARS = { '#': SOLID, B: SOLID, L: SOLID, T: SOLID, '=': ONE_WAY };
const DECORATIONS = { t: 'arvore', a: 'arbusto', s: 'samambaia', r: 'pedra', c: 'cogumelo', p: 'placa' };

export class Level {
  constructor(phase) {
    this.phase = phase;
    const rows = Level.joinSections(phase.sections);
    this.rowsText = rows;
    this.rows = rows.length;
    this.cols = rows[0].length;
    this.width = this.cols * TILE;
    this.height = this.rows * TILE;

    this.collision = new Uint8Array(this.cols * this.rows);
    this.tiles = new Int16Array(this.cols * this.rows).fill(-1);
    this.decorations = []; // { sprite, x, y } — x,y = centro inferior
    this.spawns = { player: null, enemies: [], pickups: [], checkpoints: [], goal: null };

    this._parse();
  }

  /** Cola os trechos lado a lado, completando linhas curtas com '.'. */
  static joinSections(sections) {
    const height = Math.max(...sections.map((s) => s.length));
    const out = Array(height).fill('');
    for (const section of sections) {
      const w = Math.max(...section.map((r) => r.length));
      for (let y = 0; y < height; y++) out[y] += (section[y] ?? '').padEnd(w, '.');
    }
    return out;
  }

  _parse() {
    const at = (x, y) => (y >= 0 && y < this.rows && x >= 0 && x < this.cols ? this.rowsText[y][x] : '.');
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const ch = at(x, y);
        const i = y * this.cols + x;
        const px = x * TILE + TILE / 2; // centro da célula
        const py = (y + 1) * TILE;      // base da célula

        if (TILE_CHARS[ch]) {
          this.collision[i] = TILE_CHARS[ch];
          this.tiles[i] = this._autotile(ch, x, y, at);
        } else if (DECORATIONS[ch]) {
          this.decorations.push({ sprite: DECORATIONS[ch], x: px, y: py });
        } else if (ch === 'P') this.spawns.player = { x: px, y: py };
        else if (ch === 'E') this.spawns.enemies.push({ x: px, y: py });
        else if (ch === 'M') this.spawns.pickups.push({ x: px, y: py });
        else if (ch === 'K') this.spawns.checkpoints.push({ x: px, y: py });
        else if (ch === 'F') this.spawns.goal = { x: px, y: py };
      }
    }
    if (!this.spawns.player) this.spawns.player = { x: TILE * 2, y: TILE * 4 };
  }

  /** Escolhe a variação visual do tile olhando os vizinhos. */
  _autotile(ch, x, y, at) {
    const T = TILE_INDEX;
    if (ch === 'B') return T.BLOCK;
    if (ch === 'L') return T.LOGS;
    if (ch === 'T') return at(x, y - 1) === 'T' ? T.STUMP : T.STUMP_TOP;
    if (ch === '=') {
      const l = at(x - 1, y) === '=', r = at(x + 1, y) === '=';
      return l && r ? T.BRIDGE_M : l ? T.BRIDGE_R : r ? T.BRIDGE_L : T.BRIDGE_M;
    }
    // Chão: topo exposto ganha grama; bordas ganham acabamento lateral.
    const l = at(x - 1, y) === '#', r = at(x + 1, y) === '#';
    const top = at(x, y - 1) !== '#';
    if (top) return l && r ? T.GRASS_M : l ? T.GRASS_R : r ? T.GRASS_L : T.GRASS_ONE;
    if (!l && !r) return T.DIRT_ONE;
    if (!l) return T.DIRT_L;
    if (!r) return T.DIRT_R;
    // Variação determinística (sempre igual ao recarregar) para quebrar a repetição.
    return ((x * 7 + y * 13) % 11 === 0) ? T.DIRT_ALT : T.DIRT_M;
  }

  /** Tipo de colisão na célula (fora do mapa: laterais sólidas, embaixo vazio = buraco). */
  cell(cx, cy) {
    if (cx < 0 || cx >= this.cols) return SOLID;
    if (cy < 0 || cy >= this.rows) return 0;
    return this.collision[cy * this.cols + cx];
  }

  /** Existe chão (sólido ou ponte) no ponto (px, py)? Usado pela IA para não cair de beiradas. */
  isGroundAt(px, py) {
    return this.cell(Math.floor(px / TILE), Math.floor(py / TILE)) !== 0;
  }

  isSolidAt(px, py) {
    return this.cell(Math.floor(px / TILE), Math.floor(py / TILE)) === SOLID;
  }

  /** Desenha só os tiles visíveis na câmera. */
  drawTiles(r, tileset, cam) {
    if (!tileset) return;
    const cols = tileset.image.width / TILE;
    const x0 = Math.max(0, Math.floor(cam.renderX / TILE));
    const y0 = Math.max(0, Math.floor(cam.renderY / TILE));
    const x1 = Math.min(this.cols - 1, x0 + Math.ceil(r.canvas.width / TILE) + 1);
    const y1 = Math.min(this.rows - 1, y0 + Math.ceil(r.canvas.height / TILE) + 1);
    const ctx = r.ctx;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const t = this.tiles[y * this.cols + x];
        if (t < 0) continue;
        ctx.drawImage(tileset.image, (t % cols) * TILE, Math.floor(t / cols) * TILE, TILE, TILE,
          x * TILE - r.offsetX, y * TILE - r.offsetY, TILE, TILE);
      }
    }
  }
}
