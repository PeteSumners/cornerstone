# Font System Setup Guide

Complete setup instructions for voxel text rendering.

## Step 1: Install Dependencies

```bash
pip install pillow
```

## Step 2: Get a Monospace Font

Download Noto Sans Mono (or use your own):
- https://fonts.google.com/noto/specimen/Noto+Sans+Mono
- Download the TTF file
- Place in this directory

Or use system fonts:
- **Windows:** `C:\Windows\Fonts\consola.ttf` (Consolas)
- **Mac:** `/System/Library/Fonts/Courier.ttc` (Courier)
- **Linux:** `/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf`

## Step 3: Generate Atlas

### Quick Start (Recommended)

```bash
# Low-res pixelated for voxel aesthetic
python generate_atlas.py --font NotoSansMono.ttf --size 16 --style solid --output ../../assets/fonts/default
```

This creates:
- `../../assets/fonts/default/atlas.png`
- `../../assets/fonts/default/atlas.json`

### All Options

```bash
# Ultra low-res (8×8) - extreme retro
python generate_atlas.py --font NotoSansMono.ttf --size 8 --style solid

# Low-res (16×16) - retro, readable
python generate_atlas.py --font NotoSansMono.ttf --size 16 --style solid

# Medium-res (24×24) - clean pixelated
python generate_atlas.py --font NotoSansMono.ttf --size 24 --style solid

# High-res smooth (32×32) - anti-aliased
python generate_atlas.py --font NotoSansMono.ttf --size 32 --style smooth
```

### Multiple Atlases (Recommended)

Generate several for different use cases:

```bash
# For in-world signs (low-res)
python generate_atlas.py --font NotoSansMono.ttf --size 16 --style solid \
  --output ../../assets/fonts/signs

# For Bible verses (medium-res)
python generate_atlas.py --font NotoSansMono.ttf --size 24 --style solid \
  --output ../../assets/fonts/verses

# For menus/UI (high-res smooth)
python generate_atlas.py --font NotoSansMono.ttf --size 32 --style smooth \
  --output ../../assets/fonts/ui
```

## Step 4: Verify Output

Check that files were created:

```bash
ls -lh ../../assets/fonts/default/
# Should show:
#   atlas.png  (~50-200 KB depending on size)
#   atlas.json (~10-20 KB)
```

Open `atlas.png` in an image viewer - you should see a grid of white characters on transparent background.

## Step 5: Use in Code

```typescript
// In your TypeScript code
import { VoxelText } from './voxel-text';

const voxelText = new VoxelText(
  'assets/fonts/default/atlas.png',
  'assets/fonts/default/atlas.json'
);

await voxelText.init();

const voxels = voxelText.textToVoxels('Hello!', {
  scale: 1,
  depth: 1
});

// Add voxels to world...
```

## Step 6: Test with Demo

```typescript
// Run the demo
import { demo } from './voxel-text-demo';
await demo();
```

## Recommended Settings by Use Case

### In-World Signs
```bash
--size 16 --style solid
```
- Small, readable
- Pixelated voxel aesthetic
- Low memory usage

### Bible Verses / Long Text
```bash
--size 24 --style solid
```
- Readable for paragraphs
- Still pixelated
- Good balance

### UI / Menus
```bash
--size 32 --style smooth
```
- Very readable
- Smooth edges
- Modern look

### Monuments / Large Text
```bash
--size 8 --style solid
```
- Large voxel structures
- Each letter is big
- Extreme low-res charm

## Troubleshooting

### "Font not found"
- Check font path is correct
- Use absolute path if needed
- Verify font file exists

### Atlas looks blurry
- You used `--style smooth` (anti-aliased)
- Use `--style solid` for sharp pixels

### Characters missing
- Font doesn't include that character
- Check `atlas.json` to see which codepoints are included
- Use `--ascii-only` to reduce character set

### Output is huge
- Large `--size` creates large atlas
- Use smaller size (16 instead of 64)
- Use `--ascii-only` to reduce character count

### Voxel text looks weird
- Check `scale` parameter in `textToVoxels()`
- Try `scale: 1` for 1:1 pixel-to-voxel mapping
- Increase `threshold` if too sparse

## Advanced: Custom Character Sets

Edit `generate_atlas.py` to add custom characters:

```python
# Add emoji or special symbols
CUSTOM_CHARS = [0x2665, 0x2660, ...]  # ♥, ♠, ...

# Use in generate_atlas()
codepoints = DEFAULT_CHARSET + CUSTOM_CHARS
```

## Next Steps

1. ✅ Generate atlas
2. ⬜ Test with `voxel-text-demo.ts`
3. ⬜ Integrate with Wave engine
4. ⬜ Create Bible verse display system
5. ⬜ Build in-world sign editor

---

**You're ready to render voxel text!** 🎉
