import { Color, PieceSymbol } from "../../types/types";

export class Piece {
    public color: Color;
    public symbol: PieceSymbol;

    constructor(color: Color, symbol: PieceSymbol) {
        this.color = color;
        this.symbol = symbol;
    }
}
