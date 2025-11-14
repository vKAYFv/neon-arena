import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@7.x/dist/pixi.min.mjs";

class Particle {
  constructor(app, x, y, color) {
    this.app = app;
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(color);
    this.sprite.drawCircle(0, 0, 3 + Math.random() * 3);
    this.sprite.endFill();
    this.sprite.x = x;
    this.sprite.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
    this.life = 40 + Math.random() * 20;
  }

  update() {
    this.sprite.x += this.vx;
    this.sprite.y += this.vy;
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.life -= 1;
    this.sprite.alpha = Math.max(0, this.life / 60);
  }

  get dead() {
    return this.life <= 0;
  }
}

export class ParticleSystem {
  constructor(app, world) {
    this.app = app;
    this.world = world;
    this.particles = [];
  }

  spawnExplosion(x, y, intensity = 1) {
    const colors = [0xfff3b0, 0xffc857, 0xff6b6b, 0xf4a261];
    const count = Math.round(40 * intensity);
    for (let i = 0; i < count; i++) {
      const p = new Particle(this.app, x, y, colors[Math.floor(Math.random()*colors.length)]);
      this.particles.push(p);
      this.world.addChild(p.sprite);
    }
  }

  update() {
    for (const p of this.particles) {
      p.update();
    }
    this.particles = this.particles.filter((p) => !p.dead);
  }
}
