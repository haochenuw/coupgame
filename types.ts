export type RoomStatus =  {
    name: string;
    playerOneId: string; 
    playerTwoId: string; 
    numPlayers: number; 
}

export type Card = {
    name: CardName, 
    action: Action | null, 
    blocksAction: Action | null, 
    isRevealed: boolean // if card is already revealed. 
}

enum CardName {
    Duke,
    Ambassador,
    Assassin,
    Captain,
}

enum Action {
    Tax,
    Down,
    Left,
    Right,
}

const allCards = []; 

export type GameState = {
    activePlayer: number, 
    playerOneState: Array<Card>,
    playerTwoState: Array<Card>,
    deckState: Array<Card>, 
}