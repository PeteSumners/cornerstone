import {int} from '../base.js';
import {BlockId, kNoMaterial} from '../engine.js';

/**
 * Particle System - block destruction particle effects
 * Original location: main.ts lines 22-23, 457-512
 *
 * Generates particle effects when blocks are destroyed.
 */

const kNumParticles = 16;
const kMaxNumParticles = 64;

export const generateParticles =
    (env: any, block: BlockId, x: int, y: int, z: int, side: int) => {
  const texture = (() => {
    const mesh = env.registry.getBlockMesh(block);
    if (mesh) {
      const {frame, sprite: {url, x: w, y: h}} = mesh;
      const x = frame % w, y = Math.floor(frame / w);
      return {alphaTest: true, sparkle: false, url, x, y, w, h};
    }
    const adjusted = side === 2 || side === 3 ? 0 : side;
    const material = env.registry.getBlockFaceMaterial(block, adjusted);
    if (material === kNoMaterial) return;
    return env.registry.getMaterialData(material).texture;
  })();
  if (!texture) return;

  const count = Math.min(kNumParticles, kMaxNumParticles - env.particles);
  env.particles += count;

  for (let i = 0; i < count; i++) {
    const particle = env.entities.addEntity();
    const position = env.position.add(particle);

    const size = Math.floor(3 * Math.random() + 1) / 16;
    position.x = x + (1 - size) * Math.random() + size / 2;
    position.y = y + (1 - size) * Math.random() + size / 2;
    position.z = z + (1 - size) * Math.random() + size / 2;
    position.w = position.h = size;

    const kParticleSpeed = 8;
    const body = env.physics.add(particle);
    body.impulses[0] = kParticleSpeed * (Math.random() - 0.5);
    body.impulses[1] = kParticleSpeed * Math.random();
    body.impulses[2] = kParticleSpeed * (Math.random() - 0.5);
    body.friction = 10;
    body.restitution = 0.5;

    const mesh = env.meshes.add(particle);
    const sprite = {url: texture.url, x: texture.w, y: texture.h};
    mesh.mesh = env.renderer.addSpriteMesh(size, sprite);
    mesh.mesh.setFrame(int(texture.x + texture.y * texture.w));

    const epsilon = 0.01;
    const s = Math.floor(16 * (1 - size) * Math.random()) / 16;
    const t = Math.floor(16 * (1 - size) * Math.random()) / 16;
    const uv = size - 2 * epsilon;
    mesh.mesh.setSTUV(s + epsilon, t + epsilon, uv, uv);

    const lifetime = env.lifetime.add(particle);
    lifetime.lifetime = 1.0 * Math.random() + 0.5;
    lifetime.cleanup = () => {
      env.entities.removeEntity(particle);
      env.particles--;
    };
  }
};
