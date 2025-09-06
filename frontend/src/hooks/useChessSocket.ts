import { useContext, useEffect, useState } from "react";
import { Piece } from "../lib/boardSetup";
import { SocketContext } from "../provider/WebSocketProvider";
// import * as BackendApis from '../backend-utils/BackendAction';

export default function useChessSocket() {
    const ws = useContext(SocketContext);

    const [gameId, setGameId] = useState<string>("");
    const [board, setBoard] = useState<Piece[][]>([]);
    const [color, setColor] = useState<"white" | "black" | null>(null);
    const [playerId, setPlayerId] = useState<string>("");

    useEffect(() => {
        if (!ws?.lastMessage) return;
        const message = ws.lastMessage;

        switch (message.type) {
            case "connection_established":
                setPlayerId(message.payload.playerId);
                break;

            case "game_created":
            case "game_joined":
                setGameId(message.payload.gameId);
                setColor(message.payload.color);
                if (message.payload.board) setBoard(message.payload.board);
                break;

            case "move_made":
                if (message.payload.board) setBoard(message.payload.board);
                else if (message.payload.gameState?.board) setBoard(message.payload.gameState.board);
                break;

            case "player_info":
            case "player_joined":
            case "game_started":
                if (message.payload.gameState?.board) setBoard(message.payload.gameState.board);
                break;

            case "invalid_move":
                console.warn("Invalid move:", message.payload.error);
                break;
        }
    }, [ws?.lastMessage]);


    async function createGame() {
        ws?.send({ type: "init_game" });
        // if(playerId) {
        //     const data = await BackendApis.createGame(playerId);
        //     console.log('created game', data);
        // }
    }

    async function joinGame(gameId: string) {
        console.log('game id is ----------> ', gameId);
        ws?.send({ type: "join_game", payload: { gameId } });
        // if (playerId) {
        //     const data = await BackendApis.joinGame(gameId, playerId);
        //     console.log('join game response', data);
        // }
    }

    async function makeMove(from: { x: number; y: number }, to: { x: number; y: number }) {
        ws?.send({ type: "make_move", payload: { from, to } });
        // if (gameId && playerId) {
        //     const data = await BackendApis.makeMove(gameId, playerId, from, to);
        //     console.log('made move response', data);
        // }
    }

    
    return {
        board,
        setBoard,
        color,
        gameId,
        playerId,
        isConnected: ws?.isConnected ?? false,
        createGame,
        joinGame,
        makeMove,
    };
}
