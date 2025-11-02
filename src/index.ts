/**
 * Wave Voxel Engine - Public API
 *
 * This is the main entry point for the Wave engine as a reusable library.
 * Import from this file to use the engine in your own games.
 *
 * Current structure:
 * - src/ - Reusable engine code
 * - src/main.ts - Demo/game (TODO: move to demo/ in future refactoring)
 */

// ============================================================================
// Core Engine
// ============================================================================

export {Env, init} from './engine.js';
export type {BlockId, MaterialId} from './core/registry.js';
export {kEmptyBlock, kNoMaterial, kWorldHeight} from './engine.js';

// ============================================================================
// ECS (Entity Component System)
// ============================================================================

export {Component, ComponentState, ComponentStore} from './ecs.js';
export type {EntityId} from './ecs.js';
export {kNoEntity} from './ecs.js';

// ============================================================================
// Base Utilities
// ============================================================================

export {assert, int, nonnull, drop} from './base.js';
export {Color, Vec3, Tensor2, Tensor3} from './base.js';

// ============================================================================
// Components (Generic/Reusable)
// ============================================================================

export {Lifetime, LifetimeState} from './components/lifetime.js';
export {Position, PositionState} from './components/position.js';
export {Lights, LightState, PointLight} from './components/lights.js';
export {Shadow, ShadowState} from './components/shadow.js';
export {Meshes, MeshState} from './components/meshes.js';
export {Inputs, InputState} from './components/inputs.js';
export {Physics, PhysicsState} from './components/physics.js';
export {Movement, MovementState} from './components/movement.js';
export {Pathing, PathingState} from './components/pathing.js';

// ============================================================================
// Systems (Generic/Reusable)
// ============================================================================

export {generateParticles} from './systems/particle-system.js';
export {flowWater} from './systems/water-flow.js';
export {modifyBlock, tryToModifyBlock} from './systems/block-modification.js';

// ============================================================================
// Rendering
// ============================================================================

export type {Texture, Sprite} from './rendering/types.js';
export {Camera} from './rendering/camera.js';
export {Geometry} from './rendering/geometry.js';
export {SpriteMesh, ShadowMesh} from './renderer.js';

// ============================================================================
// Core Modules
// ============================================================================

export {Container} from './input/container.js';
export type {Input} from './core/interfaces.js';
export {Registry} from './core/registry.js';
export {Performance} from './performance/performance.js';
export {Timing} from './performance/timing.js';

// ============================================================================
// WASM
// ============================================================================

export {WasmHandle} from './wasm/wasm-handle.js';
export {WasmHelper} from './wasm/wasm-helper.js';
export type {WasmModule} from './wasm/wasm-types.js';

// ============================================================================
// Pathfinding
// ============================================================================

export {AStar, PathNode} from './pathing.js';
export type {Check, Point as AStarPoint} from './pathing.js';

// ============================================================================
// Physics
// ============================================================================

export {sweep} from './sweep.js';

// ============================================================================
// Interfaces (for Dependency Injection)
// ============================================================================

export type {
  IInputHandler,
  IWorldProvider,
  ICamera,
  IRenderer,
  IBlockRegistry,
  IPerformanceMonitor,
  ITiming,
} from './core/interfaces.js';
