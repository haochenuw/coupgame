export type RoomStatus =  {
    name: string;
    playerOneId: string; 
    playerTwoId: string; 
    numPlayers: number; 
}

export type GameState = {
    activePlayer: number, 
    playerOneState: string,
    playerTwoState: string,
    deckState: string, 
}