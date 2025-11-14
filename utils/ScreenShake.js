export function screenShake(app, intensity = 5, duration = 12) {
  let t = 0;
  const original = { x: app.stage.x, y: app.stage.y };

  const tick = (dt) => {
    t += dt;
    if (t >= duration) {
      app.stage.position.set(original.x, original.y);
      app.ticker.remove(tick);
      return;
    }
    app.stage.x = original.x + (Math.random() - 0.5) * intensity;
    app.stage.y = original.y + (Math.random() - 0.5) * intensity;
  };

  app.ticker.add(tick);
}
