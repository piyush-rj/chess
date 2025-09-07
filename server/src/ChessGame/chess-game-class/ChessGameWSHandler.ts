import WebSocket, { WebSocketServer } from "ws";
import { Position } from "../../types/websocket-types";
import { getGameManager } from "../chess-game-singleton/singleton";
import { v4 as uuidv4 } from 'uuid';

interface WSMessage {
    type: string;
    payload: any;
}

export class ChessGameWSHandler {
    private gameManager = getGameManager();
    private connectedPlayers: Map<string, WebSocket> = new Map();

    constructor(private wss: WebSocketServer) {
        this.wss.on("connection", (ws: WebSocket, req) => {
            const url = new URL(req.url!, `http://${req.headers.host}`);
            const playerId = url.searchParams.get("playerId");
            if (!playerId) {
                ws.close();
                return;
            }
            this.connectedPlayers.set(playerId, ws);

            ws.send(JSON.stringify({
                type: "connection_established",
                payload: { playerId },
            }));

            ws.on("message", (raw: WebSocket.Data) => this.handleMessage(ws, raw));
            ws.on("close", () => this.handleDisconnect(ws, playerId));
        });
    }

    private handleDisconnect(ws: WebSocket, playerId: string) {
        this.connectedPlayers.delete(playerId);
        this.gameManager.leave_game(playerId);
    }

    private async handleMessage(ws: WebSocket, raw: WebSocket.Data) {
        let message: WSMessage;
        try {
            message = JSON.parse(raw.toString());
        } catch {
            ws.send(JSON.stringify({ type: "error", payload: "Invalid JSON" }));
            return;
        }

        const { type, payload } = message;
        switch (type) {
            case "create_game":
                await this.handleCreateGame(ws, payload.playerId);
                break;

            case "join_game":
                await this.handleJoinGame(ws, payload.playerId, payload.gameId);
                break;

            case "make_move":
                await this.handleMakeMove(payload.playerId, payload.from, payload.to);
                break;

            case 'game_left':
                await this.handleLeaveGame(payload.playerId, payload.gameId);
                break;

            default:
                ws.send(JSON.stringify({ type: "error", payload: "Unknown type" }));
        }
    }

    private async handleCreateGame(ws: WebSocket, playerId: string) {
        const gameId = uuidv4();
        const game = await this.gameManager.create_game(gameId, playerId);

        const result = { playerId, color: "white" };
        this.connectedPlayers.set(playerId, ws);

        ws.send(JSON.stringify({
            type: "game_created",
            payload: { gameId: game.gameId, playerColor: result.color },
        }));
    }

    private async handleJoinGame(ws: WebSocket, playerId: string, gameId: string) {
        const result = await this.gameManager.join_game(gameId, playerId);

        if (!result.success) {
            ws.send(JSON.stringify({ type: "error", payload: result.error }));
            return;
        }

        const playerColor = result.result.color;

        ws.send(JSON.stringify({
            type: "game_joined",
            payload: {
                gameId,
                playerColor,
            },
        }));

        const gameState = result.gameState;
        [gameState.whitePlayer, gameState.blackPlayer].forEach(pid => {
            if (pid && this.connectedPlayers.has(pid)) {
                this.connectedPlayers.get(pid)?.send(JSON.stringify({
                    type: "game_state",
                    payload: gameState,
                }));
            }
        });
    }

    private async handleMakeMove(playerId: string, from: Position, to: Position) {
        console.log("inside make move");
        const game = this.gameManager.get_player_game(playerId);
        if (!game) return;

        const result = await this.gameManager.make_move(playerId, from, to);
        console.log("inside make move 2");
        if (!result.success) {
            const ws = this.connectedPlayers.get(playerId);
            ws?.send(JSON.stringify({
                type: "move_failed",
                payload: { error: result.error }
            }));
            return;
        }
        console.log("inside make move 3");
        const gameState = game.get_game_state();
        [gameState.whitePlayer, gameState.blackPlayer].forEach(pid => {
            if (pid && this.connectedPlayers.has(pid)) {
                this.connectedPlayers.get(pid)?.send(JSON.stringify({
                    type: "game_state",
                    payload: gameState,
                }));
            }
        });
    }

    private async handleLeaveGame(playerId: string, gameId: string) {
        const game = this.gameManager.get_player_game(playerId);
        if (!game) return;

        const gameState = game.get_game_state();

        await this.gameManager.leave_game(playerId);
        await this.gameManager.end_game(gameId, null);

        [gameState.whitePlayer, gameState.blackPlayer].forEach(pid => {
            if (pid && this.connectedPlayers.has(pid)) {
                this.connectedPlayers.get(pid)?.send(JSON.stringify({
                    type: "game_ended",
                    payload: {
                        gameId,
                        message: `Game has ended because player ${playerId} left.`,
                    },
                }));
            }
        });
    }
}
