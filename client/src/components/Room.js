import React, {useState, useEffect} from 'react'
import MainGame from "./game/MainGame"

import io from "socket.io-client";

export const SocketContext = React.createContext()

// const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002"

let socket = null; 

export default function Room({history, match, location}) {
    // Connect through socket. 
    if (socket === null){
        socket = io(`/${match.params.name}`);
    }
    
    const [players, setPlayers] = useState(null); 
    const [name, setName] = useState(null); 
    const [me, setMe] = useState(''); 
    const [winner, setWinner] = useState(null); 
    const [roomStatus, setRoomStatus] = useState('NOT_READY_TO_START');
    
    useEffect(() => {
        console.log(`Got player name = ${JSON.stringify(location.state.playerName)}`); 
        setName(location.state.playerName); 
        socket.emit('setName', location.state.playerName); 

        socket.on("connect", () => {
            setMe(socket.id); 
        });

        socket.on("playersUpdate", (players) => {
            console.log('got players update', players);
            setPlayers(players); 
        }); 

        socket.on('startGameResponse', ()=>{
            console.log('got start game response');
            setRoomStatus("STARTED");
        });

        socket.on("initialState", state=>{
            console.log('state', JSON.stringify(state));
        });

        socket.on("gameOver", winner => {
            console.log('game over: winner is', winner);
            setWinner(winner); 
            setRoomStatus("GAMEOVER"); 
        });
    }, []); 

    function setReady(){
        setPlayers(
            players.map(item => 
                item.client_id === me 
                ? {...item, isReady : true} 
                : item 
        ));
        socket.emit('playerReady'); 
        setRoomStatus('WAIT_FOR_OTHERS')
    }

    function isAllPlayersReady(){
        if (players === null){
            return false; 
        }
        return players.every(player => player.isReady);
    }

    function startGame() {
        socket.emit('startGame')
    }

    function isCreator() {
        return location.state.data
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

    return(
            <div>
                <h1 style={{backgroundColor : "grey"}}> ROOM {match.params.name} </h1>
                {
                    roomStatus === 'NOT_READY_TO_START' &&
                    <button onClick={setReady}>Ready</button>
                }
                {
                    (isAllPlayersReady() && roomStatus !== 'STARTED' && isCreator() === true) &&
                    <button onClick={startGame}>Start Game</button>
                }
                {
                    roomStatus === 'STARTED' &&
                    <SocketContext.Provider value={socket}>
                    <MainGame me = {me} />
                    </SocketContext.Provider>
                }
                { 
                    roomStatus !== 'STARTED' && <PlayersPanel players= {players} me = {me} name = {name} />
                }   
                { 
                    roomStatus === 'GAMEOVER' && gameOverPanel()
                }   
            </div>

            
        )
}


function PlayersPanel(props){
    // console.log(props); 
    if(props.players === null){
        return (<div>No players have connected</div>)
    } else{
        return (
            <div className="readyUnitContainer">
            {props.players.map((item,index) => {
                let ready = null
                let meColor = '#E46258'
                let otherColor = '#73C373'


                if(item.isReady) {
                    ready = <b>Ready!</b>
                } else {
                    ready = <b>Not Ready</b>
                }
                return(
                    <div style={{backgroundColor: item.name === props.name ? meColor : otherColor}} key={index}>
                            <p >{index+1}. {item.name} {ready}</p>
                    </div>
                )
                })
            }
        </div>
        )   
    }
}

// export default class Room extends Component {

//     constructor(props) {
//         super(props)
    
//         this.state = {
//             roomCode: '',
//         }
//     }

//     render(){
//         let roomInfo = null; 
//         console.log(`${this.props.roomCode}`); 
//         if (this.props.roomCode === ''){
//             roomInfo = <h1>ERROR: not in a room</h1>
//         } else{
//             roomInfo = <h1>ROOM: {this.props.roomCode}</h1>
//         }
//         return(
//             <div>
//                 {roomInfo}
//             </div>
//         )
//     }
// }