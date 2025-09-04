export type Piece = {
    type: string;
    color: "white" | "black";
} | null;

export function initialBoard(): Piece[][] {
    return [
        [
            { type: "rook", color: "black" },
            { type: "knight", color: "black" },
            { type: "bishop", color: "black" },
            { type: "queen", color: "black" },
            { type: "king", color: "black" },
            { type: "bishop", color: "black" },
            { type: "knight", color: "black" },
            { type: "rook", color: "black" },
        ],
        Array.from({ length: 8 }, () => ({ type: "pawn", color: "black" })),
        ...Array.from({ length: 4 }, () => Array(8).fill(null)),
        Array.from({ length: 8 }, () => ({ type: "pawn", color: "white" })),
        [
            { type: "rook", color: "white" },
            { type: "knight", color: "white" },
            { type: "bishop", color: "white" },
            { type: "queen", color: "white" },
            { type: "king", color: "white" },
            { type: "bishop", color: "white" },
            { type: "knight", color: "white" },
            { type: "rook", color: "white" },
        ],
    ];
}
