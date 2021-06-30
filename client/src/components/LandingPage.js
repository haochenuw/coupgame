import React, { Component } from 'react'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

import Create from "./Create"; 
import Join from "./Join"; 
import MainGame from "./game/MainGame"; 
import Room from "./Room"; 

const linkStyle = {
    margin: "1rem",
    textDecoration: "none",
    color: "green"
  };

function Heading(){
    return <h1>Multiplayer Coup</h1>; 
}

function Home(){
    return(
        <div className="Home">
        <Heading />
        
        <Link style={linkStyle} to="/create">Create</Link>
        <Link style={linkStyle} to="/join">Join</Link>
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
                    <Route exact path="/game">
                        <MainGame />
                    </Route>
                    <Route exact path="/room/:name" component={Room} />
                </Switch>
            </Router>
            </div>
        )
    }
}