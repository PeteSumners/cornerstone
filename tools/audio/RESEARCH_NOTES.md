# Audio Research Notes - TO EXPLORE LATER

**Status:** Tabled for future investigation
**Date:** 2025-11-01

---

## Core Insight

Instead of mixing procedural sine waves with AI-generated audio, we should:

**Create music using a custom "Schumann Tuning System"** where every musical note IS a Schumann resonance frequency (7.83 Hz, 14.3 Hz, 20.8 Hz, etc. multiplied into audible range).

This gives us:
- ✅ Exact frequency control (mathematical guarantee)
- ✅ Organic, musical sound (AI composition)
- ✅ No mixing required (single coherent audio)

---

## Key Findings

### 1. Standard Musical Tuning Does NOT Align with Schumann

**A440 Standard (current):**
- A4 = 440 Hz (arbitrary standard from 1939)
- No relationship to natural frequencies
- Purely for instrument standardization

**A432 "Natural Tuning" (pseudoscience):**
- Claims to align with Schumann resonance (7.83 Hz)
- **FALSE:** Math doesn't work
  - 7.83 Hz × 55 octaves ≈ 422.82 Hz, NOT 432 Hz
  - Requires rounding 7.83 → 8.03 Hz
- No scientific basis

**Solfeggio Frequencies (528 Hz, etc.):**
- Limited scientific evidence
- One study showed stress reduction
- Claims about DNA repair are unsubstantiated
- Likely placebo effect

### 2. Schumann Frequencies in Audible Range

```
Schumann Harmonics × Multiplier = Audible Frequency

7.83 Hz  × 32 = 250.56 Hz  (close to B3)
14.3 Hz  × 16 = 228.80 Hz  (close to A#3)
20.8 Hz  × 16 = 332.80 Hz  (close to E4)
27.3 Hz  × 16 = 436.80 Hz  (close to A4, only 3.2 Hz off!)
33.8 Hz  × 16 = 540.80 Hz  (close to C#5)
39.0 Hz  × 16 = 624.00 Hz  (close to D#5)
45.0 Hz  × 16 = 720.00 Hz  (close to F#5)
```

**Observation:** These frequencies are CLOSE to standard notes but not exact.

---

## Proposed Solution: Custom Schumann Scale

### Approach 1: Harmonic Series

Use Schumann frequencies as the harmonic series of a fundamental tone:

```javascript
// 7.83 Hz octavized into audible range
const schumannOctaves = {
  'C2': 31.32 Hz,    // 7.83 × 4
  'C3': 62.64 Hz,    // 7.83 × 8
  'C4': 125.28 Hz,   // 7.83 × 16
  'C5': 250.56 Hz,   // 7.83 × 32 ← PRIMARY
  'C6': 501.12 Hz,   // 7.83 × 64
  'C7': 1002.24 Hz,  // 7.83 × 128
};
```

### Approach 2: Scale from All 7 Harmonics

Build a 7-note scale using each Schumann harmonic:

```javascript
const schumannScale = {
  'Root':      250.56 Hz,  // 7.83 × 32
  'Second':    228.80 Hz,  // 14.3 × 16
  'Third':     332.80 Hz,  // 20.8 × 16
  'Fourth':    436.80 Hz,  // 27.3 × 16
  'Fifth':     540.80 Hz,  // 33.8 × 16
  'Sixth':     624.00 Hz,  // 39.0 × 16
  'Seventh':   720.00 Hz,  // 45.0 × 16
};
```

**Problem:** This creates a weird scale (not standard intervals).

### Approach 3: Hybrid - Use Schumann as "Tuning Fork"

1. Start with 7.83 Hz × 32 = 250.56 Hz as "C"
2. Build standard musical intervals from there using just intonation ratios
3. All intervals derived from Schumann fundamental

```javascript
const fundamental = 250.56; // 7.83 × 32

const schumannJustScale = {
  'C': fundamental × (1/1),      // 250.56 Hz
  'D': fundamental × (9/8),      // 281.88 Hz
  'E': fundamental × (5/4),      // 313.20 Hz
  'F': fundamental × (4/3),      // 334.08 Hz
  'G': fundamental × (3/2),      // 375.84 Hz
  'A': fundamental × (5/3),      // 417.60 Hz
  'B': fundamental × (15/8),     // 469.05 Hz
};
```

**Advantage:** Sounds like normal music, but rooted in Schumann frequency.

---

## Implementation Strategies

### Strategy 1: AI Generation with Custom Scale

```python
from audiocraft.models import MusicGen

# Define Schumann-tuned scale
schumann_scale = [250.56, 281.88, 313.20, 334.08, 375.84, 417.60, 469.05]

# Generate music constrained to these frequencies
music = musicgen.generate_with_constraints(
    prompt="peaceful meditation music, ambient, slow",
    allowed_frequencies=schumann_scale,
    duration=60
)
```

**Problem:** Most AI music generators don't support custom scales directly.

### Strategy 2: Post-Processing (Pitch Quantization)

```python
# Generate normal music
music = musicgen.generate("ambient meditation")

# Extract notes and snap to nearest Schumann frequency
def quantize_to_schumann(audio, schumann_scale):
    for note in extract_notes(audio):
        nearest_freq = min(schumann_scale, key=lambda x: abs(x - note.freq))
        note.pitch_shift_to(nearest_freq)
    return audio

schumann_music = quantize_to_schumann(music, schumann_scale)
```

**Advantage:** Works with any AI generator.

### Strategy 3: Procedural with Custom Synth

```javascript
class SchumannSynth {
  constructor() {
    this.scale = [250.56, 281.88, 313.20, 334.08, 375.84, 417.60, 469.05];
  }

  playNote(scaleIndex, duration, volume = 0.5) {
    const freq = this.scale[scaleIndex];

    // Create rich synth tone with harmonics
    const fundamental = createOscillator(freq, 'sine', volume);
    const harmonic2 = createOscillator(freq * 2, 'sine', volume * 0.5);
    const harmonic3 = createOscillator(freq * 3, 'sine', volume * 0.3);

    // Add slight detuning for warmth
    const detuned = createOscillator(freq * 1.002, 'sine', volume * 0.8);

    return mixOscillators([fundamental, harmonic2, harmonic3, detuned]);
  }

  playMelody(noteSequence) {
    // noteSequence: [{scaleIndex: 0, duration: 1.0}, ...]
    // Plays melody using only Schumann-tuned notes
  }
}
```

**Advantage:** Full control, exact frequencies guaranteed.

---

## Research Questions (For Later)

1. **Does just intonation rooted in 7.83 Hz actually feel more "natural"?**
   - Need to test with users
   - Compare to A440 music
   - Measure subjective experience

2. **Can we detect Schumann alignment in existing music?**
   - Analyze classical music, ambient, etc.
   - Do certain genres naturally gravitate toward these frequencies?

3. **Optimal multiplier for 7.83 Hz?**
   - × 32 = 250.56 Hz (middle C range)
   - × 64 = 501.12 Hz (higher, brighter)
   - Which feels best for meditation/gameplay?

4. **Should we use all 7 harmonics or just the fundamental?**
   - Using all 7 creates non-standard scale
   - Using just 7.83 Hz and building from it feels more musical

5. **Hybrid systems: Mix standard tuning with Schumann "accent notes"?**
   - 90% normal A440 music
   - 10% Schumann frequencies on important beats/chords
   - Best of both worlds?

---

## Hypotheses to Test

### H1: Schumann-Tuned Music Feels More Grounding
**Test:** Create two versions of same melody:
- Version A: Standard A440 tuning
- Version B: Schumann tuning (250.56 Hz fundamental)

**Measure:** User reports of calmness, grounding, preference

### H2: Custom Scale Doesn't Sound "Off"
**Concern:** Non-standard intervals might sound dissonant

**Test:**
- Play Schumann-just scale to musicians
- Ask if it sounds "in tune" or "weird"
- Compare to standard just intonation

### H3: Frequency Precision Matters
**Question:** Is exact 250.56 Hz better than rounded 251 Hz?

**Test:**
- Version A: Exact Schumann frequencies
- Version B: Rounded to nearest Hz
- A/B test with sensitive listeners

### H4: AI Can Compose in Custom Scales
**Test:** Try these tools with custom scale constraints:
- MusicGen with melody conditioning
- Stable Audio with frequency hints in prompts
- AudioLDM2 with audio-to-audio (feed Schumann-tuned reference)

---

## Tools & Technologies

### For Music Generation
- **MusicGen** (Meta) - Melody conditioning possible
- **Stable Audio** - High quality, text prompts
- **AudioLDM2** - Audio-to-audio conditioning

### For Pitch Analysis/Modification
- **librosa** (Python) - Audio analysis, pitch detection
- **pyrubberband** - Time-stretch / pitch-shift
- **essentia** - Music information retrieval

### For Real-Time Synthesis
- **Web Audio API** - Browser-based, perfect for game
- **Tone.js** - Higher-level Web Audio abstraction
- **SuperCollider** - Advanced synthesis (if we need it)

---

## Implementation Priority (When We Return to This)

1. **Phase 1: Prove the Concept**
   - Create simple procedural Schumann-tuned synth
   - Play basic melodies
   - Test if it sounds good

2. **Phase 2: User Testing**
   - A/B test vs standard tuning
   - Gather subjective feedback
   - Decide if worth pursuing

3. **Phase 3: AI Integration** (if Phase 2 succeeds)
   - Generate AI music
   - Post-process to Schumann scale
   - Integrate into game

4. **Phase 4: Advanced Features**
   - Multiple modes (ambient, meditation, energetic)
   - Dynamic music based on game state
   - Crossfading between Schumann-tuned tracks

---

## Biblical Connection

### Potential Themes

**Psalm 19:1** - "The heavens declare the glory of God"
- Creation's frequencies = God's design
- Music tuned to Earth's resonance = worship through creation's language

**Genesis 1** - God spoke creation into being
- Sound/vibration as creative force
- Music aligned with creation's fundamental frequencies

**1 Chronicles 16:23** - "Sing to the Lord, all the earth"
- Earth's frequency (Schumann) in our music
- Literal harmony with creation

### Gameplay Integration

- **Prayer zones:** Music shifts to pure Schumann fundamental
- **Creation themes:** Background music in Schumann tuning
- **Worship mechanic:** Player can "tune" to Earth's frequency

---

## References to Read Later

- **Pythagorean tuning:** https://en.wikipedia.org/wiki/Pythagorean_tuning
- **Just intonation:** https://en.wikipedia.org/wiki/Just_intonation
- **A432 debunking:** https://rationalwiki.org/wiki/A440
- **Schumann resonance:** https://en.wikipedia.org/wiki/Schumann_resonances
- **Music and healing (real research):** Search "music therapy scientific studies"

---

## Bottom Line

**Current state:** Interesting hypothesis, no proven benefits
**Next step:** Build prototype and test subjectively
**If it works:** Could be a unique feature (music tuned to Earth's frequency)
**If it doesn't:** We learned something and move on

**Tabled until:** We have time to experiment and iterate.

---

## Quick Start (When We Resume)

```javascript
// Simplest possible test:
const freq = 7.83 * 32; // 250.56 Hz

// Play for 60 seconds
const osc = audioContext.createOscillator();
osc.frequency.value = freq;
osc.type = 'sine';
osc.start();

// Does it feel different than 251 Hz? Than 440 Hz?
```

**Compare with:**
- Random frequency (e.g., 267 Hz)
- Standard C4 (261.63 Hz)
- Schumann C5 (250.56 Hz)

If there's a noticeable subjective difference, pursue further.
If not, standard music theory is fine.

---

**End of research notes. Return to this when ready to explore further.**
