/**
 * ═══════════════════════════════════════════════════════════════
 * SONIC STUDIO tRPC ROUTER
 * ═══════════════════════════════════════════════════════════════
 *
 * Real-time audio decomposition and manipulation procedures
 */

import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { separateTrack, StemSeparationResult } from "./demucsService";
import {
  validateControls,
  generateFilterChain,
  PRESETS,
  AudioControls,
} from "./audioControlsService";
import { MUSIC_LIBRARY } from "./musicLibrary";

// In-memory cache for separated stems
const stemCache = new Map<number, StemSeparationResult>();

export const sonicStudioRouter = router({
  // ─── STEM SEPARATION ────────────────────────────────────────

  /**
   * Get list of all tracks available for separation
   */
  listTracks: publicProcedure.query(() => {
    return MUSIC_LIBRARY.map((track) => ({
      index: track.index,
      title: track.title,
      duration: track.duration,
      dominantHz: track.dominantHz,
      tuning: track.tuning,
      cdnUrl: track.cdnUrl,
    }));
  }),

  /**
   * Separate a single track into stems (vocals, drums, bass, other)
   * This is a long-running operation - consider implementing polling
   */
  separateTrack: publicProcedure
    .input(z.object({ trackIndex: z.number().min(0).max(33) }))
    .mutation(async ({ input }) => {
      // Check cache first
      if (stemCache.has(input.trackIndex)) {
        return {
          cached: true,
          stems: stemCache.get(input.trackIndex),
        };
      }

      const track = MUSIC_LIBRARY[input.trackIndex];
      if (!track) {
        throw new Error(`Track ${input.trackIndex} not found`);
      }

      try {
        // Separate the track
        const result = await separateTrack(
          track.index,
          track.title,
          track.cdnUrl
        );

        // Cache the result
        stemCache.set(input.trackIndex, result);

        return {
          cached: false,
          stems: result,
        };
      } catch (error) {
        throw new Error(
          `Failed to separate track: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Get cached stems for a track
   */
  getStems: publicProcedure
    .input(z.object({ trackIndex: z.number().min(0).max(33) }))
    .query(({ input }) => {
      const stems = stemCache.get(input.trackIndex);
      if (!stems) {
        return null;
      }
      return stems;
    }),

  /**
   * Get all cached stems
   */
  getAllStems: publicProcedure.query(() => {
    return Array.from(stemCache.values());
  }),

  // ─── AUDIO CONTROLS ─────────────────────────────────────────

  /**
   * Get audio control presets
   */
  getPresets: publicProcedure.query(() => {
    return Object.entries(PRESETS).map(([name, controls]) => ({
      name,
      controls,
      description: getPresetDescription(name),
    }));
  }),

  /**
   * Validate and generate filter chain for audio controls
   */
  generateFilterChain: publicProcedure
    .input(
      z.object({
        pitch: z.number().min(-12).max(12).optional(),
        volume: z.number().min(0).max(200).optional(),
        aggression: z.number().min(0).max(100).optional(),
        tempo: z.number().min(0.5).max(2.0).optional(),
        bass: z.number().min(-12).max(12).optional(),
        mid: z.number().min(-12).max(12).optional(),
        treble: z.number().min(-12).max(12).optional(),
      })
    )
    .query(({ input }) => {
      const controls = validateControls(input as Partial<AudioControls>);
      const filterChain = generateFilterChain(controls);
      return {
        controls,
        filterChain,
      };
    }),

  /**
   * Get a specific preset
   */
  getPreset: publicProcedure
    .input(z.object({ presetName: z.string() }))
    .query(({ input }) => {
      const preset = PRESETS[input.presetName as keyof typeof PRESETS];
      if (!preset) {
        throw new Error(`Preset ${input.presetName} not found`);
      }
      return {
        name: input.presetName,
        controls: preset,
        description: getPresetDescription(input.presetName),
        filterChain: generateFilterChain(preset),
      };
    }),

  // ─── CROSS-FREQUENCY RESONANCE ──────────────────────────────

  /**
   * Blend two stems together at a specified ratio
   * Returns the blended stem configuration
   */
  blendStems: publicProcedure
    .input(
      z.object({
        trackIndex: z.number().min(0).max(33),
        primaryStem: z.enum(["vocals", "drums", "bass", "other"]),
        secondaryStem: z.enum(["vocals", "drums", "bass", "other"]),
        secondaryRatio: z.number().min(0).max(100), // 0-100 percentage
        primaryControls: z
          .object({
            pitch: z.number().optional(),
            volume: z.number().optional(),
            aggression: z.number().optional(),
            tempo: z.number().optional(),
            bass: z.number().optional(),
            mid: z.number().optional(),
            treble: z.number().optional(),
          })
          .optional(),
        secondaryControls: z
          .object({
            pitch: z.number().optional(),
            volume: z.number().optional(),
            aggression: z.number().optional(),
            tempo: z.number().optional(),
            bass: z.number().optional(),
            mid: z.number().optional(),
            treble: z.number().optional(),
          })
          .optional(),
      })
    )
    .query(({ input }) => {
      const stems = stemCache.get(input.trackIndex);
      if (!stems) {
        throw new Error(`Stems for track ${input.trackIndex} not found`);
      }

      const primaryControls = validateControls(input.primaryControls || {});
      const secondaryControls = validateControls(input.secondaryControls || {});

      const primaryStemData = stems[input.primaryStem as keyof typeof stems] as any;
      const secondaryStemData = stems[input.secondaryStem as keyof typeof stems] as any;

      return {
        trackIndex: input.trackIndex,
        blend: {
          primary: {
            stem: input.primaryStem,
            url: primaryStemData?.url,
            controls: primaryControls,
            filterChain: generateFilterChain(primaryControls),
          },
          secondary: {
            stem: input.secondaryStem,
            url: secondaryStemData?.url,
            ratio: input.secondaryRatio,
            controls: secondaryControls,
            filterChain: generateFilterChain(secondaryControls),
          },
        },
      };
    }),

  /**
   * Get frequency analysis for a stem
   */
  getFrequencyAnalysis: publicProcedure
    .input(
      z.object({
        trackIndex: z.number().min(0).max(33),
        stem: z.enum(["vocals", "drums", "bass", "other"]),
      })
    )
    .query(({ input }) => {
      const track = MUSIC_LIBRARY[input.trackIndex];
      if (!track) {
        throw new Error(`Track ${input.trackIndex} not found`);
      }

      // Return frequency characteristics for each stem type
      const frequencyProfiles = {
        vocals: {
          dominantRange: "200Hz - 3kHz",
          dominantHz: track.dominantHz,
          characteristics: ["speech intelligibility", "presence", "clarity"],
        },
        drums: {
          dominantRange: "50Hz - 5kHz",
          dominantHz: Math.max(50, track.dominantHz * 0.8),
          characteristics: ["attack", "punch", "rhythm"],
        },
        bass: {
          dominantRange: "20Hz - 250Hz",
          dominantHz: Math.max(20, track.dominantHz * 0.5),
          characteristics: ["depth", "foundation", "low-end"],
        },
        other: {
          dominantRange: "100Hz - 10kHz",
          dominantHz: track.dominantHz,
          characteristics: ["texture", "harmony", "color"],
        },
      };

      return frequencyProfiles[input.stem];
    }),
});

/**
 * Helper: Get description for preset
 */
function getPresetDescription(presetName: string): string {
  const descriptions: Record<string, string> = {
    VOCALS_ISOLATED:
      "Boost vocals with high isolation, reduce bass, enhance presence",
    INSTRUMENTAL_BOOST:
      "Emphasize instruments, reduce isolation, add bass and treble",
    BASS_EMPHASIS: "Heavy bass boost, reduce mids and treble",
    TREBLE_CLARITY: "Maximize treble for clarity, reduce bass and mids",
    SLOWED: "Slow tempo to 75%, add bass warmth",
    SPED_UP: "Speed up to 150%, add treble brightness",
    PITCHED_UP: "Raise pitch by 5 semitones, enhance mids and treble",
    PITCHED_DOWN: "Lower pitch by 5 semitones, add bass warmth",
  };
  return descriptions[presetName] || "Custom audio preset";
}
