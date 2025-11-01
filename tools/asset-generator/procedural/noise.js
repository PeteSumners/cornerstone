/**
 * Noise Generation Library
 *
 * Provides Perlin and Simplex noise implementations for procedural generation
 * Based on Ken Perlin's improved noise and Stefan Gustavson's simplex noise
 */

class PerlinNoise {
  constructor(seed = Math.random()) {
    this.seed = seed;
    this.p = this.buildPermutationTable(seed);
  }

  buildPermutationTable(seed) {
    const p = new Array(512);
    const perm = [];

    // Initialize with values 0-255
    for (let i = 0; i < 256; i++) {
      perm[i] = i;
    }

    // Shuffle using seed
    const random = this.seededRandom(seed);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }

    // Duplicate for wrapping
    for (let i = 0; i < 512; i++) {
      p[i] = perm[i & 255];
    }

    return p;
  }

  seededRandom(seed) {
    let s = seed;
    return function() {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x, y, z = 0) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;

    return this.lerp(w,
      this.lerp(v,
        this.lerp(u, this.grad(this.p[AA], x, y, z),
                    this.grad(this.p[BA], x - 1, y, z)),
        this.lerp(u, this.grad(this.p[AB], x, y - 1, z),
                    this.grad(this.p[BB], x - 1, y - 1, z))),
      this.lerp(v,
        this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1),
                    this.grad(this.p[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1),
                    this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
  }

  // Octave noise for more natural-looking results
  octaveNoise(x, y, z = 0, octaves = 4, persistence = 0.5) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }
}

class SimplexNoise {
  constructor(seed = Math.random()) {
    this.p = new PerlinNoise(seed).p;
    this.grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];
  }

  dot(g, x, y) {
    return g[0] * x + g[1] * y;
  }

  noise2D(xin, yin) {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

    let n0, n1, n2;

    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.p[ii + this.p[jj]] % 12;
    const gi1 = this.p[ii + i1 + this.p[jj + j1]] % 12;
    const gi2 = this.p[ii + 1 + this.p[jj + 1]] % 12;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) {
      n0 = 0.0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) {
      n1 = 0.0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) {
      n2 = 0.0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
    }

    return 70.0 * (n0 + n1 + n2);
  }
}

// Color utilities
class ColorPalette {
  static earthTones() {
    return [
      { r: 139, g: 90, b: 43 },   // Brown
      { r: 101, g: 67, b: 33 },   // Dark brown
      { r: 160, g: 82, b: 45 },   // Sienna
      { r: 205, g: 133, b: 63 },  // Peru
      { r: 222, g: 184, b: 135 }, // Burlywood
    ];
  }

  static stoneTones() {
    return [
      { r: 128, g: 128, b: 128 }, // Gray
      { r: 105, g: 105, b: 105 }, // Dim gray
      { r: 169, g: 169, b: 169 }, // Dark gray
      { r: 192, g: 192, b: 192 }, // Silver
      { r: 119, g: 136, b: 153 }, // Light slate gray
    ];
  }

  static grassTones() {
    return [
      { r: 34, g: 139, b: 34 },   // Forest green
      { r: 0, g: 128, b: 0 },     // Green
      { r: 107, g: 142, b: 35 },  // Olive drab
      { r: 85, g: 107, b: 47 },   // Dark olive green
      { r: 124, g: 252, b: 0 },   // Lawn green
    ];
  }

  static waterTones() {
    return [
      { r: 0, g: 105, b: 148 },   // Deep sky blue
      { r: 0, g: 119, b: 190 },   // Blue
      { r: 30, g: 144, b: 255 },  // Dodger blue
      { r: 70, g: 130, b: 180 },  // Steel blue
      { r: 100, g: 149, b: 237 }, // Cornflower blue
    ];
  }

  static sandTones() {
    return [
      { r: 238, g: 214, b: 175 }, // Tan
      { r: 244, g: 164, b: 96 },  // Sandy brown
      { r: 210, g: 180, b: 140 }, // Tan
      { r: 255, g: 222, b: 173 }, // Navajo white
      { r: 255, g: 228, b: 181 }, // Moccasin
    ];
  }

  static lerpColor(c1, c2, t) {
    return {
      r: Math.round(c1.r + (c2.r - c1.r) * t),
      g: Math.round(c1.g + (c2.g - c1.g) * t),
      b: Math.round(c1.b + (c2.b - c1.b) * t)
    };
  }

  static getColorFromPalette(palette, value) {
    // value should be 0-1
    value = Math.max(0, Math.min(1, value));
    const index = value * (palette.length - 1);
    const i = Math.floor(index);
    const t = index - i;

    if (i >= palette.length - 1) {
      return palette[palette.length - 1];
    }

    return this.lerpColor(palette[i], palette[i + 1], t);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerlinNoise, SimplexNoise, ColorPalette };
}
