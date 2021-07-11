import { STATUS_CODES } from "http";
import { ASSASINATE_COST, CARD_TYPES, COUP_COST, INCOME_RATE, INITIAL_TOKENS } from "../constants";
import * as game from "../game"; 
import {GameState, SurrenderReason} from "../types"
import { Action, PlayerAction, RoundState } from "../types";


const threePlayers = 
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
        {
            client_id: "2", 
            isReady: true,
            name: "C", 
        }, 
    ];

const stealAction: PlayerAction = {name: Action.Steal, source: "0", target: "B"}; 
const bSkipAction: PlayerAction = {name: Action.Skip, source: "1", target: null}; 
const cSkipAction: PlayerAction = {name: Action.Skip, source: "2", target: null}; 
const foreignAidAction: PlayerAction = {name: Action.ForeignAid, source: "0", target: null}; 
// const bBlockAction: PlayerAction = {name: Action.ForeignAid, source: "0", target: null}; 

test('init', () => {
    let initialState = game.initGame(threePlayers); 
    expect(initialState.deckState).toHaveLength(9); 
    expect(initialState.playerStates).toHaveLength(3); 
    expect(initialState.roundState).toEqual(RoundState.WaitForAction);  
    expect(initialState.playerStates[0].lifePoint).toEqual(2); 
    expect(initialState.playerStates[0].tokens).toEqual(INITIAL_TOKENS); 
});

test('stealBystanderSkip', () => {
    let state = game.initGame(threePlayers); 
    state.activePlayerIndex = 0; 
    state.pendingActions.splice(0,0, stealAction); 

    state.roundState = RoundState.WaitForChallengeOrBlock; 

    state.pendingActions.splice(0,0, cSkipAction); 
    state = game.commitAction(state); 

    expect(state.playersWhoSkippedBlock.length).toEqual(0);
    expect(state.playersWhoSkippedChallenge.length).toEqual(1);
    // expect(initialState.deckState).toHaveLength(9); 
    // expect(initialState.playerStates).toHaveLength(3); 
    // expect(initialState.roundState).toEqual(RoundState.WaitForAction);  
    // expect(initialState.playerStates[0].lifePoint).toEqual(2); 
    // expect(initialState.playerStates[0].tokens).toEqual(INITIAL_TOKENS); 
}); 

test('stealTargetSkip', () => {
    let state = game.initGame(threePlayers); 
    state.activePlayerIndex = 0; 
    state.pendingActions.splice(0,0, stealAction); 

    state.roundState = RoundState.WaitForChallengeOrBlock; 

    state.pendingActions.splice(0,0, bSkipAction); 
    state = game.commitAction(state); 

    expect(state.playersWhoSkippedBlock.length).toEqual(1);
    expect(state.playersWhoSkippedChallenge.length).toEqual(1);
    // expect(initialState.deckState).toHaveLength(9); 
    // expect(initialState.playerStates).toHaveLength(3); 
    // expect(initialState.roundState).toEqual(RoundState.WaitForAction);  
    // expect(initialState.playerStates[0].lifePoint).toEqual(2); 
    // expect(initialState.playerStates[0].tokens).toEqual(INITIAL_TOKENS); 
}); 

// More complex challenge/block/skip patterns here. 


// Check elimination in the middle of action. Action should still go through

test('foreignaidBlockFalseRevealElimination', ()=>{
    let state = game.initGame(threePlayers); 
    state.activePlayerIndex = 0; 

    state.pendingActions.splice(0,0,foreignAidAction); 

    state.playerStates[1].lifePoint = 1;
    state.playerStates[1].cards = [CARD_TYPES[1], CARD_TYPES[1]]; // 
    
    /* setup:
    A to use foriegn aid 
    B to have life 1. 
    B to block. 
    B to reveal a non-Duke card
    */

}); 

