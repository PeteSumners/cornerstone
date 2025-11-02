import {int} from '../base.js';
import {BlockId} from '../core/registry.js';

/**
 * WASM Type Definitions
 * Original location: engine.ts lines 760-790
 *
 * TypeScript type annotations for WebAssembly module interface
 */

export type WasmCharPtr   = int & {__cpp_type__: 'char*'};
export type WasmNoise2D   = int & {__cpp_type__: 'voxels::Noise2D*'};
export type WasmHeightmap = int & {__cpp_type__: 'voxels::Heightmap*'};

export interface WasmModule {
  HEAP8:   Int8Array,
  HEAP16:  Int16Array,
  HEAP32:  Int32Array,
  HEAPF32: Float32Array,
  HEAPF64: Float64Array,
  HEAPU8:  Uint8Array,
  HEAPU16: Uint16Array,
  HEAPU32: Uint32Array,
  asm: {
    free:   (WasmCharPtr: int) => void,
    malloc: (bytes: int) => WasmCharPtr,

    initializeWorld: (chunkRadius: int, frontierRadius: int, frontierLevels: int) => void;
    recenterWorld: (x: int, z: int) => void,
    remeshWorld: () => void,

    getBaseHeight: (x: int, z: int) => int,
    getBlock: (x: int, y: int, z: int) => BlockId,
    setBlock: (x: int, y: int, z: int, block: BlockId) => void,
    getLightLevel: (x: int, y: int, z: int) => int,
    setPointLight: (x: int, y: int, z: int, level: int) => void,

    registerBlock: any,
    registerMaterial: any,
  },
};
