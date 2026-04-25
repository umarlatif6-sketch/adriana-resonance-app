/**
 * ═══════════════════════════════════════════════════════════════
 * VOID GAME ENGINE: MULTIPLAYER SYNCHRONIZATION
 * ═══════════════════════════════════════════════════════════════
 *
 * Real-time multiplayer session management and state sync
 */

import { EventEmitter } from "events";

interface GamePlayer {
  id: string;
  userId: number;
  frequency: number;
  phase: string;
  score: number;
  entitiesCollected: string[];
  status: "active" | "inactive" | "disconnected";
  lastUpdate: Date;
}

interface MultiplayerSession {
  id: string;
  gameId: string;
  players: Map<string, GamePlayer>;
  state: any;
  status: "waiting" | "active" | "completed";
  createdAt: Date;
  updatedAt: Date;
  emitter: EventEmitter;
}

/**
 * Multiplayer session manager
 */
export class MultiplayerSessionManager {
  private sessions = new Map<string, MultiplayerSession>();
  private playerSessions = new Map<string, string>(); // playerId -> sessionId

  /**
   * Create a new multiplayer session
   */
  createSession(sessionId: string, gameId: string): MultiplayerSession {
    const session: MultiplayerSession = {
      id: sessionId,
      gameId,
      players: new Map(),
      state: {
        definition: {},
        currentPhase: "Waiting",
        winner: null,
        startedAt: new Date(),
        updatedAt: new Date()
      },
      status: "waiting",
      createdAt: new Date(),
      updatedAt: new Date(),
      emitter: new EventEmitter()
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Join a multiplayer session
   */
  joinSession(sessionId: string, playerId: string, userId: number): GamePlayer | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const player: GamePlayer = {
      id: playerId,
      userId,
      frequency: 440,
      phase: "Waiting",
      score: 0,
      entitiesCollected: [],
      status: "active",
      lastUpdate: new Date()
    };

    session.players.set(playerId, player);
    this.playerSessions.set(playerId, sessionId);

    // Broadcast player joined event
    session.emitter.emit("player-joined", {
      playerId,
      playerCount: session.players.size,
      timestamp: new Date()
    });

    return player;
  }

  /**
   * Leave a multiplayer session
   */
  leaveSession(playerId: string): boolean {
    const sessionId = this.playerSessions.get(playerId);
    if (!sessionId) return false;

    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.players.delete(playerId);
    this.playerSessions.delete(playerId);

    // Broadcast player left event
    session.emitter.emit("player-left", {
      playerId,
      playerCount: session.players.size,
      timestamp: new Date()
    });

    // Clean up empty sessions
    if (session.players.size === 0) {
      this.sessions.delete(sessionId);
    }

    return true;
  }

  /**
   * Update player state in session
   */
  updatePlayerState(sessionId: string, playerId: string, updates: Partial<GamePlayer>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const player = session.players.get(playerId);
    if (!player) return false;

    Object.assign(player, updates, { lastUpdate: new Date() });
    session.updatedAt = new Date();

    // Broadcast state update
    session.emitter.emit("player-updated", {
      playerId,
      updates,
      timestamp: new Date()
    });

    return true;
  }

  /**
   * Broadcast state to all players in session
   */
  broadcastState(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const state = {
      sessionId,
      gameId: session.gameId,
      players: Array.from(session.players.values()),
      gameState: session.state,
      status: session.status,
      timestamp: new Date()
    };

    session.emitter.emit("state-update", state);
    return state;
  }

  /**
   * Start multiplayer game
   */
  startGame(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.players.size < 1) return false;

    session.status = "active";
    session.state.startedAt = new Date();

    session.emitter.emit("game-started", {
      sessionId,
      playerCount: session.players.size,
      timestamp: new Date()
    });

    return true;
  }

  /**
   * End multiplayer game
   */
  endGame(sessionId: string, winnerId?: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = "completed";
    session.state.winner = winnerId || null;
    session.state.endedAt = new Date();

    session.emitter.emit("game-ended", {
      sessionId,
      winnerId,
      timestamp: new Date()
    });

    return true;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): MultiplayerSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get player's current session
   */
  getPlayerSession(playerId: string): MultiplayerSession | null {
    const sessionId = this.playerSessions.get(playerId);
    if (!sessionId) return null;
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all players in session
   */
  getSessionPlayers(sessionId: string): GamePlayer[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return Array.from(session.players.values());
  }

  /**
   * Synchronize player frequencies across session
   */
  syncFrequencies(sessionId: string): Map<string, number> {
    const session = this.sessions.get(sessionId);
    if (!session) return new Map();

    const frequencies = new Map<string, number>();
    session.players.forEach((player, playerId) => {
      frequencies.set(playerId, player.frequency);
    });

    return frequencies;
  }

  /**
   * Detect frequency harmony between players
   */
  detectHarmony(sessionId: string, tolerance: number = 5): string[] {
    const session = this.sessions.get(sessionId);
    if (!session || session.players.size < 2) return [];

    const players = Array.from(session.players.values());
    const harmonized: string[] = [];

    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const freqDiff = Math.abs(players[i].frequency - players[j].frequency);
        if (freqDiff <= tolerance) {
          harmonized.push(`${players[i].id}-${players[j].id}`);
        }
      }
    }

    return harmonized;
  }

  /**
   * Calculate team score
   */
  calculateTeamScore(sessionId: string): number {
    const session = this.sessions.get(sessionId);
    if (!session) return 0;

    let totalScore = 0;
    session.players.forEach(player => {
      totalScore += player.score;
    });

    return totalScore;
  }

  /**
   * Get leaderboard for session
   */
  getLeaderboard(sessionId: string): GamePlayer[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return Array.from(session.players.values()).sort((a, b) => b.score - a.score);
  }

  /**
   * Subscribe to session events
   */
  on(sessionId: string, event: string, callback: (...args: any[]) => void): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.emitter.on(event, callback);
    }
  }

  /**
   * Unsubscribe from session events
   */
  off(sessionId: string, event: string, callback: (...args: any[]) => void): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.emitter.off(event, callback);
    }
  }
}

// Global multiplayer manager instance
export const multiplayerManager = new MultiplayerSessionManager();
