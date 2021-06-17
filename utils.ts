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

//  export function emitGameState(io: any, roomName: string){
//     io.to(roomName).emit('gameState', JSON.stringify(gameState)); 
//  }