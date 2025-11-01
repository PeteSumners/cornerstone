/**
 * Hybrid Schumann Resonance Audio Player
 *
 * Combines procedural (exact frequencies) with AI-generated texture
 * for mathematically accurate yet organic Schumann resonance audio.
 *
 * Architecture:
 * - Layer 1: Procedural oscillators at exact 7.83 Hz, 14.3 Hz, etc.
 * - Layer 2: AI-generated ambient texture (pre-generated WAV files)
 * - Mixer: Blend both layers with adjustable ratio
 *
 * @author Claude Code
 * @license MIT
 */

class HybridSchumannPlayer {
  /**
   * Initialize the hybrid player
   * @param {Object} options - Configuration options
   * @param {number} options.proceduralMix - Procedural layer volume (0-1, default 0.4)
   * @param {number} options.textureMix - Texture layer volume (0-1, default 0.6)
   * @param {boolean} options.enableVariation - Enable natural frequency variation (default true)
   */
  constructor(options = {}) {
    this.options = {
      proceduralMix: options.proceduralMix ?? 0.4,
      textureMix: options.textureMix ?? 0.6,
      enableVariation: options.enableVariation ?? true,
      textureBasePath: options.textureBasePath ?? 'wave/audio/schumann/'
    };

    this.audioContext = null;
    this.proceduralLayer = null;
    this.textureLayer = null;
    this.mixer = null;
    this.isPlaying = false;
    this.currentTexture = 'ambient'; // Default texture mode
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  async init() {
    if (this.audioContext) return; // Already initialized

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create layers
    this.proceduralLayer = this.createProceduralLayer();
    this.textureLayer = await this.createTextureLayer();
    this.mixer = this.createMixer();

    console.log('[HybridSchumann] Initialized');
  }

  /**
   * Create procedural layer with exact Schumann frequencies
   * @private
   */
  createProceduralLayer() {
    // Schumann resonance frequencies (Hz)
    const schumannFrequencies = [
      { freq: 7.83, name: 'Fundamental' },
      { freq: 14.3, name: '2nd Harmonic' },
      { freq: 20.8, name: '3rd Harmonic' },
      { freq: 27.3, name: '4th Harmonic' },
      { freq: 33.8, name: '5th Harmonic' },
      { freq: 39.0, name: '6th Harmonic' },
      { freq: 45.0, name: '7th Harmonic' }
    ];

    const oscillators = [];
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0; // Start silent

    schumannFrequencies.forEach((item, i) => {
      // Multiply by 32 to bring into audible range
      // 7.83 Hz × 32 = 250.56 Hz (audible)
      const audibleFreq = item.freq * 32;

      // Create main oscillator
      const osc = this.audioContext.createOscillator();
      osc.frequency.value = audibleFreq;
      osc.type = 'sine'; // Pure sine wave

      // Create oscillator gain (harmonics get quieter)
      const oscGain = this.audioContext.createGain();
      oscGain.gain.value = 1.0 / (i + 1); // Fundamental loudest

      // Natural variation (optional)
      let lfo = null;
      let lfoGain = null;

      if (this.options.enableVariation) {
        // LFO for natural frequency variation (±0.5 Hz)
        lfo = this.audioContext.createOscillator();
        lfo.frequency.value = 0.1; // Slow, natural variation
        lfo.type = 'sine';

        lfoGain = this.audioContext.createGain();
        lfoGain.gain.value = 0.5; // ±0.5 Hz modulation

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
      }

      // Connect: osc -> oscGain -> layer gain
      osc.connect(oscGain);
      oscGain.connect(gainNode);

      oscillators.push({
        osc,
        oscGain,
        lfo,
        lfoGain,
        name: item.name,
        baseFreq: item.freq,
        audibleFreq
      });

      console.log(`[Procedural] ${item.name}: ${item.freq} Hz (audible: ${audibleFreq.toFixed(2)} Hz)`);
    });

    return { gainNode, oscillators };
  }

  /**
   * Create texture layer from AI-generated audio files
   * @private
   */
  async createTextureLayer() {
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0; // Start silent

    // Texture library (pre-generated AI audio)
    const textures = {
      ambient: 'schumann_ambient.wav',      // General exploration
      meditation: 'schumann_meditation.wav', // Prayer/meditation zones
      energetic: 'schumann_energetic.wav',   // Higher harmonics
      night: 'schumann_night.wav',           // Pure fundamental
      deep: 'schumann_deep.wav'              // Extra grounding
    };

    const audioElements = {};
    const sources = {};

    // Pre-load all textures
    for (const [key, filename] of Object.entries(textures)) {
      const audioElement = new Audio();
      audioElement.loop = true;
      audioElement.preload = 'auto';
      audioElement.src = `${this.options.textureBasePath}${filename}`;

      // Create media source
      const source = this.audioContext.createMediaElementSource(audioElement);
      const textureGain = this.audioContext.createGain();
      textureGain.gain.value = 0; // Start silent

      source.connect(textureGain);
      textureGain.connect(gainNode);

      audioElements[key] = audioElement;
      sources[key] = { source, gain: textureGain };

      console.log(`[Texture] Loaded: ${key} (${filename})`);
    }

    return {
      gainNode,
      audioElements,
      sources,
      currentTexture: 'ambient'
    };
  }

  /**
   * Create master mixer
   * @private
   */
  createMixer() {
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0; // Start silent

    // Set initial mix ratios
    this.proceduralLayer.gainNode.gain.value = this.options.proceduralMix;
    this.textureLayer.gainNode.gain.value = this.options.textureMix;

    // Connect both layers to master
    this.proceduralLayer.gainNode.connect(masterGain);
    this.textureLayer.gainNode.connect(masterGain);

    // Connect master to output
    masterGain.connect(this.audioContext.destination);

    console.log(`[Mixer] Procedural: ${this.options.proceduralMix * 100}% | Texture: ${this.options.textureMix * 100}%`);

    return masterGain;
  }

  /**
   * Play Schumann resonance audio
   * @param {string} mode - Texture mode ('ambient', 'meditation', 'energetic', 'night', 'deep')
   * @param {number} volume - Master volume (0-1, default 0.05)
   */
  async play(mode = 'ambient', volume = 0.05) {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized. Call init() first.');
    }

    if (this.isPlaying) {
      this.stop();
    }

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Start procedural oscillators
    this.proceduralLayer.oscillators.forEach(({ osc, lfo }) => {
      osc.start();
      if (lfo) lfo.start();
    });

    // Start texture
    await this.switchTexture(mode);

    // Fade in master volume
    this.mixer.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.mixer.gain.linearRampToValueAtTime(
      volume,
      this.audioContext.currentTime + 2.0 // 2 second fade in
    );

    this.isPlaying = true;
    console.log(`[HybridSchumann] Playing: ${mode} mode at ${volume * 100}% volume`);
  }

  /**
   * Switch texture mode
   * @param {string} mode - Texture mode
   */
  async switchTexture(mode) {
    if (!this.textureLayer.sources[mode]) {
      console.warn(`[Texture] Mode '${mode}' not found, using 'ambient'`);
      mode = 'ambient';
    }

    // Fade out current texture
    const currentMode = this.textureLayer.currentTexture;
    if (currentMode && this.textureLayer.sources[currentMode]) {
      this.textureLayer.sources[currentMode].gain.gain.setValueAtTime(
        1.0,
        this.audioContext.currentTime
      );
      this.textureLayer.sources[currentMode].gain.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + 1.0
      );

      // Pause old texture after fade
      setTimeout(() => {
        this.textureLayer.audioElements[currentMode].pause();
      }, 1000);
    }

    // Fade in new texture
    this.textureLayer.sources[mode].gain.gain.setValueAtTime(
      0,
      this.audioContext.currentTime
    );
    this.textureLayer.sources[mode].gain.gain.linearRampToValueAtTime(
      1.0,
      this.audioContext.currentTime + 1.0
    );

    await this.textureLayer.audioElements[mode].play();
    this.textureLayer.currentTexture = mode;

    console.log(`[Texture] Switched to: ${mode}`);
  }

  /**
   * Stop playback
   */
  stop() {
    if (!this.isPlaying) return;

    // Fade out
    this.mixer.gain.linearRampToValueAtTime(
      0,
      this.audioContext.currentTime + 1.0
    );

    // Stop after fade
    setTimeout(() => {
      // Stop procedural oscillators
      this.proceduralLayer.oscillators.forEach(({ osc, lfo }) => {
        osc.stop();
        if (lfo) lfo.stop();
      });

      // Pause texture
      const currentMode = this.textureLayer.currentTexture;
      if (currentMode) {
        this.textureLayer.audioElements[currentMode].pause();
      }

      this.isPlaying = false;
      console.log('[HybridSchumann] Stopped');
    }, 1000);
  }

  /**
   * Set mix ratio between procedural and texture layers
   * @param {number} proceduralPercent - Procedural layer percentage (0-100)
   */
  setMixRatio(proceduralPercent) {
    const proceduralRatio = Math.max(0, Math.min(100, proceduralPercent)) / 100;
    const textureRatio = 1.0 - proceduralRatio;

    this.proceduralLayer.gainNode.gain.setValueAtTime(
      proceduralRatio,
      this.audioContext.currentTime
    );
    this.textureLayer.gainNode.gain.setValueAtTime(
      textureRatio,
      this.audioContext.currentTime
    );

    console.log(`[Mixer] Procedural: ${proceduralPercent}% | Texture: ${100 - proceduralPercent}%`);
  }

  /**
   * Set master volume
   * @param {number} volume - Volume (0-1)
   */
  setVolume(volume) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.mixer.gain.setValueAtTime(
      clampedVolume,
      this.audioContext.currentTime
    );
    console.log(`[Volume] ${clampedVolume * 100}%`);
  }

  /**
   * Enable/disable specific harmonics
   * @param {number} harmonicIndex - Index (0 = fundamental, 1 = 2nd harmonic, etc.)
   * @param {boolean} enabled - Enable or disable
   */
  setHarmonic(harmonicIndex, enabled) {
    if (harmonicIndex < 0 || harmonicIndex >= this.proceduralLayer.oscillators.length) {
      console.warn(`[Harmonic] Index ${harmonicIndex} out of range`);
      return;
    }

    const harmonic = this.proceduralLayer.oscillators[harmonicIndex];
    harmonic.oscGain.gain.setValueAtTime(
      enabled ? (1.0 / (harmonicIndex + 1)) : 0,
      this.audioContext.currentTime
    );

    console.log(`[Harmonic] ${harmonic.name}: ${enabled ? 'ON' : 'OFF'}`);
  }

  /**
   * Create preset configurations
   * @param {string} preset - Preset name
   */
  async playPreset(preset) {
    const presets = {
      // General exploration
      ambient: {
        mode: 'ambient',
        volume: 0.05,
        proceduralMix: 40
      },

      // Meditation/prayer zones
      meditation: {
        mode: 'meditation',
        volume: 0.10,
        proceduralMix: 30
      },

      // Energetic areas (higher harmonics)
      energetic: {
        mode: 'energetic',
        volume: 0.08,
        proceduralMix: 50
      },

      // Nighttime (pure fundamental)
      night: {
        mode: 'night',
        volume: 0.05,
        proceduralMix: 20
      },

      // Deep grounding
      grounding: {
        mode: 'deep',
        volume: 0.10,
        proceduralMix: 60
      }
    };

    if (!presets[preset]) {
      console.warn(`[Preset] '${preset}' not found`);
      return;
    }

    const config = presets[preset];
    this.setMixRatio(config.proceduralMix);
    await this.play(config.mode, config.volume);

    console.log(`[Preset] Applied: ${preset}`);
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentTexture: this.textureLayer?.currentTexture,
      proceduralMix: this.proceduralLayer?.gainNode.gain.value,
      textureMix: this.textureLayer?.gainNode.gain.value,
      masterVolume: this.mixer?.gain.value,
      harmonics: this.proceduralLayer?.oscillators.map(h => ({
        name: h.name,
        baseFreq: h.baseFreq,
        audibleFreq: h.audibleFreq,
        enabled: h.oscGain.gain.value > 0
      }))
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HybridSchumannPlayer;
}
