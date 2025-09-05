"use client";
import { useState } from "react";
import { PIECE_UNICODE } from "../lib/pieces";
import { Piece } from "../lib/boardSetup";

type Props = {
    board: Piece[][];
    makeMove: (from: { x: number; y: number }, to: { x: number; y: number }) => void;
    color?: 'white' | 'black' | null;
};

export default function ChessBoard({ board, makeMove, color }: Props) {
    const [selected, setSelected] = useState<{ x: number; y: number } | null>(null);

    if (!board || board.length === 0) {
        return (
            <div className="w-96 h-96 bg-neutral-300 flex items-center justify-center">
                <div className="text-lg">Loading board...</div>
            </div>
        );
    }

    function handleClick(x: number, y: number) {
        const clickedPiece = board[y]?.[x];

        if (selected) {
            // If we have a piece selected, try to make a move
            if (selected.x === x && selected.y === y) {
                // Clicking the same square deselects
                setSelected(null);
            } else {
                // Make the move
                makeMove(selected, { x, y });
                setSelected(null);
            }
        } else if (clickedPiece) {
            // Only allow selecting pieces of your own color (if color is set)
            if (!color || clickedPiece.color === color) {
                setSelected({ x, y });
            }
        }
    }

    function getPossibleMoves(x: number, y: number): { x: number; y: number }[] {
        // This is a placeholder - implement your chess logic here
        // For now, just return empty array
        return [];
    }

    const possibleMoves = selected ? getPossibleMoves(selected.x, selected.y) : [];

    return (
        <div className="inline-block border-2 border-neutral-800">
            <div className="grid grid-cols-8 gap-0">
                {board.map((row, y) =>
                    row.map((piece, x) => {
                        const isDark = (x + y) % 2 === 1;
                        const isSelected = selected?.x === x && selected?.y === y;
                        const isPossibleMove = possibleMoves.some(move => move.x === x && move.y === y);

                        return (
                            <div
                                key={`${x}-${y}`}
                                onClick={() => handleClick(x, y)}
                                className={`
                                    w-12 h-12 flex items-center justify-center cursor-pointer text-3xl 
                                    select-none transition-all duration-200
                                    ${isDark ? "bg-green-700" : "bg-amber-100"}
                                    ${isSelected ? "ring-4 ring-blue-400 ring-inset" : ""}
                                    ${isPossibleMove ? "ring-2 ring-green-400 ring-inset" : ""}
                                    hover:brightness-110
                                `}
                            >
                                {piece && PIECE_UNICODE[`${piece.color}_${piece.type.toLowerCase()}`] ? (
                                    <span className={`
                                        ${piece.color === 'white' ? 'text-neutral-300 drop-shadow-lg' : 'text-neutral-800'}
                                        ${isSelected ? 'scale-110' : ''}
                                        transition-transform duration-200
                                    `}>
                                        {PIECE_UNICODE[`${piece.color}_${piece.type.toLowerCase()}`]}
                                    </span>
                                ) : null}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}