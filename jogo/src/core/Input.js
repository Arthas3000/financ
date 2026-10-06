// Entrada unificada: teclado + controle (Gamepad API).
// O jogo nunca pergunta por teclas, só por AÇÕES ('jump', 'attack'...), então
// remapear controles é só editar KEY_BINDINGS / PAD_BUTTONS.

const KEY_BINDINGS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  jump: ['KeyZ', 'Space', 'KeyJ'],
  attack: ['KeyX', 'KeyK'],
  start: ['Enter', 'NumpadEnter'],
  back: ['Escape', 'Backspace'],
  mute: ['KeyM'],
};

// Mapeamento "standard" de controles (Xbox/PlayStation).
const PAD_BUTTONS = {
  jump: [0],        // A / X
  attack: [2, 1],   // X / Quadrado e B / Bola
  start: [9],       // Start / Options
  back: [8],        // Back / Share
  up: [12], down: [13], left: [14], right: [15],
};
const STICK_DEADZONE = 0.45;

export const ACTIONS = Object.keys(KEY_BINDINGS);

export class Input {
  constructor(target = window) {
    this.codeToAction = new Map();
    for (const [action, codes] of Object.entries(KEY_BINDINGS)) {
      for (const code of codes) this.codeToAction.set(code, action);
    }
    this.keyboard = new Set();   // ações seguradas no teclado
    this.latched = new Set();    // apertos rápidos entre dois passos de simulação
    this.current = new Set();    // estado deste passo
    this.previous = new Set();   // estado do passo anterior
    this.listeners = [];         // callbacks de "primeira interação" (destrava o áudio)

    target.addEventListener('keydown', (e) => {
      const action = this.codeToAction.get(e.code);
      this._notifyInteraction();
      if (!action) return;
      e.preventDefault(); // evita rolar a página com setas/espaço
      if (!e.repeat) this.latched.add(action);
      this.keyboard.add(action);
    });
    target.addEventListener('keyup', (e) => {
      const action = this.codeToAction.get(e.code);
      if (action) this.keyboard.delete(action);
    });
    // Ao trocar de aba, solta tudo para o personagem não ficar correndo sozinho.
    window.addEventListener('blur', () => this.keyboard.clear());
    window.addEventListener('pointerdown', () => this._notifyInteraction());
  }

  /**
   * Mouse/toque nos menus: converte a posição da tela para a resolução interna.
   * pointer.clicked fica verdadeiro por um passo após o clique.
   */
  attachPointer(canvas, viewW, viewH) {
    this.pointer = { x: -1, y: -1, moved: false, clicked: false };
    this._click = false;
    const toGame = (e) => {
      const rect = canvas.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * viewW;
      this.pointer.y = ((e.clientY - rect.top) / rect.height) * viewH;
      this.pointer.moved = true;
    };
    canvas.addEventListener('pointermove', toGame);
    canvas.addEventListener('pointerdown', (e) => { toGame(e); this._click = true; });
  }

  /** Chamado uma vez no início de cada passo fixo da simulação. */
  update() {
    if (this.pointer) {
      this.pointer.clicked = this._click;
      this._click = false;
    }
    this.previous = this.current;
    this.current = new Set(this.keyboard);
    for (const a of this.latched) this.current.add(a);
    this.latched.clear();
    this._readGamepads(this.current);
  }

  /** Ação está segurada. */
  down(action) { return this.current.has(action); }
  /** Ação foi apertada neste passo. */
  pressed(action) { return this.current.has(action) && !this.previous.has(action); }
  /** Ação foi solta neste passo. */
  released(action) { return !this.current.has(action) && this.previous.has(action); }

  /** -1, 0 ou 1 no eixo horizontal. */
  axisX() { return (this.down('right') ? 1 : 0) - (this.down('left') ? 1 : 0); }

  // Atalhos de menu: confirmar = Enter/pulo, voltar = Esc/ataque.
  confirm() { return this.pressed('start') || this.pressed('jump'); }
  cancel() { return this.pressed('back') || this.pressed('attack'); }

  onFirstInteraction(fn) { this.listeners.push(fn); }
  _notifyInteraction() {
    if (!this.listeners.length) return;
    for (const fn of this.listeners) fn();
    this.listeners = [];
  }

  _readGamepads(out) {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const pad of pads) {
      if (!pad) continue;
      for (const [action, buttons] of Object.entries(PAD_BUTTONS)) {
        if (buttons.some((b) => pad.buttons[b]?.pressed)) {
          out.add(action);
          this._notifyInteraction();
        }
      }
      const [ax = 0, ay = 0] = pad.axes;
      if (ax < -STICK_DEADZONE) out.add('left');
      if (ax > STICK_DEADZONE) out.add('right');
      if (ay < -STICK_DEADZONE) out.add('up');
      if (ay > STICK_DEADZONE) out.add('down');
    }
  }
}
