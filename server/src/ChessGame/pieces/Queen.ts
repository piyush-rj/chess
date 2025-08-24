import { MoveCoordinates } from "../../types/types";
import { Board } from "../board/Board";
import { is_inside_board } from "../chess-game-utils/utils";
import { Piece } from "./Piece";

export class Queen extends Piece {
    constructor(color: 'w' | 'b') {
        super(color, 'q');
    }

    public get_valid_move(x: number, y: number, board: Board): MoveCoordinates[] {
        const all_possible_moves: [number, number][] = [
            [0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1], [-1, 1], [1, -1]
        ];

        const moves: MoveCoordinates[] = [];

        for (const [move_x, move_y] of all_possible_moves) {
            let px = x + move_x;
            let py = y + move_y;

            while (is_inside_board(px, py)) {
                const target = board.get_piece(px, py);
                if (!target) {
                    moves.push({
                        x: px,
                        y: py
                    });
                } else {
                    if (target.color !== this.color) {
                        moves.push({
                            x: px,
                            y: py
                        });
                    }
                    break;
                }

                px += move_x;
                py += move_y;
            }
        }
        return moves;
    }
}