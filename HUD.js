import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@7.x/dist/pixi.min.mjs";

const FONT_STACK = "JetBrains Mono, Consolas, 'Courier New', monospace";

export class HUD {
  constructor(app) {
    this.app = app;
    this.container = new PIXI.Container();
    this.container.eventMode = "none";

    const baseStyle = {
      fill: 0xffffff,
      fontFamily: FONT_STACK,
      fontSize: 20,
      letterSpacing: 1,
      dropShadow: true,
      dropShadowAlpha: 0.35,
      dropShadowAngle: Math.PI / 2,
      dropShadowDistance: 4,
    };

    this.primary = new PIXI.Text("Score 000000", baseStyle);
    this.secondary = new PIXI.Text("HP 0/0", { ...baseStyle, fontSize: 16, fill: 0xa5f3fc });
    this.message = new PIXI.Text("", {
      ...baseStyle,
      fontSize: 22,
      fill: 0xffd6a5,
      dropShadowDistance: 6,
    });
    this.message.anchor.set(0.5, 0);

    this.container.addChild(this.primary, this.secondary, this.message);

    this._resize = () => this._layout();
    this.app.renderer.on("resize", this._resize);
    this._layout();
  }

  _layout() {
    const { width } = this.app.screen;
    this.primary.position.set(32, 22);
    this.secondary.position.set(32, 54);
    this.message.position.set(width / 2, 20);
  }

  update({ score, health, maxHealth, comboMultiplier, survivalTime }) {
    this.primary.text = `Score ${score.toString().padStart(6, "0")}  |  Combo x${comboMultiplier.toFixed(2)}`;
    this.secondary.text = `HP ${health}/${maxHealth}  •  Survival ${survivalTime.toFixed(1)}s`;
  }

  setGameOver(flag) {
    if (flag) {
      this.message.text = "Game Over - press R to restart";
    } else {
      this.message.text = "";
    }
  }

  destroy() {
    this.app.renderer.off("resize", this._resize);
    this.container.destroy({ children: true });
  }
}
