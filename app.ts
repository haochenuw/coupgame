// require("dotenv-safe").config();
import express from "express";
import { join } from "path";
import cors from "cors";
import {Socket, Namespace} from "socket.io"; 
import {makeid, logInfo, logError, logDebug, renderLog}  from "./utils"; 
import { RoomStatus,GameState, RoundState, PlayerState, Card, Action, PlayerAction, isChallengeable, isBlockable} from "./types";
import {initGame, shuffle, commitAction, isValidAction, checkForWinner, maskState} from "./game"; 
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


    // io.on("connection", function(client: Socket) {
    //     let room = client.handshake.query.room as string;
    //     console.log('a client has connected through here'); 

    //     // set the mapping. 
    //     clientToRoomMapping[client.id] = room; 
    //     // debug
    //     console.log(`roomname = ${client.handshake.query.room}`);
    //     console.log(`status = ${JSON.stringify(roomNameToStatusMap)}`)


    //     if (!roomNameToStatusMap[room]){
    //         client.emit('noRoom'); 
    //         return; 
    //     }
    //     let roomStatus = roomNameToStatusMap[room]; 
    //     if (roomStatus.numPlayers > MAX_PLAYERS){
    //         client.emit(FgRed, 'tooManyPlayers'); 
    //         return; 
    //     }
    //     client.join(room);
    //     if (roomStatus.numPlayers == 0){
    //         roomStatus.playerOneId = client.id; 
    //     } else if (roomStatus.numPlayers == 1){
    //         roomStatus.playerTwoId = client.id; 
    //     }
    //     client.emit('playerIndex', roomStatus.numPlayers); 
    //     roomStatus.numPlayers += 1; 

    //     io.sockets.in(room).emit('roomStatus', JSON.stringify(roomStatus)); 

    //     client.on('start', handleStartGame); 
        
    //     client.on('action', handlePlayerAction); 

    //     client.on('rematch', handleRematch); 

    //     client.on('challenge', handleChallenge);
        
    //     client.on('surrender', handleSurrender);
        
    //     client.on('reveal', handleReveal); 

    //     client.on('block', handleBlock); 

    //     function handleBlock(isBlock: boolean){
    //         const roomName: string = clientToRoomMapping[client.id]; 
    //         if (!roomName) return; 
    //         let gameState = states.roomName; 
    //         if (gameState.roundState !== RoundState.WaitForBlock){
    //             console.log(FgRed, 'wrong round state'); 
    //             return; 
    //         }
    //         console.log(FgGreen,'got block confirmation'); 

    //         if (isBlock){
    //             console.log(FgGreen,'player block'); 
    //             io.to(roomName).emit('activityLog', {name: "block", source: client.id}); 
    //             gameState.roundState = RoundState.WaitForChallenge; 
    //             // push a blocking action into the pending stack. 
    //             const blockAction = {source: gameState.playerIds.indexOf(client.id), name: Action.Block, target: null}; 
    //             gameState.pendingActions.splice(0, 0, blockAction);
    //         } else{
    //             // block is skipped
    //             io.to(roomName).emit('activityLog', {name: "skip block", source: client.id}); 
    //             console.log(FgGreen,'skipped block'); 
    //             let newGameState = commitAction(gameState);
    //             endOrContinueGame(newGameState, roomName); 
    //             swapPlayers(newGameState); 
    //             states.roomName = newGameState; 
    //         }
    //         io.to(roomName).emit('gameState', JSON.stringify(gameState)); 
    //     }

    //     function handleSurrender(cardIndex:number) {
    //         const roomName: string = clientToRoomMapping[client.id]; 
    //         if (!roomName) return; 
    //         let gameState = states.roomName; 
    //         if (gameState.roundState !== RoundState.WaitForSurrender){
    //             console.log(FgRed, `wrong round state, looking for surrender`); 
    //             return; 
    //         }
    //         // validate
    //         const playerIndex = gameState.playerIds.indexOf(client.id); 
    //         if (playerIndex !== gameState.playerToSurrender){
    //             logError("wrong player to surrender"); 
    //             return; 
    //         }


    //         let playerCards = gameState.playerStates[playerIndex].cards; 
    //         if (playerCards[cardIndex].isRevealed === true){
    //             console.log(FgRed, 'player already lost this card'); 
    //         }
    //         else{
    //             // set the card to be revealed 
    //             playerCards[cardIndex].isRevealed = true; 
    //         } 
    //         const index = gameState.playerIds.indexOf(client.id); 
    //         io.to(roomName).emit('activityLog', {name: "surrender", source: index, target: cardIndex}); 
    //         endOrContinueGame(gameState, roomName); 
    //         io.to(roomName).emit('gameState', JSON.stringify(gameState)); 

    //         // Multiple cases of reaching here. Maybe we can pass in a callback
    //         // Case 1: coup / assasinate 
    //         // Case 2: challenge -> true reveal 
    //         // Case 3: action -> block -> challenge -> true reveal
    //         // False reveal is not a case since that is already surrendered. 

    //         const actions = gameState.pendingActions; 
    //         if (actions.length === 0){
    //             // no pending actions, case 1 and 3. 
    //             swapPlayers(gameState); 
    //         } else if (actions.length === 1){
    //             // case 2. 
    //             // need to wait for block
    //             const action = actions[0]; 
    //             if (isBlockable(action.name)){
    //                 gameState.roundState = RoundState.WaitForBlock;
    //             } else{
    //                 gameState = commitAction(gameState);
    //                 endOrContinueGame(gameState, roomName); 
    //                 states.roomName = gameState; 
    //                 swapPlayers(gameState); 
    //             }
    //         } else{
    //             logError("shouldn't reach here");
    //         }
    //     }

    //     function handleReveal(cardIndex: number) {
    //         // validate 
    //         const roomName: string = clientToRoomMapping[client.id]; 
    //         if (!roomName) return; 
    //         let gameState = states.roomName; 
    //         if (gameState.roundState !== RoundState.WaitForReveal){
    //             console.log(FgRed, 'wrong round state'); 
    //             return; 
    //         }
    //         console.log(FgGreen,'got reveal request'); 
    //         console.log(FgGreen, `pending actions = ${JSON.stringify(gameState.pendingActions)}`); 
            
    //         let player = gameState.pendingActions[0].source; 

    //         let playerState = gameState.playerStates[player];
    //         let card = tryGetRevealCard(playerState, cardIndex); 
    //         let pendingAction = gameState.pendingActions[0].name as Action; 
    //         if (card === undefined){
    //             console.log(FgRed, 'reveal is invalid');
    //             return; 
    //         }
    //         io.in(roomName).emit('activityLog',  {name: "reveal", source: client.id, target: card.name});
    //         // Check if reveal resolves the challenge 
    //         if (isRevealLegit(card, pendingAction)){
    //             // legit reveal 
    //             console.log(FgGreen, 'revealing a legit card'); 
    //             let deck = gameState.deckState; 
    //             deck.push(card); 
    //             deck = shuffle(deck); 
    //             let newCard = deck.pop(); 
    //             playerState.cards[cardIndex] = newCard; 
    //             gameState.deckState = deck; 
    //             const challengingPlayerIndex = gameState.playerIds.indexOf(gameState.challengingPlayerId); 
    //             console.log(FgGreen, 'waiting for challenger to choose a card to surrender...'); 
    //             gameState.playerStates[challengingPlayerIndex].lifePoint -=1; 
    //             endOrContinueGame(gameState, roomName); 
    //             gameState.roundState = RoundState.WaitForSurrender; 
    //             gameState.playerToSurrender = challengingPlayerIndex; 
    //         } else{
    //             console.log(FgGreen, 'reveal a illegit card'); 
    //             // false reveal. deduct lifepoint from player. reveal card 
    //             card.isRevealed = true; 
    //             playerState.lifePoint -= 1; 
    //             io.to(roomName).emit('activityLog', {name: "lost one life", source: gameState.playerIds[gameState.activePlayerIndex]}); 
    //             // discard the pending action (can be actual action or block)
    //             gameState.pendingActions.shift(); 

    //             if (gameState.pendingActions.length > 0){
    //                 // Case 1: there's a pending action (block is challenged)
    //                 gameState = commitAction(gameState);
    //             } else{
    //                 // Case 2: no pending action (do nothing)
    //             }
    //             endOrContinueGame(gameState, roomName); 
    //             if (gameState.roundState !== RoundState.WaitForSurrender){
    //                 gameState.roundState = RoundState.WaitForAction; 
    //                 swapPlayers(gameState); 
    //             }
    //         }
    //         io.sockets.in(roomName).emit('gameState', JSON.stringify(gameState)); 
    //     }

    //     function tryGetRevealCard(playerState: PlayerState, cardIndex:number): Card | undefined {
    //         if (cardIndex < 0 || cardIndex >= playerState.cards.length){
    //             logError('card index out of bounds'); 
    //             return undefined; 
    //         } 
    //         let card = playerState.cards[cardIndex]; 
    //         logInfo(`revealed card = ${JSON.stringify(card)}`)
    //         if (card.isRevealed === true) { 
    //             logError("card is already revealed");
    //             return undefined; 
    //         }
    //         return card; 
    //     }

    //     function handleChallenge(isChallenge: boolean){
    //         const roomName: string = clientToRoomMapping[client.id]; 
    //         if (!roomName) return; 
    //         let gameState = states.roomName; 
    //         if (gameState.roundState !== RoundState.WaitForChallenge){
    //             logError('not in a wait for challenge state'); 
    //             return; 
    //         }
    //         const pendingAction = gameState.pendingActions[0]; 
    //         logInfo(`got challenge/skip request for pending action ${JSON.stringify(gameState.pendingActions[0])}`); 

    //         if (isChallenge){
    //             io.to(roomName).emit('activityLog', {name: "challenge", source: client.id}); 
    //             gameState.roundState = RoundState.WaitForReveal; 
    //             gameState.challengingPlayerId = client.id; 
    //         } else{
    //             io.to(roomName).emit('activityLog', {name: "skip challenge", source: client.id}); 
    //             if (isBlockable(pendingAction.name)){
    //                 gameState.roundState = RoundState.WaitForBlock; 
    //             } else{
    //                 gameState = commitAction(gameState);
    //                 endOrContinueGame(gameState, roomName);  
    //                 if (gameState.roundState !== RoundState.WaitForSurrender){
    //                     gameState.roundState = RoundState.WaitForAction; 
    //                     swapPlayers(gameState); 
    //                 }
    //                 states.roomName = gameState; 
    //             }
    //             io.sockets.in(roomName).emit('gameState', JSON.stringify(states.roomName)); 
    //         }
            
    //     }


    //     function handleStartGame(){
    //         logInfo('got start game request'); 
    //         const roomName: string = clientToRoomMapping[client.id]; 
    //         if (!roomName) return; 
    //         let gameStatus = roomNameToStatusMap[roomName]

    //         let initialGameState = initGame([gameStatus.playerOneId, gameStatus.playerTwoId]); 
    //         states.roomName = initialGameState; 
    //         io.sockets.in(roomName).emit('gameState', JSON.stringify(initialGameState)); 
    //     }

    //     function handlePlayerAction(action) {
    //         console.log(FgGreen, `Player action = ${JSON.stringify(action)}`); 
    //         let roomName = clientToRoomMapping[client.id]; 
    //         if (!roomName){
    //             return; 
    //         }
    //         let gameState = states.roomName; 
    //         console.log(FgGreen, `Roundstate = ${gameState.roundState}`); 

    //         if (!isValidAction(action, client.id, gameState)){
    //             console.log(FgRed, 'invalid action'); 
    //             return; 
    //         }   
    //         const enhancedAction = Object.assign({}, action, {source: gameState.playerIds.indexOf(client.id)});
    //         io.sockets.in(roomName).emit('activityLog', enhancedAction); 
    //         gameState.pendingActions.splice(0, 0, enhancedAction); 

    //         if (isChallengeable(action.name as Action)){
    //             console.log('action is challengeable...waiting for challenges');      
    //             gameState.roundState = RoundState.WaitForChallenge;     
    //         } else if (isBlockable(action.name as Action)){
    //             console.log(FgGreen, 'waiting for blocks');      
    //             gameState.roundState = RoundState.WaitForBlock;     
    //         }else{
    //             console.log(FgGreen, 'unquestionable action');      
    //             // not challengeable nor blockable action.
    //             resolveReactions(action, (ok: boolean)=>{
    //                 // save new game state
    //                 if (ok){
    //                     gameState = commitAction(gameState);
    //                     endOrContinueGame(gameState, roomName); 
    //                     if(gameState.roundState !== RoundState.WaitForSurrender){
    //                         swapPlayers(gameState); 
    //                     }
    //                     states.roomName = gameState; 
    //                     io.sockets.in(roomName).emit('gameState', JSON.stringify(gameState)); 
    //                 }
    //             }); 
    //         }
    //     }

    //     function handleRematch(){
    //         console.log(`got rematch request`); 
    //         const roomName: string = clientToRoomMapping[client.id]; 
    //         if (!roomName) return;

    //         if(!roomNameToRematchRequests[roomName]){
    //             roomNameToRematchRequests[roomName] = [client.id]; 
    //         } else if (!roomNameToRematchRequests[roomName].includes(client.id)){
    //             roomNameToRematchRequests[roomName].push(client.id); 
    //         }
    //         console.log(`rematch requests = ${roomNameToRematchRequests[roomName]}`); 
    //         if (roomNameToRematchRequests[roomName].length == MAX_PLAYERS){
    //             console.log(`start rematch`);
    //             // flush the rematch requests. 
    //             roomNameToRematchRequests[roomName] = [];
    //             io.sockets.in(roomName).emit('rematchConfirm'); 
    //             // start game 
    //             handleStartGame(); 
    //         }
    //     }

    app.use(express.static(join(__dirname, '../client/build')));

    app.get('/', (req, res) => {
        res.sendFile(join(__dirname+'../client/build/index.html'));
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
        console.log(`checkRoom is hit with ${req.query}`)
        res.json({doesRoomExist: (req.query.roomName as string) in namespaces})
    })

    // React: handle socket
    function openSocket(socket, namespace) {
        let players = []; 
        let gameState = null; 
        socket.on('connection', client => {
            console.log('id: ' + client.id);
            players.push({
                "client_id": `${client.id}`,
                "isReady": false
            })
            client.join(namespace);
            
            client.on('setName', playerName => {
                logDebug(`players = ${JSON.stringify(players)}`); 
                let player = players.find(player => player.client_id === client.id)
                logDebug(`player ${player.client_id} set name to be ${playerName}`); 
                player.name = playerName; 
                socket.emit('playersUpdate', players);
            });

            client.on('playerReady', () => {
                console.log(`${client.id} is ready`)
                players.forEach(player => {
                    if (player.client_id === client.id){
                        player.isReady = true; 
                    }
                })
                socket.emit('playersUpdate', players) ;
            })

            client.on('startGame', () => {
                if(players.length < constants.MIN_PLAYERS || players.length > constants.MAX_PLAYERS){
                    logError('number of players too small or too large'); 
                    socket.emit('error', 'number of players too small or too large'); 
                    return; 
                } 
                console.log(`${client.id} starts game for room ${namespace}`)
                  
                gameState = initGame(players); 
                socket.emit('startGameResponse');
                // socket.emit('gameState', gameState);
                sendMaskedGameStates(socket, gameState); 
            })

            client.on('action', (action) => {
                logInfo(`Got action = ${JSON.stringify(action)} from player ${client.id}`); 


                if (!isValidAction(action, client.id, gameState)){
                    logError("Action is Invalid"); 
                    client.emit("clientError"); 
                    return; 
                } 
                // Handle special case. If it is assasinate, then deduct tokens right away 
                if(action.name as Action === Action.Assasinate){
                    logInfo(`Deducting assasinate costs`); 
                    gameState.playerStates[gameState.activePlayerIndex].tokens -= constants.ASSASINATE_COST; 
                }

                let sourceName = gameState.playerStates.find(state => state.socket_id === client.id).friendlyName; 
                // Add event to the log
                
                let actionWithSource = {...action, source: client.id}; 
                if (actionWithSource.target === null && action.name as Action === Action.Challenge){
                    let source = gameState.pendingActions[0].source;
                    let name = gameState.playerStates.find(state => state.socket_id === source).friendlyName; 
                    actionWithSource.target = name; 
                }    

                gameState.logs.splice(0, 0, renderLog(sourceName, action.name, actionWithSource.target)); 
                
                gameState.pendingActions.splice(0,0,actionWithSource as PlayerAction); 
                //  handle challenge and blocks 
                // Case 1: challengeable and bloackable 
                let isActionChallengeable = isChallengeable(action.name as Action); 
                let isActionBlockable = isBlockable(action.name as Action); 
                if (isActionBlockable && isActionChallengeable){
                    // TODO: logic go here. 
                    logInfo('blockable + challengeable action'); 
                    gameState.roundState = RoundState.WaitForChallengeOrBlock; 
                    sendMaskedGameStates(socket, gameState); 
                    return; 
                } else if (isActionChallengeable){
                    logInfo('waiting for challenge...'); 
                    gameState.roundState = RoundState.WaitForChallenge; 
                    // socket.emit('gameState', gameState); 
                    sendMaskedGameStates(socket, gameState); 
                    return; 
                } else if (isActionBlockable){
                    logInfo('waiting for block...'); 
                    gameState.roundState = RoundState.WaitForBlock; 
                    // socket.emit('gameState', gameState); 
                    sendMaskedGameStates(socket, gameState); 
                    return; 
                }
                gameState = commitAction(gameState);
                let winner = checkForWinner(gameState);
                if (winner !== null){
                    socket.emit('gameOver', winner); 
                }
                logDebug(`round state = ${JSON.stringify(gameState.roundState)}`)
                logDebug(`active player index = ${JSON.stringify(gameState.activePlayerIndex)}`)
                // socket.emit('gameState', gameState); 
                sendMaskedGameStates(socket, gameState); 
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

    const port = process.env.PORT || 3002;

    server.listen(port, () => {
        console.log(`listening on port ${port}`);
    });

    function sendMaskedGameStates(namespace: Namespace, gameState: GameState) {
        for (let [clientId, clientSocket] of Object.entries(namespace.sockets)) {
            (clientSocket as Socket).emit('gameState', maskState(gameState, clientId)); 
        }
    }
};

main();

