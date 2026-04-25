/**
 * ═══════════════════════════════════════════════════════════════
 * VOID GAME ENGINE: EXTENDED TESTS
 * ═══════════════════════════════════════════════════════════════
 *
 * Tests for game types, multiplayer, achievements, and Sovereign Field integration
 */

import { describe, it, expect, beforeEach } from "vitest";
import { GAME_TYPES, getGameDefinition, getAllGameTypes } from "./gameTypes";
import { MultiplayerSessionManager } from "./gameMultiplayer";
import { LeaderboardManager, ACHIEVEMENTS } from "./gameAchievements";
import {
  mapGameFrequencyToSolfeggio,
  calculateSovereignty,
  generateGameCodon,
  createGamePlayerFlower,
  detectPlayerResonance,
  calculateInterferencePattern,
  createTeamFlower
} from "./gameSovereignIntegration";

describe("Game Types Tests", () => {
  it("should have all 4 game types defined", () => {
    const types = getAllGameTypes();
    expect(types.length).toBe(4);
  });

  it("should get game definition by type", () => {
    const puzzleGame = getGameDefinition("puzzle");
    expect(puzzleGame.type).toBe("puzzle");
    expect(puzzleGame.name).toBe("Frequency Harmony");
  });

  it("should have RPG game with combat mechanics", () => {
    const rpgGame = GAME_TYPES.sovereignQuest;
    expect(rpgGame.type).toBe("rpg");
    expect(rpgGame.mechanics.primary).toBe("combat_frequency");
  });

  it("should have Adventure game with exploration", () => {
    const adventureGame = GAME_TYPES.frequencyExplorer;
    expect(adventureGame.type).toBe("adventure");
    expect(adventureGame.mechanics.primary).toBe("exploration");
  });

  it("should have Strategy game with turn-based mechanics", () => {
    const strategyGame = GAME_TYPES.frequencyChess;
    expect(strategyGame.type).toBe("strategy");
    expect(strategyGame.mechanics.primary).toBe("turn_based_strategy");
  });
});

describe("Multiplayer Session Tests", () => {
  let manager: MultiplayerSessionManager;

  beforeEach(() => {
    manager = new MultiplayerSessionManager();
  });

  it("should create a multiplayer session", () => {
    const sessionId = crypto.randomUUID();
    const session = manager.createSession(sessionId, "game-1");

    expect(session.id).toBe(sessionId);
    expect(session.status).toBe("waiting");
    expect(session.players.size).toBe(0);
  });

  it("should allow players to join session", () => {
    const sessionId = crypto.randomUUID();
    manager.createSession(sessionId, "game-1");

    const player1 = manager.joinSession(sessionId, "player-1", 1);
    const player2 = manager.joinSession(sessionId, "player-2", 2);

    expect(player1).toBeDefined();
    expect(player2).toBeDefined();
    expect(player1?.status).toBe("active");
    expect(player2?.status).toBe("active");
  });

  it("should track player sessions", () => {
    const sessionId = crypto.randomUUID();
    manager.createSession(sessionId, "game-1");
    manager.joinSession(sessionId, "player-1", 1);

    const playerSession = manager.getPlayerSession("player-1");
    expect(playerSession?.id).toBe(sessionId);
  });

  it("should allow players to leave session", () => {
    const sessionId = crypto.randomUUID();
    manager.createSession(sessionId, "game-1");
    manager.joinSession(sessionId, "player-1", 1);

    const left = manager.leaveSession("player-1");
    expect(left).toBe(true);

    const playerSession = manager.getPlayerSession("player-1");
    expect(playerSession).toBeNull();
  });

  it("should detect frequency harmony between players", () => {
    const sessionId = crypto.randomUUID();
    const session = manager.createSession(sessionId, "game-1");

    manager.joinSession(sessionId, "player-1", 1);
    manager.joinSession(sessionId, "player-2", 2);

    // Set similar frequencies
    manager.updatePlayerState(sessionId, "player-1", { frequency: 432 });
    manager.updatePlayerState(sessionId, "player-2", { frequency: 434 });

    const harmonized = manager.detectHarmony(sessionId, 5);
    expect(harmonized.length).toBeGreaterThan(0);
  });

  it("should calculate team score", () => {
    const sessionId = crypto.randomUUID();
    manager.createSession(sessionId, "game-1");

    manager.joinSession(sessionId, "player-1", 1);
    manager.joinSession(sessionId, "player-2", 2);

    manager.updatePlayerState(sessionId, "player-1", { score: 100 });
    manager.updatePlayerState(sessionId, "player-2", { score: 50 });

    const teamScore = manager.calculateTeamScore(sessionId);
    expect(teamScore).toBe(150);
  });

  it("should generate leaderboard", () => {
    const sessionId = crypto.randomUUID();
    manager.createSession(sessionId, "game-1");

    manager.joinSession(sessionId, "player-1", 1);
    manager.joinSession(sessionId, "player-2", 2);
    manager.joinSession(sessionId, "player-3", 3);

    manager.updatePlayerState(sessionId, "player-1", { score: 100 });
    manager.updatePlayerState(sessionId, "player-2", { score: 150 });
    manager.updatePlayerState(sessionId, "player-3", { score: 75 });

    const leaderboard = manager.getLeaderboard(sessionId);
    expect(leaderboard[0].score).toBe(150); // Highest score first
    expect(leaderboard.length).toBe(3);
  });
});

describe("Achievements & Leaderboard Tests", () => {
  let leaderboard: LeaderboardManager;

  beforeEach(() => {
    leaderboard = new LeaderboardManager();
  });

  it("should initialize player stats", () => {
    const stats = leaderboard.initializePlayer(1, "Player 1");
    expect(stats.userId).toBe(1);
    expect(stats.totalScore).toBe(0);
    expect(stats.gamesPlayed).toBe(0);
  });

  it("should record game results", () => {
    leaderboard.initializePlayer(1, "Player 1");
    leaderboard.recordGameResult(1, "puzzle", true, 100, 10);

    const stats = leaderboard.getPlayerStats(1);
    expect(stats?.gamesWon).toBe(1);
    expect(stats?.totalScore).toBe(100);
    expect(stats?.frequencyHarmonyWins).toBe(1);
  });

  it("should track winning streaks", () => {
    leaderboard.initializePlayer(1, "Player 1");

    leaderboard.recordGameResult(1, "puzzle", true, 100, 10);
    leaderboard.recordGameResult(1, "puzzle", true, 100, 10);
    leaderboard.recordGameResult(1, "puzzle", true, 100, 10);

    const stats = leaderboard.getPlayerStats(1);
    expect(stats?.currentStreak).toBe(3);
    expect(stats?.longestStreak).toBe(3);
  });

  it("should reset streak on loss", () => {
    leaderboard.initializePlayer(1, "Player 1");

    leaderboard.recordGameResult(1, "puzzle", true, 100, 10);
    leaderboard.recordGameResult(1, "puzzle", true, 100, 10);
    leaderboard.recordGameResult(1, "puzzle", false, 0, 10);

    const stats = leaderboard.getPlayerStats(1);
    expect(stats?.currentStreak).toBe(0);
    expect(stats?.longestStreak).toBe(2);
  });

  it("should award achievements", () => {
    leaderboard.initializePlayer(1, "Player 1");
    leaderboard.recordGameResult(1, "puzzle", true, 100, 10);

    const achievements = leaderboard.getPlayerAchievements(1);
    expect(achievements.length).toBeGreaterThan(0);
    expect(achievements.some(a => a.id === "first-harmony")).toBe(true);
  });

  it("should generate global leaderboard", () => {
    leaderboard.initializePlayer(1, "Player 1");
    leaderboard.initializePlayer(2, "Player 2");

    leaderboard.recordGameResult(1, "puzzle", true, 100, 10);
    leaderboard.recordGameResult(2, "puzzle", true, 150, 10);

    const globalLeaderboard = leaderboard.getGlobalLeaderboard();
    expect(globalLeaderboard[0].userId).toBe(2); // Highest score first
    expect(globalLeaderboard[0].score).toBe(150);
  });

  it("should get player rank", () => {
    leaderboard.initializePlayer(1, "Player 1");
    leaderboard.initializePlayer(2, "Player 2");

    leaderboard.recordGameResult(1, "puzzle", true, 100, 10);
    leaderboard.recordGameResult(2, "puzzle", true, 150, 10);

    const rank1 = leaderboard.getPlayerRank(1);
    const rank2 = leaderboard.getPlayerRank(2);

    expect(rank2).toBe(1);
    expect(rank1).toBe(2);
  });
});

describe("Sovereign Field Integration Tests", () => {
  it("should map game frequency to solfeggio", () => {
    const solfeggioFreq = mapGameFrequencyToSolfeggio(432);
    expect(solfeggioFreq).toBeGreaterThanOrEqual(396);
    expect(solfeggioFreq).toBeLessThanOrEqual(528);
  });

  it("should calculate sovereignty score", () => {
    // Mock leaderboard manager
    const sovereignty = calculateSovereignty(1);
    expect(sovereignty).toBeGreaterThanOrEqual(0);
    expect(sovereignty).toBeLessThanOrEqual(1);
  });

  it("should generate game codon", () => {
    const codon = generateGameCodon(432, 0.5, 5);
    expect(codon).toBeDefined();
    expect(codon.split("·").length).toBe(3);
  });

  it("should create game player flower", () => {
    const flower = createGamePlayerFlower(1, 432);

    expect(flower.userId).toBe(1);
    expect(flower.gameFrequency).toBe(432);
    expect(flower.aura.baseFrequency).toBeGreaterThanOrEqual(396);
    expect(flower.aura.harmonics.length).toBe(4);
  });

  it("should detect player resonance", () => {
    const flower1 = createGamePlayerFlower(1, 432);
    const flower2 = createGamePlayerFlower(2, 434);

    const resonance = detectPlayerResonance(flower1, flower2, 5);
    expect(resonance).toBe(true);
  });

  it("should calculate interference pattern", () => {
    const flower1 = createGamePlayerFlower(1, 432);
    const flower2 = createGamePlayerFlower(2, 432);

    const interference = calculateInterferencePattern(flower1, flower2);

    expect(interference.resonance).toBe(true);
    expect(interference.interference).toBeLessThanOrEqual(5);
    expect(interference.harmonicAlignment).toBeGreaterThanOrEqual(0);
  });

  it("should create team flower", () => {
    const flower1 = createGamePlayerFlower(1, 432);
    const flower2 = createGamePlayerFlower(2, 440);

    const teamFlower = createTeamFlower("team-1", [flower1, flower2]);

    expect(teamFlower.userId).toBe(0); // Team ID
    expect(teamFlower.aura.baseFrequency).toBeGreaterThanOrEqual(396);
    expect(teamFlower.aura.baseFrequency).toBeLessThanOrEqual(528);
  });
});

describe("Game Mechanics Integration", () => {
  it("should handle complete game flow with achievements", () => {
    const leaderboard = new LeaderboardManager();
    leaderboard.initializePlayer(1, "Player 1");

    // Win 10 games
    for (let i = 0; i < 10; i++) {
      leaderboard.recordGameResult(1, "puzzle", true, 100, 10);
    }

    const achievements = leaderboard.getPlayerAchievements(1);
    expect(achievements.some(a => a.id === "harmony-master")).toBe(true);
  });

  it("should integrate multiplayer with achievements", () => {
    const manager = new MultiplayerSessionManager();
    const leaderboard = new LeaderboardManager();

    const sessionId = crypto.randomUUID();
    manager.createSession(sessionId, "game-1");
    manager.joinSession(sessionId, "player-1", 1);
    manager.joinSession(sessionId, "player-2", 2);

    manager.updatePlayerState(sessionId, "player-1", { score: 100 });
    manager.updatePlayerState(sessionId, "player-2", { score: 50 });

    leaderboard.initializePlayer(1, "Player 1");
    leaderboard.recordGameResult(1, "puzzle", true, 100, 10);

    const playerRank = leaderboard.getPlayerRank(1);
    expect(playerRank).toBeDefined();
  });
});
