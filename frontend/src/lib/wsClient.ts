let socket: WebSocket | null;
let members: ((msg: any) => void)[] = []

export default function WSClient () {
    socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
        console.log("ws connected");
    }

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data.toString());

        console.log("ws message is: ", message);
        members.forEach((m) => m(message));
    }

    socket.onclose = () => {
        console.log('ws disconnected');
    }
}

export function onMessage(callback: (msg: any) => void) {
    members.push(callback);
    return () => {
        members = members.filter((m) => m !== callback);
    }
}

function sendMessage(type: string, payload?: any) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type, payload }));
    } else {
        console.error('ws error in sending msg');
    }
}

export function createGame() {
    sendMessage('init_game');
}

export function joinGame(gameId: string) {
    sendMessage('join_game', { gameId });
}

export function makeMove(from: { x: number, y: number }, to: {x: number, y: number }) {
    sendMessage('make_move', { from, to });
}

export function getValidMoves(position: { x: number, y: number }) {
    sendMessage('get_valid_moves', { position })
}