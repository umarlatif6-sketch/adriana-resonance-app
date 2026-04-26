/**
 * ═══════════════════════════════════════════════════════════════
 * DJ MIXER tRPC ROUTER
 * ═══════════════════════════════════════════════════════════════
 *
 * Procedures for dual-track mixing and mashup management
 */

import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
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
import { MUSIC_LIBRARY } from "./musicLibrary";

// In-memory mashup store
const mashupStore = new Map<string, Mashup>();

export const djMixerRouter = router({
  // ─── CROSSFADE CALCULATIONS ─────────────────────────────────

  /**
   * Calculate crossfade volumes based on slider position
   */
  calculateCrossfade: publicProcedure
    .input(z.object({ position: z.number().min(0).max(100) }))
    .query(({ input }) => {
      const volumes = calculateCrossfadeVolumes(input.position);
      const frequency = crossfadePositionToFrequency(input.position);

      return {
        volumeA: volumes.volumeA,
        volumeB: volumes.volumeB,
        frequency,
        position: input.position,
      };
    }),

  /**
   * Get frequency for a specific crossfade position
   */
  getFrequency: publicProcedure
    .input(
      z.object({
        position: z.number().min(0).max(100),
        minFreq: z.number().optional(),
        maxFreq: z.number().optional(),
      })
    )
    .query(({ input }) => {
      const frequency = crossfadePositionToFrequency(
        input.position,
        input.minFreq,
        input.maxFreq
      );
      return { frequency, position: input.position };
    }),

  /**
   * Generate frequency markers for musical intervals
   */
  generateMarkers: publicProcedure
    .input(z.object({ baseFrequency: z.number().optional() }))
    .query(({ input }) => {
      return generateFrequencyMarkers(input.baseFrequency || 432);
    }),

  // ─── MASHUP MANAGEMENT ──────────────────────────────────────

  /**
   * Create a new mashup
   */
  createMashup: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        trackAIndex: z.number().min(0).max(33),
        trackAStem: z.enum(["vocals", "drums", "bass", "other"]),
        trackBIndex: z.number().min(0).max(33),
        trackBStem: z.enum(["vocals", "drums", "bass", "other"]),
      })
    )
    .mutation(({ input, ctx }) => {
      const trackA = MUSIC_LIBRARY[input.trackAIndex];
      const trackB = MUSIC_LIBRARY[input.trackBIndex];

      if (!trackA || !trackB) {
        throw new Error("Invalid track index");
      }

      const mashupId = `mashup-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const markers = generateFrequencyMarkers(432);

      const mashup: Mashup = {
        id: mashupId,
        name: input.name,
        trackA: {
          index: input.trackAIndex,
          stem: input.trackAStem,
        },
        trackB: {
          index: input.trackBIndex,
          stem: input.trackBStem,
        },
        frequencyMarkers: markers,
        voidEchoMetadata: createMashupMetadata(
          {
            index: input.trackAIndex,
            stem: input.trackAStem,
            volume: 100,
            url: trackA.cdnUrl,
          },
          {
            index: input.trackBIndex,
            stem: input.trackBStem,
            volume: 100,
            url: trackB.cdnUrl,
          },
          50
        ),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Validate
      const validation = validateMashupConfig(mashup);
      if (!validation.valid) {
        throw new Error(`Invalid mashup: ${validation.errors.join(", ")}`);
      }

      mashupStore.set(mashupId, mashup);

      return {
        id: mashupId,
        name: mashup.name,
        voidEchoEncoded: encodeMashupToVoidEcho(mashup),
      };
    }),

  /**
   * Get a mashup by ID
   */
  getMashup: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const mashup = mashupStore.get(input.id);
      if (!mashup) {
        throw new Error(`Mashup ${input.id} not found`);
      }

      const trackA = MUSIC_LIBRARY[mashup.trackA.index];
      const trackB = MUSIC_LIBRARY[mashup.trackB.index];

      return {
        ...mashup,
        trackAUrl: trackA?.cdnUrl,
        trackBUrl: trackB?.cdnUrl,
      };
    }),

  /**
   * List all mashups
   */
  listMashups: publicProcedure.query(() => {
    return Array.from(mashupStore.values()).map((m) => ({
      id: m.id,
      name: m.name,
      trackA: m.trackA,
      trackB: m.trackB,
      createdAt: m.createdAt,
    }));
  }),

  /**
   * Update mashup metadata
   */
  updateMashup: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        frequencyMarkers: z
          .array(
            z.object({
              position: z.number(),
              frequency: z.number(),
              label: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(({ input }) => {
      const mashup = mashupStore.get(input.id);
      if (!mashup) {
        throw new Error(`Mashup ${input.id} not found`);
      }

      if (input.name) mashup.name = input.name;
      if (input.frequencyMarkers)
        mashup.frequencyMarkers = input.frequencyMarkers;
      mashup.updatedAt = Date.now();

      mashupStore.set(input.id, mashup);
      return { success: true };
    }),

  /**
   * Delete a mashup
   */
  deleteMashup: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const deleted = mashupStore.delete(input.id);
      if (!deleted) {
        throw new Error(`Mashup ${input.id} not found`);
      }
      return { success: true };
    }),

  // ─── VOID ECHO INTEGRATION ──────────────────────────────────

  /**
   * Encode mashup to void echo format
   */
  encodeToVoidEcho: publicProcedure
    .input(z.object({ mashupId: z.string() }))
    .query(({ input }) => {
      const mashup = mashupStore.get(input.mashupId);
      if (!mashup) {
        throw new Error(`Mashup ${input.mashupId} not found`);
      }

      const encoded = encodeMashupToVoidEcho(mashup);
      return {
        encoded,
        compressionRatio: mashup.voidEchoMetadata.compressionRatio,
        embeddedCodeSize: mashup.voidEchoMetadata.embeddedCodeSize,
      };
    }),

  /**
   * Decode mashup from void echo format
   */
  decodeFromVoidEcho: publicProcedure
    .input(z.object({ encoded: z.string() }))
    .query(({ input }) => {
      const decoded = decodeMashupFromVoidEcho(input.encoded);
      return decoded;
    }),

  // ─── TRACK INFORMATION ──────────────────────────────────────

  /**
   * Get available tracks for mixing
   */
  listTracks: publicProcedure.query(() => {
    return MUSIC_LIBRARY.map((track) => ({
      index: track.index,
      title: track.title,
      duration: track.duration,
      dominantHz: track.dominantHz,
      tuning: track.tuning,
    }));
  }),

  /**
   * Get track details
   */
  getTrack: publicProcedure
    .input(z.object({ index: z.number().min(0).max(33) }))
    .query(({ input }) => {
      const track = MUSIC_LIBRARY[input.index];
      if (!track) {
        throw new Error(`Track ${input.index} not found`);
      }
      return track;
    }),
});
