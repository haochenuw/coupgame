import * as constants from "./constants";
import { EventType, RoundState } from "./types";

export function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

 export function logInfo(msg: string){
     console.log(constants.FgGreen, "INFO: "+msg); 
 }

 export function logError(msg: string){
     console.log(constants.FgRed, msg); 
 }

 export function logDebug(msg: string){
     console.log(constants.FgCyan, "DEBUG: "+msg); 
 }

 export function renderLog(sourceName: string, action: string, target: string | null){
    // translate to past tense 
    let actionPastTense = transformToPastTense(action.toLowerCase()); 
    if (target === "null"){
        return [sourceName, actionPastTense].join(" "); 
    } else{
        return [sourceName, actionPastTense, target].join(" "); 
    }
 }

 function transformToPastTense(action: string) {
    if (action.endsWith('e')){
        return action + 'd'; 
    }
    return action + "ed"; 
 }

 export function emptyGameState(){
     return {
        activePlayerIndex: 0, 
        challengingPlayerIndex: null, 
        surrenderingPlayerIndex:  null,
        playerStates: [],
        deckState: [],
        roundState: RoundState.WaitForAction, 
        pendingActions: [],
        pendingExchangeCards: null, 
        surrenderReason: null, 
        pendingBlock: null, 
        logs: [], 
        eventType: EventType.Initial
    }
 }