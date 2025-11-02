import {int} from '../base.js';
import {Mat4, Vec3} from '../base.js';

/**
 * Camera system - viewport, projection, and view transformations
 * Original location: renderer.ts lines 6-151
 *
 * Handles camera position, rotation, zoom, and view/projection matrices.
 */

export interface CullingPlane {
  x: number;
  y: number;
  z: number;
  index: int;
};

const kTmpDelta = Vec3.create();
const kTmpPlane = Vec3.create();

export class Camera {
  heading = 0; // In radians: [0, 2π)
  pitch = 0;   // In radians: (-π/2, π/2)
  zoom = 0;
  safe_zoom = 0;
  direction: Vec3;
  position: Vec3;
  target: Vec3;

  // Used to smooth out mouse inputs.
  private last_dx: number;
  private last_dy: number;

  // transform = projection * view is the overall model-view-projection.
  private planes: CullingPlane[];
  private transform_for: Mat4;
  private transform: Mat4;
  private projection: Mat4;
  private view: Mat4;

  // The min-Z (in camera space) at which we render meshes. A low value of
  // min-Z results in more detail nearby but causes z-fighting far away.
  private aspect: number;
  private minZ: number;

  constructor(width: int, height: int) {
    this.direction = Vec3.from(0, 0, 1);
    this.position = Vec3.create();
    this.target = Vec3.create();

    this.last_dx = 0;
    this.last_dy = 0;

    this.transform_for = Mat4.create();
    this.transform = Mat4.create();
    this.projection = Mat4.create();
    this.view = Mat4.create();

    this.aspect = height ? width / height : 1;
    this.minZ = 0;
    this.setMinZ(0.1);

    this.planes = Array(4).fill(null);
    for (let i = 0; i < 4; i++) this.planes[i] = {x: 0, y: 0, z: 0, index: 0};
  }

  applyInputs(dx: number, dy: number, dscroll: number) {
    // Smooth out large mouse-move inputs.
    const jerkx = Math.abs(dx) > 400 && Math.abs(dx / (this.last_dx || 1)) > 4;
    const jerky = Math.abs(dy) > 400 && Math.abs(dy / (this.last_dy || 1)) > 4;
    if (jerkx || jerky) {
      const saved_x = this.last_dx;
      const saved_y = this.last_dy;
      this.last_dx = (dx + this.last_dx) / 2;
      this.last_dy = (dy + this.last_dy) / 2;
      dx = saved_x;
      dy = saved_y;
    } else {
      this.last_dx = dx;
      this.last_dy = dy;
    }

    let pitch = this.pitch;
    let heading = this.heading;

    // Overwatch uses the same constant values to do this conversion.
    const conversion = 0.066 * Math.PI / 180;
    dx = dx * conversion;
    dy = dy * conversion;

    heading += dx;
    const T = 2 * Math.PI;
    while (this.heading < 0) this.heading += T;
    while (this.heading > T) this.heading -= T;

    const U = Math.PI / 2 - 0.01;
    this.pitch = Math.max(-U, Math.min(U, this.pitch + dy));
    this.heading = heading;

    const dir = this.direction;
    Vec3.set(dir, 0, 0, 1);
    Vec3.rotateX(dir, dir, this.pitch);
    Vec3.rotateY(dir, dir, this.heading);

    // Scrolling is trivial to apply: add and clamp.
    if (dscroll === 0) return;
    this.zoom = Math.max(0, Math.min(15, this.zoom + Math.sign(dscroll)));
  }

  getCullingPlanes(): CullingPlane[] {
    const {heading, pitch, planes, projection} = this;
    for (let i = 0; i < 4; i++) {
      const a = i < 2 ? (1 - ((i & 1) << 1)) * projection[0] : 0;
      const b = i > 1 ? (1 - ((i & 1) << 1)) * projection[5] : 0;
      Vec3.set(kTmpPlane, a, b, 1);
      Vec3.rotateX(kTmpPlane, kTmpPlane, pitch);
      Vec3.rotateY(kTmpPlane, kTmpPlane, heading);

      const [x, y, z] = kTmpPlane;
      const plane = planes[i];
      plane.x = x; plane.y = y; plane.z = z;
      plane.index = int((x > 0 ? 1 : 0) | (y > 0 ? 2 : 0) | (z > 0 ? 4 : 0));
    }
    return planes;
  }

  getTransform(): Mat4 {
    Mat4.view(this.view, this.position, this.direction);
    Mat4.multiply(this.transform, this.projection, this.view);
    return this.transform;
  }

  getTransformFor(offset: Vec3): Mat4 {
    Vec3.sub(kTmpDelta, this.position, offset);
    Mat4.view(this.view, kTmpDelta, this.direction);
    Mat4.multiply(this.transform_for, this.projection, this.view);
    return this.transform_for;
  }

  setMinZ(minZ: number) {
    if (minZ === this.minZ) return;
    Mat4.perspective(this.projection, 3 * Math.PI / 8, this.aspect, minZ);
    this.minZ = minZ;
  }

  setSafeZoomDistance(bump: number, zoom: number) {
    zoom = Math.max(Math.min(zoom, this.zoom), 0);
    Vec3.scaleAndAdd(this.position, this.target, this.direction, -zoom);
    this.position[1] += bump;
    this.safe_zoom = zoom;
  }

  setTarget(x: number, y: number, z: number) {
    Vec3.set(this.target, x, y, z);
  }
};
