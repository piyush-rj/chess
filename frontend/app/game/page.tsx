"use client"
import { Button } from "@/components/ui/button";
import Chessboard from "@/src/components/Chessboard";
import useWebSocket from "@/src/hooks/useWebSocket";
import { MESSAGE_TYPE } from "@/src/types/web-socket-types";
import { Chess, Move } from "chess.js";
import { useEffect, useState } from "react";

export default function Game() {
    const socket = useWebSocket();
    const [chess, setChess] = useState(() => new Chess());
    const [board, setBoard] = useState(chess.board());
    const [move, setMove] = useState();

    // move: { from: string, to: string }

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log(message);

            switch (message.type) {
                case MESSAGE_TYPE.INIT_GAME:
                    const new_game = new Chess();
                    setChess(new_game);
                    setBoard(new_game.board());
                    console.log("game initialized");
                    break;
                case MESSAGE_TYPE.MOVE:
                    const move: Move = message.payload;
                    const updated_chessboard = new Chess(chess.fen());
                    updated_chessboard.move(move)
                    setChess(updated_chessboard);
                    setBoard(updated_chessboard.board);
                    console.log("made a move", move);
                    break;
                case MESSAGE_TYPE.GAME_OVER:
                    console.log("game over");
                    break;
            }
        }
    }, [chess]);

    if (!socket) {
        return <div>connecting..</div>
    }

    function handlePlay() {
        if (socket) {
            socket.send(JSON.stringify({
                type: MESSAGE_TYPE.INIT_GAME
            }));

            console.log("message sent to backend");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-neutral-950">
            <div className="flex flex-col items-center space-y-6">
                <Chessboard board={board} move={move}/>

                <Button
                    className="text-xl px-8 py-4 rounded-2xl 
                        bg-neutral-800
                        hover:bg-neutral-700
                        active:scale-95 
                        shadow-lg hover:shadow-xl
                        hover:-translate-y-0.5
                        transition-all duration-200 ease-in-out"

                    onClick={handlePlay}
                >
                    Play
                </Button>
            </div>
        </div>
    );
}
