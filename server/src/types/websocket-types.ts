import { Piece } from "../ChessGame/chess-game-class/Piece";

export type Color = 'white' | 'black';
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

export interface GameState {
    board: (Piece | null)[][],
    currentPlayer: Color,
    gameStatus: GameStatusEnum,
    moveHistory: Move[],
    whitePlayer: string | undefined,
    blackPlayer: string | undefined,
}


// message type
export interface WebSocketMessage {
    type: string,
    payload: any,
    gameId: string,
    playerId: string,
}

