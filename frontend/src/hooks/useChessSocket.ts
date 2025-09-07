"use client";
import { useContext, useEffect } from "react";
import { SocketContext } from "../provider/WebSocketProvider";
import { IncomingMessageType, Position, GameState } from "../types/types";
import { use_game_store } from "../store/useChessGameStore";

export default function useChessSocket() {
    const { lastMessage, send, isConnected } = useContext(SocketContext);
    const {
        set_player_id,
        set_game_id,
        set_player_color,
        set_connection_status,
        set_game_state,
        reset_game,
        game_id,
        player_id,
        game_state,
    } = use_game_store();

    useEffect(() => {
        set_connection_status(isConnected);
    }, [isConnected, set_connection_status]);

    useEffect(() => {
        if (!lastMessage) return;

        switch (lastMessage.type) {
            case IncomingMessageType.CONNECTION_ESTABLISHED:
                set_player_id(lastMessage.payload.playerId);
                break;

            case IncomingMessageType.GAME_CREATED:
                set_game_id(lastMessage.payload.gameId);
                set_player_color("white");
                if (lastMessage.payload.gameState) {
                    set_game_state(lastMessage.payload.gameState as GameState);
                }
                break;

            case IncomingMessageType.GAME_JOINED:
                set_game_id(lastMessage.payload.gameId);
                set_player_color(lastMessage.payload.playerColor);
                if (lastMessage.payload.gameState) {
                    set_game_state(lastMessage.payload.gameState as GameState);
                }
                break;

            case IncomingMessageType.GAME_STATE: {
                const payload = lastMessage.payload;
                const normalizedBoard = payload.board?.board || payload.board;

                set_game_state({
                    ...payload,
                    board: normalizedBoard,
                });
                break;
            }

            case IncomingMessageType.GAME_CREATED:
            case IncomingMessageType.GAME_JOINED:
                const gameState = lastMessage.payload.gameState;
                if (gameState) {
                    const normalizedBoard = gameState.board?.board || gameState.board;
                    set_game_state({
                        ...gameState,
                        board: normalizedBoard,
                    });
                }
                break;



            case IncomingMessageType.MOVE_MADE:
                if (lastMessage.payload.boardState) {
                    set_game_state({
                        ...game_state!,
                        board: lastMessage.payload.boardState,
                    });
                }
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
                reset_game();
                break;

            default:
                break;
        }
    }, [lastMessage]);

    function createGame() {
        send({ type: "create_game", payload: { playerId: player_id } });
    }

    function joinGame(gameId: string) {
        send({ type: "join_game", payload: { playerId: player_id, gameId } });
    }

    function makeMove(from: Position, to: Position) {
        send({ type: "make_move", payload: { playerId: player_id, from, to } });
    }

    function leaveGame() {
        if (game_id) {
            send({ type: "game_left", payload: { playerId: player_id, gameId: game_id } });
            reset_game();
        }
    }

    return { createGame, joinGame, makeMove, leaveGame };
}
