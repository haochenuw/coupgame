import React, { useState, useContext, useEffect } from 'react'
import '../styles/styles.css';
import { SocketContext } from "./../Room";
import EventLog from "./EventLog"
import '../styles/buttons.css';
import CardModal from './CardModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee, faHeart } from '@fortawesome/free-solid-svg-icons'
import ActionBanner  from './ActionBanner';
import {ActionPanel, ACTIONS} from './ActionPanel';

const heartIcon = <FontAwesomeIcon icon={faHeart} />

export default function MainGame(props) {
    const COUP_COST = 7;
    const ASSASINATE_COST = 3;
    const tokenIcon = <img className="tokenImg" src="data:image/svg+xml;base64,PHN2ZyBpZD0iQ2FwYV8xIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PHBhdGggZD0ibTQzNC42MTggODQuNTk2Yy0uMDA4LS4wMDctLjAxNC0uMDEyLS4wMjItLjAxOWwtNzUuMDM5LTI1LjgyMS0xMzAuOTk0IDI1LjgyMnY1Ny4xNDFsMjE0LjU4NSAzNS40MDIgMzguMjY2LTM1LjQwMmMtMTIuNDQtMjEuNDk2LTI4LjI5MS00MC43ODktNDYuNzk2LTU3LjEyM3oiIGZpbGw9IiNlN2E1MmUiLz48ZyBmaWxsPSIjZTdhNTJlIj48cGF0aCBkPSJtNDM0LjU5OCA0MjcuNDIyLTk3Ljk0My0xOC42MzUtMTA4LjA5MiAxOC42MzV2NTcuMTQxaDU0Ljg3NGM1Ny4zODcgMCAxMDkuODMtMjEuMTUyIDE0OS45NjYtNTYuMDgyIi8+PHBhdGggZD0ibTIyOC41NjMgMzcwLjI4MiAxNTQuNTM3IDIyLjM3IDk4LjMxNS0yMi4zNzFjMTAuMjMxLTE3LjY4NiAxOC4xNjYtMzYuODY4IDIzLjM4NC01Ny4xNDFsLTExNC45NjYtMzMuMTQ0LTE2MS4yNyAzMy4xNDR6Ii8+PC9nPjxwYXRoIGQ9Im01MDQuNzk5IDE5OC44NTktNzAuMjAxLTQxLjkyOS0yMDYuMDM1IDQxLjkyOXY1Ny4xNDFsMjI0Ljk2MyA0MC42MiA1OC40NzQtNDAuNjJjMC0xOS43MzQtMi40OTgtMzguODc2LTcuMjAxLTU3LjE0MXoiIGZpbGw9IiNlN2E1MmUiLz48cGF0aCBkPSJtNDgwLjEzMSAyNTZjMC0xMjYuMjMyLTEwMi4zMzEtMjI4LjU2My0yMjguNTYzLTIyOC41NjMtNy43NjUgMC0xNS40MzguMzkxLTIzLjAwNCAxLjE0OHY0NTUuOTc5aDIzLjAwNGMxMjYuMjMxLS4wMDEgMjI4LjU2My0xMDIuMzMyIDIyOC41NjMtMjI4LjU2NHoiIGZpbGw9IiNlMjg0MjQiLz48ZyBmaWxsPSIjYzg1OTI5Ij48cGF0aCBkPSJtNDM0LjU5OCA4NC41NzhjLTQwLjI5LTM1LjU1Ni05My4yMDEtNTcuMTQxLTE1MS4xNjEtNTcuMTQxaC01NC44NzR2NTcuMTQxeiIvPjxwYXRoIGQ9Im0yMjguNTYzIDE5OC44NTloMjc2LjIzNmMtNS4yMTgtMjAuMjczLTEzLjE1My0zOS40NTQtMjMuMzg0LTU3LjE0MWgtMjUyLjg1MnoiLz48cGF0aCBkPSJtMjI4LjU2MyAzMTMuMTQxaDI3Ni4yMzZjNC43MDEtMTguMjY0IDcuMjAxLTM3LjQxIDcuMjAxLTU3LjE0MWgtMjgzLjQzN3oiLz48cGF0aCBkPSJtMjI4LjU2MyA0MjcuNDIyaDIwNi4wMzVjMTguNTE4LTE2LjM0MiAzNC4zNzMtMzUuNjI5IDQ2LjgxNy01Ny4xNDFoLTI1Mi44NTJ6Ii8+PC9nPjxwYXRoIGQ9Im00NDkuNTQ1IDM3MC4yODJoLTIyMC45ODJ2NTcuMTQxaDE3NC4xNjVjMTguNTE4LTE2LjM0MiAzNC4zNzMtMzUuNjMgNDYuODE3LTU3LjE0MXoiIGZpbGw9IiNiOTQwMjkiLz48cGF0aCBkPSJtNDgwLjEzMSAyNTZoLTI1MS41Njd2NTcuMTQxaDI0NC4zNjZjNC43LTE4LjI2NCA3LjIwMS0zNy40MSA3LjIwMS01Ny4xNDF6IiBmaWxsPSIjYjk0MDI5Ii8+PHBhdGggZD0ibTQ0OS41NDUgMTQxLjcxOGgtMjIwLjk4MnY1Ny4xNDFoMjQ0LjM2N2MtNS4yMTgtMjAuMjczLTEzLjE1My0zOS40NTQtMjMuMzg1LTU3LjE0MXoiIGZpbGw9IiNiOTQwMjkiLz48cGF0aCBkPSJtMjUxLjU2NyAyNy40MzdjLTcuNzY1IDAtMTUuNDM4LjM5MS0yMy4wMDQgMS4xNDh2NTUuOTkzaDE3NC4xNjVjLTQwLjI5LTM1LjU1Ni05My4yMDEtNTcuMTQxLTE1MS4xNjEtNTcuMTQxeiIgZmlsbD0iI2I5NDAyOSIvPjxjaXJjbGUgY3g9IjIyOC41NjMiIGN5PSIyNTYiIGZpbGw9IiNmNmUyNjYiIHI9IjIyOC41NjMiLz48cGF0aCBkPSJtNzYuODU3IDQyNi45MzljMTEuNTU1IDEwLjI2MiAyNC4xNDggMTkuMzc5IDM3LjYxNyAyNy4xNTNsNjIuNjk3LTQyMC44NTJjLTE1LjI3MyAzLjUwOS0yOS45NTYgOC41NTctNDMuODkgMTQuOTU3eiIgZmlsbD0iI2ZiZjRhZiIvPjxwYXRoIGQ9Im0yMjguNTYzIDI3LjQzN2MtNC4xNTQgMC04LjI4LjExOC0xMi4zOC4zMzcgMTIwLjQ3NSA2LjQzMSAyMTYuMTgzIDEwNi4xNDggMjE2LjE4MyAyMjguMjI2cy05NS43MDkgMjIxLjc5NS0yMTYuMTgzIDIyOC4yMjdjNC4xLjIxOSA4LjIyNi4zMzcgMTIuMzguMzM3IDEyNi4yMzIgMCAyMjguNTYzLTEwMi4zMzEgMjI4LjU2My0yMjguNTYzcy0xMDIuMzMxLTIyOC41NjQtMjI4LjU2My0yMjguNTY0eiIgZmlsbD0iI2VhYjE0ZCIvPjxjaXJjbGUgY3g9IjIyOC41NjMiIGN5PSIyNTYiIGZpbGw9IiNlN2E1MmUiIHI9IjE4NC4wNzciLz48cGF0aCBkPSJtMjI4LjU2MyA3MS45MjNjLTQuNjA0IDAtOS4xNjguMTc0LTEzLjY4Ny41MDcgOTUuMjcgNy4wMDMgMTcwLjM5IDg2LjUxMiAxNzAuMzkgMTgzLjU3cy03NS4xMTkgMTc2LjU2Ny0xNzAuMzkgMTgzLjU3YzQuNTIuMzMyIDkuMDgzLjUwNyAxMy42ODcuNTA3IDEwMS42NjMgMCAxODQuMDc3LTgyLjQxNCAxODQuMDc3LTE4NC4wNzdzLTgyLjQxNC0xODQuMDc3LTE4NC4wNzctMTg0LjA3N3oiIGZpbGw9IiNlMjg0MjQiLz48cGF0aCBkPSJtODUuMTM2IDM3MS4zNzFjMTAuNTQxIDEzLjA4OCAyMi44MyAyNC43MDggMzYuNTIzIDM0LjQ5NGw0OC4zMzEtMzI0LjQyMmMtMTYuMTA5IDUuNDAzLTMxLjIyMSAxMi45NzUtNDQuOTk0IDIyLjM2NnoiIGZpbGw9IiNlYWIxNGQiLz48cGF0aCBkPSJtMjM0LjE4MyAxNTQuNTkyIDM0Ljc0OSA1My4zODVjLjkwMSAxLjM4NSAyLjI4MiAyLjM4OCAzLjg3OCAyLjgxN2w2MS41MSAxNi41NTFjNC42ODIgMS4yNiA2LjUyMSA2LjkxOSAzLjQ3MyAxMC42OWwtNDAuMDM0IDQ5LjU0NWMtMS4wMzggMS4yODUtMS41NjYgMi45MDgtMS40ODEgNC41NThsMy4yNjYgNjMuNjE0Yy4yNDkgNC44NDItNC41NjUgOC4zMzktOS4wOTMgNi42MDdsLTU5LjQ5MS0yMi43NjRjLTEuNTQzLS41OS0zLjI1LS41OS00Ljc5MyAwbC01OS40OTEgMjIuNzY0Yy00LjUyOCAxLjczMy05LjM0Mi0xLjc2NS05LjA5My02LjYwN2wzLjI2Ni02My42MTRjLjA4NS0xLjY1LS40NDMtMy4yNzMtMS40ODEtNC41NThsLTQwLjAzNC00OS41NDVjLTMuMDQ3LTMuNzcxLTEuMjA5LTkuNDMgMy40NzMtMTAuNjlsNjEuNTEtMTYuNTUxYzEuNTk1LS40MjkgMi45NzYtMS40MzMgMy44NzgtMi44MTdsMzQuNzQ5LTUzLjM4NWMyLjY0NC00LjA2MyA4LjU5NC00LjA2MyAxMS4yMzkgMHoiIGZpbGw9IiNjODU5MjkiLz48cGF0aCBkPSJtMzM0LjMyIDIyNy4zNDYtNjEuNTEtMTYuNTUxYy0xLjU5NS0uNDMtMi45NzYtMS40MzMtMy44NzgtMi44MTdsLTIuOTI2LTQuNDk1Yy0uMjk0IDMzLjkxOS01LjE4OCA4OC41MzItMjkuMjE3IDEzOC4zNDRsNTMuNjYyIDIwLjUzNGM0LjUyOCAxLjczMyA5LjM0Mi0xLjc2NSA5LjA5My02LjYwN2wtMy4yNjYtNjMuNjE0Yy0uMDg1LTEuNjUuNDQzLTMuMjczIDEuNDgxLTQuNTU4bDQwLjAzNC00OS41NDVjMy4wNDctMy43NzMgMS4yMDgtOS40MzEtMy40NzMtMTAuNjkxeiIgZmlsbD0iI2I5NDAyOSIvPjwvZz48L3N2Zz4=" />


    const socket = useContext(SocketContext);
    const [coupDisable, setCoupDisable] = React.useState(false);
    const [assDisable, setAssDisable] = React.useState(false);
    const [roundState, setRoundState] = useState("")

    // console.log("initial state = ", JSON.stringify(props.initialState))

    const [localGameState, setLocalGameState] = useState(props.initialState);

    // console.log("local state = ", JSON.stringify(localGameState))


    const [currentAction, setCurrentAction] = useState(null);

    const [hasError, setHasError] = useState(false);

    const [dead, setDead] = useState(false);

    useEffect(() => {

        socket.on('clientError', () => {
            setHasError(true);
            setRoundState("WAIT_FOR_ACTION");
        });

        socket.on('gameState', gameState => {
            handleRegularGameState(gameState);
        });

        setHasError(false);
        computerDerivedState(localGameState)
    }, []);



    useEffect(() => {
        setHasError(false);
        setLocalGameState(props.initialState)
        computerDerivedState(localGameState)
    }, [props.initialState]); 

    // function handleInitialState(gameState){
    //     console.log("got initial state"); 
    //     handleGameState(gameState); 
    // }

    function handleRegularGameState(gameState){
        console.log(`Got regular game state from server: ${JSON.stringify(gameState)}`)
        setLocalGameState(gameState)
        computerDerivedState(gameState)
    }

    function computerDerivedState(gameState){
        console.log("computing derived state...")
        let player = gameState.playerStates.find(state => state.friendlyName === props.myName);
        if (player.lifePoint === 0) {
            setRoundState("ELIMINATED"); 
        }
        if (!isMe(gameState)) {
            console.log("is me is false")
            setRoundState("WAITING_FOR_OTHERS");
        } else {
            console.log("is me : true")
            switch (gameState.roundState) {
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
                    setCoupDisable(isCoupDisabled(gameState))
                    setAssDisable(isAssDisabled(gameState))
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
    }

    function isCoupDisabled(gameState) {
        let playerTokens = gameState.playerStates.find(state => state.friendlyName === props.myName).tokens;
        return playerTokens < COUP_COST;
    }

    function isAssDisabled(gameState) {
        let playerTokens = gameState.playerStates.find(state => state.friendlyName === props.myName).tokens;
        return playerTokens < ASSASINATE_COST;
    }

    function actionPanel() {
        return (
            <div className="selection">
                <button className="btn btn-info" onClick={() => onActionSelected('Income')}>Income</button>
                <button className="btn btn-info" disabled={coupDisable} onClick={() => onActionSelected('Coup')}>Coup</button>
                <button className="btn btn-info" onClick={() => onActionSelected('Tax')}>Tax</button>
                <button className="btn btn-info" disabled={assDisable} onClick={() => onActionSelected('Assasinate')}>Assasinate</button>
                <button className="btn btn-info" onClick={() => onActionSelected('Exchange')}>Exchange</button>
                <button className="btn btn-info" onClick={() => onActionSelected('Steal')}>Steal</button>
                <button className="btn btn-info" onClick={() => onActionSelected('ForeignAid')}>ForeignAid</button>
            </div>
        )
    }

    function onActionSelected(action) {
        console.log(`Action ${action} selected`)
        setCurrentAction(action)
        if (requiresTarget(action)) {
            setRoundState('SELECT_TARGET')
        } else {
            socket.emit('action', { source: props.myName, name: action, target: null })
            setRoundState("WAITING_FOR_OTHERS")
        }
    }

    function requiresTarget(action) {
        switch (action) {
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

    function isMe(gameState) {
        console.log('me = ', props.myName); 
        console.log('roundstate = ', gameState.roundState); 
        // return false if player died? should allow for surrender. 
        if (gameState.playerStates.find(state => state.friendlyName === props.myName).lifePoint === 0) {
            console.log('player already died');
            return false;
        }
        if (gameState.playerStates[gameState.activePlayerIndex].friendlyName === props.myName
            && (gameState.roundState === "WAIT_FOR_ACTION" || gameState.roundState === "WAIT_FOR_EXCHANGE")) {
            return true;
        } else if (gameState.surrenderingPlayerIndex !== null
            && gameState.playerStates[gameState.surrenderingPlayerIndex].friendlyName === props.myName
            && gameState.roundState === "WAIT_FOR_SURRENDER") {
            return true;
        } else if (gameState.pendingActions.length > 0
            && computePlayersAbleToBlock(gameState).includes(props.myName)
            && gameState.roundState === "WAIT_FOR_BLOCK"
            && !gameState.pendingActions[0].playersWhoSkippedBlock.includes(props.myName)) {
            return true;
        } else if (gameState.pendingActions.length > 0
            && gameState.pendingActions[0].source !== props.myName
            && gameState.roundState === "WAIT_FOR_CHALLENGE"
            && !gameState.pendingActions[0].playersWhoSkippedChallenge.includes(props.myName)) {
            return true;
        } else if (gameState.pendingActions.length > 0
            && gameState.pendingActions[0].source !== props.myName
            && gameState.roundState === "WAIT_FOR_CHALLENGE_OR_BLOCK"
            && !gameState.pendingActions[0].playersWhoSkippedChallenge.includes(props.myName)
            && !gameState.pendingActions[0].playersWhoSkippedBlock.includes(props.myName)) {
            return true;
        }
        else if (gameState.pendingActions.length > 0
            && gameState.pendingActions[0].source === props.myName
            && gameState.roundState === "WAIT_FOR_REVEAL") {
            return true;
        }
        return false;
    }

    function playerStatePanel() {
        if (localGameState === null) {
            return null
        }

        return (
            localGameState.playerStates.map((playerState) => {
                let me = "";
                // if me, use special color. 
                if (playerState.friendlyName === props.myName) {
                    me = "me";
                }

                const tokens = []; 
                for(let i = 0; i < playerState.tokens; i++){
                    tokens.push(tokenIcon); 
                }

                const hearts = []; 
                for(let i = 0; i < playerState.lifePoint; i++){
                    hearts.push(heartIcon); 
                }

                return <div className={me}>
                    <div className={playerState.lifePoint === 0 ? "terminated-player" : "alive-player"}>
                    {playerState.friendlyName} 
                    <span>{hearts} {tokens} </span>
                    {playerState.connected === true &&<span>connected</span>}
                    {playerState.connected === false &&<span>disconnected...</span>}
                    </div>
                    <div className="cards">
                        {playerState.cards.map((card) => {
                            return (
                                <CardModal card={card}/>
                            )
                        })}
                    </div>
                </div>
            })
        )
    }


    // Display an array of buttons, given by the "options" arra,y. 
    function selectTargetPanel(action, options) {
        return (
            <div className="selection">
                <h2>Choose a target to {action} </h2>
                {options.map((item) => {
                    return (<span>
                        <button class="btn btn-warning" onClick={() => onTargetSelected(action, item)}>{item}</button>
                    </span>
                    )
                }
                )}
            </div>
        )
    }

    function onTargetSelected(action, item) {
        console.log(`target ${item} selected`);
        socket.emit('action', { source: props.myName, name: action, target: item });
    }

    function selectAliveCardsPanel(name) {
        let cards = localGameState.playerStates.filter(state => state.friendlyName === props.myName)[0].cards;
        console.log(`cards = ${JSON.stringify(cards)}`);
        return (
            selectTargetPanel(name, cards.filter(card => card.isRevealed === false).map(card => card.name))
        )
    }

    function selectPlayerTarget(action) {
        let options = localGameState.playerStates.filter(state => state.friendlyName !== props.myName && state.lifePoint > 0).map(state => state.friendlyName);
        return (
            selectTargetPanel(action, options)
        )
    }

    function selectExchangeTarget() {
        let cards = localGameState.pendingExchangeCards.map(card => card.name);
        let numToKeep = localGameState.pendingExchangeCards.length - 2;

        let cardsToKeep = [];

        return (
            <div className="selection">
                <h2>Choose {numToKeep} cards to keep </h2>
                {cards.map((item) => {
                    // if(playerState.lifePoint > 0){
                    return (<span>
                        <button class="btn btn-warning" onClick={(event) => onKeepSelected(event, item)}>{item}</button>
                    </span>
                    )
                }
                )}
            </div>
        )

        function onKeepSelected(event, item) {
            event.target.disabled = true;
            console.log(`selected ${item} to keep`)
            cardsToKeep.push(item);

            if (cardsToKeep.length === numToKeep) {
                // already selected everything
                socket.emit('action', { source: props.myName, name: "ExchangeResponse", target: null, additionalData: cardsToKeep });
                setRoundState("WAITING_FOR_OTHERS")
            }
        }
    }


    function gameStateDebugPanel() {
        return (
            <div>
                <p> I am {props.myName} </p>
                <pre>
                    {JSON.stringify(localGameState, null, 2)}
                </pre>
            </div>
        )
    }

    function alreadyMadeDecisionOnChallengeOrBlock() {
        if (localGameState === null) {
            return false;
        }
        if (localGameState.pendingActions.length === 0) {
            return false;
        }
        return localGameState.pendingActions[0].playersWhoSkippedBlock.includes(props.myName) || localGameState.pendingActions[0].playersWhoSkippedChallenge.includes(props.myName)
    }

    function BlockOrSkipPanel() {
        if (localGameState.pendingActions.length === 0) {
            return null;
        } else if (alreadySkipedBlock()) {
            return null;
        }
        return (
            <div className="selection">
                <button className="btn btn-warning" onClick={() => onBlockOrChallengeDecision('Block')}>Block</button>
                <button className="btn btn-warning" onClick={() => onBlockOrChallengeDecision('Skip')}>Skip</button>
            </div>
        )
    }

    function alreadySkipedChallenge() {
        if (localGameState === null) {
            return false;
        }
        if (localGameState.pendingActions.length === 0) {
            return false;
        }
        return localGameState.pendingActions[0].playersWhoSkippedChallenge.includes(props.myName)
    }

    function alreadySkipedBlock() {
        if (localGameState === null) {
            return false;
        }
        if (localGameState.pendingActions.length === 0) {
            return false;
        }
        return localGameState.pendingActions[0].playersWhoSkippedBlock.includes(props.myName)
    }

    function ChallengeOrSkipPanel() {
        if (alreadySkipedChallenge() || localGameState.pendingActions.length === 0) {
            return null;
        }
        const name = localGameState.pendingActions[0].source;
        return (
            <div className="selection">
                <button className="btn btn-warning" onClick={() => onBlockOrChallengeDecision('Challenge')}>Challenge {name}</button>
                <button className="btn btn-warning" onClick={() => onBlockOrChallengeDecision('Skip')}>Skip</button>
            </div>
        )
    }

    function doXOrSkipPanel(actions) {
        if (localGameState === null || localGameState.pendingActions.length === 0) {
            return null;
        } else if (alreadyMadeDecisionOnChallengeOrBlock()) {
            return null
        }
        const name = localGameState.pendingActions[0].source; 
        return (
            <div className="selection">
                {actions.map(action => {
                    if (action === "Block") {
                        let playersWhoCanBlock = computePlayersAbleToBlock(localGameState);
                        console.log(`players who can block = ${playersWhoCanBlock}`);
                        if (playersWhoCanBlock.includes(props.myName) === false) {
                            console.log("can't block");
                            return null; // can't block 
                        }
                    }
                    return <button className="btn btn-warning" onClick={() => onBlockOrChallengeDecision(action)}>{action} {name}</button>
                })}
                <button className="btn btn-warning" onClick={() => onBlockOrChallengeDecision('Skip')}>Skip</button>
            </div>
        )
    }

    function onBlockOrChallengeDecision(action) {
        console.log('Block or Challenge decision chosen');
        socket.emit('action', { source: props.myName, name: action, target: null })
    }

    // function getNameById(id) {
    //     return localGameState.playerStates.find(state => state.socket_id === id).friendlyName;
    // }

    function computePlayersAbleToBlock(gameState) {
        const action = gameState.pendingActions[0];
        let players = gameState.playerStates.filter(state => state.friendlyName !== action.source && state.lifePoint > 0);
        if (action.target !== null) {
            // only target can block
            players = players.filter(state => state.friendlyName === action.target);
        }

        return players.map(state => state.friendlyName);
    }

    function computeDisabledActions(gameState){
        let result = []; 
        if(gameState == null){
            return []; 
        }
        let playerTokens = gameState.playerStates.find(player => player.friendlyName === props.myName).tokens;
        if (playerTokens >= 10){
            return ACTIONS.filter(action => action !== 'Coup'); 
        } else{
            if (playerTokens < COUP_COST){
                result.push('Coup')
            }
            if (playerTokens < ASSASINATE_COST){
                result.push('Assasinate'); 
            }
        }
        return result; 
    }

    return (
        <div>
            {hasError && <h2 className="error">There's an error</h2>}
            {playerStatePanel()}
            {hasError && <h3 className="error">Not enough Tokens</h3>}
            {localGameState !== null && <EventLog logs={localGameState.logs} />}
            <div className="footer">
            {localGameState !== null && <ActionBanner roundState={roundState} logs={localGameState.logs}/>}
            {
                roundState === "WAIT_FOR_ACTION" && <ActionPanel onAction={onActionSelected} disabledActions={computeDisabledActions(localGameState)}/>
            }
            {
                roundState === "WAIT_FOR_SURRENDER" && selectAliveCardsPanel('Surrender')
            }
            {roundState === "SELECT_TARGET" && selectPlayerTarget(currentAction)}
            {roundState === "WAIT_FOR_EXCHANGE" && selectExchangeTarget()}
            {roundState === "WAIT_FOR_BLOCK" && BlockOrSkipPanel()}
            {roundState === "WAIT_FOR_CHALLENGE" && ChallengeOrSkipPanel()}
            {roundState === "WAIT_FOR_CHALLENGE_OR_BLOCK" && doXOrSkipPanel(['Challenge', 'Block'])}
            {roundState === "WAIT_FOR_REVEAL" && selectAliveCardsPanel('Reveal')}
            </div>
            {/* {localGameState !== null && gameStateDebugPanel()} */}
        </div>
    )
}