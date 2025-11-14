import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@7.x/dist/pixi.min.mjs";
import { Player } from "./Player.js";
import { Enemy } from "./Enemy.js";
import { BulletManager } from "./Bullet.js";
import { ParticleSystem } from "./ParticleSystem.js";
import { screenShake } from "./utils/ScreenShake.js";
import { InputManager } from "./utils/InputManager.js";
import { GAME_CONFIG } from "./config.js";
import { HUD } from "./HUD.js";

const GAME_STATE = {
  RUNNING: "running",
  GAME_OVER: "game-over",
};

export class Game {
  constructor(app) {
    this.app = app;
    this.container = new PIXI.Container();

    this.background = PIXI.Sprite.from("background");
    this.background.alpha = GAME_CONFIG.backgroundAlpha;
    this.container.addChild(this.background);

    this.world = new PIXI.Container();
    this.container.addChild(this.world);

    this.enemyLayer = new PIXI.Container();
    this.projectileLayer = new PIXI.Container();
    this.playerLayer = new PIXI.Container();
    this.effectLayer = new PIXI.Container();
    this.world.addChild(this.enemyLayer, this.projectileLayer, this.playerLayer, this.effectLayer);

    this.input = new InputManager();
    this.bullets = new BulletManager(app, this.projectileLayer);
    this.player = new Player(app, this.input, this.bullets);
    this.playerLayer.addChild(this.player.sprite);
    this.particles = new ParticleSystem(app, this.effectLayer);

    this.hud = new HUD(app);
    this.container.addChild(this.hud.container);

    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = GAME_CONFIG.enemy.spawn.initialInterval;
    this.score = 0;
    this.survivalTime = 0;
    this.comboTimer = 0;
    this.comboMultiplier = 1;
    this.state = GAME_STATE.RUNNING;

    this.app.renderer.events.cursorStyles.default = "crosshair";
    this._setupPointer();
    this._resizeBackground = () => this._syncBackground();
    this.app.renderer.on("resize", this._resizeBackground);
    this._syncBackground();
  }

  _syncBackground() {
    this.background.width = this.app.screen.width;
    this.background.height = this.app.screen.height;
  }

  _setupPointer() {
    const stage = this.app.stage;
    stage.eventMode = "static";
    stage.hitArea = this.app.screen;
    stage.on("pointermove", (event) => this.input.setPointer(event.global));
    stage.on("pointerdown", () => this.input.setPointerDown(true));
    stage.on("pointerup", () => this.input.setPointerDown(false));
    stage.on("pointerupoutside", () => this.input.setPointerDown(false));
  }

  _spawnEnemies() {
    const { burstChance, burstCount } = GAME_CONFIG.enemy.spawn;
    const burst = Math.random() < burstChance;
    const count = burst
      ? Math.floor(Math.random() * (burstCount[1] - burstCount[0] + 1)) + burstCount[0]
      : 1;

    for (let i = 0; i < count; i += 1) {
      const enemy = new Enemy(this.app, this.player);
      this.enemyLayer.addChild(enemy.sprite);
      this.enemies.push(enemy);
    }
  }

  _rampDifficulty() {
    const { minInterval, rampFactor } = GAME_CONFIG.enemy.spawn;
    this.spawnInterval = Math.max(minInterval, this.spawnInterval * rampFactor);
  }

  _updateEnemies(dt) {
    for (const enemy of this.enemies) {
      enemy.update(dt);
    }
  }

  _handleCollisions() {
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      if (enemy.collidesWithPlayer(this.player)) {
        const playerDied = this.player.takeDamage(enemy.damage);
        enemy.dead = true;
        this.particles.spawnExplosion(enemy.sprite.x, enemy.sprite.y, 0.8);
        screenShake(this.app, 9, 22);
        if (playerDied) {
          this._onPlayerDeath();
        }
      }
    }

    const bullets = this.bullets.getActive();
    for (const bullet of bullets) {
      if (bullet.dead) continue;
      for (const enemy of this.enemies) {
        if (enemy.dead) continue;
        if (bullet.collidesWith(enemy)) {
          bullet.dead = true;
          const died = enemy.takeDamage(bullet.damage);
          if (died) {
            this._onEnemyKilled(enemy);
          }
          break;
        }
      }
    }
  }

  _cleanupEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i -= 1) {
      const enemy = this.enemies[i];
      if (!enemy.dead) continue;
      this.enemyLayer.removeChild(enemy.sprite);
      enemy.sprite.destroy();
      this.enemies.splice(i, 1);
    }
  }

  _onEnemyKilled(enemy) {
    enemy.dead = true;
    this.particles.spawnExplosion(enemy.sprite.x, enemy.sprite.y, 1.2);
    screenShake(this.app, 5 + Math.min(4, this.comboMultiplier * 1.5), 14);
    this.comboTimer = GAME_CONFIG.scoring.comboWindow;
    this.comboMultiplier += GAME_CONFIG.scoring.comboBonusPerKill;
    this.score += enemy.scoreValue * this.comboMultiplier;
  }

  _tickCombo(dt) {
    if (this.comboTimer > 0) {
      this.comboTimer = Math.max(0, this.comboTimer - dt);
      if (this.comboTimer === 0) {
        this.comboMultiplier = 1;
      }
    }
  }

  _incrementSurvivalScore(dt) {
    this.score += GAME_CONFIG.scoring.survivalPerSecond * dt;
  }

  _onPlayerDeath() {
    this.state = GAME_STATE.GAME_OVER;
    this.hud.setGameOver(true);
  }

  _shouldRestart() {
    return this.input.isDown("r") || this.input.isDown("keyr") || this.input.isDown("enter");
  }

  reset() {
    this._clearEnemies();
    this.bullets.reset();
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;
    this.player.resetPosition(centerX, centerY);
    this.player.healFull();
    this.input.setPointerDown(false);
    this.score = 0;
    this.survivalTime = 0;
    this.spawnInterval = GAME_CONFIG.enemy.spawn.initialInterval;
    this.spawnTimer = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;
    this.state = GAME_STATE.RUNNING;
    this.hud.setGameOver(false);
  }

  _clearEnemies() {
    for (const enemy of this.enemies) {
      this.enemyLayer.removeChild(enemy.sprite);
      enemy.sprite.destroy();
    }
    this.enemies.length = 0;
  }

  update(delta) {
    const dt = delta / 60;
    this.particles.update();

    if (this.state === GAME_STATE.GAME_OVER) {
      if (this._shouldRestart()) {
        this.reset();
      }
      return;
    }

    this.survivalTime += dt;
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this._spawnEnemies();
      this.spawnTimer = 0;
      this._rampDifficulty();
    }

    this.player.update(dt);
    this.bullets.update(dt);
    this._updateEnemies(dt);
    this._handleCollisions();
    this._cleanupEnemies();
    this._tickCombo(dt);
    this._incrementSurvivalScore(dt);

    this.hud.update({
      score: Math.round(this.score),
      health: this.player.health,
      maxHealth: GAME_CONFIG.player.maxHealth,
      comboMultiplier: this.comboMultiplier,
      survivalTime: this.survivalTime,
    });
  }
}
