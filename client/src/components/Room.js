import React, { useState, useEffect, useRef } from 'react'
import MainGame from "./game/MainGame"
import './styles/buttons.css';
import './styles/styles.css';
import io from "socket.io-client";
import {makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { useStateWithLocalStorage } from './hooks/useStateWithLocalStorage';
import TextField from "@material-ui/core/TextField";
import { ColorButton, ActionButton, ErrorButton } from './ColorButton';
import {
    Link
} from "react-router-dom";
import { PlayerList } from './PlayerList';
import { AdsPanel } from './Ads';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import {EndGameModal} from "./EndGameModal"


export const SocketContext = React.createContext()

let socket = null;

const MAX_PLAYERS = 6;
const MIN_PLAYERS = 2;

export default function Room({ history, match, location }) {
    const ref = useRef();
    const roomName = match.params.name;
    const [nameState, setNameState] = useStateWithLocalStorage(
        roomName, { name: '', isRegistered: false }
    );

    const [players, setPlayers] = useState(null);
    const [nameError, setNameError] = useState(null);
    const [me, setMe] = useState('');
    const [winner, setWinner] = useState(null);
    const [roomStatus, setRoomStatus] = useState('NOT_READY_TO_START');
    const [initialState, setInitialState] = useState(null);
    const [isHost, setIsHost] = useState(false) 

    useEffect(() => {
        console.log(`Effect block gets executed`);
        let shouldConnect = socket === null 
        // && nameState.name != ''; 
        shouldConnect |= nameState.name !== '' && nameState.isRegistered === false; 
        
        if (shouldConnect){
            console.log(`connecting to socket.io...`);
            socket = io(`/${roomName}`, {
                query: {
                    name: nameState.name
                }
            });
        } else {
            console.log(`reconnection not executed!, name = ${nameState.name}`)
            socket.emit('playerCheck')
        }
    }, [nameState]); 

    useEffect(() => {
        if (socket !== null) { 
        socket.on("connect", () => {
            console.log("connected to socket!")
        });

        socket.on("nameRegisterSuccess", () => {
            setNameState({...nameState, isRegistered: true})
        })

        socket.on("roomFull", () => {
            setRoomStatus("ROOM_FULL");
        });

        socket.on("gameInProgress", () => {
            setRoomStatus("GAME_IN_PROGRESS");
        });

        socket.on("reconnectInGame", (currentState) => {
            console.log("reconnect in game"); 
            console.log(`setting the state to ${JSON.stringify(currentState)}`); 
            setInitialState(currentState);
            setRoomStatus("STARTED");
        }); 

        socket.on("playersUpdate", (players) => {
            console.log('got players update', players);
            setPlayers(players);
            if (players.length > 0){
                setIsHost(players[0].socket_id === socket.id); 
            }
        });

        socket.on('startGameResponse', (initialStateFromServer) => {
            console.log('got start game response');
            setInitialState(initialStateFromServer);
            setRoomStatus("STARTED");
        });

        socket.on("initialState", state => {
            console.log('state', JSON.stringify(state));
        });

        socket.on("gameOver", winner => {
            console.log('game over: winner is', winner);
            console.log("players = ", players)
            setWinner(winner);
            setRoomStatus("GAMEOVER");
        });

        socket.on('nameExists', name => {
            setNameError(`name ${name} already in use`)
        })
        }
    });

    function setReady() {
        setPlayers(
            players.map(item =>
                item.socket_id === me
                    ? { ...item, isReady: true }
                    : item
            ));
        socket.emit('playerReady');
        setRoomStatus('WAIT_FOR_OTHERS')
    }

    function isAllPlayersReady() {
        if (players === null) {
            return false;
        }
        return players.every(player => player.isReady);
    }

    function isPlayerNumberAllowed() {
        if (players === null) {
            return false;
        }
        return players.length <= MAX_PLAYERS && players.length >= MIN_PLAYERS;
    }

    function startGame() {
        socket.emit('startGame')
    }

    function onSaveName(value) {
        if (value === "") {
            setNameError("name cannot be empty");
            return;
        }
        setNameState({ ...nameState, name: value })
        console.log(`Client set player name to be ${value}`);
        // socket.emit('setName', value);
    }

    function setNamePanel() {
        return (
            <div className="joinHome">
                {nameError !== null && <h3>Error: {nameError}</h3>}
                <TextField
                    id="textfield-input"
                    label="Your Name" variant="outlined"
                />
                <ColorButton onClick={() => onSaveName(document.getElementById('textfield-input').value)}>Save</ColorButton>
                <Link to="/"><ColorButton>Back Home</ColorButton></Link>
            </div>
        )
    }

    function gameOverPanel() {
        return (
            <div>
                <h2>Winner is {winner}!</h2>
                <AdsPanel/>
            </div>
        )
    }

    function canStartGame() {
        return isAllPlayersReady() && isPlayerNumberAllowed() && isHost
    }

    function handleLeave() {
        console.log("leave")
        history.push('/')
    }

    if (nameState.name === '' || nameState.isRegistered === false) {
        return setNamePanel()
    }

    return (
        <div className="roomHome">
            <div>
                <div className="roomName"> Coup Game | Room <span className="roomCode">{match.params.name} </span> </div>
            </div>
            <div className="readyAndStart">
                {
                    roomStatus === 'ROOM_FULL' &&
                    <h2>Room is full!</h2>
                }
                {
                    roomStatus === 'GAME_IN_PROGRESS' &&
                    <h2>Game has already started!</h2>
                }
                {
                    roomStatus === 'NOT_READY_TO_START' &&
                    <ActionButton onClick={setReady}>Ready</ActionButton>
                }
                {
                    roomStatus !== 'STARTED' &&
                    isHost &&
                    <ActionButton disabled={!canStartGame()} onClick={startGame}>Start Game</ActionButton>
                }
                {
                    roomStatus !== 'STARTED' &&
                    <ErrorButton onClick={handleLeave}>Leave</ErrorButton>
                }
            </div>
            {
                roomStatus === 'STARTED' &&
                initialState !== null &&
                <SocketContext.Provider value={socket}>
                    <MainGame me={me} myName={nameState.name} initialState={initialState} />
                </SocketContext.Provider>
            }
            {
                roomStatus !== 'STARTED' && roomStatus !== 'GAME_IN_PROGRESS' && <PlayerList players={players} me={me} myName={nameState.name} />
            }
            {
                roomStatus === 'GAMEOVER' && gameOverPanel()
            }
        </div>
    )
}