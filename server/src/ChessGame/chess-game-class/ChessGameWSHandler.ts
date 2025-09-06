import WebSocket from "ws";
import { Position, WebSocketMessage } from "../../types/types";
import { GameManager } from "./GameManager";
import { GameService } from "../GameService";

export class ChessGameWSHandler {
    private gameManager = new GameManager();
    private gameService = new GameService(this.gameManager);
    private clients = new Map<string, WebSocket>();

    public handle_connection(ws: WebSocket, playerId: string): void {
        this.clients.set(playerId, ws);

        ws.on("message", (data: string) => {
            try {
                const message: WebSocketMessage = JSON.parse(data);
                this.handle_message(playerId, message);
            } catch (error) {
                this.send_error_message(playerId, "Invalid message format");
            }
        });

        ws.on("close", () => {
            this.gameManager.leave_game(playerId);
            this.clients.delete(playerId);
        });
    }

    private async handle_message(playerId: string, message: WebSocketMessage) {
        switch (message.type) {
            case "init_game":
                await this.handle_init_game(playerId);
                break;
            case "join_game":
                await this.handle_join_game(playerId, message.payload);
                break;
            case "make_move":
                await this.handle_make_move(playerId, message.payload);
                break;
            case "get_valid_moves":
                this.handle_get_valid_moves(playerId, message.payload);
                break;
            default:
                this.send_error_message(playerId, "unknown message type");
        }
    }

    private async handle_init_game(playerId: string) {
        const result = await this.gameService.createGame(playerId);

        this.send_message(playerId, {
            type: "game_created",
            payload: { ...result, gameId: result.gameId },
        });
    }

    private async handle_join_game(playerId: string, payload: { gameId: string }) {
        console.log("gameid received is  ------------------> ", payload.gameId);
        const result = await this.gameService.joinGame(payload.gameId, playerId);

        if (!result.success) {
            this.send_error_message(playerId, result.error ?? "join failed");
            return;
        }

        const gameState = await this.gameService.getGameState(payload.gameId);

        // notify both players
        this.broadcast_to_game(payload.gameId, {
            type: "player_joined",
            payload: { joiningPlayer: playerId, gameState },
        });

        if (gameState?.whitePlayer && gameState?.blackPlayer) {
            this.broadcast_to_game(payload.gameId, {
                type: "game_started",
                payload: { gameState },
            });
        }
    }

    private async handle_make_move(playerId: string, payload: { from: Position; to: Position }) {
        const game = this.gameManager.get_player_game(playerId);
        if (!game) {
            this.send_error_message(playerId, "not in any game");
            return;
        }

        const result = await this.gameService.saveMove(playerId, game.gameId, payload.from, payload.to);

        if (result.success) {
            this.broadcast_to_game(game.gameId, {
                type: "move_made",
                payload: {
                    move: result.move,
                    gameState: game.get_game_state(),
                },
            });
        } else {
            this.send_error_message(playerId, result.error!);
        }
    }

    private handle_get_valid_moves(playerId: string, payload: { position: Position }) {
        const game = this.gameManager.get_player_game(playerId);
        if (!game) {
            this.send_error_message(playerId, "not in any game");
            return;
        }

        const validMoves = game.get_valid_moves(playerId, payload.position);

        this.send_message(playerId, {
            type: "valid_moves",
            payload: { position: payload.position, validMoves },
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
            type: "error",
            payload: { error },
        });
    }

    private broadcast_to_game(gameId: string, message: any): void {
        const game = this.gameManager.get_game(gameId);
        if (!game) return;

        const gameState = game.get_game_state();
        const players = [gameState.whitePlayer, gameState.blackPlayer].filter(Boolean);

        players.forEach((pid) => this.send_message(pid!, message));
    }
}
