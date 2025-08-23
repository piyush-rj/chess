import { MoveCoordinates } from "../../types/types";
import { is_inside_board } from "../chess-game-utils/utils";
import { Piece } from "./Piece";

export class King extends Piece {
    constructor(color: 'w' | 'b') {
        super(color, 'k');
    }

    public get_valid_move(x: number, y: number, board: any) {
        const all_possible_moves: [number, number][] = [
            [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]
        ];

        const moves: MoveCoordinates[] = [];

        for (const [move_x, move_y] of all_possible_moves) {
            let px = x + move_x;
            let py = y + move_y;

            if (!is_inside_board) continue;

            const target = board.get_piece(px, py);
            if (!target || target.color !== this.color) {
                moves.push({
                    x: px,
                    y: py
                });
            }
        }

        return moves;
    }
}