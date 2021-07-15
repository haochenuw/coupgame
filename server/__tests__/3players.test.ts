import { assert } from "console";
import { STATUS_CODES } from "http";
import { ASSASINATE_COST, CARD_TYPES, COUP_COST, FOREIGN_AID_AMOUNT, INCOME_RATE, INITIAL_TOKENS } from "../constants";
import * as game from "../game"; 
import {GameState, SurrenderReason} from "../types"
import { Action, PlayerAction, RoundState } from "../types";
import lodash from 'lodash';


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
const aSkipAction: PlayerAction = {name: Action.Skip, source: "0", target: null}; 
const bSkipAction: PlayerAction = {name: Action.Skip, source: "1", target: null}; 
const cSkipAction: PlayerAction = {name: Action.Skip, source: "2", target: null}; 
const foreignAidAction: PlayerAction = {name: Action.ForeignAid, source: "0", target: null}; 
const b_block_a_Action: PlayerAction = {name: Action.Block, source: "1", target: "A"}; 
const a_challenge_b_action: PlayerAction = {name: Action.Challenge, source: "0", target: "B"}; 
const c_challenge_a_action: PlayerAction = {name: Action.Challenge, source: "2", target: "A"}; 
const b_challenge_a_action: PlayerAction = {name: Action.Challenge, source: "1", target: "A"}; 
const assAction = {source: "0", name: Action.Assasinate, target: "B"}; 
const aRevealAss = {source: "0", name: Action.Reveal, target: "Assassin"}; 
const aRevealDuke = {source: "0", name: Action.Reveal, target: "Duke"}; 

test('init', () => {
    let initialState = game.initGame(threePlayers); 
    expect(initialState.deckState).toHaveLength(9); 
    expect(initialState.playerStates).toHaveLength(3); 
    expect(initialState.roundState).toEqual(RoundState.WaitForAction);  
    expect(initialState.playerStates[0].lifePoint).toEqual(2); 
    expect(initialState.playerStates[0].tokens).toEqual(INITIAL_TOKENS); 
});

describe('steal tests', () => {
    var state; 

    beforeEach(() => {
         state = game.initGame(threePlayers); 
         state.activePlayerIndex = 0; 
         state = game.handleAction(state, stealAction); 
    }); 

    test('stealBystanderSkip', () => {
        // let state = game.initGame(threePlayers); 
        expect(state.roundState).toEqual(RoundState.WaitForChallengeOrBlock); 

        state = game.handleAction(state, cSkipAction); 

        expect(state.pendingActions[0].playersWhoSkippedBlock.length).toEqual(0);
        expect(state.pendingActions[0].playersWhoSkippedChallenge.length).toEqual(1);
    }); 

    test('stealTargetSkip', () => {
       
        state = game.handleAction(state, bSkipAction);         

        expect(state.pendingActions[0].playersWhoSkippedBlock.length).toEqual(1);
        expect(state.pendingActions[0].playersWhoSkippedChallenge.length).toEqual(1);
    }); 
}); 

// More complex challenge/block/skip patterns here. 


// Check elimination in the middle of action. Action should still go through

test('foreignaidBlockFalseRevealElimination', ()=>{
    /* setup:
    A to use foriegn aid 
    B to have life 1. 
    B to block. 
    A/C to challenge 
    B to reveal a non-Duke card
    */
    let state = game.initGame(threePlayers); 
    state.activePlayerIndex = 0; 

    state.pendingActions.splice(0,0,foreignAidAction); 
    
    state.playerStates[1].lifePoint = 1;
    state.playerStates[1].cards = [lodash.cloneDeep(CARD_TYPES[1]), lodash.cloneDeep(CARD_TYPES[1])]; // 


    state.pendingActions.splice(0,0, b_block_a_Action); 
    state.pendingActions.splice(0,0, a_challenge_b_action); 

    state.roundState = RoundState.WaitForChallenge; 


    state = game.commitAction(state); 

    expect(state.roundState).toEqual(RoundState.WaitForReveal); 

    const bRevealAssassin = {name: Action.Reveal, source:"1", target: "Assassin"}; 
    state.pendingActions.splice(0,0, bRevealAssassin); 

    state = game.commitAction(state); 
    
    /* expect:
    B should be eliminated
    A should get the action 
    C should be the next player
    */
    expect(state.playerStates[1].lifePoint).toEqual(0);
    expect(state.activePlayerIndex).toEqual(2); 
    expect(state.playerStates[0].tokens).toEqual(INITIAL_TOKENS + FOREIGN_AID_AMOUNT); 
    expect(state.roundState).toEqual(RoundState.WaitForAction); 
}); 


// Complex tests: blockable + challengeable aciton. 
test('stealBlockThenChallengeThenFalseReveal', ()=>{
    /* setup:
    A to steal on B. 
    B blocks. 
    A challenges the block 
    B reveals a false card. 
    */
    let state = game.initGame(threePlayers); 
    state.activePlayerIndex = 0; 

    state.pendingActions.splice(0,0,stealAction); 
    
    state.playerStates[1].lifePoint = 1;
    state.playerStates[1].cards[0] = lodash.cloneDeep(CARD_TYPES[1]);


    state.pendingActions.splice(0,0, b_block_a_Action); 

    state.pendingActions.splice(0,0, a_challenge_b_action); 

    state.roundState = RoundState.WaitForChallenge; 

    state = game.commitAction(state); 

    expect(state.roundState).toEqual(RoundState.WaitForReveal); 

    const bRevealAssassin = {name: Action.Reveal, source:"1", target: "Assassin"}; 
    state.pendingActions.splice(0,0, bRevealAssassin); 

    state = game.commitAction(state); 
    
    /* expect:
    B should be eliminated
    A should get the action 
    C should be the next player
    */
    expect(state.playerStates[1].lifePoint).toEqual(0);
    expect(state.activePlayerIndex).toEqual(2); 
    expect(state.playerStates[0].tokens).toEqual(INITIAL_TOKENS + INITIAL_TOKENS); 
    expect(state.roundState).toEqual(RoundState.WaitForAction); 
}); 


// Complex tests: blockable + challengeable aciton. 
test('stealBlockThenChallengeThenTrueReveal', ()=>{
    /* setup:
    A to steal on B. 
    B blocks. 
    A challenges the block 
    B reveals a true card. (captain / ambassador)
    */
    let state = game.initGame(threePlayers); 
    state.activePlayerIndex = 0; 

    state.pendingActions.splice(0,0,stealAction); 
    
    state.playerStates[1].cards = [lodash.cloneDeep(CARD_TYPES[2]), lodash.cloneDeep(CARD_TYPES[2])]; // Captain

    state.pendingActions.splice(0,0, b_block_a_Action); 

    state.pendingActions.splice(0,0, a_challenge_b_action); 

    state.roundState = RoundState.WaitForChallenge; 

    state = game.commitAction(state); 

    expect(state.roundState).toEqual(RoundState.WaitForReveal); 

    const bRevealCaptain = {name: Action.Reveal, source:"1", target: "Captain"}; 
    state.pendingActions.splice(0,0, bRevealCaptain); 

    state = game.commitAction(state); 
    
    /* expect:
    A should surrender a card. 
    */
    expect(state.playerStates[0].lifePoint).toEqual(1);
    expect(state.roundState).toEqual(RoundState.WaitForSurrender); 
    expect(state.surrenderingPlayerIndex).toEqual(0); 
    expect(state.surrenderReason).toEqual(SurrenderReason.FailedChallenge); 
}); 


test('stealPendingBlockThenChallengeFalseReveal', () => {
    let state = game.initGame(threePlayers); 
    state.activePlayerIndex = 0; 

    state = game.handleAction(state, stealAction); 
    
    state.playerStates[0].cards[0] = lodash.cloneDeep(CARD_TYPES[1]); // Assassin

    state = game.handleAction(state, b_block_a_Action); 

    expect(state.roundState).toEqual(RoundState.WaitForChallenge); 
    expect(state.pendingBlock === null).toBeFalsy(); 

    // state = game.commitAction(state); 
    state = game.handleAction(state, c_challenge_a_action); 

    expect(state.roundState).toEqual(RoundState.WaitForReveal); 

    const aRevealAssassin= {name: Action.Reveal, source:"0", target: "Assassin"}; 
    state = game.handleAction(state, aRevealAssassin); 

    // /* expect:
    // A should surrender a card. 
    // */
    expect(state.playerStates[0].lifePoint).toEqual(1);
    expect(state.roundState).toEqual(RoundState.WaitForAction); 
}); 

test('stealTargetSkipThenChallengeTrueReveal', () => {
    let state = game.initGame(threePlayers); 
    state.activePlayerIndex = 0; 

    state = game.handleAction(state, stealAction); 
    
    state.playerStates[0].cards = [lodash.cloneDeep(CARD_TYPES[2]), lodash.cloneDeep(CARD_TYPES[1])]; // Captain, Assassin
    state.playerStates[2].cards = [lodash.cloneDeep(CARD_TYPES[2]), lodash.cloneDeep(CARD_TYPES[1])]; // Captain, Assassin

    state = game.handleAction(state, bSkipAction); 

    expect(state.roundState).toEqual(RoundState.WaitForChallenge); 

    state = game.handleAction(state, c_challenge_a_action); 
    expect(state.roundState).toEqual(RoundState.WaitForReveal); 

    const aRevealCaptain = {name: Action.Reveal, source:"0", target: "Captain"}; 
    state = game.handleAction(state, aRevealCaptain); 

    
    expect(state.roundState).toEqual(RoundState.WaitForSurrender); 
    expect(state.playerStates[2].lifePoint).toEqual(1); 
    expect(state.surrenderingPlayerIndex).toEqual(2); 
    expect(state.surrenderReason).toEqual(SurrenderReason.FailedChallenge); 


    const cSurrendersCaptain = {name: Action.Surrender, source:"2", target: "Captain"}; 
    state = game.handleAction(state, cSurrendersCaptain); 

    expect(state.roundState).toEqual(RoundState.WaitForAction); 
    expect(state.playerStates[0].tokens).toEqual(INITIAL_TOKENS + INITIAL_TOKENS); 

    // // /* expect:
    // // C should surrender a card. 
    // // */
    // expect(state.playerStates[0].lifePoint).toEqual(1);
    // expect(state.roundState).toEqual(RoundState.WaitForAction); 
}); 

describe('assasinate tests', ()=>{
    var state; 

    beforeEach( ()=>{
        state = game.initGame(threePlayers); 
        state.activePlayerIndex = 0; 
        state.playerStates[0].tokens = ASSASINATE_COST; 
        state = game.handleAction(state, assAction); 

    }); 

    test('assasinateSkip', () => {
        expect(state.roundState).toEqual(RoundState.WaitForChallengeOrBlock); 
    
        state = game.handleAction(state, bSkipAction); 
    
        expect(state.roundState).toEqual(RoundState.WaitForChallenge); 
    
        state = game.handleAction(state, cSkipAction); 
        
        expect(state.roundState).toEqual(RoundState.WaitForSurrender); 
        
        expect(state.playerStates[0].tokens).toEqual(0); 
    
        expect(state.playerStates[1].lifePoint).toEqual(1); 
    
    }); 
    
    test('assasinateChallengeTrueReveal', ()=>{
        state.playerStates[0].cards[0] = lodash.cloneDeep(CARD_TYPES[1]); 
    
        state = game.handleAction(state, assAction); 
        
        expect(state.roundState).toEqual(RoundState.WaitForChallengeOrBlock); 
    
        state = game.handleAction(state, b_challenge_a_action); 
    
        expect(state.roundState).toEqual(RoundState.WaitForReveal); 
    
        state = game.handleAction(state, aRevealAss); 
        
        expect(state.roundState).toEqual(RoundState.WaitForSurrender); 
        expect(state.playerStates[1].lifePoint).toEqual(1); 
    
        // surrender
        let bSurrender = {name: Action.Surrender, source: "1", target: state.playerStates[1].cards[0].name}; 
        state = game.handleAction(state, bSurrender); 
    
        expect(state.roundState).toEqual(RoundState.WaitForBlock); 
    
        state = game.handleAction(state, bSkipAction); 
    
        // B is eliminated due to assasination. 
        expect(state.roundState).toEqual(RoundState.WaitForAction); 
        expect(state.playerStates[1].lifePoint).toEqual(0); 
        expect(state.activePlayerIndex).toEqual(2); // C should act since B is eliminated already. 
    
    }); 
    
    test('assasinateChallengeFalseReveal', ()=>{
        state.playerStates[0].cards[0] = lodash.cloneDeep(CARD_TYPES[0]); 
    
        expect(state.roundState).toEqual(RoundState.WaitForChallengeOrBlock); 
    
        state = game.handleAction(state, b_challenge_a_action); 
    
        expect(state.roundState).toEqual(RoundState.WaitForReveal); 
    
        state = game.handleAction(state, aRevealDuke); 
        
        expect(state.roundState).toEqual(RoundState.WaitForAction); 
        expect(state.playerStates[0].lifePoint).toEqual(1); 
        expect(state.playerStates[0].tokens).toEqual(0); 
        expect(state.activePlayerIndex).toEqual(1); 
    }); 
    
    // assasinate block -> skip
    test('assasinateBlockSkip', ()=>{
        state.playerStates[0].cards[0] = lodash.cloneDeep(CARD_TYPES[0]); 
    
        state = game.handleAction(state, assAction); 
    
        state = game.handleAction(state, cSkipAction); // skips challenge
        
        expect(state.roundState).toEqual(RoundState.WaitForChallengeOrBlock); 
    
        state = game.handleAction(state, b_block_a_Action); 
    
        expect(state.roundState).toEqual(RoundState.WaitForChallenge); 
    
        state = game.handleAction(state, aSkipAction); 
        state = game.handleAction(state, cSkipAction); 
        
        expect(state.roundState).toEqual(RoundState.WaitForAction); 
    }); 
}); 




// assasinate block chllenge true reveal

// assasinate block chllenge false reveal
