/**
 * Procedural Item/Icon Generator
 *
 * Generates 16x16 item icons for inventory, UI, etc.
 * Creates centered icons on transparent backgrounds
 */

class ItemGenerator {
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

  // Generate an item icon
  generateIcon(type, size = 16) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Clear to transparent
    ctx.clearRect(0, 0, size, size);

    const generator = this.getGeneratorForType(type);
    generator(ctx, size);

    return canvas;
  }

  getGeneratorForType(type) {
    const generators = {
      'sword': this.drawSword.bind(this),
      'shield': this.drawShield.bind(this),
      'potion': this.drawPotion.bind(this),
      'coin': this.drawCoin.bind(this),
      'gem': this.drawGem.bind(this),
      'key': this.drawKey.bind(this),
      'book': this.drawBook.bind(this),
      'scroll': this.drawScroll.bind(this),
      'ring': this.drawRing.bind(this),
      'amulet': this.drawAmulet.bind(this),
      'bow': this.drawBow.bind(this),
      'arrow': this.drawArrow.bind(this),
      'axe': this.drawAxe.bind(this),
      'pickaxe': this.drawPickaxe.bind(this),
      'hammer': this.drawHammer.bind(this),
      'staff': this.drawStaff.bind(this),
      'wand': this.drawWand.bind(this),
      'helmet': this.drawHelmet.bind(this),
      'armor': this.drawArmor.bind(this),
      'boots': this.drawBoots.bind(this),
    };

    return generators[type] || this.drawGem.bind(this);
  }

  drawSword(ctx, size) {
    const centerX = size / 2;
    const centerY = size / 2;

    // Blade
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(centerX - 1, 2, 2, size - 6);

    // Guard
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(centerX - 3, size - 6, 6, 2);

    // Handle
    ctx.fillStyle = '#654321';
    ctx.fillRect(centerX - 1, size - 5, 2, 3);

    // Pommel
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(centerX - 2, size - 2, 4, 2);

    // Highlight on blade
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(centerX, 3, 1, size - 8);
  }

  drawShield(ctx, size) {
    const centerX = size / 2;
    const centerY = size / 2;

    // Shield body
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(centerX, size - 3);
    ctx.lineTo(size - 3, centerY);
    ctx.lineTo(centerX, 2);
    ctx.lineTo(3, centerY);
    ctx.closePath();
    ctx.fill();

    // Shield rim
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Boss (center)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPotion(ctx, size) {
    const centerX = size / 2;

    // Bottle
    ctx.fillStyle = '#ADD8E6';
    ctx.fillRect(centerX - 3, 6, 6, 7);

    // Neck
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(centerX - 2, 4, 4, 2);

    // Cork
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(centerX - 2, 2, 4, 2);

    // Liquid shine
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(centerX - 2, 7, 1, 4);

    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(centerX - 3, 6, 6, 7);
    ctx.strokeRect(centerX - 2, 4, 4, 2);
  }

  drawCoin(ctx, size) {
    const centerX = size / 2;
    const centerY = size / 2;

    // Coin body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Coin outline
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner circle
    ctx.strokeStyle = '#B8860B';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.stroke();

    // Highlight
    ctx.fillStyle = '#FFED4E';
    ctx.beginPath();
    ctx.arc(centerX - 1, centerY - 1, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawGem(ctx, size) {
    const centerX = size / 2;
    const centerY = size / 2;

    // Random gem color
    const colors = ['#FF0000', '#0000FF', '#00FF00', '#FF00FF', '#00FFFF', '#FFFF00'];
    const color = colors[Math.floor(this.random() * colors.length)];

    // Gem facets
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerX, 3);
    ctx.lineTo(size - 3, centerY);
    ctx.lineTo(centerX, size - 3);
    ctx.lineTo(3, centerY);
    ctx.closePath();
    ctx.fill();

    // Darker facets
    const darkerColor = this.darkenColor(color, 0.3);
    ctx.fillStyle = darkerColor;
    ctx.beginPath();
    ctx.moveTo(centerX, 3);
    ctx.lineTo(size - 3, centerY);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill();

    // Highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - 1, 5, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  drawKey(ctx, size) {
    const centerY = size / 2;

    // Key shaft
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(3, centerY - 1, size - 6, 2);

    // Key head
    ctx.beginPath();
    ctx.arc(4, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Key teeth
    ctx.fillRect(size - 5, centerY - 1, 2, -3);
    ctx.fillRect(size - 3, centerY - 1, 2, -2);
  }

  drawBook(ctx, size) {
    const centerX = size / 2;

    // Book cover
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(centerX - 5, 3, 10, 10);

    // Pages
    ctx.fillStyle = '#FFFACD';
    ctx.fillRect(centerX - 4, 4, 8, 8);

    // Spine
    ctx.fillStyle = '#654321';
    ctx.fillRect(centerX - 5, 3, 1, 10);

    // Details
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(centerX - 5, 3, 10, 10);
  }

  drawScroll(ctx, size) {
    const centerX = size / 2;
    const centerY = size / 2;

    // Scroll paper
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(centerX - 5, centerY - 6, 10, 12);

    // Scroll ends
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(centerX - 6, centerY - 6, 1, 12);
    ctx.fillRect(centerX + 5, centerY - 6, 1, 12);

    // Writing lines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX - 4, centerY - 3 + i * 3);
      ctx.lineTo(centerX + 4, centerY - 3 + i * 3);
      ctx.stroke();
    }
  }

  drawRing(ctx, size) {
    const centerX = size / 2;
    const centerY = size / 2 + 1;

    // Ring band
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.stroke();

    // Gem on ring
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Gem highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - 1, centerY - 5, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  drawAmulet(ctx, size) {
    const centerX = size / 2;
    const centerY = size / 2 + 2;

    // Chain
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, 3, 4, 0, Math.PI);
    ctx.stroke();

    // Pendant
    ctx.fillStyle = '#9370DB';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 3);
    ctx.lineTo(centerX - 3, centerY - 2);
    ctx.lineTo(centerX + 3, centerY - 2);
    ctx.closePath();
    ctx.fill();

    // Pendant outline
    ctx.strokeStyle = '#FFD700';
    ctx.stroke();
  }

  drawBow(ctx, size) {
    const centerX = size / 2;

    // Bow curve
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX + 4, 2);
    ctx.quadraticCurveTo(centerX - 2, size / 2, centerX + 4, size - 2);
    ctx.stroke();

    // Bowstring
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX + 4, 2);
    ctx.lineTo(centerX + 4, size - 2);
    ctx.stroke();
  }

  drawArrow(ctx, size) {
    const centerY = size / 2;

    // Shaft
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(2, centerY - 1, size - 5, 2);

    // Arrowhead
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.moveTo(size - 3, centerY);
    ctx.lineTo(size - 6, centerY - 2);
    ctx.lineTo(size - 6, centerY + 2);
    ctx.closePath();
    ctx.fill();

    // Fletching
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(3, centerY - 2, 2, 4);
  }

  drawAxe(ctx, size) {
    const centerX = size / 2;

    // Handle
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(centerX - 1, 4, 2, size - 5);

    // Axe head
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(centerX - 5, 3, 10, 4);

    // Axe blade
    ctx.beginPath();
    ctx.moveTo(centerX - 5, 3);
    ctx.lineTo(centerX - 6, 1);
    ctx.lineTo(centerX + 6, 1);
    ctx.lineTo(centerX + 5, 3);
    ctx.closePath();
    ctx.fill();
  }

  drawPickaxe(ctx, size) {
    const centerX = size / 2;
    const centerY = size / 2;

    // Handle
    ctx.fillStyle = '#8B4513';
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-1, 0, 2, 8);
    ctx.restore();

    // Pickaxe head
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(2, 3, 6, 3);

    // Pick points
    ctx.beginPath();
    ctx.moveTo(2, 4);
    ctx.lineTo(1, 3);
    ctx.lineTo(1, 6);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(8, 4);
    ctx.lineTo(9, 3);
    ctx.lineTo(9, 6);
    ctx.closePath();
    ctx.fill();
  }

  drawHammer(ctx, size) {
    const centerX = size / 2;

    // Handle
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(centerX - 1, 6, 2, size - 7);

    // Hammer head
    ctx.fillStyle = '#696969';
    ctx.fillRect(centerX - 5, 2, 10, 5);

    // Claw
    ctx.fillRect(centerX - 2, 1, 4, 1);
  }

  drawStaff(ctx, size) {
    const centerX = size / 2;

    // Staff shaft
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(centerX - 1, 4, 2, size - 5);

    // Orb at top
    ctx.fillStyle = '#9370DB';
    ctx.beginPath();
    ctx.arc(centerX, 3, 3, 0, Math.PI * 2);
    ctx.fill();

    // Orb glow
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - 1, 2, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWand(ctx, size) {
    const centerX = size / 2;

    // Wand shaft
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 3, size - 2);
    ctx.lineTo(centerX + 3, 2);
    ctx.stroke();

    // Star at tip
    this.drawStar(ctx, centerX + 3, 2, 3, '#FFD700');
  }

  drawHelmet(ctx, size) {
    const centerX = size / 2;
    const centerY = size / 2;

    // Helmet dome
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, Math.PI, 0);
    ctx.fill();

    // Helmet base
    ctx.fillRect(centerX - 6, centerY, 12, 3);

    // Visor slit
    ctx.fillStyle = '#000000';
    ctx.fillRect(centerX - 4, centerY - 1, 8, 1);
  }

  drawArmor(ctx, size) {
    const centerX = size / 2;

    // Breastplate
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(centerX - 5, 4, 10, 8);

    // Shoulders
    ctx.beginPath();
    ctx.arc(centerX - 5, 4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 5, 4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Details
    ctx.strokeStyle = '#696969';
    ctx.lineWidth = 1;
    ctx.strokeRect(centerX - 5, 4, 10, 8);
  }

  drawBoots(ctx, size) {
    const centerX = size / 2;

    // Left boot
    ctx.fillStyle = '#654321';
    ctx.fillRect(centerX - 6, size - 6, 4, 5);
    ctx.fillRect(centerX - 6, size - 2, 5, 2);

    // Right boot
    ctx.fillRect(centerX + 2, size - 6, 4, 5);
    ctx.fillRect(centerX + 1, size - 2, 5, 2);

    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(centerX - 6, size - 6, 4, 5);
    ctx.strokeRect(centerX + 2, size - 6, 4, 5);
  }

  // Helper functions
  drawStar(ctx, x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x1 = x + Math.cos(angle) * radius;
      const y1 = y + Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(x1, y1);
      } else {
        ctx.lineTo(x1, y1);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  darkenColor(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const newR = Math.floor(r * (1 - factor));
    const newG = Math.floor(g * (1 - factor));
    const newB = Math.floor(b * (1 - factor));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  // Generate all item types
  generateAll(size = 16) {
    const types = [
      'sword', 'shield', 'potion', 'coin', 'gem', 'key',
      'book', 'scroll', 'ring', 'amulet', 'bow', 'arrow',
      'axe', 'pickaxe', 'hammer', 'staff', 'wand',
      'helmet', 'armor', 'boots'
    ];

    const items = {};
    types.forEach(type => {
      items[type] = this.generateIcon(type, size);
    });

    return items;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ItemGenerator };
}
