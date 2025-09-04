import { useEffect, useRef, useState } from "react";
import { Piece, initialBoard } from "../lib/boardSetup";

export default function useChessSocket() {
    const socketRef = useRef<WebSocket | null>(null);
    const [gameId, setGameId] = useState<string>("");
    const [board, setBoard] = useState<Piece[][]>(initialBoard());
    const [color, setColor] = useState<"white" | "black" | null>(null);
    const [playerId, setPlayerId] = useState<string>("");

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("ws connected");
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("ws message ---------------------->  ", message);

            switch (message.type) {
                case "connection_established":
                    setPlayerId(message.payload.playerId);
                    break;

                case "game_created":
                    setGameId(message.payload.gameId);
                    setColor(message.payload.color);
                    setBoard(message.payload.board || initialBoard());
                    break;

                case "game_joined":
                    setGameId(message.payload.gameId);
                    setColor(message.payload.color);
                    setBoard(message.payload.board);
                    break;

                case "move_made":
                    setBoard(message.payload.board);
                    break;

                default:
                    console.warn("Unhandled message type:", message.type);
            }
        };

        socket.onclose = () => {
            console.log("ws disconnected");
        };

        return () => {
            socket.close();
        };
    }, []);

    function sendMessage(type: string, payload?: any) {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type, payload }));
        } else {
            console.error("ws not open, cannot send");
        }
    }

    function createGame() {
        setBoard(initialBoard());
        sendMessage("init_game");
    }

    function joinGame(gameId: string) {
        sendMessage("join_game", { gameId });
    }

    function makeMove(from: { x: number; y: number }, to: { x: number; y: number }) {
        sendMessage("make_move", { from, to });
    }

    return {
        board,
        setBoard,
        color,
        gameId,
        playerId,
        createGame,
        joinGame,
        makeMove,
    };
}
