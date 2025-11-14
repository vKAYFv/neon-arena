const MOVEMENT_KEYS = {
  up: ["w", "arrowup"],
  down: ["s", "arrowdown"],
  left: ["a", "arrowleft"],
  right: ["d", "arrowright"],
};

export class InputManager {
  constructor() {
    this.keys = new Set();
    this.pointer = { x: 0, y: 0 };
    this.pointerDown = false;

    this._onKeyDown = (event) => {
      this._normalize(event).forEach((key) => this.keys.add(key));
    };
    this._onKeyUp = (event) => {
      this._normalize(event).forEach((key) => this.keys.delete(key));
    };

    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
  }

  _normalize(event) {
    const variants = [];
    if (event.key) variants.push(event.key.toLowerCase());
    if (event.code) variants.push(event.code.toLowerCase());
    return variants;
  }

  isDown(key) {
    return this.keys.has(key.toLowerCase());
  }

  setPointer(point) {
    if (!point) return;
    this.pointer.x = point.x;
    this.pointer.y = point.y;
  }

  setPointerDown(flag) {
    this.pointerDown = flag;
    if (flag) {
      this.keys.add("mouse0");
    } else {
      this.keys.delete("mouse0");
    }
  }

  getMoveVector() {
    let x = 0;
    let y = 0;
    if (MOVEMENT_KEYS.up.some((k) => this.isDown(k))) y -= 1;
    if (MOVEMENT_KEYS.down.some((k) => this.isDown(k))) y += 1;
    if (MOVEMENT_KEYS.left.some((k) => this.isDown(k))) x -= 1;
    if (MOVEMENT_KEYS.right.some((k) => this.isDown(k))) x += 1;

    if (x === 0 && y === 0) {
      return { x: 0, y: 0 };
    }
    const len = Math.hypot(x, y);
    return { x: x / len, y: y / len };
  }

  isFiring() {
    return this.pointerDown || this.isDown("space") || this.isDown("mouse0");
  }

  dispose() {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    this.keys.clear();
  }
}
