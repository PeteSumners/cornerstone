/**
 * Wave Voxel Engine - Public API
 *
 * A WebAssembly-powered voxel game engine for building immersive 3D worlds.
 *
 * @module wave-voxel-engine
 *
 * @example
 * import {Env, init, BlockId} from 'wave-voxel-engine';
 *
 * const env = new Env('container');
 * await init(() => {
 *   // Initialize your game here
 *   env.initWorld();
 *   env.start();
 * });
 *
 * @remarks
 * Current structure:
 * - src/ - Reusable engine code
 * - src/main.ts - Demo/game implementation
 *
 * @packageDocumentation
 */

// ============================================================================
// Core Engine
// ============================================================================

/**
 * Main environment class and initialization function
 *
 * @remarks
 * - Env: Core game environment managing all subsystems
 * - init: Async initialization function for engine setup
 */
export {Env, init} from './engine.js';

/**
 * Block and material type definitions
 *
 * @remarks
 * - BlockId: Unique identifier for block types
 * - MaterialId: Unique identifier for materials/textures
 */
export type {BlockId, MaterialId} from './core/registry.js';

/**
 * Core engine constants
 *
 * @remarks
 * - kEmptyBlock: Represents air/empty space (BlockId = 0)
 * - kNoMaterial: Represents no material (MaterialId = 0)
 * - kWorldHeight: Maximum world height in blocks (256)
 */
export {kEmptyBlock, kNoMaterial, kWorldHeight} from './engine.js';

// ============================================================================
// ECS (Entity Component System)
// ============================================================================

/**
 * Entity Component System primitives
 *
 * @remarks
 * The ECS architecture separates data (components) from behavior (systems).
 * - Component: Base component definition
 * - ComponentState: Component instance data
 * - ComponentStore: Storage for component instances
 *
 * @example
 * const myComponent: Component<MyState> = {
 *   init: () => ({ id: kNoEntity, value: 0 }),
 *   onUpdate: (dt, states) => { // update logic }
 * };
 */
export {Component, ComponentState, ComponentStore} from './ecs.js';

/**
 * Entity identifier type
 *
 * @remarks
 * Unique identifier for game entities. Entities are simple integer IDs
 * that tie together multiple components.
 */
export type {EntityId} from './ecs.js';

/**
 * Special entity ID representing no entity
 *
 * @remarks
 * Use this constant to indicate the absence of a valid entity reference
 */
export {kNoEntity} from './ecs.js';

// ============================================================================
// Base Utilities
// ============================================================================

/**
 * Core utility functions for runtime checks and type conversions
 *
 * @remarks
 * - assert: Runtime assertion with lazy message evaluation
 * - int: Safe float-to-integer conversion
 * - nonnull: Assert value is not null/undefined
 * - drop: No-op function for explicit ignoring
 *
 * @example
 * assert(value > 0, () => 'Expected positive, got ' + value);
 * const index = int(Math.floor(x));
 * const element = nonnull(document.getElementById('canvas'));
 * drop(unusedValue); // Explicitly ignore
 */
export {assert, int, nonnull, drop} from './base.js';

/**
 * Mathematical types for 3D graphics
 *
 * @remarks
 * - Color: RGBA color [r, g, b, a] where values are 0-1
 * - Vec3: 3D vector with x, y, z components
 * - Tensor2: 2D array for grid data
 * - Tensor3: 3D array for voxel data
 */
export {Color, Vec3, Tensor2, Tensor3} from './base.js';

// ============================================================================
// Components (Generic/Reusable)
// ============================================================================

/**
 * Built-in ECS components for common game functionality
 *
 * @remarks
 * Each component manages a specific aspect of entity behavior:
 * - **Lifetime**: Auto-cleanup entities after time expires
 * - **Position**: World position and bounding box (AABB)
 * - **Physics**: Collision detection, velocity, forces
 * - **Movement**: Player/NPC movement and jumping
 * - **Pathing**: AI pathfinding with A* algorithm
 * - **Meshes**: Entity rendering with sprites/meshes
 * - **Shadow**: Dynamic shadow casting
 * - **Lights**: Point lights with spatial hashing
 * - **Inputs**: Player input handling
 *
 * @example
 * // Register components with ECS
 * const lifetime = entities.registerComponent('lifetime', Lifetime);
 * const position = entities.registerComponent('position', Position);
 *
 * // Add components to entity
 * const entity = entities.addEntity();
 * lifetime.add(entity);
 * position.add(entity);
 */
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

/**
 * Game systems for world simulation
 *
 * @remarks
 * Systems operate on entities and components to create game behavior:
 * - **generateParticles**: Create particle effects when blocks are destroyed
 * - **flowWater**: Simulate water flowing to adjacent empty spaces
 * - **modifyBlock**: Place or break blocks in the world
 * - **tryToModifyBlock**: Validate and execute block modifications with collision checks
 *
 * @example
 * // Generate particles when breaking a block
 * generateParticles(env, blockType, x, y, z, side);
 *
 * // Place a block
 * modifyBlock(env, x, y, z, blocks.stone, side);
 *
 * // Try to modify with player collision check
 * tryToModifyBlock(env, playerBody, true); // true = add block
 */
export {generateParticles} from './systems/particle-system.js';
export {flowWater} from './systems/water-flow.js';
export {modifyBlock, tryToModifyBlock} from './systems/block-modification.js';

// ============================================================================
// Rendering
// ============================================================================

/**
 * Rendering primitives for 3D graphics
 *
 * @remarks
 * - **Texture**: Material/texture definition with alpha blending support
 * - **Sprite**: Sprite sheet reference for character/entity rendering
 * - **Camera**: First-person camera with culling and transforms
 * - **Geometry**: Voxel mesh geometry (greedy-meshed quads)
 * - **SpriteMesh**: Billboard sprite rendering
 * - **ShadowMesh**: Dynamic shadow projection
 */
export type {Texture, Sprite} from './rendering/types.js';
export {Camera} from './rendering/camera.js';
export {Geometry} from './rendering/geometry.js';
export {SpriteMesh, ShadowMesh} from './renderer.js';

// ============================================================================
// Core Modules
// ============================================================================

/**
 * Input handling and key bindings
 *
 * @remarks
 * - **Container**: Manages keyboard, mouse, and pointer lock
 * - **Input**: Input types (up, down, left, right, space, etc.)
 */
export {Container} from './input/container.js';
export type {Input} from './core/interfaces.js';

/**
 * Block and material registry
 *
 * @remarks
 * Manages block types, materials, textures, and their properties (solid, transparent, light-emitting)
 */
export {Registry} from './core/registry.js';

/**
 * Performance monitoring and timing
 *
 * @remarks
 * - **Performance**: FPS tracking and frame time statistics
 * - **Timing**: Fixed timestep game loop (60 TPS) with variable rendering
 */
export {Performance} from './performance/performance.js';
export {Timing} from './performance/timing.js';

// ============================================================================
// WASM
// ============================================================================

/**
 * WebAssembly integration for high-performance world generation
 *
 * @remarks
 * - **WasmHandle**: Handle-based memory management for WASM interop
 * - **WasmHelper**: JavaScript ↔ C++ bindings for world operations
 * - **WasmModule**: WASM module interface definition
 *
 * The WASM module handles:
 * - Chunk generation and meshing
 * - Light propagation
 * - Block storage and queries
 */
export {WasmHandle} from './wasm/wasm-handle.js';
export {WasmHelper} from './wasm/wasm-helper.js';
export type {WasmModule} from './wasm/wasm-types.js';

// ============================================================================
// Pathfinding
// ============================================================================

/**
 * A* pathfinding algorithm for AI navigation
 *
 * @remarks
 * - **AStar**: A* pathfinding implementation
 * - **PathNode**: Graph node for pathfinding
 * - **Check**: Collision check function type
 * - **AStarPoint**: 3D point for pathfinding
 *
 * @example
 * const astar = new AStar();
 * const path = astar.findPath(start, goal, checkFunction);
 */
export {AStar, PathNode} from './pathing.js';
export type {Check, Point as AStarPoint} from './pathing.js';

// ============================================================================
// Physics
// ============================================================================

/**
 * Physics collision detection
 *
 * @remarks
 * **sweep**: AABB sweep collision detection for continuous collision detection
 *
 * @example
 * const result = sweep(env, aabb, velocity, delta);
 * // Returns new position and adjusted velocity after collisions
 */
export {sweep} from './sweep.js';

// ============================================================================
// Interfaces (for Dependency Injection)
// ============================================================================

/**
 * Interfaces for loose coupling and testability
 *
 * @remarks
 * Use these interfaces for dependency injection and mocking in tests:
 * - **IInputHandler**: Input abstraction (keyboard, mouse)
 * - **IWorldProvider**: World/block access abstraction
 * - **ICamera**: Camera abstraction
 * - **IRenderer**: Renderer abstraction
 * - **IBlockRegistry**: Block registry abstraction
 * - **IPerformanceMonitor**: Performance tracking abstraction
 * - **ITiming**: Game loop timing abstraction
 *
 * @example
 * // Mock input for testing
 * class MockInput implements IInputHandler {
 *   inputs = { up: false, down: false };
 *   deltas = { x: 0, y: 0, scroll: 0 };
 *   displayStats(stats: string) {}
 * }
 */
export type {
  IInputHandler,
  IWorldProvider,
  ICamera,
  IRenderer,
  IBlockRegistry,
  IPerformanceMonitor,
  ITiming,
} from './core/interfaces.js';
