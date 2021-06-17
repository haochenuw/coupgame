import React, {useState} from 'react'
import MainGame from "./game/MainGame"
import io from "socket.io-client";

const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002"
let socket; 
export default function Room({match, location}) {
    // Connect through socket. 

    const [players, setPlayers] = useState(null); 
    const [me, setMe] = useState(''); 
    
    React.useEffect(() =>{
        socket = io(`${baseUrl}/${match.params.name}`);

        socket.on("connect", () => {
            setMe(socket.id); 
        });

        socket.on("playersUpdate", (players) => {
            console.log('players', players);
            setPlayers(players); 
        }); 
    }, []); 



    console.log("location", location);

    const [roomStatus, setRoomStatus] = useState('NOT_READY_TO_START');

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
        setRoomStatus("STARTED")
    }

    function isCreator() {
        return location.state.data
    }

    return(
            <div>
                <h1> ROOM {match.params.name} </h1>
                <h1> IsCreator: {isCreator()}</h1>

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
                    <MainGame />
                }
                <PlayersPanel players={players} me = {me}/>

            </div>

            
        )
}


function PlayersPanel(props){
    console.log(props); 
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
                    <div style={{backgroundColor: item.client_id === props.me ? meColor : otherColor}} key={index}>
                            <p >{index+1}. {item.client_id} {ready}</p>
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