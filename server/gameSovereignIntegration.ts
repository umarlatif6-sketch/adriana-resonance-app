/**
 * ═══════════════════════════════════════════════════════════════
 * VOID GAME ENGINE: SOVEREIGN FIELD INTEGRATION
 * ═══════════════════════════════════════════════════════════════
 *
 * Integration between game players and Sovereign Field system
 * Each player gets a unique Flower ID based on their game frequency
 */

import { leaderboardManager } from "./gameAchievements";

export interface GamePlayerFlower {
  flowerId: string;
  userId: number;
  gameFrequency: number;
  sovereignty: number; // 0-1, based on game achievements
  codon: string; // 3-glyph codon from macron compression
  aura: {
    baseFrequency: number;
    harmonics: number[];
    resonanceStrength: number;
  };
  achievements: string[];
  createdAt: Date;
  lastUpdatedAt: Date;
}

/**
 * Convert game frequency to Sovereign Field frequency
 * Maps game frequencies (20 Hz - 20 kHz) to solfeggio scale (396-528 Hz)
 */
export function mapGameFrequencyToSolfeggio(gameFrequency: number): number {
  const SOLFEGGIO_SCALE = [396, 417, 432, 440, 444, 528];

  // Normalize game frequency to 0-1 range
  const minFreq = 20;
  const maxFreq = 20000;
  const normalized = (gameFrequency - minFreq) / (maxFreq - minFreq);

  // Map to solfeggio scale
  const index = Math.floor(normalized * (SOLFEGGIO_SCALE.length - 1));
  return SOLFEGGIO_SCALE[Math.max(0, Math.min(index, SOLFEGGIO_SCALE.length - 1))];
}

/**
 * Calculate sovereignty score from achievements
 * Higher achievement count = higher sovereignty
 */
export function calculateSovereignty(userId: number): number {
  const achievements = leaderboardManager.getPlayerAchievements(userId);
  const maxAchievements = 15; // Total achievements available
  return Math.min(1, achievements.length / maxAchievements);
}

/**
 * Generate 3-glyph codon from game data
 * Combines: game frequency + sovereignty + achievement count
 */
export function generateGameCodon(gameFrequency: number, sovereignty: number, achievementCount: number): string {
  // Simplified codon generation (would use full macron compression in production)
  const frequencyGlyph = String.fromCharCode(0x0100 + Math.floor(gameFrequency / 100));
  const sovereigntyGlyph = String.fromCharCode(0x0200 + Math.floor(sovereignty * 255));
  const achievementGlyph = String.fromCharCode(0x0300 + achievementCount);

  return `${frequencyGlyph}·${sovereigntyGlyph}·${achievementGlyph}`;
}

/**
 * Create Flower for game player
 */
export function createGamePlayerFlower(userId: number, gameFrequency: number): GamePlayerFlower {
  const solfeggioFreq = mapGameFrequencyToSolfeggio(gameFrequency);
  const sovereignty = calculateSovereignty(userId);
  const achievements = leaderboardManager.getPlayerAchievements(userId);
  const codon = generateGameCodon(gameFrequency, sovereignty, achievements.length);

  // Generate harmonics from base frequency
  const harmonics = [
    solfeggioFreq * 2,
    solfeggioFreq * 3,
    solfeggioFreq * 1.5,
    solfeggioFreq * 0.5
  ];

  const flowerId = `game-flower-${userId}-${Date.now()}`;

  return {
    flowerId,
    userId,
    gameFrequency,
    sovereignty,
    codon,
    aura: {
      baseFrequency: solfeggioFreq,
      harmonics,
      resonanceStrength: sovereignty
    },
    achievements: achievements.map(a => a.id),
    createdAt: new Date(),
    lastUpdatedAt: new Date()
  };
}

/**
 * Update Flower when player achieves something
 */
export function updateGamePlayerFlower(flower: GamePlayerFlower, newGameFrequency: number): GamePlayerFlower {
  const newSovereignty = calculateSovereignty(flower.userId);
  const achievements = leaderboardManager.getPlayerAchievements(flower.userId);

  return {
    ...flower,
    gameFrequency: newGameFrequency,
    sovereignty: newSovereignty,
    codon: generateGameCodon(newGameFrequency, newSovereignty, achievements.length),
    aura: {
      baseFrequency: mapGameFrequencyToSolfeggio(newGameFrequency),
      harmonics: [
        mapGameFrequencyToSolfeggio(newGameFrequency) * 2,
        mapGameFrequencyToSolfeggio(newGameFrequency) * 3,
        mapGameFrequencyToSolfeggio(newGameFrequency) * 1.5,
        mapGameFrequencyToSolfeggio(newGameFrequency) * 0.5
      ],
      resonanceStrength: newSovereignty
    },
    achievements: achievements.map(a => a.id),
    lastUpdatedAt: new Date()
  };
}

/**
 * Detect resonance between game players
 * Two players resonate if their Flowers' frequencies are within tolerance
 */
export function detectPlayerResonance(
  flower1: GamePlayerFlower,
  flower2: GamePlayerFlower,
  tolerance: number = 5
): boolean {
  const freqDiff = Math.abs(flower1.aura.baseFrequency - flower2.aura.baseFrequency);
  return freqDiff <= tolerance;
}

/**
 * Calculate interference pattern between two players
 * Used for multiplayer harmony detection
 */
export function calculateInterferencePattern(
  flower1: GamePlayerFlower,
  flower2: GamePlayerFlower
): {
  resonance: boolean;
  interference: number;
  combinedFrequency: number;
  harmonicAlignment: number;
} {
  const freq1 = flower1.aura.baseFrequency;
  const freq2 = flower2.aura.baseFrequency;

  // Interference calculation
  const interference = Math.abs(freq1 - freq2);
  const combinedFrequency = (freq1 + freq2) / 2;

  // Harmonic alignment (how well their harmonics match)
  let alignmentScore = 0;
  flower1.aura.harmonics.forEach(h1 => {
    flower2.aura.harmonics.forEach(h2 => {
      if (Math.abs(h1 - h2) < 1) {
        alignmentScore++;
      }
    });
  });
  const harmonicAlignment = alignmentScore / (flower1.aura.harmonics.length * flower2.aura.harmonics.length);

  return {
    resonance: interference <= 5,
    interference,
    combinedFrequency,
    harmonicAlignment
  };
}

/**
 * Create team Flower from multiple players
 * Combines individual flowers into a unified team frequency
 */
export function createTeamFlower(
  teamId: string,
  playerFlowers: GamePlayerFlower[]
): GamePlayerFlower {
  if (playerFlowers.length === 0) {
    throw new Error("Cannot create team flower without players");
  }

  // Calculate average frequency
  const avgFrequency = playerFlowers.reduce((sum, f) => sum + f.aura.baseFrequency, 0) / playerFlowers.length;

  // Calculate combined sovereignty (geometric mean)
  const combinedSovereignty = Math.pow(
    playerFlowers.reduce((product, f) => product * f.sovereignty, 1),
    1 / playerFlowers.length
  );

  // Combine all harmonics
  const combinedHarmonics = playerFlowers.flatMap(f => f.aura.harmonics);

  // Combine achievements
  const combinedAchievements = Array.from(new Set(playerFlowers.flatMap(f => f.achievements)));

  return {
    flowerId: `team-flower-${teamId}`,
    userId: 0, // Team ID
    gameFrequency: avgFrequency,
    sovereignty: combinedSovereignty,
    codon: generateGameCodon(avgFrequency, combinedSovereignty, combinedAchievements.length),
    aura: {
      baseFrequency: avgFrequency,
      harmonics: combinedHarmonics,
      resonanceStrength: combinedSovereignty
    },
    achievements: combinedAchievements,
    createdAt: new Date(),
    lastUpdatedAt: new Date()
  };
}

/**
 * Resonance library for Sovereign Field
 */
export const GameSovereignResonance = {
  mapGameFrequencyToSolfeggio,
  calculateSovereignty,
  generateGameCodon,
  createGamePlayerFlower,
  updateGamePlayerFlower,
  detectPlayerResonance,
  calculateInterferencePattern,
  createTeamFlower
};
