import { Color, GameState, GameStatusEnum, Move, Position } from "../../types/types";
import { Board } from "./Board";

export class Game {
    private game_state: GameState;
    private board: Board;

    constructor(public readonly gameId: string) {
        this.board = new Board();
        this.game_state = {
            board: this.board.get_board(),
            currentPlayer: 'white',
            gameStatus: GameStatusEnum.WAITING,
            moveHistory: [],
            whitePlayer: undefined,
            blackPlayer: undefined,
        }
    }

    public add_player(playerId: string): { color: Color, status: string } {
        if (!this.game_state.whitePlayer) {
            this.game_state.whitePlayer = playerId;
            return {
                color: 'white',
                status: "waiting_for_opponent"
            }
        } else if (!this.game_state.blackPlayer) {
            this.game_state.blackPlayer = playerId;
            this.game_state.gameStatus = GameStatusEnum.ACTIVE;
            return {
                color: 'black',
                status: "game_started"
            }
        } else {
            throw new Error("game is already full");
        }
    }

    public remove_player(playerId: string) {
        if (this.game_state.whitePlayer === playerId) {
            this.game_state.whitePlayer = undefined;
        } else if (this.game_state.blackPlayer === playerId) {
            this.game_state.blackPlayer = undefined;
        }

        if (!this.game_state.whitePlayer || !this.game_state.blackPlayer) {
            this.game_state.gameStatus = GameStatusEnum.WAITING;
        }
    }

    public make_move(playerId: string, from: Position, to: Position): { success: boolean; move?: Move; error?: string } {
        const playerColor = this.get_player_color(playerId);
        if (!playerColor || playerColor !== this.game_state.currentPlayer) {
            return { success: false, error: 'not your turn' };
        }

        const piece = this.board.get_piece(from.x, from.y);
        if (!piece || piece.color !== playerColor) {
            return { success: false, error: 'invalid piece selection' };
        }

        const validMoves = piece.get_possible_moves(from, this.board);
        const isValidMove = validMoves.some(move => move.x === to.x && move.y === to.y);

        if (!isValidMove) {
            return { success: false, error: 'invalid move' };
        }

        const move = this.board.make_move(from, to);
        if (move) {
            this.game_state.moveHistory.push(move);
            this.game_state.currentPlayer = this.game_state.currentPlayer === 'white' ? 'black' : 'white';
            this.game_state.board = this.board.get_board();

            this.update_game_status();

            return { success: true, move };
        }

        return { success: false, error: 'Move failed' };
    }

    private get_player_color(playerId: string): Color | null {
        if (this.game_state.whitePlayer === playerId) return 'white';
        if (this.game_state.blackPlayer === playerId) return 'black';
        return null;
    }

    private update_game_status(): void {
        // impl check, checkmate, stalemate detection
        // do game analysis and return the checks
    }

    public get_game_state(): GameState {
        return { ...this.game_state };
    }

    public get_valid_moves(playerId: string, position: Position) {
        const playerColor = this.get_player_color(playerId);

        if (!playerColor || playerColor !== this.game_state.currentPlayer) {
            return [];
        }

        const piece = this.board.get_piece(position.x, position.y);
        if (!piece || piece.color !== playerColor) {
            return [];
        }

        return piece.get_possible_moves(position, this.board);
    }

}