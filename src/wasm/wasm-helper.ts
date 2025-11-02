import {int} from '../base.js';
import {BlockId} from '../core/registry.js';
import {Instance, InstancedMesh, LightTexture, Renderer, VoxelMesh} from '../renderer.js';
import {WasmHandle} from './wasm-handle.js';
import {WasmModule} from './wasm-types.js';

/**
 * WasmHelper - manages WebAssembly module interface
 * Original location: engine.ts lines 824-861
 *
 * Provides:
 * - Bindings to call C++ from JavaScript (world management, block operations)
 * - Bindings to call JavaScript from C++ (mesh/light management)
 * - Handle-based memory management for renderer resources
 */

export class WasmHelper {
  module: WasmModule;

  // Bindings to call C++ from JavaScript.

  initializeWorld: (chunkRadius: int, frontierRadius: int, frontierLevels: int) => void;
  recenterWorld: (x: int, z: int) => void;
  remeshWorld: () => void;

  getBlock: (x: int, y: int, z: int) => BlockId;
  setBlock: (x: int, y: int, z: int, block: BlockId) => void;
  getLightLevel: (x: int, y: int, z: int) => int;
  setPointLight: (x: int, y: int, z: int, level: int) => void;

  // Bindings to call JavaScript from C++.

  instances: WasmHandle<Instance>;
  lights: WasmHandle<LightTexture>;
  meshes: WasmHandle<VoxelMesh>;
  renderer: Renderer | null = null;
  block_to_instance: (InstancedMesh | null)[];

  constructor(module: WasmModule) {
    this.module = module;
    this.initializeWorld = module.asm.initializeWorld;
    this.recenterWorld = module.asm.recenterWorld;
    this.remeshWorld = module.asm.remeshWorld;
    this.getBlock = module.asm.getBlock;
    this.setBlock = module.asm.setBlock;
    this.getLightLevel = module.asm.getLightLevel;
    this.setPointLight = module.asm.setPointLight;

    this.instances = new WasmHandle();
    this.lights = new WasmHandle();
    this.meshes = new WasmHandle();
    this.block_to_instance = [];
  }
};
