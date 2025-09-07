"use client";
import { useState, useEffect } from "react";
import { PIECE_COMPONENTS } from "../../lib/pieces";
import { Position } from "../../types/types";
import { use_game_store } from "@/src/store/useChessGameStore";

type Props = {
    makeMove: (from: Position, to: Position) => void;
};

export default function ChessBoard({ makeMove }: Props) {
    const { game_state, player_color } = use_game_store();
    const [selected, setSelected] = useState<Position | null>(null);

    useEffect(() => {
        setSelected(null);
    }, [game_state?.board]);

    if (!game_state?.board) return null;
    if (!Array.isArray(game_state?.board)) {
        console.warn("Invalid board:", game_state?.board);
        return null;
    }

    function handleClick(x: number, y: number) {
        const clickedPiece = game_state?.board[y][x];

        if (selected) {
            makeMove(selected, { x, y });
            setSelected(null);
            return;
        }

        if (clickedPiece && clickedPiece.color === player_color) {
            setSelected({ x, y });
        }
    }

    return (
        <div className="inline-block border-2 border-neutral-800 rounded-sm overflow-hidden">
            <div className="grid grid-cols-8 gap-0 ">
                {game_state.board.map((row, y) =>
                    row.map((piece, x) => {
                        const isDark = (x + y) % 2 === 1;
                        const isSelected = selected?.x === x && selected?.y === y;
                        const key = piece ? `${piece.color}_${piece.type.toLowerCase()}` : null;
                        const PieceComp = key ? PIECE_COMPONENTS[key] : null;

                        return (
                            <div
                                key={`${x}-${y}`}
                                onClick={() => handleClick(x, y)}
                                className={`
                                    w-17 h-17 flex items-center justify-center cursor-pointer text-3xl 
                                    select-none transition-all duration-200
                                    ${isDark ? "bg-[#232E3B]" : "bg-[#3a5f76]"}
                                    ${isSelected ? "ring-4 ring-blue-400 ring-inset" : ""}
                                    hover:brightness-110
                                `}
                            >
                                {PieceComp && (
                                    <PieceComp
                                        className={`
                                            ${piece?.color === "white" ? "text-neutral-950 fill-neutral-300 drop-shadow-xl size-10" : "text-[#bdbdbd] fill-black size-10 drop-shadow-xl"}
                                            ${isSelected ? "scale-110" : ""}
                                            transition-transform duration-200
                                        `}
                                    />
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
