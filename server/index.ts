import { WebSocketGameServer } from "./src/socket/WebSocketServer";

const PORT = 8080;
const server = new WebSocketGameServer(PORT);
server.start();

