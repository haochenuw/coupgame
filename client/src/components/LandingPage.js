import React, { Component } from 'react'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

import Create from "./Create"; 
import Join from "./Join"; 
import Room from "./Room"; 

import './styles/styles.css';

const linkStyle = {
    margin: "1rem",
};


function Heading(){
    return <div className="heading">Multiplayer Coup</div>; 
}

function Home(){
    return(
        <div className="Home">
        <Heading />
        
        <Link className="btn btn-primary" style={linkStyle} to="/create">Create</Link>
        <Link className="btn btn-primary" style={linkStyle}  to="/join">Join</Link>
        </div>
    )
}

export default class LandingPage extends Component {
    render() {
        return (
            <div className="App">
            <Router>
                <Switch>
                    <Route exact path="/create">
                        <Create />
                    </Route>
                    <Route exact path="/join">
                        <Join />
                    </Route>
                    <Route exact path="/">
                        <Home />
                    </Route>
                    <Route exact path="/room/:name" component={Room} />
                </Switch>
            </Router>
            </div>
        )
    }
}