import {int, Vec3} from '../base.js';
import {kWorldHeight} from '../engine.js';
import {Component} from '../ecs.js';
import {EntityId, kNoEntity} from '../ecs.js';
import {PhysicsState} from './physics.js';

/**
 * Movement component - player/entity movement and jumping
 * Original location: main.ts lines 364-608
 *
 * Movement allows an entity to process inputs and attempt to move.
 */

export interface MovementState {
  id: EntityId,
  index: int,
  inputX: number,
  inputZ: number,
  jumping: boolean,
  hovering: boolean,
  maxSpeed: number,
  moveForce: number,
  grassPenalty: number,
  waterPenalty: number,
  responsiveness: number,
  runningFriction: number,
  standingFriction: number,
  airMoveMultiplier: number,
  airJumps: number,
  jumpTime: number,
  jumpForce: number,
  jumpImpulse: number,
  _jumped: boolean,
  _jumpCount: number,
  _jumpTimeLeft: number,
  hoverFallForce: number,
  hoverRiseForce: number,
};

// Temporary vectors for calculations
const kTmpDelta = Vec3.create();
const kTmpPush = Vec3.create();

const movementPenalty = (state: MovementState, body: PhysicsState): number => {
  return body.inFluid ? state.waterPenalty :
         body.inGrass ? state.grassPenalty : 1;
}

const handleJumping = (dt: number, state: MovementState,
                       body: PhysicsState, grounded: boolean) => {
  if (state._jumped) {
    if (state._jumpTimeLeft <= 0) return;
    const delta = state._jumpTimeLeft <= dt ? state._jumpTimeLeft / dt : 1;
    const force = state.jumpForce * delta;
    state._jumpTimeLeft -= dt;
    body.forces[1] += force;
    return;
  }

  const hasAirJumps = state._jumpCount < state.airJumps;
  const canJump = grounded || body.inFluid || hasAirJumps;
  if (!canJump) return;

  const height = body.min[1];
  const factor = height / kWorldHeight;
  const density = factor > 1 ? Math.exp(1 - factor) : 1;
  const penalty = density * (body.inFluid ? state.waterPenalty : 1);

  state._jumped = true;
  state._jumpTimeLeft = state.jumpTime;
  body.impulses[1] += state.jumpImpulse * penalty;
  if (grounded) return;

  body.vel[1] = Math.max(body.vel[1], 0);
  state._jumpCount++;
};

const handleRunning = (dt: number, state: MovementState,
                       body: PhysicsState, grounded: boolean) => {
  const penalty = movementPenalty(state, body);
  const speed = penalty * state.maxSpeed;
  Vec3.set(kTmpDelta, state.inputX * speed, 0, state.inputZ * speed);
  Vec3.sub(kTmpPush, kTmpDelta, body.vel);
  kTmpPush[1] = 0;
  const length = Vec3.length(kTmpPush);
  if (length === 0) return;

  const bound = state.moveForce * (grounded ? 1 : state.airMoveMultiplier);
  const input = state.responsiveness * length;
  Vec3.scale(kTmpPush, kTmpPush, Math.min(bound, input) / length);
  Vec3.add(body.forces, body.forces, kTmpPush);
};

const runMovement = (env: any, dt: number, state: MovementState) => {
  const body = env.physics.getX(state.id);
  const grounded = body.resting[1] < 0;
  if (grounded) state._jumpCount = 0;

  if (state.hovering) {
    const force = body.vel[1] < 0 ? state.hoverFallForce : state.hoverRiseForce;
    body.forces[1] += force;
  }

  if (state.jumping) {
    handleJumping(dt, state, body, grounded);
    state.jumping = false;
  } else {
    state._jumped = false;
  }

  if (state.inputX || state.inputZ) {
    handleRunning(dt, state, body, grounded);
    body.friction = state.runningFriction;
    state.inputX = state.inputZ = 0;
  } else {
    body.friction = state.standingFriction;
  }
};

// Note: This component requires TypedEnv to function properly.
// The factory function pattern is used to inject the environment dependency.
export const Movement = (env: any): Component<MovementState> => ({
  init: () => ({
    id: kNoEntity,
    index: 0,
    inputX: 0,
    inputZ: 0,
    jumping: false,
    hovering: false,
    maxSpeed: 7.5,
    moveForce: 30,
    grassPenalty: 0.5,
    waterPenalty: 0.5,
    responsiveness: 15,
    runningFriction: 0,
    standingFriction: 2,
    airMoveMultiplier: 0.5,
    airJumps: 0,
    jumpTime: 0.2,
    jumpForce: 10,
    jumpImpulse: 7.5,
    _jumped: false,
    _jumpCount: 0,
    _jumpTimeLeft: 0,
    hoverFallForce: 160,
    hoverRiseForce: 80,
  }),
  onUpdate: (dt: number, states: MovementState[]) => {
    for (const state of states) runMovement(env, dt, state);
  }
});
