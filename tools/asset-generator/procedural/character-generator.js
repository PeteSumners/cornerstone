/**
 * Procedural Character Sprite Generator
 *
 * Generates 32x32 character sprites with walking animations
 * Creates front, back, left, right views with 3 frames per direction
 */

class CharacterGenerator {
  constructor(seed = Math.random()) {
    this.seed = seed;
    this.random = this.seededRandom(seed);
  }

  seededRandom(seed) {
    let s = seed;
    return function() {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  // Generate a complete character sprite sheet
  generateSpriteSheet(config = {}) {
    const {
      size = 32,
      skinTone = this.randomSkinTone(),
      hairColor = this.randomHairColor(),
      clothingColor = this.randomClothingColor(),
      bodyType = 'humanoid'
    } = config;

    // Create sprite sheet: 4 directions x 3 frames = 12 sprites
    const sheetWidth = size * 3;  // 3 frames
    const sheetHeight = size * 4; // 4 directions

    const canvas = document.createElement('canvas');
    canvas.width = sheetWidth;
    canvas.height = sheetHeight;
    const ctx = canvas.getContext('2d');

    // Generate each direction
    const directions = ['down', 'up', 'left', 'right'];
    directions.forEach((direction, dirIndex) => {
      for (let frame = 0; frame < 3; frame++) {
        const sprite = this.generateSprite({
          size,
          direction,
          frame,
          skinTone,
          hairColor,
          clothingColor,
          bodyType
        });

        ctx.drawImage(sprite, frame * size, dirIndex * size);
      }
    });

    return canvas;
  }

  // Generate a single sprite frame
  generateSprite(config) {
    const { size, direction, frame, skinTone, hairColor, clothingColor, bodyType } = config;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Clear to transparent
    ctx.clearRect(0, 0, size, size);

    if (bodyType === 'humanoid') {
      this.drawHumanoid(ctx, size, direction, frame, skinTone, hairColor, clothingColor);
    }

    return canvas;
  }

  drawHumanoid(ctx, size, direction, frame, skinTone, hairColor, clothingColor) {
    const scale = size / 32; // Scale everything based on target size

    // Animation offset for walking
    const walkOffset = frame === 1 ? 0 : (frame === 0 ? -1 : 1) * scale;

    // Body proportions
    const headSize = 10 * scale;
    const bodyWidth = 8 * scale;
    const bodyHeight = 10 * scale;
    const legLength = 8 * scale;
    const armLength = 8 * scale;

    const centerX = size / 2;
    const headY = 6 * scale;
    const bodyY = headY + headSize + 2 * scale;
    const legsY = bodyY + bodyHeight;

    // Draw based on direction
    switch (direction) {
      case 'down': // Facing camera
        this.drawFrontView(ctx, centerX, headY, bodyY, legsY, scale, walkOffset,
                          headSize, bodyWidth, bodyHeight, legLength, armLength,
                          skinTone, hairColor, clothingColor);
        break;
      case 'up': // Facing away
        this.drawBackView(ctx, centerX, headY, bodyY, legsY, scale, walkOffset,
                         headSize, bodyWidth, bodyHeight, legLength, armLength,
                         skinTone, hairColor, clothingColor);
        break;
      case 'left': // Facing left
        this.drawSideView(ctx, centerX, headY, bodyY, legsY, scale, walkOffset,
                         headSize, bodyWidth, bodyHeight, legLength, armLength,
                         skinTone, hairColor, clothingColor, true);
        break;
      case 'right': // Facing right
        this.drawSideView(ctx, centerX, headY, bodyY, legsY, scale, walkOffset,
                         headSize, bodyWidth, bodyHeight, legLength, armLength,
                         skinTone, hairColor, clothingColor, false);
        break;
    }
  }

  drawFrontView(ctx, centerX, headY, bodyY, legsY, scale, walkOffset,
                headSize, bodyWidth, bodyHeight, legLength, armLength,
                skinTone, hairColor, clothingColor) {
    // Head
    ctx.fillStyle = skinTone;
    this.fillRoundRect(ctx, centerX - headSize/2, headY, headSize, headSize, 2 * scale);

    // Hair
    ctx.fillStyle = hairColor;
    this.fillRoundRect(ctx, centerX - headSize/2, headY, headSize, headSize/2, 2 * scale);

    // Eyes
    ctx.fillStyle = '#000';
    const eyeSize = 2 * scale;
    ctx.fillRect(centerX - headSize/3, headY + headSize/3, eyeSize, eyeSize);
    ctx.fillRect(centerX + headSize/3 - eyeSize, headY + headSize/3, eyeSize, eyeSize);

    // Body
    ctx.fillStyle = clothingColor;
    this.fillRoundRect(ctx, centerX - bodyWidth/2, bodyY, bodyWidth, bodyHeight, 2 * scale);

    // Arms
    ctx.fillStyle = skinTone;
    // Left arm
    ctx.fillRect(centerX - bodyWidth/2 - 2*scale, bodyY + 2*scale, 2*scale, armLength + walkOffset);
    // Right arm
    ctx.fillRect(centerX + bodyWidth/2, bodyY + 2*scale, 2*scale, armLength - walkOffset);

    // Legs
    ctx.fillStyle = clothingColor;
    // Left leg
    ctx.fillRect(centerX - bodyWidth/4 - scale, legsY, 3*scale, legLength + walkOffset);
    // Right leg
    ctx.fillRect(centerX + bodyWidth/4 - scale, legsY, 3*scale, legLength - walkOffset);

    // Feet
    ctx.fillStyle = '#333';
    ctx.fillRect(centerX - bodyWidth/4 - scale, legsY + legLength + walkOffset, 4*scale, 2*scale);
    ctx.fillRect(centerX + bodyWidth/4 - scale, legsY + legLength - walkOffset, 4*scale, 2*scale);
  }

  drawBackView(ctx, centerX, headY, bodyY, legsY, scale, walkOffset,
               headSize, bodyWidth, bodyHeight, legLength, armLength,
               skinTone, hairColor, clothingColor) {
    // Head (back of head)
    ctx.fillStyle = skinTone;
    this.fillRoundRect(ctx, centerX - headSize/2, headY, headSize, headSize, 2 * scale);

    // Hair (back)
    ctx.fillStyle = hairColor;
    this.fillRoundRect(ctx, centerX - headSize/2, headY, headSize, headSize * 0.6, 2 * scale);

    // Body
    ctx.fillStyle = clothingColor;
    this.fillRoundRect(ctx, centerX - bodyWidth/2, bodyY, bodyWidth, bodyHeight, 2 * scale);

    // Arms (back view)
    ctx.fillStyle = skinTone;
    ctx.fillRect(centerX - bodyWidth/2 - 2*scale, bodyY + 2*scale, 2*scale, armLength - walkOffset);
    ctx.fillRect(centerX + bodyWidth/2, bodyY + 2*scale, 2*scale, armLength + walkOffset);

    // Legs
    ctx.fillStyle = clothingColor;
    ctx.fillRect(centerX - bodyWidth/4 - scale, legsY, 3*scale, legLength - walkOffset);
    ctx.fillRect(centerX + bodyWidth/4 - scale, legsY, 3*scale, legLength + walkOffset);

    // Feet
    ctx.fillStyle = '#333';
    ctx.fillRect(centerX - bodyWidth/4 - scale, legsY + legLength - walkOffset, 4*scale, 2*scale);
    ctx.fillRect(centerX + bodyWidth/4 - scale, legsY + legLength + walkOffset, 4*scale, 2*scale);
  }

  drawSideView(ctx, centerX, headY, bodyY, legsY, scale, walkOffset,
               headSize, bodyWidth, bodyHeight, legLength, armLength,
               skinTone, hairColor, clothingColor, facingLeft) {
    const direction = facingLeft ? -1 : 1;

    // Head
    ctx.fillStyle = skinTone;
    this.fillRoundRect(ctx, centerX - headSize/2, headY, headSize, headSize, 2 * scale);

    // Hair
    ctx.fillStyle = hairColor;
    this.fillRoundRect(ctx, centerX - headSize/2, headY, headSize, headSize/2, 2 * scale);

    // Eye (one visible from side)
    ctx.fillStyle = '#000';
    const eyeX = facingLeft ? centerX - headSize/4 : centerX + headSize/4;
    ctx.fillRect(eyeX, headY + headSize/3, 2*scale, 2*scale);

    // Body
    ctx.fillStyle = clothingColor;
    this.fillRoundRect(ctx, centerX - bodyWidth/2, bodyY, bodyWidth, bodyHeight, 2 * scale);

    // Arms (one in front, one behind)
    ctx.fillStyle = skinTone;
    // Back arm
    ctx.fillRect(centerX - 3*scale*direction, bodyY + 2*scale, 2*scale, armLength + walkOffset);
    // Front arm
    ctx.fillRect(centerX + scale*direction, bodyY + 2*scale, 2*scale, armLength - walkOffset);

    // Legs
    ctx.fillStyle = clothingColor;
    // Back leg
    ctx.fillRect(centerX - 2*scale, legsY, 3*scale, legLength - walkOffset);
    // Front leg
    ctx.fillRect(centerX - 2*scale, legsY, 3*scale, legLength + walkOffset);

    // Feet
    ctx.fillStyle = '#333';
    const footOffsetX = facingLeft ? -2*scale : 2*scale;
    ctx.fillRect(centerX - 2*scale + footOffsetX, legsY + legLength - walkOffset, 4*scale, 2*scale);
    ctx.fillRect(centerX - 2*scale + footOffsetX, legsY + legLength + walkOffset, 4*scale, 2*scale);
  }

  fillRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  randomSkinTone() {
    const tones = [
      '#FFE0BD', // Light
      '#FFCD94', // Medium light
      '#EAC086', // Medium
      '#D4A574', // Medium dark
      '#8D5524', // Dark
      '#5C3A21', // Very dark
    ];
    return tones[Math.floor(this.random() * tones.length)];
  }

  randomHairColor() {
    const colors = [
      '#2C1B18', // Black
      '#3D2314', // Dark brown
      '#5C3A21', // Brown
      '#B55239', // Auburn
      '#E6BC86', // Blonde
      '#FFF5E1', // Light blonde
      '#9E7E67', // Gray
    ];
    return colors[Math.floor(this.random() * colors.length)];
  }

  randomClothingColor() {
    const colors = [
      '#FF0000', // Red
      '#0000FF', // Blue
      '#00FF00', // Green
      '#FFFF00', // Yellow
      '#FF00FF', // Magenta
      '#00FFFF', // Cyan
      '#800080', // Purple
      '#FFA500', // Orange
      '#A52A2A', // Brown
      '#808080', // Gray
    ];
    return colors[Math.floor(this.random() * colors.length)];
  }

  // Generate multiple random characters
  generateBatch(count = 10, size = 32) {
    const characters = [];
    for (let i = 0; i < count; i++) {
      const seed = this.seed + i;
      const generator = new CharacterGenerator(seed);
      const config = {
        size,
        skinTone: generator.randomSkinTone(),
        hairColor: generator.randomHairColor(),
        clothingColor: generator.randomClothingColor(),
      };
      characters.push({
        config,
        sprite: generator.generateSpriteSheet(config)
      });
    }
    return characters;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CharacterGenerator };
}
