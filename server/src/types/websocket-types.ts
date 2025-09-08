import { Board } from "../ChessGame/chess-game-class/Board";

export type Color = 'WHITE' | 'BLACK';
export type PieceSymbol = 'K' | 'Q' | 'R' | 'N' | 'B' | 'P';

export enum PieceTypeEnum {
    KING = 'KING',
    QUEEN = 'QUEEN',
    ROOK = 'ROOK',
    KNIGHT = 'KNIGHT',
    BISHOP = 'BISHOP',
    PAWN = 'PAWN',
}

export enum GameStatusEnum {
    WAITING = 'WAITING',
    ACTIVE = 'ACTIVE',
    CHECK = 'CHECK',
    CHECKMATE = 'CHECKMATE',
    STALEMATE = 'STALEMATE',
    DRAW = 'DRAW',
    IN_PROGRESS = 'IN_PROGRESS',
    ENDED = 'ENDED',
}

export interface Position {
    x: number,
    y: number,
}

export interface Move {
    moveNumber: number,
    from: Position,
    to: Position,
    piece: PieceTypeEnum,
    captured?: PieceTypeEnum,
    isCheck?: boolean,
    isCheckmate?: boolean,
    // add more conditions
}

export type GameState = {
    gameId: string,
    board: Board;
    currentPlayer: Color;
    gameStatus: GameStatusEnum;
    whitePlayer: string | null;
    blackPlayer: string | null;
    moveHistory: Move[];
};

export type PlayerResult = {
    playerId: string;
    color: 'WHITE' | 'BLACK';
};

// export interface GameState {
//     gameId: string,
//     board: (Piece | null)[][],
//     currentPlayer: Color,
//     gameStatus: GameStatusEnum,
//     moveHistory: Move[],
//     whitePlayer: string | null,
//     blackPlayer: string | null,
// }


// message type
export interface WebSocketMessage {
    type: string,
    payload: any,
    gameId: string,
    playerId: string,
}


export enum MessageType {
    CREATE_GAME = 'CREATE_GAME',
    JOIN_GAME = 'JOIN_GAME',
    LEAVE_GAME = 'LEAVE_GAME',
    MAKE_MOVE = 'MAKE_MOVE',
    RESIGN_GAME = 'RESIGN_GAME',
}

export enum SendMessageType {
    CONNECTION_ESTABLISHED = 'CONNECTION_ESTABLISHED',
    GAME_CREATED = 'GAME_CREATED',
    GAME_JOINED = 'GAME_JOINED',
    MOVE_FAILED = 'MOVE_FAILED',
    PLAYER_LEFT = 'PLAYER_LEFT',
    GAME_ENDED = 'GAME_ENDED',
    GAME_STATE = 'GAME_STATE',
    GAME_ACTIVE = 'GAME_ACTIVE',
}