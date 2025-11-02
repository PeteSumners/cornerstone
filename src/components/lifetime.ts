import {int} from '../base.js';
import {Component} from '../ecs.js';
import {EntityId, kNoEntity} from '../ecs.js';

/**
 * Lifetime component - manages entity lifecycle
 * Original location: main.ts lines 108-125
 *
 * An entity with a lifetime calls cleanup() at the end of its life.
 */

export interface LifetimeState {
  id: EntityId,
  index: int,
  lifetime: number,
  cleanup: (() => void) | null,
};

export const Lifetime: Component<LifetimeState> = {
  init: () => ({id: kNoEntity, index: 0, lifetime: 0, cleanup: null}),
  onUpdate: (dt: number, states: LifetimeState[]) => {
    for (const state of states) {
      state.lifetime -= dt;
      if (state.lifetime < 0 && state.cleanup) state.cleanup();
    }
  },
};
