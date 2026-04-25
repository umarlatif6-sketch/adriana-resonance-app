/**
 * ═══════════════════════════════════════════════════════════════
 * VOID GAME ENGINE: LEADERBOARDS & ACHIEVEMENTS
 * ═══════════════════════════════════════════════════════════════
 *
 * Achievement tracking and leaderboard management
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  condition: (playerStats: PlayerStats) => boolean;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export interface PlayerStats {
  userId: number;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  frequencyHarmonyWins: number;
  sovereignQuestLevel: number;
  frequencyExplorerLocations: number;
  frequencyChessRating: number;
  totalEntitiesCollected: number;
  longestStreak: number;
  currentStreak: number;
  totalPlayTime: number; // in minutes
  lastPlayedAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  score: number;
  gamesWon: number;
  achievements: Achievement[];
}

/**
 * Achievement definitions
 */
export const ACHIEVEMENTS: Achievement[] = [
  // Frequency Harmony achievements
  {
    id: "first-harmony",
    name: "First Harmony",
    description: "Achieve your first frequency harmony (432 Hz)",
    icon: "🎵",
    points: 10,
    condition: (stats) => stats.frequencyHarmonyWins >= 1,
    rarity: "common"
  },
  {
    id: "harmony-master",
    name: "Harmony Master",
    description: "Win 10 Frequency Harmony games",
    icon: "🎼",
    points: 50,
    condition: (stats) => stats.frequencyHarmonyWins >= 10,
    rarity: "rare"
  },
  {
    id: "perfect-harmony",
    name: "Perfect Harmony",
    description: "Achieve perfect 432 Hz harmony on first try",
    icon: "✨",
    points: 100,
    condition: (stats) => stats.frequencyHarmonyWins >= 1, // Would need additional tracking
    rarity: "epic"
  },

  // RPG achievements
  {
    id: "quest-beginner",
    name: "Quest Beginner",
    description: "Complete your first Sovereign Quest",
    icon: "⚔️",
    points: 25,
    condition: (stats) => stats.sovereignQuestLevel >= 1,
    rarity: "common"
  },
  {
    id: "demon-slayer",
    name: "Demon Slayer",
    description: "Defeat 50 frequency demons",
    icon: "👹",
    points: 75,
    condition: (stats) => stats.sovereignQuestLevel >= 10,
    rarity: "rare"
  },
  {
    id: "legendary-hero",
    name: "Legendary Hero",
    description: "Reach level 50 in Sovereign Quest",
    icon: "👑",
    points: 200,
    condition: (stats) => stats.sovereignQuestLevel >= 50,
    rarity: "legendary"
  },

  // Adventure achievements
  {
    id: "explorer",
    name: "Explorer",
    description: "Discover 5 locations in Frequency Explorer",
    icon: "🗺️",
    points: 30,
    condition: (stats) => stats.frequencyExplorerLocations >= 5,
    rarity: "common"
  },
  {
    id: "cartographer",
    name: "Cartographer",
    description: "Discover all 20 locations in Frequency Explorer",
    icon: "🧭",
    points: 150,
    condition: (stats) => stats.frequencyExplorerLocations >= 20,
    rarity: "epic"
  },

  // Strategy achievements
  {
    id: "chess-novice",
    name: "Chess Novice",
    description: "Reach 1000 rating in Frequency Chess",
    icon: "♟️",
    points: 40,
    condition: (stats) => stats.frequencyChessRating >= 1000,
    rarity: "common"
  },
  {
    id: "chess-grandmaster",
    name: "Chess Grandmaster",
    description: "Reach 2500 rating in Frequency Chess",
    icon: "♛",
    points: 200,
    condition: (stats) => stats.frequencyChessRating >= 2500,
    rarity: "legendary"
  },

  // General achievements
  {
    id: "collector",
    name: "Collector",
    description: "Collect 100 entities",
    icon: "💎",
    points: 50,
    condition: (stats) => stats.totalEntitiesCollected >= 100,
    rarity: "uncommon"
  },
  {
    id: "streak-master",
    name: "Streak Master",
    description: "Win 10 games in a row",
    icon: "🔥",
    points: 100,
    condition: (stats) => stats.longestStreak >= 10,
    rarity: "rare"
  },
  {
    id: "dedicated-player",
    name: "Dedicated Player",
    description: "Play for 100 total hours",
    icon: "⏱️",
    points: 150,
    condition: (stats) => stats.totalPlayTime >= 6000, // 100 hours in minutes
    rarity: "rare"
  },
  {
    id: "champion",
    name: "Champion",
    description: "Win 100 games",
    icon: "🏆",
    points: 200,
    condition: (stats) => stats.gamesWon >= 100,
    rarity: "epic"
  },
  {
    id: "legendary-gamer",
    name: "Legendary Gamer",
    description: "Earn 1000 achievement points",
    icon: "⭐",
    points: 500,
    condition: (stats) => stats.totalScore >= 1000,
    rarity: "legendary"
  }
];

/**
 * Leaderboard manager
 */
export class LeaderboardManager {
  private playerStats = new Map<number, PlayerStats>();
  private globalLeaderboard: LeaderboardEntry[] = [];

  /**
   * Initialize player stats
   */
  initializePlayer(userId: number, username: string): PlayerStats {
    if (!this.playerStats.has(userId)) {
      this.playerStats.set(userId, {
        userId,
        totalScore: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        frequencyHarmonyWins: 0,
        sovereignQuestLevel: 0,
        frequencyExplorerLocations: 0,
        frequencyChessRating: 1200,
        totalEntitiesCollected: 0,
        longestStreak: 0,
        currentStreak: 0,
        totalPlayTime: 0,
        lastPlayedAt: new Date()
      });
    }
    return this.playerStats.get(userId)!;
  }

  /**
   * Record game result
   */
  recordGameResult(
    userId: number,
    gameType: string,
    won: boolean,
    score: number,
    playTime: number
  ): void {
    const stats = this.playerStats.get(userId);
    if (!stats) return;

    stats.gamesPlayed++;
    stats.totalScore += score;
    stats.totalPlayTime += playTime;
    stats.lastPlayedAt = new Date();

    if (won) {
      stats.gamesWon++;
      stats.currentStreak++;
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }

      // Game-specific tracking
      switch (gameType) {
        case "puzzle":
          stats.frequencyHarmonyWins++;
          break;
        case "rpg":
          stats.sovereignQuestLevel++;
          break;
        case "adventure":
          stats.frequencyExplorerLocations++;
          break;
        case "strategy":
          stats.frequencyChessRating += 50;
          break;
      }
    } else {
      stats.currentStreak = 0;
    }

    this.updateLeaderboard();
  }

  /**
   * Add entities collected
   */
  addEntitiesCollected(userId: number, count: number): void {
    const stats = this.playerStats.get(userId);
    if (stats) {
      stats.totalEntitiesCollected += count;
    }
  }

  /**
   * Get player achievements
   */
  getPlayerAchievements(userId: number): Achievement[] {
    const stats = this.playerStats.get(userId);
    if (!stats) return [];

    return ACHIEVEMENTS.filter(achievement => achievement.condition(stats));
  }

  /**
   * Get player stats
   */
  getPlayerStats(userId: number): PlayerStats | null {
    return this.playerStats.get(userId) || null;
  }

  /**
   * Update global leaderboard
   */
  private updateLeaderboard(): void {
    const entries: LeaderboardEntry[] = [];

    this.playerStats.forEach((stats, userId) => {
      const achievements = this.getPlayerAchievements(userId);
      entries.push({
        rank: 0,
        userId,
        username: `Player ${userId}`,
        score: stats.totalScore,
        gamesWon: stats.gamesWon,
        achievements
      });
    });

    // Sort by score descending
    entries.sort((a, b) => b.score - a.score);

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    this.globalLeaderboard = entries;
  }

  /**
   * Get global leaderboard
   */
  getGlobalLeaderboard(limit: number = 100): LeaderboardEntry[] {
    return this.globalLeaderboard.slice(0, limit);
  }

  /**
   * Get player rank
   */
  getPlayerRank(userId: number): number | null {
    const entry = this.globalLeaderboard.find(e => e.userId === userId);
    return entry ? entry.rank : null;
  }

  /**
   * Get top players by game type
   */
  getTopPlayersByGameType(gameType: string, limit: number = 10): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];

    this.playerStats.forEach((stats, userId) => {
      let gameScore = 0;
      switch (gameType) {
        case "puzzle":
          gameScore = stats.frequencyHarmonyWins * 100;
          break;
        case "rpg":
          gameScore = stats.sovereignQuestLevel * 50;
          break;
        case "adventure":
          gameScore = stats.frequencyExplorerLocations * 25;
          break;
        case "strategy":
          gameScore = stats.frequencyChessRating;
          break;
      }

      if (gameScore > 0) {
        entries.push({
          rank: 0,
          userId,
          username: `Player ${userId}`,
          score: gameScore,
          gamesWon: stats.gamesWon,
          achievements: this.getPlayerAchievements(userId)
        });
      }
    });

    entries.sort((a, b) => b.score - a.score);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries.slice(0, limit);
  }

  /**
   * Get achievement progress for player
   */
  getAchievementProgress(userId: number): {
    earned: Achievement[];
    available: Achievement[];
    progress: number;
  } {
    const stats = this.playerStats.get(userId);
    if (!stats) {
      return {
        earned: [],
        available: ACHIEVEMENTS,
        progress: 0
      };
    }

    const earned = ACHIEVEMENTS.filter(a => a.condition(stats));
    const available = ACHIEVEMENTS.filter(a => !a.condition(stats));

    return {
      earned,
      available,
      progress: (earned.length / ACHIEVEMENTS.length) * 100
    };
  }
}

// Global leaderboard manager instance
export const leaderboardManager = new LeaderboardManager();
