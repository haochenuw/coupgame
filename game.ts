
import { GameState, RoundState, Card, Action, PlayerAction, PlayerState, isBlockable} from "./types";
import * as constants from "./constants"; 
import {logDebug, logError, logInfo} from "./utils"; 
import { parse } from "path/posix";

export function initGame(players): GameState {
    // logDebug(`initial deck = ${JSON.stringify(constants.INITIAL_DECK)}`); 
    let initial_deck = [
    ];

    let ind = 0; 
    for(let i = 0; i < constants.NUM_EACH_CARD; i++){
        for(let j = 0; j < constants.CARD_TYPES.length; j++){
            initial_deck.push(Object.assign({}, constants.CARD_TYPES[j], {index: ind})); 
            ind++; 
        }
    }


    let shuffled_deck = initial_deck
    .map((a) => ({sort: Math.random(), value: a}))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);

    let initialPlayerStates = players.map(player => {
        return {
            lifePoint: 2,
            cards: [shuffled_deck.pop(), shuffled_deck.pop()],
            tokens: constants.INITIAL_TOKENS,
            socket_id: player.client_id, 
            friendlyName: player.name
        }
    }); 

    return {
        // activePlayerIndex: 0, // for debug
        activePlayerIndex: Math.floor(Math.random() * players.length), 
        challengingPlayerIndex: null, 
        surrenderingPlayerIndex:  null,
        playerStates: initialPlayerStates,
        deckState: shuffled_deck,
        roundState: RoundState.WaitForAction, 
        pendingActions: [],
        pendingExchangeCards: null, 
        playersWhoSkippedBlock: [], 
        playersWhoSkippedChallenge: [], 
        surrenderReason: null, 
        logs: [], 
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
    let max = gameState.playerStates.length; 
    let b = a;
    for(let i = 0 ; i < max; i++){
        b += 1; 
        b %= max; 
        if (gameState.playerStates[b].lifePoint != 0){
            return b; 
        }
    }
    return b; 
}

function isRevealLegit(card: Card, pendingActions: Array<PlayerAction>): boolean{
    logInfo("Checking if reveal is legit..."); 
    logInfo(`card = ${JSON.stringify(card)}`); 
    logInfo(`pendingActions = ${JSON.stringify(pendingActions)}`); 

    if (pendingActions.length === 0){
        logError("invalid pending action length "); 
    }
    let action = pendingActions[0]
    if (action.name === Action.Block){
        // revealing a challenge a block
        if (pendingActions.length < 2){
            logError("invalid pending action length "); 
            return false; 
        }
        return card.blocksAction === pendingActions[1].name; 
    } 
    return card.action === action.name; 
}

export function commitAction(gameState: GameState): GameState{
    // remove first element 
    const action = gameState.pendingActions.shift(); 
    logInfo(`commiting action = ${JSON.stringify(action)}`); 
    const parsedAction: Action = Action[action.name]; 
    let targetIndex, surrendererIndex; 
    let sourceIndex = computeIndex(gameState, action.source);
    let source = gameState.playerStates[sourceIndex]; 
    let sourceName = source.friendlyName;
    let alivePlayers = computeAlivePlayers(gameState.playerStates);  

    switch (parsedAction) {
        case Action.Reveal: 
            let cardIndex = source.cards.findIndex(card => card.name === action.target && !card.isRevealed);
            logDebug(`revealing card index ${cardIndex}`); 
            let card = source.cards[cardIndex]; 
            if (isRevealLegit(card, gameState.pendingActions)){
                // legit reveal 
                logInfo('reveal is legit'); 
                // 1. get new card to revealing player
                let deck = gameState.deckState; 
                deck.push(card); 
                logDebug(`before shuffle = ${JSON.stringify(deck)}`); 
                deck = shuffle(deck); 
                logDebug(`after shuffle = ${JSON.stringify(deck)}`); 
                let newCard = deck.pop(); 
                source.cards[cardIndex] = newCard; 
                gameState.deckState = deck; 
                // 2. challenging player lose a life and surrenders
                logInfo('waiting for challenger to choose a card to surrender...'); 
                let challengingPlayerName = gameState.playerStates[gameState.challengingPlayerIndex].friendlyName;
                gameState.playerStates[gameState.challengingPlayerIndex].lifePoint -=1; 
                gameState.logs.splice(0, 0, challengingPlayerName + " lost a life"); 
                gameState.surrenderingPlayerIndex = gameState.challengingPlayerIndex; 
                gameState.roundState = RoundState.WaitForSurrender; 
                gameState.surrenderReason = Action.Challenge; 
            } else{
                logInfo('False Reveal...'); 
                card.isRevealed = true; 
                gameState.playerStates[sourceIndex].lifePoint -= 1; 
                gameState.logs.splice(0, 0, sourceName + " lost a life"); 
                gameState.surrenderingPlayerIndex = sourceIndex; 
                // action is nullified. Move to next player. 
                gameState.pendingActions = []; 
                gameState.activePlayerIndex = computeNextPlayer(gameState); 
                gameState.roundState = RoundState.WaitForAction;
            }
            break; 

        case Action.Skip: 
            // What is user skipping? 
            switch (gameState.roundState){
            case RoundState.WaitForChallenge: 
                // Transform and call skip challenge.
                gameState.pendingActions.splice(0,0, {name: Action.SkipBlock, source: action.source, target: action.target }); 
                return commitAction(gameState); 

            case RoundState.WaitForBlock: 
                // Transform and call skipblock.
                gameState.pendingActions.splice(0,0, {name: Action.SkipBlock, source: action.source, target: action.target }); 
                return commitAction(gameState); 

            // Separate skip challenge, skip block, or skip both.  
            case RoundState.WaitForChallengeOrBlock: 
                let numPlayersWhoCanBlock = gameState.pendingActions[0].target === null ? (alivePlayers -1): 1; 
                if (!gameState.playersWhoSkippedChallenge.includes(sourceName)){
                    gameState.playersWhoSkippedChallenge.push(sourceName); 
                }
                if (!gameState.playersWhoSkippedBlock.includes(sourceName)){
                    // validate 
                    let target = gameState.pendingActions[0].target;
                    if (target !== null && target !== sourceName){
                        logError(`ERR you should not be able to block this action. target = ${target}`)
                    } else{
                        gameState.playersWhoSkippedBlock.push(sourceName); 
                    }
                }
                if (gameState.playersWhoSkippedChallenge.length == alivePlayers - 1){
                    logInfo("all relevant players skipped challenge");
                }
                // target = null means everyone can skip
                // target != null means only the target can skip
                if (gameState.playersWhoSkippedBlock.length == numPlayersWhoCanBlock){
                    logInfo("all relevant players skipped block");
                    gameState.playersWhoSkippedChallenge = []; 
                    gameState.playersWhoSkippedBlock = []; 
                    return commitAction(gameState);
                }

                break; 
            default: 
                // shouldn't get here
                logError('invalid round state for skipping action'); 
                return; 
        }
        
        case Action.SkipChallenge: 
            logDebug(`player ${gameState.playerStates[sourceIndex].friendlyName} skips challenge`); 
            if (!gameState.playersWhoSkippedChallenge.includes(sourceName)){
                gameState.playersWhoSkippedChallenge.push(sourceName); 
            }
            if (gameState.playersWhoSkippedChallenge.length == alivePlayers - 1){
                // if everyone other than the actor skips, then execute action. 
                logInfo("all relevant players skipped challenge");
                gameState.playersWhoSkippedChallenge = []; 
                if (isBlockable(gameState.pendingActions[0].name as Action)){
                    gameState.roundState = RoundState.WaitForBlock; 
                    return gameState; 
                }
                else{
                    return commitAction(gameState); 
                }
            }
            break; 
        case Action.Challenge: 
            logDebug(`player ${gameState.playerStates[sourceIndex].friendlyName} tries to challenge`); 
            gameState.roundState = RoundState.WaitForReveal; 
            gameState.challengingPlayerIndex = sourceIndex; 
            break; 
        case Action.Block: 
            sourceIndex = computeIndex(gameState, action.source);
            logDebug(`player ${gameState.playerStates[sourceIndex].friendlyName} tries to block`); 
            // TODO handle challenge of blocks 
            gameState.pendingActions.shift(); 
            break; 
        case Action.SkipBlock: 
            sourceIndex = computeIndex(gameState, action.source);
            let name = gameState.playerStates[sourceIndex].friendlyName;
            logDebug(`player ${name} skips block`); 
            if (!gameState.playersWhoSkippedBlock.includes(name)){
                gameState.playersWhoSkippedBlock.push(name); 
            }
            let numbersToSkip = gameState.pendingActions[0].target === null ? (alivePlayers -1): 1; 
            
            // if everyone skipped
            if (gameState.playersWhoSkippedBlock.length === numbersToSkip){
                logInfo("all relevant players skipped block");
                // reset the state  
                gameState.playersWhoSkippedBlock = [];
                return commitAction(gameState); 
            }
            
            break; 
        case Action.Surrender: 
            let cards = gameState.playerStates[gameState.surrenderingPlayerIndex].cards; 
            logDebug(`cards = ${JSON.stringify(cards)}`); 
            cards.filter(card => card.name === action.target && card.isRevealed === false)[0]
            .isRevealed = true; 

            // Think about different paths. 
            // 1. coup / assasinate. In this case just move to next player. 
            // 2. challenge failed. 
            // TO distinguish, maybe add a "surrender reason". 
            if (gameState.surrenderReason !== Action.Challenge){
                gameState.activePlayerIndex = computeNextPlayer(gameState); 
                gameState.roundState = RoundState.WaitForAction;
                return gameState; 
            } else{
                // failed challenge 
                let pendingAction = gameState.pendingActions[0]; 
                logDebug(`pending action = ${JSON.stringify(pendingAction)}`); 

                if (isBlockable(pendingAction.name as Action)){
                    logInfo(`block after challenge...`); 
                    gameState.roundState = RoundState.WaitForBlock;
                    return gameState; 
                } else{
                    // commit the action. 
                    return commitAction(gameState); 
                }
            }
        case Action.Income:
            gameState.playerStates[gameState.activePlayerIndex].tokens += constants.INCOME_RATE; 
            break;
        case Action.Coup: 
            // TODO validate 
            surrendererIndex = computeIndexFromName(gameState, action.target);
            gameState.playerStates[surrendererIndex].lifePoint -= 1; 
            gameState.logs.splice(0, 0, action.target + " lost a life"); 
            gameState.playerStates[gameState.activePlayerIndex].tokens -= constants.COUP_COST; 
            gameState.surrenderReason = Action.Coup; 
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
            targetIndex = computeIndexFromName(gameState, action.target);
            if (targetIndex < 0){
                logError(`target ${action.target} not found`); 
            }
            gameState.playerStates[targetIndex].lifePoint -= 1; 
            gameState.logs.splice(0, 0, action.target + " lost a life"); 
            // gameState.playerStates[gameState.activePlayerIndex].tokens -= constants.ASSASINATE_COST; 
            gameState.roundState = RoundState.WaitForSurrender;
            gameState.surrenderReason = Action.Assasinate; 
            gameState.surrenderingPlayerIndex = targetIndex; 
            break;     
        case Action.Steal: 
            targetIndex = computeIndexFromName(gameState, action.target);
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
            logInfo(`Pending exchange cards = ${JSON.stringify(gameState.pendingExchangeCards)}`); 

            // clear exchange cards. 
            cardsToKeep.forEach((cardName) => {
                let index = gameState.pendingExchangeCards.map(card => card.name).indexOf(cardName); 
                if (index < 0){
                    logError(`exchange card does not exist`);   
                    return; 
                }
                let card = gameState.pendingExchangeCards.splice(index, 1)[0]; 
                gameState.playerStates[gameState.activePlayerIndex].cards.push(card);
            }); 
            logInfo(`Pending exchange cards after = ${JSON.stringify(gameState.pendingExchangeCards)}`); 

            // unwanted cards are put back to the dek
            gameState.deckState = gameState.deckState.concat(gameState.pendingExchangeCards); 
            // flush the pending area. 
            gameState.pendingExchangeCards = [];   
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
            return false; 
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

function computeIndexFromName(gameState:GameState, target: string) {
    return gameState.playerStates.map(state => state.friendlyName).indexOf(target); 
}

function isValidCost(action: PlayerAction, clientId: string, state: GameState): boolean{
    let tokens = state.playerStates.find(player => player.socket_id === clientId).tokens; 
    logDebug(`tokens = ${tokens}`); 
    if (action.name as Action === Action.Assasinate){
        return tokens >= constants.ASSASINATE_COST; 
    } 
    if (action.name as Action === Action.Coup){
        return tokens >= constants.COUP_COST; 
    } 
    return true; 
}

export function isValidAction(action: PlayerAction, clientId: string, state: GameState){
    if (
        state.roundState === RoundState.WaitForAction 
        && 
        clientId === state.playerStates[state.activePlayerIndex].socket_id){
        // Check the cost 
        let validCost = isValidCost(action, clientId, state);
        logDebug(`isValid cost? ${validCost}`); 
        return validCost; 
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
    } else if (
        state.roundState === RoundState.WaitForBlock 
        && 
        (action.name === "SkipBlock" || action.name === "Block" || action.name === "Skip")) {
        return true; 
    } else if (
        state.roundState === RoundState.WaitForChallenge 
        && 
        (action.name === "SkipChallenge" || action.name === "Challenge" || action.name === "Skip")) {
        return true; 
    } else if (
        state.roundState === RoundState.WaitForChallengeOrBlock 
        && 
        (action.name === "Skip" || action.name === "Challenge" || action.name === "Block")) {
        return true; 
    }  
    else if (
        state.roundState === RoundState.WaitForReveal 
        && 
        action.name === "Reveal"){
        return true; 
    }
    logError(`Invalid action: not the right action`); 
    logDebug(`state = ${JSON.stringify(state)}`); 
    logDebug(`client id = ${clientId}`); 
    logDebug(`action = ${JSON.stringify(action)}`); 
    return false; 
}

export function nextPlayer(gameState: GameState){
    gameState.activePlayerIndex += 1;      
    gameState.activePlayerIndex %= gameState.playerStates.length; 
    gameState.roundState = RoundState.WaitForAction; 
    return gameState; 
}

export function computeAlivePlayers(playerStates: Array<PlayerState>): number{
    return playerStates.filter(state => state.lifePoint > 0).length; 
}

export function checkForWinner(gameState: GameState): string | null {
    let remainingPlayers = 0; 
    let remainingPlayerIndex = -1; 
    for (let i = 0; i < gameState.playerStates.length; i++){
        if (gameState.playerStates[i].lifePoint !=0){
            remainingPlayers++; 
            remainingPlayerIndex = i; 
        }
    }
    if (remainingPlayers == 1){
        return gameState.playerStates[remainingPlayerIndex].friendlyName;
    }
    return null; 
}

// mask gamestate. 
export function maskState(gameState: GameState, playerId: string): GameState{
    let copyState = JSON.parse(JSON.stringify(gameState))

    copyState.playerStates.forEach(function(state, index, arr)  {
        state = state as PlayerState; 

        if (state.socket_id !== playerId){
            // mask all cards that are not revealed. 
            state.cards = state.cards.map(card => {
                if (card.isRevealed === true){
                    return card; 
                }
                return constants.MaskedCard; 
            }); 
        }
        arr[index] = state; 
    });
    copyState.deckState = null; 
    return copyState; 
}

