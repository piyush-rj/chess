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
}

export interface Position {
    x: number,
    y: number,
}

export interface Move {
    from: Position,
    to: Position,
    piece: PieceTypeEnum,
    captured?: PieceTypeEnum,
    // to add -> promotion, castling, enPassant 
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

