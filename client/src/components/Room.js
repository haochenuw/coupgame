import React, { useState, useEffect } from 'react'
import MainGame from "./game/MainGame"
import './styles/buttons.css';
import './styles/styles.css';
import io from "socket.io-client";
import { createTheme, withStyles, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { useStateWithLocalStorage } from './hooks/useStateWithLocalStorage';
import { green, purple } from '@material-ui/core/colors';
import TextField from "@material-ui/core/TextField";
import { ColorButton, ActionButton, ErrorButton } from './ColorButton';
import {
    Link
} from "react-router-dom";
import { PlayerList } from './PlayerList';
export const SocketContext = React.createContext()

const useStyles = makeStyles((theme) => ({
    margin: {
        margin: theme.spacing(2),
    },
}));

const theme = createTheme({
    palette: {
        primary: green,
    },
});
// const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002"

let socket = null;

const MAX_PLAYERS = 6;
const MIN_PLAYERS = 2;

export default function Room({ history, match, location }) {
    const roomName = match.params.name;
    const classes = useStyles();
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
                {winner === nameState.name && (<h2>You won!</h2>)}
                {winner !== nameState.name && (<h2>You lost!</h2>)}
            </div>
        )
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

    const onChange = event => {
        setNameState({ ...nameState, name: event.target.value });
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
            <div className="roomHeader">
                <div className="roomName"> Room: <span className="roomCode">{match.params.name} </span> </div>
                {/* <RulesModal style="small" /> */}
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

// const BootstrapButton = withStyles({
//     root: {
//       boxShadow: 'none',
//       textTransform: 'none',
//       fontSize: 16,
//       padding: '6px 12px',
//       border: '1px solid',
//       lineHeight: 1.5,
//       backgroundColor: '#0063cc',
//       borderColor: '#0063cc',
//       fontFamily: [
//         '-apple-system',
//         'BlinkMacSystemFont',
//         '"Segoe UI"',
//         'Roboto',
//         '"Helvetica Neue"',
//         'Arial',
//         'sans-serif',
//         '"Apple Color Emoji"',
//         '"Segoe UI Emoji"',
//         '"Segoe UI Symbol"',
//       ].join(','),
//       '&:hover': {
//         backgroundColor: '#0069d9',
//         borderColor: '#0062cc',
//         boxShadow: 'none',
//       },
//       '&:active': {
//         boxShadow: 'none',
//         backgroundColor: '#0062cc',
//         borderColor: '#005cbf',
//       },
//       '&:focus': {
//         boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
//       },
//     },
//   })(Button);
  
//   const ColorButton = withStyles((theme) => ({
//     root: {
//       color: theme.palette.getContrastText(purple[500]),
//       backgroundColor: purple[500],
//       '&:hover': {
//         backgroundColor: purple[700],
//       },
//     },
//   }))(Button);
  
//   const useStyles = makeStyles((theme) => ({
//     margin: {
//       margin: theme.spacing(1),
//     },
//   }));
  
//   const theme = createTheme({
//     palette: {
//       primary: green,
//     },
//   });
  
//   export default function CustomizedButtons() {
//     const classes = useStyles();
  
//     return (
//       <div>
//         <ColorButton variant="contained" color="primary" className={classes.margin}>
//           Custom CSS
//         </ColorButton>
//         <ThemeProvider theme={theme}>
//           <Button variant="contained" color="primary" className={classes.margin}>
//             Theme Provider
//           </Button>
//         </ThemeProvider>
//         <BootstrapButton variant="contained" color="primary" disableRipple className={classes.margin}>
//           Bootstrap
//         </BootstrapButton>
//       </div>
//     );
//   }