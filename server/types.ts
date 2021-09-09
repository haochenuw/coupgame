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
    Duke,
    Ambassador,
    Assassin,
    Captain,
    Contessa, 
}

export enum SurrenderReason{
    Coup = "Coup", 
    Assasinate = "Assasinate", 
    FailedChallenge = "FailedChallenge", 
    FalseReveal = "FalseReveal"
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
    Surrender = "Surrender", 
    ExchangeResponse = "ExchangeResponse", 
    SkipBlock = "SkipBlock", 
    Challenge = "Challenge", 
    SkipChallenge = "SkipChallenge", 
    Reveal = "Reveal", 
    Skip = "Skip", 
}

export interface PlayerAction {
    name: Action, 
    target: string | null | undefined
    source?: string | null | undefined, 
    additionalData?: Array<string> | undefined 
}

// For tracking status of each pending action.
export interface PlayerActionWithStatus extends PlayerAction {
    playersWhoSkippedBlock?: Array<string>
    playersWhoSkippedChallenge?: Array<string>
}

export enum RoundState{
    WaitForAction = "WAIT_FOR_ACTION", 
    WaitForChallenge = "WAIT_FOR_CHALLENGE", 
    WaitForReveal = "WAIT_FOR_REVEAL",
    WaitForBlock = "WAIT_FOR_BLOCK",  
    WaitForSurrender = "WAIT_FOR_SURRENDER",  
    WaitForExchange = "WAIT_FOR_EXCHANGE",  
    WaitForChallengeOrBlock = "WAIT_FOR_CHALLENGE_OR_BLOCK", 

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
        case Action.ForeignAid:
            return false;
        case Action.Block:
            return true;
        case Action.SkipBlock:
            return false;
        case Action.Challenge:
            return false;
        case Action.SkipChallenge:
            return false;
        case Action.Skip:
            return false;
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

export enum EventType {
    Regular = "regular", 
    Initial = "initial", 
    Disconnect = "disconnect",
    Reconnect = "reconnect", 
}

export type GameState = {
    eventType: EventType, 
    activePlayerIndex: number,  // the player responsible for making the next action
    challengingPlayerIndex: number | null | undefined, 
    surrenderingPlayerIndex: number | null | undefined, 
    playerStates: Array<PlayerState>,
    deckState: Array<Card>, 
    roundState: RoundState, 
    pendingActions: Array<PlayerActionWithStatus>, 
    pendingExchangeCards: Array<Card> | null, 
    surrenderReason: SurrenderReason | undefined | null, 
    logs: Array<String>, 
    pendingBlock: PlayerAction | null 
}

export type PlayerState = {
    friendlyName: string | null, 
    socket_id: string, 
    connected: boolean
    lifePoint: number | undefined, 
    cards: Array<Card> | undefined,
    tokens: number | undefined,
    isReady: boolean 
}
