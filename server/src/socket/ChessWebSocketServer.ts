import { Server } from "http";
import WebSocket, { WebSocketServer } from "ws";
import { SendMessageType, MessageType, Position } from "../types/websocket-types";
import { v4 as uuidv4 } from "uuid";
import { getGameManager } from "../ChessGame/chess-game-singleton/singleton";

type WSMessage = {
    type: string;
    payload?: any;
};

export class ChessWebSocketServer {
    private wss: WebSocketServer;
    private sockets = new Map<string, WebSocket>();
    private gameManager = getGameManager();

    constructor(server: Server) {
        this.wss = new WebSocketServer({ server });
        this.init();
    }

    private init() {
        this.wss.on("connection", (ws, req) => {
            try {
                const rawUrl = req.url ?? "/";
                const host = req.headers.host ?? "localhost";
                const url = new URL(rawUrl, `http://${host}`);
                const playerId = url.searchParams.get("playerId");

                if (!playerId) {
                    console.warn('playerId not found');
                    try {
                        ws.close(1008, "playerId required");
                    } catch { }
                    return;
                }

                this.sockets.set(playerId, ws);
                this.safeSend(ws, {
                    type: SendMessageType.CONNECTION_ESTABLISHED,
                    payload: { playerId },
                });

                ws.on("message", (data) => {
                    this.handleMessage(ws, data);
                });

                ws.on("close", () => {
                    this.handleDisconnect(playerId);
                });

                ws.on("error", (err) => {
                    console.warn(`WS error for ${playerId}:`, err);
                    this.handleDisconnect(playerId);
                });
            } catch (err) {
                console.error('invalid url');
                try {
                    ws.close(1008, "invalid connection");
                } catch { }
            }
        });
    }

    private async handleMessage(ws: WebSocket, raw: WebSocket.Data) {
        let msg: WSMessage;
        try {
            const text = raw.toString();
            msg = JSON.parse(text);
            if (typeof msg !== "object" || typeof msg.type !== "string") {
                throw new Error("invalid message shape");
            }
        } catch {
            this.safeSend(ws, {
                type: "error",
                payload: "Invalid JSON or message shape"
            });
            return;
        }

        const { type, payload } = msg;

        try {
            switch (type) {
                case MessageType.CREATE_GAME: {
                    const playerId = payload?.playerId;
                    if (typeof playerId !== "string") {
                        this.safeSend(ws, { type: "error", payload: "playerId required" });
                        break;
                    }

                    await this.handleCreateGame(ws, playerId);
                    break;
                }

                case MessageType.JOIN_GAME: {
                    const playerId = payload?.playerId;
                    const gameId = payload?.gameId;
                    if (typeof playerId !== "string" || typeof gameId !== "string") {
                        this.safeSend(ws, { type: "error", payload: "playerId and gameId required" });
                        break;
                    }

                    await this.handleJoinGame(ws, playerId, gameId);
                    break;
                }

                case MessageType.MAKE_MOVE: {
                    const playerId = payload?.playerId;
                    const from: Position | undefined = payload?.from;
                    const to: Position | undefined = payload?.to;
                    if (typeof playerId !== "string" || !from || !to) {
                        this.safeSend(ws, { type: "error", payload: "playerId, from and to required" });
                        break;
                    }

                    await this.handleMakeMove(playerId, from, to);
                    break;
                }

                case MessageType.LEAVE_GAME: {
                    const playerId = payload?.playerId;
                    const gameId = payload?.gameId;
                    if (typeof playerId !== "string" || typeof gameId !== "string") {
                        this.safeSend(ws, { type: "error", payload: "playerId and gameId required" });
                        break;
                    }

                    await this.handleLeaveGame(playerId, gameId);
                    break;
                }

                case MessageType.RESIGN_GAME: {
                    const playerId = payload?.playerId;
                    const gameId = payload?.gameId;
                    if (typeof playerId !== "string" || typeof gameId !== "string") {
                        this.safeSend(ws, { type: "error", payload: "playerId and gameId required" });
                        break;
                    }

                    await this.handleResign(playerId, gameId);
                    break;
                }

                default:
                    this.safeSend(ws, { type: "error", payload: "Unknown message type" });
            }
        } catch (err) {
            console.error("Unhandled message error:", err);
            this.safeSend(ws, { type: "error", payload: "Internal server error" });
        }
    }

    private async handleCreateGame(ws: WebSocket, playerId: string) {
        const gameId = uuidv4();
        const game = await this.gameManager.create_game(gameId, playerId);

        this.safeSend(ws, {
            type: SendMessageType.GAME_CREATED,
            payload: {
                gameId: game.gameId,
                playerColor: "WHITE"
            },
        });
    }

    private async handleJoinGame(ws: WebSocket, playerId: string, gameId: string) {
        const result = await this.gameManager.join_game(gameId, playerId);
        if (!result.success) {
            this.safeSend(ws, { type: "error", payload: result.error });
            return;
        }

        this.safeSend(ws, {
            type: SendMessageType.GAME_JOINED,
            payload: { gameId, playerColor: result.result.color },
        });

        this.broadcastGameState(gameId);

        // if (result.isActive) {
        //     this.broadcast(gameId, {
        //         type: SendMessageType.GAME_ACTIVE,
        //         payload: result.gameState,
        //     })
        // }
    }

    private async handleMakeMove(playerId: string, from: Position, to: Position) {
        const result = await this.gameManager.make_move(playerId, from, to);
        if (!result.success) {
            this.sockets.get(playerId) && this.safeSend(this.sockets.get(playerId)!, {
                type: SendMessageType.MOVE_FAILED,
                payload: result.error
            });
            return;
        }

        const game = this.gameManager.get_player_game(playerId);
        if (game) {
            this.broadcastGameState(game.get_game_state().gameId);
        }
    }

    private async handleLeaveGame(playerId: string, gameId: string) {
        await this.gameManager.leave_game(playerId);

        this.broadcast(gameId, {
            type: SendMessageType.PLAYER_LEFT,
            payload: { gameId, playerId, message: `${playerId} left the game` },
        });
    }

    private async handleResign(playerId: string, gameId: string) {
        const game = this.gameManager.get_game(gameId);
        if (!game) {
            const ws = this.sockets.get(playerId);
            if (ws) this.safeSend(ws, {
                type: "error",
                payload: "Game not found"
            });
            return;
        }

        const state = game.get_game_state();
        const white = state.whitePlayer;
        const black = state.blackPlayer;
        const opponent = white === playerId ? black : white;
        await this.gameManager.end_game(gameId, opponent ?? null);

        this.broadcast(gameId, {
            type: SendMessageType.GAME_ENDED,
            payload: {
                gameId,
                winner: opponent ?? null,
                message: `${playerId} resigned`
            },
        });
    }

    private broadcastGameState(gameId: string) {
        const game = this.gameManager.get_game(gameId);
        if (!game) return;
        this.broadcast(gameId, {
            type: SendMessageType.GAME_STATE,
            payload: game.get_game_state()
        });
    }

    private broadcast(gameId: string, message: any) {
        const game = this.gameManager.get_game(gameId);
        if (!game) return;

        const state = game.get_game_state();
        const targets = [state.whitePlayer, state.blackPlayer];
        targets.forEach((pid) => {
            if (!pid) return;
            const sock = this.sockets.get(pid);
            if (sock && sock.readyState === WebSocket.OPEN) {
                this.safeSend(sock, message);
            }
        });
    }

    private handleDisconnect(playerId: string) {
        this.sockets.delete(playerId);
        try {
            this.gameManager.leave_game(playerId);
        } catch (err) {
            console.warn("Error while disconnoecting:", err);
        }
    }

    private safeSend(ws: WebSocket, message: any) {
        try {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        } catch (err) {
            console.warn("safe send failed:", err);
        }
    }
}
