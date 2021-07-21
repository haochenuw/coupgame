import React, { useState } from 'react'
import '../styles/styles.css';

export default function ActionBanner(props) {
    console.log(`props = ${JSON.stringify(props)}`)

    // filter skip
    let computeLastActionInLog = () => {
        if(props.logs === null){
            return null; 
        }
        let onlyActions = props.logs.filter(logEntry => !logEntry.includes("skip"));
        if (onlyActions.length === 0){
            return null; 
        } else{
            return onlyActions[0]; 
        }
    }


    let computeBanner = () => {
        switch (props.roundState){
            case "WAITING_FOR_OTHERS": 
                return <h2>Waiting for others...</h2>
            case "PENDING_SERVER": 
                return <h2>Pending server response...</h2>
            case "WAIT_FOR_ACTION":
                return <h2>Choose an action</h2>
            case "WAIT_FOR_SURRENDER": 
                return <h2>Choose a card to surrender</h2>
            case "WAIT_FOR_CHALLENGE":
                return <h2>{computeLastActionInLog()}</h2>
            case "WAIT_FOR_BLOCK":
                return <h2>{computeLastActionInLog()}</h2>
            case "WAIT_FOR_CHALLENGE_OR_BLOCK":
                return <h2>{computeLastActionInLog()}</h2>
            case "WAIT_FOR_REVEAL":
                return <h2>{computeLastActionInLog()}</h2>
            case "ELIMINATED": 
                return <h2>You have been eliminated</h2>
            default: 
                return null; 
        }
    }

    return (
        <div className = "banner">
        {computeBanner()}
        </div>
    )


}