"use client";

import { useState } from "react";
import { PIECE_UNICODE } from "../lib/pieces";
import { Piece } from "../lib/boardSetup";

type Props = {
    board: Piece[][];
    makeMove: (from: { x: number; y: number }, to: { x: number; y: number }) => void;
};

export default function ChessBoard({ board, makeMove }: Props) {
    const [selected, setSelected] = useState<{ x: number; y: number } | null>(null);

    if (!board || board.length === 0) {
        return (
            <div className="w-full max-w-md aspect-square flex items-center justify-center text-zinc-400">
                Loading board...
            </div>
        );
    }

    function handleClick(x: number, y: number) {
        if (selected) {
            makeMove(selected, { x, y });
            setSelected(null);
        } else if (board[y][x]) {
            setSelected({ x, y });
        }
    }

    return (
        <div className="aspect-square w-full max-w-md border-4 border-zinc-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                {board.map((row, y) =>
                    row.map((piece, x) => {
                        const isDark = (x + y) % 2 === 1;
                        const isSelected = selected?.x === x && selected?.y === y;

                        return (
                            <div
                                key={`${x}-${y}`}
                                onClick={() => handleClick(x, y)}
                                className={`
                                    flex items-center justify-center cursor-pointer text-3xl select-none transition
                                    ${isDark ? "bg-green-700" : "bg-green-200"}
                                    ${isSelected ? "ring-4 ring-yellow-400" : ""}
                                    hover:brightness-110
                                `}
                            >
                                {piece ? PIECE_UNICODE[`${piece.color}_${piece.type}`] : ""}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
