// require("dotenv-safe").config();
import express from "express";
import { join } from "path";
// import "reflect-metadata";
// import { User } from "./entities/User";
// import { Strategy as GitHubStrategy } from "passport-github";
import cors from "cors";
// import { Todo } from "./entities/Todo";
// import { isAuth } from "./isAuth";
import * as socketio from "socket.io";

const main = async () => {
    const app = express();
    app.use(cors({ origin: "*" }));
    app.use(express.json());  // for parsing requests. 

    let server = require("http").Server(app);
    let io = require("socket.io")(server, {cors: {
        origin: "http://localhost",
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket', 'polling'],
        },
        allowEIO3: true
    });
    io.on("connection", function(client: any) {
        console.log("a user connected");

        client.on('newGame', handleNewGame); 
        client.on('joinGame', handleJoinGame); 
    });




    app.use(express.static(join(__dirname, '../public')));


    app.get('/', (_req, res) => {
        res.sendFile(join(__dirname,"../public/index.html"));
    });

    server.listen(3002, () => {
        console.log("listening on localhost:3002");
    });
};

main();

function handleNewGame() {
    console.log(`got new game request`); 
}
function handleJoinGame() {
    console.log(`got join game request`); 
}