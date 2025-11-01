/**
 * Text Integration Demo
 *
 * Shows how to integrate voxel text rendering into Wave's main.ts
 *
 * This file demonstrates the integration pattern.
 * Copy relevant parts into your main.ts.
 */

import { int } from './base.js';
import { BlockId, Env } from './engine.js';
import { TextWorld, BibleVerseDisplay, SignBuilder } from './text-integration.js';

/**
 * Example integration into main.ts
 *
 * Add this to your main() function in main.ts:
 */
export async function integrateTextRendering(env: Env, blocks: { [key: string]: BlockId }) {
  console.log('\n=== Setting up Text Rendering ===\n');

  // Step 1: Create a block type for text
  // You can use an existing block (like dirt) or create a new one
  const textBlockId = blocks.stone; // Or create a dedicated text block

  // Step 2: Initialize TextWorld
  const textWorld = new TextWorld(env, {
    atlasPath: 'assets/fonts/default/atlas.png',
    metadataPath: 'assets/fonts/default/atlas.json',
  });

  await textWorld.init(textBlockId);

  // Step 3: Create helper utilities
  const verseDisplay = new BibleVerseDisplay(textWorld);
  const signBuilder = new SignBuilder(textWorld);

  console.log('✓ Text rendering ready!\n');

  // Return for use elsewhere
  return { textWorld, verseDisplay, signBuilder };
}

/**
 * Example 1: Simple text placement
 */
export function example1_simpleText(textWorld: TextWorld) {
  // Place "HELLO" at position (10, 10, 10)
  textWorld.placeText('HELLO', 10, 10, 10, {
    scale: 2,
    depth: 1,
  });
}

/**
 * Example 2: Multi-line text
 */
export function example2_multiLine(textWorld: TextWorld) {
  const text = 'In the\nbeginning\nGod created';

  textWorld.placeText(text, 20, 10, 20, {
    scale: 1,
    depth: 2,
    lineHeight: 2,
  });
}

/**
 * Example 3: Bible verse monument
 */
export function example3_bibleVerse(verseDisplay: BibleVerseDisplay) {
  verseDisplay.displayVerse(
    'Genesis 1:1',
    'In the beginning God created the heaven and the earth',
    50, 10, 50
  );
}

/**
 * Example 4: Sign
 */
export function example4_sign(
  signBuilder: SignBuilder,
  env: Env,
  blocks: { [key: string]: BlockId }
) {
  signBuilder.createSign(
    'WELCOME',
    100, 10, 100,
    env,
    blocks.dirt // Sign backing block
  );
}

/**
 * Example 5: Centered text
 */
export function example5_centered(textWorld: TextWorld) {
  textWorld.placeTextCentered(
    'CENTER',
    150, 20, 150,
    { scale: 3, depth: 2 }
  );
}

/**
 * Example 6: Ground-level text
 */
export function example6_onGround(textWorld: TextWorld) {
  // Automatically places text on top of terrain
  textWorld.placeTextOnGround(
    'PATH',
    200, 200,
    { scale: 1, depth: 1 }
  );
}

/**
 * Complete integration example for main.ts
 */
export async function completeIntegrationExample() {
  /*

  // ========================================
  // Add to your main.ts, after blocks are defined:
  // ========================================

  import { TextWorld, BibleVerseDisplay, SignBuilder } from './text-integration.js';

  const main = async () => {
    const env = new TypedEnv('container');

    // ... existing player/follower setup ...

    // Define blocks (your existing code)
    const blocks = {
      bedrock: registry.addBlock(['bedrock'], true),
      dirt:    registry.addBlock(['dirt'], true),
      grass:   registry.addBlock(['grass', 'dirt', 'grass-side'], true),
      stone:   registry.addBlock(['stone'], true),
      // ... other blocks ...
    };

    env.blocks = blocks;

    // ==================== NEW: TEXT RENDERING ====================

    // Initialize text system
    const textWorld = new TextWorld(env, {
      atlasPath: 'assets/fonts/default/atlas.png',
      metadataPath: 'assets/fonts/default/atlas.json',
    });
    await textWorld.init(blocks.stone); // Use stone blocks for text

    // Create Bible verse display
    const verseDisplay = new BibleVerseDisplay(textWorld);

    // Display Genesis 1:1
    verseDisplay.displayVerse(
      'Genesis 1:1',
      'In the beginning God created the heaven and the earth',
      10, 10, 10
    );

    // Create a welcome sign
    const signBuilder = new SignBuilder(textWorld);
    signBuilder.createSign(
      'WELCOME',
      50, 10, 50,
      env,
      blocks.dirt
    );

    // Place player name at spawn
    const playerPos = env.position.getX(player);
    textWorld.placeTextOnGround(
      'SPAWN',
      int(playerPos.x), int(playerPos.z),
      { scale: 2, depth: 1 }
    );

    // ==================== END TEXT RENDERING ====================

    env.refresh();
  };

  init(main);

  */
}

/**
 * Input handling example: Place text on key press
 */
export function handleTextPlacementInput(
  env: Env,
  textWorld: TextWorld,
  playerPosition: { x: number; y: number; z: number }
) {
  /*

  // Add to your input handling code:

  // In your Inputs component or wherever you handle keys:
  if (inputs.someKey) { // Choose your key binding
    const { x, y, z } = playerPosition;

    // Place text in front of player
    textWorld.placeText(
      'MARKER',
      int(x + 5), // 5 blocks in front
      int(y),
      int(z),
      { scale: 1, depth: 1 }
    );
  }

  */
}

/**
 * Dynamic text update example
 */
export class DynamicTextDisplay {
  private textWorld: TextWorld;
  private currentText: string = '';
  private x: number;
  private y: number;
  private z: number;

  constructor(textWorld: TextWorld, x: number, y: number, z: number) {
    this.textWorld = textWorld;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Update displayed text (clears old, places new)
   */
  updateText(newText: string): void {
    // Clear old text
    if (this.currentText) {
      this.textWorld.clearText(
        this.currentText,
        this.x, this.y, this.z,
        { scale: 1, depth: 1 }
      );
    }

    // Place new text
    this.textWorld.placeText(
      newText,
      this.x, this.y, this.z,
      { scale: 1, depth: 1 }
    );

    this.currentText = newText;
  }
}

/**
 * Example: Score display
 */
export function exampleScoreDisplay(textWorld: TextWorld) {
  const scoreDisplay = new DynamicTextDisplay(textWorld, 0, 50, 0);

  let score = 0;

  // Update score periodically
  setInterval(() => {
    score++;
    scoreDisplay.updateText(`SCORE: ${score}`);
  }, 1000);
}

// Export examples
export const examples = {
  simpleText: example1_simpleText,
  multiLine: example2_multiLine,
  bibleVerse: example3_bibleVerse,
  sign: example4_sign,
  centered: example5_centered,
  onGround: example6_onGround,
};
