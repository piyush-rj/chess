"use client";

import { useActiveGamesStore } from "@/src/store/useActiveGameStore";

export default function ActiveGamesDisplay() {
  const { activeGames } = useActiveGamesStore();

  if (!activeGames.length) {
    return <p className="text-zinc-500 text-sm">No active games</p>;
  }

  return (
    <div className="mt-6 p-4 rounded-md border border-neutral-700 bg-black/20">
      <h2 className="text-lg font-semibold text-zinc-300 mb-2">Active Games</h2>
      <ul className="space-y-1">
        {activeGames.map((game) => (
          <li
            key={game.id}
            className="flex justify-between items-center text-sm text-zinc-400"
          >
            <span>
              Game {game.id.slice(0, 6)} – {game.status}
            </span>
            <span className="italic">
              Turn: {game.currentTurn}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
