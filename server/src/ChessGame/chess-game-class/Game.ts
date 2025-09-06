import { Color, GameState, GameStatusEnum, Move, PieceTypeEnum, Position } from "../../types/types";
import { Board } from "./Board";
import { Piece } from "./Piece";

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

        const validMoves = this.get_legal_moves_for_piece(from, playerColor);
        const isValidMove = validMoves.some(move => move.x === to.x && move.y === to.y);

        console.log("inside make move 2");
        if (!isValidMove) {
            return { success: false, error: 'invalid move, would leave king in check' };
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

    // legal moves for a piece (excluding moves that would leave king in check)
    private get_legal_moves_for_piece(position: Position, color: Color): Position[] {
        const piece = this.board.get_piece(position.x, position.y);
        if (!piece || piece.color !== color) return [];

        const possibleMoves = piece.get_possible_moves(position, this.board);
        const legalMoves: Position[] = [];

        for (const move of possibleMoves) {
            const boardClone = this.board.clone_board();
            boardClone.make_move(position, move);

            const kingPosition = this.get_king_position_on_board(color, boardClone);
            if (kingPosition) {
                const opponentColor: Color = color === 'white' ? 'black' : 'white';
                const kingInCheck = this.is_square_attacked_on_board(kingPosition, opponentColor, boardClone);

                if (!kingInCheck) {
                    legalMoves.push(move);
                }
            }
        }

        return legalMoves;
    }

    private get_player_color(playerId: string): Color | null {
        if (this.game_state.whitePlayer === playerId) return 'white';
        if (this.game_state.blackPlayer === playerId) return 'black';
        return null;
    }

    private update_game_status(): void {
        const current_player = this.game_state.currentPlayer;
        const opponent_color: Color = current_player === 'white' ? 'black' : 'white';

        const kingPosition = this.get_king_position(opponent_color);
        if (!kingPosition) return;

        const king_in_check = this.is_square_attacked(kingPosition, current_player);
        const has_possible_moves = this.has_possible_moves(opponent_color);

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

        return this.get_legal_moves_for_piece(position, playerColor);
    }

    private is_square_attacked(position: Position, attackerColor: Color): boolean {
        return this.is_square_attacked_on_board(position, attackerColor, this.board);
    }

    private is_square_attacked_on_board(position: Position, attackerColor: Color, board: Board): boolean {
        const boardArray = board.get_board();

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = boardArray[y]![x];

                if (piece && piece.color === attackerColor) {
                    const moves = piece.get_possible_moves({ x, y }, board);
                    if (moves.some(m => m.x === position.x && m.y === position.y)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private get_king_position(color: Color): Position | null {
        return this.get_king_position_on_board(color, this.board);
    }

    private get_king_position_on_board(color: Color, board: Board): Position | null {
        const boardArray = board.get_board();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = boardArray[y]![x];
                if (piece && piece.type === PieceTypeEnum.KING && piece.color === color) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    private has_possible_moves(color: Color): boolean {
        const board = this.board.get_board();

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = board[y]![x];

                if (piece && piece.color === color) {
                    const legalMoves = this.get_legal_moves_for_piece({ x, y }, color);
                    if (legalMoves.length > 0) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    public restore_game_state(gameState: any, moves: any[]) {
        this.game_state.whitePlayer = gameState.whitePlayerId;
        this.game_state.blackPlayer = gameState.blackPlayerId;
        this.game_state.gameStatus = gameState.status;
        this.game_state.currentPlayer = gameState.currentTurn?.toLowerCase() as Color || 'white';

        // if theres a saved board state, restore it
        if (gameState.boardState) {
            this.restore_board_from_state(gameState.boardState);
        } else if (moves && moves.length > 0) {
            // otherwise replay moves to reconstruct board
            this.replay_moves(moves);
        }

        this.game_state.board = this.board.get_board();
    }

    private restore_board_from_state(boardState: any[][]) {
        this.board = new Board();
        const board = this.board.get_board();

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (boardState[y] && boardState[y]![x]) {
                    const pieceData = boardState[y]![x];
                    board[y]![x] = this.create_piece_from_data(pieceData);
                } else {
                    board[y]![x] = null;
                }
            }
        }
    }

    private create_piece_from_data(pieceData: any) {
        const piece = Piece.create_piece(pieceData.color, pieceData.type);
        piece.has_moved = pieceData.has_moved || false;
        return piece;
    }

    private replay_moves(moves: any[]) {
        const sortedMoves = moves.sort((a, b) => a.moveNumber - b.moveNumber);

        for (const move of sortedMoves) {
            const from = { x: move.fromX, y: move.fromY };
            const to = { x: move.toX, y: move.toY };
            this.board.make_move(from, to);
        }
    }
}