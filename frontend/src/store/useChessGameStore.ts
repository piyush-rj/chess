import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Color, GameState, Position } from "../types/types";

export interface GameStore {
    playerId: string;
    gameId: string;
    playerColor: Color;
    isConnected: boolean;
    connectionError: string | null;

    gameState: GameState | null;
    selectedSquare: Position | null;
    validMoves: Position[];

    setPlayerId: (id: string) => void;
    setGameId: (id: string) => void;
    setPlayerColor: (color: Color) => void;
    setConnectionStatus: (connected: boolean) => void;
    setConnectionError: (error: string | null) => void;

    setGameState: (state: GameState) => void;
    setSelectedSquare: (position: Position | null) => void;
    setValidMoves: (moves: Position[]) => void;

    clearSelection: () => void;
    resetGame: () => void;
}

const initialState: Omit<GameStore, keyof GameStore & string> = {
    playerId: "",
    gameId: "",
    playerColor: "WHITE",
    isConnected: false,
    connectionError: null,

    gameState: null,
    selectedSquare: null,
    validMoves: [],
};

export const useChessGameStore = create<GameStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setPlayerId: (id: string) => set({ playerId: id }),
            setGameId: (id: string) => set({ gameId: id }),
            setPlayerColor: (color: Color) => set({ playerColor: color }),
            setConnectionStatus: (connected: boolean) =>
                set({ isConnected: connected }),
            setConnectionError: (error: string | null) =>
                set({ connectionError: error }),

            // Game actions
            setGameState: (state: GameState) => set({ gameState: state }),
            setSelectedSquare: (position: Position | null) =>
                set({ selectedSquare: position }),
            setValidMoves: (moves: Position[]) => set({ validMoves: moves }),

            clearSelection: () =>
                set({
                    selectedSquare: null,
                    validMoves: [],
                }),

            resetGame: () =>
                set({
                    ...initialState,
                    playerId: get().playerId,
                }),
        }),
        {
            name: "chess-game-store",
        }
    )
);
