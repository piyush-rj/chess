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
    updateGame: (game: ActiveGame) => void;
};

export const useActiveGamesStore = create<ActiveGamesStore>((set) => ({
    activeGames: [],

    setActiveGames: (games) => set({ activeGames: games }),

    addGame: (game) =>
        set((state) => ({ activeGames: [...state.activeGames, game] })),

    removeGame: (gameId) =>
        set((state) => ({
            activeGames: state.activeGames.filter((g) => g.id !== gameId),
        })),

    updateGame: (game) =>
        set((state) => ({
            activeGames: state.activeGames.map((g) =>
                g.id === game.id ? { ...g, ...game } : g
            ),
        })),

}));
