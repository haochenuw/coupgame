import React, { useState, useContext, useEffect } from 'react'
import '../styles/styles.css';
import { SocketContext } from "./../Room";
import EventLog from "./EventLog"
import '../styles/buttons.css';

export default function MainGame (props){
    const socket = useContext(SocketContext);

    const [roundState, setRoundState] = useState("WAIT_FOR_ACTION")

    const [localGameState, setLocalGameState] = useState(null);

    const [currentAction, setCurrentAction] = useState(null);

    const [hasError, setHasError] = useState(false); 

    useEffect(() =>{
        console.log('I am ', props.me)

        socket.on('clientError', ()=>{
            setHasError(true); 
            setRoundState("WAIT_FOR_ACTION"); 
        }); 
        socket.on('gameState', gameState => {
            console.log(`got game state, ${JSON.stringify(gameState)}`)
            setHasError(false); 
            setLocalGameState(gameState)
            if (!isMe(gameState)){
                setRoundState("WAITING_FOR_OTHERS"); 
            } else{
                switch(gameState.roundState){
                    case "WAIT_FOR_SURRENDER": 
                        console.log('wait for surrender...'); 
                        setRoundState("WAIT_FOR_SURRENDER");
                        break; 
                    case "WAIT_FOR_CHALLENGE": 
                        console.log('waiting for challenge...'); 
                        setRoundState("WAIT_FOR_CHALLENGE");
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
                        console.log("\x1b[31m", 'Changing State to wait for block...'); 
                        setRoundState("WAIT_FOR_BLOCK"); 
                        break;
                    case "WAIT_FOR_REVEAL":
                        console.log("\x1b[31m", 'Changing State to wait for reveal...'); 
                        setRoundState("WAIT_FOR_REVEAL"); 
                        break;
                    case "WAIT_FOR_CHALLENGE_OR_BLOCK":
                        console.log("\x1b[31m", 'Changing State to wait for c or b...'); 
                        setRoundState("WAIT_FOR_CHALLENGE_OR_BLOCK"); 
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
            <button className="btn-info" onClick={() => onActionSelected('Income')}>Income</button>
            <button className="btn-info" onClick={() => onActionSelected('Coup')}>Coup</button>
            <button className="btn-info" onClick={() => onActionSelected('Tax')}>Tax</button>
            <button className="btn-info" onClick={() => onActionSelected('Assasinate')}>Assasinate</button>
            <button className="btn-info" onClick={() => onActionSelected('Exchange')}>Exchange</button>
            <button className="btn-info" onClick={() => onActionSelected('Steal')}>Steal</button>
            <button className="btn-info" onClick={() => onActionSelected('ForeignAid')}>ForeignAid</button>
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
        } else if (gameState.pendingActions.length > 0 
            && gameState.pendingActions[0].source !== props.me 
            && gameState.roundState === "WAIT_FOR_BLOCK") {
            return true; 
        } else if (gameState.pendingActions.length > 0 
            && gameState.pendingActions[0].source !== props.me 
            && gameState.roundState === "WAIT_FOR_CHALLENGE") {
            return true; 
        } else if (gameState.pendingActions.length > 0 
            && gameState.pendingActions[0].source !== props.me 
            && gameState.roundState === "WAIT_FOR_CHALLENGE_OR_BLOCK") {
            return true; 
        } 
        else if (gameState.pendingActions.length > 0 
            && gameState.pendingActions[0].source === props.me 
            && gameState.roundState === "WAIT_FOR_REVEAL") {
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
                let me = ""; 
                // if me, use special color. 
                if (playerState.socket_id === props.me){
                    me = "me"; 
                } 

                return <div className = {me}>
                            <h2>{playerState.friendlyName}</h2>
                            <h3>Life: {playerState.lifePoint} <i class="fas fa-coins"></i>Tokens: {playerState.tokens}</h3>
                            <div className="card-deck centered">
                            {playerState.cards.map((card) => {
                                return (
                                    renderCard(card)
                                )
                            })} 
                            </div>

                        </div>
            })
        )
    }

    const revealedColor = "red"; 
    const availableColor = "green"; 

    function renderCard(card){
        return(
            <div className="card col-lg-2 mx-auto" style={{color: card.isRevealed? revealedColor : availableColor}}>
                <div class="card-header">
                    <h3>{card.name}</h3>
                </div>
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
                    <button class="btn" onClick={() => onTargetSelected(action, item)}>{item}</button>
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
    }

    function selectAliveCardsPanel(name) {
        let cards = localGameState.playerStates.filter(state => state.socket_id === props.me)[0].cards; 
        console.log(`cards = ${JSON.stringify(cards)}`);
        return (
            selectTargetPanel(name, cards.filter(card => card.isRevealed === false).map(card => card.name))
        )
    }

    function selectTarget(action){
        let options = localGameState.playerStates.filter(state => state.socket_id !== props.me).map(state => state.friendlyName);
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
                    <button class="btn" onClick={(event) => onKeepSelected(event, item)}>{item}</button>
                </span>
                )
                }
            )}
            </div>
        )

        function onKeepSelected(event, item){
            event.target.disabled = true; 
            console.log(`selected ${item} to keep`)
            cardsToKeep.push(item); 

            if (cardsToKeep.length === numToKeep){
                // already selected everything
                socket.emit('action', {name: "ExchangeResponse", target: null, additionalData: cardsToKeep}); 
                setRoundState("WAITING_FOR_OTHERS")
            }
        }
    }


    // function isWaiting(){
    //     if (localGameState === null){
    //         return true; 
    //     } 
    //     if (localGameState.playerStates[localGameState.activePlayerIndex].socket_id !== props.me){
    //         console.log(`not active player`)
    //         return true; 
    //     }  
    //     if (roundState !== "WAIT_FOR_ACTION"){
    //         return true; 
    //     }
    //     return false; 
    // }

    function gameStateDebugPanel(){
        // TODO  
        return(
            <div>
                <p> I am {props.me} </p>
            <pre>
                {JSON.stringify(localGameState, null, 2)}
            </pre>
            </div>
        )      
    }

    function doXOrSkipPanel(actions) {
        return(
            <div>
                {actions.map(action => {
                    return <button class="btn" onClick={() => onBlockOrChallengeDecision(action)}>{action}</button>
                })}
                <button class="btn" onClick={() => onBlockOrChallengeDecision('Skip')}>Skip</button>
            </div>
        )
    }

    function onBlockOrChallengeDecision(action){
        console.log('Block or Challenge action chosen'); 
        socket.emit('action', {name: action, target: null})
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
            roundState === "WAIT_FOR_SURRENDER" && selectAliveCardsPanel('Surrender')
        }
        {roundState === "SELECT_TARGET" && selectTarget(currentAction)}
        {roundState === "WAIT_FOR_EXCHANGE" && selectExchangeTarget()}
        {roundState === "WAIT_FOR_BLOCK" && doXOrSkipPanel(['Block'])}
        {roundState === "WAIT_FOR_CHALLENGE" && doXOrSkipPanel(['Challenge'])}
        {roundState === "WAIT_FOR_CHALLENGE_OR_BLOCK" && doXOrSkipPanel(['Challenge', 'Block'])}
        {roundState === "WAIT_FOR_REVEAL" && selectAliveCardsPanel('Reveal')}
        {hasError && <h3 className="error">Not enough Tokens</h3>}
        {localGameState !== null && <EventLog logs={localGameState.logs}/>}
        {localGameState !== null && gameStateDebugPanel()}
        </div>
    )
}