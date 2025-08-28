import { Color, PieceSymbol, PieceTypeEnum, Position } from "../../types/types";
import { Board } from "./Board";
import { is_inside_board } from "../chess-game-utils/utils";


export abstract class Piece {
    constructor(
        public readonly color: Color,
        public readonly type: PieceTypeEnum,
        public readonly symbol: PieceSymbol,
        public has_moved: boolean = false,
    ) { }

    abstract get_possible_moves(position: Position, board: Board): Position[];

    static create_piece(color: Color, type: PieceTypeEnum) {
        switch (type) {
            case PieceTypeEnum.KING:
                return new King(color);
            case PieceTypeEnum.QUEEN:
                return new Queen(color);
            case PieceTypeEnum.ROOK:
                return new Rook(color);
            case PieceTypeEnum.BISHOP:
                return new Bishop(color);
            case PieceTypeEnum.KNIGHT:
                return new Knight(color);
            case PieceTypeEnum.PAWN:
                return new Pawn(color);
            default:
                throw new Error("Unknown piece type");
        }
    }
}

export class Knight extends Piece {
    constructor(color: Color) {
        super(color, PieceTypeEnum.KNIGHT, "N");
    }

    public get_possible_moves(position: Position, board: Board): Position[] {
        const { x, y } = position;
        const moves: Position[] = [];

        const knight_moves: [number, number][] = [
            [2, 1], [2, -1], [-2, 1], [-2, -1],
            [1, 2], [1, -2], [-1, 2], [-1, -2]
        ];

        for (const [move_x, move_y] of knight_moves) {
            const px = x + move_x;
            const py = y + move_y;

            if (!is_inside_board(px, py)) continue;

            const target = board.get_piece(px, py);
            if (!target || target.color !== this.color) {
                moves.push({ x: px, y: py });
            }
        }

        return moves;
    }
}

export class Bishop extends Piece {
    constructor(color: Color) {
        super(color, PieceTypeEnum.BISHOP, "B");
    }

    public get_possible_moves(position: Position, board: Board): Position[] {
        const { x, y } = position;
        const moves: Position[] = [];

        const diagonal_directions: [number, number][] = [
            [1, 1], [-1, -1], [-1, 1], [1, -1]
        ];

        for (const [move_x, move_y] of diagonal_directions) {
            let px = x + move_x;
            let py = y + move_y;

            while (is_inside_board(px, py)) {
                const target = board.get_piece(px, py);
                if (!target) {
                    moves.push({ x: px, y: py });
                } else {
                    if (target.color !== this.color) {
                        moves.push({ x: px, y: py });
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

export class King extends Piece {
    constructor(color: Color) {
        super(color, PieceTypeEnum.KING, "K");
    }

    public get_possible_moves(position: Position, board: Board): Position[] {
        const { x, y } = position;
        const all_possible_moves: [number, number][] = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [-1, -1], [1, -1], [-1, 1]
        ];

        const moves: Position[] = [];

        for (const [move_x, move_y] of all_possible_moves) {
            const px = x + move_x;
            const py = y + move_y;

            if (!is_inside_board(px, py)) continue;

            const target = board.get_piece(px, py);
            if (!target || target.color !== this.color) {
                moves.push({ x: px, y: py });
            }
        }

        return moves;
    }
}

export class Queen extends Piece {
    constructor(color: Color) {
        super(color, PieceTypeEnum.QUEEN, "Q");
    }

    public get_possible_moves(position: Position, board: Board): Position[] {
        const { x, y } = position;
        const all_possible_moves: [number, number][] = [
            [0, 1], [0, -1], [1, 0], [-1, 0],
            [1, 1], [-1, -1], [-1, 1], [1, -1]
        ];

        const moves: Position[] = [];

        for (const [move_x, move_y] of all_possible_moves) {
            let px = x + move_x;
            let py = y + move_y;

            while (is_inside_board(px, py)) {
                const target = board.get_piece(px, py);
                if (!target) {
                    moves.push({ x: px, y: py });
                } else {
                    if (target.color !== this.color) {
                        moves.push({ x: px, y: py });
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

export class Rook extends Piece {
    constructor(color: Color) {
        super(color, PieceTypeEnum.ROOK, "R");
    }

    public get_possible_moves(position: Position, board: Board): Position[] {
        const { x, y } = position;
        const moves: Position[] = [];
        const directions: [number, number][] = [
            [0, 1], [0, -1], [1, 0], [-1, 0]
        ];

        for (const [move_x, move_y] of directions) {
            let px = x + move_x;
            let py = y + move_y;

            while (is_inside_board(px, py)) {
                const target = board.get_piece(px, py);
                if (!target) {
                    moves.push({ x: px, y: py });
                } else {
                    if (target.color !== this.color) {
                        moves.push({ x: px, y: py });
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

export class Pawn extends Piece {
    constructor(color: Color) {
        super(color, PieceTypeEnum.PAWN, "P");
    }

    public get_possible_moves(position: Position, board: Board): Position[] {
        const { x, y } = position;
        const moves: Position[] = [];

        const direction = this.color === "white" ? -1 : 1;
        const start_row = this.color === "white" ? 6 : 1;


        if (is_inside_board(x, y + direction) && !board.get_piece(x, y + direction)) {
            moves.push({ x, y: y + direction });


            if (y === start_row && !board.get_piece(x, y + direction * 2)) {
                moves.push({ x, y: y + direction * 2 });
            }
        }


        const diagonal_capture = [
            { x: x - 1, y: y + direction },
            { x: x + 1, y: y + direction },
        ];

        for (const pos of diagonal_capture) {
            if (!is_inside_board(pos.x, pos.y)) continue;

            const target = board.get_piece(pos.x, pos.y);
            const is_opponent = target && target.color !== this.color;

            if (is_opponent) {
                moves.push(pos);
            }
        }

        return moves;
    }
}
