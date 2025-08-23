import { Color, PieceSymbol, Position } from "../../types/types";

export class Chess {
    private board_state: Position[][] = Array.from({ length: 8 }, () => Array<Position>(8).fill(null));
    private board_id: string;
    private turn: boolean = true;
    private move: { from: string; to: string; piece: PieceSymbol; color: Color }[] = [];

    constructor(boardId: string) {
        this.board_id = boardId;
        this.initialize_board();
    }

    private initialize_board() {
        const pieces: PieceSymbol[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

        // 0 and 1 -> black
        // 6 and 7 -> white

        for (let i = 0; i < 4; i++) {
            if (i === 3) {
                const queen = pieces[3]!;
                const king = pieces[4]!;

                this.board_state[0]![3] = { piece: queen, color: 'b' };
                this.board_state[0]![4] = { piece: king, color: 'b' };

                this.board_state[7]![3] = { piece: queen, color: 'w' };
                this.board_state[7]![4] = { piece: king, color: 'w' };

                this.board_state[1]![3] = { piece: 'p', color: 'b' };
                this.board_state[1]![4] = { piece: 'p', color: 'b' };

                this.board_state[6]![3] = { piece: 'p', color: 'w' };
                this.board_state[6]![4] = { piece: 'p', color: 'w' };
            }

            const piece = pieces[i]!;
            const repeated_piece = pieces[7 - i]!;

            this.board_state[0]![i] = { piece, color: 'b' };
            this.board_state[0]![7 - i] = { piece: repeated_piece, color: 'b' };

            this.board_state[7]![i] = { piece, color: 'w' };
            this.board_state[7]![7 - i] = { piece: repeated_piece, color: 'w' };

            this.board_state[1]![i] = { piece: 'p', color: 'b' };
            this.board_state[1]![7 - i] = { piece: 'p', color: 'b' };

            this.board_state[6]![i] = { piece: 'p', color: 'w' };
            this.board_state[6]![7 - i] = { piece: 'p', color: 'w' };
        }
    }
}
