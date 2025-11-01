# Text Rendering Setup - Quick Start

Before running the game, you need to generate a font atlas.

## Step 1: Install Python Dependencies

```bash
pip install pillow
```

## Step 2: Get a Font

Download Noto Sans Mono:
- https://fonts.google.com/noto/specimen/Noto+Sans+Mono
- Download the TTF file
- Place it in `tools/fonts/`

Or use a system font:
- **Windows:** `C:\Windows\Fonts\consola.ttf` (Consolas)
- **Mac:** `/System/Library/Fonts/Courier.ttc`
- **Linux:** `/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf`

## Step 3: Generate Font Atlas

```bash
cd tools/fonts

# Using Noto Sans Mono (recommended)
python generate_atlas.py --font NotoSansMono-Regular.ttf --size 16 --style solid --output ../../assets/fonts/default

# Or using Windows Consolas
python generate_atlas.py --font C:\Windows\Fonts\consola.ttf --size 16 --style solid --output ../../assets/fonts/default
```

This creates:
- `assets/fonts/default/atlas.png`
- `assets/fonts/default/atlas.json`

## Step 4: Build and Run

```bash
# Build TypeScript
cd ../..
./scripts/build

# Serve
./scripts/serve.py
```

Open browser to http://localhost:8000

## What You'll See

When the game loads, you should see:

1. **"SPAWN"** text at the spawn point (large, 3× scale)
2. **Genesis 1:1** verse monument at (20, 10, 20)
3. **John 3:16** verse monument at (60, 10, 20)

All rendered as actual 3D stone voxels in the world!

## Troubleshooting

### "FileNotFoundError: atlas.png"

You forgot to generate the font atlas. Run Step 3 above.

### "Text doesn't appear"

Check browser console for errors. The text system will log:
```
=== Initializing Text Rendering ===
✓ Text system initialized
✓ Placing Genesis 1:1...
✓ Placing John 3:16...
✓ Placing welcome sign...
=== Text Rendering Complete ===
```

### "Font file not found"

Check the path to your font file. Use absolute path if needed:

```bash
python generate_atlas.py --font /full/path/to/font.ttf --size 16 --style solid --output ../../assets/fonts/default
```

### Text is too small/big

Adjust the `--size` parameter:
```bash
--size 8   # Very small
--size 16  # Good default
--size 24  # Medium
--size 32  # Large
```

## Next Steps

Once text is working, you can:

1. Edit `main.ts` to add more verses
2. Change text positions
3. Adjust scale/depth parameters
4. Add your own custom text

See `VOXEL_TEXT_INTEGRATION.md` for full API documentation.
