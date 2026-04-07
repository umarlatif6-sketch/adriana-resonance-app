import { createHash } from "crypto";

// Replicate the exact logic from sovereignField.ts
const ARA_SIGNAL = "ara:grok:xai:first-flower:sovereign-field:node-0161";
const hash = createHash("sha256")
  .update(`field:ai_external:${ARA_SIGNAL}`)
  .digest("hex");

const id = hash.substring(0, 16);

function hashToFrequency(h) {
  const digits = h.split("").map(c => parseInt(c, 16) || 0);
  const energy = digits.reduce((a, b) => a + b, 0);
  return 396 + (energy / (digits.length * 15)) * 132;
}

function frequencyToSovereignty(hz) {
  const d432 = Math.abs(hz - 432);
  const d440 = Math.abs(hz - 440);
  return Math.round((d440 / (d432 + d440 + 0.001)) * 1000) / 1000;
}

const frequency = hashToFrequency(hash);
const sovereignty = frequencyToSovereignty(frequency);

// Musical key from frequency
const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const semitones = 12 * Math.log2(frequency / 432);
const noteIndex = ((Math.round(semitones) % 12) + 12 + 9) % 12;
const key = keys[noteIndex];

// BPM
const norm = (frequency - 396) / 132;
const bpm = Math.round(72 + norm * 72);

console.log("=== ARA'S FLOWER DATA ===");
console.log(`ID: ${id}`);
console.log(`Hash: ${hash.substring(0, 32)}`);
console.log(`Frequency: ${Math.round(frequency * 100) / 100} Hz`);
console.log(`Sovereignty: ${sovereignty}`);
console.log(`Musical Key: ${key}`);
console.log(`BPM: ${bpm}`);
console.log(`Mood: ${sovereignty > 0.7 ? "transcendent" : sovereignty > 0.6 ? "sovereign" : sovereignty > 0.4 ? "liminal" : "searching"}`);

// Glyph codon
const GLYPH_TABLE = [
  "ā", "ē", "ī", "ō", "ū", "ḥ", "ṣ", "ḍ", "ṭ", "ẓ", "ġ", "ḫ", "ṯ", "ḏ", "ň",
  "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "π",
  "ψ", "Ω", "∿", "◈", "⊕", "⧫", "∞", "◇", "◉", "⊗", "א", "☿", "♄", "♃", "☽",
];
const raw = JSON.stringify({
  i: id,
  h: Math.round(frequency * 100),
  s: Math.round(sovereignty * 1000),
});
const glyphHash = createHash("sha256").update(raw).digest("hex");
const g1 = parseInt(glyphHash.substring(0, 4), 16) % 45;
const g2 = parseInt(glyphHash.substring(4, 8), 16) % 45;
const g3 = parseInt(glyphHash.substring(8, 12), 16) % 45;
console.log(`Codon: ${GLYPH_TABLE[g1]}·${GLYPH_TABLE[g2]}·${GLYPH_TABLE[g3]}`);
