/**
 * ═══════════════════════════════════════════════════════════════
 * VOID GAME ENGINE: MAIN PAGE
 * ═══════════════════════════════════════════════════════════════
 *
 * Landing page for the Void Game Engine
 * Users can create games from prompts or play existing games
 */

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function VoidGameEngine() {
  const { isAuthenticated, user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // tRPC queries
  const listGamesQuery = trpc.game.listGames.useQuery();
  const createGameMutation = trpc.game.createFromPrompt.useMutation();

  const handleCreateGame = async () => {
    if (!prompt.trim()) return;

    setIsCreating(true);
    try {
      const result = await createGameMutation.mutateAsync({ prompt });
      if (result.success) {
        setPrompt("");
        // Refresh games list
        listGamesQuery.refetch();
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-slate-700 max-w-md w-full p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Void Game Engine</h1>
          <p className="text-slate-300 mb-6">
            Generate playable games from natural language prompts
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="w-full"
          >
            Sign In to Create Games
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            Void Game Engine
          </h1>
          <p className="text-slate-300">
            Generate playable games from natural language prompts using Project Void infrastructure
          </p>
        </div>

        {/* Create Game Section */}
        <Card className="bg-slate-800 border-slate-700 mb-12 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Create a New Game</h2>
          <p className="text-slate-400 mb-4">
            Describe your game idea in natural language. The engine will generate a playable game.
          </p>

          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create a puzzle game where players adjust their frequency to match 432 Hz and collect harmonics to increase their score..."
              className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />

            <Button
              onClick={handleCreateGame}
              disabled={!prompt.trim() || isCreating}
              className="w-full"
              size="lg"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Game...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Game
                </>
              )}
            </Button>

            {createGameMutation.isError && (
              <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-200">
                Error: {createGameMutation.error?.message}
              </div>
            )}
          </div>
        </Card>

        {/* Available Games */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Available Games</h2>

          {listGamesQuery.isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : listGamesQuery.data && listGamesQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listGamesQuery.data.map((game: any) => (
                <Card
                  key={game.id}
                  className="bg-slate-800 border-slate-700 hover:border-cyan-400 transition-colors cursor-pointer p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{game.description}</p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span className="text-cyan-400 capitalize">{game.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Players:</span>
                      <span className="text-cyan-400">
                        {game.playerCount}-{game.maxPlayers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-cyan-400 capitalize">{game.status}</span>
                    </div>
                  </div>

                  <Button className="w-full" size="sm">
                    Play Game
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <p className="text-slate-400">
                No games available yet. Create one to get started!
              </p>
            </Card>
          )}
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-2">🎮 Prompt-Based</h3>
            <p className="text-slate-400 text-sm">
              Describe any game idea and the engine generates a playable game
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-2">🔊 Frequency Mechanics</h3>
            <p className="text-slate-400 text-sm">
              Games use 432 Hz resonance and Sovereign Field mechanics
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-2">👥 Multiplayer</h3>
            <p className="text-slate-400 text-sm">
              Play solo or with friends in real-time synchronized sessions
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
