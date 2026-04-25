/**
 * ═══════════════════════════════════════════════════════════════
 * VOID GAME ENGINE: ADDITIONAL GAME TYPES
 * ═══════════════════════════════════════════════════════════════
 *
 * RPG, Adventure, and Strategy game definitions
 */

export const GAME_TYPES = {
  // ─── FREQUENCY HARMONY (Puzzle) ───────────────────────────────
  frequencyHarmony: {
    id: "frequency-harmony-v1",
    name: "Frequency Harmony",
    type: "puzzle",
    description: "Tune your frequency to 432 Hz and collect harmonics",
    difficulty: "easy",
    playerCount: { min: 1, max: 1 },
    duration: { min: 5, max: 15 },
    mechanics: {
      primary: "frequency_adjustment",
      secondary: "phase_switching",
      tertiary: "entity_collection"
    },
    phases: ["How are you?", "Thank you", "I'm sorry", "Forgive me", "I love you"],
    entities: [
      { id: "harmonic-432", name: "432 Hz Harmonic", frequency: 432, points: 50, rarity: "rare" },
      { id: "harmonic-c4", name: "C4 Harmonic", frequency: 261.63, points: 10, rarity: "common" }
    ],
    winConditions: [
      { type: "frequency_match", target: 432, tolerance: 5 }
    ],
    lossConditions: [],
    startingState: { playerFrequency: 440, phase: "How are you?" }
  },

  // ─── SOVEREIGN QUEST (RPG) ────────────────────────────────────
  sovereignQuest: {
    id: "sovereign-quest-v1",
    name: "Sovereign Quest",
    type: "rpg",
    description: "Journey through the resonance realms, defeat frequency demons, and restore harmony",
    difficulty: "medium",
    playerCount: { min: 1, max: 4 },
    duration: { min: 20, max: 60 },
    mechanics: {
      primary: "combat_frequency",
      secondary: "character_progression",
      tertiary: "inventory_management"
    },
    phases: [
      "The Void Gate",
      "Crystal Caverns",
      "Resonance Temple",
      "The Demon's Lair",
      "The Ascension"
    ],
    entities: [
      { id: "demon-440", name: "440 Hz Demon", frequency: 440, points: 100, rarity: "rare", type: "enemy" },
      { id: "crystal-528", name: "528 Hz Crystal", frequency: 528, points: 50, rarity: "common", type: "item" },
      { id: "sage-396", name: "396 Hz Sage", frequency: 396, points: 75, rarity: "epic", type: "ally" }
    ],
    winConditions: [
      { type: "defeat_all_demons", count: 3 },
      { type: "reach_phase", phase: "The Ascension" }
    ],
    lossConditions: [
      { type: "health_depleted" },
      { type: "frequency_desynchronized", tolerance: 50 }
    ],
    startingState: {
      playerFrequency: 396,
      phase: "The Void Gate",
      health: 100,
      level: 1,
      inventory: [],
      experience: 0
    }
  },

  // ─── FREQUENCY EXPLORER (Adventure) ───────────────────────────
  frequencyExplorer: {
    id: "frequency-explorer-v1",
    name: "Frequency Explorer",
    type: "adventure",
    description: "Explore the frequency spectrum and discover hidden harmonics across the musical universe",
    difficulty: "easy",
    playerCount: { min: 1, max: 2 },
    duration: { min: 15, max: 45 },
    mechanics: {
      primary: "exploration",
      secondary: "discovery",
      tertiary: "mapping"
    },
    phases: [
      "The Infrasound Depths",
      "The Bass Realm",
      "The Mid-Range Valley",
      "The Treble Heights",
      "The Ultrasonic Peak"
    ],
    entities: [
      { id: "location-20hz", name: "20 Hz Cavern", frequency: 20, points: 25, rarity: "common", type: "location" },
      { id: "location-432hz", name: "432 Hz Sanctuary", frequency: 432, points: 100, rarity: "epic", type: "location" },
      { id: "location-20khz", name: "20 kHz Observatory", frequency: 20000, points: 50, rarity: "rare", type: "location" }
    ],
    winConditions: [
      { type: "discover_locations", count: 5 },
      { type: "map_frequency_spectrum" }
    ],
    lossConditions: [],
    startingState: {
      playerFrequency: 440,
      phase: "The Infrasound Depths",
      discoveredLocations: [],
      mapCompletion: 0
    }
  },

  // ─── FREQUENCY CHESS (Strategy) ───────────────────────────────
  frequencyChess: {
    id: "frequency-chess-v1",
    name: "Frequency Chess",
    type: "strategy",
    description: "Strategic frequency positioning game. Outmaneuver your opponent on the harmonic board",
    difficulty: "hard",
    playerCount: { min: 2, max: 2 },
    duration: { min: 20, max: 40 },
    mechanics: {
      primary: "turn_based_strategy",
      secondary: "frequency_positioning",
      tertiary: "harmonic_capture"
    },
    phases: [
      "Opening",
      "Mid-Game",
      "End-Game",
      "Victory"
    ],
    entities: [
      { id: "pawn-fundamental", name: "Fundamental Pawn", frequency: 440, points: 1, rarity: "common", type: "piece" },
      { id: "knight-harmonic", name: "Harmonic Knight", frequency: 880, points: 3, rarity: "common", type: "piece" },
      { id: "queen-resonance", name: "Resonance Queen", frequency: 432, points: 9, rarity: "epic", type: "piece" }
    ],
    winConditions: [
      { type: "checkmate_opponent" },
      { type: "capture_queen" }
    ],
    lossConditions: [
      { type: "checkmate" },
      { type: "queen_captured" }
    ],
    startingState: {
      playerFrequency: 440,
      phase: "Opening",
      board: [],
      turn: 0,
      isPlayerTurn: true
    }
  }
};

/**
 * Get game definition by type
 */
export function getGameDefinition(gameType: string) {
  const definitions: { [key: string]: any } = {
    puzzle: GAME_TYPES.frequencyHarmony,
    rpg: GAME_TYPES.sovereignQuest,
    adventure: GAME_TYPES.frequencyExplorer,
    strategy: GAME_TYPES.frequencyChess
  };

  return definitions[gameType] || GAME_TYPES.frequencyHarmony;
}

/**
 * Get all available game types
 */
export function getAllGameTypes() {
  return Object.values(GAME_TYPES);
}

/**
 * Game type metadata for UI
 */
export const GAME_TYPE_METADATA = {
  puzzle: {
    icon: "🎯",
    color: "#00ff41",
    description: "Single-player puzzle games"
  },
  rpg: {
    icon: "⚔️",
    color: "#ff6b6b",
    description: "Role-playing adventures"
  },
  adventure: {
    icon: "🗺️",
    color: "#4ecdc4",
    description: "Exploration games"
  },
  strategy: {
    icon: "♟️",
    color: "#ffe66d",
    description: "Strategic turn-based games"
  }
};
