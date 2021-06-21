import React, { useState, useContext, useEffect } from 'react'
import '../styles/styles.css';
import { SocketContext } from "./../Room";

export default function MainGame (props){
    console.log('I am ', props.me)
    const socket = useContext(SocketContext);

    const [roundState, setRoundState] = useState("WAIT_FOR_ACTION")

    const [gameState, setGameState] = useState(null);

    const [currentAction, setCurrentAction] = useState(null);

    useEffect(() =>{
        socket.on('gameState', gameState => {
            console.log(`got game state, ${JSON.stringify(gameState)}`)
            setGameState(gameState)
            if (!isMe(gameState)){
                setRoundState("WAITING_FOR_OTHERS"); 
            } else{
                switch(gameState.roundState){
                    case "WAIT_FOR_SURRENDER": 
                        console.log('wait for surrender...'); 
                        setRoundState("WAIT_FOR_SURRENDER");
                        break; 
                    case "WAIT_FOR_ACTION":
                        console.log('wait for action...'); 
                        setRoundState("WAIT_FOR_ACTION"); 
                        break;
                    default: 
                        break; 
                }
            }
        });
    }, []);

    function actionPanel(){
        return( 
            <>
            <h1> Please choose an action</h1>
            <button onClick={() => selectAction('Income')}>Income</button>
            <button onClick={() => selectAction('Coup')}>Coup</button>
            {/* <a onclick="taxAction()">Tax</a>
            <a onclick="foreignAidAction()">Foreign Aid</a>
            <a onclick="assasinateAction()">Assasinate</a>
            <a onclick="stealAction()">Steal</a> */}
            </>
        )
    }

    function selectAction(action) {
        console.log('select action called')
        setCurrentAction(action)
        if (requiresTarget(action)){
            setRoundState('SELECT_TARGET')
        } else{
            socket.emit('action', {name: action, target: null})
        }
    }

    function requiresTarget(action) {
        switch (action){
            case 'Income': 
                return false
            case 'Coup': 
                return true
            default:
                return false 
        }
    }

    function isMe(gameState){
        if (gameState.playerStates[gameState.activePlayerIndex].socket_id === props.me
            && gameState.roundState === "WAIT_FOR_ACTION"){
                return true; 
        } else if (gameState.surrenderingPlayerIndex !== null 
            && gameState.playerStates[gameState.surrenderingPlayerIndex].socket_id === props.me
            && gameState.roundState === "WAIT_FOR_SURRENDER") {
            return true; 
        }
        return false; 
    }

    function playerStatePanel(){
        if (gameState === null){
            return null 
        }
        return(
            gameState.playerStates.map((playerState) => {
                let className = ""; 
                // if me, use special color. 
                if (playerState.socket_id === props.me){
                    className = "me"; 
                } 
                return <div className = {className}>
                            <h2>Life {playerState.lifePoint}</h2>
                            <h2>Tokens: {playerState.tokens}</h2>
                            {playerState.cards.map((card) => {
                                return (
                                    renderCard(card)
                                )
                            })} 

                        </div>
            })
        )
    }

    const revealedColor = "red"; 
    const availableColor = "green"; 

    function renderCard(card){
        return(
            <div style={{color: card.isRevealed? revealedColor : availableColor}}>
                <h3>{card.name}</h3>
            </div>
        )
    }
    
    function coup() {
        console.log('coup clicked')
        setRoundState('SELECT_TARGET')
    }

    // Display an array of buttons, given by the "options" arra,y. 
    function selectTargetPanel(action, options){
        return (
        <div>
            <h2>Please select a target to {action} </h2>
            {options.map((item, index) => {
                // if(playerState.lifePoint > 0){
                return(<span>
                    <button onClick={() => onTargetSelected(action, item)}>{item}</button>
                </span>
                )
                }
            )}
        </div>
        )
    }

    function onTargetSelected(action, item) {
        console.log(`target ${item} selected`); 
        socket.emit('action', {name: action, target: item}); 
        setRoundState('PENDING_SERVER')
    }

    function waitForSurrender() {
        let cards = gameState.playerStates.filter(state => state.socket_id === props.me)[0].cards; 
        console.log(`cards = ${JSON.stringify(cards)}`);
        return (
            selectTargetPanel('Surrender', cards.filter(card => card.isRevealed === false).map(card => card.name))
        )
    }

    function selectCoup(){
        let options = gameState.playerStates.filter(state => state.socket_id !== props.me).map(state => state.socket_id);
        return (
            selectTargetPanel('Coup', options)
        )
    }

    function isWaiting(){
        if (gameState === null){
            return true; 
        } 
        if (gameState.playerStates[gameState.activePlayerIndex].socket_id !== props.me){
            console.log(`not active player`)
            return true; 
        }  
        if (roundState !== "WAIT_FOR_ACTION"){
            return true; 
        }
        return false; 
    }

    let waiting = null; 
    if (isWaiting()){
        waiting = <div>Waiting for others to act...</div>
    } else{
        waiting = <div>Not waiting</div>
    }

    return(
        <div>
        {playerStatePanel()}
        {
            roundState === "WAITING_FOR_OTHERS" && <h2>Waiting for others...</h2>
        }
        {
            roundState === "WAIT_FOR_ACTION" && actionPanel()
        }
        {
            roundState === "PENDING_SERVER" && <h2>Pending server response...</h2>
        }
        {
            roundState === "WAIT_FOR_SURRENDER" && waitForSurrender()
        }
        {roundState === "SELECT_TARGET" && selectCoup()}
        </div>
    )
}