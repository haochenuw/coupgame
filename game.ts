
import { GameState, RoundState, Card, Action, PlayerAction} from "./types";
import * as constants from "./constants"; 
import {logDebug, logError, logInfo} from "./utils"; 

export function initGame(playerIds): GameState {
    // logDebug(`initial deck = ${JSON.stringify(constants.INITIAL_DECK)}`); 
    let initial_deck = [
        Object.assign({}, constants.CARD_TYPES[0], {index: 0}), 
        Object.assign({}, constants.CARD_TYPES[1], {index: 1}), 
        Object.assign({}, constants.CARD_TYPES[2], {index: 2}), 
        Object.assign({}, constants.CARD_TYPES[3], {index: 3}), 
        Object.assign({}, constants.CARD_TYPES[0], {index: 0}), 
        Object.assign({}, constants.CARD_TYPES[1], {index: 1}), 
        Object.assign({}, constants.CARD_TYPES[2], {index: 2}), 
        Object.assign({}, constants.CARD_TYPES[3], {index: 3}), 
        Object.assign({}, constants.CARD_TYPES[0], {index: 0}), 
        Object.assign({}, constants.CARD_TYPES[1], {index: 1}), 
        Object.assign({}, constants.CARD_TYPES[2], {index: 2}), 
        Object.assign({}, constants.CARD_TYPES[3], {index: 3}), 
    ];

    let shuffled_deck = initial_deck
    .map((a) => ({sort: Math.random(), value: a}))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
    return {
        activePlayerIndex: 0, // for debug
        // TODO activePlayerIndex: Math.floor(Math.random() * 2), 
        challengingPlayerIndex: null, 
        surrenderingPlayerIndex:  null,
        playerStates: [{
            lifePoint: 2,
            cards: [shuffled_deck.pop(), shuffled_deck.pop()],
            tokens: 2,
            socket_id: playerIds[0]
        },
        {
            lifePoint: 2,
            cards: [shuffled_deck.pop(), shuffled_deck.pop()],
            tokens: 2,
            socket_id: playerIds[1]
        }],
        deckState: shuffled_deck,
        roundState: RoundState.WaitForAction, 
        pendingActions: [],
    }
}

export function shuffle(deck:Array<Card>): Array<Card> {
    return deck
    .map((a) => ({sort: Math.random(), value: a}))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
}

function computeNextPlayer(gameState){
    let a = gameState.activePlayerIndex; 
    let b = a;
    let max = gameState.playerStates.length; 
    while(b == a|| gameState.playerStates[b].lifePoint == 0){
        b+=1;
        b %= max; 
    }
    return b; 
}

export function commitAction(gameState: GameState): GameState{
    // remove first element 
    const action = gameState.pendingActions.shift(); 
    logInfo(`commiting action = ${JSON.stringify(action)}`); 
    const parsedAction: Action = Action[action.name]; 
    switch (parsedAction) {
        case Action.Surrender: 
            let cards = gameState.playerStates[gameState.surrenderingPlayerIndex].cards; 
            logDebug(`cards = ${JSON.stringify(cards)}`); 
            cards.filter(card => card.name === action.target && card.isRevealed === false)[0]
            .isRevealed = true; 
            gameState.activePlayerIndex = computeNextPlayer(gameState); 
            gameState.roundState = RoundState.WaitForAction; 
            break; 
        case Action.Income:
            gameState.playerStates[gameState.activePlayerIndex].tokens += constants.INCOME_RATE; 
            gameState.activePlayerIndex = computeNextPlayer(gameState); 
            gameState.roundState = RoundState.WaitForAction; 
            break;
        case Action.Coup: 
            // TODO validate 
            let surrendererIndex = computeIndex(gameState, action.target);
            gameState.playerStates[surrendererIndex].lifePoint -= 1; 
            gameState.playerStates[gameState.activePlayerIndex].tokens -= constants.COUP_COST; 
            gameState.roundState = RoundState.WaitForSurrender;
            // compute the player to surrender
            gameState.surrenderingPlayerIndex = surrendererIndex; 
            break; 
        case Action.Tax: 
            gameState.playerStates[gameState.activePlayerIndex].tokens += constants.TAX_AMOUNT; 
            break;     
        case Action.ForeignAid: 
            gameState.playerStates[gameState.activePlayerIndex].tokens += constants.FOREIGN_AID_AMOUNT; 
            break;     
        case Action.Assasinate: 
            // TODO validate. 
            gameState.playerStates[action.target].lifePoint -= 1; 
            gameState.playerStates[gameState.activePlayerIndex].tokens -= constants.ASSASINATE_COST; 
            gameState.roundState = RoundState.WaitForSurrender;
            gameState.activePlayerIndex = computeIndex(gameState, action.target); 
            break;     
        case Action.Steal: 
            let stealCount = Math.min(gameState.playerStates[action.target].tokens, constants.STEAL_AMOUNT); 
            gameState.playerStates[action.target].tokens -= stealCount; 
            gameState.playerStates[action.source].tokens += stealCount; 
            break;     
        case Action.Block: 
            gameState.pendingActions = []; 
            break;     
        default:
            logError("No such action exists!");
            break;
    }
    // in case of absolute actions, move to next player. 
    if (parsedAction === Action.Income){

    }


    return gameState; 
}

function computeIndex(gameState:GameState, target: string) {
    return gameState.playerStates.map(state => state.socket_id).indexOf(target); 
}

export function isValidAction(action: PlayerAction, clientId: string, state: GameState){
    if (
        state.roundState === RoundState.WaitForAction 
        && 
        clientId === state.playerStates[state.activePlayerIndex].socket_id){
        return true; 
    } else if (
        state.roundState === RoundState.WaitForSurrender 
        && 
        clientId === state.playerStates[state.surrenderingPlayerIndex].socket_id) {
        return true; 
    }
    logError("Invalid action: not your turn"); 
    // TODO: custom validation 
    return false; 
}

export function nextPlayer(gameState: GameState){
    gameState.activePlayerIndex += 1;      
    gameState.activePlayerIndex %= gameState.playerStates.length; 
    gameState.roundState = RoundState.WaitForAction; 
    return gameState; 
}
