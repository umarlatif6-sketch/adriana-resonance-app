import { describe, it, expect } from "vitest";
import {
  encodeGlyph,
  decodeGlyph,
  compressSeed,
  decompressSeed,
  getGlyphTable,
} from "./sovereignField";

describe("Macron Glyph Compression Protocol", () => {
  const testSeed = {
    id: "a1b2c3d4e5f60718",
    hz: 432.5,
    sovereignty: 0.87,
    phase: "I'm sorry",
    timestamp: 1775523388,
  };

  describe("Glyph Table", () => {
    it("has exactly 45 glyphs", () => {
      const table = getGlyphTable();
      expect(table).toHaveLength(45);
    });

    it("has 15 body + 15 mind + 15 frequency glyphs", () => {
      const table = getGlyphTable();
      expect(table.filter(g => g.strand === "body")).toHaveLength(15);
      expect(table.filter(g => g.strand === "mind")).toHaveLength(15);
      expect(table.filter(g => g.strand === "frequency")).toHaveLength(15);
    });

    it("all glyphs are unique", () => {
      const table = getGlyphTable();
      const glyphs = table.map(g => g.glyph);
      expect(new Set(glyphs).size).toBe(45);
    });
  });

  describe("encodeGlyph", () => {
    it("produces a 3-glyph codon separated by ·", () => {
      const codon = encodeGlyph(testSeed);
      const parts = codon.split("·");
      expect(parts).toHaveLength(3);
      // Each part should be a single glyph from the table
      const table = getGlyphTable().map(g => g.glyph);
      parts.forEach(p => {
        expect(table).toContain(p);
      });
    });

    it("is deterministic — same seed = same codon", () => {
      const a = encodeGlyph(testSeed);
      const b = encodeGlyph(testSeed);
      expect(a).toBe(b);
    });

    it("different seeds produce different codons", () => {
      const a = encodeGlyph(testSeed);
      const b = encodeGlyph({ ...testSeed, id: "different_id_here" });
      expect(a).not.toBe(b);
    });

    it("different frequencies produce different codons", () => {
      const a = encodeGlyph(testSeed);
      const b = encodeGlyph({ ...testSeed, hz: 440.0 });
      expect(a).not.toBe(b);
    });
  });

  describe("decodeGlyph", () => {
    it("decodes a valid codon", () => {
      const codon = encodeGlyph(testSeed);
      const decoded = decodeGlyph(codon);
      expect(decoded.valid).toBe(true);
      expect(decoded.indices).toHaveLength(3);
      expect(decoded.lookupKey).toHaveLength(16);
      expect(["body", "mind", "frequency"]).toContain(decoded.strand);
    });

    it("rejects invalid codon format", () => {
      expect(decodeGlyph("not·valid").valid).toBe(false);
      expect(decodeGlyph("").valid).toBe(false);
      expect(decodeGlyph("a·b·c·d").valid).toBe(false);
    });

    it("rejects unknown glyphs", () => {
      expect(decodeGlyph("X·Y·Z").valid).toBe(false);
    });

    it("identifies dominant strand", () => {
      // All body glyphs (indices 0-14)
      const bodyCodon = "ā·ē·ī";
      const bodyDecoded = decodeGlyph(bodyCodon);
      expect(bodyDecoded.strand).toBe("body");

      // All mind glyphs (indices 15-29)
      const mindCodon = "α·β·γ";
      const mindDecoded = decodeGlyph(mindCodon);
      expect(mindDecoded.strand).toBe("mind");

      // All frequency glyphs (indices 30-44)
      const freqCodon = "ψ·Ω·∿";
      const freqDecoded = decodeGlyph(freqCodon);
      expect(freqDecoded.strand).toBe("frequency");
    });
  });

  describe("compressSeed / decompressSeed round-trip", () => {
    it("compresses and decompresses losslessly", () => {
      const { codon } = compressSeed(testSeed);
      const { seed, valid } = decompressSeed(codon);
      expect(valid).toBe(true);
      expect(seed).toEqual(testSeed);
    });

    it("achieves >90% compression ratio", () => {
      const { compressionRatio } = compressSeed(testSeed);
      expect(compressionRatio).toBeGreaterThan(90);
    });

    it("saves tokens", () => {
      const { tokensSaved } = compressSeed(testSeed);
      expect(tokensSaved).toBeGreaterThan(10);
    });

    it("handles multiple seeds without collision", () => {
      const seeds = Array.from({ length: 100 }, (_, i) => ({
        id: `flower_${i.toString(16).padStart(16, "0")}`,
        hz: 400 + Math.random() * 200,
        sovereignty: Math.random(),
      }));

      const codons = seeds.map(s => compressSeed(s).codon);
      
      // All should decompress back
      seeds.forEach((seed, i) => {
        const { seed: recovered } = decompressSeed(codons[i]);
        expect(recovered).toEqual(seed);
      });
    });

    it("returns null for unknown codon", () => {
      // Valid format but never stored
      const { seed } = decompressSeed("ā·α·ψ");
      expect(seed).toBeNull();
    });
  });

  describe("The 97% — Adriana's number", () => {
    it("compression ratio approaches 97% for typical seeds", () => {
      const typicalSeed = {
        id: "0161beef0161cafe",
        hz: 432.0,
        sovereignty: 0.91,
        phase: "Forgive me",
        timestamp: Date.now(),
      };
      const { compressionRatio } = compressSeed(typicalSeed);
      // Should be in the 90-98% range
      expect(compressionRatio).toBeGreaterThanOrEqual(90);
      expect(compressionRatio).toBeLessThanOrEqual(99);
    });
  });
});
