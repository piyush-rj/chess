import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Color, GameState, Position } from "../types/types";

export interface GameStore {
    player_id: string;
    game_id: string;
    player_color: Color;
    is_connected: boolean;
    connection_error: string | null;

    game_state: GameState | null;
    selected_square: Position | null;
    valid_moves: Position[];

    set_player_id: (id: string) => void;
    set_game_id: (id: string) => void;
    set_player_color: (color: Color) => void;
    set_connection_status: (connected: boolean) => void;
    set_connection_error: (error: string | null) => void;

    set_game_state: (state: GameState) => void;
    set_selected_square: (position: Position | null) => void;
    set_valid_moves: (moves: Position[]) => void;

    clear_selection: () => void;
    reset_game: () => void;
}

const initial_state: Omit<GameStore, keyof GameStore & string> = {
    player_id: "",
    game_id: "",
    player_color: "white",
    is_connected: false,
    connection_error: null,

    game_state: null,
    selected_square: null,
    valid_moves: [],
};

export const use_game_store = create<GameStore>()(
    devtools(
        (set, get) => ({
            ...initial_state,

            // Connection actions
            set_player_id: (id: string) => set({ player_id: id }),
            set_game_id: (id: string) => set({ game_id: id }),
            set_player_color: (color: Color) => set({ player_color: color }),
            set_connection_status: (connected: boolean) =>
                set({ is_connected: connected }),
            set_connection_error: (error: string | null) =>
                set({ connection_error: error }),

            // game actions
            set_game_state: (state: GameState) => set({ game_state: state }),
            set_selected_square: (position: Position | null) =>
                set({ selected_square: position }),
            set_valid_moves: (moves: Position[]) => set({ valid_moves: moves }),

            clear_selection: () =>
                set({
                    selected_square: null,
                    valid_moves: [],
                }),

            reset_game: () =>
                set({
                    ...initial_state,
                    player_id: get().player_id,
                }),
        }),
        {
            name: "chess-game-store",
        }
    )
);
