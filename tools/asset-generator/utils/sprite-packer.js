/**
 * Sprite Sheet Packer
 *
 * Combines multiple individual sprites/textures into a single texture atlas
 * Optimizes for GPU texture uploads and reduces draw calls
 */

class SpritePacker {
  constructor() {
    this.sprites = [];
    this.padding = 1; // Padding between sprites to prevent bleeding
  }

  // Add a sprite to the packer
  addSprite(name, canvas) {
    this.sprites.push({
      name,
      canvas,
      width: canvas.width,
      height: canvas.height
    });
  }

  // Pack sprites using simple row packing algorithm
  pack(maxWidth = 1024) {
    if (this.sprites.length === 0) {
      throw new Error('No sprites to pack');
    }

    // Sort by height (tallest first) for better packing
    const sorted = [...this.sprites].sort((a, b) => b.height - a.height);

    // Calculate positions
    let currentX = this.padding;
    let currentY = this.padding;
    let rowHeight = 0;
    let totalHeight = 0;

    const positions = [];

    sorted.forEach((sprite, i) => {
      // Check if sprite fits in current row
      if (currentX + sprite.width + this.padding > maxWidth && currentX > this.padding) {
        // Move to next row
        currentX = this.padding;
        currentY += rowHeight + this.padding;
        rowHeight = 0;
      }

      // Record position
      positions.push({
        ...sprite,
        x: currentX,
        y: currentY
      });

      // Update trackers
      currentX += sprite.width + this.padding;
      rowHeight = Math.max(rowHeight, sprite.height);
      totalHeight = Math.max(totalHeight, currentY + sprite.height + this.padding);
    });

    // Create packed canvas
    const packedWidth = maxWidth;
    const packedHeight = totalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = packedWidth;
    canvas.height = packedHeight;
    const ctx = canvas.getContext('2d');

    // Clear to transparent
    ctx.clearRect(0, 0, packedWidth, packedHeight);

    // Draw sprites
    const metadata = {};
    positions.forEach(pos => {
      ctx.drawImage(pos.canvas, pos.x, pos.y);

      // Store metadata for UV mapping
      metadata[pos.name] = {
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
        // Normalized UV coordinates (0-1)
        u: pos.x / packedWidth,
        v: pos.y / packedHeight,
        uWidth: pos.width / packedWidth,
        vHeight: pos.height / packedHeight
      };
    });

    return {
      canvas,
      width: packedWidth,
      height: packedHeight,
      metadata
    };
  }

  // Pack sprites into a power-of-2 texture (better for GPUs)
  packPowerOfTwo() {
    // First pack normally
    const result = this.pack(2048);

    // Find next power of 2 dimensions
    const width = this.nextPowerOfTwo(result.width);
    const height = this.nextPowerOfTwo(result.height);

    if (width === result.width && height === result.height) {
      return result;
    }

    // Create new canvas with power-of-2 dimensions
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(result.canvas, 0, 0);

    // Update metadata UV coordinates
    const metadata = {};
    Object.entries(result.metadata).forEach(([name, data]) => {
      metadata[name] = {
        ...data,
        u: data.x / width,
        v: data.y / height,
        uWidth: data.width / width,
        vHeight: data.height / height
      };
    });

    return {
      canvas,
      width,
      height,
      metadata
    };
  }

  nextPowerOfTwo(n) {
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }

  // Export metadata as JSON
  exportMetadata(metadata, format = 'json') {
    if (format === 'json') {
      return JSON.stringify(metadata, null, 2);
    } else if (format === 'compact') {
      return JSON.stringify(metadata);
    }
  }

  // Clear all sprites
  clear() {
    this.sprites = [];
  }
}

// Texture Atlas Manager for game integration
class TextureAtlas {
  constructor(canvas, metadata) {
    this.canvas = canvas;
    this.metadata = metadata;
  }

  // Get sprite info by name
  getSprite(name) {
    return this.metadata[name];
  }

  // Get all sprite names
  getSpriteNames() {
    return Object.keys(this.metadata);
  }

  // Get UV coordinates for a sprite (for WebGL)
  getUVs(name) {
    const sprite = this.metadata[name];
    if (!sprite) return null;

    return {
      u0: sprite.u,
      v0: sprite.v,
      u1: sprite.u + sprite.uWidth,
      v1: sprite.v + sprite.vHeight
    };
  }

  // Draw a sprite from the atlas to a canvas
  drawSprite(ctx, name, x, y, scale = 1) {
    const sprite = this.metadata[name];
    if (!sprite) {
      console.warn(`Sprite "${name}" not found in atlas`);
      return;
    }

    ctx.drawImage(
      this.canvas,
      sprite.x, sprite.y, sprite.width, sprite.height,
      x, y, sprite.width * scale, sprite.height * scale
    );
  }

  // Export as PNG data URL
  toDataURL() {
    return this.canvas.toDataURL('image/png');
  }
}

// Helper function to create atlas from multiple canvases
function createTextureAtlas(sprites, options = {}) {
  const {
    maxWidth = 1024,
    powerOfTwo = true,
    padding = 1
  } = options;

  const packer = new SpritePacker();
  packer.padding = padding;

  // Add all sprites
  Object.entries(sprites).forEach(([name, canvas]) => {
    packer.addSprite(name, canvas);
  });

  // Pack
  const result = powerOfTwo ? packer.packPowerOfTwo() : packer.pack(maxWidth);

  return new TextureAtlas(result.canvas, result.metadata);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SpritePacker, TextureAtlas, createTextureAtlas };
}
