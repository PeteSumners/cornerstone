#!/usr/bin/env python3
"""
Font Atlas Generator for Voxel Text Rendering

Generates a texture atlas from a TrueType font for use in voxel-based text.
Outputs:
  - atlas.png: Grid of white glyphs on transparent background
  - atlas.json: Glyph positions and font metrics

Usage:
  python generate_atlas.py --font path/to/font.ttf --size 32 --style solid
  python generate_atlas.py --font path/to/font.ttf --size 32 --style smooth

Author: Claude Code
License: MIT
"""

from PIL import Image, ImageDraw, ImageFont
import json
import argparse
from pathlib import Path

# ==================== CONFIG ====================

# Character sets to include
ASCII_CHARS = list(range(32, 127))  # Basic ASCII (space through ~)
CYRILLIC_UPPER = list(range(0x410, 0x430))  # А-Я
CYRILLIC_LOWER = list(range(0x430, 0x450))  # а-я
SPECIAL_CYRILLIC = [0x401, 0x451]  # Ё, ё

DEFAULT_CHARSET = ASCII_CHARS + SPECIAL_CYRILLIC + CYRILLIC_UPPER + CYRILLIC_LOWER
DEFAULT_COLUMNS = 16

# ==================== CORE FUNCTIONS ====================

def measure_font(font, codepoints):
    """
    Measure bounding boxes for all glyphs.

    Returns:
        max_width: Maximum glyph width
        max_above_baseline: Maximum height above baseline
        max_below_baseline: Maximum height below baseline
    """
    dummy_img = Image.new("L", (100, 100), 0)
    dummy_draw = ImageDraw.Draw(dummy_img)

    max_width = 0
    max_above = 0
    max_below = 0

    for cp in codepoints:
        char = chr(cp)
        bbox = dummy_draw.textbbox((0, 0), char, font=font)

        width = bbox[2] - bbox[0]
        above = -bbox[1]  # Negative y is above baseline
        below = bbox[3]    # Positive y is below baseline

        max_width = max(max_width, width)
        max_above = max(max_above, above)
        max_below = max(max_below, below)

    return max_width, max_above, max_below


def calculate_dimensions(max_width, max_above, max_below, target_size, base_font_size):
    """
    Calculate scaled dimensions and font size.

    Returns:
        font_size: Scaled font size
        glyph_width: Width of each glyph box
        glyph_height: Height of each glyph box
        baseline_offset: Pixels from top of box to baseline
        scale_factor: Scaling multiplier
    """
    natural_height = int(max_above + max_below)
    natural_baseline = int(max_above)

    # Scale to fit target size
    scale = target_size / max(max_width, natural_height)

    font_size = int(base_font_size * scale)
    glyph_width = int(max_width * scale)
    glyph_height = int(natural_height * scale)
    baseline_offset = int(natural_baseline * scale)

    return font_size, glyph_width, glyph_height, baseline_offset, scale


def create_atlas(font, codepoints, glyph_width, glyph_height, baseline_offset, columns):
    """
    Render all glyphs to a texture atlas.

    Returns:
        atlas_image: Grayscale PIL Image
        metadata: Dict mapping codepoint -> [row, col]
    """
    glyph_count = len(codepoints)
    rows = (glyph_count + columns - 1) // columns

    atlas_width = columns * glyph_width
    atlas_height = rows * glyph_height

    atlas = Image.new("L", (atlas_width, atlas_height), 0)
    draw = ImageDraw.Draw(atlas)

    metadata = {}

    for i, cp in enumerate(codepoints):
        row = i // columns
        col = i % columns

        cell_x = col * glyph_width
        cell_y = row * glyph_height

        char = chr(cp)
        bbox = draw.textbbox((0, 0), char, font=font)

        # Center horizontally, align to baseline vertically
        offset_x = -bbox[0]
        offset_y = cell_y + baseline_offset

        draw.text((cell_x + offset_x, offset_y), char, font=font, fill=255)

        metadata[str(cp)] = [row, col]

    return atlas, metadata


def convert_to_rgba(grayscale_image, style='solid'):
    """
    Convert grayscale atlas to RGBA.

    Args:
        grayscale_image: Grayscale PIL Image
        style: 'solid' (hard threshold) or 'smooth' (anti-aliased)

    Returns:
        RGBA PIL Image
    """
    width, height = grayscale_image.size
    rgba = Image.new("RGBA", (width, height), (0, 0, 0, 0))

    gray_pixels = grayscale_image.load()
    rgba_pixels = rgba.load()

    if style == 'solid':
        # Hard threshold: any pixel > 0 becomes opaque white
        for y in range(height):
            for x in range(width):
                if gray_pixels[x, y] > 0:
                    rgba_pixels[x, y] = (255, 255, 255, 255)
    else:  # smooth
        # Preserve anti-aliasing: grayscale value becomes alpha
        for y in range(height):
            for x in range(width):
                gray = gray_pixels[x, y]
                if gray > 0:
                    rgba_pixels[x, y] = (255, 255, 255, gray)

    return rgba


def generate_atlas(
    font_path,
    target_size=32,
    style='solid',
    output_dir='.',
    columns=DEFAULT_COLUMNS,
    codepoints=None
):
    """
    Main function to generate font atlas.

    Args:
        font_path: Path to TrueType font file
        target_size: Target glyph size in pixels
        style: 'solid' or 'smooth'
        output_dir: Directory for output files
        columns: Number of columns in atlas grid
        codepoints: List of codepoints to include (default: ASCII + Cyrillic)
    """
    if codepoints is None:
        codepoints = DEFAULT_CHARSET

    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*50}")
    print(f"Generating {style} font atlas")
    print(f"Font: {font_path}")
    print(f"Target size: {target_size}×{target_size}")
    print(f"Characters: {len(codepoints)}")
    print(f"{'='*50}\n")

    # Step 1: Measure font at base size
    base_font_size = 16
    font = ImageFont.truetype(str(font_path), base_font_size)
    max_width, max_above, max_below = measure_font(font, codepoints)

    print(f"Natural dimensions:")
    print(f"  Width: {max_width}px")
    print(f"  Above baseline: {max_above}px")
    print(f"  Below baseline: {max_below}px")

    # Step 2: Calculate scaled dimensions
    font_size, glyph_width, glyph_height, baseline_offset, scale = calculate_dimensions(
        max_width, max_above, max_below, target_size, base_font_size
    )

    print(f"\nScaled dimensions:")
    print(f"  Font size: {font_size}pt")
    print(f"  Glyph box: {glyph_width}×{glyph_height}px")
    print(f"  Baseline offset: {baseline_offset}px")
    print(f"  Scale factor: {scale:.2f}x")

    # Step 3: Reload font at scaled size
    font = ImageFont.truetype(str(font_path), font_size)

    # Step 4: Render atlas
    print(f"\nRendering atlas...")
    atlas_gray, metadata = create_atlas(
        font, codepoints, glyph_width, glyph_height, baseline_offset, columns
    )

    # Step 5: Convert to RGBA
    atlas_rgba = convert_to_rgba(atlas_gray, style)

    rows = (len(codepoints) + columns - 1) // columns
    print(f"  Atlas size: {atlas_rgba.width}×{atlas_rgba.height}px")
    print(f"  Grid: {columns} columns × {rows} rows")

    # Step 6: Save outputs
    atlas_path = output_dir / 'atlas.png'
    metadata_path = output_dir / 'atlas.json'

    atlas_rgba.save(atlas_path)

    output_data = {
        'glyphs': metadata,
        'metrics': {
            'glyph_width': glyph_width,
            'glyph_height': glyph_height,
            'baseline_offset': baseline_offset,
            'columns': columns,
            'target_size': target_size,
            'font_size': font_size,
            'scale_factor': scale,
            'style': style
        }
    }

    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"\nOutput:")
    print(f"  Atlas: {atlas_path}")
    print(f"  Metadata: {metadata_path}")
    print(f"\n{'='*50}")
    print("✓ Done!")
    print(f"{'='*50}\n")


# ==================== CLI ====================

def main():
    parser = argparse.ArgumentParser(
        description='Generate font atlas for voxel text rendering',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate 32×32 solid (pixelated) atlas
  python generate_atlas.py --font NotoSansMono.ttf --size 32 --style solid

  # Generate 16×16 smooth (anti-aliased) atlas
  python generate_atlas.py --font NotoSansMono.ttf --size 16 --style smooth

  # ASCII only, custom output directory
  python generate_atlas.py --font NotoSansMono.ttf --ascii-only --output ./output
        """
    )

    parser.add_argument('--font', type=str, required=True,
                        help='Path to TrueType font file')
    parser.add_argument('--size', type=int, default=32,
                        help='Target glyph size (default: 32)')
    parser.add_argument('--style', choices=['solid', 'smooth'], default='solid',
                        help='Rendering style: solid (pixelated) or smooth (anti-aliased)')
    parser.add_argument('--output', type=str, default='.',
                        help='Output directory (default: current directory)')
    parser.add_argument('--columns', type=int, default=DEFAULT_COLUMNS,
                        help=f'Atlas grid columns (default: {DEFAULT_COLUMNS})')
    parser.add_argument('--ascii-only', action='store_true',
                        help='Include only ASCII characters (no Cyrillic)')

    args = parser.parse_args()

    codepoints = ASCII_CHARS if args.ascii_only else DEFAULT_CHARSET

    generate_atlas(
        font_path=args.font,
        target_size=args.size,
        style=args.style,
        output_dir=args.output,
        columns=args.columns,
        codepoints=codepoints
    )


if __name__ == '__main__':
    main()
