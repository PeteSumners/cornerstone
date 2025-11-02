import {int, nonnull, Vec3} from '../base.js';
import {kEmptyBlock} from '../engine.js';
import {Component} from '../ecs.js';
import {EntityId, kNoEntity} from '../ecs.js';
import {sweep} from '../sweep.js';
import {PositionState} from './position.js';

/**
 * Physics component - collision, velocity, and forces
 * Original location: main.ts lines 156-362
 *
 * An entity's physics state tracks its location and velocity, and allows
 * other systems to apply forces and impulses to it. It updates the entity's
 * AABB and keeps its position in sync.
 */

export interface PhysicsState {
  id: EntityId,
  index: int,
  min: Vec3,
  max: Vec3,
  vel: Vec3,
  forces: Vec3,
  impulses: Vec3,
  resting: Vec3,
  inFluid: boolean,
  inGrass: boolean,
  friction: number,
  restitution: number,
  mass: number,
  autoStep: number,
  autoStepMax: number,
};

// Temporary vectors for calculations (avoid allocations)
const kTmpGravity = Vec3.from(0, -40, 0);
const kTmpAcceleration = Vec3.create();
const kTmpFriction = Vec3.create();
const kTmpDelta = Vec3.create();
const kTmpSize = Vec3.create();
const kTmpPush = Vec3.create();
const kTmpMax = Vec3.create();
const kTmpMin = Vec3.create();
const kTmpPos = Vec3.create();
const kTmpResting = Vec3.create();

const setPhysicsFromPosition = (a: PositionState, b: PhysicsState) => {
  Vec3.set(kTmpPos, a.x, a.y, a.z);
  Vec3.set(kTmpSize, a.w / 2, a.h / 2, a.w / 2);
  Vec3.sub(b.min, kTmpPos, kTmpSize);
  Vec3.add(b.max, kTmpPos, kTmpSize);
};

const setPositionFromPhysics = (a: PositionState, b: PhysicsState) => {
  a.x = (b.min[0] + b.max[0]) / 2;
  a.y = (b.min[1] + b.max[1]) / 2;
  a.z = (b.min[2] + b.max[2]) / 2;
};

const applyFriction = (axis: int, state: PhysicsState, dv: Vec3) => {
  const resting = state.resting[axis];
  if (resting === 0 || resting * dv[axis] <= 0) return;

  Vec3.copy(kTmpFriction, state.vel);
  kTmpFriction[axis] = 0;
  const length = Vec3.length(kTmpFriction);
  if (length === 0) return;

  const loss = Math.abs(state.friction * dv[axis]);
  const scale = length < loss ? 0 : (length - loss) / length;
  state.vel[(axis + 1) % 3] *= scale;
  state.vel[(axis + 2) % 3] *= scale;
};

const tryAutoStepping =
    (env: any, dt: number, state: PhysicsState, min: Vec3, max: Vec3,
     check: (x: int, y: int, z: int) => boolean) => {
  if (state.resting[1] > 0 && !state.inFluid) return;

  const {resting, vel} = state;
  const {opaque, solid} = env.registry;

  const threshold = 16;
  const speed_x = Math.abs(vel[0]);
  const speed_z = Math.abs(vel[2]);

  const step_x = (() => {
    if (resting[0] === 0) return false;
    if (threshold * speed_x <= speed_z) return false;
    const x = int(Math.floor(vel[0] > 0 ? max[0] + 0.5 : min[0] - 0.5));
    const y = int(Math.floor(min[1]));
    const z = int(Math.floor((min[2] + max[2]) / 2));
    const block = env.getBlock(x, y, z);
    return opaque[block] && solid[block];
  })();
  const step_z = (() => {
    if (resting[2] === 0) return false;
    if (threshold * speed_z <= speed_x) return false;
    const x = int(Math.floor((min[0] + max[0]) / 2));
    const y = int(Math.floor(min[1]));
    const z = int(Math.floor(vel[2] > 0 ? max[2] + 0.5 : min[2] - 0.5));
    const block = env.getBlock(x, y, z);
    return opaque[block] && solid[block];
  })();
  if (!step_x && !step_z) return;

  const height = 1 - min[1] + Math.floor(min[1]);
  if (height > state.autoStepMax) return;

  Vec3.set(kTmpDelta, 0, height, 0);
  sweep(min, max, kTmpDelta, kTmpResting, check);
  if (kTmpResting[1] !== 0) return;

  Vec3.scale(kTmpDelta, state.vel, dt);
  kTmpDelta[1] = 0;
  sweep(min, max, kTmpDelta, kTmpResting, check);
  if (min[0] === state.min[0] && min[2] === state.min[2]) return;

  if (height > state.autoStep) {
    Vec3.set(kTmpDelta, 0, state.autoStep, 0);
    sweep(state.min, state.max, kTmpDelta, state.resting, check);
    if (!step_x) state.vel[0] = 0;
    if (!step_z) state.vel[2] = 0;
    state.vel[1] = 0;
    return;
  }

  Vec3.copy(state.min, min);
  Vec3.copy(state.max, max);
  Vec3.copy(state.resting, kTmpResting);
};

const runPhysics = (env: any, dt: number, state: PhysicsState) => {
  if (state.mass <= 0) return;

  const check = (x: int, y: int, z: int) => {
    const block = env.getBlock(x, y, z);
    return !env.registry.solid[block];
  };

  const {min, max} = state;
  const x = int(Math.floor((min[0] + max[0]) / 2));
  const y = int(Math.floor(min[1]));
  const z = int(Math.floor((min[2] + max[2]) / 2));

  const block = env.getBlock(x, y, z);
  const mesh = env.registry.getBlockMesh(block);
  state.inFluid = block !== kEmptyBlock && mesh === null;
  state.inGrass = block === nonnull(env.blocks).bush;

  const drag = state.inFluid ? 2 : 0;
  const left = Math.max(1 - drag * dt, 0);
  const gravity = state.inFluid ? 0.25 : 1;

  Vec3.scale(kTmpAcceleration, state.forces, 1 / state.mass);
  Vec3.scaleAndAdd(kTmpAcceleration, kTmpAcceleration, kTmpGravity, gravity);
  Vec3.scale(kTmpDelta, kTmpAcceleration, dt);
  Vec3.scaleAndAdd(kTmpDelta, kTmpDelta, state.impulses, 1 / state.mass);
  if (state.friction) {
    Vec3.add(kTmpAcceleration, kTmpDelta, state.vel);
    applyFriction(0, state, kTmpAcceleration);
    applyFriction(1, state, kTmpAcceleration);
    applyFriction(2, state, kTmpAcceleration);
  }

  if (state.autoStep) {
    Vec3.copy(kTmpMax, state.max);
    Vec3.copy(kTmpMin, state.min);
  }

  // Update our state based on the computations above.
  Vec3.add(state.vel, state.vel, kTmpDelta);
  Vec3.scale(state.vel, state.vel, left);
  Vec3.scale(kTmpDelta, state.vel, dt);
  sweep(state.min, state.max, kTmpDelta, state.resting, check);
  Vec3.set(state.forces, 0, 0, 0);
  Vec3.set(state.impulses, 0, 0, 0);

  if (state.autoStep) {
    tryAutoStepping(env, dt, state, kTmpMin, kTmpMax, check);
  }

  for (let i = 0; i < 3; i++) {
    if (state.resting[i] === 0) continue;
    state.vel[i] = -state.restitution * state.vel[i];
  }
};

// Note: This component requires TypedEnv to function properly.
// The factory function pattern is used to inject the environment dependency.
export const Physics = (env: any): Component<PhysicsState> => ({
  init: () => ({
    id: kNoEntity,
    index: 0,
    min: Vec3.create(),
    max: Vec3.create(),
    vel: Vec3.create(),
    forces: Vec3.create(),
    impulses: Vec3.create(),
    resting: Vec3.create(),
    inFluid: false,
    inGrass: false,
    friction: 0,
    restitution: 0,
    mass: 1,
    autoStep: 0.0625,
    autoStepMax: 0.5,
  }),
  onAdd: (state: PhysicsState) => {
    setPhysicsFromPosition(env.position.getX(state.id), state);
  },
  onRemove: (state: PhysicsState) => {
    const position = env.position.get(state.id);
    if (position) setPositionFromPhysics(position, state);
  },
  onUpdate: (dt: number, states: PhysicsState[]) => {
    for (const state of states) {
      runPhysics(env, dt, state);
      setPositionFromPhysics(env.position.getX(state.id), state);
    }
  },
});
