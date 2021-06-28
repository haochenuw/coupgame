import {Action} from "./types";

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
    },
    {
        name: "Ambassador", 
        action:  Action.Exchange,
        blocksAction: Action.Steal, 
        isRevealed: false // if card is already revealed. 
    }
]; 

export const MaskedCard = {
    name: "???", 
    action:  null, 
    blocksAction: null, 
    isRevealed: false // if card is already revealed. 
}

export const INITIAL_DECK = [
    Object.assign({}, CARD_TYPES[0], {index: 0}), 
    Object.assign({}, CARD_TYPES[1], {index: 1}), 
    Object.assign({}, CARD_TYPES[2], {index: 2}), 
    Object.assign({}, CARD_TYPES[3], {index: 3}), 
    Object.assign({}, CARD_TYPES[4], {index: 3}), 
    Object.assign({}, CARD_TYPES[0], {index: 0}), 
    Object.assign({}, CARD_TYPES[1], {index: 1}), 
    Object.assign({}, CARD_TYPES[2], {index: 2}), 
    Object.assign({}, CARD_TYPES[3], {index: 3}), 
    Object.assign({}, CARD_TYPES[4], {index: 3}), 
    Object.assign({}, CARD_TYPES[0], {index: 0}), 
    Object.assign({}, CARD_TYPES[1], {index: 1}), 
    Object.assign({}, CARD_TYPES[2], {index: 2}), 
    Object.assign({}, CARD_TYPES[3], {index: 3}), 
    Object.assign({}, CARD_TYPES[4], {index: 3}), 
];

export const COUP_COST = 7; 
export const ASSASINATE_COST = 3; 
export const INCOME_RATE = 1; 
export const FOREIGN_AID_AMOUNT = 2;  
export const TAX_AMOUNT = 3;  
export const STEAL_AMOUNT = 2;  
export const INITIAL_TOKENS = 2;  

export const FgRed = "\x1b[31m"
export const FgGreen = "\x1b[32m"
// FgYellow = "\x1b[33m"
// FgBlue = "\x1b[34m"
// FgMagenta = "\x1b[35m"
export const FgCyan = "\x1b[36m"
// FgWhite = "\x1b[37m"

export const MAX_PLAYERS: number = 4; 
export const MIN_PLAYERS: number = 2; 
