import { MoveCoordinates } from "../../types/types";
import { is_inside_board } from "../chess-game-utils/utils";
import { Piece } from "./Piece";

export class Pawn extends Piece {
    constructor(color: 'w' | 'b') {
        super(color, 'p');
    }

    // pawn can move twice if at start point
    // for one move -> check one further square
    // for two moves -> check 2 further squares

    // define board type here
    public get_valid_move(x: number, y: number, board: any): MoveCoordinates[] {
        const moves: MoveCoordinates[] = [];

        const direction = this.color === 'w' ? -1 : 1;
        const start_row = this.color === 'w' ? 6 : 1;

        if (is_inside_board(x, y + direction) && !board.get_piece(x, y + direction)) {
            moves.push({ 
                x,
                y: y + direction,
            });

            if (y === start_row && !board.get_piece(x, y + direction * 2)) {
                moves.push({
                    x,
                    y: y + direction * 2,
                })
            }
        }

        // eliminate move
        const diagonal_capture = [
            { x: x - 1, y: y + direction },
            { x: x + 1, y: y + direction },
        ]

        for (const position of diagonal_capture) {
            if (!is_inside_board(position.x, position.y)) continue;

            const target = board.get_piece(position.x, position.y);
            const id_opponent = target && target.color !== this.color;
            
            if (id_opponent) {
                moves.push(position);
            }
        }

        return moves;
    }
}