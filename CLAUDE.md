# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WAVE: WebAssembly Voxel Engine** - A high-performance 3D voxel game engine originally based on noa-engine, completely rewritten in TypeScript with WebAssembly for significant performance improvements. Currently being customized as "Cornerstone" with Bible verse rendering and spiritual game features.

### Key Features
- WebAssembly-powered world generation and meshing
- Dynamic lighting based on cellular automata
- Level-of-detail (LOD) terrain rendering
- Entity Component System (ECS) architecture
- Custom WebGL2 renderer with optimized voxel shaders
- Run-length encoded chunk storage for performance

## Development Commands

### Build System
```bash
# Compile TypeScript to JavaScript
npx tsc

# Output directory: target/
# The TypeScript compiler uses tsconfig.json configuration
```

### Running the Application
```bash
# Option 1: Simple HTTP server (Python)
python -m http.server 8000

# Option 2: Node.js http-server
npx http-server -p 8000

# Then open: http://localhost:8000
# The application loads from index.html
```

### Key Files to Build
- TypeScript files in `src/**/*.ts` compile to `target/src/**/*.js`
- Entry point: `target/src/main.js` (loaded by index.html)
- WASM module: `core.js` (pre-compiled, loaded by index.html)

### Testing
There are no automated tests currently. Testing is done manually by:
1. Building with `npx tsc`
2. Running the local server
3. Opening the application in browser
4. Testing gameplay features interactively

## Architecture Overview

### Three-Layer Architecture (Recent Refactor - Phases 3-6)

The codebase was recently refactored from a monolithic `engine.ts` into a modular architecture:

1. **Public API Layer** (`src/index.ts`)
   - Clean exports for engine consumers
   - Type-safe interfaces
   - Dependency injection abstractions
   - This is what external code should import from

2. **Interface Layer** (`src/core/interfaces.ts`)
   - Abstract interfaces for loose coupling
   - Enables testing and mocking
   - Types: `IInputHandler`, `IWorldProvider`, `ICamera`, `IRenderer`, `IBlockRegistry`, etc.

3. **Implementation Layer** (modular files)
   - `src/engine.ts` - Core `Env` class and initialization
   - `src/core/registry.ts` - Block and material registry
   - `src/input/container.ts` - Input handling
   - `src/wasm/` - WebAssembly integration
   - `src/performance/` - Timing and performance monitoring
   - `src/components/` - ECS components
   - `src/systems/` - Game systems
   - `src/rendering/` - Rendering primitives

### Core Subsystems

#### 1. Entity Component System (ECS)
**Location:** `src/ecs.ts`

The game uses an ECS architecture where:
- **Entities** are integer IDs that tie components together
- **Components** are data containers (Position, Physics, Movement, Meshes, etc.)
- **Systems** are update loops that process components

**Built-in Components** (in `src/components/`):
- `Lifetime` - Auto-cleanup after time expires
- `Position` - World position and AABB
- `Physics` - Collision detection, velocity, forces
- `Movement` - Player/NPC movement and jumping
- `Pathing` - AI pathfinding with A* algorithm
- `Meshes` - Entity rendering with sprites
- `Shadow` - Dynamic shadow casting
- `Lights` - Point lights with spatial hashing
- `Inputs` - Player input handling

**Registering a Component:**
```typescript
const myComponent = entities.registerComponent('my-component', MyComponent);
```

#### 2. Block and Material Registry
**Location:** `src/core/registry.ts` (originally in engine.ts:137-293)

Manages all block types and materials in the world:
- `BlockId` - Unique identifier for each block type
- `MaterialId` - Unique identifier for textures/materials
- Block properties: solid, opaque, light emission
- Face materials: Each block has 6 face materials (+x, -x, +y, -y, +z, -z)
- Integration with WASM for block data

**Adding a Block:**
```typescript
// Standard block with materials for [top/bottom, sides]
const grass = registry.addBlock(['grass', 'dirt', 'grass-side'], true);

// Block with custom mesh (like flowers)
const flower = registry.addBlockMesh(meshInstance, false, lightLevel);
```

#### 3. WASM Integration
**Location:** `src/wasm/`

WebAssembly handles performance-critical operations:
- World chunk generation
- Greedy meshing algorithm
- Light propagation (cellular automata)
- Block storage and queries

**Key Files:**
- `wasm-types.ts` - TypeScript definitions for WASM module
- `wasm-handle.ts` - Handle-based memory management for JS↔WASM
- `wasm-helper.ts` - JavaScript bindings to call WASM from TS

**WASM Callback System:**
The engine registers JavaScript callbacks that WASM calls:
- `js_AddVoxelMesh` - WASM creates mesh geometry
- `js_SetVoxelMeshLight` - WASM updates lighting
- `js_AddLightTexture` - WASM requests light texture
- `js_AddInstancedMesh` - WASM creates instanced blocks

#### 4. Rendering System
**Location:** `src/renderer.ts`, `src/rendering/`

Custom WebGL2 renderer optimized for voxels:
- **VoxelMesh**: Greedy-meshed terrain chunks
- **InstancedMesh**: Repeated block types (flowers, grass)
- **SpriteMesh**: Billboarded entity sprites
- **Camera**: First-person camera with culling (`src/rendering/camera.ts`)
- **Geometry**: Compressed quad format for voxels (`src/rendering/geometry.ts`)

**Rendering Pipeline:**
1. Camera computes view/projection matrices
2. Chunks are meshed by WASM, sent to JS
3. Geometry uploaded to GPU as vertex buffers
4. Single draw call per chunk (using 2D texture arrays)
5. Shaders compute normals/UVs on-the-fly from compressed format

#### 5. World Structure
**Chunks:** 16×256×16 blocks
- Horizontal (x, z): 16 blocks
- Vertical (y): 256 blocks (full world height)
- World is divided into a grid of chunks

**Run-Length Encoding:**
World data is stored as RLE columns, not 3D arrays. This enables:
- Fast worldgen (quadratic instead of cubic complexity)
- Efficient equi-level computation
- Memory savings for mostly-uniform terrain

**Key Constants:**
- `kChunkWidth = 16`
- `kWorldHeight = 256`
- `kChunkRadius = 12` (active terrain)
- `kFrontierRadius = 8` (LOD terrain)

#### 6. Physics and Collision
**Location:** `src/sweep.ts`, `src/components/physics.ts`

AABB sweep collision detection with:
- Continuous collision detection (no tunneling)
- Auto-stepping (climb 1-block steps automatically)
- Friction and restitution
- Fluid physics (swimming, drag)
- Resting contact tracking

**Collision Resolution:**
```typescript
// sweep(min, max, delta, impacts, checkSolid)
// Moves AABB by delta, stopping at solid blocks
// Modifies min/max in-place, returns final position
```

#### 7. Game Systems
**Location:** `src/systems/`

Reusable game logic extracted from main.ts:
- `particle-system.ts` - Block break particles
- `water-flow.ts` - Water propagation simulation
- `block-modification.ts` - Place/break blocks with collision checks

### Main Entry Points

#### `src/main.ts`
The game's main file - contains:
- `TypedEnv` class extending `Env` with typed component stores
- Entity creation helpers (`addEntity`)
- Block and material registration
- Player and follower setup
- Bible text rendering integration (WIP)

**Key Pattern:**
```typescript
// Extend Env with typed components
class TypedEnv extends Env {
  blocks: Blocks | null = null;
  point_lights: Map<string, PointLight>;
  lifetime: ComponentStore<LifetimeState>;
  position: ComponentStore<PositionState>;
  // ... register all components in constructor
}
```

#### `src/engine.ts`
Core engine class with:
- `Env` class - main environment/world manager
- WASM initialization and bindings
- `init()` function for async startup
- World centering and recentering
- Camera target management
- Highlight mesh for block targeting

**Initialization Flow:**
1. `window.onload` triggers
2. `beforeWasmCompile` registers JS callbacks
3. `onWasmCompile` creates `WasmHelper`
4. `checkReady()` calls registered callbacks
5. User's `main()` function executes

#### `src/index.ts`
Public API exports - this is the reusable interface:
- Engine classes (Env, Registry)
- ECS primitives (Component, EntityId)
- Components (Position, Physics, Movement, etc.)
- Systems (generateParticles, flowWater, modifyBlock)
- Rendering types (Camera, Geometry, Texture)
- Base utilities (assert, Vec3, Color)

### Important Patterns

#### 1. Adding a New Component
```typescript
// In src/components/my-component.ts
export interface MyState extends ComponentState {
  id: EntityId;
  index: int;
  myData: string;
}

export const MyComponent = (env: TypedEnv): Component<MyState> => ({
  init: () => ({id: kNoEntity, index: 0, myData: ''}),
  onAdd: (state: MyState) => { /* setup */ },
  onRemove: (state: MyState) => { /* cleanup */ },
  onUpdate: (dt: number, states: MyState[]) => { /* update logic */ },
  onRender: (dt: number, states: MyState[]) => { /* render logic */ },
});
```

#### 2. Adding a New Block Type
```typescript
// In main.ts or worldgen
const myBlock = registry.addBlock(
  ['top_material', 'bottom_material', 'side_material'],
  true,  // solid?
  9      // light level (0-15, or -1 for opaque)
);
```

#### 3. Modifying the World
```typescript
// Set a block
env.setBlock(x, y, z, blockId);

// Get a block
const block = env.getBlock(x, y, z);

// Get light level at position
const light = env.getLight(x, y, z);  // returns 0.0-1.0

// Trigger world remesh (after batch changes)
env.remesh();
```

#### 4. Working with Entities
```typescript
// Create entity
const entity = env.entities.addEntity();

// Add components
const position = env.position.add(entity);
position.x = 10; position.y = 20; position.z = 30;

const physics = env.physics.add(entity);
physics.vel[1] = 5;  // jump upward

// Query components
env.position.each(state => {
  console.log(`Entity ${state.id} at (${state.x}, ${state.y}, ${state.z})`);
});

// Remove entity (removes all its components)
env.entities.removeEntity(entity);
```

## Project Structure

```
cornerstone/
├── src/                      # TypeScript source code
│   ├── index.ts             # Public API exports (Phase 5)
│   ├── engine.ts            # Core Env class and WASM integration
│   ├── main.ts              # Game implementation (demo/test)
│   ├── base.ts              # Utilities (Vec3, assert, etc.)
│   ├── ecs.ts               # Entity Component System
│   ├── renderer.ts          # WebGL2 renderer
│   ├── mesher.ts            # Greedy meshing (TypeScript side)
│   ├── sweep.ts             # AABB collision detection
│   ├── pathing.ts           # A* pathfinding
│   ├── core/                # Core modules (Phase 3)
│   │   ├── interfaces.ts    # Abstract interfaces (Phase 4)
│   │   └── registry.ts      # Block/material registry
│   ├── input/               # Input handling
│   │   └── container.ts     # Keyboard, mouse, pointer lock
│   ├── wasm/                # WebAssembly integration
│   │   ├── wasm-types.ts
│   │   ├── wasm-handle.ts
│   │   └── wasm-helper.ts
│   ├── performance/         # Performance monitoring
│   │   ├── performance.ts   # FPS tracking
│   │   └── timing.ts        # Fixed timestep game loop
│   ├── components/          # ECS components (Phase 3)
│   │   ├── lifetime.ts
│   │   ├── position.ts
│   │   ├── physics.ts
│   │   ├── movement.ts
│   │   ├── pathing.ts
│   │   ├── meshes.ts
│   │   ├── shadow.ts
│   │   ├── lights.ts
│   │   └── inputs.ts
│   ├── systems/             # Game systems (Phase 3)
│   │   ├── particle-system.ts
│   │   ├── water-flow.ts
│   │   └── block-modification.ts
│   ├── rendering/           # Rendering primitives
│   │   ├── types.ts
│   │   ├── camera.ts
│   │   └── geometry.ts
│   ├── text-integration.ts  # Bible verse text rendering (WIP)
│   └── voxel-text.ts        # Text-to-voxel conversion
├── lib/                      # Public domain libraries
├── target/                   # Compiled JavaScript output
├── images/                   # Texture assets
├── tools/                    # Development tools
│   ├── asset-generator/     # Procedural texture/sprite generation
│   ├── audio/               # Schumann resonance audio
│   └── fonts/               # Font atlas generation
├── index.html               # Application entry point
├── core.js                  # Pre-compiled WASM module
├── tsconfig.json            # TypeScript configuration
└── package.json             # NPM dependencies (only TypeScript)
```

## Important Technical Details

### Coordinate System
- **Y-axis**: Vertical (height)
- **X and Z**: Horizontal
- World origin is at (0, 0, 0)
- Chunks are centered on integer coordinates

### Lighting System
- Light levels: 0 (dark) to 15 (bright)
- Sunlight level: 15 (`kSunlightLevel`)
- Light calculation: `lighting(level) = pow(0.8, 15 - level)`
- Point lights use spatial hashing for efficiency
- Cellular automata for light propagation (handled by WASM)

### Performance Optimizations

#### 1. Equi-Levels (Critical!)
A y-level in a chunk where all 256 blocks (16×16) are identical.
- Computed using run-length encoding
- Skips meshing for 80-95% of columns
- See README.md:112-150 for algorithm details

#### 2. Greedy Meshing
Combines adjacent same-type faces into larger quads:
- Reduces vertex count by ~10x
- Implemented in WASM for speed
- Uses equi-levels to skip unnecessary work

#### 3. 2D Texture Arrays
WebGL2 feature enabling single draw call per chunk:
- All block textures in one array
- Shader selects texture by index
- Massive rendering performance win

#### 4. Compressed Geometry Format
Voxel quads stored as packed integers:
- Position, normal, UV computed in shader
- ~600MB → ~120MB geometry reduction

### Game Loop Timing
- **Fixed update rate**: 60 TPS (ticks per second)
- **Variable render rate**: As fast as possible
- Update loop runs in `setInterval` every `1000/60/4 ms`
- Render loop runs in `requestAnimationFrame`
- Up to 4 update ticks per render frame to catch up

### Browser Compatibility
- **Requires WebGL2** (modern browsers only)
- **Requires pointer lock API** (for mouse look)
- **ES6 modules** required
- Tested in Chrome, Firefox, Edge

## Common Tasks

### Add a New Block Type
1. Add material texture to registry
2. Register block with materials
3. Use block ID in worldgen or placement logic
4. Block automatically integrates with lighting, meshing, collision

### Add a New Entity Type
1. Create entity with `entities.addEntity()`
2. Add required components (position, physics, meshes, etc.)
3. Components handle update/render automatically
4. Clean up with `entities.removeEntity()`

### Modify World Generation
- World generation is in WASM (C++ side)
- TypeScript side receives RLE columns
- To change worldgen, you need to modify C++ and recompile WASM
- Alternatively, generate terrain in TypeScript using `env.setBlock()`

### Add Custom Rendering
1. Create mesh in renderer (`addVoxelMesh`, `addSpriteMesh`, etc.)
2. Store mesh reference in component or entity
3. Update mesh position/properties in component's `onRender`
4. Dispose mesh when entity is removed

### Debug Rendering Issues
1. Check browser console for WebGL errors
2. Verify shaders compiled correctly
3. Check that textures loaded (network tab)
4. Ensure camera is positioned correctly
5. Verify geometry was generated (check WASM callbacks)

## Code Style Notes

### TypeScript Usage
- **Strict mode enabled** in tsconfig.json
- Use explicit types, avoid `any`
- Branded types for type safety: `BlockId`, `MaterialId`, `EntityId`
- Use `int` type alias for integer values

### Module System
- ES6 modules with `.js` extensions in imports (TypeScript requirement)
- Relative imports within project
- No external dependencies except TypeScript compiler

### Naming Conventions
- **Constants**: `kCamelCase` (e.g., `kChunkWidth`, `kWorldHeight`)
- **Classes**: `PascalCase`
- **Functions/variables**: `camelCase`
- **Private members**: `_leadingUnderscore` for internal state
- **Interfaces**: `IPascalCase` for abstractions, or just `PascalCase` for data types

### Vector Operations
Use the `Vec3` utility functions from `base.ts`:
```typescript
const v = Vec3.create();  // [0, 0, 0]
Vec3.set(v, x, y, z);
Vec3.add(result, a, b);
Vec3.scale(result, v, scalar);
```

### Assertions
Use `assert()` from base.ts for runtime checks:
```typescript
assert(value > 0, () => `Expected positive, got ${value}`);
```

## Recent Refactoring History

The codebase underwent a major refactoring (Phases 3-6):

**Phase 3**: Extracted systems and components from monolithic files
- Moved game systems to `src/systems/`
- Moved ECS components to `src/components/`
- Decomposed `engine.ts` into modular architecture

**Phase 4**: Introduced interface layer for loose coupling
- Created `src/core/interfaces.ts` with abstractions
- Enables dependency injection and testing

**Phase 5**: Created public API for engine reusability
- `src/index.ts` exports clean public interface
- Consumers import from index, not internals

**Phase 6**: Added comprehensive JSDoc documentation
- All public APIs documented
- Examples for common patterns
- Architecture explanations

This means many files have comments showing original locations, like:
```typescript
// Original location: engine.ts lines 137-293
```

## Current Development Focus

The project is being customized as **"Cornerstone"** with:
- Bible verse text rendering in voxel world (`text-integration.ts`)
- Schumann resonance audio for meditation (`tools/audio/`)
- Procedural asset generation tools (`tools/asset-generator/`)
- Spiritual/educational game features

Main implementation file is `src/main.ts` which demonstrates engine usage.

## Additional Resources

- **README.md**: Project history, optimizations, LOD explanation
- **tools/README.md**: Asset generation and audio tools documentation
- **Git history**: Well-structured commits showing refactoring phases
- **Original engine**: https://github.com/fenomas/noa
