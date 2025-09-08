"use client";
import { create } from "zustand";

export type ActiveGame = {
    id: string;
    status: string;
    currentTurn: string;
    whitePlayerId?: string | null;
    blackPlayerId?: string | null;
    startedAt?: string | null;
};

type ActiveGamesStore = {
    activeGames: ActiveGame[];
    setActiveGames: (games: ActiveGame[]) => void;
    addGame: (game: ActiveGame) => void;
    removeGame: (gameId: string) => void;
    updateActiveGame: (game: ActiveGame) => void;
};

export const useActiveGamesStore = create<ActiveGamesStore>((set) => ({
    activeGames: [],

    setActiveGames: (games) => set({ activeGames: games }),
    updateActiveGame: (game) =>
        set((state) => {
            const existingIndex = state.activeGames.findIndex((g) => g.id === game.id);
            if (existingIndex !== -1) {
                const updated = [...state.activeGames];
                updated[existingIndex] = game;
                return { activeGames: updated };
            }
            return { activeGames: [...state.activeGames, game] };
        }),

    addGame: (game) =>
        set((state) => {
            if (state.activeGames.find((g) => g.id === game.id)) return state;
            return { activeGames: [...state.activeGames, game] };
        }),

    removeGame: (gameId) =>
        set((state) => ({
            activeGames: state.activeGames.filter((g) => g.id !== gameId),
        })),


}));
