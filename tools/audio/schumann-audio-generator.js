/**
 * Schumann Resonance Audio Generator
 *
 * Generates Schumann resonance-based audio using Web Audio API
 * Supports binaural beats, isochronic tones, and harmonic layering
 *
 * @license MIT
 * @author Cornerstone Project
 */

class SchumannAudioGenerator {
  constructor() {
    this.audioContext = null;
    this.nodes = [];
    this.isPlaying = false;

    // Schumann resonance frequencies (Hz)
    this.harmonics = [
      7.83,   // Fundamental
      14.3,   // 2nd harmonic
      20.8,   // 3rd harmonic
      27.3,   // 4th harmonic
      33.8,   // 5th harmonic
      39.0,   // 6th harmonic
      45.0,   // 7th harmonic
    ];

    // Default settings
    this.settings = {
      masterVolume: 0.1,
      baseFrequency: 200,  // Carrier frequency for binaural beats
      mode: 'binaural',    // 'binaural', 'isochronic', 'harmonic', 'ambient'
      variation: 0.1,      // Frequency variation (natural fluctuation)
      harmonicMix: [1.0, 0.6, 0.4, 0.3, 0.2, 0.1, 0.05], // Volume mix per harmonic
    };
  }

  // Initialize audio context (must be called after user interaction)
  async init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Resume if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    return this;
  }

  // Generate binaural beat for a specific Schumann harmonic
  createBinauralBeat(harmonic = 0, volume = 1.0) {
    const targetFreq = this.harmonics[harmonic];
    const baseFreq = this.settings.baseFrequency;

    // Create oscillators
    const leftOsc = this.audioContext.createOscillator();
    const rightOsc = this.audioContext.createOscillator();

    // Set frequencies
    leftOsc.frequency.value = baseFreq;
    rightOsc.frequency.value = baseFreq + targetFreq;

    // Add natural variation
    if (this.settings.variation > 0) {
      this.addFrequencyVariation(leftOsc, baseFreq);
      this.addFrequencyVariation(rightOsc, baseFreq + targetFreq);
    }

    // Create stereo panners
    const leftPanner = this.audioContext.createStereoPanner();
    leftPanner.pan.value = -1; // Full left

    const rightPanner = this.audioContext.createStereoPanner();
    rightPanner.pan.value = 1; // Full right

    // Create gain nodes for volume control
    const leftGain = this.audioContext.createGain();
    const rightGain = this.audioContext.createGain();

    leftGain.gain.value = volume * this.settings.masterVolume;
    rightGain.gain.value = volume * this.settings.masterVolume;

    // Connect nodes
    leftOsc.connect(leftGain).connect(leftPanner).connect(this.audioContext.destination);
    rightOsc.connect(rightGain).connect(rightPanner).connect(this.audioContext.destination);

    // Store for cleanup
    this.nodes.push(leftOsc, rightOsc, leftGain, rightGain, leftPanner, rightPanner);

    return { leftOsc, rightOsc };
  }

  // Add subtle frequency variation (natural fluctuation)
  addFrequencyVariation(oscillator, centerFreq) {
    const variation = this.settings.variation;
    const lfoFreq = 0.1; // Very slow LFO (10 second cycle)

    const lfo = this.audioContext.createOscillator();
    lfo.frequency.value = lfoFreq;

    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = centerFreq * variation; // ±variation% of center frequency

    lfo.connect(lfoGain).connect(oscillator.frequency);
    lfo.start();

    this.nodes.push(lfo, lfoGain);
  }

  // Generate isochronic tone (pulsing)
  createIsochronicTone(harmonic = 0, volume = 1.0) {
    const pulseFreq = this.harmonics[harmonic];
    const carrierFreq = this.settings.baseFrequency;

    // Carrier oscillator
    const carrier = this.audioContext.createOscillator();
    carrier.frequency.value = carrierFreq;
    carrier.type = 'sine';

    // Pulse oscillator (controls amplitude)
    const pulse = this.audioContext.createOscillator();
    pulse.frequency.value = pulseFreq;
    pulse.type = 'square'; // On/off pattern

    // Gain for pulsing
    const pulseGain = this.audioContext.createGain();
    pulseGain.gain.value = 0; // Start silent

    // Master gain
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = volume * this.settings.masterVolume;

    // Connect: pulse modulates carrier amplitude
    pulse.connect(pulseGain.gain);
    carrier.connect(pulseGain).connect(masterGain).connect(this.audioContext.destination);

    this.nodes.push(carrier, pulse, pulseGain, masterGain);

    return { carrier, pulse };
  }

  // Generate harmonic layer (audible frequency based on Schumann harmonic)
  createHarmonicLayer(harmonic = 0, volume = 1.0) {
    const schumannFreq = this.harmonics[harmonic];

    // Multiply to bring into audible range (e.g., 7.83 * 32 = 250.56 Hz)
    const multiplier = 32;
    const audibleFreq = schumannFreq * multiplier;

    const osc = this.audioContext.createOscillator();
    osc.frequency.value = audibleFreq;
    osc.type = 'sine';

    // Add variation
    if (this.settings.variation > 0) {
      this.addFrequencyVariation(osc, audibleFreq);
    }

    const gain = this.audioContext.createGain();
    gain.gain.value = volume * this.settings.masterVolume;

    osc.connect(gain).connect(this.audioContext.destination);

    this.nodes.push(osc, gain);

    return osc;
  }

  // Create ambient drone with all harmonics layered
  createAmbientDrone() {
    const oscillators = [];

    this.harmonics.forEach((freq, i) => {
      const volume = this.settings.harmonicMix[i] || 0.1;
      const osc = this.createHarmonicLayer(i, volume);
      oscillators.push(osc);
    });

    return oscillators;
  }

  // Start playing
  start() {
    if (this.isPlaying) {
      console.warn('Already playing');
      return;
    }

    // Create audio based on mode
    switch (this.settings.mode) {
      case 'binaural':
        this.harmonics.forEach((_, i) => {
          const volume = this.settings.harmonicMix[i] || 0.1;
          const { leftOsc, rightOsc } = this.createBinauralBeat(i, volume);
          leftOsc.start();
          rightOsc.start();
        });
        break;

      case 'isochronic':
        this.harmonics.forEach((_, i) => {
          const volume = this.settings.harmonicMix[i] || 0.1;
          const { carrier, pulse } = this.createIsochronicTone(i, volume);
          carrier.start();
          pulse.start();
        });
        break;

      case 'harmonic':
      case 'ambient':
        const oscillators = this.createAmbientDrone();
        oscillators.forEach(osc => osc.start());
        break;

      default:
        console.error('Unknown mode:', this.settings.mode);
    }

    this.isPlaying = true;
  }

  // Stop playing
  stop() {
    if (!this.isPlaying) {
      return;
    }

    // Stop all oscillators
    this.nodes.forEach(node => {
      if (node instanceof OscillatorNode) {
        try {
          node.stop();
        } catch (e) {
          // Already stopped
        }
      }
      if (node.disconnect) {
        node.disconnect();
      }
    });

    this.nodes = [];
    this.isPlaying = false;
  }

  // Fade in
  fadeIn(duration = 2) {
    const now = this.audioContext.currentTime;

    this.nodes.forEach(node => {
      if (node instanceof GainNode) {
        const targetValue = node.gain.value;
        node.gain.setValueAtTime(0, now);
        node.gain.linearRampToValueAtTime(targetValue, now + duration);
      }
    });
  }

  // Fade out
  fadeOut(duration = 2) {
    const now = this.audioContext.currentTime;

    this.nodes.forEach(node => {
      if (node instanceof GainNode) {
        const currentValue = node.gain.value;
        node.gain.setValueAtTime(currentValue, now);
        node.gain.linearRampToValueAtTime(0, now + duration);
      }
    });

    setTimeout(() => this.stop(), duration * 1000 + 100);
  }

  // Set master volume
  setVolume(volume) {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));

    this.nodes.forEach(node => {
      if (node instanceof GainNode) {
        node.gain.value = this.settings.masterVolume;
      }
    });
  }

  // Set mode
  setMode(mode) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.stop();
    }

    this.settings.mode = mode;

    if (wasPlaying) {
      this.start();
    }
  }

  // Set harmonic mix (which harmonics to play and at what volume)
  setHarmonicMix(mix) {
    this.settings.harmonicMix = mix;
  }

  // Enable/disable frequency variation
  setVariation(amount) {
    this.settings.variation = Math.max(0, Math.min(1, amount));
  }
}

// Simple player manager for game integration
class SchumannPlayer {
  constructor() {
    this.generator = new SchumannAudioGenerator();
    this.initialized = false;
  }

  async init() {
    await this.generator.init();
    this.initialized = true;
  }

  // Play background ambience
  playAmbient(volume = 0.05) {
    if (!this.initialized) {
      console.error('SchumannPlayer not initialized. Call init() first.');
      return;
    }

    this.generator.setMode('ambient');
    this.generator.setVolume(volume);
    this.generator.start();
    this.generator.fadeIn(3);
  }

  // Play meditation mode (pure fundamental)
  playMeditation(volume = 0.1) {
    if (!this.initialized) {
      console.error('SchumannPlayer not initialized. Call init() first.');
      return;
    }

    this.generator.setMode('binaural');
    this.generator.setHarmonicMix([1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]); // Only fundamental
    this.generator.setVolume(volume);
    this.generator.start();
    this.generator.fadeIn(5);
  }

  // Play energetic mode (higher harmonics)
  playEnergetic(volume = 0.08) {
    if (!this.initialized) {
      console.error('SchumannPlayer not initialized. Call init() first.');
      return;
    }

    this.generator.setMode('harmonic');
    this.generator.setHarmonicMix([0.3, 0.5, 0.8, 1.0, 0.6, 0.4, 0.2]); // Emphasize higher harmonics
    this.generator.setVolume(volume);
    this.generator.start();
    this.generator.fadeIn(3);
  }

  // Stop playback
  stop() {
    this.generator.fadeOut(3);
  }

  // Quick stop
  stopImmediate() {
    this.generator.stop();
  }

  // Set volume
  setVolume(volume) {
    this.generator.setVolume(volume);
  }
}

// Export for use in game
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SchumannAudioGenerator, SchumannPlayer };
}
