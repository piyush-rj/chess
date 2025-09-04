import WebSocket from "ws";
import { Position, WebSocketMessage } from "../../types/types";
import { GameManager } from "./GameManager";

export class ChessGameWSHandler {
    public gameManager = new GameManager();
    private clients = new Map<string, WebSocket>();

    public handle_connection(ws: WebSocket, playerId: string): void {
        this.clients.set(playerId, ws);

        ws.on('message', (data: string) => {
            try {
                const message: WebSocketMessage = JSON.parse(data);
                this.handle_message(playerId, message);
            } catch (error) {
                this.send_error_message(playerId, 'Invalid message format');
            }
        });

        ws.on('close', () => {
            this.gameManager.leave_game(playerId);
            this.clients.delete(playerId);
        });
    }

    private handle_message(playerId: string, message: WebSocketMessage): void {
        switch (message.type) {
            case 'init_game':
                this.handle_init_game(playerId);
                break;
            case 'join_game':
                this.handle_join_game(playerId, message.payload);
                break;
            case 'make_move':
                this.handle_make_move(playerId, message.payload);
                break;
            case 'get_valid_moves':
                this.handle_get_valid_moves(playerId, message.payload);
                break;
            default:
                this.send_error_message(playerId, 'unknown message type');
        }
    }

    private handle_init_game(playerId: string): void {
        const gameId = this.gameManager.create_game();
        const result = this.gameManager.join_game(gameId, playerId);

        this.send_message(playerId, {
            type: 'game_created',
            payload: {
                gameId,
                ...result.result
            }
        });
    }

    private handle_join_game(playerId: string, payload: { gameId: string }): void {
        const result = this.gameManager.join_game(payload.gameId, playerId);

        if (!result.success) {
            this.send_error_message(playerId, result.error ?? 'join failed');
            return;
        }

        const game = this.gameManager.get_game(payload.gameId)!;
        const gameState = game.get_game_state();

        // send personalized info to white and black players (if they exist)
        const whiteId = gameState.whitePlayer;
        const blackId = gameState.blackPlayer;

        if (whiteId) {
            this.send_message(whiteId, {
                type: 'player_info',
                payload: {
                    yourColor: 'white',
                    gameState,
                    message: whiteId === playerId ? 'You joined as white' : 'White player is ready'
                }
            });
        }

        if (blackId) {
            this.send_message(blackId, {
                type: 'player_info',
                payload: {
                    yourColor: 'black',
                    gameState,
                    message: blackId === playerId ? 'You joined as black' : 'Black player is ready'
                }
            });
        }

        // notify both players that someone joined and share the updated game state
        this.broadcast_to_game(payload.gameId, {
            type: 'player_joined',
            payload: {
                joiningPlayer: playerId,
                gameState
            }
        });

        // if both players are present, notify that game started
        if (whiteId && blackId) {
            this.broadcast_to_game(payload.gameId, {
                type: 'game_started',
                payload: {
                    gameState
                }
            });
        }
    }


    private handle_make_move(playerId: string, payload: { from: Position; to: Position }): void {
        const game = this.gameManager.get_player_game(playerId);
        if (!game) {
            this.send_error_message(playerId, 'not in any game');
            return;
        }

        const result = game.make_move(playerId, payload.from, payload.to);

        if (result.success) {
            this.broadcast_to_game(game.gameId, {
                type: 'move_made',
                payload: {
                    move: result.move,
                    gameState: game.get_game_state()
                }
            });
        } else {
            this.send_error_message(playerId, result.error!);
        }
    }

    private handle_get_valid_moves(playerId: string, payload: { position: Position }): void {
        const game = this.gameManager.get_player_game(playerId);
        if (!game) {
            this.send_error_message(playerId, 'not iu any game');
            return;
        }

        const validMoves = game.get_valid_moves(playerId, payload.position);

        this.send_message(playerId, {
            type: 'valid_moves',
            payload: {
                position: payload.position,
                validMoves
            }
        });
    }

    private send_message(playerId: string, message: any): void {
        const client = this.clients.get(playerId);
        if (client) {
            client.send(JSON.stringify(message));
        }
    }

    private send_error_message(playerId: string, error: string): void {
        this.send_message(playerId, {
            type: 'error',
            payload: { error }
        });
    }

    private broadcast_to_game(gameId: string, message: any): void {
        const game = this.gameManager.get_game(gameId);
        if (!game) return;

        const gameState = game.get_game_state();
        const players = [
            gameState.whitePlayer,
            gameState.blackPlayer,
        ].filter(Boolean);

        players.forEach(playerId => {
            this.send_message(playerId!, message);
        });
    }
}