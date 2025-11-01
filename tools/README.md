# Cornerstone Tools Directory

This directory contains asset generation, audio synthesis, and development tools for the Cornerstone project.

## 📁 Directory Structure

```
tools/
├── asset-generator/          # Procedural asset generation
│   ├── index.html           # Main UI for asset generators
│   ├── procedural/          # Procedural generation algorithms
│   │   ├── noise.js         # Perlin/Simplex noise
│   │   ├── texture-generator.js
│   │   ├── character-generator.js
│   │   └── item-generator.js
│   ├── comfyui/             # ComfyUI integration
│   │   ├── INSTALLATION.md  # ComfyUI setup guide
│   │   └── WORKFLOWS.md     # Asset generation workflows
│   └── utils/               # Utility functions
│       └── sprite-packer.js # Sprite sheet packing
│
└── audio/                    # Audio generation tools
    ├── SCHUMANN_RESONANCE.md # Documentation
    ├── schumann-audio-generator.js
    └── schumann-demo.html    # Test/demo page
```

---

## 🎨 Asset Generation

### Quick Start: Procedural Generator

1. **Open in browser:**
   ```
   wave/tools/asset-generator/index.html
   ```

2. **Generate assets:**
   - Click "Generate All Textures" for block textures
   - Adjust seed for variations
   - Download individual or batch export

3. **Export to game:**
   - Download assets
   - Place in `wave/images/` directory
   - Update sprite references in code

### Features

- **Block Textures (16x16):** Grass, stone, dirt, sand, water, wood, etc.
- **Character Sprites (32x32):** Procedural NPCs with animations
- **Item Icons (16x16):** Weapons, tools, potions, and more
- **Sprite Sheet Packing:** Combine assets into texture atlases

### Customization

```javascript
// Generate custom texture
const generator = new TextureGenerator(seed);
const texture = generator.generateTexture('grass', 16);

// Generate character
const charGen = new CharacterGenerator(seed);
const sprite = charGen.generateSpriteSheet({
  size: 32,
  skinTone: '#FFE0BD',
  hairColor: '#2C1B18',
  clothingColor: '#0000FF'
});

// Generate item
const itemGen = new ItemGenerator(seed);
const sword = itemGen.generateIcon('sword', 16);
```

---

## 🤖 ComfyUI Integration

### Installation

See detailed guide: `asset-generator/comfyui/INSTALLATION.md`

**Quick setup (Windows, CPU mode):**

1. Download ComfyUI portable
2. Run `run_cpu.bat`
3. Download Stable Diffusion 1.5 model
4. Place in `ComfyUI/models/checkpoints/`
5. Start generating!

### Workflows

Pre-configured workflows for:
- Block textures (seamless, 16x16)
- Character sprites (4 directions × 3 frames)
- Item icons (centered, transparent)
- UI elements

See: `asset-generator/comfyui/WORKFLOWS.md`

### Overnight Batch Generation

Perfect for CPU users:
```
1. Queue 50+ prompts in ComfyUI
2. Go to sleep (8 hours)
3. Wake up to complete asset library!
```

CPU: ~3 min/texture = 160 textures overnight
GPU: ~8 sec/texture = 3600+ textures overnight

---

## 🎵 Schumann Resonance Audio

### What is it?

The Schumann Resonance is Earth's natural electromagnetic frequency (7.83 Hz), matching human alpha brain waves. Used for:

- Calming ambient soundscapes
- Meditation/prayer areas
- Background atmosphere
- Therapeutic gameplay

### Two Systems Available

#### 1. Procedural (Simple)
Pure sine waves at exact Schumann frequencies.
- ✅ Mathematically perfect frequencies
- ✅ Zero setup, instant generation
- ❌ Sounds synthetic

**Demo:** `wave/tools/audio/schumann-demo.html`

#### 2. Hybrid AI + Procedural (Recommended)
Combines exact frequencies with AI-generated organic texture.
- ✅ Exact base frequencies (7.83 Hz, 14.3 Hz, etc.)
- ✅ Rich, organic AI-generated harmonics
- ✅ Best of both worlds: precision + beauty

**Demo:** `wave/tools/audio/hybrid-demo.html`

### Quick Start - Hybrid System

1. **Generate AI textures** (one-time setup):
   ```bash
   # See: audio/AI_AUDIO_SETUP.md for detailed instructions
   # Quick version:
   pip install diffusers transformers accelerate torch scipy
   python audio/generate_schumann_textures.py
   ```

2. **Open hybrid demo:**
   ```
   wave/tools/audio/hybrid-demo.html
   ```

3. **Test different presets:**
   - Ambient: General exploration
   - Meditation: Prayer zones
   - Energetic: Higher harmonics
   - Night: Pure fundamental
   - Grounding: Deep bass

### Integration Example - Hybrid

```javascript
// Initialize hybrid player
const schumannPlayer = new HybridSchumannPlayer();
await schumannPlayer.init();

// Play ambient preset (5% volume)
await schumannPlayer.playPreset('ambient');

// Or play specific mode
await schumannPlayer.play('meditation', 0.1);

// Adjust mix ratio (40% procedural, 60% AI texture)
schumannPlayer.setMixRatio(40);

// Stop
schumannPlayer.stop();
```

### Documentation

- **Overview:** `audio/SCHUMANN_RESONANCE.md`
- **AI Generation:** `audio/AI_AUDIO_GENERATION.md`
- **Quick Setup:** `audio/AI_AUDIO_SETUP.md`
- **Code:** `audio/hybrid-schumann-player.js`

### Safety Notes

⚠️ **Important:**
- Always allow user to disable
- Keep volume very low (5-10%)
- Add natural variation (not constant static tone)
- Provide volume control
- No medical claims

---

## 🚀 Quick Start Guide

### For Asset Creation

**Option A: Procedural (Instant)**
1. Open `asset-generator/index.html`
2. Click "Generate Everything!"
3. Download assets
4. Copy to `wave/images/`

**Option B: AI-Generated (High Quality)**
1. Install ComfyUI (see INSTALLATION.md)
2. Load workflow template
3. Batch generate overnight
4. Export to `wave/images/`

### For Audio Integration

1. Copy `schumann-audio-generator.js` to `wave/lib/`
2. Import in `main.ts`:
   ```typescript
   import { SchumannPlayer } from './lib/schumann-audio-generator.js';
   ```
3. Initialize on user interaction:
   ```typescript
   const audio = new SchumannPlayer();
   await audio.init();
   audio.playAmbient(0.05);
   ```

---

## 📖 Documentation

### Asset Generation
- **Procedural Generators:** See source code comments
- **ComfyUI Setup:** `asset-generator/comfyui/INSTALLATION.md`
- **ComfyUI Workflows:** `asset-generator/comfyui/WORKFLOWS.md`

### Audio
- **Schumann Resonance:** `audio/SCHUMANN_RESONANCE.md`
- **API Reference:** See `schumann-audio-generator.js` JSDoc
- **Demo:** `audio/schumann-demo.html`

---

## 🔧 Development

### Adding New Texture Types

```javascript
// In texture-generator.js
generateMyTexture(imageData, size) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const noise = this.perlin.noise(x / scale, y / scale);
      const color = /* your logic */;
      this.setPixel(imageData, x, y, color);
    }
  }
}
```

### Adding New Audio Modes

```javascript
// In schumann-audio-generator.js
createMyCustomMode() {
  // Your audio synthesis logic
  const osc = this.audioContext.createOscillator();
  // ... configure and return
}
```

---

## 🎯 Roadmap Integration

These tools directly support Phase 1 of the Cornerstone roadmap:

### ✅ Completed
- [x] Browser-based procedural texture generator
- [x] Character sprite generator
- [x] Item icon generator
- [x] Sprite sheet packer
- [x] ComfyUI installation guide
- [x] ComfyUI workflow templates
- [x] Schumann resonance audio system

### 🔄 Next Steps
- [ ] Create sample workflow JSON files for ComfyUI
- [ ] Build auto-export script (ComfyUI → wave/images)
- [ ] Implement hot-reload for asset changes
- [ ] Add more texture types (ore variants, special blocks)
- [ ] Create Bible verse text-to-voxel system
- [ ] Integrate Schumann audio into main game loop

---

## 🤝 Contributing

To add new generators or tools:

1. Follow existing code style
2. Add comprehensive JSDoc comments
3. Create demo/test HTML if applicable
4. Update this README
5. Test cross-browser compatibility

---

## 📜 License

- **Code:** MIT License (see LICENSE.txt in project root)
- **Generated Assets:** Your choice (recommend CC0 or CC-BY)
- **ComfyUI:** GPL-3.0 (separate installation)
- **Models:** Check individual model licenses

**Note:** Minecraft/Pokemon assets in `images/` are NOT licensed for use. Replace with procedurally generated or properly licensed assets before distribution.

---

## 🆘 Troubleshooting

### Asset Generator Issues

**Problem:** Textures look blurry
- **Solution:** Disable image smoothing in browser
- Browser may interpolate when scaling
- Download at native resolution

**Problem:** Character sprites have weird colors
- **Solution:** Adjust random seed
- Some seeds produce better results
- Try seed ± 100 for variations

### ComfyUI Issues

**Problem:** Out of memory
- **Solution:** Use SD 1.5 instead of SDXL
- Close other programs
- Reduce image resolution
- Enable swap file

**Problem:** Generation is very slow
- **Solution:** This is normal for CPU mode!
- Use batch overnight generation
- Consider cloud GPU (Runpod, Vast.ai)

### Audio Issues

**Problem:** Binaural beats don't work
- **Solution:** Must use headphones
- Different frequency per ear required
- Try isochronic mode instead

**Problem:** Audio won't start
- **Solution:** Must call init() after user interaction
- Browser autoplay policies require user gesture
- Add click handler to init audio

---

## 📚 Additional Resources

### Asset Creation
- **Noise Algorithms:** https://adrianb.io/2014/08/09/perlinnoise.html
- **Pixel Art:** https://lospec.com/pixel-art-tutorials
- **ComfyUI:** https://github.com/comfyanonymous/ComfyUI

### Audio
- **Web Audio API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Binaural Beats:** https://en.wikipedia.org/wiki/Binaural_beat
- **Schumann Resonance:** https://en.wikipedia.org/wiki/Schumann_resonances

### Game Development
- **Voxel Engines:** https://0fps.net/2012/06/30/meshing-in-a-minecraft-game/
- **Sprite Sheets:** https://www.codeandweb.com/texturepacker/tutorials
- **WebAssembly:** https://webassembly.org/

---

## 💡 Tips

### For Overnight Generation
1. **Queue 50+ textures in ComfyUI**
2. **Set PC to not sleep** (Windows: Power settings)
3. **Close unnecessary programs**
4. **Go to bed** (8 hours = 160 textures on CPU)
5. **Wake up to asset library!**

### For Best Results
- **Procedural:** Use for rapid prototyping, placeholders
- **ComfyUI:** Use for final, polished assets
- **Mix both:** Procedural for testing, AI for release

### For Performance
- **Sprite sheets** reduce draw calls (use sprite-packer.js)
- **Power-of-2 textures** (16, 32, 64, 128) optimize GPU
- **Minimize alpha** (transparency) for better performance

---

**Happy creating! May your assets be plentiful and your frequencies harmonic! 🎨🎵**
