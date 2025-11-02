import {int, Color} from '../base.js';

/**
 * Rendering types - shared interfaces for textures and sprites
 * Original location: renderer.ts lines 249-461
 *
 * Common types used across the rendering system.
 */

export interface Texture {
  alphaTest: boolean,
  color: Color,
  sparkle: boolean,
  url: string,
  x: int,
  y: int,
  w: int,
  h: int,
};

export interface Sprite {
  url: string,
  x: int,
  y: int,
};
