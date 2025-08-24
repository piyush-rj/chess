import { Color, PieceSymbol, MoveCoordinates } from "../../types/types";
import { Board } from "../board/Board";

export abstract class Piece {
    public color: Color;
    public symbol: PieceSymbol;
    public has_moved: boolean = false;

    constructor(color: Color, symbol: PieceSymbol) {
        this.color = color;
        this.symbol = symbol;
    }

    abstract get_valid_move(x: number, y: number, board: Board): MoveCoordinates[];

    protected is_valid_square(x: number, y: number): boolean {
        return x >= 0 && x < 8 && y >= 0 && y < 8;
    }

    protected can_move_to(x: number, y: number, board: Board): boolean {
        if (!this.is_valid_square(x, y)) return false;
        const piece = board.get_piece(x, y);
        return !piece || piece.color !== this.color;
    }
}