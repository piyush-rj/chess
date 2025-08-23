import { Chess } from 'chess.js';

export enum MESSAGE_TYPE {
    INIT_GAME = 'INIT_GAME',
    MOVE = 'MOVE',
    GAME_STATE = 'GAME_STATE',
    WAITING_FOR_OPONENT = 'WAITING_FOR_OPONENT',
    GAME_OVER = 'GAME_OVER',
    COLOR = 'COLOR',
    INVALID_MOVE = 'INVALID_MOVE',
}

export interface GameStateMessage {
    type: MESSAGE_TYPE.GAME_STATE;
    board: Chess;
    turn: 'w' | 'b';
    move_count: number;
}

export interface ColorMessage {
    type: MESSAGE_TYPE.COLOR;
    color: 'white' | 'black';
}

export interface GameOverMessage {
    type: MESSAGE_TYPE.GAME_OVER
    reason: string;
}

export type IncomingChessMessage = 
    | GameStateMessage
    | GameOverMessage
    | ColorMessage
    | { type: MESSAGE_TYPE.WAITING_FOR_OPONENT }
    | { type: MESSAGE_TYPE.INVALID_MOVE, move: { from: string, to: string } }

