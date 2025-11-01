#!/usr/bin/env python3
"""
Example: Generate font atlases for voxel text

Demonstrates common use cases.
"""

from generate_atlas import generate_atlas
from pathlib import Path

# Setup
FONT_FILE = "NotoSansMono-Regular.ttf"
OUTPUT_DIR = Path("../../assets/fonts")

print("Generating font atlases for Wave engine...\n")

# Example 1: Low-res pixelated (good for in-world signs)
print("1. Low-res pixelated (16px)")
generate_atlas(
    font_path=FONT_FILE,
    target_size=16,
    style='solid',
    output_dir=OUTPUT_DIR / 'pixelated',
    codepoints=list(range(32, 127))  # ASCII only
)

# Example 2: Medium-res clean (good for Bible verses, menus)
print("\n2. Medium-res clean (24px)")
generate_atlas(
    font_path=FONT_FILE,
    target_size=24,
    style='solid',
    output_dir=OUTPUT_DIR / 'clean'
)

# Example 3: High-res smooth (good for long-form reading)
print("\n3. High-res smooth (32px)")
generate_atlas(
    font_path=FONT_FILE,
    target_size=32,
    style='smooth',
    output_dir=OUTPUT_DIR / 'smooth'
)

print("\n" + "="*50)
print("✓ Generated 3 font atlases!")
print("="*50)
print("\nNext steps:")
print("1. Check output in ../../assets/fonts/")
print("2. Use VoxelText class in TypeScript to render")
print("3. See wave/src/voxel-text.ts for API")
