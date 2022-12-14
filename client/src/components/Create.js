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