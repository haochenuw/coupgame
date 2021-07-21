import React  from 'react'
import '../styles/styles.css';

export default function EventLog (props){
    return(
        <div className="eventLog">
            {
                props.logs.map((logEntry, index) => {
                    if (index === 0){
                        return <p className="log" id="newest">{logEntry}</p>
                    }
                    return (<p className="log">{logEntry}</p>)
                })
            } 
        </div>
    )
}
