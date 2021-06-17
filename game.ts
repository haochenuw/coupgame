
import { GameState, RoundState, Card, Action} from "./types";
import * as constants from "./constants"; 
import {logDebug} from "./utils"; 

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
        playerIds: playerIds,
        activePlayerIndex: 0, // for debug
        // TODO activePlayerIndex: Math.floor(Math.random() * 2), 
        challengingPlayerId: null, 
        playerToSurrender: -1, 
        playerStates: [{
            lifePoint: 2,
            cards: [shuffled_deck.pop(), shuffled_deck.pop()],
            tokens: 2,
        },
        {
            lifePoint: 2,
            cards: [shuffled_deck.pop(), shuffled_deck.pop()],
            tokens: 2,
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

export function commitAction(gameState: GameState): GameState{
    // remove first element 
    const action = gameState.pendingActions.shift(); 
    const parsedAction: Action = Action[action.name]; 
    console.log(constants.FgGreen, `commiting action = ${parsedAction}`); 
    switch (parsedAction) {
        case Action.Income:
            gameState.playerStates[gameState.activePlayerIndex].tokens += constants.INCOME_RATE; 
            break;
        case Action.Coup: 
            // TODO validate 
            gameState.playerStates[action.target].lifePoint -= 1; 
            gameState.playerStates[gameState.activePlayerIndex].tokens -= constants.COUP_COST; 
            gameState.roundState = RoundState.WaitForSurrender;
            gameState.playerToSurrender = action.target;
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
            gameState.playerToSurrender = action.target;
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
            console.log(constants.FgRed, "No such action exists!");
            break;
    }
    return gameState; 
}

// export function commitActionAndContinue(gameState: GameState, roomName:string): GameState{
//     let newGameState = commitAction(gameState);
//     endOrContinueGame(newGameState, roomName);  
//     swapPlayers(newGameState); 
//     newGameState.roundState = RoundState.WaitForAction;
//     return newGameState; 
// }

