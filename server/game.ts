
import { GameState, RoundState, Card, Action, PlayerAction, PlayerState, isBlockable, SurrenderReason, isChallengeable, PlayerActionWithStatus} from "./types";
import * as constants from "./constants"; 
import {logDebug, logError, logInfo, renderLog} from "./utils"; 
import lodash from 'lodash';

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
        surrenderReason: null, 
        pendingBlock: null, 
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
    let pendingAction = gameState.pendingActions[0]; 

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
                deck = shuffle(deck); 
                let newCard = deck.pop(); 
                source.cards[cardIndex] = newCard; 
                gameState.deckState = deck; 
                // 2. challenging player lose a life and surrenders
                logInfo('waiting for challenger to choose a card to surrender...'); 
                gameState = handleLifeLost(gameState, gameState.challengingPlayerIndex, SurrenderReason.FailedChallenge);
            } else{
                logInfo('False Reveal'); 

                gameState = handleLifeLost(gameState, sourceIndex, SurrenderReason.FalseReveal, action.target); 
                return gameState;
            }
            break; 

        case Action.Skip: 
            console.log(`player ${gameState.playerStates[sourceIndex].friendlyName} skips action ${JSON.stringify(pendingAction)}`); 

            // What is user skipping? 
            switch (gameState.roundState){
            case RoundState.WaitForChallenge: 
                // Transform and call skip challenge.
                gameState.pendingActions.splice(0,0, {name: Action.SkipChallenge, source: action.source, target: action.target }); 
                return commitAction(gameState); 
            case RoundState.WaitForBlock: 
                // Transform and call skipblock.
                gameState.pendingActions.splice(0,0, {name: Action.SkipBlock, source: action.source, target: action.target }); 
                return commitAction(gameState); 
            // Skip both.  
            case RoundState.WaitForChallengeOrBlock: 
                let numPlayersWhoCanBlock = pendingAction.target === null ? (alivePlayers -1): 1; 
                if (!pendingAction.playersWhoSkippedChallenge.includes(sourceName)){
                    pendingAction.playersWhoSkippedChallenge.push(sourceName); 
                }
                if (!pendingAction.playersWhoSkippedBlock.includes(sourceName)){
                    // validate 
                    let target = pendingAction.target;
                    if (target === null || target === sourceName){
                        pendingAction.playersWhoSkippedBlock.push(sourceName); 
                    }
                }
                const allSkippedBlock = pendingAction.playersWhoSkippedBlock.length == numPlayersWhoCanBlock; 
                const allSkippedChallenge = pendingAction.playersWhoSkippedChallenge.length == alivePlayers - 1; 
                if (allSkippedChallenge && allSkippedBlock){
                    return commitAction(gameState);
                } else if (allSkippedBlock){
                    gameState.roundState = RoundState.WaitForChallenge; 
                } else if (allSkippedChallenge){
                    gameState.roundState = RoundState.WaitForBlock; 
                }
                break; 
            default: 
                // shouldn't get here
                logError(`invalid round state ${gameState.roundState} for skipping action`); 
                return; 
            }
            break; 
        
        case Action.SkipChallenge: 
            console.log(`player ${gameState.playerStates[sourceIndex].friendlyName} skips challenge`); 
            console.log(`gameState = ${JSON.stringify(gameState)}`);
            if (!pendingAction.playersWhoSkippedChallenge.includes(sourceName)){
                pendingAction.playersWhoSkippedChallenge.push(sourceName); 
            }
            console.log(`Who have skipped so far ${JSON.stringify(pendingAction.playersWhoSkippedChallenge)}`)
            if (pendingAction.playersWhoSkippedChallenge.length == alivePlayers - 1){
                // if everyone other than the actor skips, then execute action. 
                logInfo("all relevant players skipped challenge");
                // if there is a pending block then handle it
                   // 3. player can't block if it is died. 
                let shouldConsiderBlock = computeShouldConsiderBlock(gameState); 
                console.log(`should consider block = ${shouldConsiderBlock}`)

                if (shouldConsiderBlock){
                    if (gameState.pendingBlock !== null){
                        let block = gameState.pendingBlock; 
                        gameState.pendingActions.splice(0,0, block); 
                        gameState.pendingBlock = null; 
                        // block is challengeable
                        gameState.logs.splice(0, 0, renderLog(gameState.playerStates.find(state => state.socket_id === block.source).friendlyName, block.name, block.target)); 

                        gameState.roundState = RoundState.WaitForChallenge;
                        return gameState; 
                    } else {
                        gameState.roundState = RoundState.WaitForBlock; 
                        return gameState; 
                    }
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
            logDebug(`player ${gameState.playerStates[sourceIndex].friendlyName} blocks`); 
            gameState.pendingActions.shift(); 
            break; 

        case Action.SkipBlock: 
            sourceIndex = computeIndex(gameState, action.source);
            let name = gameState.playerStates[sourceIndex].friendlyName;
            logDebug(`player ${name} skips block`); 
            if (!pendingAction.playersWhoSkippedBlock.includes(name)){
                pendingAction.playersWhoSkippedBlock.push(name); 
            }
            let numbersToSkip = gameState.pendingActions[0].target === null ? (alivePlayers -1): 1; 
            
            // if everyone skipped
            if (pendingAction.playersWhoSkippedBlock.length === numbersToSkip){
                logInfo("all relevant players skipped block");
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
            // TO distinguish, added a "surrender reason". 
            if (gameState.surrenderReason === SurrenderReason.Coup || gameState.surrenderReason === SurrenderReason.Assasinate){
                logDebug('coup or assasinate'); 
                gameState.activePlayerIndex = computeNextPlayer(gameState); 
                gameState.roundState = RoundState.WaitForAction;
                return gameState; 
            } 
            else if (gameState.surrenderReason === SurrenderReason.FalseReveal){
                // First, nullify the top pending action 
                gameState.pendingActions.shift();
                gameState.pendingBlock = null;  
                // Is there still a pending action? 
                // 1. Yes, this means that the challenge succeeded on a block
                // commit the action. It could be foreign aid, ass, steal. (note income, coup, exchange, tax are not blockable)
                if(gameState.pendingActions.length > 0){
                    logDebug(`false reveal on a block..pending action = ${JSON.stringify(gameState.pendingActions)}.`); 
                    return commitAction(gameState); 
                }
                // 2. No. This means that the challenge succeeded on a regular action
                else{
                    logDebug("false reveal on a regular action..."); 
                    gameState.activePlayerIndex = computeNextPlayer(gameState); 
                    gameState.roundState = RoundState.WaitForAction;
                    return gameState; 
                }
            }
            else if (gameState.surrenderReason === SurrenderReason.FailedChallenge){
                // surrendering because of failed challenge 
                // in this case. should keep handling the action that was challenged. 
                // 1. handle block if any
                // 2. commit the action. 
                // 3. player can't block if it is died. 
                let pendingAction = gameState.pendingActions[0]; 
                const needToConsiderBlock = computeShouldConsiderBlock(gameState); 


                if (needToConsiderBlock){
                    if (gameState.pendingBlock !== null){
                        let block = gameState.pendingBlock; 
                        gameState.pendingActions.splice(0,0, block); 
                        gameState.pendingBlock = null; 
                        // block is challengeable
                        gameState.logs.splice(0, 0, renderLog(gameState.playerStates.find(state => state.socket_id === block.source).friendlyName, block.name, block.target)); 
                        gameState.roundState = RoundState.WaitForChallenge;
                        return gameState; 
                    } 
                    // if still have player who did not made decision about block
                    else 
                    {
                        // TODO: check if some players has made decisions. 
                        logInfo(`Dealing with block after challenge...`); 
                        gameState.roundState = RoundState.WaitForBlock;
                        return gameState; 
                    }
                }
                else{
                    // commit the action. 
                    return commitAction(gameState); 
                }
            } 
            break; 

        case Action.Income:
            gameState.playerStates[gameState.activePlayerIndex].tokens += constants.INCOME_RATE; 
            break;

        case Action.Coup: 
            surrendererIndex = computeIndexFromName(gameState, action.target);
            gameState.playerStates[gameState.activePlayerIndex].tokens -= constants.COUP_COST; 
            gameState = handleLifeLost(gameState, surrendererIndex, SurrenderReason.Coup); 
            break; 
        case Action.Tax: 
            gameState.playerStates[gameState.activePlayerIndex].tokens += constants.TAX_AMOUNT; 

            break;     
        case Action.ForeignAid: 
            gameState.playerStates[gameState.activePlayerIndex].tokens += constants.FOREIGN_AID_AMOUNT; 
            break;     
        case Action.Assasinate: 
            targetIndex = computeIndexFromName(gameState, action.target);
            if (targetIndex < 0){
                logError(`target ${action.target} not found`); 
            }
            gameState = handleLifeLost(gameState, targetIndex, SurrenderReason.Assasinate); 
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

            // // put the cards in deck
            // gameState.deckState = gameState.deckState.concat(playerLiveCards); 
            // // shuffle 
            // gameState.deckState = shuffle(gameState.deckState); 
            
            // will draw 2 random cards from the deck and mix in the live cards
            let cardsToGiveToPlayer = playerLiveCards; 
            for (let i = 0; i < 2; i++){
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

// Handle player life lost. 
function handleLifeLost(gameState: GameState, index: number, surrenderReason: SurrenderReason, cardRevealed? : string): GameState{
    let player = gameState.playerStates[index];
    // if player is already died, do nothing 
    if (player.lifePoint === 0){
        return gameState; 
    }
    gameState.playerStates[index].lifePoint -= 1; 
    gameState.surrenderingPlayerIndex = index;
    gameState.roundState = RoundState.WaitForSurrender; 
    gameState.surrenderReason = surrenderReason; 
    // Case 1. still alive 
    if (gameState.playerStates[index].lifePoint > 0){
        gameState.logs.splice(0, 0, player.friendlyName + " lost an influence"); 
        if (surrenderReason === SurrenderReason.FalseReveal){
            // in case of false reveal, craft a surrender with the card being revealed
            let surrenderAction = {name: Action.Surrender, source: player.socket_id, target: cardRevealed}; 
            gameState.pendingActions.splice(0, 0, surrenderAction); 
            gameState = commitAction(gameState); 
        }
    }
    // Case 2. Player eliminated. 
    else {
        gameState.logs.splice(0, 0, player.friendlyName + " was eliminated"); 
        // find the only card the player has live
        let onlyCard = player.cards.filter(card => card.isRevealed === false)[0].name;
        // craft a surrender action from the server side and commit it. 
        let surrenderAction = {name: Action.Surrender, source: player.socket_id, target: onlyCard}; 
        gameState.pendingActions.splice(0, 0, surrenderAction); 
        gameState = commitAction(gameState); 
    }
    return gameState; 
}


export function computePlayersAbleToBlock(gameState: GameState, action: PlayerActionWithStatus): Array<string>{
    let result = [];
    if (isBlockable(action.name) === false){
        return result; 
    } 
    let players = gameState.playerStates.filter(state => state.socket_id !== action.source && state.lifePoint > 0); 
    if (action.target !== null){
        // only target can block
        players = players.filter(state => state.friendlyName === action.target); 
    }

    return players.map(state => state.friendlyName); 
}

export function handleAction(gameState, action: PlayerAction): GameState {
    console.log(`got action ${JSON.stringify(action)}`); 
    // Handle special case. If it is assasinate, then deduct tokens right away 
    if(action.name as Action === Action.Assasinate){
        gameState.playerStates[gameState.activePlayerIndex].tokens -= constants.ASSASINATE_COST; 
    }

    let sourceName = gameState.playerStates.find(state => state.socket_id === action.source).friendlyName; 

    // Handle special case. block arrives first before challenge 
    // TODO: this is not exactly covering all cases. There could be cases where all player but the target has skipped
    // challenge. 
    if (action.name as Action === Action.Block 
        && gameState.roundState === RoundState.WaitForChallengeOrBlock
        && computeAlivePlayers(gameState.playerStates) > 2
        )
    {
        // block => skips challenge
        let pendingAction = gameState.pendingActions[0]; 
        if (!pendingAction.playersWhoSkippedChallenge.includes(sourceName)){
            pendingAction.playersWhoSkippedChallenge.push(sourceName)
        }
        // If NOT all players have skipped challenge. No need
        if (pendingAction.playersWhoSkippedChallenge.length < computeAlivePlayers(gameState.playerStates) - 1){
            gameState.pendingBlock = action; 
            logInfo("writing to pending block"); 
            gameState.roundState = RoundState.WaitForChallenge; 
            return gameState; 
        }
    }

    // If action is challenge => assign targe. 
    if (action.target === null && action.name as Action === Action.Challenge){
        let source = gameState.pendingActions[0].source;
        let name = gameState.playerStates.find(state => state.socket_id === source).friendlyName; 
        action.target = name; 
    }    

    gameState.logs.splice(0, 0, renderLog(sourceName, action.name, action.target)); 
    let isActionChallengeable = isChallengeable(action.name as Action); 
    let isActionBlockable = isBlockable(action.name as Action); 

    //  handle challenge and blocks 
    // Case 1: challengeable and bloackable 

    // if(isActionBlockable){
    //     logDebug("Populating the who can block array")
    //     let playerNames = gameState.playerStates.map(player => player.friendlyName); 
    //     if (action.target !== null){
    //         gameState.playersWhoCanBlock = [action.target]; 
    //     } else{
    //         // everyone other than the source can block 
    //         gameState.playersWhoCanBlock = playerNames.filter(name => name !== sourceName);
    //     }
    //     logDebug(`who can block = ${gameState.playersWhoCanBlock}`); 
    // }

    let actionWithStatus: PlayerActionWithStatus = lodash.cloneDeep(action); 
    if(isActionBlockable){
        actionWithStatus.playersWhoSkippedBlock = []; 
    } 
    if(isActionChallengeable){
        actionWithStatus.playersWhoSkippedChallenge = []; 
    }

    gameState.pendingActions.splice(0,0, actionWithStatus); 

    if (isActionBlockable && isActionChallengeable){
        logInfo('blockable + challengeable action'); 
        gameState.roundState = RoundState.WaitForChallengeOrBlock; 

    } else if (isActionChallengeable){
        logInfo('waiting for challenge...'); 
        gameState.roundState = RoundState.WaitForChallenge; 
    } else if (isActionBlockable){
        logInfo('waiting for block...'); 
        gameState.roundState = RoundState.WaitForBlock; 
    } else{
        gameState = commitAction(gameState);
    }
    
    return gameState; 
}



function computeShouldConsiderBlock(gameState: GameState): boolean{
    if (gameState.pendingActions.length === 0){
        return false; 
    }

    const pendingAction = gameState.pendingActions[0]; 
    let needToConsiderBlock = isBlockable(pendingAction.name as Action); 
                
    const target = pendingAction.target; 
    if (target !== null){
        // there is a target. 
        let targetAlive = gameState.playerStates.find(player => player.friendlyName === target).lifePoint > 0; 
        needToConsiderBlock &&= targetAlive; 
    }
    const playersAbleToBlock = computePlayersAbleToBlock(gameState, pendingAction); 
    let allSkipped = playersAbleToBlock.every(name => pendingAction.playersWhoSkippedBlock.includes(name)); 
    needToConsiderBlock &&= (!allSkipped); 
    return needToConsiderBlock; 
}