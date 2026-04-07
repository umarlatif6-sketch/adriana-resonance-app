import { describe, it, expect } from "vitest";
import { generateDNA, verifyDNA } from "./sovereignField";

describe("DNA Triple-Key", () => {
  it("generates three strands from fingerprint + hex", () => {
    const result = generateDNA("canvas-abc123", "FF00AA11");
    expect(result.valid).toBe(true);
    expect(result.dna).toMatch(/^[0-9a-f]{16}-[0-9a-f]{16}-[0-9a-f]{16}$/);
    expect(result.resonanceKey).toHaveLength(16);
  });

  it("produces deterministic output for same inputs", () => {
    const a = generateDNA("fingerprint-xyz", "DEADBEEF");
    const b = generateDNA("fingerprint-xyz", "DEADBEEF");
    expect(a.dna).toBe(b.dna);
    expect(a.resonanceKey).toBe(b.resonanceKey);
  });

  it("produces different DNA for different fingerprints", () => {
    const a = generateDNA("device-A", "AABB1122");
    const b = generateDNA("device-B", "AABB1122");
    expect(a.dna).not.toBe(b.dna);
    expect(a.resonanceKey).not.toBe(b.resonanceKey);
  });

  it("produces different DNA for different hex signatures", () => {
    const a = generateDNA("same-device", "HEX_AAA");
    const b = generateDNA("same-device", "HEX_BBB");
    expect(a.dna).not.toBe(b.dna);
  });

  it("verifies valid DNA triple-key", () => {
    const { resonanceKey } = generateDNA("my-canvas", "0161BEEF");
    expect(verifyDNA("my-canvas", "0161BEEF", resonanceKey)).toBe(true);
  });

  it("rejects wrong fingerprint", () => {
    const { resonanceKey } = generateDNA("real-device", "AABBCCDD");
    expect(verifyDNA("fake-device", "AABBCCDD", resonanceKey)).toBe(false);
  });

  it("rejects wrong hex signature", () => {
    const { resonanceKey } = generateDNA("real-device", "REAL_HEX");
    expect(verifyDNA("real-device", "FAKE_HEX", resonanceKey)).toBe(false);
  });

  it("rejects fabricated resonance key", () => {
    expect(verifyDNA("any-device", "any-hex", "0000000000000000")).toBe(false);
  });

  it("the resonance key is the interference of strands 1 and 2", () => {
    // The third strand can't exist without the first two
    const result = generateDNA("strand1-input", "strand2-input");
    const parts = result.dna.split("-");
    expect(parts).toHaveLength(3);
    // Strand 3 (resonanceKey) should match the third part
    expect(parts[2]).toBe(result.resonanceKey);
  });
});
