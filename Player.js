import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@7.x/dist/pixi.min.mjs";
import { GAME_CONFIG } from "./config.js";

export class Player {
  constructor(app, input, bulletManager) {
    this.app = app;
    this.input = input;
    this.bullets = bulletManager;

    this.sprite = PIXI.Sprite.from("player");
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.7);
    this.sprite.x = app.screen.width / 2;
    this.sprite.y = app.screen.height / 2;

    this.velocity = { x: 0, y: 0 };
    this.fireCooldown = 0;
    this.health = GAME_CONFIG.player.maxHealth;
    this.invulnTimer = 0;
    this.input.setPointer({ x: this.sprite.x, y: this.sprite.y });
  }

  _updateMovement(dt) {
    const move = this.input.getMoveVector();
    const { acceleration, drag, maxSpeed } = GAME_CONFIG.player;

    this.velocity.x += move.x * acceleration * dt;
    this.velocity.y += move.y * acceleration * dt;

    const dragFactor = Math.pow(drag, dt * 60);
    this.velocity.x *= dragFactor;
    this.velocity.y *= dragFactor;

    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      this.velocity.x *= scale;
      this.velocity.y *= scale;
    }

    this.sprite.x += this.velocity.x * dt;
    this.sprite.y += this.velocity.y * dt;

    const padding = GAME_CONFIG.worldPadding;
    const { width, height } = this.app.screen;
    this.sprite.x = Math.max(padding, Math.min(width - padding, this.sprite.x));
    this.sprite.y = Math.max(padding, Math.min(height - padding, this.sprite.y));
  }

  _updateRotation() {
    const aim = this.input.pointer;
    const dx = aim.x - this.sprite.x;
    const dy = aim.y - this.sprite.y;
    this.sprite.rotation = Math.atan2(dy, dx);
  }

  _updateShooting(dt) {
    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0 && this.input.isFiring()) {
      const spread = (Math.random() - 0.5) * GAME_CONFIG.player.spread;
      this.bullets.spawn(this.sprite, spread);
      this.fireCooldown = 1 / GAME_CONFIG.player.fireRate;
    }
  }

  _updateDamageState(dt) {
    if (this.invulnTimer > 0) {
      this.invulnTimer -= dt;
      this.sprite.alpha = 0.5 + Math.sin(this.invulnTimer * 40) * 0.25;
    } else {
      this.sprite.alpha = 1;
    }
  }

  takeDamage(amount = 1) {
    if (this.invulnTimer > 0) return false;
    this.health = Math.max(0, this.health - amount);
    this.invulnTimer = GAME_CONFIG.player.hitInvulnerability;
    return this.health <= 0;
  }

  isDead() {
    return this.health <= 0;
  }

  healFull() {
    this.health = GAME_CONFIG.player.maxHealth;
    this.invulnTimer = 0;
    this.sprite.alpha = 1;
  }

  resetPosition(x, y) {
    this.sprite.x = x;
    this.sprite.y = y;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.input.setPointer({ x, y });
  }

  update(dt) {
    this._updateMovement(dt);
    this._updateRotation();
    this._updateShooting(dt);
    this._updateDamageState(dt);
  }
}
