export type Color = "white" | "black";
export type PieceType =
    | "KING"
    | "QUEEN"
    | "ROOK"
    | "BISHOP"
    | "KNIGHT"
    | "PAWN";

export interface Position {
    x: number;
    y: number;
}

export interface Piece {
    color: Color;
    type: PieceType;
    symbol: string;
    has_moved: boolean;
}

export interface Move {
    from: Position;
    to: Position;
    piece: PieceType;
    captured?: PieceType;
}

export interface GameState {
    board: (Piece | null)[][];
    current_player: Color;
    game_status: string;
    move_history: Move[];
    white_player?: string;
    black_player?: string;
}
