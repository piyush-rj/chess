import { Game } from "./Game";

export class GameManager {
    private games = new Map<string, Game>();
    private playerGameMap =  new Map<string, string>();

    constructor() {};

    public create_game(gameId?: string) {
        const id = gameId || this.generate_game_id();
        const game = new Game(id);
        this.games.set(id, game);
        return id;
    }

    public leave_game(player_id: string): void {
        const gameId = this.playerGameMap.get(player_id);
        if(gameId) {
            const game = this.games.get(gameId);
            if (game) {
                game.remove_player(player_id);
            }
            this.playerGameMap.delete(player_id);
        }
    }

    public join_game(gameId: string, player_id: string): {
        success: boolean,
        result?: any,
        error?: string,
    } {
        const game = this.games.get(gameId);
        if(!game) {
            return {
                success: true,
                error: 'gamenot found'
            }
        }

        const previousGameId = this.playerGameMap.get(player_id);
        if(previousGameId) {
            this.leave_game(player_id);
        }

        const result = game.add_player(player_id);
        this.playerGameMap.set(player_id, gameId);

        return {
            success: true,
            result
        }
    }

    public get_game(gameId: string): Game | undefined {
        return this.games.get(gameId);
    }

    public get_player_game(playerId: string): Game | undefined {
        const gameId = this.playerGameMap.get(playerId);
        return gameId ? this.games.get(gameId) : undefined;
    }

    private generate_game_id(): string {
        return Math.random().toString(36).substring(2, 15);
    }
}