// require("dotenv-safe").config();
import express from "express";
import { join } from "path";
import cors from "cors";
import {Socket, Namespace} from "socket.io"; 
import {makeid, logInfo, logError, logDebug, renderLog}  from "./utils"; 
import { RoomStatus,GameState, RoundState, PlayerState, Card, Action, PlayerAction, isChallengeable, isBlockable} from "./types";
import {initGame, shuffle, commitAction, isValidAction, checkForWinner, maskState, computeAlivePlayers, handleAction} from "./game"; 
import { parse } from "path/posix";
import * as constants from "./constants"; 


let namespaces = {}; //AKA party rooms
let roomNameToStatusMap = {}; 
let roomNameToRematchRequests = {}; 
let allRooms: Array<string> = []; 
const clientToRoomMapping = {};  
let states: Record<string, GameState> = {}; 

const main = async () => {
    const app = express();
    app.use(cors({ origin: "*" }));
    app.use(express.json());  // for parsing requests. 

    app.use(cors());
    app.use(
        express.urlencoded({
          extended: true
        })
      )
      
    app.use(express.json())

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

    app.use(express.static(join(__dirname, '../../client/build')));

    app.get('/', (req, res) => {
        res.sendFile(join(__dirname+'/../../client/build/index.html'));
    });

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

    app.get('/createRoom', function (req, res) { 
        let newRoom = '';
        while(newRoom === '' || (newRoom in namespaces)) {
            newRoom = makeid(5); 
        }
        const newSocket: Namespace = io.of(`/${newRoom}`);
        openSocket(newSocket, `/${newRoom}`);
        namespaces[newRoom] = null;
        console.log(newRoom + " CREATED")
        res.json({room: newRoom});
    })

    // Check if room exists
    app.get('/checkRoom', function (req, res) { 
        console.log(`checkRoom is hit with ${JSON.stringify(req.query)}`)
        res.json({doesRoomExist: (req.query.roomName as string) in namespaces})
    })

    // React: handle socket
    function openSocket(socket, namespace) {
        let players = []; 
        let gameInProgress = false; 
        let gameState = null; 
        socket.on('connection', client => {
            
            logInfo(`id: ${client.id} connected to namespace ${namespace}`);
            logInfo(`query = ${JSON.stringify(client.handshake.query)}`);
            
            if (players.length >= constants.MAX_PLAYERS){
                logError("too many players")
                socket.emit('roomFull'); 
                return; 
            }

            if (gameInProgress){
                // check if player name is in the list of disconnected ones. 
                logError("game has already started"); 
                client.emit('gameInProgress'); 
                return; 
            }

            players.push({
                "socket_id": `${client.id}`,
                "isReady": false, 
                "connected": true 
            })
            client.join(namespace);

            client.on('disconnect', () => {
                const index = players.findIndex(player => player.socket_id === client.id)
                logInfo(`socket ${client.id} disconnected`);
                logDebug(`playerstates = ${JSON.stringify(gameState.playerStates)}`);
                logDebug(`players = ${JSON.stringify(players)}`);
                if (index === -1){
                    logError("Client Not found"); 
                    return; 
                }
                if (gameInProgress){
                       logInfo("Setting connected to false"); 
                       gameState.playerStates[index].connected = false; 
                       sendMaskedGameStates(socket, gameState, 'gameState'); 
                } else {
                    // remove from list of players 
                    players.splice(index, 1); 
                }
            });
            
            client.on('setName', playerName => {
                logDebug(`players = ${JSON.stringify(players)}`); 
                let player = players.find(player => player.socket_id === client.id)
                if (player !== undefined){
                    // reject if name is duplicate 
                    let nameExists = players.find(player => player.name === playerName); 
                    if (nameExists !== undefined){
                        logDebug("name is duplicate"); 
                        client.emit('nameExists', playerName); 
                    } else{
                        logDebug(`player ${player.socket_id} set their name to be ${playerName}`); 
                        player.name = playerName; 
                        socket.emit('playersUpdate', players);
                    }
                }
            });

            client.on('playerReady', () => {
                console.log(`${client.id} is ready`)
                players.forEach(player => {
                    if (player.socket_id === client.id){
                        player.isReady = true; 
                    }
                })
                socket.emit('playersUpdate', players) ;
            })

            client.on('startGame', () => {
                if(players.length < constants.MIN_PLAYERS || players.length > constants.MAX_PLAYERS){
                    logError('number of players too small or too large'); 
                    socket.emit('error', 'Wrong number of players'); 
                    return; 
                } 
                console.log(`${client.id} starts game for room ${namespace}`)
                gameInProgress = true; 
                gameState = initGame(players); 
                sendMaskedGameStates(socket, gameState, 'startGameResponse'); 
            })

            client.on('action', (action) => {
                logInfo(`Got action = ${JSON.stringify(action)} from player ${client.id}`); 

                if (!isValidAction(action, client.id, gameState)){
                    logError("Action is Invalid"); 
                    client.emit("clientError"); 
                    return; 
                } 

                logInfo(`Round state = ${gameState.roundState}`); 

                gameState = handleAction(gameState, action as PlayerAction); 
                logDebug('gameState after handling action...'); 

                let winner = checkForWinner(gameState);
                if (winner !== null){
                    gameInProgress = false; 
                    socket.emit('gameOver', winner); 
                }
                logDebug(`Changed Round state TO ${JSON.stringify(gameState.roundState)}`)
                logDebug(`Active player index = ${JSON.stringify(gameState.activePlayerIndex)}`)
                sendMaskedGameStates(socket, gameState, 'gameState'); 
            }); 

        })

    }

    app.get('/rooms/:code', (req, res) => {
        const roomName = req.params.code; 
        if (allRooms.includes(roomName)){
            res.render("room", {
                roomName: roomName, 
            });
        }
        else{
            res.send("room does not exist"); 
        }
    }); 

    // handle the issue with sending direct link to rooms
    app.get('/room/:code', (_, res) => {
        res.sendFile(join(__dirname+'/../../client/build/index.html'));
    });

    const port = process.env.PORT || 3002;

    server.listen(port, () => {
        console.log(`listening on port ${port}`);
    });

    function sendMaskedGameStates(namespace: Namespace, gameState: GameState, name: String) {
        for (let [clientId, clientSocket] of Object.entries(namespace.sockets)) {
            (clientSocket as Socket).emit(name, maskState(gameState, clientId)); 
        }
    }
};

main();

