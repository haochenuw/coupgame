
const notReadyColor = '#E46258'
const readyColor = '#73C373'

const playerStyle = {
    // backgroundColor: "#F8F8F8",
    // borderTop: "1px solid #E7E7E7",
    textAlign: "center",
    padding: "20px",
    left: "0",
    bottom: "0",
    fontSize: "25px", 
    width: "100%"
  };

export function PlayerList(props) {
    if (props.players === null) {
        return (<div>No players have connected</div>)
    } else {
        return (
            <div className="readyUnitContainer">
                {props.players.map((item, index) => {
                    let ready = null
                    let readyText = ""
                    if (item.isReady) {
                        readyText = "Ready!"
                    } else {
                        readyText = "Not Ready"
                    }
                    ready = <b style={{color: item.isReady ? readyColor : notReadyColor}}>{readyText}</b>
                    return (
                        <div style={{textAlign: "center"}} key={index}>
                            <p style={playerStyle}>{index + 1}. {item.friendlyName} {ready}</p>
                        </div>
                    )
                })
                }
            </div>
        )
    }
}