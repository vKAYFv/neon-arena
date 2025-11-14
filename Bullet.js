import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@7.x/dist/pixi.min.mjs";
import { GAME_CONFIG } from "./config.js";

class Bullet {
  constructor(app) {
    this.app = app;
    this.sprite = PIXI.Sprite.from("bullet");
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.7);
    this.sprite.visible = false;
    this.speed = GAME_CONFIG.bullet.speed;
    this.damage = GAME_CONFIG.bullet.damage;
    this.dead = true;
    this.life = 0;
    this.angle = 0;
    this.vx = 0;
    this.vy = 0;
  }

  reset(originSprite, angle) {
    this.sprite.x = originSprite.x;
    this.sprite.y = originSprite.y;
    this.angle = angle;
    this.sprite.rotation = angle;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.dead = false;
    this.life = 0;
    this.sprite.visible = true;
  }

  update(dt, screen) {
    this.sprite.x += this.vx * dt;
    this.sprite.y += this.vy * dt;
    this.life += dt;
    if (
      this.life >= GAME_CONFIG.bullet.lifetime ||
      this.sprite.x < -64 ||
      this.sprite.x > screen.width + 64 ||
      this.sprite.y < -64 ||
      this.sprite.y > screen.height + 64
    ) {
      this.dead = true;
    }
  }

  collidesWith(enemy) {
    const dx = enemy.sprite.x - this.sprite.x;
    const dy = enemy.sprite.y - this.sprite.y;
    const radius = GAME_CONFIG.bullet.collisionRadius + enemy.hitRadius;
    return dx * dx + dy * dy < radius * radius;
  }
}

export class BulletManager {
  constructor(app, world) {
    this.app = app;
    this.container = new PIXI.Container();
    world.addChild(this.container);

    this.active = [];
    this.pool = [];
    for (let i = 0; i < GAME_CONFIG.bullet.poolSize; i += 1) {
      this.pool.push(this._createBullet());
    }
  }

  _createBullet() {
    const bullet = new Bullet(this.app);
    this.container.addChild(bullet.sprite);
    return bullet;
  }

  spawn(originSprite, angleOffset = 0) {
    const bullet = this.pool.pop() || this._createBullet();
    const angle = originSprite.rotation + angleOffset;
    bullet.reset(originSprite, angle);
    this.active.push(bullet);
    return bullet;
  }

  update(dt) {
    const screen = this.app.screen;
    for (const bullet of this.active) {
      bullet.update(dt, screen);
    }

    for (let i = this.active.length - 1; i >= 0; i -= 1) {
      if (this.active[i].dead) {
        const deadBullet = this.active.splice(i, 1)[0];
        deadBullet.sprite.visible = false;
        this.pool.push(deadBullet);
      }
    }
  }

  getActive() {
    return this.active;
  }

  reset() {
    for (const bullet of this.active) {
      bullet.dead = true;
      bullet.sprite.visible = false;
      this.pool.push(bullet);
    }
    this.active.length = 0;
  }
}
