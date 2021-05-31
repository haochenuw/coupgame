
import { GameState } from "./types";
import {INITIAL_DECK} from "./constants"; 

export function initGame(playerIds): GameState {
    // TODO shuffle deck
    let shuffled_deck = INITIAL_DECK; 

    shuffled_deck = shuffled_deck
    .map((a) => ({sort: Math.random(), value: a}))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);

    return {
        playerIds: playerIds,
        activePlayerIndex: 0, // for debug
        // activePlayerIndex: Math.floor(Math.random() * 2), 
        playerStates: [{
            lifePoint: 2,
            cards: [shuffled_deck[0], shuffled_deck[1]],
            tokens: 2,
        },
        {
            lifePoint: 2,
            cards: [shuffled_deck[2], shuffled_deck[3]],
            tokens: 2,
        }],
        deckState: null,
    }
}