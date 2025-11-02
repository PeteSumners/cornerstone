import {int, Vec3} from '../base.js';
import {Component} from '../ecs.js';
import {EntityId, kNoEntity} from '../ecs.js';
import {SpriteMesh} from '../renderer.js';

/**
 * Meshes component - keeps a renderer mesh at entity's position
 * Original location: main.ts lines 900-968
 *
 * An entity with a MeshState keeps a renderer mesh at its position.
 */

export interface MeshState {
  id: EntityId,
  index: int,
  mesh: SpriteMesh | null,
  heading: number | null,
  columns: number,
  column: number,
  frame: number,
  row: number,
};

// Note: This component requires TypedEnv to function properly.
// The factory function pattern is used to inject the environment dependency.
export const Meshes = (env: any): Component<MeshState> => ({
  init: () => ({
    id: kNoEntity,
    index: 0,
    mesh: null,
    heading: null,
    columns: 0,
    column: 0,
    frame: 0,
    row: 0,
  }),
  onRemove: (state: MeshState) => state.mesh?.dispose(),
  onRender: (dt: number, states: MeshState[]) => {
    const camera = env.renderer.camera;
    let cx = camera.position[0], cz = camera.position[2];
    env.target.each((state: any) => {
      const {x, y, z, h, w} = env.position.getX(state.id);
      cx = x - camera.zoom * Math.sin(camera.heading);
      cz = z - camera.zoom * Math.cos(camera.heading);
    });

    for (const state of states) {
      if (!state.mesh) continue;
      const {x, y, z, h} = env.position.getX(state.id);
      const light = env.getLight(
          int(Math.floor(x)), int(Math.floor(y)), int(Math.floor(z)));
      state.mesh.setPosition(x, y - h / 2, z);
      state.mesh.setLight(light);
      state.mesh.setHeight(h);

      if (state.heading !== null) {
        const camera_heading = Math.atan2(x - cx, z - cz);
        const delta = state.heading - camera_heading;
        state.row = Math.floor(8.5 - 2 * delta / Math.PI) & 3;
        state.mesh.setFrame(int(state.column + state.row * state.columns));
      }
    }
  },
  onUpdate: (dt: number, states: MeshState[]) => {
    for (const state of states) {
      if (!state.mesh || !state.columns) return;
      const body = env.physics.get(state.id);
      if (!body) return;

      state.column = (() => {
        if (body.resting[1] >= 0) return 1;
        const distance = dt * Vec3.length(body.vel);
        state.frame = distance ? (state.frame + 0.75 * distance) % 4 : 0;
        if (!distance) return 0;
        const value = Math.floor(state.frame);
        return value & 1 ? 0 : (value + 2) >> 1;
      })();
      state.mesh.setFrame(int(state.column + state.row * state.columns));
    }
  },
});
