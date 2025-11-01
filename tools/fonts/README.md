# Font Atlas Generator

Generate texture atlases from TrueType fonts for voxel text rendering.

## Quick Start

```bash
# Install dependencies
pip install pillow

# Generate atlas (solid/pixelated style)
python generate_atlas.py --font NotoSansMono.ttf --size 16 --style solid

# Generate atlas (smooth/anti-aliased style)
python generate_atlas.py --font NotoSansMono.ttf --size 32 --style smooth
```

## Output

**`atlas.png`** - Texture atlas with all glyphs
- White glyphs on transparent background
- Grid layout (16 columns by default)
- RGBA format

**`atlas.json`** - Metadata and metrics
```json
{
  "glyphs": {
    "65": [0, 1],  // 'A' at row 0, col 1
    "66": [0, 2],  // 'B' at row 0, col 2
    ...
  },
  "metrics": {
    "glyph_width": 10,
    "glyph_height": 16,
    "baseline_offset": 13,
    "columns": 16,
    ...
  }
}
```

## Styles

### Solid (Pixelated)
- Hard threshold: any pixel becomes fully opaque
- Best for low-res (8×8, 16×16)
- Retro/voxel aesthetic
- No anti-aliasing

### Smooth (Anti-Aliased)
- Preserves grayscale as alpha channel
- Best for higher-res (32×32, 64×64)
- Cleaner appearance
- Smoother edges

## Options

```
--font PATH        TrueType font file (required)
--size INT         Target glyph size (default: 32)
--style STYLE      'solid' or 'smooth' (default: solid)
--output DIR       Output directory (default: .)
--columns INT      Grid columns (default: 16)
--ascii-only       ASCII only, no Cyrillic
```

## Character Sets

**Default:** ASCII + Cyrillic
- ASCII: 32-126 (space through ~)
- Cyrillic: А-Я, а-я, Ё, ё
- Total: ~192 characters

**ASCII only:** Use `--ascii-only` flag
- 95 characters

## Examples

```bash
# Low-res pixelated (for retro voxel text)
python generate_atlas.py --font NotoSansMono.ttf --size 8 --style solid

# Medium-res clean
python generate_atlas.py --font NotoSansMono.ttf --size 16 --style solid

# High-res smooth
python generate_atlas.py --font NotoSansMono.ttf --size 32 --style smooth

# ASCII only, custom output
python generate_atlas.py --font NotoSansMono.ttf --ascii-only --output ../../assets/fonts/
```

## Recommended Settings for Voxel Text

### Ultra Low-Res (Extreme Retro)
```bash
--size 8 --style solid
```
- 8×8 pixel glyphs
- Very blocky
- Good for: Signs, minimalist UI

### Low-Res (Retro)
```bash
--size 16 --style solid
```
- 16×16 pixel glyphs
- Pixelated but readable
- Good for: In-world text, signs, UI

### Medium-Res (Clean)
```bash
--size 24 --style solid
```
- 24×24 pixel glyphs
- Still pixelated, more detail
- Good for: Bible verses, menus

### High-Res (Smooth)
```bash
--size 32 --style smooth
```
- 32×32 pixel glyphs
- Anti-aliased, very readable
- Good for: Long-form text, reading

## Font Recommendations

**Monospace (Recommended):**
- Noto Sans Mono (included)
- Courier New
- Consolas
- Roboto Mono
- Source Code Pro

**Proportional (Advanced):**
- Requires custom spacing code
- Not recommended for first implementation

## Integration with Wave

See `wave/src/voxel-text.ts` for voxel text renderer.

Basic usage:
```typescript
import { VoxelText } from './voxel-text';

// Initialize
const voxelText = new VoxelText('assets/fonts/atlas.png', 'assets/fonts/atlas.json');
await voxelText.init();

// Render text to voxels
const voxels = voxelText.textToVoxels("Hello, World!", { scale: 1 });

// Add to world
world.addVoxels(voxels);
```

## Technical Details

### Atlas Layout
```
[A][B][C][D][E][F][G][H][I][J][K][L][M][N][O][P]  ← Row 0 (cols 0-15)
[Q][R][S][T][U][V][W][X][Y][Z][a][b][c][d][e][f]  ← Row 1
[g][h][i][j][k][l][m][n][o][p][q][r][s][t][u][v]  ← Row 2
...
```

Each glyph occupies a fixed-size cell (e.g., 16×16px).

### Baseline Alignment

All glyphs align to a common baseline:
```
     Á   ← Above baseline
     A
     g   ← Below baseline (descender)
--------- ← Baseline (baseline_offset from top)
```

This ensures text like "Agé" lines up correctly.

### Coordinate System

- Origin: Top-left corner of atlas
- Row/col indices start at 0
- UV coordinates: (0,0) to (1,1)

### Voxel Conversion

Each pixel in the atlas becomes a potential voxel:
1. For each character, get glyph region from atlas
2. For each pixel in glyph:
   - If pixel alpha > threshold, place voxel
3. Voxel position = (char_x + pixel_x, pixel_y, depth)

---

**Pro tip:** Start with `--size 16 --style solid` for typical voxel text!
