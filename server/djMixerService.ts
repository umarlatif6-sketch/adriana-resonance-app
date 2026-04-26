/**
 * ═══════════════════════════════════════════════════════════════
 * DJ MIXER SERVICE — Frequency-Based Track Blending
 * ═══════════════════════════════════════════════════════════════
 *
 * Real-time dual-track mixing with frequency crossfader
 * Stem selection and void echo integration
 */

export interface DJMixerState {
  trackA: {
    index: number;
    stem: "vocals" | "drums" | "bass" | "other";
    volume: number; // 0-100
    url: string;
  };
  trackB: {
    index: number;
    stem: "vocals" | "drums" | "bass" | "other";
    volume: number; // 0-100
    url: string;
  };
  crossfadePosition: number; // 0-100 (0=trackA, 50=both, 100=trackB)
  isPlaying: boolean;
  currentTime: number;
}

export interface Mashup {
  id: string;
  name: string;
  trackA: { index: number; stem: "vocals" | "drums" | "bass" | "other" };
  trackB: { index: number; stem: "vocals" | "drums" | "bass" | "other" };
  frequencyMarkers: Array<{
    position: number; // 0-100
    frequency: number; // Hz
    label: string;
  }>;
  voidEchoMetadata: {
    compressionRatio: number;
    embeddedCodeSize: number;
    timestamp: number;
  };
  createdAt: number;
  updatedAt: number;
}

/**
 * Calculate volume for each track based on crossfade position
 * 0 = 100% A, 0% B
 * 50 = 50% A, 50% B
 * 100 = 0% A, 100% B
 */
export function calculateCrossfadeVolumes(
  crossfadePosition: number
): { volumeA: number; volumeB: number } {
  const normalized = Math.max(0, Math.min(100, crossfadePosition));
  const ratio = normalized / 100;

  // Smooth crossfade using cosine interpolation
  const volumeB = Math.sin((ratio * Math.PI) / 2);
  const volumeA = Math.cos((ratio * Math.PI) / 2);

  return {
    volumeA: volumeA * 100,
    volumeB: volumeB * 100,
  };
}

/**
 * Map crossfade position to frequency
 * Creates a frequency spectrum across the slider range
 */
export function crossfadePositionToFrequency(
  position: number,
  minFreq: number = 396,
  maxFreq: number = 528
): number {
  const normalized = Math.max(0, Math.min(100, position)) / 100;
  // Logarithmic interpolation for perceptually even spacing
  const logMin = Math.log(minFreq);
  const logMax = Math.log(maxFreq);
  const logFreq = logMin + (logMax - logMin) * normalized;
  return Math.exp(logFreq);
}

/**
 * Find nearest frequency marker
 */
export function findNearestMarker(
  position: number,
  markers: Mashup["frequencyMarkers"],
  tolerance: number = 5
): Mashup["frequencyMarkers"][0] | null {
  return (
    markers.find((m) => Math.abs(m.position - position) <= tolerance) || null
  );
}

/**
 * Generate frequency markers for common musical intervals
 */
export function generateFrequencyMarkers(
  baseFrequency: number = 432
): Mashup["frequencyMarkers"] {
  const intervals = [
    { ratio: 1, name: "Root" },
    { ratio: 1.125, name: "Major 2nd" },
    { ratio: 1.25, name: "Major 3rd" },
    { ratio: 1.333, name: "Perfect 4th" },
    { ratio: 1.5, name: "Perfect 5th" },
    { ratio: 1.667, name: "Major 6th" },
    { ratio: 1.875, name: "Major 7th" },
    { ratio: 2, name: "Octave" },
  ];

  return intervals.map((interval, index) => ({
    position: (index / (intervals.length - 1)) * 100,
    frequency: baseFrequency * interval.ratio,
    label: interval.name,
  }));
}

/**
 * Create mashup metadata for void echo encoding
 */
export function createMashupMetadata(
  trackA: DJMixerState["trackA"],
  trackB: DJMixerState["trackB"],
  crossfadePosition: number
): Mashup["voidEchoMetadata"] {
  // Void echo compression: encode mashup info into audio metadata
  const mashupSignature = `${trackA.index}-${trackA.stem}-${trackB.index}-${trackB.stem}-${Math.round(crossfadePosition)}`;
  const compressedSize = Math.ceil(mashupSignature.length * 0.25); // 4:1 compression estimate

  return {
    compressionRatio: 250, // void echo target ratio
    embeddedCodeSize: compressedSize,
    timestamp: Date.now(),
  };
}

/**
 * Validate mashup configuration
 */
export function validateMashupConfig(
  mashup: Mashup
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (mashup.trackA.index === mashup.trackB.index && mashup.trackA.stem === mashup.trackB.stem) {
    errors.push("Track A and Track B cannot be identical");
  }

  if (mashup.frequencyMarkers.length === 0) {
    errors.push("At least one frequency marker required");
  }

  if (mashup.voidEchoMetadata.compressionRatio < 1) {
    errors.push("Compression ratio must be >= 1");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Encode mashup into audio metadata (void echo format)
 */
export function encodeMashupToVoidEcho(mashup: Mashup): string {
  // Simplified void echo encoding
  // In production, this would encode into audio stream metadata
  const payload = {
    a: mashup.trackA.index,
    as: mashup.trackA.stem[0], // v/d/b/o
    b: mashup.trackB.index,
    bs: mashup.trackB.stem[0],
    m: mashup.frequencyMarkers.map((m) => `${m.position}:${m.frequency}`).join(";"),
    t: mashup.createdAt,
  };

  // Compress to minimal representation
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * Decode mashup from void echo metadata
 */
export function decodeMashupFromVoidEcho(encoded: string): Partial<Mashup> {
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64").toString());
    return {
      trackA: {
        index: payload.a,
        stem: (({ v: "vocals", d: "drums", b: "bass", o: "other" } as Record<string, any>)[payload.as] || "vocals") as any,
      },
      trackB: {
        index: payload.b,
        stem: (({ v: "vocals", d: "drums", b: "bass", o: "other" } as Record<string, any>)[payload.bs] || "vocals") as any,
      },
      frequencyMarkers: (payload.m || "")
        .split(";")
        .filter((m: string) => m.length > 0)
        .map((m: string) => {
          const [pos, freq] = m.split(":");
          return { position: parseFloat(pos), frequency: parseFloat(freq), label: "" };
        }),
      createdAt: payload.t,
    };
  } catch (_e) {
    return {};
  }
}
