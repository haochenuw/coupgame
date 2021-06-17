import React, { useState } from 'react'


export default function MainGame (){
    const [roundState, setRoundState] = useState("WaitForAction")

    function actionPanel(){
        return( 
            <>
            <h1> Waiting for action...</h1>
            <button onClick={changeState}>changeState</button>
            </>
        )
    }

    function waitForSurrender() {
        return <h1> Waiting for surrender...</h1>
    }

    function changeState() {
        setRoundState("WaitForSurrender")
    }

    return(
        <div>
        {
            roundState === "WaitForAction" && actionPanel()
        }
        {
            roundState === "WaitForSurrender" && waitForSurrender()
        }
        </div>
    )
}