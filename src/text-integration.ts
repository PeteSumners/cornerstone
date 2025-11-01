/**
 * Text Integration Module
 *
 * Integrates VoxelText with Wave's world system.
 * Renders text strings as actual 3D voxel geometry in the world.
 *
 * Usage:
 *   const textWorld = new TextWorld(env);
 *   await textWorld.init();
 *   textWorld.placeText("HELLO", 10, 5, 10);
 *
 * @author Claude Code
 * @license MIT
 */

import { int } from './base.js';
import { BlockId, Env, kEmptyBlock } from './engine.js';
import { VoxelText, Voxel, TextOptions } from './voxel-text.js';

export interface TextWorldOptions {
  atlasPath?: string;
  metadataPath?: string;
  textBlockId?: BlockId;
}

/**
 * TextWorld handles rendering text in the voxel world
 */
export class TextWorld {
  private env: Env;
  private voxelText: VoxelText | null = null;
  private textBlockId: BlockId;
  private atlasPath: string;
  private metadataPath: string;

  constructor(env: Env, options: TextWorldOptions = {}) {
    this.env = env;
    this.atlasPath = options.atlasPath ?? 'assets/fonts/default/atlas.png';
    this.metadataPath = options.metadataPath ?? 'assets/fonts/default/atlas.json';
    this.textBlockId = options.textBlockId ?? kEmptyBlock; // Will be set properly after init
  }

  /**
   * Initialize the text system
   * Must be called before placing text
   */
  async init(textBlockId: BlockId): Promise<void> {
    this.textBlockId = textBlockId;

    this.voxelText = new VoxelText(this.atlasPath, this.metadataPath);
    await this.voxelText.init();

    console.log('[TextWorld] Initialized');
    console.log(`  Text block ID: ${this.textBlockId}`);
  }

  /**
   * Place text in the world at (worldX, worldY, worldZ)
   *
   * @param text - Text string to render (supports \n for newlines)
   * @param worldX - World X coordinate (anchor point)
   * @param worldY - World Y coordinate (anchor point)
   * @param worldZ - World Z coordinate (anchor point)
   * @param options - Rendering options
   * @returns Number of voxels placed
   */
  placeText(
    text: string,
    worldX: number,
    worldY: number,
    worldZ: number,
    options: TextOptions = {}
  ): number {
    if (!this.voxelText) {
      throw new Error('TextWorld not initialized. Call init() first.');
    }

    // Generate voxel data from text
    const voxels = this.voxelText.textToVoxels(text, options);

    // Place each voxel in the world
    for (const voxel of voxels) {
      const x = int(worldX + voxel.x);
      const y = int(worldY + voxel.y);
      const z = int(worldZ + voxel.z);

      this.env.setBlock(x, y, z, this.textBlockId);
    }

    console.log(`[TextWorld] Placed "${text.substring(0, 20)}..." (${voxels.length} voxels)`);

    return voxels.length;
  }

  /**
   * Clear text by setting blocks back to empty
   *
   * @param text - Original text string (to calculate bounds)
   * @param worldX - World X coordinate (anchor point)
   * @param worldY - World Y coordinate (anchor point)
   * @param worldZ - World Z coordinate (anchor point)
   * @param options - Same options used when placing
   * @param emptyBlockId - Block ID for empty space (default: 0)
   */
  clearText(
    text: string,
    worldX: number,
    worldY: number,
    worldZ: number,
    options: TextOptions = {},
    emptyBlockId: BlockId = kEmptyBlock
  ): void {
    if (!this.voxelText) {
      throw new Error('TextWorld not initialized. Call init() first.');
    }

    const voxels = this.voxelText.textToVoxels(text, options);

    for (const voxel of voxels) {
      const x = int(worldX + voxel.x);
      const y = int(worldY + voxel.y);
      const z = int(worldZ + voxel.z);

      this.env.setBlock(x, y, z, emptyBlockId);
    }
  }

  /**
   * Get text bounding box (useful for positioning)
   */
  getTextBounds(text: string, options: TextOptions = {}) {
    if (!this.voxelText) {
      throw new Error('TextWorld not initialized. Call init() first.');
    }

    return this.voxelText.getTextBounds(text, options);
  }

  /**
   * Helper: Center text at position
   */
  placeTextCentered(
    text: string,
    centerX: number,
    centerY: number,
    centerZ: number,
    options: TextOptions = {}
  ): number {
    const bounds = this.getTextBounds(text, options);

    const offsetX = centerX - bounds.width / 2;
    const offsetY = centerY - bounds.height / 2;
    const offsetZ = centerZ - bounds.depth / 2;

    return this.placeText(text, offsetX, offsetY, offsetZ, options);
  }

  /**
   * Helper: Place text on ground at height
   */
  placeTextOnGround(
    text: string,
    worldX: number,
    worldZ: number,
    options: TextOptions = {}
  ): number {
    // Find ground height at this position
    const groundY = this.env.getBaseHeight(int(worldX), int(worldZ));

    return this.placeText(text, worldX, groundY + 1, worldZ, options);
  }
}

/**
 * Example: Bible verse display
 */
export class BibleVerseDisplay {
  private textWorld: TextWorld;

  constructor(textWorld: TextWorld) {
    this.textWorld = textWorld;
  }

  /**
   * Display a Bible verse as voxel text
   *
   * @param reference - Verse reference (e.g., "Genesis 1:1")
   * @param text - Verse text
   * @param x - World X
   * @param y - World Y
   * @param z - World Z
   */
  displayVerse(
    reference: string,
    text: string,
    x: number,
    y: number,
    z: number
  ): void {
    // Display reference (smaller)
    this.textWorld.placeText(reference, x, y + 20, z, {
      scale: 1,
      depth: 1,
    });

    // Display verse text (larger, word-wrapped)
    const wrappedText = this.wrapText(text, 30); // 30 chars per line
    this.textWorld.placeText(wrappedText, x, y, z, {
      scale: 2,
      depth: 2,
      lineHeight: 4,
    });
  }

  /**
   * Simple word wrapping
   */
  private wrapText(text: string, maxLength: number): string {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length > maxLength) {
        if (currentLine) lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }

    if (currentLine) lines.push(currentLine.trim());

    return lines.join('\n');
  }
}

/**
 * Example: Sign builder
 */
export class SignBuilder {
  private textWorld: TextWorld;

  constructor(textWorld: TextWorld) {
    this.textWorld = textWorld;
  }

  /**
   * Create a simple sign with text
   *
   * @param text - Sign text
   * @param x - World X
   * @param y - World Y
   * @param z - World Z
   * @param signBlockId - Block ID for sign backing
   */
  createSign(
    text: string,
    x: number,
    y: number,
    z: number,
    env: Env,
    signBlockId: BlockId
  ): void {
    const bounds = this.textWorld.getTextBounds(text, { scale: 1 });

    // Build sign backing (simple rectangle)
    const padding = 2;
    const backingWidth = bounds.width + padding * 2;
    const backingHeight = bounds.height + padding * 2;

    for (let dy = 0; dy < backingHeight; dy++) {
      for (let dx = 0; dx < backingWidth; dx++) {
        env.setBlock(
          int(x + dx - padding),
          int(y + dy - padding),
          int(z - 1), // Behind text
          signBlockId
        );
      }
    }

    // Place text on top
    this.textWorld.placeText(text, x, y, z, {
      scale: 1,
      depth: 1,
    });
  }
}
