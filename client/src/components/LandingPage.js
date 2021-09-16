import React, { Component } from 'react'
import { makeStyles, withStyles} from '@material-ui/core/styles';
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


const ColorButton = withStyles(() => ({
    root: {
        backgroundColor: "#347dc9",
        color: "#ffffff", 
        // backgroundColor: purple[500],
        '&:hover': {
            backgroundColor: "#197de6",
        },
        padding: "6px 16px", 
        margin: "16px", 
    },
}))(Button);


// const useStyles = makeStyles({
//     root: {
//         backgroundColor: 'blue', 
//         color: 'white', 
//         margin: "1rem", 
//         height: "30px", 
//         padding: "5px 5px", 
//         '&:hover': {
//             backgroundColor: '#0062cc',
//         },
//     },
//   });


function Heading(){
    return <div className="heading">Multiplayer Coup</div>; 
}

function Home(){
    // const classes = useStyles(); 
    return(
        <div className="Home">
        <Heading />
        
        <Link to="/create"><ColorButton>Create</ColorButton></Link>
        <Link to="/join"><ColorButton>Join</ColorButton></Link>

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