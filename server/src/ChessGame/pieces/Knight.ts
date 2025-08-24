import { MoveCoordinates } from "../../types/types";
import { Board } from "../board/Board";
import { is_inside_board } from "../chess-game-utils/utils";
import { Piece } from "./Piece";

export class Knight extends Piece {
    constructor(color: 'w' | 'b') {
        super(color, 'n');
    }

    // define board type
    public get_valid_moves(x: number, y: number, board: Board): MoveCoordinates[] {
        const moves: { x: number, y: number }[] = [];
        const all_possible_moves: [number, number][] = [
            [1, -2], [1, 2], [2, 1], [2, -1], [-1, 2], [-1, -2], [-2, 1], [-2, -1]
        ]

        for (const [move_x, move_y] of all_possible_moves) {
            const px = x + move_x;
            const py = y + move_y;

            if (!is_inside_board(px, py)) continue;

            const target = board.get_piece(px, py);
            if (!target || target.color !== this.color) {
                moves.push({
                    x: px,
                    y: py
                })
            }
        }

        return moves;
    }
}