import { BishopSVG, KingSVG, KnightSVG, PawnSVG, QueenSVG, RookSVG } from "../svgs/all-svgs";

export const PIECE_COMPONENTS: Record<string, React.FC<{ className?: string }>> = {
    white_king: KingSVG,
    white_queen: QueenSVG,
    white_rook: RookSVG,
    white_bishop: BishopSVG,
    white_knight: KnightSVG,
    white_pawn: PawnSVG,

    black_king: KingSVG,
    black_queen: QueenSVG,
    black_rook: RookSVG,
    black_bishop: BishopSVG,
    black_knight: KnightSVG,
    black_pawn: PawnSVG,
};