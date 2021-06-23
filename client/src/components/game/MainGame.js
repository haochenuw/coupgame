import React, { useState, useContext, useEffect } from 'react'
import '../styles/styles.css';
import { SocketContext } from "./../Room";

export default function MainGame (props){
    console.log('I am ', props.me)
    const socket = useContext(SocketContext);

    const [roundState, setRoundState] = useState("WAIT_FOR_ACTION")

    const [localGameState, setLocalGameState] = useState(null);

    const [currentAction, setCurrentAction] = useState(null);

    useEffect(() =>{
        socket.on('gameState', gameState => {
            console.log(`got game state, ${JSON.stringify(gameState)}`)
            setLocalGameState(gameState)
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
                    case "WAIT_FOR_EXCHANGE":
                        console.log('wait for exchange...'); 
                        setRoundState("WAIT_FOR_EXCHANGE"); 
                        break;
                    case "WAIT_FOR_BLOCK":
                        console.log('wait for block...'); 
                        setRoundState("WAIT_FOR_BLOCK"); 
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
            <button onClick={() => onActionSelected('Income')}>Income</button>
            <button onClick={() => onActionSelected('Coup')}>Coup</button>
            <button onClick={() => onActionSelected('Tax')}>Tax</button>
            <button onClick={() => onActionSelected('Assasinate')}>Assasinate</button>
            <button onClick={() => onActionSelected('Exchange')}>Exchange</button>
            <button onClick={() => onActionSelected('Steal')}>Steal</button>
            <button onClick={() => onActionSelected('ForeignAid')}>ForeignAid</button>
            </>
        )
    }

    function onActionSelected(action) {
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
            case 'Assasinate': 
                return true
            case 'Steal': 
                return true
            case 'Tax': 
                return false
            default:
                return false 
        }
    }

    function isMe(gameState){
        if (gameState.playerStates[gameState.activePlayerIndex].socket_id === props.me
            && (gameState.roundState === "WAIT_FOR_ACTION" || gameState.roundState === "WAIT_FOR_EXCHANGE") ){
                return true; 
        } else if (gameState.surrenderingPlayerIndex !== null 
            && gameState.playerStates[gameState.surrenderingPlayerIndex].socket_id === props.me
            && gameState.roundState === "WAIT_FOR_SURRENDER") {
            return true; 
        }
        else if (gameState.roundState === "WAIT_FOR_BLOCK") {
            return true; 
        }
        return false; 
    }

    function playerStatePanel(){
        if (localGameState === null){
            return null 
        }
        return(
            localGameState.playerStates.map((playerState) => {
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

    // Display an array of buttons, given by the "options" arra,y. 
    function selectTargetPanel(action, options){
        return (
        <div>
            <h2>Please select a target to {action} </h2>
            {options.map((item) => {
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
        let cards = localGameState.playerStates.filter(state => state.socket_id === props.me)[0].cards; 
        console.log(`cards = ${JSON.stringify(cards)}`);
        return (
            selectTargetPanel('Surrender', cards.filter(card => card.isRevealed === false).map(card => card.name))
        )
    }

    function selectTarget(action){
        let options = localGameState.playerStates.filter(state => state.socket_id !== props.me).map(state => state.socket_id);
        return (
            selectTargetPanel(action, options)
        )
    }

    function selectExchangeTarget(){
        let cards = localGameState.pendingExchangeCards.map(card => card.name);
        let numToKeep = localGameState.pendingExchangeCards.length - 2; 

        let cardsToKeep = []; 

        return (
            <div>
            <h2>Please select {numToKeep} cards to keep </h2>
            {cards.map((item) => {
                // if(playerState.lifePoint > 0){
                return(<span>
                    <button onClick={() => onKeepSelected(item)}>{item}</button>
                </span>
                )
                }
            )}
            </div>
        )

        function onKeepSelected(item){
            
            // ?? cardsToKeep = cards.splice(); 
            console.log(`selected ${item} to keep`)
            cardsToKeep.push(item); 

            if (cardsToKeep.length === numToKeep){
                // already selected everything
                socket.emit('action', {name: "ExchangeResponse", target: null, additionalData: cardsToKeep}); 
                setRoundState("WAITING_FOR_OTHERS")
            }
        }
    }


    function isWaiting(){
        if (localGameState === null){
            return true; 
        } 
        if (localGameState.playerStates[localGameState.activePlayerIndex].socket_id !== props.me){
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
        {roundState === "SELECT_TARGET" && selectTarget(currentAction)}
        {roundState === "WAIT_FOR_EXCHANGE" && selectExchangeTarget()}
        </div>
    )
}