import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import router from './src/routes';
import { ChessGameWSHandler } from './src/ChessGame/chess-game-class/ChessGameWSHandler';
import { ws_handler } from './src/ChessGame/chess-game-singleton/singleton';

const PORT = 8080;
const app = express();

const server = createServer(app);

const wss = new WebSocketServer({ server });

app.use(express.json());

app.use('/api/v1', router);

wss.on('connection', (ws) => {
    const playerId = uuidv4();
    ws_handler.handle_connection(ws, playerId);

    ws.send(JSON.stringify({
        type: 'connection_established',
        payload: { playerId }
    }));
});



server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});