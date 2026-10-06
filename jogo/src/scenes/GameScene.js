// Cena de jogo: monta a fase, roda a simulação e liga todos os sistemas
// (jogador, inimigos, projéteis, itens, efeitos, câmera, HUD, pausa e fim de fase).
//
// Estados:  intro → play ⇄ paused
//                    play → dying → (renasce | ContinueScene)
//                    play → clear → (próxima fase | EndingScene)

import { VIEW_W, VIEW_H, RULES, DEBUG } from '../config/constants.js';
import { CHARACTERS } from '../config/characters.js';
import { ENEMIES } from '../config/enemies.js';
import { PHASES } from '../config/phases.js';
import { Level } from '../world/Level.js';
import { Parallax } from '../world/Parallax.js';
import { Camera } from '../core/Camera.js';
import { overlaps, randRange, clamp, easeOutBack, easeOutCubic } from '../core/math.js';
import { SamuraiJeff } from '../entities/characters/SamuraiJeff.js';
import { Kanka } from '../entities/characters/Kanka.js';
import { Paulinho } from '../entities/characters/Paulinho.js';
import { LogMax } from '../entities/enemies/LogMax.js';
import { Ponssee } from '../entities/enemies/Ponssee.js';
import { Effect, Particle, ScorePopup, spawnOrbBurst } from '../entities/Effects.js';
import { Marmita, Checkpoint, Goal } from '../entities/Items.js';
import { Hud, formatTime } from '../ui/Hud.js';
import { ButtonMenu } from '../ui/ButtonMenu.js';
import { ContinueScene } from './ContinueScene.js';
import { EndingScene } from './EndingScene.js';
import { TitleScene } from './TitleScene.js';

const PLAYER_CLASSES = { samurai_jeff: SamuraiJeff, kanka: Kanka, paulinho: Paulinho };
const ENEMY_CLASSES = { logmax: LogMax, ponssee: Ponssee };

export class GameScene {
  /**
   * @param opts.characterId  personagem escolhido
   * @param opts.phaseIndex   0 = fase 1
   * @param opts.score        pontuação acumulada
   * @param opts.lives        vidas restantes
   * @param opts.checkpoint   {x, y} para renascer no checkpoint
   */
  constructor(game, { characterId, phaseIndex = 0, score = 0, lives = RULES.lives, checkpoint = null }) {
    this.game = game;
    this.characterId = characterId;
    this.phaseIndex = phaseIndex;
    this.phase = PHASES[phaseIndex];
    this.score = score;
    this.phaseStartScore = score;
    this.lives = lives;
    this.checkpoint = checkpoint;

    this.level = new Level(this.phase);
    this.parallax = new Parallax(game.assets, this.phase.folder);
    this.tileset = game.assets.sprite(this.phase.folder + 'tileset');
    this.camera = new Camera();
    this.camera.setBounds(this.level.width, this.level.height);
    this.hud = new Hud(game);

    this.enemies = [];
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
    this.items = [];
    this.effects = [];

    this.time = 0;          // tempo de fase (para o bônus)
    this.hitstopTimer = 0;  // congelamento curto nos impactos
    this.state = 'intro';
    this.stateTime = 0;
    this.enemiesDefeated = 0;
    this.pauseMenu = null;

    this._spawnAll();
  }

  get audio() { return this.game.audio; }

  // ───────────────────────────── Montagem ─────────────────────────────

  _spawnAll() {
    const { spawns } = this.level;
    const start = this.checkpoint ?? spawns.player;
    const PlayerClass = PLAYER_CLASSES[this.characterId];
    this.player = new PlayerClass(this, CHARACTERS[this.characterId], start.x, start.y);
    this.player.freeze();

    const enemyDef = ENEMIES[this.phase.enemy];
    const EnemyClass = ENEMY_CLASSES[this.phase.enemy];
    for (const s of spawns.enemies) {
      // Ao renascer num checkpoint, os inimigos que ficaram para trás não reaparecem.
      if (this.checkpoint && s.x < this.checkpoint.x) continue;
      this.enemies.push(new EnemyClass(this, enemyDef, s.x, s.y));
    }
    for (const s of spawns.pickups) this.items.push(new Marmita(this, s.x, s.y));
    for (const s of spawns.checkpoints) {
      const cp = new Checkpoint(this, s.x, s.y);
      if (this.checkpoint && s.x <= this.checkpoint.x) { cp.activated = true; cp.anim.play('itens/checkpoint_ativo'); }
      this.items.push(cp);
    }
    if (spawns.goal) this.items.push(new Goal(this, spawns.goal.x, spawns.goal.y));

    this.decorations = this.level.decorations.map((d) => ({ ...d, sprite: this.game.assets.sprite(this.phase.folder + d.sprite) }));
    this.camera.snapTo(this.player);
  }

  enter() {
    this.audio.playMusic(this.phase.music);
    if (!this.checkpoint) this.audio.play('audio/sfx/ui_anuncio', { pitchVar: 0 });
  }

  // ───────────────────────────── API usada pelas entidades ─────────────────────────────

  overlaps(a, b) { return overlaps(a, b); }
  shake(power, duration) { this.camera.shake(power, duration); }
  hitstop(seconds) { this.hitstopTimer = Math.max(this.hitstopTimer, seconds); }
  addEffect(e) { if (!e.removed) this.effects.push(e); }
  spawnEffect(spriteId, x, y, opts) { this.addEffect(new Effect(this, spriteId, x, y, opts)); }
  addPlayerProjectile(p) { this.playerProjectiles.push(p); }
  addEnemyProjectile(p) { this.enemyProjectiles.push(p); }
  setRespawn(x, y) { this.checkpoint = { x, y }; }

  addScore(points, x, y) {
    this.score += points;
    if (x !== undefined) this.addEffect(new ScorePopup(this, `+${points}`, x, y));
  }

  /** Golpe corpo a corpo do jogador contra os inimigos. */
  meleeHit(player, attack, boxes) {
    const def = attack.def;
    for (const enemy of this.enemies) {
      if (!enemy.active || enemy.dying || enemy.removed) continue;
      const hitBox = boxes.find((b) => overlaps(b, enemy.box));
      if (!hitBox) continue;
      const last = attack.hits.get(enemy);
      if (last !== undefined && this.time - last < def.hitInterval) continue;
      attack.hits.set(enemy, this.time);
      enemy.takeHit(def.damage, player.centerX, def.knockback);
      this.hitstop(def.hitstop);
      if (def.hitSound) this.audio.play('audio/sfx/' + def.hitSound, { minGap: 0.05 });
      // Faísca no ponto de contato.
      const cx = clamp(enemy.centerX, hitBox.x, hitBox.x + hitBox.w);
      const cy = clamp(enemy.centerY, hitBox.y, hitBox.y + hitBox.h);
      this.spawnEffect('efeitos/faisca_acerto', cx, cy + 16);
      if (def.hitEffect === 'chips') this._sawdust(cx, cy, player.facing);
    }
  }

  /** Lascas voando do sabre de motosserra. */
  _sawdust(x, y, dir) {
    for (let i = 0; i < 3; i++) {
      this.addEffect(new Particle(this, 'efeitos/serragem', x, y, {
        vx: dir * randRange(30, 110), vy: randRange(-160, -60), gravity: 600, life: randRange(0.3, 0.55),
      }));
    }
  }

  /** Projétil do jogador encostou em algum inimigo? Aplica o dano e retorna true. */
  projectileHit(proj) {
    const cfg = proj.cfg;
    for (const enemy of this.enemies) {
      if (!enemy.active || enemy.dying || enemy.removed) continue;
      if (!overlaps(proj.box, enemy.box)) continue;
      enemy.takeHit(proj.damage, proj.x - Math.sign(proj.vx) * 20, cfg.knockback);
      this.hitstop(cfg.hitstop);
      this.audio.play('audio/sfx/ferramenta_acerto');
      return true;
    }
    return false;
  }

  /** Golpe corpo a corpo de inimigo contra o jogador. */
  enemyMeleeHit(enemy, boxes, damage, knockback) {
    const p = this.player;
    if (p.alive && boxes.some((b) => overlaps(b, p.box))) p.hurt(damage, enemy.centerX, knockback);
  }

  onEnemyDefeated(enemy) {
    this.enemiesDefeated++;
    spawnOrbBurst(this, enemy.centerX, enemy.centerY);
    this.spawnEffect('efeitos/fumaca', enemy.centerX, enemy.bottom);
    this.addScore(enemy.def.score, enemy.centerX, enemy.top - 6);
  }

  onPlayerDeath() {
    this.state = 'dying';
    this.stateTime = 0;
    this.audio.stopMusic(0.8);
    if (!this.player.fell) spawnOrbBurst(this, this.player.centerX, this.player.centerY);
  }

  onGoalReached() {
    this.state = 'clear';
    this.stateTime = 0;
    this.player.celebrate();
    this.audio.stopMusic(0.2);
    this.audio.playMusic('audio/musica/vitoria', { fade: 0.05 });
    // Bônus calculados uma vez; a tela de resultado os conta "rolando".
    const timeBonus = Math.max(0, Math.floor(RULES.timeBonusLimit - this.time)) * RULES.timeBonusPerSecond;
    const hpBonus = this.player.hp * 20;
    this.tally = { timeBonus, hpBonus, shown: 0, total: timeBonus + hpBonus, base: this.score, done: false };
  }

  // ───────────────────────────── Atualização ─────────────────────────────

  update(dt) {
    this.stateTime += dt;
    const input = this.game.input;

    if (this.state === 'paused') return this._updatePause(dt);
    if (this.state === 'play' && (input.pressed('start') || input.pressed('back'))) return this._pause();

    if (this.state === 'intro') {
      const introLength = this.checkpoint ? 0.9 : 2.4;
      if (this.stateTime >= introLength) { this.state = 'play'; this.stateTime = 0; this.player.unfreeze(); }
    }

    // Hitstop: o mundo congela por alguns ms para o golpe "pesar".
    if (this.hitstopTimer > 0) { this.hitstopTimer -= dt; return; }

    if (this.state === 'play') this.time += dt;

    this.player.update(dt);
    for (const e of this.enemies) e.update(dt);
    for (const p of this.playerProjectiles) p.update(dt);
    for (const p of this.enemyProjectiles) p.update(dt);
    for (const i of this.items) i.update(dt);
    for (const fx of this.effects) fx.update(dt);
    this._prune();

    // Se caiu num buraco, a câmera fica parada vendo-o sumir.
    if (!(this.state === 'dying' && this.player.fell)) this.camera.follow(this.player, dt);
    this.hud.update(dt, this.player);

    if (this.state === 'dying' && this.stateTime > 2.4) this._afterDeath();
    if (this.state === 'clear') this._updateClear(dt);
  }

  _prune() {
    const alive = (x) => !x.removed;
    this.enemies = this.enemies.filter(alive);
    this.playerProjectiles = this.playerProjectiles.filter(alive);
    this.enemyProjectiles = this.enemyProjectiles.filter(alive);
    this.items = this.items.filter(alive);
    this.effects = this.effects.filter(alive);
  }

  _pause() {
    this.state = 'paused';
    this.audio.duckMusic(true);
    this.audio.play('audio/sfx/ui_confirmar', { pitchVar: 0 });
    this.pauseMenu = new ButtonMenu(this.game, [
      { label: 'CONTINUAR', action: 'resume' },
      { label: 'REINICIAR FASE', action: 'restart' },
      { label: 'MENU PRINCIPAL', action: 'title' },
    ], { x: VIEW_W / 2, y: 82, spacing: 24 });
  }

  _updatePause(dt) {
    const input = this.game.input;
    const chosen = this.pauseMenu.update(dt);
    const resume = () => { this.state = 'play'; this.audio.duckMusic(false); };
    if (!chosen && this.pauseMenu.t > 0.25 && (input.pressed('start') || input.pressed('back'))) return resume();
    if (!chosen) return;
    if (chosen.action === 'resume') resume();
    if (chosen.action === 'restart') {
      this.audio.duckMusic(false);
      this.game.transitionTo(() => new GameScene(this.game, {
        characterId: this.characterId, phaseIndex: this.phaseIndex, score: this.phaseStartScore, lives: this.lives,
      }));
    }
    if (chosen.action === 'title') {
      this.audio.duckMusic(false);
      this.game.transitionTo(() => new TitleScene(this.game, { skipIntro: true }));
    }
  }

  _afterDeath() {
    this.state = 'gone';
    const lives = this.lives - 1;
    if (lives > 0) {
      // Renasce (no checkpoint, se houver) com a fase recarregada.
      this.game.transitionTo(() => new GameScene(this.game, {
        characterId: this.characterId, phaseIndex: this.phaseIndex, score: this.score, lives, checkpoint: this.checkpoint,
      }));
    } else {
      this.game.transitionTo(() => new ContinueScene(this.game, {
        characterId: this.characterId, phaseIndex: this.phaseIndex, score: this.score,
      }));
    }
  }

  _updateClear(dt) {
    const t = this.tally;
    // Depois de 2 s, os bônus "rolam" para a pontuação, com tique sonoro.
    if (this.stateTime > 2 && !t.done) {
      const before = t.shown;
      t.shown = Math.min(t.total, t.shown + Math.max(10, t.total) * dt * 0.8);
      this.score = t.base + Math.floor(t.shown);
      if (Math.floor(before / 50) !== Math.floor(t.shown / 50)) this.audio.play('audio/sfx/ui_tique', { pitchVar: 0, minGap: 0.05 });
      if (t.shown >= t.total) { t.done = true; t.doneAt = this.stateTime; }
    }
    const input = this.game.input;
    if (t.done && (this.stateTime - t.doneAt > 4 || (this.stateTime - t.doneAt > 0.5 && input.confirm()))) {
      this.state = 'gone';
      const next = this.phaseIndex + 1;
      if (next < PHASES.length) {
        this.game.transitionTo(() => new GameScene(this.game, {
          characterId: this.characterId, phaseIndex: next, score: this.score, lives: this.lives,
        }), { duration: 0.6 });
      } else {
        this.game.transitionTo(() => new EndingScene(this.game, { characterId: this.characterId, score: this.score }), { duration: 0.8 });
      }
    }
  }

  // ───────────────────────────── Desenho ─────────────────────────────

  draw(r) {
    const cam = this.camera;
    const cx = cam.renderX, cy = cam.renderY;
    this.parallax.drawBack(r, cx, cy);

    r.beginWorld(cx, cy);
    for (const d of this.decorations) {
      const s = d.sprite;
      if (!s || d.x + s.frameW < cx || d.x - s.frameW > cx + VIEW_W) continue;
      r.image(s, d.x - s.frameW / 2, d.y - s.frameH);
    }
    this.level.drawTiles(r, this.tileset, cam);
    for (const i of this.items) i.draw(r);
    for (const e of this.enemies) e.draw(r);
    this.player.draw(r);
    for (const p of this.playerProjectiles) p.draw(r);
    for (const p of this.enemyProjectiles) p.draw(r);
    for (const fx of this.effects) fx.draw(r);
    if (DEBUG) this._drawDebug(r);
    r.endWorld();

    this.parallax.drawFront(r, cx, cy);
    this.hud.draw(r, { player: this.player, lives: this.lives, score: this.score, time: this.time, phase: this.phase });

    if (this.state === 'intro') this._drawIntro(r);
    if (this.state === 'play' && this.stateTime < 0.7) this._drawGo(r, this.stateTime);
    if (this.state === 'clear') this._drawClear(r);
    if (this.state === 'paused') this._drawPause(r);
  }

  /** Faixa "FASE 1 — FLORESTA DE PINUS" atravessando a tela. */
  _drawIntro(r) {
    if (this.checkpoint) return;
    const { assets, font } = this.game;
    const t = this.stateTime;
    const inP = easeOutCubic(clamp(t / 0.4, 0, 1));
    const outP = clamp((t - 1.7) / 0.35, 0, 1);
    const x = Math.round((1 - inP) * -VIEW_W + outP * VIEW_W);
    const y = 70;
    r.image(assets.sprite('ui/faixa'), x, y);
    font.draw(r, this.phase.title, VIEW_W / 2 + x, y + 3, { align: 'center', color: 'metal', scale: 2 });
    font.draw(r, this.phase.name, VIEW_W / 2 + x, y + 24, { align: 'center', color: 'amarela' });
  }

  _drawGo(r, t) {
    const p = easeOutBack(clamp(t / 0.25, 0, 1));
    const alpha = 1 - clamp((t - 0.4) / 0.3, 0, 1);
    const y = Math.round(80 - (1 - p) * 30);
    this.game.font.draw(r, 'VAI!', VIEW_W / 2, y, { align: 'center', color: 'metal', scale: 3, alpha });
  }

  _drawClear(r) {
    const { assets, font } = this.game;
    const t = this.stateTime;
    if (t < 0.6) return;
    const p = easeOutBack(clamp((t - 0.6) / 0.4, 0, 1));
    r.fade(0.45 * clamp((t - 0.6) / 0.4, 0, 1));
    const y = Math.round(40 - (1 - p) * 80);
    r.image(assets.sprite('ui/faixa'), 0, y);
    font.draw(r, 'MISSÃO COMPLETA!', VIEW_W / 2, y + 9, { align: 'center', color: 'metal', scale: 2 });
    if (t < 1.4) return;
    const tl = this.tally;
    const rows = [
      ['INIMIGOS DERROTADOS', String(this.enemiesDefeated)],
      ['TEMPO', formatTime(this.time)],
      ['BÔNUS DE TEMPO', String(tl.timeBonus)],
      ['BÔNUS DE VIDA', String(tl.hpBonus)],
      ['PONTOS', String(this.score).padStart(6, '0')],
    ];
    rows.forEach(([label, value], i) => {
      if (t < 1.4 + i * 0.15) return;
      const ry = 96 + i * 13;
      const last = i === rows.length - 1;
      font.draw(r, label, 96, ry, { color: last ? 'amarela' : 'branca' });
      font.draw(r, value, VIEW_W - 96, ry, { align: 'right', color: last ? 'amarela' : 'ciano' });
    });
    if (tl.done && Math.floor(this.game.time * 2.5) % 2 === 0) {
      font.draw(r, 'PRESSIONE START', VIEW_W / 2, 172, { align: 'center', color: 'amarela' });
    }
  }

  _drawPause(r) {
    const { assets, font } = this.game;
    r.fade(0.55);
    r.nineSlice(assets.sprite('ui/painel'), VIEW_W / 2 - 96, 48, 192, 120);
    font.draw(r, 'PAUSA', VIEW_W / 2, 58, { align: 'center', color: 'metal', scale: 2 });
    this.pauseMenu.draw(r);
    font.draw(r, 'M: LIGAR/DESLIGAR SOM', VIEW_W / 2, VIEW_H - 14, { align: 'center', color: 'cinza' });
  }

  _drawDebug(r) {
    r.debugBox(this.player.box, '#0f0');
    for (const b of this.player.currentHitboxes ?? []) r.debugBox(b, '#f00');
    for (const e of this.enemies) {
      r.debugBox(e.box, '#ff0');
      for (const b of e.currentHitboxes ?? []) r.debugBox(b, '#f0f');
    }
    for (const p of [...this.playerProjectiles, ...this.enemyProjectiles]) r.debugBox(p.box, '#0ff');
  }
}
