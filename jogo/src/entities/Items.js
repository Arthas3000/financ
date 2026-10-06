// Itens e marcadores de fase: marmita (vida), checkpoint e saída.

import { Animator } from '../core/Animator.js';

/** Marmita: flutua de leve; ao pegar, recupera vida. */
export class Marmita {
  constructor(scene, x, y) {
    this.scene = scene;
    this.anim = new Animator(scene.game.assets, '');
    this.anim.play('itens/marmita');
    this.x = x;
    this.baseY = y - 4;
    this.t = Math.random() * 6;
    this.removed = false;
    this.heal = 8;
    this.score = 50;
  }
  get box() { return { x: this.x - 7, y: this.baseY - 14, w: 14, h: 14 }; }
  update(dt) {
    this.t += dt;
    this.anim.update(dt);
    const p = this.scene.player;
    if (p.alive && this.scene.overlaps(this.box, p.box)) {
      p.heal(this.heal);
      this.scene.addScore(this.score, this.x, this.baseY - 16);
      this.scene.audio.play('audio/sfx/item');
      this.scene.spawnEffect('efeitos/brilho_item', this.x, this.baseY - 2);
      this.removed = true;
    }
  }
  draw(r) { this.anim.draw(r, this.x, this.baseY + Math.round(Math.sin(this.t * 3) * 2)); }
}

/** Placa de checkpoint: ao passar, vira o novo ponto de renascimento. */
export class Checkpoint {
  constructor(scene, x, y) {
    this.scene = scene;
    this.anim = new Animator(scene.game.assets, '');
    this.anim.play('itens/checkpoint_inativo');
    this.x = x;
    this.y = y;
    this.activated = false;
    this.removed = false;
  }
  get box() { return { x: this.x - 12, y: this.y - 48, w: 24, h: 48 }; }
  update(dt) {
    this.anim.update(dt);
    const p = this.scene.player;
    if (!this.activated && p.alive && this.scene.overlaps(this.box, p.box)) {
      this.activated = true;
      this.anim.play('itens/checkpoint_ativo');
      this.scene.setRespawn(this.x, this.y);
      this.scene.audio.play('audio/sfx/checkpoint');
      this.scene.spawnEffect('efeitos/brilho_item', this.x, this.y - 40);
    }
  }
  draw(r) { this.anim.draw(r, this.x, this.y); }
}

/** Placa de saída: encostar termina a fase. */
export class Goal {
  constructor(scene, x, y) {
    this.scene = scene;
    this.anim = new Animator(scene.game.assets, '');
    this.anim.play('itens/fim_de_fase');
    this.x = x;
    this.y = y;
    this.reached = false;
    this.removed = false;
  }
  get box() { return { x: this.x - 8, y: this.y - 64, w: 16, h: 64 }; }
  update(dt) {
    this.anim.update(dt);
    const p = this.scene.player;
    if (!this.reached && p.alive && this.scene.overlaps(this.box, p.box)) {
      this.reached = true;
      this.scene.onGoalReached();
    }
  }
  draw(r) { this.anim.draw(r, this.x, this.y); }
}
