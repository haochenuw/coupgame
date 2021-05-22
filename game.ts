
import { GameState } from "./types";

export function initGame(){
    return {
        activePlayer: 1, 
        playerOneState: "null",
        playerTwoState: "null",
        deckState: "full", 
    }
}