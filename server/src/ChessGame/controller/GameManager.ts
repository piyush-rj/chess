import { Color, GameResult } from '../../types/types';
import { Board } from '../board/Board';
import { Piece } from '../pieces/Piece';
import { MoveGenerator } from './MoveGenerator';

export class GameManager {
    private board: Board;
    private turn: 'w' | 'b' = 'w';
    private moves_history: { from: [number, number], to: [number, number], piece: Piece | null, captured?: Piece | null }[] = [];
    private result: GameResult = { status: 'ongoing' };

    constructor() {
        this.board = new Board();
        this.update_game_state();
    }

    public get_board() {
        return this.board.get_board_state();
    }

    public get_turn() {
        return this.turn;
    }

    public get_result() {
        return this.result;
    }

    public move(fromX: number, toX: number, fromY: number, toY: number) {
        if (this.result.status !== 'ongoing' && this.result.status !== 'check') {
            throw new Error('game is already over');
        }

        const piece = this.board.get_piece(fromX, fromY);
        if (!piece) throw new Error('Piece not found');

        if (piece.color !== this.turn) {
            throw new Error('not your turn');
        }

        const valid_moves = piece.get_valid_move(fromX, fromY, this.board);
        const is_valid = valid_moves.some(p => p.x === toX && p.y === toY);
        if (!is_valid) throw new Error('invalid move');

        // check to see if making the move will leave my king in check
        const clone = this.board.clone();
        clone.move_piece(fromX, toX, fromY, toY);
        if (MoveGenerator.is_king_in_check(clone, this.turn)) {
            throw new Error('this move will lead to king in check');
        }

        const captured = this.board.get_piece(toX, toY);
        this.board.move_piece(fromX, toX, fromY, toY);
        this.moves_history.push({
            from: [fromX, fromY],
            to: [toX, toY],
            piece,
            captured
        });

        this.turn = this.turn === 'w' ? 'b' : 'w';

        this.update_game_state();
    }

    private update_game_state() {
        const side: Color = this.turn;
        const in_check = MoveGenerator.is_king_in_check(this.board, side);
        const legal_moves = this.possible_moves(); // Fixed typo: lega_moves -> legal_moves

        if (legal_moves.length === 0) {
            if (in_check) {
                const winner = side === 'w' ? 'b' : 'w';
                this.result = { status: 'checkmate', winner, loser: side };
            } else {
                this.result = { status: 'stalemate' };
            }
        } else {
            this.result = in_check ? { status: 'check', sideInCheck: side } : { status: 'ongoing' };
        }
    }

    public possible_moves() {
        return MoveGenerator.generate_all_possible_moves(this.board, this.turn);
    }

    // Fixed method name: get_movrs_history -> get_moves_history
    public get_moves_history() {
        return this.moves_history;
    }
}