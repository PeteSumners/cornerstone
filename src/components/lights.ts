import {int} from '../base.js';
import {Component} from '../ecs.js';
import {EntityId, kNoEntity} from '../ecs.js';

/**
 * Lights component - dynamic point light sources
 * Original location: main.ts lines 1010-1074
 *
 * An entity with a LightState casts light.
 */

export interface LightState {
  id: EntityId,
  index: int,
  level: int,
};

export interface PointLight {
  x: int,
  y: int,
  z: int,
  level: int,
};

// Note: This component requires TypedEnv to function properly.
// The factory function pattern is used to inject the environment dependency.
export const Lights = (env: any): Component<LightState> => ({
  init: () => ({id: kNoEntity, index: 0, level: 0}),
  onRemove: (state: LightState) => {},
  onUpdate: (dt: number, states: LightState[]) => {
    const old_lights = env.point_lights;
    const new_lights: Map<string, PointLight> = new Map();

    for (const state of states) {
      if (state.level === 0) continue;
      const position = env.position.getX(state.id);
      const x = int(Math.floor(position.x));
      const y = int(Math.floor(position.y));
      const z = int(Math.floor(position.z));

      const fx = position.x - x;
      const fz = position.z - z;
      const ax = fx <  0.25 ? int(x - 1) : x;
      const bx = fx >= 0.75 ? int(x + 1) : x;
      const az = fz <  0.25 ? int(z - 1) : z;
      const bz = fz >= 0.75 ? int(z + 1) : z;

      for (let x = ax; x <= bx; x++) {
        for (let z = az; z <= bz; z++) {
          const key = `${x},${y},${z}`;
          const new_value = new_lights.get(key);
          if (new_value === undefined) {
            new_lights.set(key, {x, y, z, level: state.level});
          } else {
            new_value.level = int(Math.max(new_value.level, state.level));
          }
        }
      }
    }

    for (const [key, old_value] of old_lights.entries()) {
      if (new_lights.get(key)?.level !== old_value.level) {
        const {x, y, z} = old_value;
        env.setPointLight(x, y, z, 0);
      }
    }
    for (const [key, new_value] of new_lights.entries()) {
      if (old_lights.get(key)?.level !== new_value.level) {
        const {x, y, z, level} = new_value;
        env.setPointLight(x, y, z, level);
      }
    }

    env.point_lights = new_lights;
  },
});
