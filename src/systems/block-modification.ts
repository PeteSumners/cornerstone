import {int, Vec3} from '../base.js';
import {BlockId, kEmptyBlock} from '../engine.js';
import {generateParticles} from './particle-system.js';
import {flowWater} from './water-flow.js';

/**
 * Block Modification System - block placement and destruction
 * Original location: main.ts lines 514-565
 *
 * Handles player interactions with blocks (placing/breaking).
 */

const kWaterDelay = 200;
const kTmpPos = Vec3.create();

export const modifyBlock = (env: any, x: int, y: int, z: int,
                             block: BlockId, side: int): void => {
  const old_block = env.getBlock(x, y, z);
  env.setBlock(x, y, z, block);
  const new_block = env.getBlock(x, y, z);

  if (env.blocks) {
    const water = env.blocks.water;
    setTimeout(() => flowWater(env, water, [[x, y, z]]), kWaterDelay);
  }

  if (old_block !== kEmptyBlock && old_block !== new_block &&
      !(env.blocks && old_block === env.blocks.water)) {
    generateParticles(env, old_block, x, y, z, side);
  }
};

export const tryToModifyBlock =
    (env: any, body: any, add: boolean) => {
  const target = env.getTargetedBlock();
  if (target === null) return;

  const side = env.getTargetedBlockSide();
  Vec3.copy(kTmpPos, target);

  if (add) {
    kTmpPos[side >> 1] += (side & 1) ? -1 : 1;
    const intersect = env.movement.some((state: any) => {
      const body = env.physics.get(state.id);
      if (!body) return false;
      const {max, min} = body;
      for (let i = 0; i < 3; i++) {
        const pos = kTmpPos[i];
        if (pos < max[i] && min[i] < pos + 1) continue;
        return false;
      }
      return true;
    });
    if (intersect) return;
  }

  const x = int(kTmpPos[0]), y = int(kTmpPos[1]), z = int(kTmpPos[2]);
  const block = add && env.blocks ? env.blocks.dirt : kEmptyBlock;
  modifyBlock(env, x, y, z, block, side);

  if (block === kEmptyBlock) {
    for (let dy = 1; dy < 8; dy++) {
      const above = env.getBlock(x, int(y + dy), z);
      if (env.registry.getBlockMesh(above) === null) break;
      modifyBlock(env, x, int(y + dy), z, block, side);
    }
  }
};
