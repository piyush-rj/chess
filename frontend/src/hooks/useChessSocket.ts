"use client";
import { useContext, useEffect } from "react";
import { SocketContext } from "../provider/WebSocketProvider";
import { IncomingMessageType, Position, WebSocketSendMessage } from "../types/types";
import { useChessGameStore } from "../store/useChessGameStore";
import { useUserSessionStore } from "../store/useUserSessionStore";
import axios from "axios";
import { GET_ACTIVE_GAME_URL } from "../backend-utils/api-routes";
import { useActiveGamesStore } from "../store/useActiveGameStore";

export default function useChessSocket() {
    const { lastMessage, send, isConnected } = useContext(SocketContext);
    const { setActiveGames } = useActiveGamesStore();
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
    const { session } = useUserSessionStore();

    useEffect(() => {
        const fetchActiveGames = async () => {
            if (!session) return;

            const playerId = session.user.id;

            try {
                const response = await axios.get(GET_ACTIVE_GAME_URL, {
                    params: { playerId },
                });

                if (response.data.success) {
                    setActiveGames(response.data.activeGames);
                }
            } catch (error) {
                console.error("Error in fetching games: ", error);
            }
        };
        fetchActiveGames();
    }, [session, setActiveGames]);

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
