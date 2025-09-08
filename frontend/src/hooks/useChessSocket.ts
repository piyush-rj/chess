"use client";
import { useContext, useEffect } from "react";
import { SocketContext } from "../provider/WebSocketProvider";
import { IncomingMessageType, Position, WebSocketSendMessage } from "../types/types";
import { useChessGameStore } from "../store/useChessGameStore";

export default function useChessSocket() {
    const { lastMessage, send, isConnected } = useContext(SocketContext);
    const {
        setPlayerId,
        setGameId,
        setPlayerColor,
        setConnectionStatus,
        setGameState,
        resetGame,
        gameId,
        playerId,
        gameState,
    } = useChessGameStore();

    useEffect(() => {
        setConnectionStatus(isConnected);
    }, [isConnected, setConnectionStatus]);

    useEffect(() => {
        if (!lastMessage) return;

        const normalizeBoard = (boardPayload: any) => {
            if (!boardPayload) return [];
            if (Array.isArray(boardPayload)) return boardPayload;
            if (Array.isArray(boardPayload.board)) return boardPayload.board;
            return [];
        };

        switch (lastMessage.type) {
            case IncomingMessageType.CONNECTION_ESTABLISHED:
                setPlayerId(lastMessage.payload.playerId);
                break;

            case IncomingMessageType.GAME_CREATED:
                setGameId(lastMessage.payload.gameId);
                setPlayerColor("WHITE");
                if (lastMessage.payload.gameState) {
                    setGameState({
                        ...lastMessage.payload.gameState,
                        board: normalizeBoard(lastMessage.payload.gameState.board)
                    });
                }
                break;

            case IncomingMessageType.GAME_JOINED:
                setGameId(lastMessage.payload.gameId);
                setPlayerColor(lastMessage.payload.playerColor);
                if (lastMessage.payload.gameState) {
                    setGameState({
                        ...lastMessage.payload.gameState,
                        board: normalizeBoard(lastMessage.payload.gameState.board)
                    });
                }
                break;

            case IncomingMessageType.GAME_STATE:
                const payload = lastMessage.payload;
                setGameState({
                    ...payload,
                    board: normalizeBoard(payload.board),
                });
                break;

            case IncomingMessageType.MOVE_MADE:
                setGameState({
                    ...gameState!,
                    board: normalizeBoard(lastMessage.payload.boardState),
                });
                // if (lastMessage.payload.capturedPieces) {
                //     setCapturedPieces(lastMessage.payload.capturedPieces);
                // }
                // break;
                break;

            case IncomingMessageType.OPPONENT_JOINED:
                console.log("Opponent joined:", lastMessage.payload.playerId);
                break;

            case IncomingMessageType.INVALID_MOVE:
            case IncomingMessageType.MOVE_FAILED:
                console.warn("Move failed:", lastMessage.payload.error);
                break;

            case IncomingMessageType.GAME_ENDED:
                console.log("Game ended:", lastMessage.payload.message);
                resetGame();
                break;

            default:
                break;
        }
    }, [lastMessage]);

    function createGame() {
        send({
            type: WebSocketSendMessage.CREATE_GAME,
            payload: { playerId }
        });
    }

    function joinGame(gameId: string) {
        send({
            type: WebSocketSendMessage.JOIN_GAME,
            payload: { playerId, gameId }
        });
    }

    function makeMove(from: Position, to: Position) {
        send({
            type: WebSocketSendMessage.MAKE_MOVE,
            payload: { playerId, from, to }
        });
    }

    function leaveGame() {
        if (gameId) {
            send({
                type: WebSocketSendMessage.LEAVE_GAME,
                payload: { playerId, gameId }
            });
            resetGame();
        }
    }

    return {
        createGame,
        joinGame,
        makeMove,
        leaveGame
    };
}
