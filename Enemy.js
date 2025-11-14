import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@7.x/dist/pixi.min.mjs";
import { GAME_CONFIG } from "./config.js";

export class Enemy {
  constructor(app, player) {
    this.app = app;
    this.player = player;
    this.dead = false;

    this.sprite = PIXI.Sprite.from("enemy");
    this.sprite.anchor.set(0.5);

    const isElite = Math.random() < GAME_CONFIG.enemy.eliteChance;
    const scale = isElite ? 0.9 : 0.7 + Math.random() * 0.2;
    this.sprite.scale.set(scale);
    this.sprite.tint = isElite ? 0xff8bd8 : 0xffffff;

    const { width, height } = app.screen;
    const padding = 60;
    const side = Math.floor(Math.random() * 4);

    if (side === 0) {
      this.sprite.x = Math.random() * width;
      this.sprite.y = -padding;
    } else if (side === 1) {
      this.sprite.x = Math.random() * width;
      this.sprite.y = height + padding;
    } else if (side === 2) {
      this.sprite.x = -padding;
      this.sprite.y = Math.random() * height;
    } else {
      this.sprite.x = width + padding;
      this.sprite.y = Math.random() * height;
    }

    const [minHp, maxHp] = GAME_CONFIG.enemy.healthRange;
    this.hitPoints = minHp + Math.floor(Math.random() * (maxHp - minHp + 1));
    this.hitRadius = GAME_CONFIG.enemy.hitRadius * scale;
    this.damage = isElite ? 2 : 1;

    if (isElite) {
      this.hitPoints += GAME_CONFIG.enemy.eliteHealthBonus;
    }

    this.baseSpeed =
      GAME_CONFIG.enemy.baseSpeed +
      Math.random() * GAME_CONFIG.enemy.speedVariance +
      (isElite ? GAME_CONFIG.enemy.eliteSpeedBonus : 0);

    this.velocity = { x: 0, y: 0 };
    this.scoreValue =
      GAME_CONFIG.scoring.kill + (isElite ? GAME_CONFIG.enemy.eliteScoreBonus : 0);
  }

  update(dt) {
    const dx = this.player.sprite.x - this.sprite.x;
    const dy = this.player.sprite.y - this.sprite.y;
    const distance = Math.hypot(dx, dy) || 1;
    const desiredVx = (dx / distance) * this.baseSpeed;
    const desiredVy = (dy / distance) * this.baseSpeed;

    // Smooth steering so the enemies feel more natural.
    const lerp = Math.min(1, dt * 8);
    this.velocity.x += (desiredVx - this.velocity.x) * lerp;
    this.velocity.y += (desiredVy - this.velocity.y) * lerp;

    this.sprite.x += this.velocity.x * dt;
    this.sprite.y += this.velocity.y * dt;
    this.sprite.rotation = Math.atan2(this.velocity.y, this.velocity.x);
  }

  takeDamage(amount) {
    this.hitPoints -= amount;
    if (this.hitPoints <= 0) {
      this.dead = true;
      return true;
    }
    return false;
  }

  collidesWithPlayer(player) {
    const radius = this.hitRadius + GAME_CONFIG.player.collisionRadius;
    const dx = player.sprite.x - this.sprite.x;
    const dy = player.sprite.y - this.sprite.y;
    return dx * dx + dy * dy < radius * radius;
  }
}
