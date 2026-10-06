// Texto com fonte pixelada vinda de imagem (assets/fontes/).
// fonte.json descreve: lista de caracteres, tamanho da célula e largura de cada glifo
// (fonte proporcional: o "I" ocupa menos espaço que o "M").

const COLORS = ['branca', 'amarela', 'vermelha', 'ciano', 'cinza', 'metal'];

export class BitmapFont {
  constructor(assets) {
    const meta = assets.json('fontes/fonte');
    this.chars = meta.caracteres;
    this.cellW = meta.celula[0];
    this.cellH = meta.celula[1];
    this.lineHeight = meta.alturaLinha;
    this.spaceWidth = meta.larguraEspaco;
    this.index = new Map([...this.chars].map((c, i) => [c, i]));
    this.glyphs = meta.glifos; // [{ esquerda, largura }]
    this.sheets = Object.fromEntries(COLORS.map((c) => [c, assets.sprite(`fontes/fonte_${c}`)]));
  }

  _glyph(ch) {
    if (ch === ' ') return null;
    const i = this.index.get(ch) ?? this.index.get('?');
    return { i, ...this.glyphs[i] };
  }

  /** Largura do texto em pixels (antes da escala). */
  measure(text) {
    let max = 0;
    for (const line of String(text).toUpperCase().split('\n')) {
      let w = 0;
      for (const ch of line) {
        const g = this._glyph(ch);
        w += g ? g.largura + 1 : this.spaceWidth;
      }
      max = Math.max(max, w - 1);
    }
    return max;
  }

  /**
   * Desenha texto em coordenadas de TELA.
   * align: 'left' | 'center' | 'right'. scale: inteiro (2 = títulos).
   */
  draw(r, text, x, y, { color = 'branca', align = 'left', scale = 1, alpha = 1 } = {}) {
    const sheet = this.sheets[color] ?? this.sheets.branca;
    if (!sheet) return;
    const ctx = r.ctx;
    ctx.globalAlpha = alpha;
    const lines = String(text).toUpperCase().split('\n');
    lines.forEach((line, li) => {
      const width = this.measure(line) * scale;
      let cx = Math.round(align === 'center' ? x - width / 2 : align === 'right' ? x - width : x);
      const cy = Math.round(y + li * this.lineHeight * scale);
      for (const ch of line) {
        const g = this._glyph(ch);
        if (!g) { cx += this.spaceWidth * scale; continue; }
        // A célula tem 1 px de contorno à esquerda; alinhamos o glifo recortado ao cursor.
        ctx.drawImage(sheet.image, g.i * this.cellW, 0, this.cellW, this.cellH,
          cx - (g.esquerda) * scale, cy, this.cellW * scale, this.cellH * scale);
        cx += (g.largura + 1) * scale;
      }
    });
    ctx.globalAlpha = 1;
  }
}
