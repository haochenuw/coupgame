
import { ASSASINATE_COST, CARD_TYPES, COUP_COST, INCOME_RATE, INITIAL_TOKENS } from "../constants";
import * as game from "../game"; 
import {GameState, SurrenderReason} from "../types"
import { Action, PlayerAction, RoundState } from "../types";

import lodash from 'lodash';

const twoPlayers = 
    [
        {
            client_id: "0", 
            isReady: true,
            name: "A", 
        }, 
        {
            client_id: "1", 
            isReady: true,
            name: "B", 
        }, 
    ];

const assAction = {source: "0", name: Action.Assasinate, target: "B"}; 
const b_challenge_a = {source: "1", name: Action.Challenge, target: "A"}; 
const a_reveal_ass = {source: "0", name: Action.Reveal, target: "Assassin"}; 
const a_reveal_duke = {source: "0", name: Action.Reveal, target: "Duke"}; 
const b_blocks_a = {source: "1", name: Action.Block, target: "A"}; 
const a_skip = {source: "0", name: Action.Skip, target: null}; 


function setActivePlayer(gameState, index): GameState{
    gameState.activePlayerIndex = index;
    return gameState; 
}

function setTokenForPlayer(gameState: GameState, index: number, token: number): GameState{
    gameState.playerStates[index].tokens = token 
    return gameState; 
}


test('init', () => {
    let initialState = game.initGame(twoPlayers); 
    expect(initialState.deckState).toHaveLength(11); 
    expect(initialState.playerStates).toHaveLength(2); 
    expect(initialState.roundState).toEqual(RoundState.WaitForAction);  
    expect(initialState.playerStates[0].lifePoint).toEqual(2); 
});

test('incomeAction', () => {
    let state = game.initGame(twoPlayers); 
    state = setActivePlayer(state, 0); 

    // income action 
    let incomeAction: PlayerAction = {source: "0", target: null, name: Action.Income}; 
    state.pendingActions.splice(0,0, incomeAction);
    state = game.commitAction(state); 
    expect(state.playerStates[0].tokens).toEqual(INITIAL_TOKENS + INCOME_RATE); 
    
    // player transition 
    expect(state.activePlayerIndex).toEqual(1); 
    expect(state.pendingActions).toHaveLength(0); 
});


test('coupAction', ()=> {
    let state = game.initGame(twoPlayers); 
    state = setActivePlayer(state, 1); 
    // coup action
    state = setTokenForPlayer(state, 1, COUP_COST); 
    const coupAction: PlayerAction = {source: "1", target: "A", name: Action.Coup}; 
    state.pendingActions.splice(0,0, coupAction);
    state = game.commitAction(state); 
    
    // assert 
    expect(state.playerStates[0].lifePoint).toEqual(1); 
    expect(state.playerStates[1].tokens).toEqual(0); 
    expect(state.roundState).toEqual(RoundState.WaitForSurrender); 
    expect(state.surrenderingPlayerIndex).toEqual(0); 
    expect(state.surrenderReason).toEqual(SurrenderReason.Coup); 
    
})

test('surrenderAfterCoup', () => {
    let state = game.initGame(twoPlayers); 
    state = setActivePlayer(state, 0); 

    state.roundState = RoundState.WaitForSurrender;
    state.surrenderingPlayerIndex = 0; 
    state.surrenderReason = SurrenderReason.Coup; 
    const cardName = state.playerStates[0].cards[0].name; 
    const surrenderAction = {source: "0", name: Action.Surrender, target: cardName}; 
    state.pendingActions.splice(0,0, surrenderAction); 
    state = game.commitAction(state); 
    expect(state.activePlayerIndex).toEqual(1); 
    expect(state.playerStates[0].cards[0].isRevealed).toBeTruthy(); 
}); 

test('taxChallenge', ()=>{
    let state = game.initGame(twoPlayers); 
    state = setActivePlayer(state, 0); 
    const taxAction = {source: "0", name: Action.Tax, target: null}; 
    state.pendingActions.splice(0,0, taxAction); 
    state.roundState = RoundState.WaitForChallenge; 


    const challengeAction = {source: "1", name: Action.Challenge, target: null}; 
    state.pendingActions.splice(0,0, challengeAction); 
    state = game.commitAction(state); 

    // assert 
    expect(state.roundState).toEqual(RoundState.WaitForReveal); 
    expect(state.playerStates[0].tokens).toEqual(INITIAL_TOKENS); 
    expect(state.challengingPlayerIndex).toEqual(1); 
}); 

test('taxLegitReveal', ()=>{
    let state = game.initGame(twoPlayers); 
    state = setActivePlayer(state, 0); 
    state.playerStates[0].cards[0] = lodash.cloneDeep(CARD_TYPES[0]); 
    const taxAction = {source: "0", name: Action.Tax, target: null}; 
    state.pendingActions.splice(0,0, taxAction); 
    state.challengingPlayerIndex = 1; // 1 is challenging 0. 
    state.roundState = RoundState.WaitForReveal;

    const revealAction = {source: "0", name: Action.Reveal, target: "Duke"}; 
    state.pendingActions.splice(0,0, revealAction); 
    state = game.commitAction(state); 

    expect(state.playerStates[1].lifePoint).toEqual(1); 
    expect(state.roundState).toEqual(RoundState.WaitForSurrender); 
    expect(state.surrenderingPlayerIndex).toEqual(1); 
    expect(state.surrenderReason).toEqual(SurrenderReason.FailedChallenge); 
});     

test('taxFalseReveal', ()=>{
    let state = game.initGame(twoPlayers); 
    state = setActivePlayer(state, 0); 
    state.playerStates[0].cards[0] = lodash.cloneDeep(CARD_TYPES[1]); 
    console.log(state.playerStates[0].cards); 
    const taxAction = {source: "0", name: Action.Tax, target: null}; 
    state.pendingActions.splice(0,0, taxAction); 
    state.challengingPlayerIndex = 1; // 1 is challenging 0. 
    state.roundState = RoundState.WaitForReveal;

    const revealAction = {source: "0", name: Action.Reveal, target: "Assassin"}; 
    state.pendingActions.splice(0,0, revealAction); 
    state = game.commitAction(state); 

    expect(state.playerStates[0].lifePoint).toEqual(1); 
    expect(state.roundState).toEqual(RoundState.WaitForAction); 
    expect(state.activePlayerIndex).toEqual(1); 
    expect(state.playerStates[0].tokens).toEqual(INITIAL_TOKENS); // no change since false reveal.  
});     


describe('assasinate tests', ()=>{
    var state; 

    beforeEach(()=>{
        state = game.initGame(twoPlayers); 
        state = setActivePlayer(state, 0); 
        state.playerStates[0].tokens = ASSASINATE_COST; 
        state = game.handleAction(state, assAction); 
    }); 

    test('2pAssasinateSkip', () => {
        const skipAction = {source: "1", name:Action.Skip, target: null}; 
        state.pendingActions.splice(0,0, skipAction); 
    
        state = game.commitAction(state); 
    
        expect(state.playerStates[1].lifePoint).toEqual(1); 
        expect(state.roundState).toEqual(RoundState.WaitForSurrender); 
        expect(state.surrenderReason).toEqual(SurrenderReason.Assasinate); 
        expect(state.surrenderingPlayerIndex).toEqual(1); 
    }); 
    
    // Test assasinate challenged 
    test('assChallengeTrueReveal', () =>{
        state.playerStates[0].cards[0] = JSON.parse(JSON.stringify(CARD_TYPES[1]));  
     
        expect(state.roundState).toEqual(RoundState.WaitForChallengeOrBlock); 
        state = game.handleAction(state, b_challenge_a); 
        expect(state.roundState).toEqual(RoundState.WaitForReveal); 
    
        // 
        state = game.handleAction(state, a_reveal_ass); 
    
        expect(state.roundState).toEqual(RoundState.WaitForSurrender); 
        expect(state.playerStates[1].lifePoint).toEqual(1); 
        expect(state.playerStates[0].tokens).toEqual(0); 
    
    }); 

    test('assChallengeFalseReveal', () =>{
        state.playerStates[0].cards[0] = lodash.cloneDeep(CARD_TYPES[0]); 
     
        expect(state.roundState).toEqual(RoundState.WaitForChallengeOrBlock); 
        state = game.handleAction(state, b_challenge_a); 
        expect(state.roundState).toEqual(RoundState.WaitForReveal); 
    
        state = game.handleAction(state, a_reveal_duke); 
    
        expect(state.roundState).toEqual(RoundState.WaitForAction); 
        expect(state.activePlayerIndex).toEqual(1); 
        expect(state.playerStates[0].lifePoint).toEqual(1); 
        expect(state.playerStates[0].tokens).toEqual(0); 
    }); 

    test('assBlockSkip', () =>{
        state.playerStates[0].cards[0] = lodash.cloneDeep(CARD_TYPES[0]); // Duke; 
     
        expect(state.roundState).toEqual(RoundState.WaitForChallengeOrBlock); 
        state = game.handleAction(state, b_blocks_a); 
        expect(state.roundState).toEqual(RoundState.WaitForChallenge); 
    
        state = game.handleAction(state, a_skip); 
    
        expect(state.roundState).toEqual(RoundState.WaitForAction); 
        expect(state.activePlayerIndex).toEqual(1); 
        expect(state.playerStates[0].lifePoint).toEqual(2); 
        expect(state.playerStates[1].lifePoint).toEqual(2); 
        expect(state.playerStates[0].tokens).toEqual(0); 
    }); 
}); 



test('blockUtil', () =>{
    let state = game.initGame(twoPlayers); 
    state = setActivePlayer(state, 0); 
    const playersWhoCanBlock = game.computePlayersAbleToBlock(state, assAction); 
    expect(playersWhoCanBlock).toEqual(["B"]); 
}); 



// Test assasinate blocked => challenge yes, challenge no

// Test steal 

// Test foreign aid skipped
// Test foreign aid blocked => challenge yes, no. 

