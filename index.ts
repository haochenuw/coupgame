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
import {Socket} from "socket.io"; 

import {makeid}  from "./utils"; 

let clientToRoomMapping: Map<String, String>; 
let allRooms: Array<String> = []; 

const main = async () => {
    const svelteViewEngine = require("svelte-view-engine");

    let engine = svelteViewEngine({
        env: "dev",
        template: "./public/svelte-template.html",
        dir: "./src",
        type: "svelte",
        buildDir: "../artifacts/pages",
    });

    const app = express();
    app.use(cors({ origin: "*" }));
    app.use(express.json());  // for parsing requests. 

    app.engine(engine.type, engine.render);
    app.set("view engine", engine.type);
    app.set("views", engine.dir);

    let server = require("http").Server(app);
    let io = require("socket.io")(server, {cors: {
        origin: "http://localhost",
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket', 'polling'],
        },
        allowEIO3: true
    });
    io.on("connection", function(client: Socket) {
        console.log("a user connected");

        client.on('newGame', handleNewGame); 
        client.on('joinGame', handleJoinGame); 

        function handleNewGame() {
            console.log(`got new game request`); 
            client.emit('redirect', '/lobby');
        }
        function handleJoinGame() {
            console.log(`got join game request`); 
        }
    });

    app.use(express.static(join(__dirname, '../public')));

    app.get('/create', (_, res) => {
        // create new game logic 
        // res.sendFile(join(__dirname,"../public/room.html"));
        let roomName = makeid(5); 
        allRooms.push(roomName); 
        // clientToRoomMapping[client.id] = roomName; 
        // client.emit('gameCode', roomName); 
        // state[roomName] = initGame();
        res.render("App", {
            name: roomName
        });
    }); 

    app.get('/rooms/:code', (req, res) => {
        const roomName = req.params.code; 
        console.log(`code = ${roomName}`);
        
        console.log(`allrooms = ${allRooms}`); 

        if (allRooms.includes(roomName)){
            res.render("App", {
                name: roomName
            });
        }
        else{
            res.send("room does not exist"); 
        }
        // res.sendFile(join(__dirname,"../public/template.html"));
    }); 


    app.get('/', (_req, res) => {
        res.sendFile(join(__dirname,"../public/index.html"));
    });

    server.listen(3002, () => {
        console.log("listening on localhost:3002");
    });
};

main();

