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

function Heading(){
    return <h1>Multiplayer Coup</h1>; 
}

function Home(){
    return(
        <>
        <Heading />
        <ul>
        <li>
            <Link to="/create">Create</Link>
        </li>
        <li>
            <Link to="/join">join</Link>
        </li>
        </ul>
        </>
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