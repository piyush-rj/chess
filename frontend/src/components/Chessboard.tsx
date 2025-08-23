import { Color, PieceSymbol, Square } from "chess.js";

export default function Chessboard({ board }: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
}) {


  const pieceIcons: Record<string, string> = {
    wp: "♙", wr: "♖", wn: "♘", wb: "♗", wq: "♕", wk: "♔",
    bp: "♟", br: "♜", bn: "♞", bb: "♝", bq: "♛", bk: "♚"
  };

  return (
    <div className="h-[640px] w-[640px] bg-neutral-800 rounded-xl p-2 flex flex-col">
      {board.map((row, i) => (
        <div key={i} className="flex flex-1">
          {row.map((square, j) => {
            const isLight = (i + j) % 2 === 0;
            const bgColor = isLight ? "bg-neutral-400" : "bg-neutral-900";

            let piece = "";
            if (square) {
              const key = `${square.color}${square.type}` as keyof typeof pieceIcons;
              piece = pieceIcons[key];
            }

            return (
              <div
                key={j}
                className={`flex-1 flex items-center justify-center text-2xl ${bgColor}`}
              >
                {piece}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
