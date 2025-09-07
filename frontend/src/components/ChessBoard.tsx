"use client";
import { useState, useEffect } from "react";
import { PIECE_UNICODE } from "../lib/pieces";
import { Piece } from "../lib/boardSetup";
import { Position } from "../types/types";

type Props = {
    board: Piece[][];
    makeMove: (from: Position, to: Position) => void;
    color?: "white" | "black" | null;
};

export default function ChessBoard({ board, makeMove, color }: Props) {
    const [selected, setSelected] = useState<Position | null>(null);

    useEffect(() => {
        setSelected(null);
    }, [board]);

    function handleClick(x: number, y: number) {
        const clickedPiece = board[y][x];

        if (selected) {
            makeMove(selected, { x, y });
            setSelected(null);
            return;
        }

        if (clickedPiece && (!color || clickedPiece.color === color)) {
            setSelected({ x, y });
        }
    }

    return (
        <div className="inline-block border-2 border-neutral-800">
            <div className="grid grid-cols-8 gap-0">
                {board.map((row, y) =>
                    row.map((piece, x) => {
                        const isDark = (x + y) % 2 === 1;
                        const isSelected = selected?.x === x && selected?.y === y;

                        return (
                            <div
                                key={`${x}-${y}`}
                                onClick={() => handleClick(x, y)}
                                className={`
                                    w-12 h-12 flex items-center justify-center cursor-pointer text-3xl 
                                    select-none transition-all duration-200
                                    ${isDark ? "bg-amber-800" : "bg-neutral-400"}
                                    ${isSelected ? "ring-4 ring-blue-400 ring-inset" : ""}
                                    hover:brightness-110
                                `}
                            >
                                {piece && PIECE_UNICODE[`${piece.color}_${piece.type.toLowerCase()}`] ? (
                                    <span className={`
                                        ${piece.color === "white" ? "text-neutral-300 drop-shadow-lg" : "text-neutral-800"}
                                        ${isSelected ? "scale-110" : ""}
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
