/**
 * ═══════════════════════════════════════════════════════════════
 * DEMUCS STEM SEPARATION SERVICE
 * ═══════════════════════════════════════════════════════════════
 *
 * Separates audio into: vocals, drums, bass, other
 * Using Meta's Demucs model (state-of-the-art quality)
 */

import { spawn } from "child_process";
import { writeFileSync, unlinkSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { storagePut } from "./storage";
import axios from "axios";

export interface StemSeparationResult {
  trackIndex: number;
  trackTitle: string;
  vocals: { url: string; key: string };
  drums: { url: string; key: string };
  bass: { url: string; key: string };
  other: { url: string; key: string };
  originalUrl: string;
}

/**
 * Download audio file from CDN URL
 */
async function downloadAudio(cdnUrl: string): Promise<Buffer> {
  const response = await axios.get(cdnUrl, {
    responseType: "arraybuffer",
    timeout: 60000,
  });
  return Buffer.from(response.data);
}

/**
 * Separate audio into stems using Demucs
 * Returns paths to separated stem files
 */
async function separateWithDemucs(
  audioPath: string
): Promise<{ vocals: string; drums: string; bass: string; other: string }> {
  return new Promise((resolve, reject) => {
    const outputDir = join(tmpdir(), `demucs-${Date.now()}`);

    // Run: python -m demucs -n mdx_extra_q -o {outputDir} {audioPath}
    const process = spawn("python3", [
      "-m",
      "demucs",
      "-n",
      "mdx_extra_q", // Best quality model
      "-o",
      outputDir,
      audioPath,
    ]);

    let stderr = "";
    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Demucs failed: ${stderr}`));
        return;
      }

      // Demucs outputs to: {outputDir}/mdx_extra_q/{filename}/vocals.wav, drums.wav, bass.wav, other.wav
      const stemDir = join(
        outputDir,
        "mdx_extra_q",
        audioPath.split("/").pop()!.replace(/\.[^.]+$/, "")
      );

      resolve({
        vocals: join(stemDir, "vocals.wav"),
        drums: join(stemDir, "drums.wav"),
        bass: join(stemDir, "bass.wav"),
        other: join(stemDir, "other.wav"),
      });
    });
  });
}

/**
 * Upload stem to S3 and return URL
 */
async function uploadStem(
  stemPath: string,
  trackIndex: number,
  stemType: string
): Promise<{ url: string; key: string }> {
  const stemData = readFileSync(stemPath);
  const key = `stems/${trackIndex}/${stemType}-${Date.now()}.wav`;
  const result = await storagePut(key, stemData, "audio/wav");
  return { url: result.url, key };
}

/**
 * Separate a single track into stems
 */
export async function separateTrack(
  trackIndex: number,
  trackTitle: string,
  cdnUrl: string
): Promise<StemSeparationResult> {
  // Download audio
  const audioBuffer = await downloadAudio(cdnUrl);
  const tempAudioPath = join(tmpdir(), `track-${trackIndex}-${Date.now()}.mp3`);
  writeFileSync(tempAudioPath, audioBuffer);

  try {
    // Separate with Demucs
    const stemPaths = await separateWithDemucs(tempAudioPath);

    // Upload all stems to S3 in parallel
    const [vocals, drums, bass, other] = await Promise.all([
      uploadStem(stemPaths.vocals, trackIndex, "vocals"),
      uploadStem(stemPaths.drums, trackIndex, "drums"),
      uploadStem(stemPaths.bass, trackIndex, "bass"),
      uploadStem(stemPaths.other, trackIndex, "other"),
    ]);

    return {
      trackIndex,
      trackTitle,
      vocals,
      drums,
      bass,
      other,
      originalUrl: cdnUrl,
    };
  } finally {
    // Cleanup
    try {
      unlinkSync(tempAudioPath);
    } catch (_e) {
      /* ignore */
    }
  }
}

/**
 * Batch separate multiple tracks
 */
export async function separateTracks(
  tracks: Array<{ index: number; title: string; cdnUrl: string }>
): Promise<StemSeparationResult[]> {
  const results: StemSeparationResult[] = [];

  for (const track of tracks) {
    try {
      const result = await separateTrack(track.index, track.title, track.cdnUrl);
      results.push(result);
      console.log(`✓ Separated track ${track.index}: ${track.title}`);
    } catch (error) {
      console.error(`✗ Failed to separate track ${track.index}:`, error);
    }
  }

  return results;
}
