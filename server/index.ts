import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import router from "./src/routes";
import { ChessGameWSHandler } from "./src/ChessGame/chess-game-class/ChessGameWSHandler";
import { init_services } from "./src/services/init-services";

const PORT = process.env.PORT;
const app = express();
const server = createServer(app);
init_services();

const wss = new WebSocketServer({ server });
new ChessGameWSHandler(wss);

app.use(express.json());
app.use("/api/v1", router);

server.listen(PORT, () => console.log(`server running on port ${PORT}`));
