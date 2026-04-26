import { describe, it, expect } from "vitest";
import {
  calculateCrossfadeVolumes,
  crossfadePositionToFrequency,
  generateFrequencyMarkers,
  createMashupMetadata,
  validateMashupConfig,
  encodeMashupToVoidEcho,
  decodeMashupFromVoidEcho,
  Mashup,
} from "./djMixerService";

describe("DJ Mixer Service", () => {
  describe("calculateCrossfadeVolumes", () => {
    it("should return 100% A at position 0", () => {
      const { volumeA, volumeB } = calculateCrossfadeVolumes(0);
      expect(volumeA).toBeGreaterThan(99);
      expect(volumeB).toBeLessThan(1);
    });

    it("should use smooth cosine crossfade at position 50", () => {
      const { volumeA, volumeB } = calculateCrossfadeVolumes(50);
      // Cosine interpolation: at 50%, both are ~70.7% (sin/cos of 45 degrees)
      expect(volumeA).toBeGreaterThan(60);
      expect(volumeB).toBeGreaterThan(60);
      expect(Math.abs(volumeA - volumeB)).toBeLessThan(5);
    });

    it("should return 100% B at position 100", () => {
      const { volumeA, volumeB } = calculateCrossfadeVolumes(100);
      expect(volumeA).toBeLessThan(1);
      expect(volumeB).toBeGreaterThan(99);
    });

    it("should clamp values between 0-100", () => {
      const result1 = calculateCrossfadeVolumes(-50);
      expect(result1.volumeA).toBeGreaterThan(99);

      const result2 = calculateCrossfadeVolumes(150);
      expect(result2.volumeB).toBeGreaterThan(99);
    });
  });

  describe("crossfadePositionToFrequency", () => {
    it("should return min frequency at position 0", () => {
      const freq = crossfadePositionToFrequency(0, 396, 528);
      expect(freq).toBeCloseTo(396, 1);
    });

    it("should return max frequency at position 100", () => {
      const freq = crossfadePositionToFrequency(100, 396, 528);
      expect(freq).toBeCloseTo(528, 1);
    });

    it("should return frequency between min and max at position 50", () => {
      const freq = crossfadePositionToFrequency(50, 396, 528);
      expect(freq).toBeGreaterThan(396);
      expect(freq).toBeLessThan(528);
    });

    it("should use default range if not specified", () => {
      const freq = crossfadePositionToFrequency(50);
      expect(freq).toBeGreaterThan(396);
      expect(freq).toBeLessThan(528);
    });
  });

  describe("generateFrequencyMarkers", () => {
    it("should generate 8 markers for musical intervals", () => {
      const markers = generateFrequencyMarkers(432);
      expect(markers).toHaveLength(8);
    });

    it("should have root at position 0", () => {
      const markers = generateFrequencyMarkers(432);
      expect(markers[0].position).toBe(0);
      expect(markers[0].frequency).toBeCloseTo(432, 1);
    });

    it("should have octave at position 100", () => {
      const markers = generateFrequencyMarkers(432);
      expect(markers[markers.length - 1].position).toBe(100);
      expect(markers[markers.length - 1].frequency).toBeCloseTo(864, 1);
    });

    it("should have increasing frequencies", () => {
      const markers = generateFrequencyMarkers(432);
      for (let i = 1; i < markers.length; i++) {
        expect(markers[i].frequency).toBeGreaterThan(markers[i - 1].frequency);
      }
    });
  });

  describe("createMashupMetadata", () => {
    it("should create metadata with compression ratio", () => {
      const trackA = {
        index: 0,
        stem: "vocals" as const,
        volume: 100,
        url: "http://example.com/track1.mp3",
      };
      const trackB = {
        index: 1,
        stem: "drums" as const,
        volume: 100,
        url: "http://example.com/track2.mp3",
      };

      const metadata = createMashupMetadata(trackA, trackB, 50);

      expect(metadata.compressionRatio).toBe(250);
      expect(metadata.embeddedCodeSize).toBeGreaterThan(0);
      expect(metadata.timestamp).toBeGreaterThan(0);
    });
  });

  describe("validateMashupConfig", () => {
    it("should reject identical tracks", () => {
      const mashup: Mashup = {
        id: "test",
        name: "Test",
        trackA: { index: 0, stem: "vocals" },
        trackB: { index: 0, stem: "vocals" },
        frequencyMarkers: [{ position: 0, frequency: 432, label: "Root" }],
        voidEchoMetadata: {
          compressionRatio: 250,
          embeddedCodeSize: 10,
          timestamp: Date.now(),
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = validateMashupConfig(mashup);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should accept valid mashup", () => {
      const mashup: Mashup = {
        id: "test",
        name: "Test",
        trackA: { index: 0, stem: "vocals" },
        trackB: { index: 1, stem: "drums" },
        frequencyMarkers: [{ position: 0, frequency: 432, label: "Root" }],
        voidEchoMetadata: {
          compressionRatio: 250,
          embeddedCodeSize: 10,
          timestamp: Date.now(),
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = validateMashupConfig(mashup);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Void Echo Encoding/Decoding", () => {
    it("should encode and decode mashup", () => {
      const mashup: Mashup = {
        id: "test",
        name: "Test Mashup",
        trackA: { index: 5, stem: "vocals" },
        trackB: { index: 12, stem: "drums" },
        frequencyMarkers: [
          { position: 0, frequency: 432, label: "Root" },
          { position: 50, frequency: 648, label: "Perfect 5th" },
        ],
        voidEchoMetadata: {
          compressionRatio: 250,
          embeddedCodeSize: 15,
          timestamp: Date.now(),
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const encoded = encodeMashupToVoidEcho(mashup);
      expect(typeof encoded).toBe("string");
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = decodeMashupFromVoidEcho(encoded);
      expect(decoded.trackA?.index).toBe(5);
      expect(decoded.trackA?.stem).toBe("vocals");
      expect(decoded.trackB?.index).toBe(12);
      expect(decoded.trackB?.stem).toBe("drums");
      expect(decoded.frequencyMarkers).toHaveLength(2);
    });

    it("should handle invalid encoded data gracefully", () => {
      const decoded = decodeMashupFromVoidEcho("invalid-base64-data!");
      expect(decoded).toEqual({});
    });
  });
});
