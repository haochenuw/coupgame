import React, { useState } from 'react'
import '../styles/styles.css';

export const ACTIONS=["Income", "Coup", "Tax", "Assasinate", "Exchange", "Steal", "ForeignAid"]; 

export function ActionPanel(props){
    console.log('disabled', props.disabledActions); 
    return (
        <div className="selection">
            {
                ACTIONS.map(action => {
                    let disabled = props.disabledActions.includes(action); 
                    return (<button className="btn btn-info" disabled={disabled} onClick={() => props.onAction(action)}>{action}</button>)
                })
            }
            {/* <button className="btn btn-info" onClick={() => props.onAction('Income')}>Income</button>
            <button className="btn btn-info" disabled={props.coupDisable} onClick={() => props.onAction('Coup')}>Coup</button>
            <button className="btn btn-info" onClick={() => props.onAction('Tax')}>Tax</button>
            <button className="btn btn-info" disabled={props.assDisable} onClick={() => props.onAction('Assasinate')}>Assasinate</button>
            <button className="btn btn-info" onClick={() => props.onAction('Exchange')}>Exchange</button>
            <button className="btn btn-info" onClick={() => props.onAction('Steal')}>Steal</button>
            <button className="btn btn-info" onClick={() => props.onAction('ForeignAid')}>ForeignAid</button> */}
        </div>
    )
}