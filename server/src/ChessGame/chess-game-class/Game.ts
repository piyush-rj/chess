import { Color, GameState, GameStatusEnum, Move, PieceTypeEnum, Position } from "../../types/types";
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
        console.log("inside make move");
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

        console.log("inside make move 2");
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
        console.log("inside make move 3");
        return { success: false, error: 'Move failed' };
    }

    private get_player_color(playerId: string): Color | null {
        if (this.game_state.whitePlayer === playerId) return 'white';
        if (this.game_state.blackPlayer === playerId) return 'black';
        return null;
    }

    private update_game_status(): void {
        const current_player = this.game_state.currentPlayer;
        const opponent_color: Color = current_player === 'white' ? 'black' : 'white';

        // find the position of king for current_player
        // check if king is under attack (check)
        // check for checkmate and stalemate

        const kingPosition = this.get_king_position(opponent_color);
        if (!kingPosition) return;

        const king_in_check = this.is_square_attacked(kingPosition, current_player);
        const has_possible_moves = this.has_posiible_moves(opponent_color);

        // king cannot move -> square being attacked and there are no possible moves ----------------> checkmate
        // king can move -> square is not being attacked and there are no possible moves ------------> stalemate
        // king can move -> square is being attacked but has possible moves ---------------------> check 
        // else active

        if (king_in_check && !has_possible_moves) {
            this.game_state.gameStatus = GameStatusEnum.CHECKMATE;
        } else if (!king_in_check && !has_possible_moves) {
            this.game_state.gameStatus = GameStatusEnum.STALEMATE;
        } else if (king_in_check) {
            this.game_state.gameStatus = GameStatusEnum.CHECK;
        } else {
            this.game_state.gameStatus = GameStatusEnum.ACTIVE;
        }

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

    // check if square is attacekd
    private is_square_attacked(position: Position, attackerColor: Color): boolean {
        const board = this.board.get_board();

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = board[y]![x];

                if (piece && piece.color === attackerColor) {
                    const moves = piece.get_possible_moves({ x, y }, this.board);
                    if (moves.some(m => m.x === position.x && m.y === position.y)) {
                        return true;
                    };
                };
            }
        }
        return false;
    }

    private get_king_position(color: Color): Position | null {
        const board = this.board.get_board();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = board[y]![x];
                if (piece && piece.type === PieceTypeEnum.KING && piece.color === color) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    // check if the  king is safe
    private has_posiible_moves(color: Color): boolean {
        const board = this.board.get_board();

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = board[y]![x];

                if (piece && piece.color === color) {
                    const moves = piece.get_possible_moves({ x, y }, this.board);

                    for (const move of moves) {
                        const board_clone = this.board.clone_board();
                        board_clone.make_move({ x, y }, move);
                        const king_position = this.get_king_position(color);

                        if (king_position && !this.is_square_attacked(king_position, color === 'white' ? 'black' : "white")) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

}


