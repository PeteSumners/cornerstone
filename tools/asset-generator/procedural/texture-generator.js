/**
 * Procedural Texture Generator
 *
 * Generates seamless 16x16 block textures for voxel games
 * Uses Perlin/Simplex noise for natural-looking variations
 */

class TextureGenerator {
  constructor(seed = Math.random()) {
    this.perlin = new PerlinNoise(seed);
    this.simplex = new SimplexNoise(seed);
  }

  // Generate a canvas with the texture
  generateTexture(type, size = 16) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(size, size);

    const generator = this.getGeneratorForType(type);
    generator(imageData, size);

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  getGeneratorForType(type) {
    const generators = {
      'grass': this.generateGrass.bind(this),
      'dirt': this.generateDirt.bind(this),
      'stone': this.generateStone.bind(this),
      'sand': this.generateSand.bind(this),
      'water': this.generateWater.bind(this),
      'wood': this.generateWood.bind(this),
      'leaves': this.generateLeaves.bind(this),
      'brick': this.generateBrick.bind(this),
      'cobblestone': this.generateCobblestone.bind(this),
      'gravel': this.generateGravel.bind(this),
      'ore': this.generateOre.bind(this),
      'snow': this.generateSnow.bind(this),
      'ice': this.generateIce.bind(this),
      'lava': this.generateLava.bind(this),
    };

    return generators[type] || this.generateStone.bind(this);
  }

  setPixel(imageData, x, y, color) {
    const index = (y * imageData.width + x) * 4;
    imageData.data[index] = color.r;
    imageData.data[index + 1] = color.g;
    imageData.data[index + 2] = color.b;
    imageData.data[index + 3] = 255;
  }

  generateGrass(imageData, size) {
    const palette = ColorPalette.grassTones();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const noise = this.perlin.octaveNoise(x / 4, y / 4, 0, 3, 0.5);
        const value = (noise + 1) / 2; // Normalize to 0-1

        // Add some variation
        const variation = this.simplex.noise2D(x / 2, y / 2) * 0.1;
        const finalValue = Math.max(0, Math.min(1, value + variation));

        const color = ColorPalette.getColorFromPalette(palette, finalValue);
        this.setPixel(imageData, x, y, color);
      }
    }
  }

  generateDirt(imageData, size) {
    const palette = ColorPalette.earthTones();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const noise = this.perlin.octaveNoise(x / 3, y / 3, 0, 4, 0.6);
        const value = (noise + 1) / 2;

        // Add graininess
        const grain = this.simplex.noise2D(x * 2, y * 2) * 0.15;
        const finalValue = Math.max(0, Math.min(1, value + grain));

        const color = ColorPalette.getColorFromPalette(palette, finalValue);
        this.setPixel(imageData, x, y, color);
      }
    }
  }

  generateStone(imageData, size) {
    const palette = ColorPalette.stoneTones();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const noise = this.perlin.octaveNoise(x / 5, y / 5, 0, 4, 0.5);
        const value = (noise + 1) / 2;

        // Add cracks
        const crack = Math.abs(this.simplex.noise2D(x / 2, y / 2));
        const finalValue = crack > 0.8 ? 0.2 : value;

        const color = ColorPalette.getColorFromPalette(palette, finalValue);
        this.setPixel(imageData, x, y, color);
      }
    }
  }

  generateSand(imageData, size) {
    const palette = ColorPalette.sandTones();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const noise = this.perlin.octaveNoise(x / 6, y / 6, 0, 2, 0.4);
        const value = (noise + 1) / 2;

        // Fine grain detail
        const detail = this.simplex.noise2D(x * 3, y * 3) * 0.08;
        const finalValue = Math.max(0, Math.min(1, value + detail));

        const color = ColorPalette.getColorFromPalette(palette, finalValue);
        this.setPixel(imageData, x, y, color);
      }
    }
  }

  generateWater(imageData, size) {
    const palette = ColorPalette.waterTones();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Animated water effect (static version)
        const noise = this.perlin.octaveNoise(x / 8, y / 8, 0, 2, 0.3);
        const value = (noise + 1) / 2;

        const color = ColorPalette.getColorFromPalette(palette, value);
        this.setPixel(imageData, x, y, color);
      }
    }
  }

  generateWood(imageData, size) {
    const darkBrown = { r: 101, g: 67, b: 33 };
    const lightBrown = { r: 160, g: 120, b: 80 };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Vertical wood grain
        const grain = this.perlin.octaveNoise(x / 2, y / 8, 0, 3, 0.6);
        const value = (grain + 1) / 2;

        const color = ColorPalette.lerpColor(darkBrown, lightBrown, value);
        this.setPixel(imageData, x, y, color);
      }
    }
  }

  generateLeaves(imageData, size) {
    const darkGreen = { r: 34, g: 100, b: 34 };
    const lightGreen = { r: 80, g: 160, b: 50 };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const noise = this.perlin.octaveNoise(x / 3, y / 3, 0, 4, 0.5);
        const value = (noise + 1) / 2;

        // Add leaf texture
        const leafNoise = this.simplex.noise2D(x, y);
        const finalValue = leafNoise > 0.3 ? value : value * 0.7;

        const color = ColorPalette.lerpColor(darkGreen, lightGreen, finalValue);
        this.setPixel(imageData, x, y, color);
      }
    }
  }

  generateBrick(imageData, size) {
    const mortar = { r: 200, g: 200, b: 200 };
    const darkBrick = { r: 150, g: 60, b: 40 };
    const lightBrick = { r: 180, g: 80, b: 60 };

    const brickHeight = Math.floor(size / 4);
    const brickWidth = Math.floor(size / 2);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const rowOffset = Math.floor(y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
        const adjustedX = (x + rowOffset) % size;

        const isMortar =
          (y % brickHeight === 0 || y % brickHeight === brickHeight - 1) ||
          (adjustedX % brickWidth === 0 || adjustedX % brickWidth === brickWidth - 1);

        if (isMortar) {
          this.setPixel(imageData, x, y, mortar);
        } else {
          const noise = this.perlin.noise(x / 3, y / 3);
          const value = (noise + 1) / 2;
          const color = ColorPalette.lerpColor(darkBrick, lightBrick, value);
          this.setPixel(imageData, x, y, color);
        }
      }
    }
  }

  generateCobblestone(imageData, size) {
    const palette = ColorPalette.stoneTones();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Create irregular stone pattern
        const noise1 = this.perlin.noise(x / 2, y / 2);
        const noise2 = this.simplex.noise2D(x / 3, y / 3);

        const isEdge = Math.abs(noise1) < 0.15;
        const value = isEdge ? 0.3 : (noise2 + 1) / 2;

        const color = ColorPalette.getColorFromPalette(palette, value);
        this.setPixel(imageData, x, y, color);
      }
    }
  }

  generateGravel(imageData, size) {
    const darkGray = { r: 100, g: 100, b: 100 };
    const lightGray = { r: 150, g: 150, b: 150 };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Random pebbles
        const noise = this.perlin.octaveNoise(x / 2, y / 2, 0, 5, 0.7);
        const value = (noise + 1) / 2;

        const color = ColorPalette.lerpColor(darkGray, lightGray, value);
        this.setPixel(imageData, x, y, color);
      }
    }
  }

  generateOre(imageData, size) {
    const stone = { r: 128, g: 128, b: 128 };
    const ore = { r: 255, g: 215, b: 0 }; // Gold

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const noise = this.perlin.octaveNoise(x / 3, y / 3, 0, 3, 0.5);

        // Ore veins
        const isOre = noise > 0.4;
        const color = isOre ? ore : stone;

        this.setPixel(imageData, x, y, color);
      }
    }
  }

  generateSnow(imageData, size) {
    const white = { r: 255, g: 255, b: 255 };
    const lightGray = { r: 240, g: 240, b: 245 };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const noise = this.perlin.octaveNoise(x / 4, y / 4, 0, 2, 0.3);
        const value = (noise + 1) / 2;

        const color = ColorPalette.lerpColor(lightGray, white, value);
        this.setPixel(imageData, x, y, color);
      }
    }
  }

  generateIce(imageData, size) {
    const darkBlue = { r: 180, g: 220, b: 240 };
    const lightBlue = { r: 220, g: 240, b: 255 };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const noise = this.perlin.octaveNoise(x / 6, y / 6, 0, 2, 0.4);
        const value = (noise + 1) / 2;

        const color = ColorPalette.lerpColor(darkBlue, lightBlue, value);
        this.setPixel(imageData, x, y, color);
      }
    }
  }

  generateLava(imageData, size) {
    const darkRed = { r: 139, g: 0, b: 0 };
    const orange = { r: 255, g: 140, b: 0 };
    const yellow = { r: 255, g: 255, b: 0 };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const noise = this.perlin.octaveNoise(x / 4, y / 4, 0, 3, 0.5);
        const value = (noise + 1) / 2;

        let color;
        if (value < 0.4) {
          color = darkRed;
        } else if (value < 0.7) {
          color = orange;
        } else {
          color = yellow;
        }

        this.setPixel(imageData, x, y, color);
      }
    }
  }

  // Batch generate all textures
  generateAll(size = 16) {
    const types = [
      'grass', 'dirt', 'stone', 'sand', 'water',
      'wood', 'leaves', 'brick', 'cobblestone', 'gravel',
      'ore', 'snow', 'ice', 'lava'
    ];

    const textures = {};
    types.forEach(type => {
      textures[type] = this.generateTexture(type, size);
    });

    return textures;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TextureGenerator };
}
