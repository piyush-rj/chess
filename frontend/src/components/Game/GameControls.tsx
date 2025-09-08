"use client";
import useChessSocket from "../../hooks/useChessSocket";
import ChessBoard from "./ChessBoard";
import GameJoinButton from "../Base/GameJoinButton";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";
import { useChessGameStore } from "@/src/store/useChessGameStore";

export default function GameControls() {
    const { createGame, joinGame, makeMove, leaveGame } = useChessSocket();
    const { gameId, playerColor } = useChessGameStore();

    const copyToClipboard = () => {
        if (gameId) navigator.clipboard.writeText(gameId);
    };

    return (
        <div className="flex flex-col gap-4 items-center">
            {!gameId ? (
                <div className="flex gap-3">
                    <Button
                        onClick={createGame}
                        className="px-4 py-2.5 text-[20px] font-light rounded-md bg-[#7675BE] hover:bg-[#7675BE] hover:-translate-y-0.5 tracking-wide text-black"
                    >
                        Create Game
                    </Button>
                    <GameJoinButton onJoin={joinGame} />
                </div>
            ) : (
                <Button
                    onClick={leaveGame}
                    className="px-4 py-2.5 text-md font-light rounded-md bg-red-500 hover:bg-red-600 text-white"
                >
                    Leave Game
                </Button>
            )}

            {gameId && (
                <div className="fixed bottom-4 right-4 border-2 px-4 py-3 rounded-md border-neutral-700 bg-black/10 backdrop-blur-lg shadow-lg">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-zinc-400">
                            Game ID:{" "}
                            <span className="font-mono">{gameId.slice(0, 10)}</span>
                        </p>
                        <button
                            onClick={copyToClipboard}
                            className="p-1 rounded-md hover:bg-zinc-700/40"
                        >
                            <Copy size={16} className="text-zinc-300" />
                        </button>
                    </div>
                    <p className="text-sm text-zinc-400 font-bold mt-2">
                        You are {playerColor}
                    </p>
                </div>
            )}

            <ChessBoard makeMove={makeMove} />
        </div>
    );
}
