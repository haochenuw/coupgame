
import { GameState } from "./types";

export function initGame(playerIds): GameState {
    // TODO shuffle deck

    return {
        playerIds: playerIds,
        activePlayerIndex: 0, // for debug
        // activePlayerIndex: Math.floor(Math.random() * 2), 
        playerStates: [{
            lifePoint: 2,
            cards: null,
            tokens: 2,
        },
        {
            lifePoint: 2,
            cards: null,
            tokens: 2,
        }],
        deckState: null,
    }
}