import React, { useState, useContext, useEffect } from 'react'
import '../styles/styles.css';

export default function EventLog (props){
    return(
        <div>
            {
                props.logs.map((logEntry, index) => {
                    if (index == 0){
                        return <p class="log" id="newest">{logEntry}</p>
                    }
                    return (<p class="log">{logEntry}</p>)
                })
            } 
        </div>
    )
}
