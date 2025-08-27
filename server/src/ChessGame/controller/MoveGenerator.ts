import { Color, Move, MoveCoordinates } from "../../types/types";
import { Board } from "../board/Board";
import { Piece } from "../chess-game/Piece";

export class MoveGenerator {

    /** Pseudo-legal moves for a specific piece (does NOT ensure king safety). */
    static generate_moves(piece: Piece, x: number, y: number, board: Board): MoveCoordinates[] {
        if (!piece) return [];
        return piece.get_valid_move(x, y, board);
    }

    static generate_all_possible_moves(board: Board, color: Color): Move[] {
        const moves: Move[] = [];

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = board.get_piece(x, y);
                if (!piece || piece.color !== color) continue;

                const pseudo = piece.get_valid_move(x, y, board);
                for (const to of pseudo) {
                    moves.push({ from: { x, y }, to });
                }
            }
        }

        const legal: Move[] = [];
        for (const mv of moves) {
            const clone = board.clone();
            clone.move_piece(mv.from.x, mv.to.x, mv.from.y, mv.to.y);
            if (!MoveGenerator.is_king_in_check(clone, color)) {
                legal.push(mv);
            }
        }

        return legal;
    }

    static is_square_attacked(board: Board, x: number, y: number, attacker_color: Color): boolean {
        for (let sy = 0; sy < 8; sy++) {
            for (let sx = 0; sx < 8; sx++) {
                const piece = board.get_piece(sx, sy);
                if (!piece || piece.color !== attacker_color) continue;

                const moves = piece.get_valid_move(sx, sy, board); // MoveCoordinates[]
                if (moves.some((m) => m.x === x && m.y === y)) {
                    return true;
                }
            }
        }
        return false;
    }

    static is_king_in_check(board: Board, color: Color): boolean {
        const kingPos = board.find_king(color);
        if (!kingPos) return true; // illegal state (no king)
        const opponent: Color = color === 'w' ? 'b' : 'w';
        return MoveGenerator.is_square_attacked(board, kingPos.x, kingPos.y, opponent);
    }
}
