/**
 * ═══════════════════════════════════════════════════════════════
 * AUDIO CONTROLS SERVICE
 * ═══════════════════════════════════════════════════════════════
 *
 * Real-time audio manipulation:
 * - Pitch shifting (-12 to +12 semitones)
 * - Volume control (0-200%)
 * - Aggression/Isolation (0-100%)
 * - Tempo/Speed (0.5x to 2x)
 * - EQ (bass, mid, treble: -12dB to +12dB)
 */

export interface AudioControls {
  pitch: number; // -12 to +12 semitones
  volume: number; // 0-200 (percentage)
  aggression: number; // 0-100 (isolation strength)
  tempo: number; // 0.5 to 2.0x
  bass: number; // -12 to +12 dB
  mid: number; // -12 to +12 dB
  treble: number; // -12 to +12 dB
}

export interface SonicControlState {
  trackIndex: number;
  stemType: "vocals" | "drums" | "bass" | "other";
  controls: AudioControls;
  blendWithOther?: {
    stemType: "vocals" | "drums" | "bass" | "other";
    ratio: number; // 0-100 (percentage of other stem to blend)
  };
}

/**
 * Default audio controls (no modification)
 */
export const DEFAULT_CONTROLS: AudioControls = {
  pitch: 0,
  volume: 100,
  aggression: 50,
  tempo: 1.0,
  bass: 0,
  mid: 0,
  treble: 0,
};

/**
 * Validate audio controls are within acceptable ranges
 */
export function validateControls(controls: Partial<AudioControls>): AudioControls {
  return {
    pitch: Math.max(-12, Math.min(12, controls.pitch ?? 0)),
    volume: Math.max(0, Math.min(200, controls.volume ?? 100)),
    aggression: Math.max(0, Math.min(100, controls.aggression ?? 50)),
    tempo: Math.max(0.5, Math.min(2.0, controls.tempo ?? 1.0)),
    bass: Math.max(-12, Math.min(12, controls.bass ?? 0)),
    mid: Math.max(-12, Math.min(12, controls.mid ?? 0)),
    treble: Math.max(-12, Math.min(12, controls.treble ?? 0)),
  };
}

/**
 * Calculate frequency response for EQ (bass, mid, treble)
 * Returns gain values for different frequency bands
 */
export function calculateEQResponse(
  bass: number,
  mid: number,
  treble: number
): { lowFreq: number; midFreq: number; highFreq: number } {
  return {
    lowFreq: Math.pow(10, bass / 20), // 20Hz-250Hz
    midFreq: Math.pow(10, mid / 20), // 250Hz-4kHz
    highFreq: Math.pow(10, treble / 20), // 4kHz-20kHz
  };
}

/**
 * Calculate pitch shift in cents
 * 1 semitone = 100 cents
 */
export function pitchToCents(semitones: number): number {
  return semitones * 100;
}

/**
 * Calculate frequency multiplier for tempo
 * tempo: 0.5 = half speed, 1.0 = normal, 2.0 = double speed
 */
export function tempoToFrequencyMultiplier(tempo: number): number {
  return tempo;
}

/**
 * Generate Web Audio API filter chain description
 * For client-side real-time audio processing
 */
export function generateFilterChain(controls: AudioControls): {
  pitch: number;
  volume: number;
  tempo: number;
  eq: { lowGain: number; midGain: number; highGain: number };
} {
  const eq = calculateEQResponse(controls.bass, controls.mid, controls.treble);

  return {
    pitch: pitchToCents(controls.pitch),
    volume: controls.volume / 100,
    tempo: tempoToFrequencyMultiplier(controls.tempo),
    eq: {
      lowGain: eq.lowFreq,
      midGain: eq.midFreq,
      highGain: eq.highFreq,
    },
  };
}

/**
 * Create a preset for common use cases
 */
export const PRESETS = {
  VOCALS_ISOLATED: {
    pitch: 0,
    volume: 120,
    aggression: 90, // High isolation
    tempo: 1.0,
    bass: -6,
    mid: 3,
    treble: 6,
  } as AudioControls,

  INSTRUMENTAL_BOOST: {
    pitch: 0,
    volume: 110,
    aggression: 30, // Low isolation (keep more instruments)
    tempo: 1.0,
    bass: 6,
    mid: 0,
    treble: 3,
  } as AudioControls,

  BASS_EMPHASIS: {
    pitch: 0,
    volume: 100,
    aggression: 50,
    tempo: 1.0,
    bass: 9,
    mid: -3,
    treble: -6,
  } as AudioControls,

  TREBLE_CLARITY: {
    pitch: 0,
    volume: 100,
    aggression: 50,
    tempo: 1.0,
    bass: -3,
    mid: 0,
    treble: 12,
  } as AudioControls,

  SLOWED: {
    pitch: 0,
    volume: 100,
    aggression: 50,
    tempo: 0.75,
    bass: 3,
    mid: 0,
    treble: 0,
  } as AudioControls,

  SPED_UP: {
    pitch: 0,
    volume: 100,
    aggression: 50,
    tempo: 1.5,
    bass: 0,
    mid: 0,
    treble: 3,
  } as AudioControls,

  PITCHED_UP: {
    pitch: 5,
    volume: 100,
    aggression: 50,
    tempo: 1.0,
    bass: 0,
    mid: 3,
    treble: 6,
  } as AudioControls,

  PITCHED_DOWN: {
    pitch: -5,
    volume: 100,
    aggression: 50,
    tempo: 1.0,
    bass: 3,
    mid: 0,
    treble: 0,
  } as AudioControls,
};
