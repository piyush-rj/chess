import { useContext, useEffect, useState } from "react";
import { Piece } from "../lib/boardSetup";
import { SocketContext } from "../provider/WebSocketProvider";
import { IncomingMessageType } from "../types/types";

export default function useChessSocket() {
    const { lastMessage, send, isConnected } = useContext(SocketContext);

    const [gameId, setGameId] = useState<string>("");
    const [board, setBoard] = useState<Piece[][]>([]);
    const [color, setColor] = useState<"white" | "black" | null>(null);
    const [playerId, setPlayerId] = useState<string>("");

    useEffect(() => {
        if (!lastMessage) return;

        switch (lastMessage.type) {
            case IncomingMessageType.GAME_STATE:
                setBoard(lastMessage.payload.board.board ?? lastMessage.payload.board);
                break;

            case IncomingMessageType.CONNECTION_ESTABLISHED:
                setPlayerId(lastMessage.payload.playerId);
                break;

            case IncomingMessageType.GAME_CREATED:
                setGameId(lastMessage.payload.gameId);
                setColor("white");
                if (lastMessage.payload.board) setBoard(lastMessage.payload.board);
                break;

            case IncomingMessageType.GAME_JOINED:
                setGameId(lastMessage.payload.gameId);
                setColor(lastMessage.payload.playerColor);
                if (lastMessage.payload.board) setBoard(lastMessage.payload.board);
                break;

            case IncomingMessageType.MOVE_MADE:
                if (lastMessage.payload.boardState) setBoard(lastMessage.payload.boardState);
                break;

            case IncomingMessageType.OPPONENT_JOINED:
                console.log("Opponent joined:", lastMessage.payload.playerId);
                break;

            case IncomingMessageType.INVALID_MOVE:
                console.warn("Invalid move:", lastMessage.payload.error);
                break;

            default:
                break;
        }
    }, [lastMessage]);

    function createGame() {
        send({ type: "create_game", payload: { playerId } });
    }

    function joinGame(gameId: string) {
        send({ type: "join_game", payload: { playerId, gameId } });
    }

    function makeMove(from: { x: number; y: number }, to: { x: number; y: number }) {
        send({ type: "make_move", payload: { playerId, from, to } });
    }

    return { board, setBoard, color, gameId, playerId, isConnected, createGame, joinGame, makeMove };
}
