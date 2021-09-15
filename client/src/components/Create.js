import React, {useState, useEffect} from 'react'
import {withRouter} from "react-router-dom";
import {useStateWithLocalStorage} from "./hooks/useStateWithLocalStorage"



const axios = require('axios');
// const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002"

export const Create = withRouter(({history}) => {

    const [disabled, setDisabled] = useState(false)

    const [name, setName] = useState(null)

    const [nameRegistered, setNameRegistered] = useStateWithLocalStorage(
        'nameIsRegistered', {isRegistered: false}
    );


    function createParty(){
        // console.log('create button clicked'); 
        // event.preventDefault();
        setDisabled(true)
        axios.get(`/createRoom`)
        .then(function (res) {
            // console.log(res.data.room);
            history.push({pathname:`/room/${res.data.room}`, state:{data: true, playerName: name}});
        })
        .catch(function (err) {
            console.log("error in getting new room", err);
        })
    }

    useEffect(()=>{
        setNameRegistered({isRegistered: false}); 
        createParty(); 
    }, []); 

    return (
        // <div className="createHome">
        //     {/* <input type="text" value={name} onChange={handleChange} placeholder="Your name" /> */}
        //     <button className="createButton btn-primary" onClick={createParty} disabled={disabled}>Create</button>
        // </div>
        <>
        </>
    )
}); 

export default Create; 

// export default class Create extends Component {

//     constructor(props) {
//         super(props)
    
//         this.state = {
//             roomCode: '',
//             copied: false,
//             isInRoom: false,
//             isLoading: false,
//             players: [],
//             isError: false,
//             isGameStarted: false,
//             errorMsg: '',
//             canStart: false,
//             socket: null,
//             redirect: false
//         }
//     }

//     createParty = () => {
//         const bind = this;

//         axios.get(`${baseUrl}/createNamespace`)
//             .then(function (res) {
//                 console.log(res);
//                 bind.setState({ roomCode: res.data.namespace, errorMsg: '', redirect: true });
//             })
//             .catch(function (err) {
//                 console.log("error in creating namespace", err);
//                 bind.setState({ isLoading: false });
//                 bind.setState({ errorMsg: 'Error creating room, server is unreachable' });
//                 bind.setState({ isError: true });
//             })
//     }

//     render() {
//         if(this.state.redirect === true){
//             return  (<Room roomCode={this.state.roomCode}></Room>)
//         } else{
//             let createButton = <>
//                 <button className="createButton" onClick={this.createParty} disabled={this.state.isLoading}>{this.state.isLoading ? 'Creating...': 'Create'}</button>
//                 <br></br>
//                 </>
//             return (
//                 <Router>
//                     <Link to="/newgame">Old Create</Link>
//                     <div className="createGameContainer">
//                         {createButton}
//                         <br></br>
//                     </div>
//                     <Route path='/newgame' render = {() => { 
//                         window.location.href = baseUrl + "/newgame";
//                         return null;
//                     }}/>
//             </Router>
//             )
//         }
//     }
// }