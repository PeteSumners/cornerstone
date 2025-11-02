import {int, nonnull, Vec3} from '../base.js';
import {Component} from '../ecs.js';
import {EntityId, kNoEntity} from '../ecs.js';
import {AStar, PathNode, Point as AStarPoint} from '../pathing.js';
import {sweep} from '../sweep.js';
import {PhysicsState} from './physics.js';
import {MovementState} from './movement.js';

/**
 * Pathing component - AI pathfinding and navigation
 * Original location: main.ts lines 693-912
 *
 * An entity with PathingState computes a path to a target and moves along it.
 */

type Point = [int, int, int];
type Position = [number, number, number];

export interface PathingState {
  id: EntityId,
  index: int,
  // Current path:
  path: PathNode[] | null,
  path_index: int,
  path_soft_target: Position | null,
  path_needs_precision: boolean[] | null,
  // Next path request:
  target: Point | null,
  soft_target: Position | null,
};

// Temporary vectors for calculations
const kTmpDelta = Vec3.create();
const kTmpMax = Vec3.create();
const kTmpMin = Vec3.create();
const kTmpResting = Vec3.create();

const solid = (env: any, x: int, y: int, z: int): boolean => {
  const block = env.getBlock(x, y, z);
  return env.registry.solid[block];
};

const movementPenalty = (state: MovementState, body: PhysicsState): number => {
  return body.inFluid ? state.waterPenalty :
         body.inGrass ? state.grassPenalty : 1;
}

const findPath = (env: any, state: PathingState,
                  body: PhysicsState): void => {
  const grounded = body.resting[1] < 0;
  if (!grounded) return;

  const {min, max} = body;
  const sx = int(Math.floor((min[0] + max[0]) / 2));
  const sy = int(Math.floor(min[1]));
  const sz = int(Math.floor((min[2] + max[2]) / 2));
  const [tx, ty, tz] = nonnull(state.target);

  const source = new AStarPoint(sx, sy, sz);
  const target = new AStarPoint(tx, ty, tz);
  const check = (p: AStarPoint) => !solid(env, p.x, p.y, p.z);

  const path = AStar(source, target, check);
  if (path.length === 0) return;

  const last = path[path.length - 1];
  const use_soft = last.x === tx && last.z === tz;

  state.path = path;
  state.path_index = 0;
  state.path_soft_target = use_soft ? state.soft_target : null;
  state.path_needs_precision = path.map(_ => false);
  state.path_needs_precision[path.length - 1] = true;
  state.target = state.soft_target = null;

  //console.log(JSON.stringify(state.path));
};

const PIDController =
    (error: number, derror: number, grounded: boolean): number => {
  const dfactor = grounded ? 1.00 : 2.00;
  return 20.00 * error + dfactor * derror;
};

const nextPathStep = (env: any, state: PathingState,
                      body: PhysicsState, grounded: boolean): boolean => {
  if (!grounded) return false;

  const {min, max} = body;
  const path = nonnull(state.path);
  const path_index = state.path_index;
  const path_needs_precision = nonnull(state.path_needs_precision);
  const needs_precision = path_needs_precision[path_index];

  const last = path_index === path.length - 1;
  const node = path[path_index];
  const soft = state.path_soft_target;
  const use_soft = last && soft && (grounded || !node.jump);

  const x = use_soft ? soft[0] - 0.5 : node.x;
  const z = use_soft ? soft[2] - 0.5 : node.z;
  const y = node.y;

  const E = (() => {
    const width = max[0] - min[0];
    const final_path_step = path_index === path.length - 1;
    if (final_path_step) return 0.4 * (1 - width);
    if (needs_precision) return 0.1 * (1 - width);
    return (path_index === 0 ? -0.6 : -0.4) * width;
  })();

  const result = x + E <= min[0] && max[0] <= x + 1 - E &&
                 y + 0 <= min[1] && max[1] <= y + 1 - 0 &&
                 z + E <= min[2] && max[2] <= z + 1 - E;

  if (result && !needs_precision && path_index < path.length - 1) {
    const blocked = (() => {
      const check = (x: int, y: int, z: int) => {
        const block = env.getBlock(x, y, z);
        return !env.registry.solid[block];
      };

      const check_move = (x: number, y: number, z: number) => {
        Vec3.set(kTmpDelta, x, y, z);
        sweep(kTmpMin, kTmpMax, kTmpDelta, kTmpResting, check, true);
        return kTmpResting[0] || kTmpResting[1] || kTmpResting[2];
      };

      Vec3.copy(kTmpMax, body.max);
      Vec3.copy(kTmpMin, body.min);

      const prev = path[path_index];
      const next = path[path_index + 1];
      const dx = next.x + 0.5 - 0.5 * (body.min[0] + body.max[0]);
      const dz = next.z + 0.5 - 0.5 * (body.min[2] + body.max[2]);
      const dy = next.y - body.min[1];

      // TODO(shaunak): When applied to path_index 0, this check can result in
      // a kind of infinite loop that prevents path following. It occurs if
      // the A-star algorithm returns a path where the first step (from the
      // sprite's original cell to the next cell) includes a collision. A-star
      // isn't supposed to do that, but that's a fragile invariant to rely on.
      //
      // When the invariant is broken, then path_needs_precision will be set
      // for path_index 0. We'll move to the center of that cell, then move
      // to the next path step. But as soon as we move away from the center,
      // the next call to A-star will still have the same origin, and will
      // re-start the loop.
      //
      // How can we fix this issue safely? We could double-check here that if
      // the current path is blocked, then the path from the center of the cell
      // is not blocked (i.e. double-check the supposed invariant). If it fails,
      // then pathing to the block center is useless and we'll skip it.
      return (dy > 0 && check_move(0, dy, 0)) ||
             ((dx || dz) && check_move(dx, 0, dz));
    })();

    if (blocked) {
      path_needs_precision[path_index] = true;
      return false;
    }
  }

  return result;
};

const followPath = (env: any, state: PathingState,
                    body: PhysicsState): void => {
  const path = nonnull(state.path);
  if (state.path_index === path.length) { state.path = null; return; }
  const movement = env.movement.get(state.id);
  if (!movement) return;

  const grounded = body.resting[1] < 0;
  if (nextPathStep(env, state, body, grounded)) state.path_index++;
  if (state.path_index === path.length) { state.path = null; return; }

  const path_index = state.path_index;
  const last = path_index === path.length - 1;
  const node = path[path_index];
  const soft = state.path_soft_target;
  const use_soft = last && soft && (grounded || !node.jump);

  const cx = (body.min[0] + body.max[0]) / 2;
  const cz = (body.min[2] + body.max[2]) / 2;
  const dx = (use_soft ? soft[0] : node.x + 0.5) - cx;
  const dz = (use_soft ? soft[2] : node.z + 0.5) - cz;

  const penalty = movementPenalty(movement, body);
  const speed = penalty * movement.maxSpeed;
  const inverse_speed = speed ? 1 / speed : 1;

  let inputX = PIDController(dx, -body.vel[0], grounded) * inverse_speed;
  let inputZ = PIDController(dz, -body.vel[2], grounded) * inverse_speed;
  const length = Math.sqrt(inputX * inputX + inputZ * inputZ);
  const normalization = length > 1 ? 1 / length : 1;
  movement.inputX = inputX * normalization;
  movement.inputZ = inputZ * normalization;

  if (grounded) movement._jumped = false;
  movement.jumping = (() => {
    if (node.y > body.min[1]) return true;
    if (!grounded) return false;
    if (!node.jump) return false;

    if (path_index === 0) return false;
    const prev = path[path_index - 1];
    if (Math.floor(cx) !== prev.x) return false;
    if (Math.floor(cz) !== prev.z) return false;

    const fx = cx - prev.x;
    const fz = cz - prev.z;
    return (dx > 1 && fx > 0.5) || (dx < -1 && fx < 0.5) ||
           (dz > 1 && fz > 0.5) || (dz < -1 && fz < 0.5);
  })();

  const mesh = env.meshes.get(state.id);
  if (!mesh) return;
  const use_dx = (grounded && use_soft) || path_index === 0;
  const vx = use_dx ? dx : node.x - path[path_index - 1].x;
  const vz = use_dx ? dz : node.z - path[path_index - 1].z;
  mesh.heading = Math.atan2(vx, vz);
};

const runPathing = (env: any, state: PathingState): void => {
  if (!state.path && !state.target) return;
  const body = env.physics.get(state.id);
  if (!body) return;

  if (state.target) findPath(env, state, body);
  if (state.path) followPath(env, state, body);
};

// Note: This component requires TypedEnv to function properly.
// The factory function pattern is used to inject the environment dependency.
export const Pathing = (env: any): Component<PathingState> => ({
  init: () => ({
    id: kNoEntity,
    index: 0,
    path: null,
    path_index: 0,
    path_soft_target: null,
    path_needs_precision: null,
    target: null,
    soft_target: null,
  }),
  onUpdate: (dt: number, states: PathingState[]) => {
    for (const state of states) runPathing(env, state);
  }
});
