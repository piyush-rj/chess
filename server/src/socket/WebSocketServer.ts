import { WebSocketServer, WebSocket } from "ws";
import { GameManager } from "../ChessGame/controller/GameManager";

export class WebSocketGameServer {
    private wss: WebSocketServer;
    private game: GameManager;

    constructor(private port: number) {
        this.wss = new WebSocketServer({ port: this.port });
        this.game = new GameManager();
    }

    public start() {
        this.wss.on("connection", (ws: WebSocket) => {
            console.log("client connected");

            ws.on("message", (message: string) => {
                this.handleMessage(ws, message);
            });

            ws.on("close", () => {
                console.log("client disconnected");
            });
        });

        console.log(`WebSocket server running on port ${this.port}`);
    }

    private handleMessage(ws: WebSocket, message: string) {
        try {
            const data = JSON.parse(message.toString());

            switch (data.type) {
                case "move":
                    return this.handleMove(ws, data);
                case "getBoard":
                    return this.handleGetBoard(ws);
                default:
                    console.error("invalid messaga");
                    break;
            }
        } catch (err) {
            ws.send(
                JSON.stringify({
                    type: "error",
                    message: (err as Error).message,
                })
            );
        }
    }

    private handleMove(ws: WebSocket, data: any) {

        const { fromX, fromY, toX, toY } = data.payload;

        this.game.move(fromX, toX, fromY, toY);

        ws.send(
            JSON.stringify({
                type: "update",
                board: this.game.get_board(),
                turn: this.game.get_turn(),
                result: this.game.get_result(),
            })
        );
    }

    private handleGetBoard(ws: WebSocket) {
        ws.send(
            JSON.stringify({
                type: "board",
                board: this.game.get_board(),
                turn: this.game.get_turn(),
                result: this.game.get_result(),
            })
        );
    }
}
