import { GameManager } from "../chess-game-class/GameManager";

let gameManagerInstance: GameManager;

export const getGameManager = (): GameManager => {
    if (!gameManagerInstance) {
        gameManagerInstance = new GameManager();
    }
    return gameManagerInstance;
};
