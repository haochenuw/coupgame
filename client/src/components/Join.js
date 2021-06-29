import React, { useState } from 'react'
import { withRouter} from "react-router-dom";

const axios = require('axios');
// const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002"

export const Join = withRouter(({history}) => {

    const [code, setCode] = useState(""); 
    const [error, setError] = useState(false); 
    const [roomDNE, setRoomDNE] = useState(false); 
    const [name, setName] = useState(null); 

    function handleChange(event)
    {
        setCode(event.target.value); 
        setRoomDNE(false)
    }

    function join(event) {
        // Otherwise, show error log. 
        let data = {
            roomName: code
        }

        axios.get(`/checkRoom`, {params: data})   
        .then(function (res) {
            console.log(res)
            setRoomDNE(!res.data.doesRoomExist)
            if(res.data.doesRoomExist){
                // happy path
                history.push({pathname:`/room/${code}`, state:{data: false, playerName: name}});
            }
        })
        .catch(function (err) {
            console.log("error in check room", err);
            setError(true)
        })
        // clear input.
        document.querySelector('#input').value = ''
    }

    function setNamePanel(){
        return(
            <>
            <input id='inputName' value={name} type="text" placeholder="Your Name"/>
            <button onClick={() => setName(document.getElementById('inputName').value)}>Save</button>
            </>
        )
    }

    if (name === null){
        return setNamePanel() // TODO 
    } else{
        return (
            <div>
            {roomDNE &&
                <h1>Error: Room {code} does not exist</h1> 
            }
            <button onClick={join}>Join</button>
            <input id='input' onChange={handleChange} type="text" placeholder="Game code"/>
            </div>
        )
    }
}); 



export default Join; 

// export default class Join extends Component {

//     constructor(props) {
//         super(props)
    
//         this.state = {
//             roomCode: '',
//         }
//     }

//     handleChange = (event) => {
//         this.setState({ roomCode: event.target.value });
//     }

//     render() {
//         return (
//             <>
//             <div>
//             <button onClick={this.join}>Join</button>
//             <input onChange={this.handleChange} type="text" placeholder="Game code"/>
//             </div>
//            </>
           
//         )
//     }
// }