export type RoomStatus =  {
    name: string;
    playerOneId: string; 
    playerTwoId: string; 
    numPlayers: number; 
}

export type Card = {
    name: string, 
    action: Action | null, 
    blocksAction: Action | null, 
    isRevealed: boolean // if card is already revealed. 
}

export enum CardName {
    Default,
    Duke,
    Ambassador,
    Assassin,
    Captain,
}

export enum Action {
    Income = "Income", 
    Coup = "Coup", 
    Tax = "Tax", 
    ForeignAid = "ForeignAid", 
    Assasinate = "Assasinate", 
    Steal = "Steal", 
    Exchange = "Exchange", 
    Block = "Block", 
}

export type PlayerAction =  {
    name: Action, 
    target: number | null | undefined
    source?: number | null | undefined, 
}

export enum RoundState{
    WaitForAction = "WAIT_FOR_ACTION", 
    WaitForChallenge = "WAIT_FOR_CHALLENGE", 
    WaitForReveal = "WAIT_FOR_REVEAL",
    WaitForBlock = "WAIT_FOR_BLOCK",  
    WaitForSurrender = "WAIT_FOR_SURRENDER",  
}

export function isChallengeable(action: Action) {
    switch (action) {
        case Action.Tax:
            return true;
        case Action.Assasinate:
            return true;
        case Action.Steal:
            return true;
        case Action.Exchange:
            return true;
        case Action.Block:
            return true;
        default:
            return false;
    }
}

export function isBlockable(action: Action) {
    switch (action) {
        case Action.Assasinate:
            return true;
        case Action.Steal:
            return true;
        case Action.ForeignAid:
            return true;
        default:
            return false;
    }
}




export type GameState = {
    playerIds: Array<string>, 
    activePlayerIndex: number, 
    challengingPlayerId: string | null, 
    playerToSurrender: number | null, 
    playerStates: Array<PlayerState>,
    deckState: Array<Card>, 
    roundState: RoundState, 
    pendingActions: Array<PlayerAction>, 
}

export type GameStatePlusPlayerIndex = GameState & {
    thisPlayerIndex: number    // add a new property
};


export type PlayerState = {
    lifePoint: number, 
    cards: Array<Card>,
    tokens: number 
}