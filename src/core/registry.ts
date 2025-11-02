import {assert, Color, int} from '../base.js';
import {InstancedMesh, Renderer, Texture} from '../renderer.js';

/**
 * Registry - manages block and material definitions
 * Original location: engine.ts lines 137-293
 *
 * Responsibilities:
 * - Block registration (solid blocks, meshes)
 * - Material registration and texture management
 * - Block face materials mapping
 * - Light and opacity properties
 * - WASM integration for block/material data
 */

export type BlockId = int & {__type__: 'BlockId'};
export type MaterialId = int & {__type__: 'MaterialId'};
export type MaybeMaterialId = MaterialId | 0;

export interface Material {
  liquid: boolean,
  texture: Texture,
  textureIndex: int,
};

interface BlockSprite {
  url: string,
  x: int,
  y: int,
  w: int,
  h: int,
};

export const kNoMaterial = 0 as 0;
export const kEmptyBlock = 0 as BlockId;
export const kUnknownBlock = 1 as BlockId;

export const kBlack: Color = [0, 0, 0, 1];
export const kWhite: Color = [1, 1, 1, 1];

// Forward declaration for WasmHelper (to avoid circular dependency)
interface WasmHelper {
  module: any;
  block_to_instance: (InstancedMesh | null)[];
}

export class Registry {
  // If a block's light value is -1, then the block is opaque and it always
  // has a computed light level of 0.
  //
  // Otherwise, the block casts a light equal to this value (but its computed
  // light may be greater than that, due to light from its neighbors).
  //
  light: int[];
  opaque: boolean[];
  solid: boolean[];
  private faces: MaybeMaterialId[];
  private meshes: (InstancedMesh | null)[];
  private materials: Material[];
  private ids: Map<string, MaterialId>;
  private helper: WasmHelper;
  private renderer: Renderer;

  constructor(helper: WasmHelper, renderer: Renderer) {
    this.opaque = [false, false];
    this.solid = [false, true];
    this.light = [0, 0];
    this.faces = []
    for (let i = 0; i < 12; i++) {
      this.faces.push(kNoMaterial);
    }
    this.meshes = [null, null];
    this.materials = [];
    this.ids = new Map();

    this.helper = helper;
    this.renderer = renderer;
    this.helper.block_to_instance = this.meshes;

    this.registerBlock(kEmptyBlock);
    this.registerBlock(kUnknownBlock);
  }

  addBlock(xs: string[], solid: boolean, light: int = 0): BlockId {
    type Materials = [string, string, string, string, string, string];
    const materials = ((): Materials => {
      switch (xs.length) {
        // All faces for this block use same material.
        case 1: return [xs[0], xs[0], xs[0], xs[0], xs[0], xs[0]];
        // xs specifies [top/bottom, sides]
        case 2: return [xs[1], xs[1], xs[0], xs[0], xs[1], xs[1]];
        // xs specifies [top, bottom, sides]
        case 3: return [xs[2], xs[2], xs[0], xs[1], xs[2], xs[2]];
        // xs specifies [+x, -x, +y, -y, +z, -z]
        case 6: return xs as Materials;
        // Uninterpretable case.
        default: throw new Error(`Unexpected materials: ${JSON.stringify(xs)}`);
      }
    })();

    let opaque = true;
    materials.forEach(x => {
      const id = this.ids.get(x);
      if (id === undefined) throw new Error(`Unknown material: ${x}`);
      const material = id + 1 as MaterialId;
      this.faces.push(material);

      const texture = this.getMaterialData(material).texture;
      const alphaBlend = texture.color[3] < 1;
      const alphaTest  = texture.alphaTest;
      if (alphaBlend || alphaTest) opaque = false;
    });

    light = opaque && light === 0 ? -1 : light;
    const result = this.opaque.length as BlockId;
    this.opaque.push(opaque);
    this.solid.push(solid);
    this.light.push(light);
    this.meshes.push(null);
    this.registerBlock(result);
    return result;
  }

  addBlockMesh(mesh: InstancedMesh, solid: boolean, light: int = 0): BlockId {
    const result = this.opaque.length as BlockId;
    for (let i = 0; i < 6; i++) this.faces.push(kNoMaterial);
    this.meshes.push(mesh);
    this.opaque.push(false);
    this.solid.push(solid);
    this.light.push(light);
    this.registerBlock(result);
    return result;
  }

  addMaterial(name: string, texture: Texture, liquid: boolean = false) {
    assert(name.length > 0, () => 'Empty material name!');
    assert(!this.ids.has(name), () => `Duplicate material: ${name}`);
    const id = this.materials.length as MaterialId;
    const textureIndex = this.renderer.addTexture(texture);
    this.ids.set(name, id);
    this.materials.push({liquid, texture, textureIndex});
    this.registerMaterial(id);
  }

  // faces has 6 elements for each block type: [+x, -x, +y, -y, +z, -z]
  getBlockFaceMaterial(id: BlockId, face: int): MaybeMaterialId {
    return this.faces[id * 6 + face];
  }

  getBlockMesh(id: BlockId): InstancedMesh | null {
    return this.meshes[id];
  }

  getMaterialData(id: MaterialId): Material {
    assert(0 < id && id <= this.materials.length);
    return this.materials[id - 1];
  }

  private registerBlock(id: BlockId): void {
    assert(0 <= id && id < this.opaque.length);
    const b = 6 * id;
    const faces = this.faces;
    this.helper.module.asm.registerBlock(
        id, !!this.meshes[id], this.opaque[id], this.solid[id], this.light[id],
        faces[b + 0], faces[b + 1], faces[b + 2],
        faces[b + 3], faces[b + 4], faces[b + 5]);
  }

  private registerMaterial(id: MaterialId): void {
    assert(0 <= id && id < this.materials.length);
    const material = this.materials[id]
    const [r, g, b, a] = material.texture.color;
    this.helper.module.asm.registerMaterial(
        id, material.liquid, material.texture.alphaTest,
        material.textureIndex, r, g, b, a);
  }
};
