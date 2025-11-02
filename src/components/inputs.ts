import {int, Vec3} from '../base.js';
import {Component} from '../ecs.js';
import {EntityId, kNoEntity} from '../ecs.js';

/**
 * Inputs component - processes player input
 * Original location: main.ts lines 600-676
 *
 * An entity with an input component processes inputs.
 */

export interface InputState {
  id: EntityId,
  index: int,
  lastHeading: number;
};

const kTmpPos = Vec3.create();

const tryToModifyBlock =
    (env: any, body: any, add: boolean) => {
  const target = env.getTargetedBlock();
  if (target === null) return;

  const side = env.getTargetedBlockSide();
  Vec3.copy(kTmpPos, target);

  if (add) {
    kTmpPos[side >> 1] += (side & 1) ? -1 : 1;
    const intersect = env.movement.some((state: any) => {
      const body = env.physics.get(state.id);
      if (!body) return false;
      const {max, min} = body;
      for (let i = 0; i < 3; i++) {
        const pos = kTmpPos[i];
        if (pos < max[i] && min[i] < pos + 1) continue;
        return false;
      }
      return true;
    });
    if (intersect) return;
  }

  const x = int(kTmpPos[0]), y = int(kTmpPos[1]), z = int(kTmpPos[2]);
  const block = add && env.blocks ? env.blocks.dirt : 0; // kEmptyBlock = 0

  // Call modifyBlock from the env
  // (This will need to be passed from main.ts)
  if (env.modifyBlock) {
    env.modifyBlock(x, y, z, block, side);
  }
};

const runInputs = (env: any, state: InputState) => {
  const movement = env.movement.get(state.id);
  if (!movement) return;

  // Process the inputs to get a heading, running, and jumping state.
  const inputs = env.getMutableInputs();
  const fb = (inputs.up ? 1 : 0) - (inputs.down ? 1 : 0);
  const lr = (inputs.right ? 1 : 0) - (inputs.left ? 1 : 0);
  movement.jumping = inputs.space;
  movement.hovering = inputs.hover;

  if (fb || lr) {
    let heading = env.renderer.camera.heading;
    if (fb) {
      if (fb === -1) heading += Math.PI;
      heading += fb * lr * Math.PI / 4;
    } else {
      heading += lr * Math.PI / 2;
    }
    movement.inputX = Math.sin(heading);
    movement.inputZ = Math.cos(heading);
    state.lastHeading = heading;

    const mesh = env.meshes.get(state.id);
    if (mesh) {
      const row = mesh.row;
      const option_a = fb > 0 ? 0 : fb < 0 ? 2 : -1;
      const option_b = lr > 0 ? 3 : lr < 0 ? 1 : -1;
      if (row !== option_a && row !== option_b) {
        mesh.row = Math.max(option_a, option_b);
      }
    }
  }

  // Call any followers.
  const body = env.physics.get(state.id);
  if (body && (inputs.call || true)) {
    const {min, max} = body;
    const heading = state.lastHeading;
    const multiplier = (fb || lr) ? 1.5 : 2.0;
    const kFollowDistance = multiplier * (max[0] - min[0]);
    const x = (min[0] + max[0]) / 2 - kFollowDistance * Math.sin(heading);
    const z = (min[2] + max[2]) / 2 - kFollowDistance * Math.cos(heading);
    const y = (min[1] + body.autoStepMax);

    const ix = int(Math.floor(x));
    const iy = int(Math.floor(y));
    const iz = int(Math.floor(z));

    env.pathing.each((other: any) => {
      other.target = [ix, iy, iz];
      other.soft_target = [x, y, z];
    });
  }
  inputs.call = false;

  // Turn mouse inputs into actions.
  if (inputs.mouse0 || inputs.mouse1) {
    const body = env.physics.get(state.id);
    if (body) tryToModifyBlock(env, body, !inputs.mouse0);
    inputs.mouse0 = false;
    inputs.mouse1 = false;
  }
};

// Note: This component requires TypedEnv to function properly.
// The factory function pattern is used to inject the environment dependency.
export const Inputs = (env: any): Component<InputState> => ({
  init: () => ({id: kNoEntity, index: 0, lastHeading: 0}),
  onUpdate: (dt: number, states: InputState[]) => {
    for (const state of states) runInputs(env, state);
  }
});
