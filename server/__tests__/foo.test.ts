
import { INCOME_RATE, INITIAL_TOKENS } from "../constants";
import * as game from "../game"; 
import {GameState} from "../types"
import { Action, PlayerAction, RoundState } from "../types";

const players = 
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

function setActivePlayer(gameState, index): GameState{
    gameState.activePlayerIndex = index;
    return gameState; 
}


test('init', () => {
    let initialState = game.initGame(players); 
    expect(initialState.deckState).toHaveLength(11); 
    expect(initialState.playerStates).toHaveLength(2); 
    expect(initialState.roundState).toEqual(RoundState.WaitForAction);  
});

test('simpleActions', () => {
    let state = game.initGame(players); 
    state = setActivePlayer(state, 0); 
    // income action 
    let incomeAction: PlayerAction = {source: "0", target: null, name: Action.Income}; 
    state.pendingActions.splice(0,0, incomeAction);
    state = game.commitAction(state); 
    expect(state.playerStates[0].tokens).toEqual(INITIAL_TOKENS + INCOME_RATE); 
});


