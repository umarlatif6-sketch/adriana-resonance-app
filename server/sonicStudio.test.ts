import { describe, it, expect, beforeAll, vi } from "vitest";
import {
  validateControls,
  generateFilterChain,
  pitchToCents,
  tempoToFrequencyMultiplier,
  calculateEQResponse,
  PRESETS,
  DEFAULT_CONTROLS,
} from "./audioControlsService";

describe("Audio Controls Service", () => {
  describe("validateControls", () => {
    it("should clamp pitch to -12 to +12 range", () => {
      const result = validateControls({ pitch: 50 });
      expect(result.pitch).toBe(12);

      const result2 = validateControls({ pitch: -50 });
      expect(result2.pitch).toBe(-12);
    });

    it("should clamp volume to 0-200 range", () => {
      const result = validateControls({ volume: 300 });
      expect(result.volume).toBe(200);

      const result2 = validateControls({ volume: -50 });
      expect(result2.volume).toBe(0);
    });

    it("should clamp tempo to 0.5-2.0 range", () => {
      const result = validateControls({ tempo: 5 });
      expect(result.tempo).toBe(2.0);

      const result2 = validateControls({ tempo: 0.1 });
      expect(result2.tempo).toBe(0.5);
    });

    it("should return default controls when empty object passed", () => {
      const result = validateControls({});
      expect(result).toEqual(DEFAULT_CONTROLS);
    });
  });

  describe("pitchToCents", () => {
    it("should convert semitones to cents (100 cents per semitone)", () => {
      expect(pitchToCents(1)).toBe(100);
      expect(pitchToCents(5)).toBe(500);
      expect(pitchToCents(-3)).toBe(-300);
    });
  });

  describe("tempoToFrequencyMultiplier", () => {
    it("should return tempo as frequency multiplier", () => {
      expect(tempoToFrequencyMultiplier(1.0)).toBe(1.0);
      expect(tempoToFrequencyMultiplier(0.75)).toBe(0.75);
      expect(tempoToFrequencyMultiplier(1.5)).toBe(1.5);
    });
  });

  describe("calculateEQResponse", () => {
    it("should calculate frequency gains from dB values", () => {
      const result = calculateEQResponse(0, 0, 0);
      expect(result.lowFreq).toBeCloseTo(1.0);
      expect(result.midFreq).toBeCloseTo(1.0);
      expect(result.highFreq).toBeCloseTo(1.0);
    });

    it("should boost frequencies with positive dB", () => {
      const result = calculateEQResponse(6, 0, 0);
      expect(result.lowFreq).toBeGreaterThan(1.0);
    });

    it("should reduce frequencies with negative dB", () => {
      const result = calculateEQResponse(-6, 0, 0);
      expect(result.lowFreq).toBeLessThan(1.0);
    });
  });

  describe("generateFilterChain", () => {
    it("should generate filter chain from controls", () => {
      const controls = {
        pitch: 5,
        volume: 150,
        aggression: 75,
        tempo: 1.2,
        bass: 3,
        mid: 0,
        treble: -3,
      };

      const chain = generateFilterChain(controls);

      expect(chain.pitch).toBe(500); // 5 semitones = 500 cents
      expect(chain.volume).toBe(1.5); // 150% = 1.5x
      expect(chain.tempo).toBe(1.2);
      expect(chain.eq.lowGain).toBeGreaterThan(1.0);
      expect(chain.eq.highGain).toBeLessThan(1.0);
    });
  });

  describe("Presets", () => {
    it("should have VOCALS_ISOLATED preset", () => {
      const preset = PRESETS.VOCALS_ISOLATED;
      expect(preset.volume).toBeGreaterThan(100); // Boosted
      expect(preset.aggression).toBeGreaterThan(50); // High isolation
      expect(preset.bass).toBeLessThan(0); // Reduced bass
    });

    it("should have INSTRUMENTAL_BOOST preset", () => {
      const preset = PRESETS.INSTRUMENTAL_BOOST;
      expect(preset.aggression).toBeLessThan(50); // Low isolation
      expect(preset.bass).toBeGreaterThan(0); // Boosted bass
    });

    it("should have BASS_EMPHASIS preset", () => {
      const preset = PRESETS.BASS_EMPHASIS;
      expect(preset.bass).toBeGreaterThan(0);
      expect(preset.treble).toBeLessThan(0);
    });

    it("should have SLOWED preset", () => {
      const preset = PRESETS.SLOWED;
      expect(preset.tempo).toBeLessThan(1.0);
    });

    it("should have SPED_UP preset", () => {
      const preset = PRESETS.SPED_UP;
      expect(preset.tempo).toBeGreaterThan(1.0);
    });

    it("should have PITCHED_UP preset", () => {
      const preset = PRESETS.PITCHED_UP;
      expect(preset.pitch).toBeGreaterThan(0);
    });

    it("should have PITCHED_DOWN preset", () => {
      const preset = PRESETS.PITCHED_DOWN;
      expect(preset.pitch).toBeLessThan(0);
    });
  });

  describe("Control Ranges", () => {
    it("should enforce pitch range -12 to +12", () => {
      const controls = validateControls({ pitch: -15 });
      expect(controls.pitch).toBeGreaterThanOrEqual(-12);
      expect(controls.pitch).toBeLessThanOrEqual(12);
    });

    it("should enforce volume range 0-200", () => {
      const controls = validateControls({ volume: 250 });
      expect(controls.volume).toBeGreaterThanOrEqual(0);
      expect(controls.volume).toBeLessThanOrEqual(200);
    });

    it("should enforce aggression range 0-100", () => {
      const controls = validateControls({ aggression: 150 });
      expect(controls.aggression).toBeGreaterThanOrEqual(0);
      expect(controls.aggression).toBeLessThanOrEqual(100);
    });

    it("should enforce tempo range 0.5-2.0", () => {
      const controls = validateControls({ tempo: 3.0 });
      expect(controls.tempo).toBeGreaterThanOrEqual(0.5);
      expect(controls.tempo).toBeLessThanOrEqual(2.0);
    });

    it("should enforce EQ range -12 to +12 dB", () => {
      const controls = validateControls({ bass: 20, mid: -20, treble: 15 });
      expect(controls.bass).toBeGreaterThanOrEqual(-12);
      expect(controls.bass).toBeLessThanOrEqual(12);
      expect(controls.mid).toBeGreaterThanOrEqual(-12);
      expect(controls.mid).toBeLessThanOrEqual(12);
      expect(controls.treble).toBeGreaterThanOrEqual(-12);
      expect(controls.treble).toBeLessThanOrEqual(12);
    });
  });

  describe("Real-world scenarios", () => {
    it("should create a vocal isolation preset", () => {
      const controls = validateControls({
        volume: 120,
        bass: -6,
        mid: 3,
        treble: 6,
        aggression: 90,
      });

      const chain = generateFilterChain(controls);
      expect(chain.volume).toBe(1.2);
      expect(chain.eq.lowGain).toBeLessThan(1.0); // Bass reduced
      expect(chain.eq.highGain).toBeGreaterThan(1.0); // Treble boosted
    });

    it("should create a bass-heavy preset", () => {
      const controls = validateControls({
        bass: 9,
        mid: -3,
        treble: -6,
      });

      const chain = generateFilterChain(controls);
      expect(chain.eq.lowGain).toBeGreaterThan(1.0);
      expect(chain.eq.midGain).toBeLessThan(1.0);
      expect(chain.eq.highGain).toBeLessThan(1.0);
    });

    it("should create a slowed and pitched-down preset", () => {
      const controls = validateControls({
        tempo: 0.75,
        pitch: -5,
      });

      const chain = generateFilterChain(controls);
      expect(chain.tempo).toBe(0.75);
      expect(chain.pitch).toBe(-500); // -5 semitones
    });
  });
});
