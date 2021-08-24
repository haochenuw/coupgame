import React, { useState, useEffect } from 'react'
import MainGame from "./game/MainGame"
import './styles/buttons.css';
import './styles/styles.css';
import io from "socket.io-client";
import RulesModal from "./RulesModal";
import {useStateWithLocalStorage} from "./hooks/useStateWithLocalStorage"

export const SocketContext = React.createContext()

// const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002"

let socket = null;

const MAX_PLAYERS = 6;
const MIN_PLAYERS = 2;

export default function Room({ history, match, location }) {
    // Connect through socket. 
    console.log(`got room name = ${match.params.name}`);
    if (socket === null) {
        console.log('connecting to socket.io...');
        socket = io(`/${match.params.name}`);
    }

    const [players, setPlayers] = useState(null);
    const [me, setMe] = useState('');
    const [name, setName] = useStateWithLocalStorage(
        'playerName'
    );
    const [nameRegistered, setNameRegistered] = useStateWithLocalStorage(
        'nameIsRegistered'
    );
    const [winner, setWinner] = useState(null);
    const [roomStatus, setRoomStatus] = useState('NOT_READY_TO_START');
    const [initialState, setInitialState] = useState(null);

    useEffect(() => {
        socket.on("connect", () => {
            setMe(socket.id);
            if (nameRegistered){
                console.log("re-setting the name");
                socket.emit('setName', name);
            }
        });

        socket.on("roomFull", () => {
            setRoomStatus("ROOM_FULL");
        });

        socket.on("gameInProgress", () => {
            setRoomStatus("GAME_IN_PROGRESS");
        });

        socket.on("playersUpdate", (players) => {
            console.log('got players update', players);
            setPlayers(players);
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
            setWinner(winner);
            setRoomStatus("GAMEOVER");
        });
    }, []);

    function setReady() {
        setPlayers(
            players.map(item =>
                item.client_id === me
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

    function isCreator() {
        if (location.state !== undefined && location.state.data !== undefined) {
            return location.state.data
        }
        return false;
    }

    function gameOverPanel() {
        return (
            <div>
                <h2>Game over: winner is {winner}</h2>
                {winner === name && (<h2>You won!</h2>)}
                {winner !== name && (<h2>You lost!</h2>)}
            </div>
        )
    }

    function onSaveName(value) {
        setName(value)
        console.log(`Got player name = ${value}`);
        socket.emit('setName', value);
        setNameRegistered(true); 
    }

    const onChange = event => setName(event.target.value);

    function setNamePanel() {
        return (
            <div className="joinHome">
                <input id='inputName' value={name} type="text" placeholder="Your Name" onChange={onChange} />
                <button className="btn btn-info" onClick={() => onSaveName(document.getElementById('inputName').value)}>Save</button>
            </div>
        )
    }

    function canStartGame() {
        return isAllPlayersReady() && isPlayerNumberAllowed() && isCreator() === true
    }

    if (name === "" || nameRegistered === false) {
        return setNamePanel()
    }

    return (
        <div className="roomHome">
            <div class="roomHeader">
                <div className="roomName"> ROOM {match.params.name} </div>
                <RulesModal style="small" />
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
                    <button className="btn btn-success" onClick={setReady}>Ready</button>
                }
                {
                    roomStatus !== 'STARTED' &&
                    isCreator() === true &&
                    <button className="btn btn-success" disabled={!canStartGame()} onClick={startGame}>Start Game</button>
                }
            </div>
            {
                roomStatus === 'STARTED' &&
                initialState !== null &&
                <SocketContext.Provider value={socket}>
                    <MainGame me={me} myName={name} initialState={initialState} />
                </SocketContext.Provider>
            }
            {
                roomStatus !== 'STARTED' && roomStatus !== 'GAME_IN_PROGRESS' && <PlayersPanel players={players} me={me} name={name} />
            }
            {
                roomStatus === 'GAMEOVER' && gameOverPanel()
            }
        </div>


    )
}


function PlayersPanel(props) {
    if (props.players === null) {
        return (<div>No players have connected</div>)
    } else {
        return (
            <div className="readyUnitContainer">
                {props.players.map((item, index) => {
                    let ready = null
                    let notReadyColor = '#E46258'
                    let readyColor = '#73C373'

                    if (item.isReady) {
                        ready = <b>Ready!</b>
                    } else {
                        ready = <b>Not Ready</b>
                    }
                    return (
                        <div style={{ backgroundColor: item.isReady ? readyColor : notReadyColor }} key={index}>
                            <p >{index + 1}. {item.name} {ready}</p>
                        </div>
                    )
                })
                }
            </div>
        )
    }
}
