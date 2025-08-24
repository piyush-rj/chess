// import { Board } from "../ChessGame/board/Board";

// export class ChessManager {
//     private game: Board;
//     private players: { white?: string; black: string } = {};

//     constructor() {
//         this.game = new Board();
//     }

//     public addPlayer(playerId: string) {
//         if (!this.players.white) this.players.white = playerId;
//         else if (!this.players.black) this.players.black = playerId;
//         else throw new Error("Game already has 2 players");
//     }

//     public handleMove(playerId: string, from: string, to: string) {
//         // You can check if it's that player’s turn
//         this.game.move_piece(from, to);
//         return this.game.get_board_state();
//     }
// }