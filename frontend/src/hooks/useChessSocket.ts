import { useEffect, useRef, useState } from 'react';
import { Piece } from '../lib/boardSetup';

export default function useChessSocket() {
    const socketRef = useRef<WebSocket | null>(null);
    const [gameId, setGameId] = useState('');
    const [board, setBoard] = useState<Piece[][]>([]);
    const [color, setColor] = useState<'white' | 'black' | null>(null);
    const [playerId, setPlayerId] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('ws connected');
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('ws message ---------------------->  ', message);

            switch (message.type) {
                case 'connection_established':
                    setPlayerId(message.payload.playerId);
                    break;

                case 'game_created':
                    setGameId(message.payload.gameId);
                    setColor(message.payload.color);
                    if (message.payload.board) {
                        console.log('setting board from game creation -----> ', message.payload.board);
                        setBoard(message.payload.board);
                    }
                    break;

                case 'game_joined':
                    setGameId(message.payload.gameId);
                    setColor(message.payload.color);
                    if (message.payload.board) {
                        console.log('setting board from game joined -----> ', message.payload.board);
                        setBoard(message.payload.board);
                    }
                    break;

                case 'move_made':
                    // Prioritize the most direct board state
                    if (message.payload.board) {
                        console.log('setting board from move_made -----> ', message.payload.board);
                        setBoard([...message.payload.board.map((row: Piece[]) => [...row])]);
                    } else if (message.payload.gameState?.board) {
                        console.log('setting board from move_made gameState -----> ', message.payload.gameState.board);
                        setBoard([...message.payload.gameState.board.map((row: Piece[]) => [...row])]);
                    }
                    break;

                case 'player_info':
                    setColor(message.payload.yourColor);
                    if (message.payload.gameState?.board) {
                        console.log('setting board from player_info -----> ', message.payload.gameState.board);
                        setBoard([...message.payload.gameState.board.map((row: Piece[]) => [...row])]);
                    }
                    break;

                case 'player_joined':
                    if (message.payload.gameState?.board) {
                        console.log('setting board from player_joined -----> ', message.payload.gameState.board);
                        setBoard([...message.payload.gameState.board.map((row: Piece[]) => [...row])]);
                    }
                    break;

                case 'game_started':
                    if (message.payload.gameState?.board) {
                        console.log('setting board from game_started -----> ', message.payload.gameState.board);
                        setBoard([...message.payload.gameState.board.map((row: Piece[]) => [...row])]);
                    }
                    break;

                case 'invalid_move':
                    console.warn('Invalid move:', message.payload.error);
                    // Don't update board state for invalid moves
                    break;

                default:
                    console.warn('Unhandled message type:', message.type);
            }
        };

        socket.onclose = () => {
            console.log('ws disconnected');
            setIsConnected(false);
        };

        return () => {
            socket.close();
        };
    }, []);

    function sendMessage(type: string, payload?: any) {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type, payload }));
        } else {
            console.error('ws not open, cannot send');
        }
    }

    function createGame() {
        sendMessage('init_game');
    }

    function joinGame(gameId: string) {
        sendMessage('join_game', { gameId });
    }

    function makeMove(from: { x: number; y: number }, to: { x: number; y: number }) {
        // const newBoard = board.map(row => [...row]);
        // const piece = newBoard[from.y][from.x];
        // newBoard[to.y][to.x] = piece;
        // newBoard[from.y][from.x] = null;
        // setBoard(newBoard);

        sendMessage('make_move', { from, to });
    }

    return {
        board,
        setBoard,
        color,
        gameId,
        playerId,
        isConnected,
        createGame,
        joinGame,
        makeMove,
    };
}