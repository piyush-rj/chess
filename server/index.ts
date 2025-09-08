import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import router from "./src/routes";
import initServices from "./src/services/init-services";
import { ChessWebSocketServer } from "./src/socket/ChessWebSocketServer";

dotenv.config();
const PORT = process.env.PORT;

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({
    origin: "*"
}));


app.use("/api/v1", router);

initServices();
new ChessWebSocketServer(server);


server.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
});
