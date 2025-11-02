import {int} from '../base.js';
import {Component} from '../ecs.js';
import {EntityId, kNoEntity} from '../ecs.js';
import {ShadowMesh} from '../renderer.js';

/**
 * Shadow component - casts discrete shadows for entities
 * Original location: main.ts lines 970-1008
 *
 * An entity with a ShadowState casts a discrete shadow.
 */

export interface ShadowState {
  id: EntityId,
  index: int,
  mesh: ShadowMesh | null,
  extent: number,
  height: number,
};

const solid = (env: any, x: int, y: int, z: int): boolean => {
  const block = env.getBlock(x, y, z);
  return env.registry.solid[block];
};

// Note: This component requires TypedEnv to function properly.
// The factory function pattern is used to inject the environment dependency.
export const Shadow = (env: any): Component<ShadowState> => ({
  init: () => ({id: kNoEntity, index: 0, mesh: null, extent: 16, height: 0}),
  onRemove: (state: ShadowState) => state.mesh?.dispose(),
  onRender: (dt: number, states: ShadowState[]) => {
    for (const state of states) {
      if (!state.mesh) state.mesh = env.renderer.addShadowMesh();
      const {x, y, z, w, h} = env.position.getX(state.id);
      const fraction = 1 - (y - 0.5 * h - state.height) / state.extent;
      const size = 0.5 * w * Math.max(0, Math.min(1, fraction));
      if (state.mesh) {
        state.mesh.setPosition(x, state.height + 0.01, z);
        state.mesh.setSize(size);
      }
    }
  },
  onUpdate: (dt: number, states: ShadowState[]) => {
    for (const state of states) {
      const position = env.position.getX(state.id);
      const x = int(Math.floor(position.x));
      const y = int(Math.floor(position.y));
      const z = int(Math.floor(position.z));
      state.height = (() => {
        for (let i = 0; i < state.extent; i++) {
          const h = y - i;
          if (solid(env, x, int(h - 1), z)) return h;
        }
        return 0;
      })();
    }
  },
});
