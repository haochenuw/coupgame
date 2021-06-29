import { Socket } from "dgram";
import * as constants from "./constants";

export function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

 export function logInfo(msg: string){
     console.log(constants.FgGreen, msg); 
 }

 export function logError(msg: string){
     console.log(constants.FgRed, msg); 
 }

 export function logDebug(msg: string){
     console.log(constants.FgCyan, msg); 
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