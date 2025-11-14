// Centralized tuning knobs for gameplay systems.
export const GAME_CONFIG = {
  worldPadding: 48,
  backgroundAlpha: 0.9,
  player: {
    acceleration: 1800, // px / s^2
    drag: 0.86,
    maxSpeed: 520, // px / s
    fireRate: 7, // bullets per second
    spread: 0.035, // radians
    maxHealth: 3,
    collisionRadius: 28,
    hitInvulnerability: 0.85, // seconds
  },
  bullet: {
    speed: 1200, // px / s
    lifetime: 1.2, // seconds
    collisionRadius: 22,
    damage: 1,
    poolSize: 80,
  },
  enemy: {
    spawn: {
      initialInterval: 2.1, // seconds
      minInterval: 0.45,
      rampFactor: 0.965,
      burstChance: 0.32,
      burstCount: [2, 4],
    },
    baseSpeed: 260,
    speedVariance: 120,
    hitRadius: 30,
    healthRange: [1, 2],
    eliteChance: 0.18,
    eliteHealthBonus: 1,
    eliteSpeedBonus: 90,
    eliteScoreBonus: 90,
  },
  scoring: {
    kill: 120,
    survivalPerSecond: 5,
    comboWindow: 4, // seconds to chain kills
    comboBonusPerKill: 0.15,
  },
};
