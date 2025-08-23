import { MoveCoordinates } from "../../types/types";
import { is_inside_board } from "../chess-game-utils/utils";
import { Piece } from "./Piece";

export class Rook extends Piece {
    constructor(color: 'w' | 'b') {
        super(color, 'r');
    }

    public get_vaild_move(x: number, y: number, board: any) {
        const all_possible_moves: [number, number][] = [
            [0, 1], [0, -1], [1, 0], [-1, 0]
        ];

        const moves: MoveCoordinates[] = [];

        for (const [move_x, move_y] of all_possible_moves) {
            let px = x + move_x;
            let py = x + move_y;

            while(is_inside_board) {
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
                        break;
                    }
                }
                px += move_x;
                py += move_y;
            }
        }

        return moves;
    }
}