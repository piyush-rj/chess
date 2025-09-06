'use client'
import { useState } from "react";
import { BishopSVG, KingSVG, KnightSVG, PawnSVG, QueenSVG, RookSVG } from "@/src/svgs/all-svgs";

export default function HomeFooterPieces() {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const allIcons = [
        { Icon: KingSVG, text: "The King moves one square in any direction." },
        { Icon: QueenSVG, text: "The Queen moves any number of squares in any direction." },
        { Icon: BishopSVG, text: "The Bishop moves diagonally any number of squares." },
        { Icon: KnightSVG, text: "The Knight moves in an L-shape." },
        { Icon: PawnSVG, text: "The Pawn moves forward one square, attacks diagonally." },
        { Icon: RookSVG, text: "The Rook moves horizontally or vertically any number of squares." },
    ];

    return (
        <div className="px-3 py-2 flex border border-neutral-700 rounded-2xl items-center gap-x-4 relative">
            {allIcons.map(({ Icon, text }, index) => (
                <div
                    key={index}
                    className="relative px-1 text-[#c7c7c7] hover:text-[#7F7FAF] hover:-translate-y-[1px] transition-all transform duration-200"
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                >
                    <Icon />

                    {hoverIndex === index && (
                        <div className="absolute bottom-10 mb-2 left-1/2 -translate-x-1/2 w-48 p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-[#adade9] shadow-lg z-10 tracking-wider">
                            {text}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
