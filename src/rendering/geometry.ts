import {assert, int} from '../base.js';
import {Vec3} from '../base.js';

/**
 * Geometry - voxel quad mesh data structure
 * Original location: renderer.ts lines 538-661
 *
 * Manages geometry data for voxel rendering, including bounds computation
 * and quad allocation.
 */

export class Geometry {
  // struct Quad {
  //   // int 0
  //   int16_t x;
  //   int16_t y;
  //
  //   // int 1
  //   int16_t z;
  //   int16_t indices; // 6 x 2-bit ints
  //
  //   // int 2
  //   int16_t w;
  //   int16_t h;
  //
  //   // int 3
  //   uint8_t mask:    8; // only need 6 bits
  //   uint8_t texture: 8; // could use more bits
  //   uint8_t ao:      8; // 4 x 2-bit AO values
  //   uint8_t wave:    4; // 4 x 1-bit wave flags
  //   uint8_t dim:     2;
  //   uint8_t dir:     1;
  //   uint8_t lit:     1;
  // };
  static StrideInInt32: int = 4;
  static StrideInBytes: int = 16;

  quads: Int32Array;
  num_quads: int;
  dirty: boolean;
  private lower_bound: Vec3;
  private upper_bound: Vec3;
  private bounds: Float64Array;

  constructor(quads: Int32Array, num_quads: int) {
    this.quads = quads;
    this.num_quads = num_quads;
    this.lower_bound = Vec3.create();
    this.upper_bound = Vec3.create();
    this.bounds = new Float64Array(24);
    this.dirty = true;
  }

  clear() {
    this.num_quads = 0;
    this.dirty = true;
  }

  allocateQuads(n: int) {
    this.num_quads = n;
    const length = this.quads.length;
    const needed = Geometry.StrideInInt32 * n;
    if (length >= needed) return;
    const expanded = new Int32Array(Math.max(length * 2, needed));
    expanded.set(this.quads);
    this.quads = expanded;
  }

  getBounds(): Float64Array {
    if (this.dirty) this.computeBounds();
    return this.bounds;
  }

  private computeBounds() {
    if (!this.dirty) return this.bounds;
    const {bounds, lower_bound, upper_bound} = this;
    Vec3.set(lower_bound, Infinity, Infinity, Infinity);
    Vec3.set(upper_bound, -Infinity, -Infinity, -Infinity);

    const quads = this.quads;
    const stride = Geometry.StrideInInt32;
    assert(quads.length % stride === 0);

    for (let i = 0; i < quads.length; i += stride) {
      const xy = quads[i + 0];
      const zi = quads[i + 1];
      const lx = (xy << 16) >> 16;
      const ly = xy >> 16;
      const lz = (zi << 16) >> 16;

      const wh = quads[i + 2];
      const w  = (wh << 16) >> 16;
      const h  = wh >> 16;

      const extra = quads[i + 3];
      const dim   = (extra >> 28) & 0x3;

      const mx = lx + (dim === 2 ? w : dim === 1 ? h : 0);
      const my = ly + (dim === 0 ? w : dim === 2 ? h : 0);
      const mz = lz + (dim === 1 ? w : dim === 0 ? h : 0);

      if (lower_bound[0] > lx) lower_bound[0] = lx;
      if (lower_bound[1] > ly) lower_bound[1] = ly;
      if (lower_bound[2] > lz) lower_bound[2] = lz;
      if (upper_bound[0] < mx) upper_bound[0] = mx;
      if (upper_bound[1] < my) upper_bound[1] = my;
      if (upper_bound[2] < mz) upper_bound[2] = mz;
    }
    lower_bound[1] -= 1; // because of the vertical "wave" shift

    for (let i = 0; i < 8; i++) {
      const offset = 3 * i;
      for (let j = 0; j < 3; j++) {
        bounds[offset + j] = (i & (1 << j)) ? upper_bound[j] : lower_bound[j];
      }
    }
    this.dirty = false;
  }

  static clone(geo: Geometry): Geometry {
    const num_quads = geo.num_quads;
    const quads = geo.quads.slice(0, num_quads * Geometry.StrideInInt32);
    return new Geometry(quads, num_quads);
  }

  static clone_raw(geo: Geometry): Geometry {
    const num_quads = geo.num_quads;
    const quads = geo.quads.slice(0, num_quads * Geometry.StrideInInt32);
    return new Geometry(quads, num_quads);
  }

  static empty(): Geometry {
    return new Geometry(new Int32Array(), 0);
  }
};
