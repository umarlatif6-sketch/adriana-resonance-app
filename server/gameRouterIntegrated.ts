/**
 * ═══════════════════════════════════════════════════════════════
 * VOID GAME ENGINE: INTEGRATED ROUTER
 * ═══════════════════════════════════════════════════════════════
 *
 * Full integration of game types, multiplayer, leaderboards, and Sovereign Field
 */

import { GAME_TYPES, getGameDefinition, getAllGameTypes, GAME_TYPE_METADATA } from "./gameTypes";
import { MultiplayerSessionManager } from "./gameMultiplayer";
import { leaderboardManager } from "./gameAchievements";
import { GameSovereignResonance } from "./gameSovereignIntegration";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

// ─── GAME SESSION MANAGERS ────────────────────────────────────
const multiplayerManager = new MultiplayerSessionManager();
const activeSessions = new Map<string, any>();

export const gameRouterIntegrated = router({
  // Create game from prompt
  createFromPrompt: protectedProcedure
    .input(z.object({
      prompt: z.string().min(10).max(1000),
      gameType: z.enum(["puzzle", "rpg", "adventure", "strategy"]).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const gameType = input.gameType || "puzzle";
        const gameDef = getGameDefinition(gameType);
        const gameId = `${gameType}-${crypto.randomUUID()}`;
        
        return {
          success: true,
          gameId,
          definition: gameDef
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    }),

  // Start game session with full integration
  startGame: protectedProcedure
    .input(z.object({ 
      gameId: z.string(),
      gameType: z.enum(["puzzle", "rpg", "adventure", "strategy"]).optional(),
      multiplayer: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const gameType = input.gameType || "puzzle";
        const gameDef = getGameDefinition(gameType);
        const sessionId = crypto.randomUUID();
        const playerId = String(ctx.user?.id || "player-1");

        // Create Sovereign Field flower for player
        const playerFlower = GameSovereignResonance.createGamePlayerFlower(ctx.user?.id || 0, 440);

        const initialState = {
          definition: gameDef,
          gameType,
          sessionId,
          players: {
            [playerId]: {
              id: playerId,
              userId: ctx.user?.id || 0,
              frequency: gameDef.startingState?.playerFrequency || 440,
              phase: gameDef.startingState?.phase || gameDef.phases[0],
              score: 0,
              entitiesCollected: [],
              status: "active",
              flower: playerFlower
            }
          },
          entities: {},
          currentPhase: gameDef.phases[0],
          winner: null,
          startedAt: new Date(),
          updatedAt: new Date(),
          multiplayer: input.multiplayer || false
        };

        activeSessions.set(sessionId, initialState);

        // If multiplayer, create multiplayer session
        if (input.multiplayer) {
          multiplayerManager.createSession(sessionId, input.gameId);
          multiplayerManager.joinSession(sessionId, playerId, ctx.user?.id || 0);
          multiplayerManager.startGame(sessionId);
        }

        return {
          success: true,
          sessionId,
          gameState: initialState
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    }),

  // Get game state
  getGameState: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const gameState = activeSessions.get(input.sessionId);
      if (!gameState) {
        throw new Error("Game session not found");
      }
      return gameState;
    }),

  // Adjust frequency
  adjustFrequency: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      delta: z.number().min(-50).max(50)
    }))
    .mutation(async ({ ctx, input }) => {
      const gameState = activeSessions.get(input.sessionId);
      if (!gameState) {
        throw new Error("Game session not found");
      }

      const playerId = String(ctx.user?.id || "player-1");
      const player = gameState.players[playerId];
      if (!player) {
        throw new Error("Player not found");
      }

      player.frequency += input.delta;
      gameState.updatedAt = new Date();

      // Check win condition for puzzle games
      if (gameState.gameType === "puzzle" && Math.abs(player.frequency - 432) <= 5 && !gameState.winner) {
        gameState.winner = playerId;
        player.score += 100;
      }

      activeSessions.set(input.sessionId, gameState);

      return {
        success: true,
        gameState
      };
    }),

  // Switch phase
  switchPhase: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      phase: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const gameState = activeSessions.get(input.sessionId);
      if (!gameState) {
        throw new Error("Game session not found");
      }

      const playerId = String(ctx.user?.id || "player-1");
      const player = gameState.players[playerId];
      if (!player) {
        throw new Error("Player not found");
      }

      player.phase = input.phase;
      gameState.currentPhase = input.phase;
      gameState.updatedAt = new Date();

      activeSessions.set(input.sessionId, gameState);

      return {
        success: true,
        gameState
      };
    }),

  // Collect entity
  collectEntity: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      entityId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const gameState = activeSessions.get(input.sessionId);
      if (!gameState) {
        throw new Error("Game session not found");
      }

      const playerId = String(ctx.user?.id || "player-1");
      const player = gameState.players[playerId];
      if (!player) {
        throw new Error("Player not found");
      }

      if (!player.entitiesCollected.includes(input.entityId)) {
        player.entitiesCollected.push(input.entityId);
        player.score += 50;
        leaderboardManager.addEntitiesCollected(ctx.user?.id || 0, 1);
      }

      gameState.updatedAt = new Date();
      activeSessions.set(input.sessionId, gameState);

      return {
        success: true,
        gameState
      };
    }),

  // List available games with all types
  listGames: publicProcedure
    .query(async () => {
      return getAllGameTypes().map(game => ({
        id: game.id,
        name: game.name,
        description: game.description,
        type: game.type,
        difficulty: game.difficulty,
        playerCount: game.playerCount.min,
        maxPlayers: game.playerCount.max,
        duration: game.duration,
        status: "published",
        metadata: GAME_TYPE_METADATA[game.type as keyof typeof GAME_TYPE_METADATA],
        createdAt: new Date()
      }));
    }),

  // Get game details
  getGame: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      const gameType = input.gameId.split("-")[0] || "puzzle";
      const gameDef = getGameDefinition(gameType);
      return {
        id: gameDef.id,
        name: gameDef.name,
        description: gameDef.description,
        type: gameDef.type,
        difficulty: gameDef.difficulty,
        mechanics: gameDef.mechanics,
        playerCount: gameDef.playerCount,
        duration: gameDef.duration,
        phases: gameDef.phases,
        entities: gameDef.entities,
        winConditions: gameDef.winConditions,
        metadata: GAME_TYPE_METADATA[gameDef.type as keyof typeof GAME_TYPE_METADATA],
        maxPlayers: gameDef.playerCount.max,
        status: "published",
        createdAt: new Date()
      };
    }),

  // Join multiplayer session
  joinMultiplayer: protectedProcedure
    .input(z.object({
      sessionId: z.string(),
      gameType: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const playerId = `player-${ctx.user?.id || crypto.randomUUID()}`;
      const player = multiplayerManager.joinSession(input.sessionId, playerId, ctx.user?.id || 0);

      if (!player) {
        throw new Error("Failed to join session");
      }

      // Create Sovereign Field flower for player
      const flower = GameSovereignResonance.createGamePlayerFlower(ctx.user?.id || 0, 440);

      return {
        success: true,
        playerId,
        player,
        flower
      };
    }),

  // Leave multiplayer session
  leaveMultiplayer: protectedProcedure
    .input(z.object({ playerId: z.string() }))
    .mutation(async ({ input }) => {
      const left = multiplayerManager.leaveSession(input.playerId);
      return { success: left };
    }),

  // Get multiplayer session state
  getMultiplayerState: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = multiplayerManager.getSession(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      const players = multiplayerManager.getSessionPlayers(input.sessionId);
      const leaderboard = multiplayerManager.getLeaderboard(input.sessionId);
      const harmonized = multiplayerManager.detectHarmony(input.sessionId, 5);

      return {
        sessionId: input.sessionId,
        gameId: session.gameId,
        status: session.status,
        playerCount: players.length,
        players,
        leaderboard,
        harmonized,
        teamScore: multiplayerManager.calculateTeamScore(input.sessionId)
      };
    }),

  // Get player leaderboard
  getLeaderboard: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional(),
      gameType: z.string().optional()
    }))
    .query(async ({ input }) => {
      const limit = input.limit || 100;
      if (input.gameType) {
        return leaderboardManager.getTopPlayersByGameType(input.gameType, limit);
      }
      return leaderboardManager.getGlobalLeaderboard(limit);
    }),

  // Get player achievements
  getPlayerAchievements: protectedProcedure
    .query(async ({ ctx }) => {
      const achievements = leaderboardManager.getPlayerAchievements(ctx.user?.id || 0);
      const stats = leaderboardManager.getPlayerStats(ctx.user?.id || 0);
      const progress = leaderboardManager.getAchievementProgress(ctx.user?.id || 0);

      return {
        achievements,
        stats,
        progress
      };
    }),

  // Record game result
  recordGameResult: protectedProcedure
    .input(z.object({
      gameType: z.string(),
      won: z.boolean(),
      score: z.number(),
      playTime: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      leaderboardManager.recordGameResult(
        ctx.user?.id || 0,
        input.gameType,
        input.won,
        input.score,
        input.playTime
      );

      const achievements = leaderboardManager.getPlayerAchievements(ctx.user?.id || 0);
      const stats = leaderboardManager.getPlayerStats(ctx.user?.id || 0);

      return {
        success: true,
        achievements,
        stats
      };
    }),

  // Get player Sovereign Field flower
  getPlayerFlower: protectedProcedure
    .query(async ({ ctx }) => {
      const stats = leaderboardManager.getPlayerStats(ctx.user?.id || 0);
      if (!stats) {
        return null;
      }

      const flower = GameSovereignResonance.createGamePlayerFlower(
        ctx.user?.id || 0,
        440
      );

      return flower;
    }),

  // Detect resonance between players
  detectResonance: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      tolerance: z.number().optional()
    }))
    .query(async ({ input }) => {
      const session = multiplayerManager.getSession(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      const harmonized = multiplayerManager.detectHarmony(input.sessionId, input.tolerance || 5);
      return {
        sessionId: input.sessionId,
        harmonized,
        count: harmonized.length
      };
    })
});
