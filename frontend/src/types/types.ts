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


export enum IncomingMessageType {
    GAME_STATE = 'game_state',
    CONNECTION_ESTABLISHED = 'connection_established',
    GAME_CREATED = 'game_created',
    GAME_JOINED = 'game_joined',
    GAME_LEFT = 'game_left',
    MOVE_MADE = 'move_made',
    OPPONENT_JOINED = 'opponene_joined',
    INVALID_MOVE = 'invalid_move',
    MOVE_FAILED = 'move_failed',
    GAME_ENDED = 'game_ended',
}