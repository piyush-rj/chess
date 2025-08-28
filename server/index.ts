import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import router from './src/routes';
import { ChessGameWSHandler } from './src/ChessGame/chess-game-class/ChessGameWSHandler';

const PORT = 8080;
const app = express();

const server = createServer(app);

const wss = new WebSocketServer({ server });

app.use(express.json());

app.use('/api/v1', router);

const wsHandler = new ChessGameWSHandler();

wss.on('connection', (ws) => {
    const playerId = uuidv4();
    console.log(`new ws connection: ${playerId}`);
    wsHandler.handle_connection(ws, playerId);


    ws.send(JSON.stringify({
        type: 'connection_established',
        payload: { playerId }
    }));
});

server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});