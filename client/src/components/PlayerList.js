
const notReadyColor = '#E46258'
const readyColor = '#73C373'

export function PlayerList(props) {
    if (props.players === null) {
        return (<div>No players have connected</div>)
    } else {
        return (
            <div className="readyUnitContainer">
                {props.players.map((item, index) => {
                    let ready = null
                    if (item.isReady) {
                        ready = <b>Ready!</b>
                    } else {
                        ready = <b>Not Ready</b>
                    }
                    return (
                        <div style={{textAlign: "center", backgroundColor: item.isReady ? readyColor : notReadyColor }} key={index}>
                            <p style={playerStyle}>{index + 1}. {item.friendlyName} {ready}</p>
                        </div>
                    )
                })
                }
            </div>
        )
    }
}