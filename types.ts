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
    Income = "INCOME", 
    Coup = "COUP"
}

export type GameState = {
    playerIds: Array<string>, 
    activePlayerIndex: number, 
    playerStates: Array<PlayerState>,
    deckState: Array<Card>, 
}

export type GameStatePlusPlayerIndex = GameState & {
    thisPlayerIndex: number    // add a new property
};


export type PlayerState = {
    lifePoint: number, 
    cards: Array<Card>,
    tokens: number 
}