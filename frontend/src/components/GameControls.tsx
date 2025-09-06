"use client";
import useChessSocket from "../hooks/useChessSocket";
import ChessBoard from "./ChessBoard";

export default function GameControls() {
    const { board, color, gameId, playerId, createGame, joinGame, makeMove } = useChessSocket();

    

    return (
        <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-2">
                <button
                    onClick={createGame}
                    className="px-4 py-2 rounded bg-green-600 text-white"
                >
                    Create Game
                </button>
                <button
                    onClick={() => joinGame(prompt("Enter gameId:") || "")}
                    className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                    Join Game
                </button>
            </div>

            {gameId && (
                <p className="text-sm text-zinc-400">
                    Game ID: <span className="font-mono">{gameId}</span> | You are{" "}
                    <span className="font-bold">{color}</span> | Player:{" "}
                    <span className="font-mono">{playerId}</span>
                </p>
            )}

            <ChessBoard board={board} makeMove={makeMove} />
        </div>
    );
}
