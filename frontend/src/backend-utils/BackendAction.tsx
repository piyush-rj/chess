import axios from "axios";
import { CREATE_GAME_URL, JOIN_GAME_URL, MAKE_MOVE_URL } from "./api-routes";

export async function createGame(playerId: string) {
    try {
        const response = await axios.post(
            CREATE_GAME_URL,
            { playerId },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error in creating game:", error);
    }
}

export async function joinGame(gameId: string, playerId: string) {
    try {
        const response = await axios.post(
            JOIN_GAME_URL,
            { gameId, playerId },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error in joining game:", error);
    }
}

export async function makeMove(
    gameId: string,
    playerId: string,
    from: { x: number; y: number },
    to: { x: number; y: number }
) {
    try {
        const response = await axios.post(
            MAKE_MOVE_URL,
            { gameId, playerId, from, to },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error in making move:", error);
    }
}
