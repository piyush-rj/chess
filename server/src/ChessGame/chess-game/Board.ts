import { Color, Move, PieceTypeEnum, Position } from "../../types/types";
import { is_inside_board } from "../chess-game-utils/utils";
import { Piece } from "./Piece";

export class Board {
    private board: (Piece | null)[][];

    constructor() {
        this.board = this.initialize_board();
    }

    private initialize_board(): (Piece | null)[][] {
        const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
            Array<Piece | null>(8).fill(null)
        );

        const piece_order: PieceTypeEnum[] = [
            PieceTypeEnum.ROOK,
            PieceTypeEnum.KNIGHT,
            PieceTypeEnum.BISHOP,
            PieceTypeEnum.QUEEN,
            PieceTypeEnum.KING,
            PieceTypeEnum.BISHOP,
            PieceTypeEnum.KNIGHT,
            PieceTypeEnum.ROOK,
        ];

        for (let i = 0; i < 4; i++) {
            const j = 7 - i;

            board[0]![i] = Piece.create_piece("black", piece_order[i]!);
            board[0]![j] = Piece.create_piece("black", piece_order[j]!);
            board[1]![i] = Piece.create_piece("black", PieceTypeEnum.PAWN);
            board[1]![j] = Piece.create_piece("black", PieceTypeEnum.PAWN);

            board[7]![i] = Piece.create_piece("white", piece_order[i]!);
            board[7]![j] = Piece.create_piece("white", piece_order[j]!);
            board[6]![i] = Piece.create_piece("white", PieceTypeEnum.PAWN);
            board[6]![j] = Piece.create_piece("white", PieceTypeEnum.PAWN);
        }

        return board;
    }

    private get_board() {
        return this.board;
    }

    public get_piece(x: number, y: number) {
        if (!is_inside_board(x, y)) return;
        return this.board[y]![x];
    }

    private set_piece(x: number, y: number, piece: Piece | null) {
        if (!is_inside_board(x, y) || !piece) return;
        this.board[y]![x] = piece;
        return this.board;
    }

    public is_empty(x: number, y: number): boolean {
        return this.get_piece(x, y) === null;
    }

    public is_opponent_piece(x: number, y: number, color: Color): boolean {
        const piece = this.get_piece(x, y);
        return piece !== null && piece?.color !== color;
    }

    public is_valid_move(from: Position, to: Position): boolean {
        if (!is_inside_board(to.x, to.y)) return false;
        const piece = this.get_piece(from.x, from.y);
        if (!piece) return false;

        const targetPiece = this.get_piece(to.x, to.y);
        return !targetPiece || targetPiece.color !== piece.color;
    }

    public make_move(from: Position, to: Position): Move | null {
        const piece = this.get_piece(from.x, from.y);
        if (!piece) return null;

        const capturedPiece = this.get_piece(to.x, to.y);
        this.set_piece(to.x, to.y, piece);
        this.set_piece(from.x, from.y, null);

        piece.has_moved = true;

        return {
            from,
            to,
            piece: piece.type,
            captured: capturedPiece?.type
        };
    }

    public get_board(board: Board) {
        return this.board;
    }

}
