// "use client";
// import { useChessStore } from "../store/useChessGameStore";

// export default function GameStatusDisplay() {
//     const { 
//         gameStatus, 
//         currentTurn, 
//         color, 
//         winner, 
//         whitePlayer, 
//         blackPlayer, 
//         playerId,
//         isMyTurn,
//         isGameOver 
//     } = useChessStore();

//     const getStatusMessage = () => {
//         switch (gameStatus) {
//             case "WAITING":
//                 return {
//                     message: "Waiting for another player to join...",
//                     color: "text-yellow-600",
//                     bgColor: "bg-yellow-50 border-yellow-200"
//                 };
            
//             case "ACTIVE":
//                 const turnMessage = isMyTurn() ? "Your turn" : `${currentTurn === "WHITE" ? "White" : "Black"}'s turn`;
//                 return {
//                     message: turnMessage,
//                     color: isMyTurn() ? "text-green-600" : "text-blue-600",
//                     bgColor: isMyTurn() ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
//                 };
            
//             case "CHECK":
//                 const inCheckPlayer = currentTurn === "WHITE" ? "White" : "Black";
//                 const isPlayerInCheck = currentTurn === color;
//                 const checkMessage = isPlayerInCheck ? "You are in check!" : `${inCheckPlayer} is in check`;
//                 return {
//                     message: checkMessage,
//                     color: isPlayerInCheck ? "text-red-600" : "text-orange-600",
//                     bgColor: isPlayerInCheck ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"
//                 };
            
//             case "CHECKMATE":
//                 const checkmateWinner = currentTurn === "WHITE" ? "Black" : "White";
//                 const didIWin = (currentTurn !== color);
//                 const checkmateMessage = didIWin ? "Checkmate! You won!" : `Checkmate! ${checkmateWinner} wins`;
//                 return {
//                     message: checkmateMessage,
//                     color: didIWin ? "text-green-600" : "text-red-600",
//                     bgColor: didIWin ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
//                 };
            
//             case "STALEMATE":
//                 return {
//                     message: "Stalemate! It's a draw",
//                     color: "text-gray-600",
//                     bgColor: "bg-gray-50 border-gray-200"
//                 };
            
//             case "ENDED":
//                 const endMessage = winner 
//                     ? (winner === playerId ? "You won!" : "You lost") 
//                     : "Game ended";
//                 return {
//                     message: endMessage,
//                     color: winner === playerId ? "text-green-600" : "text-red-600",
//                     bgColor: winner === playerId ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
//                 };
            
//             default:
//                 return {
//                     message: "Unknown game status",
//                     color: "text-gray-600",
//                     bgColor: "bg-gray-50 border-gray-200"
//                 };
//         }
//     };

//     const getGameInfo = () => {
//         const info = [];
        
//         if (whitePlayer && blackPlayer) {
//             info.push(`White: ${whitePlayer === playerId ? 'You' : 'Opponent'}`);
//             info.push(`Black: ${blackPlayer === playerId ? 'You' : 'Opponent'}`);
//         }
        
//         if (color) {
//             info.push(`You are playing as ${color === "WHITE" ? "White" : "Black"}`);
//         }
        
//         return info;
//     };

//     const statusInfo = getStatusMessage();
//     const gameInfo = getGameInfo();

//     return (
//         <div className="w-full max-w-md mx-auto space-y-3">
//             {/* Main Status */}
//             <div className={`
//                 p-4 rounded-lg border-2 text-center font-semibold
//                 ${statusInfo.bgColor} ${statusInfo.color}
//                 transition-all duration-300
//             `}>
//                 <div className="text-lg">
//                     {statusInfo.message}
//                 </div>
                
//                 {gameStatus === "CHECK" && (
//                     <div className="text-sm mt-1 font-normal">
//                         The king must be moved to safety!
//                     </div>
//                 )}
                
//                 {isGameOver && gameStatus !== "ENDED" && (
//                     <div className="text-sm mt-2 font-normal">
//                         Game Over
//                     </div>
//                 )}
//             </div>

//             {/* Game Info */}
//             {gameInfo.length > 0 && (
//                 <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
//                     <div className="text-sm text-gray-600 space-y-1">
//                         {gameInfo.map((info, index) => (
//                             <div key={index}>{info}</div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* Debug Info (remove in production) */}
//             <div className="text-xs text-gray-400 space-y-1 p-2 bg-gray-50 rounded">
//                 <div>Status: {gameStatus}</div>
//                 <div>Turn: {currentTurn}</div>
//                 <div>Your Color: {color || 'None'}</div>
//                 <div>Is My Turn: {isMyTurn() ? 'Yes' : 'No'}</div>
//                 <div>Game Over: {isGameOver ? 'Yes' : 'No'}</div>
//                 {winner && <div>Winner: {winner}</div>}
//             </div>
//         </div>
//     );
// }