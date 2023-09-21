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
import RulesModal from "./RulesModal";
import { ColorButton } from "./ColorButton"
import { CardsDisplay } from './CardsDisplay';
import { AdsPanel } from './Ads';
import './styles/styles.css';

const footerStyle = {
    // backgroundColor: "#F8F8F8",
    // borderTop: "1px solid #E7E7E7",
    textAlign: "center",
    padding: "20px",
    position: "fixed",
    left: "0",
    bottom: "0",
    height: "60px",
    width: "100%"
};

function Heading() {
    return <div className="heading">Play Coup Online</div>;
}

function Footer() {
    return <div style={footerStyle}>Made by <a className="link" href="https://github.com/haochenuw">Hao Chen</a> </div>
}

function Home() {
    return (
        <div className="Home">
            <Heading />
            {/* <AdsPanel /> */}
            <Link to="/create"><ColorButton>Create Room</ColorButton></Link>
            <Link to="/join"><ColorButton>Join Room</ColorButton></Link>

            <CardsDisplay />

            <RulesModal />

            <Footer />

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