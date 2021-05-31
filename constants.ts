import { RoomStatus,GameState, PlayerState, Card, Action} from "./types";

export const CARD_TYPES = [
    {
        name: "Default", 
        action:  null, 
        blocksAction:  null, 
        isRevealed: false // if card is already revealed. 
    }, 
    {
        name: "Duke", 
        action:  Action.Tax, 
        blocksAction: Action.Tax, 
        isRevealed: false // if card is already revealed. 
    }
]; 

export const INITIAL_DECK = [
    Object.assign({}, CARD_TYPES[0], {index: 0}), 
    Object.assign({}, CARD_TYPES[1], {index: 1}), 
    Object.assign({}, CARD_TYPES[0], {index: 2}), 
    Object.assign({}, CARD_TYPES[1], {index: 3}), 
    Object.assign({}, CARD_TYPES[0], {index: 4}), 
    Object.assign({}, CARD_TYPES[1], {index: 5}), 
];

export const COUP_COST = 0; 
export const INCOME_RATE = 10; 