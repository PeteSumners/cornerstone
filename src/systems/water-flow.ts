import {int} from '../base.js';
import {BlockId, kEmptyBlock} from '../engine.js';

/**
 * Water Flow System - water simulation and propagation
 * Original location: main.ts lines 25-112
 *
 * Simulates water flowing to adjacent empty spaces.
 */

type Point = [int, int, int];

const kWaterDelay = 200;
const kWaterDisplacements = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [-1, 0, 0],
  [0, 0, -1],
];

const hasWaterNeighbor = (env: any, water: BlockId, p: Point) => {
  for (const d of kWaterDisplacements) {
    const x = int(d[0] + p[0]), y = int(d[1] + p[1]), z = int(d[2] + p[2]);
    const block = env.getBlock(x, y, z);
    if (block === water) return true;
  }
  return false;
};

export const flowWater = (env: any, water: BlockId, points: Point[]) => {
  const next: Point[] = [];
  const visited: Set<string> = new Set();

  for (const p of points) {
    const block = env.getBlock(p[0], p[1], p[2]);
    if (block !== kEmptyBlock || !hasWaterNeighbor(env, water, p)) continue;
    env.setBlock(p[0], p[1], p[2], water);
    for (const d of kWaterDisplacements) {
      const n: Point = [int(p[0] - d[0]), int(p[1] - d[1]), int(p[2] - d[2])];
      const key = `${n[0]},${n[1]},${n[2]}`;
      if (visited.has(key)) continue;
      visited.add(key);
      next.push(n);
    }
  }

  if (next.length === 0) return;
  setTimeout(() => flowWater(env, water, next), kWaterDelay);
};
