
import { GameState } from "./types";

export function initGame(playerIds): GameState{
    // TODO shuffle deck

    return {
        playerIds: playerIds, 
        activePlayerIndex: 0, // for debug
        // activePlayerIndex: Math.floor(Math.random() * 2), 
        playerOneState: {
            lifePoint: 2,
            cards: null, 
            tokens: 2, 
        },
        playerTwoState: {
            lifePoint: 2,
            cards: null, 
            tokens: 2, 
        },
        deckState: null, 
    }
}