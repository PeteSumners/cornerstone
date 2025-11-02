import {int} from '../base.js';
import {Performance} from './performance.js';

/**
 * Timing - manages game loop timing
 * Original location: engine.ts lines 347-437
 *
 * Separates update (fixed timestep) from render (variable timestep)
 * - Update: 60 times per second
 * - Render: As fast as possible (typically 60 FPS)
 */

const kTickResolution = 4;
const kTicksPerFrame = 4;
const kTicksPerSecond = 60;

type Callback = (dt: number) => void;

export class Timing {
  private now: any;
  private remesh: Callback;
  private render: Callback;
  private update: Callback;
  private renderBinding: () => void;
  private updateDelay: number;
  private updateLimit: number;
  private lastRender: int;
  private lastUpdate: int;
  remeshPerf: Performance;
  renderPerf: Performance;
  updatePerf: Performance;

  constructor(remesh: Callback, render: Callback, update: Callback) {
    this.now = performance || Date;
    this.remesh = remesh;
    this.render = render;
    this.update = update;

    const now = this.now.now();
    this.lastRender = now;
    this.lastUpdate = now;

    this.renderBinding = this.renderHandler.bind(this);
    requestAnimationFrame(this.renderBinding);

    this.updateDelay = 1000 / kTicksPerSecond;
    this.updateLimit = this.updateDelay * kTicksPerFrame;
    const updateInterval = this.updateDelay / kTickResolution;
    setInterval(this.updateHandler.bind(this), updateInterval);

    this.remeshPerf = new Performance(this.now, 60);
    this.renderPerf = new Performance(this.now, 60);
    this.updatePerf = new Performance(this.now, 60);
  }

  renderHandler() {
    requestAnimationFrame(this.renderBinding);
    this.updateHandler();

    const now = this.now.now();
    const dt = (now - this.lastRender) / 1000;
    this.lastRender = now;

    try {
      this.remeshPerf.begin();
      this.remesh(dt);
      this.remeshPerf.end();
      this.renderPerf.begin();
      this.render(dt);
      this.renderPerf.end();
    } catch (e) {
      this.onError(e);
    }
  }

  private updateHandler() {
    let now = this.now.now();
    const delay = this.updateDelay;
    const limit = now + this.updateLimit;

    while (this.lastUpdate + delay < now) {
      try {
        this.updatePerf.begin();
        this.update(delay / 1000);
        this.updatePerf.end();
      } catch (e) {
        this.onError(e);
      }
      this.lastUpdate += delay;
      now = this.now.now();

      if (now > limit) {
        this.lastUpdate = now;
        break;
      }
    }
  }

  private onError(e: any) {
    this.remesh = this.render = this.update = () => {};
    console.error(e);
  }
};
