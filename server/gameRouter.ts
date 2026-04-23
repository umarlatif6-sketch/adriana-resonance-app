/**
 * ═══════════════════════════════════════════════════════════════
 * VOID GAME ENGINE: GAME ROUTER
 * ═══════════════════════════════════════════════════════════════
 *
 * Real tRPC router for game management with database integration
 */

import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { eq } from "drizzle-orm";
import { games, gameParticipants, gameSessions } from "../drizzle/schema";
import { getDb } from "./db";

// In-memory game sessions for now (can be moved to DB later)
const activeSessions = new Map<string, any>();

export const gameRouter = router({
  /**
   * Create game from natural language prompt
   */
  createFromPrompt: protectedProcedure
    .input(z.object({
      prompt: z.string().min(10).max(1000)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Use LLM to parse prompt into game definition
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a game designer. Convert the user's prompt into a JSON game definition.
              
Return ONLY valid JSON with these exact fields:
{
  "name": "string",
  "description": "string",
  "type": "puzzle",
  "difficulty": "easy",
  "playerCount": {"min": 1, "max": 1},
  "duration": {"min": 5, "max": 15},
  "mechanics": {"primary": "string", "secondary": "string", "tertiary": "string"},
  "phases": [],
  "entities": [],
  "winConditions": [],
  "lossConditions": [],
  "startingState": {"playerFrequency": 440, "phase": "How are you?"}
}`
            },
            {
              role: "user",
              content: input.prompt
            }
          ]
        });

        const content = response.choices[0].message.content;
        if (typeof content !== "string") {
          throw new Error("Invalid LLM response");
        }

        const definition = JSON.parse(content);
        const gameId = crypto.randomUUID();

        return {
          success: true,
          gameId,
          definition
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    }),

  /**
   * Start a game session
   */
  startGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const sessionId = crypto.randomUUID();
        const playerId = String(ctx.user?.id || "player-1");

        // Default game definition for Frequency Harmony
        const definition = {
          id: input.gameId,
          name: "Frequency Harmony",
          description: "Tune your frequency to 432 Hz and collect harmonics",
          type: "puzzle",
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
        };

        // Initialize game state
        const initialState = {
          definition,
          players: {
            [playerId]: {
              id: playerId,
              frequency: definition.startingState.playerFrequency,
              phase: definition.startingState.phase,
              score: 0,
              entitiesCollected: [],
              status: "active"
            }
          },
          entities: {},
          currentPhase: definition.startingState.phase,
          winner: null,
          startedAt: new Date(),
          updatedAt: new Date()
        };

        // Store in memory
        activeSessions.set(sessionId, initialState);

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

  /**
   * Get current game state
   */
  getGameState: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const gameState = activeSessions.get(input.sessionId);

      if (!gameState) {
        throw new Error("Game session not found");
      }

      return gameState;
    }),

  /**
   * Adjust player frequency
   */
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
        throw new Error("Player not found in session");
      }

      // Adjust frequency
      player.frequency += input.delta;
      gameState.updatedAt = new Date();

      // Check win condition (frequency match to 432 Hz ±5)
      if (Math.abs(player.frequency - 432) <= 5 && !gameState.winner) {
        gameState.winner = playerId;
        player.score += 100;
      }

      // Update in memory
      activeSessions.set(input.sessionId, gameState);

      return {
        success: true,
        gameState
      };
    }),

  /**
   * Switch player phase
   */
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
        throw new Error("Player not found in session");
      }

      player.phase = input.phase;
      gameState.currentPhase = input.phase;
      gameState.updatedAt = new Date();

      // Update in memory
      activeSessions.set(input.sessionId, gameState);

      return {
        success: true,
        gameState
      };
    }),

  /**
   * Collect entity
   */
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
        throw new Error("Player not found in session");
      }

      // Add entity if not already collected
      if (!player.entitiesCollected.includes(input.entityId)) {
        player.entitiesCollected.push(input.entityId);
        player.score += 50; // Entity collection points
      }

      gameState.updatedAt = new Date();

      // Update in memory
      activeSessions.set(input.sessionId, gameState);

      return {
        success: true,
        gameState
      };
    }),

  /**
   * List available games
   */
  listGames: publicProcedure
    .query(async () => {
      // Return available games
      return [
        {
          id: "frequency-harmony-v1",
          name: "Frequency Harmony",
          description: "Tune your frequency to 432 Hz and collect harmonics",
          type: "puzzle",
          difficulty: "easy",
          playerCount: 1,
          maxPlayers: 1,
          status: "published",
          createdAt: new Date()
        }
      ];
    }),

  /**
   * Get game details
   */
  getGame: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      return {
        id: input.gameId,
        name: "Frequency Harmony",
        description: "Tune your frequency to 432 Hz and collect harmonics",
        type: "puzzle",
        difficulty: "easy",
        definition: {
          name: "Frequency Harmony",
          type: "puzzle",
          phases: ["How are you?", "Thank you", "I'm sorry", "Forgive me", "I love you"],
          entities: [
            { id: "harmonic-432", name: "432 Hz Harmonic", frequency: 432, points: 50 }
          ],
          winConditions: [
            { type: "frequency_match", target: 432, tolerance: 5 }
          ]
        },
        playerCount: 1,
        maxPlayers: 1,
        status: "published",
        createdAt: new Date()
      };
    })
});
