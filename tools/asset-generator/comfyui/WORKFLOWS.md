# ComfyUI Workflow Templates for Game Assets

Pre-configured workflows for generating game assets in Cornerstone. These are optimized for CPU mode and low-memory systems.

---

## Quick Start

1. **Launch ComfyUI**
2. **Load a workflow JSON** (see workflow files in this directory)
3. **Modify prompt** to match desired asset
4. **Queue generation** (overnight for batches)
5. **Export to /images** directory

---

## Workflow 1: Block Textures (16x16)

**Purpose:** Generate seamless tileable textures for voxel blocks

**Output:** 16x16 pixel seamless textures

**Generation Time:**
- CPU: 2-3 minutes per texture
- GPU (RTX 3060): 5-10 seconds

### Setup

**Required Models:**
- Stable Diffusion 1.5
- ControlNet Tile (for seamlessness)

### Workflow Structure

```
[Load Checkpoint: SD 1.5]
    ↓
[CLIP Text Encode: Positive Prompt] ───┐
                                        ↓
[CLIP Text Encode: Negative Prompt] ─→ [KSampler]
                                        ↓
[ControlNet: Tile] ────────────────────┘
    ↓
[VAE Decode]
    ↓
[Save Image]
```

### Recommended Prompts

#### Grass Block
```
Positive: "grass texture, green, natural, seamless tile, 16x16 pixels, pixel art, minecraft style, top-down view"
Negative: "blurry, photorealistic, human, face, text, watermark"
```

#### Stone Block
```
Positive: "stone texture, gray rock, seamless tile, 16x16 pixels, pixel art, rough surface, cobblestone"
Negative: "smooth, shiny, colorful, text"
```

#### Dirt Block
```
Positive: "dirt texture, brown soil, seamless tile, 16x16 pixels, pixel art, earthy, ground"
Negative: "grass, plants, sky, blue"
```

#### Sand Block
```
Positive: "sand texture, tan desert sand, seamless tile, 16x16 pixels, pixel art, beach, granular"
Negative: "water, ocean, grass"
```

#### Wood Block
```
Positive: "wood planks, brown timber, seamless tile, 16x16 pixels, pixel art, wooden texture, oak"
Negative: "metal, stone, leaves"
```

### Settings

| Parameter | Value | Reason |
|-----------|-------|--------|
| Steps | 20-25 | Faster, good quality |
| CFG Scale | 7.0 | Balanced |
| Resolution | 512x512 → downscale | Better detail |
| Sampler | DPM++ 2M Karras | Fast, good quality |
| Seed | Random | Variety |

### Post-Processing

1. **Downscale** generated 512x512 to 16x16
2. **Check seamlessness** (tile 2x2 grid)
3. **Adjust colors** if needed (brightness/contrast)
4. **Export as PNG**

---

## Workflow 2: Character Sprites (32x32)

**Purpose:** Generate character sprites with multiple poses

**Output:** 32x32 pixel character sprites

**Generation Time:**
- CPU: 4-5 minutes per sprite
- GPU: 8-12 seconds

### Setup

**Required Models:**
- Stable Diffusion 1.5
- ControlNet OpenPose (for pose control)

### Workflow Structure

```
[Load Checkpoint: SD 1.5]
    ↓
[CLIP Text Encode: Character Description] ───┐
                                              ↓
[CLIP Text Encode: Negative] ──────────────→ [KSampler]
                                              ↓
[ControlNet: OpenPose] ───────────────────────┘
    ↓
[VAE Decode]
    ↓
[Save Image]
```

### Recommended Prompts

#### Generic NPC
```
Positive: "pixel art character, 32x32, front view, standing pose, simple design, game sprite, 2D character, retro game style"
Negative: "3D, photorealistic, detailed background, multiple characters, blurry"
```

#### Warrior Character
```
Positive: "pixel art warrior, 32x32, sword and shield, armor, front view, standing, game sprite, medieval knight"
Negative: "modern clothes, gun, vehicle, background"
```

#### Villager Character
```
Positive: "pixel art villager, 32x32, simple clothes, farmer, front view, standing, game sprite, friendly NPC"
Negative: "armor, weapons, scary, monster"
```

### Multi-Directional Sprites

For each character, generate 4 directions:

1. **Front view:** "front view, facing camera"
2. **Back view:** "back view, facing away"
3. **Left view:** "left side view, profile"
4. **Right view:** "right side view, profile"

### Animation Frames

For walking animation (3 frames per direction):

1. **Frame 0:** "standing, legs together"
2. **Frame 1:** "walking, left leg forward"
3. **Frame 2:** "walking, right leg forward"

**Total:** 4 directions × 3 frames = 12 sprites per character

### Settings

| Parameter | Value |
|-----------|-------|
| Steps | 25 |
| CFG Scale | 7.5 |
| Resolution | 512x512 → downscale to 32x32 |
| Sampler | Euler a |

---

## Workflow 3: Item Icons (16x16)

**Purpose:** Generate inventory items, tools, weapons

**Output:** 16x16 centered icons, transparent background

**Generation Time:**
- CPU: 2-3 minutes
- GPU: 5-8 seconds

### Workflow Structure

```
[Load Checkpoint: SD 1.5]
    ↓
[CLIP Text Encode: Item Description] ───┐
                                         ↓
[CLIP Text Encode: Negative] ─────────→ [KSampler]
                                         ↓
[VAE Decode]
    ↓
[Background Removal Node] (optional)
    ↓
[Save Image]
```

### Recommended Prompts

#### Sword
```
Positive: "pixel art sword icon, 16x16, simple design, centered, game item, RPG weapon, steel blade"
Negative: "character, background, multiple items, text"
```

#### Potion
```
Positive: "pixel art potion bottle, 16x16, red liquid, glass bottle, centered, game item, health potion"
Negative: "character, background, realistic"
```

#### Coin
```
Positive: "pixel art gold coin, 16x16, shiny, centered, game item, currency, round"
Negative: "character, background, paper money"
```

#### Key
```
Positive: "pixel art key, 16x16, golden key, simple design, centered, game item, old key"
Negative: "modern key, car key, background"
```

---

## Workflow 4: UI Elements

**Purpose:** Generate buttons, borders, decorative elements

**Output:** Various sizes, themed UI assets

### Recommended Prompts

#### Button
```
Positive: "pixel art button, game UI, wooden button, rounded, medieval style, 32x16 pixels"
Negative: "modern, realistic, 3D"
```

#### Border
```
Positive: "pixel art border, decorative frame, ornate, medieval style, stone texture"
Negative: "modern, minimalist, flat"
```

---

## Batch Generation Strategy

### Overnight Asset Generation

**Goal:** Generate 50+ textures while you sleep

1. **Queue Setup**
   - Use ComfyUI's batch feature
   - Set seeds: 1, 2, 3, 4, ... 50
   - Same prompt, different seeds = variations

2. **Script (Advanced)**
   ```python
   # Use ComfyUI API to queue multiple generations
   # See: comfyui-api-batch-example.py
   ```

3. **Manual Method**
   - Queue prompt
   - Change seed
   - Queue again
   - Repeat 50 times (5 minutes of clicking)
   - Go to sleep
   - Wake up to 50 assets!

**Estimated Time:**
- 50 textures × 3 minutes = 150 minutes (2.5 hours)
- Perfect for overnight!

---

## Quality Control

### Checklist for Block Textures
- [ ] Seamless tiling (no visible edges)
- [ ] Correct color palette
- [ ] No text or watermarks
- [ ] 16x16 pixels exact
- [ ] PNG format
- [ ] Recognizable as intended material

### Checklist for Characters
- [ ] Clear silhouette
- [ ] Centered properly
- [ ] Correct size (32x32)
- [ ] Consistent style across frames
- [ ] No background artifacts

### Checklist for Items
- [ ] Centered in frame
- [ ] Clear, recognizable icon
- [ ] Good contrast
- [ ] 16x16 pixels
- [ ] Transparent background (if needed)

---

## Prompt Engineering Tips

### Do's
✅ Use "pixel art" in prompt
✅ Specify exact dimensions
✅ Use "seamless" for textures
✅ Use "centered" for icons
✅ Reference game styles (Minecraft, Terraria, etc.)
✅ Keep prompts simple and clear

### Don'ts
❌ Don't use realistic/photorealistic
❌ Don't include multiple subjects
❌ Don't add backgrounds for icons
❌ Don't use overly complex descriptions
❌ Don't forget negative prompts

---

## Workflow Files

Pre-made workflow JSON files (to be created):

- `block_texture_workflow.json` - Block texture generator
- `character_sprite_workflow.json` - Character sprite generator
- `item_icon_workflow.json` - Item icon generator
- `batch_texture_workflow.json` - Batch texture generation

**To use:**
1. Drag JSON file into ComfyUI window
2. Modify prompts
3. Queue generation

---

## Advanced: Custom Nodes

Useful custom nodes for game asset generation:

### 1. ComfyUI-Image-Filters
- **Use:** Downscaling, color adjustments
- **Install:** Via ComfyUI Manager

### 2. ComfyUI-TiledKSampler
- **Use:** Better seamless textures
- **Install:** Via ComfyUI Manager

### 3. ComfyUI-AnimateDiff
- **Use:** Animated sprites (advanced)
- **Install:** Via ComfyUI Manager

---

## Export Pipeline

### Automated Export Script

```javascript
// tools/asset-generator/comfyui/export-assets.js
// Automatically copy ComfyUI outputs to game /images folder
// Rename and organize by asset type
```

### Manual Export

1. **Navigate to** `ComfyUI/output/`
2. **Find generated images**
3. **Downscale if needed** (512x512 → 16x16 or 32x32)
4. **Copy to** `cornerstone/wave/images/`
5. **Update sprite references** in code

---

## Performance Benchmarks

### CPU Mode (Intel i7-8700K)
| Asset Type | Time per Asset | Overnight Batch |
|------------|----------------|-----------------|
| 16x16 Texture | 2.5 min | 60 assets |
| 32x32 Character | 4 min | 40 assets |
| 16x16 Item | 2.5 min | 60 assets |

### GPU Mode (RTX 3060)
| Asset Type | Time per Asset | Overnight Batch |
|------------|----------------|-----------------|
| 16x16 Texture | 8 sec | 1000+ assets |
| 32x32 Character | 12 sec | 700+ assets |
| 16x16 Item | 8 sec | 1000+ assets |

---

## Next Steps

1. **Start with textures** - Easiest to generate
2. **Build texture library** - 20-30 block types
3. **Move to characters** - More complex, needs refinement
4. **Generate items** - Quick and fun
5. **Iterate and refine** - Regenerate with better prompts

---

## Troubleshooting

### "Assets don't look pixelated"
- Make sure "pixel art" is in prompt
- Try different sampler (Euler a works well)
- Increase CFG scale to 8-9

### "Textures aren't seamless"
- Use ControlNet Tile
- Add "seamless, tileable" to prompt
- Try TiledKSampler custom node

### "Colors are wrong"
- Adjust prompt (be more specific about colors)
- Use img2img to refine
- Post-process in image editor

---

**Happy generating! May your overnight batches be bountiful! 🎨**
