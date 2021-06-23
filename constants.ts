import { RoomStatus,GameState, PlayerState, Card, Action} from "./types";

export const CARD_TYPES = [
    {
        name: "Duke", 
        action:  Action.Tax, 
        blocksAction: Action.ForeignAid, 
        isRevealed: false // if card is already revealed. 
    },
    {
        name: "Assassin", 
        action:  Action.Assasinate, 
        blocksAction: null, 
        isRevealed: false // if card is already revealed. 
    }, 
    {
        name: "Captain", 
        action:  Action.Steal, 
        blocksAction: Action.Steal, 
        isRevealed: false // if card is already revealed. 
    },
    {
        name: "Contessa", 
        action:  null,
        blocksAction: Action.Assasinate, 
        isRevealed: false // if card is already revealed. 
    }
]; 

export const INITIAL_DECK = [
    Object.assign({}, CARD_TYPES[0], {index: 0}), 
    Object.assign({}, CARD_TYPES[1], {index: 1}), 
    Object.assign({}, CARD_TYPES[2], {index: 2}), 
    Object.assign({}, CARD_TYPES[3], {index: 3}), 
    Object.assign({}, CARD_TYPES[0], {index: 0}), 
    Object.assign({}, CARD_TYPES[1], {index: 1}), 
    Object.assign({}, CARD_TYPES[2], {index: 2}), 
    Object.assign({}, CARD_TYPES[3], {index: 3}), 
    Object.assign({}, CARD_TYPES[0], {index: 0}), 
    Object.assign({}, CARD_TYPES[1], {index: 1}), 
    Object.assign({}, CARD_TYPES[2], {index: 2}), 
    Object.assign({}, CARD_TYPES[3], {index: 3}), 
];

export const NUM_OF_EACH_CARD = 3; 
export const COUP_COST = 0; 
export const ASSASINATE_COST = 1; 
export const INCOME_RATE = 10; 
export const FOREIGN_AID_AMOUNT = 100;  
export const TAX_AMOUNT = 1000;  
export const STEAL_AMOUNT = 500;  
export const INITIAL_TOKENS = 500;  

export const FgRed = "\x1b[31m"
export const FgGreen = "\x1b[32m"
// FgYellow = "\x1b[33m"
// FgBlue = "\x1b[34m"
// FgMagenta = "\x1b[35m"
export const FgCyan = "\x1b[36m"
// FgWhite = "\x1b[37m"

export const MAX_PLAYERS: number = 4; 
export const MIN_PLAYERS: number = 2; 
