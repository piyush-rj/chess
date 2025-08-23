import { is_inside_board } from "../chess-game-utils/utils";
import { Bishop } from "../pieces/Bishop";
import { King } from "../pieces/Kings";
import { Knight } from "../pieces/Knight";
import { Pawn } from "../pieces/Pawn";
import { Piece } from "../pieces/Piece";
import { Queen } from "../pieces/Queen";
import { Rook } from "../pieces/Rook";


export class Board {
    private board: (Piece | null)[][];

    constructor() {
        this.board = Array.from({ length: 8 }, () => Array<Piece | null>(8).fill(null));
        this.initialize_board();
    }

    public initialize_board() {
        const pieceOrder = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook];

        for (let x = 0; x < 8; x++) {
            const PieceType = pieceOrder[x]!;
            this.board[0][x] = new PieceType('b');
            this.board[7][x] = new PieceType('w');
        }

    }

    public get_piece(x: number, y: number, piece: Piece | null) {
        if (!is_inside_board(x, y)) {
            return null;
        }
        return this.board[y][x];
    }

    public set_piece(x: number, y: number, piece: Piece | null) {
        if (is_inside_board(x, y)) {
            this.board[y][x] = piece;
        }
    }

    // move function here

    public getState(): (Piece | null)[][] {
        return this.board;
    }
}