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
import { RoomStatus,GameState, PlayerState, Card, Action} from "./types";
import {initGame} from "./game"; 
import {INCOME_RATE, COUP_COST} from "./constants"; 

let allRooms: Array<string> = []; 
let roomNameToStatusMap = {}; 
const clientToRoomMapping = {};  
let states = {}; 

const MAX_PLAYERS: number = 2; 

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
    const http = require('http');
    const server = http.createServer(app);
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
        client.emit('playerIndex', roomStatus.numPlayers); 
        roomStatus.numPlayers += 1; 

        io.sockets.in(room).emit('roomStatus', JSON.stringify(roomStatus)); 

        client.on('start', handleStartGame); 
        
        client.on('action', handlePlayerAction); 


        function handleStartGame(){
            console.log(`got start game request`); 
            const roomName: string = clientToRoomMapping[client.id]; 
            if (!roomName) return; 
            // TODO find all users 
            console.log(io.sockets.adapter.rooms);
            // console.log(`roomName = ${roomName}`);
            // const room = io.sockets.adapter.rooms.get(roomName); 
            // if (!room){
            //     console.log('no room found'); 
            //     return; 
            // }
            // console.log(`found room = ${room}`);
            // let allUsers = room.sockets; 
            let gameStatus = roomNameToStatusMap[roomName]

            let initialGameState = initGame([gameStatus.playerOneId, gameStatus.playerTwoId]); 
            states[roomName] = initialGameState; 
            // broadcast
            io.sockets.in(roomName).emit('gameState', JSON.stringify({initialGameState})); 
        }

        function handlePlayerAction(action) {
            console.log(action); 
            // found room 
            let roomName = clientToRoomMapping[client.id]; 
            if (!roomName){
                return; 
            }
            

            let gameState = states[roomName]; 
            if (!isValidAction(action, client.id, gameState)){
                console.log('invalid action'); 
                return; 
            }   
            
            // resolve challenges and blocks. 
            resolveReactions((ok: boolean)=>{
                // save new game state
                if (ok){
                    let newGameState = changeState(gameState, action);
                    states[roomName] = newGameState; 
                    swapPlayers(newGameState); 

                    let winner = checkForWin(newGameState);
                    if (winner === null){
                        // broadcast new game state 
                        io.sockets.in(roomName).emit('gameState', JSON.stringify(newGameState)); 
                    } else{
                        io.sockets.in(roomName).emit('gameOver', {"winner": winner}); 
                    }
                }
            }); 
        }

        function checkForWin(gameState: GameState): number | null{
            let remainingPlayers = 0; 
            let remainingPlayerIndex = -1; 
            for (let i = 0; i <  gameState.playerStates.length; i++){
                if (gameState.playerStates[i].lifePoint !=0){
                    remainingPlayers++; 
                    remainingPlayerIndex = i; 
                }
            }
            if (remainingPlayers == 1){
                return remainingPlayerIndex;
            }
            return null; 
        }

        async function resolveReactions(callback: (ok: boolean)=> void){
            callback(true); 
        }

        function swapPlayers(gameState: GameState){
            gameState.activePlayerIndex += 1;      
            gameState.activePlayerIndex %= MAX_PLAYERS; 
        }

        function changeState(gameState: GameState, action): GameState{
            // parse to enum. Based on enum. Change stuff. 
            var parsedAction: Action = Action[action.name]; 
            console.log(`parsed action = ${parsedAction}`); 
            console.log(`state = ${JSON.stringify(gameState)}`); 
            switch (parsedAction) {
                case Action.Income:
                    console.log("Income action");
                    gameState.playerStates[gameState.activePlayerIndex].tokens += INCOME_RATE; 
                    break;
                case Action.Coup: 
                    console.log("Coup action");
                    // TODO validate 
                    gameState.playerStates[action.target].lifePoint -= 1; 
                    gameState.playerStates[gameState.activePlayerIndex].tokens -= COUP_COST; 
                    break; 
                default:
                    console.log("No such action exists!");
                    break;
            }

            return gameState; 
        }

        function isValidAction(action, clientId: string, state: GameState){
            if (clientId === state.playerIds[state.activePlayerIndex]){
                return true; 
            } else{
                console.log("Invalid action: not your turn"); 
                return false; 
            }
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

