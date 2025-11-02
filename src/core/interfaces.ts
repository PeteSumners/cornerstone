import {int, Vec3} from '../base.js';
import {BlockId} from './registry.js';

/**
 * Core Interfaces - Interface layer for loose coupling
 *
 * These interfaces enable:
 * - Dependency injection
 * - Easy mocking for tests
 * - Swappable implementations
 * - Better extensibility
 */

//////////////////////////////////////////////////////////////////////////////
// Input Interfaces
//////////////////////////////////////////////////////////////////////////////

export type Input = 'up' | 'left' | 'down' | 'right' | 'hover' | 'call' |
                    'mouse0' | 'mouse1' | 'space' | 'pointer';

export interface IInputHandler {
  inputs: Record<Input, boolean>;
  deltas: {x: int, y: int, scroll: int};
  displayStats(stats: string): void;
}

//////////////////////////////////////////////////////////////////////////////
// World Interfaces
//////////////////////////////////////////////////////////////////////////////

export interface IWorldProvider {
  getBlock(x: int, y: int, z: int): BlockId;
  setBlock(x: int, y: int, z: int, block: BlockId): void;
  getLight(x: int, y: int, z: int): number;
  setPointLight(x: int, y: int, z: int, level: int): void;
  getBaseHeight(x: int, z: int): int;
  initializeWorld(chunkRadius: int, frontierRadius: int, frontierLevels: int): void;
  recenterWorld(x: int, z: int): void;
  remeshWorld(): void;
}

//////////////////////////////////////////////////////////////////////////////
// Renderer Interfaces
//////////////////////////////////////////////////////////////////////////////

export interface ICamera {
  position: Vec3;
  target: Vec3;
  direction: Vec3;
  heading: number;
  pitch: number;
  zoom: number;
}

export interface IRenderer {
  camera: ICamera;
  render(): void;
  setOverlayColor(color: [number, number, number, number]): void;
}

//////////////////////////////////////////////////////////////////////////////
// Registry Interfaces
//////////////////////////////////////////////////////////////////////////////

export interface IBlockRegistry {
  light: int[];
  opaque: boolean[];
  solid: boolean[];
  addBlock(materials: string[], solid: boolean, light?: int): BlockId;
  addMaterial(name: string, texture: any, liquid?: boolean): void;
  getBlockFaceMaterial(id: BlockId, face: int): any;
  getBlockMesh(id: BlockId): any;
  getMaterialData(id: any): any;
}

//////////////////////////////////////////////////////////////////////////////
// Performance Interfaces
//////////////////////////////////////////////////////////////////////////////

export interface IPerformanceMonitor {
  begin(): void;
  end(): void;
  frame(): int;
  max(): number;
  mean(): number;
}

export interface ITiming {
  remeshPerf: IPerformanceMonitor;
  renderPerf: IPerformanceMonitor;
  updatePerf: IPerformanceMonitor;
}
