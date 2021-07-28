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
                return "Waiting for others..."
            case "PENDING_SERVER": 
                return "Pending server response..."
            case "WAIT_FOR_ACTION":
                return "Choose an action"
            case "WAIT_FOR_SURRENDER": 
                return null
            case "WAIT_FOR_CHALLENGE":
                return computeLastActionInLog()
            case "WAIT_FOR_BLOCK":
                return computeLastActionInLog()
            case "WAIT_FOR_CHALLENGE_OR_BLOCK":
                return computeLastActionInLog()
            case "WAIT_FOR_REVEAL":
                return computeLastActionInLog()
            case "ELIMINATED": 
                return "You have been eliminated"
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