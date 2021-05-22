// require("dotenv-safe").config();
import express from "express";
import { join } from "path";
// import "reflect-metadata";
// import { User } from "./entities/User";
// import { Strategy as GitHubStrategy } from "passport-github";
import cors from "cors";
// import { Todo } from "./entities/Todo";
// import { isAuth } from "./isAuth";
import {Socket} from "socket.io"; 

import {makeid}  from "./utils"; 
import { RoomStatus } from "./types";
import {initGame} from "./game"; 


let allRooms: Array<string> = []; 
let roomNameToStatusMap = {}; 
const clientToRoomMapping = {};  

const MAX_PLAYERS: Number = 2; 

const main = async () => {
    // const svelteViewEngine = require("svelte-view-engine");

    // let engine = svelteViewEngine({
    //     env: "dev",
    //     template: "./public/svelte-template.html",
    //     dir: "./src",
    //     type: "svelte",
    //     buildDir: "../artifacts/pages",
    // });

    const app = express();
    app.use(cors({ origin: "*" }));
    app.use(express.json());  // for parsing requests. 
    app.set('views', join(__dirname, '/../public/views'));
    app.set('view engine', 'ejs');

    // app.engine(engine.type, engine.render);
    // app.set("view engine", engine.type);
    // app.set("views", engine.dir);

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
        console.log('a client has connected'); 
        // console.log(`a user has connected with query ${JSON.stringify(client.handshake.query)}`);
        let room = client.handshake.query.room as string;

        // set the mapping. 
        clientToRoomMapping[client.id] = room; 
        // debug
        console.log(`roomname = ${client.handshake.query.room}`);
        console.log(`status = ${JSON.stringify(roomNameToStatusMap)}`)
        console.log(`allrooms = ${JSON.stringify(allRooms)}`)


        if (!roomNameToStatusMap[room]){
            client.emit('noRoom'); 
            return; 
        }
        let roomStatus = roomNameToStatusMap[room]; 
        if (roomStatus.numPlayers > MAX_PLAYERS){
            client.emit('tooManyPlayers'); 
            return; 
        }
        client.join(room);
        if (roomStatus.numPlayers == 0){
            roomStatus.playerOneId = client.id; 
        } else if (roomStatus.numPlayers == 1){
            roomStatus.playerTwoId = client.id; 
        }
        roomStatus.numPlayers += 1; 
        // TODO: emit the id to all clients in the room. 
        io.sockets.in(room).emit('roomStatus', JSON.stringify(roomStatus)); 

        // client.on('newGame', handleNewGame); 
        // client.on('joinGame', handleJoinGame); 
        client.on('start', handleStartGame); 
        // function handleNewGame() {
        //     console.log(`got new game request`); 
        //     let roomName = makeid(5); 
        //     allRooms.push(roomName); 

        //     // joining the room per socket.io api. 
        //     client.join(roomName); 
        //     // send the roomName to client. 
        //     client.emit('gameCode', JSON.stringify({"room": roomName, "client": client.id}));  
        // }
        // function handleJoinGame() {
        //     console.log(`got join game request`); 
        // }
        function handleStartGame(){
            console.log(`got start game request`); 
            const roomName = clientToRoomMapping[client.id]; 
            if (!roomName) return; 
            let initialGameState = initGame(); 
            // broadcast
            io.sockets.in(roomName).emit('gameState', JSON.stringify({initialGameState})); 
        }
    });
    app.use(express.static(join(__dirname, '../public')));

    app.get('/newgame', (_, res) => {
        console.log('got new game request'); 
        let roomName = makeid(5); 
        allRooms.push(roomName); 
        let roomStatus: RoomStatus = {
            name: roomName, 
            playerOneId: null, 
            playerTwoId: null, 
            numPlayers: 0, 
        }
        roomNameToStatusMap[roomName] = roomStatus; 
        console.log("status = " + JSON.stringify(roomNameToStatusMap));
        // redirect to room page. 
        res.redirect('/rooms/' + roomName); 
    })


    app.post('/create', (_, res) => {
        // create new game logic 
        // res.sendFile(join(__dirname,"../public/room.html"));
        console.log(`Got post request`); 
        res.send('post response'); 
        // let roomName = makeid(5); 
        // allRooms.push(roomName); 
        // // clientToRoomMapping[client.id] = roomName; 
        // // client.emit('gameCode', roomName); 
        // // state[roomName] = initGame();
        // res.render("App", {
        //     name: roomName
        // });
    }); 

    app.get('/rooms/:code', (req, res) => {
        const roomName = req.params.code; 
        if (allRooms.includes(roomName)){
            res.render("room", {
                roomName: roomName, 
                player1: "Null", 
                player2: "Null", 
            });
            // res.render("App", {
            //     name: roomName, 
            // });
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

