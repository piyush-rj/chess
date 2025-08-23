import express from "express";
import http from "http";
import { WebSocketService } from "./src/game-manager/socket/WebSocketServer";

const PORT = 8080;
const app = express();
const server = http.createServer(app);

new WebSocketService(server);

server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});

