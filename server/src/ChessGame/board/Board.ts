import { Color } from "../../types/types";
import { is_inside_board } from "../chess-game-utils/utils";
import { Bishop } from "../pieces/Bishop";
import { King } from "../pieces/King";
import { Knight } from "../pieces/Knight";
import { Pawn } from "../pieces/Pawn";
import { Piece } from "../pieces/Piece";
import { Queen } from "../pieces/Queen";
import { Rook } from "../pieces/Rook";

export class Board {
    private board: (Piece | null)[][];

    constructor(setup: 'initial' | 'empty' = 'initial') {
        this.board = Array.from({ length: 8 }, () => Array<Piece | null>(8).fill(null));
        if (setup === 'initial') {
            this.initialize_board();
        }
    }

    public initialize_board() {
        this.board[0]![0] = new Rook('b');
        this.board[0]![1] = new Knight('b');
        this.board[0]![2] = new Bishop('b');
        this.board[0]![3] = new Queen('b');
        this.board[0]![4] = new King('b');
        this.board[0]![5] = new Bishop('b');
        this.board[0]![6] = new Knight('b');
        this.board[0]![7] = new Rook('b');

        for (let i = 0; i < 8; i++) {
            this.board[1]![i] = new Pawn('b');
            this.board[6]![i] = new Pawn('w');
        }
        
        this.board[7]![0] = new Rook('w');
        this.board[7]![1] = new Knight('w');
        this.board[7]![2] = new Bishop('w');
        this.board[7]![3] = new Queen('w');
        this.board[7]![4] = new King('w');
        this.board[7]![5] = new Bishop('w');
        this.board[7]![6] = new Knight('w');
        this.board[7]![7] = new Rook('w');
    }

    public get_piece(x: number, y: number): Piece | null {
        if (!is_inside_board(x, y)) return null;
        return this.board[y]?.[x] ?? null;
    }

    public set_piece(x: number, y: number, piece: Piece | null): void {
        if (is_inside_board(x, y)) {
            this.board[y]![x] = piece;
        }
    }

    public move_piece(fromX: number, toX: number, fromY: number, toY: number): void {
        const piece = this.board[fromY]![fromX];
        if (piece && is_inside_board(toX, toY)) {
            this.set_piece(toX, toY, piece);
            this.set_piece(fromX, fromY, null);
            // Mark piece as moved for castling/en passant logic
            piece.has_moved = true;
        }
    }

    public get_board_state(): (Piece | null)[][] {
        return this.board;
    }

    public clone(): Board {
        const copy = new Board('empty');
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.board[y]?.[x];
                if (piece) {
                    // Create a new instance of the same piece type
                    let newPiece: Piece;
                    switch (piece.symbol) {
                        case 'p': newPiece = new Pawn(piece.color); break;
                        case 'r': newPiece = new Rook(piece.color); break;
                        case 'n': newPiece = new Knight(piece.color); break;
                        case 'b': newPiece = new Bishop(piece.color); break;
                        case 'q': newPiece = new Queen(piece.color); break;
                        case 'k': newPiece = new King(piece.color); break;
                        default: continue;
                    }
                    newPiece.has_moved = piece.has_moved;
                    copy.set_piece(x, y, newPiece);
                }
            }
        }
        return copy;
    }

    public find_king(color: Color): { x: number; y: number } | null {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const p = this.board[y]![x];
                if (p && p.symbol === 'k' && p.color === color) {
                    return { x, y };
                }
            }
        }
        return null;
    }
}