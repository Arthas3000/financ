// Base dos inimigos: física, patrulha, percepção do jogador, dano e derrota.
// Cada inimigo concreto (LogMax, Ponssee) implementa só o seu comportamento em think().

import { Entity } from '../Entity.js';
import { moveBody } from '../../world/Physics.js';
import { approach, randRange } from '../../core/math.js';

const GRAVITY = 1200;
const MAX_FALL = 420;

export class Enemy extends Entity {
  constructor(scene, def, x, y) {
    super(scene, { x, y, w: def.body.w, h: def.body.h, sprites: def.sprites });
    this.def = def;
    this.hp = def.hp;
    this.state = 'patrol';
    this.stateTime = 0;
    this.active = false;     // só começa a agir quando aparece na tela
    this.facing = -1;        // começa olhando para o jogador que vem da esquerda
    this.hurtTimer = 0;
    this.cooldown = 0;
    this.pauseTimer = randRange(1.5, 3.5);
    this.engaged = false;    // já viu o jogador?
    this.anim.play('parado');
  }

  get player() { return this.scene.player; }
  get dying() { return this.state === 'dying'; }

  setState(state) {
    if (this.state === state) return;
    this.state = state;
    this.stateTime = 0;
  }

  update(dt) {
    if (!this.active) {
      if (!this.scene.camera.isVisible(this.box, 24)) return;
      this.active = true;
    }
    this.stateTime += dt;
    this.cooldown = Math.max(0, this.cooldown - dt);

    if (this.state === 'dying') return this._updateDying(dt);
    if (this.state === 'hurt') {
      this.hurtTimer -= dt;
      this.vx = approach(this.vx, 0, 500 * dt);
      if (this.hurtTimer <= 0) this.setState(this.engaged ? 'engage' : 'patrol');
      this.anim.play('dano');
    } else if (this.state === 'alert') {
      this.vx = 0;
      this.facePlayer();
      this.anim.play('alerta');
      if (this.stateTime > 0.45) this.setState('engage');
    } else {
      this.think(dt);
    }

    this.vy = Math.min(this.vy + GRAVITY * dt, MAX_FALL);
    moveBody(this, this.scene.level, dt);
    if (this.top > this.scene.level.height) this.removed = true; // caiu num buraco

    // Encostar no inimigo machuca.
    const p = this.player;
    if (p.alive && this.state !== 'hurt' && this.scene.overlaps(this.box, p.box)) {
      p.hurt(this.def.contactDamage, this.centerX, 150);
    }
    this.anim.update(dt);
  }

  /** Comportamento específico — sobrescrito nas subclasses. */
  think() {}

  // ── Percepção ──
  dxToPlayer() { return this.player.centerX - this.centerX; }
  distToPlayer() { return Math.abs(this.dxToPlayer()); }
  facePlayer() { const dx = this.dxToPlayer(); if (Math.abs(dx) > 2) this.facing = Math.sign(dx); }

  /** Vê o jogador: dentro do alcance, mais ou menos na mesma altura e (se ainda não o viu) à frente. */
  seesPlayer() {
    const p = this.player;
    if (!p.alive) return false;
    const dx = this.dxToPlayer();
    const dy = Math.abs(p.bottom - this.bottom);
    const inFront = this.engaged || Math.sign(dx) === this.facing || Math.abs(dx) < 40;
    return Math.abs(dx) < this.def.sight.range && dy < this.def.sight.height && inFront;
  }

  /** Avisa que viu o jogador ("!") — só na primeira vez. */
  notice() {
    this.engaged = true;
    this.setState('alert');
    this.scene.audio.play('audio/sfx/inimigo_alerta');
  }

  /** Há chão logo à frente na direção `dir`? (Evita cair de beiradas.) */
  groundAhead(dir) {
    const x = dir > 0 ? this.x + this.w + 2 : this.x - 2;
    return this.scene.level.isGroundAt(x, this.bottom + 2);
  }

  wallAhead(dir) {
    const x = dir > 0 ? this.x + this.w + 1 : this.x - 1;
    return this.scene.level.isSolidAt(x, this.bottom - 4);
  }

  /** Caminha na direção `dir` sem cair de beiradas. Retorna false se não pôde andar. */
  walk(dir, speed, dt) {
    if (dir === 0 || !this.onGround || !this.groundAhead(dir) || this.wallAhead(dir)) {
      this.vx = approach(this.vx, 0, this.def.accel * dt);
      return false;
    }
    this.vx = approach(this.vx, dir * speed, this.def.accel * dt);
    return true;
  }

  /** Patrulha: anda, para de vez em quando, vira em paredes/beiradas. */
  patrol(dt) {
    this.pauseTimer -= dt;
    if (this.pauseTimer < 0) {
      this.vx = approach(this.vx, 0, this.def.accel * dt);
      this.anim.play('parado');
      if (this.pauseTimer < -1.2) { this.pauseTimer = randRange(2, 4); this.facing *= -1; }
      return;
    }
    if (!this.walk(this.facing, this.def.patrolSpeed, dt) && this.onGround) this.facing *= -1;
    this.anim.play('andando');
  }

  // ── Dano ──
  takeHit(damage, fromX, knockback) {
    if (this.state === 'dying') return false;
    this.hp -= damage;
    this.scene.audio.play('audio/sfx/inimigo_dano', { minGap: 0.05 });
    if (!this.engaged) this.engaged = true;
    if (this.hp <= 0) { this.die(fromX); return true; }
    const dir = this.centerX < fromX ? -1 : 1;
    this.vx = dir * knockback;
    if (knockback > 150) this.vy = -140;
    this.facing = -dir;
    this.hurtTimer = 0.22;
    this.setState('hurt');
    this.anim.play('dano', { restart: true });
    return true;
  }

  die(fromX) {
    this.setState('dying');
    this.vx = (this.centerX < fromX ? -1 : 1) * 60;
    this.vy = -160;
    this.anim.play('morte', { restart: true });
    this.scene.audio.play('audio/sfx/inimigo_morte');
  }

  _updateDying(dt) {
    this.vy = Math.min(this.vy + GRAVITY * dt, MAX_FALL);
    this.vx = approach(this.vx, 0, 200 * dt);
    moveBody(this, this.scene.level, dt);
    this.anim.update(dt);
    if (this.anim.finished && this.stateTime > 0.5) {
      this.removed = true;
      this.scene.onEnemyDefeated(this);
    }
  }

  draw(r) {
    this.drawSprite(r);
    if (this.state === 'alert') {
      const s = this.scene.game.assets.sprite('efeitos/alerta');
      if (s) r.frame(s, Math.floor(this.stateTime * 8), this.centerX - 8, this.top - 18);
    }
  }
}
