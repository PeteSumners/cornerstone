# AI Audio Setup Guide - Quick Start

Get AI-generated Schumann resonance textures in 3 steps.

---

## Option 1: AudioLDM2 (Recommended - Local)

### Installation

```bash
# Install dependencies
pip install diffusers transformers accelerate torch scipy

# Or install audiocraft for CPU-optimized version
pip install audiocraft
```

### Generate Textures

Create `generate_schumann_textures.py`:

```python
from diffusers import AudioLDM2Pipeline
import torch
import scipy.io.wavfile as wavfile

# Initialize (downloads model on first run ~2GB)
pipe = AudioLDM2Pipeline.from_pretrained("cvssp/audioldm2")

# Use CPU or GPU
device = "cuda" if torch.cuda.is_available() else "cpu"
pipe.to(device)

# Texture library
textures = {
    "ambient": """
        Deep harmonic drone at 7.83 Hz fundamental frequency,
        warm analog synthesizer pads, slowly evolving organic textures,
        peaceful ambient soundscape for meditation
    """,

    "meditation": """
        Pure theta wave 7.83 Hz Schumann resonance,
        minimal movement, deep peaceful drone,
        grounding Earth frequency, timeless and eternal
    """,

    "energetic": """
        Bright harmonic layers at 20.8 Hz and 27.3 Hz,
        alpha wave frequencies, energetic ambient drone,
        shimmering crystalline overtones, uplifting atmosphere
    """,

    "night": """
        Very deep bass drone at 7.83 Hz fundamental,
        dark ambient soundscape, low frequency resonance,
        sleep meditation, peaceful night atmosphere
    """,

    "deep": """
        Ultra-low frequency drone at 7.83 Hz,
        sub-bass harmonics, grounding Earth frequency,
        deep meditative state, powerful and centering
    """
}

negative_prompt = """
    percussion, drums, rhythm, beats, melody, vocals,
    harsh, digital, synthetic noise, distortion
"""

# Generate all textures
for name, prompt in textures.items():
    print(f"Generating {name}...")

    audio = pipe(
        prompt,
        negative_prompt=negative_prompt,
        num_inference_steps=200,
        audio_length_in_s=60.0
    ).audios[0]

    # Save
    filename = f"schumann_{name}.wav"
    wavfile.write(filename, rate=16000, data=audio)
    print(f"✓ Saved: {filename}")

print("\nDone! Generated 5 textures.")
```

### Run It

```bash
python generate_schumann_textures.py

# Wait 10-15 minutes on CPU (or 2-3 min on GPU)
# Output: schumann_ambient.wav, schumann_meditation.wav, etc.
```

### Move to Game

```bash
# Create directory
mkdir -p wave/audio/schumann/

# Copy textures
mv schumann_*.wav wave/audio/schumann/

# Done! Ready for hybrid player
```

---

## Option 2: ComfyUI Audio Nodes (Easiest)

### Setup

1. **Install ComfyUI** (see `../asset-generator/comfyui/INSTALLATION.md`)

2. **Install Audio Node:**
   ```bash
   cd ComfyUI/custom_nodes
   git clone https://github.com/gokayfem/ComfyUI_VLM_nodes.git
   cd ..
   ```

3. **Restart ComfyUI**

### Generate

1. Open ComfyUI in browser
2. Add "AudioLDM2Node"
3. Enter prompt:
   ```
   Deep harmonic drone at 7.83 Hz fundamental,
   warm analog pads, peaceful ambient meditation
   ```
4. Set duration: 60 seconds
5. Set format: WAV
6. Queue Prompt
7. Wait 2-3 minutes
8. Download from `output/` folder

### Repeat for All Textures

Generate 5 variations (ambient, meditation, energetic, night, deep) with different prompts.

---

## Option 3: Stable Audio (Highest Quality, Cloud)

### Setup

1. Go to https://stableaudio.com
2. Create account (free tier available)
3. Navigate to "Create"

### Generate

1. **Prompt:**
   ```
   Deep harmonic drone at 7.83 Hz Schumann resonance,
   warm analog synthesizer texture, meditative ambient soundscape,
   peaceful and grounding, theta wave frequency
   ```

2. **Negative Prompt:**
   ```
   percussion, drums, rhythm, melody, vocals
   ```

3. **Duration:** 60 seconds (or 3 minutes with paid tier)

4. **Generate** and download WAV

5. Repeat for all 5 textures

### Move to Game

Same as Option 1 - place in `wave/audio/schumann/`

---

## Verify Textures

Check that files exist:

```bash
ls wave/audio/schumann/

# Should show:
# schumann_ambient.wav
# schumann_meditation.wav
# schumann_energetic.wav
# schumann_night.wav
# schumann_deep.wav
```

---

## Test Hybrid Player

Open `hybrid-demo.html` in browser:

1. Click "Initialize Audio"
2. Click "Play (Ambient)"
3. Adjust "Mix Ratio" slider
4. Try different presets
5. Toggle harmonics on/off

**If textures don't load:** Check console for errors. Files must be named exactly as above.

---

## Next Steps

1. ✅ Generate textures (pick one option above)
2. ✅ Test in hybrid-demo.html
3. ⬜ Integrate into main game
4. ⬜ Add user controls (volume, enable/disable)
5. ⬜ Create zone triggers (meditation areas, etc.)

---

## Troubleshooting

### "Model not found"
- First run downloads ~2GB model
- Check internet connection
- Wait for download to complete

### "Out of memory"
- Use CPU mode (slower but works)
- Close other programs
- Generate one texture at a time

### "Textures sound wrong"
- AI doesn't guarantee exact frequencies (that's OK!)
- Procedural layer provides precision
- AI layer adds organic texture
- Adjust mix ratio if too synthetic or too "AI-y"

### "Files won't load in hybrid player"
- Check file paths
- Ensure files are named exactly: `schumann_ambient.wav`, etc.
- Check browser console for errors
- Files must be in `wave/audio/schumann/` directory

---

## Performance Tips

### CPU Mode (Slow but Free)
- 2-3 min per 60-second texture
- 5 textures = 10-15 minutes total
- Queue overnight for batch generation

### GPU Mode (Fast)
- 10-30 sec per texture
- 5 textures = 1-2 minutes total
- Requires NVIDIA GPU

### Cloud (Stable Audio)
- Instant generation
- Highest quality
- May have API costs

---

**Choose what works for you!** All three options produce great results.
