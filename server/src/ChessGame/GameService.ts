import { CreateMoveJob, UpdateGameStateJob, EndGameJob } from "../queue/database-queue";
import { databaseQueueInstance, redisCacheInstance } from "../services/init-services";
import { GameStatusEnum, Position } from "../types/websocket-types";
import { getGameManager } from "./chess-game-singleton/singleton";


export class GameService {
    private gameManager = getGameManager();

    constructor() { }

    public async createGame(playerId: string) {
        const game = await this.gameManager.create_game(playerId);
        const gameId = game.gameId;

        game.add_player(playerId);

        await redisCacheInstance.set_game(gameId, {
            gameId,
            boardState: game.get_game_state().board,
            currentTurn: game.get_game_state().currentPlayer,
            status: game.get_game_state().gameStatus,
            whitePlayerId: playerId,
        });

        const updateJob: UpdateGameStateJob = {
            gameId,
            boardState: game.get_game_state().board,
            currentTurn: game.get_game_state().currentPlayer,
            status: game.get_game_state().gameStatus,
        };
        await databaseQueueInstance.enqueue_update_game_staet(updateJob, {});

        return { gameId, playerColor: "white" };
    }

    public async joinGame(gameId: string, playerId: string) {
        const result = await this.gameManager.join_game(gameId, playerId);
        return result.success ? { success: true, playerColor: result.result.color } : { success: false, error: result.error };
    }

    public async saveMove(playerId: string, from: Position, to: Position) {
        const game = this.gameManager.get_player_game(playerId);
        if (!game) return { success: false, error: "game not found" };

        const result = await this.gameManager.make_move(playerId, from, to);
        return result?.success ? { success: true, move: result.move } : { success: false, error: result?.error };
    }

    public async getGameState(gameId: string) {
        const game = this.gameManager.get_game(gameId);
        return game ? game.get_game_state() : null;
    }
}
