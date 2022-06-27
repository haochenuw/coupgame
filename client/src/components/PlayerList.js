
const notReadyColor = '#E46258'
const readyColor = '#73C373'

const playerStyle = {
    // backgroundColor: "#F8F8F8",
    // borderTop: "1px solid #E7E7E7",
    // textAlign: "center",
    padding: "0",
    left: "0",
    bottom: "0",
    fontSize: "25px", 
    width: "100%"
  };

const playerDivStyle = {
    width: "40%", 
    margin: "auto",  
    textAlign: "left",
}

export function PlayerList(props) {
    if (props.players === null) {
        return (<div>No players have connected</div>)
    } else {
        return (
            <div className="readyUnitContainer">
                {props.players.map((player, index) => {
                    let readyText = ""
                    if (player.isReady) {
                        readyText = "Ready"
                    } else {
                        readyText = "Not Ready"
                    }
                    let name = <span>{player.friendlyName}</span>
                    if (player.friendlyName == props.myName) {
                        name = <b> {player.friendlyName} </b>
                    }
                    let ready = <span style={{color: player.isReady ? readyColor : notReadyColor}}>{readyText}</span>
                    return (
                        <div style={playerDivStyle} key={index}>
                            <p style={playerStyle}>{index + 1}. {name} {ready}</p>
                        </div>
                    )
                })
                }
            </div>
        )
    }
}