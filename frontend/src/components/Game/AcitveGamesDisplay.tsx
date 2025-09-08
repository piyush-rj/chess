"use client";

import useChessSocket from "@/src/hooks/useChessSocket";
import { useActiveGamesStore } from "@/src/store/useActiveGameStore";

export default function ActiveGamesDisplay() {
  const { activeGames } = useActiveGamesStore();
  const { joinGame } = useChessSocket();

  if (!activeGames.length) {
    return <p className="text-zinc-500 text-sm">No active games</p>;
  }

  return (
    <div className="mt-4 w-full p-2 rounded-md border border-neutral-700 bg-black/20">
      <ul className="space-y-1">
        {activeGames.map((game) => (
          <li
            key={game.id}
            onClick={() => joinGame(game.id)}
            className="flex flex-col justify-between items-center py-3 text-sm text-zinc-400 cursor-pointer hover:bg-zinc-800/40 rounded-md p-2 transition"
          >
            <span>
              Game {game.id} | {game.status}
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
