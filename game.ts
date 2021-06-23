
import { GameState, RoundState, Card, Action, PlayerAction} from "./types";
import * as constants from "./constants"; 
import {logDebug, logError, logInfo} from "./utils"; 
import { parse } from "path/posix";

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

    let initialPlayerStates = playerIds.map(id => {
        return {
            lifePoint: 2,
            cards: [shuffled_deck.pop(), shuffled_deck.pop()],
            tokens: constants.INITIAL_TOKENS,
            socket_id: id
        }
    }); 

    return {
        activePlayerIndex: 0, // for debug
        // TODO activePlayerIndex: Math.floor(Math.random() * 2), 
        challengingPlayerIndex: null, 
        surrenderingPlayerIndex:  null,
        playerStates: initialPlayerStates,
        deckState: shuffled_deck,
        roundState: RoundState.WaitForAction, 
        pendingActions: [],
        pendingExchangeCards: null 
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
    let targetIndex, sourceIndex; 
    switch (parsedAction) {
        case Action.Surrender: 
            let cards = gameState.playerStates[gameState.surrenderingPlayerIndex].cards; 
            logDebug(`cards = ${JSON.stringify(cards)}`); 
            cards.filter(card => card.name === action.target && card.isRevealed === false)[0]
            .isRevealed = true; 
            break; 
        case Action.Income:
            gameState.playerStates[gameState.activePlayerIndex].tokens += constants.INCOME_RATE; 
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
            targetIndex = computeIndex(gameState, action.target);
            gameState.playerStates[targetIndex].lifePoint -= 1; 
            gameState.playerStates[gameState.activePlayerIndex].tokens -= constants.ASSASINATE_COST; 
            gameState.roundState = RoundState.WaitForSurrender;
            gameState.surrenderingPlayerIndex = computeIndex(gameState, action.target); 
            break;     
        case Action.Steal: 
            targetIndex = computeIndex(gameState, action.target);
            sourceIndex = computeIndex(gameState, action.source);
            let stealCount = Math.min(gameState.playerStates[targetIndex].tokens, constants.STEAL_AMOUNT); 
            gameState.playerStates[targetIndex].tokens -= stealCount; 
            gameState.playerStates[sourceIndex].tokens += stealCount; 
            break;     
        case Action.Exchange: 
            let playerIndex = computeIndex(gameState, action.source);
            // grab the player's live cards. 
            let playerLiveCards = gameState.playerStates[playerIndex].cards.filter(card => card.isRevealed === false); 
            let playerDeadCards = gameState.playerStates[playerIndex].cards.filter(card => card.isRevealed === true);
            // player will keep the dead cards 
            gameState.playerStates[playerIndex].cards = playerDeadCards;

            // put the cards in deck
            gameState.deckState = gameState.deckState.concat(playerLiveCards); 
            // shuffle 
            gameState.deckState = shuffle(gameState.deckState); 
            
            // will draw (2+x) random cards from the deck and mix in from 
            let numCardsToMixIn = playerLiveCards.length; 
            let cardsToGiveToPlayer = []; 
            for (let i = 0; i < numCardsToMixIn + 2; i++){
                cardsToGiveToPlayer.push(gameState.deckState.pop()); 
            }   
            logInfo(`cards to give to exchange = ${JSON.stringify(cardsToGiveToPlayer)}`); 
            gameState.pendingExchangeCards = cardsToGiveToPlayer; 
            gameState.roundState = RoundState.WaitForExchange;
            break;     
        case Action.ExchangeResponse: 
            // 
            let cardsToKeep = action.additionalData; 
            logInfo(`Got cards to keep = ${JSON.stringify(cardsToKeep)}`); 

            // clear exchange cards. 
            cardsToKeep.forEach((cardName) => {
                let index = gameState.pendingExchangeCards.map(card => card.name).indexOf(cardName); 
                let card = gameState.pendingExchangeCards.splice(index, 1)[0]; 
                gameState.playerStates[gameState.activePlayerIndex].cards.push(card);
            }); 

            // unwanted cards are put back to the dek
            gameState.deckState = gameState.deckState.concat(gameState.pendingExchangeCards); 
            // flush the pending area. 
            gameState.pendingExchangeCards = []; 

        case Action.Block: 
            gameState.pendingActions = []; 
            break;     
        default:
            logError("No such action exists!");
            break;
    }
    if(isAbsoluteAction(parsedAction)){
        gameState.activePlayerIndex = computeNextPlayer(gameState); 
        gameState.roundState = RoundState.WaitForAction;
    }
    return gameState; 
}

function isAbsoluteAction(action:Action) : boolean{
    switch (action){
        case Action.Block:
            return true;
        case Action.Assasinate: // defer to surrender
            return false;
        case Action.Coup: // defer to surrender
            return false;
        case Action.Surrender:
            return true; 
        case Action.Income:
            return true; 
        case Action.Tax:
            return true; 
        case Action.Steal:
            return true; 
        case Action.Exchange:
            return false; 
        case Action.ExchangeResponse:
            return true; 
        case Action.ForeignAid:
            return true; 
        default:
            return false; 
    } 
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
    } else if (
        state.roundState === RoundState.WaitForExchange 
        && 
        clientId === state.playerStates[state.activePlayerIndex].socket_id) {
        return true; 
    }
    logError("Invalid action: not your turn"); 
    return false; 
}

export function nextPlayer(gameState: GameState){
    gameState.activePlayerIndex += 1;      
    gameState.activePlayerIndex %= gameState.playerStates.length; 
    gameState.roundState = RoundState.WaitForAction; 
    return gameState; 
}

export function checkForWinner(gameState: GameState): string | null {
    let remainingPlayers = 0; 
    let remainingPlayerIndex = -1; 
    for (let i = 0; i <  gameState.playerStates.length; i++){
        if (gameState.playerStates[i].lifePoint !=0){
            remainingPlayers++; 
            remainingPlayerIndex = i; 
        }
    }
    // only one player remaining
    if (remainingPlayers == 1){
        return gameState.playerStates[remainingPlayerIndex].socket_id;
    }
    return null; 
}
    //     function endOrContinueGame(state:GameState, roomName: string) {
    //         let winner = checkForWin(state);
    //         if (winner === null){
    //         } else{
    //             console.log(`game over, winner is ${winner}`); 
    //             io.sockets.in(roomName).emit('gameOver', JSON.stringify(winner)); 
    //         }
    //     }
