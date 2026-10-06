// Desenho no canvas. Tudo o que aparece na tela é uma imagem de assets/:
// aqui só posicionamos, espelhamos, giramos e recortamos quadros.

import { VIEW_W, VIEW_H } from '../config/constants.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
    this.offsetX = 0; // deslocamento de câmera aplicado por beginWorld()
    this.offsetY = 0;
    window.addEventListener('resize', () => this.fit());
    this.fit();
  }

  /** Amplia o canvas na maior escala inteira que cabe na janela (pixel art sem borrão). */
  fit() {
    const dpr = window.devicePixelRatio || 1;
    const maxW = window.innerWidth * dpr;
    const maxH = window.innerHeight * dpr;
    const integer = Math.floor(Math.min(maxW / VIEW_W, maxH / VIEW_H));
    // Em telas pequenas, aceita escala fracionária para não ficar minúsculo.
    const scale = integer >= 1 ? integer : Math.min(maxW / VIEW_W, maxH / VIEW_H);
    this.canvas.style.width = `${(VIEW_W * scale) / dpr}px`;
    this.canvas.style.height = `${(VIEW_H * scale) / dpr}px`;
  }

  clear() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  /** A partir daqui, coordenadas são do mundo (a câmera é subtraída). */
  beginWorld(camX, camY) { this.offsetX = Math.round(camX); this.offsetY = Math.round(camY); }
  /** Volta para coordenadas de tela (HUD, menus). */
  endWorld() { this.offsetX = 0; this.offsetY = 0; }

  /**
   * Desenha um quadro de uma tira de sprites.
   * (x, y) é o canto superior esquerdo do quadro.
   * Opções: flipX, alpha, rotation (radianos, em torno do centro), scale.
   */
  frame(sprite, index, x, y, { flipX = false, alpha = 1, rotation = 0, scale = 1 } = {}) {
    if (!sprite || alpha <= 0) return;
    const { image, frameW, frameH, frames } = sprite;
    const i = ((index % frames) + frames) % frames;
    const dx = Math.round(x - this.offsetX);
    const dy = Math.round(y - this.offsetY);
    const ctx = this.ctx;
    const simple = !flipX && rotation === 0 && scale === 1;
    ctx.globalAlpha = alpha;
    if (simple) {
      ctx.drawImage(image, i * frameW, 0, frameW, frameH, dx, dy, frameW, frameH);
    } else {
      const w = frameW * scale, h = frameH * scale;
      ctx.save();
      ctx.translate(dx + w / 2, dy + h / 2);
      if (rotation) ctx.rotate(rotation);
      if (flipX) ctx.scale(-1, 1);
      ctx.drawImage(image, i * frameW, 0, frameW, frameH, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  /** Desenha uma imagem estática (quadro 0). */
  image(sprite, x, y, opts) { this.frame(sprite, 0, x, y, opts); }

  /** Recorta só uma parte da imagem (barras de carregamento/vida). */
  crop(sprite, sx, sy, sw, sh, x, y, alpha = 1) {
    if (!sprite || sw <= 0 || sh <= 0) return;
    this.ctx.globalAlpha = alpha;
    this.ctx.drawImage(sprite.image, sx, sy, sw, sh,
      Math.round(x - this.offsetX), Math.round(y - this.offsetY), sw, sh);
    this.ctx.globalAlpha = 1;
  }

  /**
   * Painel "9-slice": cantos fixos, bordas e miolo esticados.
   * Permite um único asset pequeno virar painéis de qualquer tamanho.
   */
  nineSlice(sprite, x, y, w, h, border = 8, alpha = 1) {
    if (!sprite) return;
    const { image } = sprite;
    const sw = image.width, sh = image.height, b = border;
    const cw = sw - 2 * b, ch = sh - 2 * b;
    const iw = w - 2 * b, ih = h - 2 * b;
    const ctx = this.ctx;
    x = Math.round(x); y = Math.round(y);
    ctx.globalAlpha = alpha;
    const part = (sx, sy, sW, sH, dx, dy, dW, dH) => dW > 0 && dH > 0 && ctx.drawImage(image, sx, sy, sW, sH, dx, dy, dW, dH);
    part(0, 0, b, b, x, y, b, b);
    part(b, 0, cw, b, x + b, y, iw, b);
    part(sw - b, 0, b, b, x + w - b, y, b, b);
    part(0, b, b, ch, x, y + b, b, ih);
    part(b, b, cw, ch, x + b, y + b, iw, ih);
    part(sw - b, b, b, ch, x + w - b, y + b, b, ih);
    part(0, sh - b, b, b, x, y + h - b, b, b);
    part(b, sh - b, cw, b, x + b, y + h - b, iw, b);
    part(sw - b, sh - b, b, b, x + w - b, y + h - b, b, b);
    ctx.globalAlpha = 1;
  }

  /** Camada de parallax repetida na horizontal. `factor` = quanto acompanha a câmera. */
  parallax(sprite, camX, camY, factor, factorY = factor * 0.5, alpha = 1) {
    if (!sprite) return;
    const { image } = sprite;
    const w = image.width;
    let x = -Math.round(camX * factor) % w;
    if (x > 0) x -= w;
    const y = -Math.round(camY * factorY);
    this.ctx.globalAlpha = alpha;
    for (; x < VIEW_W; x += w) this.ctx.drawImage(image, x, y);
    this.ctx.globalAlpha = 1;
  }

  /**
   * Transições de tela (fade/flash). É a única coisa que usa cor sólida em vez de
   * imagem, pois não é arte — é só escurecer/clarear a tela inteira.
   */
  fade(alpha, color = '#000') {
    if (alpha <= 0) return;
    this.ctx.globalAlpha = Math.min(1, alpha);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    this.ctx.globalAlpha = 1;
  }

  /** Contorno de caixa — apenas no modo ?debug. */
  debugBox(box, color) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(Math.round(box.x - this.offsetX) + 0.5, Math.round(box.y - this.offsetY) + 0.5, box.w - 1, box.h - 1);
  }
}
