require("dotenv").config();
import express, { query } from "express";
import { join } from "path";
import cors from "cors";
import {Socket, Namespace} from "socket.io";
import {makeid, logInfo, logError, logDebug, renderLog, emptyGameState}  from "./utils";
import { RoomStatus,GameState, RoundState, PlayerState, Card, Action, PlayerAction, isChallengeable, isBlockable, EventType} from "./types";
import {initGame, shuffle, commitAction, isValidAction, checkForWinner, maskState, computeAlivePlayers, handleAction} from "./game";
import * as constants from "./constants";

import { MongoClient, ServerApiVersion } from 'mongodb';
const DB_NAME = "coupgameDB";
const COLLECTION_NAME = "gameMetrics";
const mongoClient = new MongoClient(process.env.DB_CONNECTION_STRING);

const ROOM_CODE_LENGTH = 4;
let namespaces = {}; //AKA party rooms

const main = async () => {
    await mongoClient.connect();
    console.log('Connected successfully to mongoDB');
    const db = mongoClient.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

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

    app.get('/ads.txt', (req, res) => {
        const filePath = join(__dirname, '../ads.txt')
        res.sendFile(filePath)
    })

    app.get('/', (_, res) => {
        res.sendFile(join(__dirname+'/../../client/build/index.html'));
    });

    app.get('/createRoom', function (req, res) {
        let newRoom = '';
        while(newRoom === '' || (newRoom in namespaces)) {
            newRoom = makeid(ROOM_CODE_LENGTH);
        }
        const newSocket: Namespace = io.of(`/${newRoom}`);
        openSocket(newSocket, `/${newRoom}`);
        namespaces[newRoom] = 1; // created
        console.log(newRoom + " CREATED")
        res.json({room: newRoom});
    })

    // Check if room exists
    app.get('/checkRoom', function (req, res) {
        console.log(`checkRoom is hit with ${JSON.stringify(req.query)}`)
        res.json({doesRoomExist: (req.query.roomName as string) in namespaces})
    })

    function handleInGameConnection(socket, namespace:string, client, gameState): GameState | null {
        const clientQuery = client.handshake.query;
        logInfo(`query = ${JSON.stringify(clientQuery)}`);
        if (clientQuery.name !== undefined && clientQuery.name !== ''){
            logDebug(`client ${clientQuery.name} trying to connect in game...`);
            const playerByName = gameState.playerStates.find(player => player.friendlyName === clientQuery.name);
            if (playerByName !== undefined){
                client.join(namespace);
                playerByName.socket_id = client.id;
                playerByName.connected = true;
                logInfo(`Client ${clientQuery.name} reconnected!`)
                gameState.eventType = EventType.Reconnect;
                return gameState;
            } else {
                logError(`Reconnecting client ${clientQuery.name} does not exist`);
                return null;
            }
        } else { // no name is saved
            logError(`Cannot join new client in-game`);
            return null;
        }
    }

    // return success status
    function handleBeforeGameConnection(socket, namespace, client, players: Array<PlayerState>) : Array<PlayerState> | null {
        const clientQuery = client.handshake.query;
        logInfo(`query = ${JSON.stringify(clientQuery)}`);
        if (players.length >= constants.MAX_PLAYERS){
            logError("Room is already full")
            client.emit('roomFull');
            return null;
        }
        let newp: PlayerState = {
            "socket_id": `${client.id}`,
            "isReady": false,
            "connected": true,
            "friendlyName": null,
            "tokens": undefined,
            "lifePoint": undefined,
            "cards": undefined,
        };

        if (clientQuery.name !== undefined && clientQuery.name !== ''){
            if (players.find(player => player.friendlyName === clientQuery.name) !== undefined){
                // name already exists
                logError("name already in use")
                client.emit('nameExists', clientQuery.name);
                return null;
            }
            logDebug(`client ${clientQuery.name} trying to connect...`);
            newp.friendlyName = clientQuery.name;
            players.push(newp);
            client.join(namespace);
            return players;
        } else {
            logError("client does not have a name");
            return null;
        }
    }

    // handle socket
    function openSocket(socket, namespace) {
        let gameInProgress = false;
        let gameState: GameState = emptyGameState();

        socket.on('connection', async (client) => {
            logInfo(`Client ${client.id} connecting to namespace ${namespace}`);

            if (gameInProgress) {
                let newGameState = handleInGameConnection(socket, namespace, client, gameState);
                if (newGameState !== null){
                    sendMaskedGameStates(socket, gameState, 'reconnectInGame');
                } else {
                    // error
                    client.emit('gameInProgress');
                    return;
                }
            } else {
                let newPlayerStates = handleBeforeGameConnection(socket, namespace, client, gameState.playerStates);
                if (newPlayerStates === null) {
                    logError("connection before game fails...");
                    // disconnect the client.
                    client.disconnect(true);
                    return;
                } else{
                    logInfo("connection success!");
                    gameState.playerStates = newPlayerStates;
                    client.emit('nameRegisterSuccess');

                    socket.emit('playersUpdate', gameState.playerStates);
                }
            }

            client.on('disconnect', () => {
                let index = gameState.playerStates.findIndex(player => player.socket_id === client.id)
                logInfo(`client ${client.id} disconnected`);
                logDebug(`on Disconnect: players = ${JSON.stringify(gameState.playerStates)}`);
                if (index === -1){
                    logError("Client Not found");
                    return;
                }
                if (gameInProgress){
                       logDebug("disconnection within game");
                       gameState.playerStates[index].connected = false;
                       gameState.eventType = EventType.Disconnect;
                       sendMaskedGameStates(socket, gameState, 'gameState');
                } else {
                    // remove the player from list of players
                    gameState.playerStates.splice(index, 1);
                }
            });

            client.on('setName', playerName => {
                logDebug(`On set name: players = ${JSON.stringify(gameState.playerStates)}`);
                let player = gameState.playerStates.find(player => player.socket_id === client.id)
                if (player !== undefined){
                    // reject if name is duplicate
                    let nameExists = gameState.playerStates.find(player => player.friendlyName === playerName);
                    if (nameExists !== undefined){
                        logDebug("name is duplicate");
                        client.emit('nameExists', playerName);
                    } else{
                        logDebug(`player ${player.socket_id} set their name to be ${playerName}`);
                        player.friendlyName = playerName;
                        socket.emit('playersUpdate', gameState.playerStates);
                    }
                }
            });

            client.on('playerReady', () => {
                logInfo(`Client ${client.id} is ready!`)
                gameState.playerStates.forEach(player => {
                    if (player.socket_id === client.id){
                        player.isReady = true;
                    }
                })
                socket.emit('playersUpdate', gameState.playerStates);
            })

            client.on('playerCheck', () => {
                logInfo(`Client ${client.id} checks for players`)
                if (gameInProgress){
                    client.emit('gameInProgress');
                    return;
                }
                client.emit('playersUpdate', gameState.playerStates);
            })

            client.on('startGame', async () => {
                if(gameState.playerStates.length < constants.MIN_PLAYERS || gameState.playerStates.length > constants.MAX_PLAYERS){
                    logError('number of players too small or too large');
                    socket.emit('error', 'Wrong number of players');
                    return;
                }
                logInfo(`Client ${client.id} starts game for room ${namespace}`)
                gameInProgress = true;
                gameState = initGame(gameState.playerStates);
                sendMaskedGameStates(socket, gameState, 'startGameResponse');
                // log starting of games to mongodb
                const _ = await collection.insertOne({ event: "game_start" });
            })

            client.on('action', async (action) => {
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
                    // log game completion to mongodb
                    const _ = await collection.insertOne({event: "game_complete" });
                }
                logDebug(`Changed Round state TO ${JSON.stringify(gameState.roundState)}`)
                logDebug(`Active player index = ${JSON.stringify(gameState.activePlayerIndex)}`)
                gameState.eventType = EventType.Regular;
                logDebug(`sending gameState...`)
                sendMaskedGameStates(socket, gameState, 'gameState');
            });

        })
        let checkEmptyInterval = setInterval(() => {
            let strippedNamespace = namespace.substring[1]
            if(Object.keys(socket['sockets']).length == 0) {
                delete io.nsps[namespace];
                if(namespaces[strippedNamespace] != null) {
                    delete namespaces[strippedNamespace]
                }
                clearInterval(checkEmptyInterval)
                console.log(namespace
                    + 'deleted')
            }
        }, 10000)
    }

    app.get('/rooms/:code', (req, res) => {
        const roomName = req.params.code;
        if (namespaces[roomName] != null){
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
            let maskedStateForPlayer = maskState(gameState, clientId); 
            console.log(`computed masked state for player ${clientId} : ${JSON.stringify(maskedStateForPlayer)}`);
            (clientSocket as Socket).emit(name, maskedStateForPlayer);
        }
    }
};

main();
