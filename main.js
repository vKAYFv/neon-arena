import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@7.x/dist/pixi.min.mjs";
import { Game } from "./Game.js";

const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x02020a,
  antialias: true,
});

document.body.appendChild(app.view);

const manifest = {
  bundles: [{
    name: "neon-arena",
    assets: [
      { name: "player", srcs: "assets/player.png" },
      { name: "enemy", srcs: "assets/enemy.png" },
      { name: "bullet", srcs: "assets/bullet.png" },
      { name: "explosion", srcs: "assets/explosion.png" },
      { name: "background", srcs: "assets/background.jpg" },
    ]
  }]
};

async function boot() {
  await PIXI.Assets.init({ manifest });
  await PIXI.Assets.loadBundle("neon-arena");
  document.getElementById("loading")?.remove();

  const game = new Game(app);
  app.stage.addChild(game.container);
  app.ticker.add((dt) => game.update(dt));
}

boot().catch((err) => {
  console.error(err);
  const loading = document.getElementById("loading");
  if (loading) loading.textContent = "Failed to load game";
});
