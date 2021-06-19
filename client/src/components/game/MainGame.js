import React, { useState, useContext, useEffect } from 'react'

import { SocketContext } from "./../Room";

export default function MainGame (props){
    console.log('I am ', props.me)
    const socket = useContext(SocketContext);

    const [roundState, setRoundState] = useState("WAIT_FOR_ACTION")

    const [gameState, setGameState] = useState(null);

    useEffect(() =>{
        socket.on('gameState', gameState => {
            console.log(`got game state, ${JSON.stringify(gameState)}`)
            setGameState(gameState)
        });
    }, []);

    function actionPanel(){
        return( 
            <>
            <h1> Please choose an action</h1>
            <button onClick={income}>Income</button>
            <button onClick={coup}>Coup</button>
            {/* <a onclick="taxAction()">Tax</a>
            <a onclick="foreignAidAction()">Foreign Aid</a>
            <a onclick="assasinateAction()">Assasinate</a>
            <a onclick="stealAction()">Steal</a> */}
            </>
        )
    }

    function playerStatePanel(){
        if (gameState === null){
            return null 
        }
        return(
            gameState.playerStates.map((playerState) => {
                return <div>
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
    
    function income() {
        console.log('income clicked')
        socket.emit('action', {name:'Income', target: null})
    }

    function coup() {
        console.log('coup clicked')
        socket.emit('coup')
        setRoundState('SELECT_TARGET')
    }

    function waitForSurrender() {
        return (
            <h1> Choose a card to surrender...</h1>
        )
    }

    function isWaiting(){
        if (gameState === null){
            return true; 
        } 
        if (gameState.playerIds[gameState.activePlayerIndex] !== props.me){
            console.log(`action player = ${gameState.playerIds[gameState.activePlayerIndex]}`)
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
        {waiting}
        {
           !isWaiting() && actionPanel()
        }
        {
            roundState === "SELECT_SURRENDER" && waitForSurrender()
        }
        </div>
    )
}