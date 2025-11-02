import {assert, int, nonnull} from '../base.js';
import {IInputHandler, Input} from '../core/interfaces.js';

/**
 * Container - handles keyboard and mouse input
 * Original location: engine.ts lines 11-128
 *
 * Manages:
 * - Key bindings (WASD, space, etc.)
 * - Mouse input (clicks, movement, scroll)
 * - Pointer lock (for FPS-style controls)
 * - Stats display
 */

export type {Input};

interface KeyBinding {input: Input, handled: boolean};

export class Container implements IInputHandler {
  element: Element;
  canvas: HTMLCanvasElement;
  stats: Element | null;
  bindings: Map<int, KeyBinding>;
  inputs: Record<Input, boolean>;
  deltas: {x: int, y: int, scroll: int};

  constructor(id: string) {
    this.element = nonnull(document.getElementById(id), () => id);
    this.canvas = nonnull(this.element.querySelector('canvas'));
    this.stats = document.getElementById('stats');
    this.inputs = {
      up: false,
      left: false,
      down: false,
      right: false,
      hover: false,
      call: false,
      space: false,
      mouse0: false,
      mouse1: false,
      pointer: false,
    };
    this.deltas = {x: 0, y: 0, scroll: 0};

    this.bindings = new Map();
    this.addBinding('W', 'up');
    this.addBinding('A', 'left');
    this.addBinding('S', 'down');
    this.addBinding('D', 'right');
    this.addBinding('E', 'hover');
    this.addBinding('Q', 'call');
    this.addBinding(' ', 'space');

    const canvas = this.canvas;
    const target = nonnull(this.canvas.parentElement);
    target.addEventListener('click', (e: Event) => {
      if (this.inputs.pointer) return;
      this.onMimicPointerLock(e, true);
      this.insistOnPointerLock();
    });

    document.addEventListener('keydown', e => this.onKeyInput(e, true));
    document.addEventListener('keyup', e => this.onKeyInput(e, false));
    document.addEventListener('mousedown', e => this.onMouseDown(e));
    document.addEventListener('mousemove', e => this.onMouseMove(e));
    document.addEventListener('touchmove', e => this.onMouseMove(e));
    document.addEventListener('pointerlockchange', e => this.onPointerInput(e));
    document.addEventListener('wheel', e => this.onMouseWheel(e));
  }

  displayStats(stats: string): void {
    if (this.stats) this.stats.textContent = stats;
  }

  private addBinding(key: string, input: Input): void {
    assert(key.length === 1);
    this.bindings.set(int(key.charCodeAt(0)), {input, handled: false});
  }

  private insistOnPointerLock(): void {
    if (!this.inputs.pointer) return;
    if (document.pointerLockElement === this.canvas) return;
    this.canvas.requestPointerLock();
    setTimeout(() => this.insistOnPointerLock(), 100);
  }

  private onKeyInput(e: Event, down: boolean): void {
    if (!this.inputs.pointer) return;
    const keycode = int((e as KeyboardEvent).keyCode);
    if (keycode === 27) return this.onMimicPointerLock(e, false);
    const binding = this.bindings.get(keycode);
    if (!binding || binding.handled === down) return;
    this.onInput(e, binding.input, down);
    binding.handled = down;
  }

  private onMouseDown(e: Event): void {
    if (!this.inputs.pointer) return;
    const button = (e as MouseEvent).button;
    if (button === 0) this.inputs.mouse0 = true;
    if (button !== 0) this.inputs.mouse1 = true;
  }

  private onMouseMove(e: Event): void {
    if (!this.inputs.pointer) return;
    this.deltas.x += (e as MouseEvent).movementX;
    this.deltas.y += (e as MouseEvent).movementY;
  }

  private onMouseWheel(e: Event): void {
    if (!this.inputs.pointer) return;
    this.deltas.scroll += (e as any).deltaY;
  }

  private onMimicPointerLock(e: Event, locked: boolean): void {
    if (locked) this.element.classList.remove('paused');
    if (!locked) this.element.classList.add('paused');
    this.onInput(e, 'pointer', locked);
  }

  private onPointerInput(e: Event): void {
    const locked = document.pointerLockElement === this.canvas;
    this.onMimicPointerLock(e, locked);
  }

  private onInput(e: Event, input: Input, state: boolean): void {
    this.inputs[input] = state;
    e.stopPropagation();
    e.preventDefault();
  }
};
