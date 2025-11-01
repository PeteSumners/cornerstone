/**
 * Voxel Text Renderer
 *
 * Converts text strings to 3D voxel geometry using a font atlas.
 *
 * Usage:
 *   const voxelText = new VoxelText('fonts/atlas.png', 'fonts/atlas.json');
 *   await voxelText.init();
 *   const voxels = voxelText.textToVoxels("Hello", { scale: 1, depth: 1 });
 *
 * @author Claude Code
 * @license MIT
 */

export interface AtlasMetadata {
  glyphs: { [codepoint: string]: [number, number] };  // codepoint -> [row, col]
  metrics: {
    glyph_width: number;
    glyph_height: number;
    baseline_offset: number;
    columns: number;
    target_size: number;
    font_size: number;
    scale_factor: number;
    style: 'solid' | 'smooth';
  };
}

export interface Voxel {
  x: number;
  y: number;
  z: number;
  color?: [number, number, number];
}

export interface TextOptions {
  scale?: number;          // Scale multiplier (default: 1)
  depth?: number;          // Voxel depth/extrusion (default: 1)
  spacing?: number;        // Extra spacing between characters (default: 0)
  lineHeight?: number;     // Extra spacing between lines (default: 0)
  threshold?: number;      // Alpha threshold for voxel placement (0-255, default: 128)
  color?: [number, number, number];  // RGB color (default: white)
}

export class VoxelText {
  private atlasImage: HTMLImageElement | null = null;
  private atlasCanvas: HTMLCanvasElement | null = null;
  private atlasCtx: CanvasRenderingContext2D | null = null;
  private atlasData: ImageData | null = null;
  private metadata: AtlasMetadata | null = null;

  constructor(
    private atlasImagePath: string,
    private atlasMetadataPath: string
  ) {}

  /**
   * Initialize the voxel text system (load atlas and metadata)
   */
  async init(): Promise<void> {
    // Load metadata
    const metadataResponse = await fetch(this.atlasMetadataPath);
    this.metadata = await metadataResponse.json();

    // Load atlas image
    this.atlasImage = new Image();
    await new Promise<void>((resolve, reject) => {
      this.atlasImage!.onload = () => resolve();
      this.atlasImage!.onerror = reject;
      this.atlasImage!.src = this.atlasImagePath;
    });

    // Create canvas to read pixel data
    this.atlasCanvas = document.createElement('canvas');
    this.atlasCanvas.width = this.atlasImage.width;
    this.atlasCanvas.height = this.atlasImage.height;

    this.atlasCtx = this.atlasCanvas.getContext('2d', { willReadFrequently: true });
    if (!this.atlasCtx) {
      throw new Error('Failed to get 2D context');
    }

    this.atlasCtx.drawImage(this.atlasImage, 0, 0);
    this.atlasData = this.atlasCtx.getImageData(
      0, 0,
      this.atlasCanvas.width,
      this.atlasCanvas.height
    );

    console.log('[VoxelText] Initialized');
    console.log(`  Atlas: ${this.atlasImage.width}×${this.atlasImage.height}px`);
    console.log(`  Glyphs: ${Object.keys(this.metadata!.glyphs).length}`);
    console.log(`  Glyph size: ${this.metadata!.metrics.glyph_width}×${this.metadata!.metrics.glyph_height}px`);
  }

  /**
   * Get pixel data for a specific glyph
   */
  private getGlyphPixels(char: string): Uint8ClampedArray | null {
    if (!this.metadata || !this.atlasData) {
      throw new Error('VoxelText not initialized');
    }

    const codepoint = char.charCodeAt(0).toString();
    const glyphPos = this.metadata.glyphs[codepoint];

    if (!glyphPos) {
      console.warn(`[VoxelText] Glyph not found: '${char}' (${codepoint})`);
      return null;
    }

    const [row, col] = glyphPos;
    const { glyph_width, glyph_height } = this.metadata.metrics;

    // Calculate pixel region in atlas
    const startX = col * glyph_width;
    const startY = row * glyph_height;

    // Extract pixel data
    const pixelData = new Uint8ClampedArray(glyph_width * glyph_height * 4);
    const atlasWidth = this.atlasData.width;

    for (let y = 0; y < glyph_height; y++) {
      for (let x = 0; x < glyph_width; x++) {
        const atlasX = startX + x;
        const atlasY = startY + y;
        const atlasIdx = (atlasY * atlasWidth + atlasX) * 4;
        const localIdx = (y * glyph_width + x) * 4;

        pixelData[localIdx + 0] = this.atlasData.data[atlasIdx + 0];  // R
        pixelData[localIdx + 1] = this.atlasData.data[atlasIdx + 1];  // G
        pixelData[localIdx + 2] = this.atlasData.data[atlasIdx + 2];  // B
        pixelData[localIdx + 3] = this.atlasData.data[atlasIdx + 3];  // A
      }
    }

    return pixelData;
  }

  /**
   * Convert a single character to voxels
   */
  private charToVoxels(
    char: string,
    offsetX: number,
    offsetY: number,
    options: Required<TextOptions>
  ): Voxel[] {
    const pixelData = this.getGlyphPixels(char);
    if (!pixelData) return [];

    const { glyph_width, glyph_height } = this.metadata!.metrics;
    const voxels: Voxel[] = [];

    for (let py = 0; py < glyph_height; py++) {
      for (let px = 0; px < glyph_width; px++) {
        const pixelIdx = (py * glyph_width + px) * 4;
        const alpha = pixelData[pixelIdx + 3];

        // Only place voxel if pixel is opaque enough
        if (alpha >= options.threshold) {
          // Calculate voxel position
          const vx = offsetX + px * options.scale;
          const vy = offsetY + py * options.scale;

          // Create voxels for depth
          for (let d = 0; d < options.depth; d++) {
            // For scale > 1, fill in the scaled area
            for (let sy = 0; sy < options.scale; sy++) {
              for (let sx = 0; sx < options.scale; sx++) {
                voxels.push({
                  x: vx + sx,
                  y: vy + sy,
                  z: d,
                  color: options.color
                });
              }
            }
          }
        }
      }
    }

    return voxels;
  }

  /**
   * Convert text to voxel geometry
   *
   * @param text - Text string (supports \n for newlines)
   * @param options - Rendering options
   * @returns Array of voxels
   */
  textToVoxels(text: string, options: TextOptions = {}): Voxel[] {
    if (!this.metadata) {
      throw new Error('VoxelText not initialized');
    }

    // Fill in defaults
    const opts: Required<TextOptions> = {
      scale: options.scale ?? 1,
      depth: options.depth ?? 1,
      spacing: options.spacing ?? 0,
      lineHeight: options.lineHeight ?? 0,
      threshold: options.threshold ?? 128,
      color: options.color ?? [255, 255, 255]
    };

    const { glyph_width, glyph_height } = this.metadata.metrics;
    const charWidth = glyph_width * opts.scale;
    const charHeight = glyph_height * opts.scale;

    const voxels: Voxel[] = [];
    const lines = text.split('\n');

    let lineY = 0;

    for (const line of lines) {
      let cursorX = 0;

      for (const char of line) {
        const charVoxels = this.charToVoxels(char, cursorX, lineY, opts);
        voxels.push(...charVoxels);

        cursorX += charWidth + opts.spacing;
      }

      lineY += charHeight + opts.lineHeight;
    }

    console.log(`[VoxelText] Generated ${voxels.length} voxels for "${text.substring(0, 20)}..."`);

    return voxels;
  }

  /**
   * Get text bounding box dimensions (in voxels)
   */
  getTextBounds(text: string, options: TextOptions = {}): { width: number; height: number; depth: number } {
    if (!this.metadata) {
      throw new Error('VoxelText not initialized');
    }

    const opts = {
      scale: options.scale ?? 1,
      spacing: options.spacing ?? 0,
      lineHeight: options.lineHeight ?? 0,
      depth: options.depth ?? 1
    };

    const { glyph_width, glyph_height } = this.metadata.metrics;
    const charWidth = glyph_width * opts.scale;
    const charHeight = glyph_height * opts.scale;

    const lines = text.split('\n');
    const maxLineLength = Math.max(...lines.map(line => line.length));

    const width = maxLineLength * (charWidth + opts.spacing) - opts.spacing;
    const height = lines.length * (charHeight + opts.lineHeight) - opts.lineHeight;

    return { width, height, depth: opts.depth };
  }

  /**
   * Get font metrics
   */
  getMetrics(): AtlasMetadata['metrics'] | null {
    return this.metadata?.metrics ?? null;
  }
}
