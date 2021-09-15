import React, { Component } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

import Create from "./Create"; 
import Join from "./Join"; 
import Room from "./Room"; 
import RulesModal from "./RulesModal"; 

import './styles/styles.css';


const useStyles = makeStyles({
    root: {
        backgroundColor: 'blue', 
        color: 'white', 
        margin: "1rem", 
        height: "30px", 
        padding: "5px 5px", 
        '&:hover': {
            backgroundColor: '#0062cc',
        },
    },
  });


function Heading(){
    return <div className="heading">Multiplayer Coup</div>; 
}

function Home(){
    const classes = useStyles(); 
    return(
        <div className="Home">
        <Heading />
        
        <Link to="/create"><Button className={classes.root}>Create</Button></Link>
        <Link to="/join"><Button className={classes.root}>Join</Button></Link>

        <RulesModal/>

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