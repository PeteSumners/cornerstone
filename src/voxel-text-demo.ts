/**
 * Voxel Text Demo
 *
 * Demonstrates how to use VoxelText to render 3D text.
 *
 * Run this after generating a font atlas:
 *   cd tools/fonts
 *   python generate_atlas.py --font NotoSansMono.ttf --size 16 --style solid
 */

import { VoxelText } from './voxel-text';

async function demo() {
  console.log('=== Voxel Text Demo ===\n');

  // Initialize voxel text renderer
  const voxelText = new VoxelText(
    'assets/fonts/pixelated/atlas.png',
    'assets/fonts/pixelated/atlas.json'
  );

  await voxelText.init();

  // Example 1: Simple text
  console.log('Example 1: Simple text');
  const voxels1 = voxelText.textToVoxels('Hello', {
    scale: 1,
    depth: 1,
    color: [255, 255, 255]
  });
  console.log(`  Generated ${voxels1.length} voxels`);

  // Example 2: Scaled text
  console.log('\nExample 2: Scaled text (2×)');
  const voxels2 = voxelText.textToVoxels('WAVE', {
    scale: 2,  // Each pixel becomes 2×2 voxels
    depth: 3,  // 3 voxels deep
    color: [100, 200, 255]  // Light blue
  });
  console.log(`  Generated ${voxels2.length} voxels`);

  // Example 3: Multi-line text
  console.log('\nExample 3: Multi-line text');
  const voxels3 = voxelText.textToVoxels('In the\nbeginning', {
    scale: 1,
    lineHeight: 2,  // 2px spacing between lines
    color: [255, 200, 100]  // Orange
  });
  console.log(`  Generated ${voxels3.length} voxels`);

  // Example 4: Spaced text
  console.log('\nExample 4: Spaced text');
  const voxels4 = voxelText.textToVoxels('S P A C E D', {
    scale: 1,
    spacing: 4,  // 4px extra between characters
    color: [100, 255, 100]  // Green
  });
  console.log(`  Generated ${voxels4.length} voxels`);

  // Example 5: Get bounding box
  console.log('\nExample 5: Bounding box');
  const bounds = voxelText.getTextBounds('Hello, World!', { scale: 2 });
  console.log(`  Dimensions: ${bounds.width}×${bounds.height}×${bounds.depth} voxels`);

  // Example 6: Bible verse
  console.log('\nExample 6: Bible verse');
  const verse = 'In the beginning\nGod created the\nheaven and the earth';
  const voxels6 = voxelText.textToVoxels(verse, {
    scale: 1,
    depth: 2,
    lineHeight: 4,
    color: [255, 215, 0]  // Gold
  });
  console.log(`  Generated ${voxels6.length} voxels for Genesis 1:1`);

  console.log('\n=== Demo Complete ===');

  return {
    simple: voxels1,
    scaled: voxels2,
    multiline: voxels3,
    spaced: voxels4,
    verse: voxels6
  };
}

// Integration example with Wave engine
export function integrateWithWave() {
  /*
  In your main.ts or wherever you initialize the game:

  import { VoxelText } from './voxel-text';

  // Initialize
  const voxelText = new VoxelText(
    'assets/fonts/pixelated/atlas.png',
    'assets/fonts/pixelated/atlas.json'
  );
  await voxelText.init();

  // Render a sign
  const signVoxels = voxelText.textToVoxels('WELCOME', {
    scale: 2,
    depth: 1,
    color: [255, 255, 255]
  });

  // Add voxels to world
  // (You'll need to integrate with your voxel world/chunk system)
  for (const voxel of signVoxels) {
    world.setVoxel(
      worldX + voxel.x,
      worldY + voxel.y,
      worldZ + voxel.z,
      VOXEL_TYPE_TEXT,
      voxel.color
    );
  }

  // Or create a separate mesh for text (better performance)
  const textMesh = createMeshFromVoxels(signVoxels);
  scene.add(textMesh);
  */
}

// Export demo function
export { demo };

// Run demo if executed directly
if (typeof window !== 'undefined' && window.location.pathname.includes('voxel-text-demo')) {
  demo().then(results => {
    console.log('Demo results:', results);
  });
}
