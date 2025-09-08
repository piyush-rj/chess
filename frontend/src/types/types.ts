export type Color = "WHITE" | "BLACK";
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
    GAME_STATE = 'GAME_STATE',
    CONNECTION_ESTABLISHED = 'CONNECTION_ESTABLISHED',
    GAME_CREATED = 'GAME_CREATED',
    GAME_JOINED = 'GAME_JOINED',
    GAME_LEFT = 'GAME_LEFT',
    MOVE_MADE = 'MOVE_MADE',
    OPPONENT_JOINED = 'OPPONENT_JOINED',
    INVALID_MOVE = 'INVALID_MOVE',
    MOVE_FAILED = 'MOVE_FAILED',
    GAME_ENDED = 'GAME_ENDED',
    GAME_ACTIVE = 'GAME_ACTIVE',
}

export enum WebSocketSendMessage {
    CREATE_GAME = 'CREATE_GAME',
    JOIN_GAME = 'JOIN_GAME',
    LEAVE_GAME = 'LEAVE_GAME',
    MAKE_MOVE = 'MAKE_MOVE',
    RESIGN_GAME = 'RESIGN_GAME',
}