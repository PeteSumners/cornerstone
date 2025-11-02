import {int} from '../base.js';
import {Component} from '../ecs.js';
import {EntityId, kNoEntity} from '../ecs.js';

/**
 * Position component - entity location and dimensions
 * Original location: main.ts lines 130-142
 *
 * An entity with a position is an axis-aligned bounding box (AABB) centered
 * at (x, y, z), with x- and z-extents equal to w and y-extent equal to h.
 */

export interface PositionState {
  id: EntityId,
  index: int,
  x: number,
  y: number,
  z: number,
  h: number,
  w: number,
};

export const Position: Component<PositionState> = {
  init: () => ({id: kNoEntity, index: 0, x: 0, y: 0, z: 0, h: 0, w: 0}),
};
