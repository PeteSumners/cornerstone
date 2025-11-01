# AI Audio Generation for Schumann Resonance

## Overview

This guide covers AI-generated audio for Schumann resonance soundscapes, using a **hybrid architecture** that ensures exact frequency accuracy while adding organic, AI-generated texture.

**Critical Constraint:** Schumann frequencies must be mathematically exact (7.83 Hz, 14.3 Hz, 20.8 Hz, etc.). AI audio is used to enhance, not replace, these precise frequencies.

---

## Hybrid Architecture

### The Problem

- **Procedural audio:** Exact frequencies ✅, but sounds synthetic ❌
- **AI-generated audio:** Organic sound ✅, but no frequency guarantees ❌

### The Solution: Hybrid Layering

```
┌─────────────────────────────────────┐
│   Layer 1: Procedural Base          │
│   • Exact 7.83 Hz, 14.3 Hz, etc.    │
│   • Mathematically perfect          │
│   • Web Audio API oscillators       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Layer 2: AI Texture               │
│   • Organic harmonics               │
│   • Natural variation               │
│   • Rich overtones                  │
│   • AudioLDM2/MusicGen/Stable Audio │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Mixed Output                      │
│   • Exact base frequencies          │
│   • Natural, organic sound          │
│   • Best of both worlds             │
└─────────────────────────────────────┘
```

**Result:** Precision + Beauty

---

## AI Audio Tools

### 1. AudioLDM-2 (Recommended)

**Why it's best:**
- ✅ Can integrate with ComfyUI
- ✅ Runs locally (no API costs)
- ✅ Good at ambient/drone generation
- ✅ Fast (relatively)
- ✅ Open source

**Installation:**

```bash
# Install AudioLDM2
pip install diffusers transformers accelerate

# Or for ComfyUI integration
cd ComfyUI/custom_nodes
git clone https://github.com/gokayfem/ComfyUI_VLM_nodes.git
```

**Python Example:**

```python
from diffusers import AudioLDM2Pipeline
import torch
import scipy.io.wavfile as wavfile

# Initialize (one-time setup)
pipe = AudioLDM2Pipeline.from_pretrained(
    "cvssp/audioldm2",
    torch_dtype=torch.float16
)
pipe.to("cuda")  # Or "cpu" for CPU-only

# Generate Schumann-inspired ambient texture
prompt = """
Deep harmonic drone at 7.83 Hz fundamental frequency,
rich organic overtones, ambient meditation soundscape,
warm analog synthesizer texture, slowly evolving harmonics,
theta wave resonance, peaceful and grounding
"""

negative_prompt = """
percussion, drums, rhythm, beats, melody, vocals,
harsh, digital, synthetic, noise, distortion
"""

audio = pipe(
    prompt,
    negative_prompt=negative_prompt,
    num_inference_steps=200,
    audio_length_in_s=60.0,  # 60 seconds
    audio_end_in_s=60.0
).audios[0]

# Save as WAV
wavfile.write("schumann_texture.wav", rate=16000, data=audio)
```

**ComfyUI Workflow:**

1. Install `ComfyUI_VLM_nodes` custom node
2. Add `AudioLDM2Node` to workflow
3. Enter prompt (see examples below)
4. Set duration: 30-60 seconds
5. Output format: WAV (best quality)
6. Queue and generate

---

### 2. MusicGen (Meta)

**Why use it:**
- ✅ Better at "musical" content
- ✅ Melody guidance via chromagrams
- ✅ Open source, runs locally
- ❌ Slower than AudioLDM2
- ❌ Less control over "pure drone"

**Installation:**

```bash
pip install audiocraft
```

**Python Example:**

```python
from audiocraft.models import MusicGen
import torchaudio

# Load model
model = MusicGen.get_pretrained('facebook/musicgen-large')

# Configure
model.set_generation_params(
    duration=60,  # 60 seconds
    temperature=1.0,
    top_k=250
)

# Generate
prompt = [
    "Ambient drone soundscape with deep bass harmonics at 7.83 Hz, "
    "meditative theta wave frequencies, peaceful and grounding, "
    "slow evolving texture, no percussion or rhythm"
]

wav = model.generate(prompt)

# Save
torchaudio.save('schumann_musicgen.wav', wav[0].cpu(), sample_rate=32000)
```

---

### 3. Stable Audio (Stability AI)

**Why use it:**
- ✅ Highest quality output
- ✅ Up to 3 minutes duration
- ✅ Great for ambient/soundscape
- ❌ Cloud-based (API costs)
- ❌ Requires account

**Best for:** Final production-quality audio when you need the absolute best.

**Usage:** Via https://stableaudio.com or API

---

## Prompt Engineering for Schumann Audio

### Effective Prompts

**Template:**
```
[Frequency description] + [Texture] + [Mood] + [Technical qualities] - [Exclusions]
```

**Examples:**

```
1. Pure Drone:
"Deep bass drone at 7.83 Hz fundamental, sustained low frequency
resonance, warm analog oscillator texture, slowly shifting harmonics,
minimal variation, meditative"

Negative: "percussion, rhythm, melody, beats, drums, vocals"

2. Rich Harmonic:
"Layered harmonic drone with 7.83 Hz fundamental and natural overtones,
organic synthesizer pads, crystalline high frequencies, theta wave
resonance, peaceful ambient soundscape"

Negative: "harsh, digital, synthetic, noise, rhythm, percussion"

3. Meditative:
"Schumann resonance at 7.83 Hz, Earth's electromagnetic heartbeat,
theta wave meditation, deep grounding frequency, warm and peaceful,
minimal movement, timeless"

Negative: "busy, complex, melodic, rhythmic, percussive"

4. Energetic (higher harmonics):
"Bright harmonic layers at 20.8 Hz and 27.3 Hz, energetic overtones,
alpha wave frequencies, uplifting ambient drone, shimmering textures"

Negative: "bass, low frequency, slow, dark, percussion"
```

### Keywords That Work

**For Texture:**
- drone, pad, sustained, continuous, evolving
- warm, organic, analog, crystalline, ethereal
- harmonic, overtones, resonance, frequency

**For Mood:**
- meditative, peaceful, grounding, calming
- deep, immersive, therapeutic, healing
- minimal, subtle, gentle, flowing

**For Technical:**
- low frequency, bass, theta wave, alpha wave
- 7.83 Hz, fundamental, harmonic layers
- no transients, sustained tones

**To Exclude:**
- percussion, drums, beats, rhythm
- melody, vocals, lyrics
- harsh, noise, distortion, digital

---

## Hybrid Implementation

### Architecture

```javascript
class HybridSchumannPlayer {
  constructor() {
    this.audioContext = new AudioContext();

    // Layer 1: Procedural base (exact frequencies)
    this.proceduralLayer = this.createProceduralLayer();

    // Layer 2: AI texture (pre-generated)
    this.textureLayer = this.createTextureLayer();

    // Mixer
    this.mixer = this.createMixer();
  }

  createProceduralLayer() {
    // Exact Schumann frequencies
    const frequencies = [7.83, 14.3, 20.8, 27.3, 33.8];
    const oscillators = [];
    const gainNode = this.audioContext.createGain();

    frequencies.forEach((freq, i) => {
      // Multiply by 32 to bring into audible range
      const osc = this.audioContext.createOscillator();
      osc.frequency.value = freq * 32;
      osc.type = 'sine';

      // Natural variation (±0.5 Hz)
      const lfo = this.audioContext.createOscillator();
      lfo.frequency.value = 0.1; // Slow variation
      const lfoGain = this.audioContext.createGain();
      lfoGain.gain.value = 0.5; // ±0.5 Hz modulation

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // Volume (fundamental loudest, harmonics quieter)
      const oscGain = this.audioContext.createGain();
      oscGain.gain.value = 1.0 / (i + 1);

      osc.connect(oscGain);
      oscGain.connect(gainNode);

      oscillators.push({ osc, lfo });
    });

    return { gainNode, oscillators };
  }

  createTextureLayer() {
    // Load pre-generated AI audio
    const audioElement = new Audio('schumann_texture.wav');
    const source = this.audioContext.createMediaElementSource(audioElement);
    const gainNode = this.audioContext.createGain();

    // Loop the texture
    audioElement.loop = true;

    source.connect(gainNode);

    return { gainNode, audioElement };
  }

  createMixer() {
    const masterGain = this.audioContext.createGain();

    // Mix ratio: 40% procedural, 60% texture
    this.proceduralLayer.gainNode.gain.value = 0.4;
    this.textureLayer.gainNode.gain.value = 0.6;

    // Connect to master
    this.proceduralLayer.gainNode.connect(masterGain);
    this.textureLayer.gainNode.connect(masterGain);

    masterGain.connect(this.audioContext.destination);

    return masterGain;
  }

  async play(volume = 0.1) {
    // Start procedural layer
    this.proceduralLayer.oscillators.forEach(({ osc, lfo }) => {
      osc.start();
      lfo.start();
    });

    // Start texture layer
    await this.textureLayer.audioElement.play();

    // Set master volume
    this.mixer.gain.value = volume;
  }

  stop() {
    this.proceduralLayer.oscillators.forEach(({ osc, lfo }) => {
      osc.stop();
      lfo.stop();
    });

    this.textureLayer.audioElement.pause();
  }

  setMixRatio(proceduralPercent) {
    // proceduralPercent: 0-100
    this.proceduralLayer.gainNode.gain.value = proceduralPercent / 100;
    this.textureLayer.gainNode.gain.value = (100 - proceduralPercent) / 100;
  }
}
```

### Usage

```javascript
// Initialize
const player = new HybridSchumannPlayer();

// Play with 5% master volume
await player.init();
await player.play(0.05);

// Adjust mix (50% procedural, 50% texture)
player.setMixRatio(50);

// Stop
player.stop();
```

---

## Workflow: Generate AI Texture

### Step 1: Choose Tool

- **Quick test:** AudioLDM2 (2-3 min on CPU)
- **High quality:** Stable Audio (cloud, best quality)
- **Musical:** MusicGen (5-10 min on CPU)

### Step 2: Generate Multiple Variations

Generate 3-5 variations with different prompts:

```python
prompts = [
    "Deep bass drone 7.83 Hz, warm analog, meditative",
    "Harmonic layers 7.83 Hz fundamental, crystalline overtones",
    "Theta wave 7.83 Hz, organic pads, peaceful ambient",
    "Schumann resonance Earth heartbeat, grounding frequency",
    "Low frequency resonance 7.83 Hz, timeless and eternal"
]

for i, prompt in enumerate(prompts):
    audio = pipe(prompt, negative_prompt=negative_prompt).audios[0]
    wavfile.write(f"schumann_texture_{i}.wav", rate=16000, data=audio)
```

### Step 3: Select Best

Listen to each variation and choose the most:
- Organic sounding
- Minimal transients
- Complementary to procedural base
- Not too busy or melodic

### Step 4: Export to Game

```
1. Place selected WAV in: wave/audio/schumann/
2. Update HybridSchumannPlayer to load it
3. Test in-game
4. Adjust mix ratio as needed
```

---

## Advanced: Frequency Verification

Want to verify the AI audio actually contains the right frequencies? Use FFT analysis:

```python
import numpy as np
import scipy.io.wavfile as wavfile
import matplotlib.pyplot as plt

# Load audio
rate, data = wavfile.read('schumann_texture.wav')

# Convert to mono if stereo
if len(data.shape) > 1:
    data = data.mean(axis=1)

# FFT
fft = np.fft.fft(data)
frequencies = np.fft.fftfreq(len(data), 1/rate)

# Plot
plt.figure(figsize=(12, 6))
plt.plot(frequencies[:len(frequencies)//2],
         np.abs(fft[:len(fft)//2]))
plt.xlim(0, 100)  # Focus on 0-100 Hz
plt.xlabel('Frequency (Hz)')
plt.ylabel('Magnitude')
plt.title('Frequency Spectrum')

# Mark Schumann frequencies
schumann_freqs = [7.83, 14.3, 20.8, 27.3, 33.8, 39.0, 45.0]
for freq in schumann_freqs:
    plt.axvline(x=freq * 32, color='r', linestyle='--', alpha=0.5)

plt.show()

# Check for presence of fundamental
fundamental_range = (250.56 - 5, 250.56 + 5)  # 7.83 * 32 ± 5 Hz
fundamental_magnitude = np.abs(fft[
    (frequencies > fundamental_range[0]) &
    (frequencies < fundamental_range[1])
]).max()

print(f"Fundamental (250.56 Hz) magnitude: {fundamental_magnitude}")
```

**Note:** AI audio likely won't have exact peaks at Schumann frequencies - that's okay! It adds organic harmonics around those frequencies. The procedural layer provides the precision.

---

## Production Workflow

### For Game Integration

1. **Generate 3-5 AI textures** (60 seconds each)
2. **Test with hybrid player** (mix ratios)
3. **Select best texture** (most complementary)
4. **Create variations:**
   - Ambient (general exploration)
   - Meditation (prayer zones)
   - Energetic (higher harmonics for action)
   - Night (pure fundamental, deeper)
5. **Implement crossfading** between textures based on game state

### For Overnight Batch Generation

```python
# Generate 10 variations while you sleep
import time

prompts = [...] # 10 different prompts

for i, prompt in enumerate(prompts):
    print(f"Generating {i+1}/10...")
    audio = pipe(prompt, negative_prompt=negative_prompt).audios[0]
    wavfile.write(f"batch/schumann_{i:02d}.wav", rate=16000, data=audio)
    print(f"Completed {i+1}/10")
    time.sleep(5)  # Brief pause between generations

print("Batch complete! Wake up to 10 Schumann textures!")
```

**On CPU:** ~3 min/texture × 10 = 30 minutes
**On GPU:** ~10 sec/texture × 10 = 100 seconds

---

## Resources

### Models

- **AudioLDM2:** https://huggingface.co/cvssp/audioldm2
- **MusicGen:** https://huggingface.co/facebook/musicgen-large
- **Stable Audio:** https://stableaudio.com

### ComfyUI Nodes

- **ComfyUI_VLM_nodes:** https://github.com/gokayfem/ComfyUI_VLM_nodes
- **SaltAI_AudioViz:** https://github.com/get-salt-AI/SaltAI_AudioViz

### Tutorials

- AudioLDM2 Colab: https://colab.research.google.com/github/sanchit-gandhi/notebooks/blob/main/AudioLDM-2.ipynb
- MusicGen Guide: https://github.com/facebookresearch/audiocraft

---

## Next Steps

1. ✅ Read this guide
2. ⬜ Install AudioLDM2 or use ComfyUI nodes
3. ⬜ Generate 3-5 test textures
4. ⬜ Implement HybridSchumannPlayer
5. ⬜ Test in game
6. ⬜ Iterate on prompts and mix ratios

---

**Result: Mathematically exact Schumann frequencies with organic, AI-generated beauty!** 🎵✨
