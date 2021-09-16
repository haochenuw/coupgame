import ReactModal from "react-modal";
import React, { useState } from 'react'
import './styles/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import Button from "@material-ui/core/Button";
import {withStyles} from '@material-ui/core/styles';


const GENERAL_RULES = [
    "Supports 2-6 player. The deck contains 15 cards, 3 of each character.", 
    "The game starts with each player taking two random cards from the deck and two coins. Each player can see their own cards but not cards of others. The last player who still has a card(influence) wins",  
    "At each turn, a player takes an action from the list of actions. Some actions can be challenged or blocked, in which case other players might challenge or block the action", 
    "When a player loses an influence, it selects a card to surrender. That card becomes visible to all players and is out of the game."
]; 

const ACTIONS = [
    "Income: get 1 coin", 
    "Coup: pay 7 coins; select on player to lose an influence", 
    "Foreign Aid: get 2 coins",
    "Tax: get 3 coins", 
    "Assasinate: select a player, pay 3 coins and that player loses an influence", 
    "Exchange: draw 2 cards from the deck and return 2 cards to the deck secretly.", 
    "Steal: select a player and take 2 coins from them" 
]


const CHARACTER_ABILITIES = [
    "Duke: can tax, blocks foreign aid", 
    "Captain: can steal, blocks stealing", 
    "Ambassador: can exchange, blocks stealing", 
    "Assassin: can assasinate", 
    "Contessa: blocks assasination"
]


const CHALLENGES = [
    "When a player claims an action (except Income, Coup or Foreign Aid), all other players can start a challenge",
    "During a challenge, if the player has a card the claimed ability, the player can reveal that card. The challenger loses an influence.", 
    "Otherwise, the challenge succeeds and the chalengee lose an influence. The action is canceled.", 
]

const BLOCKS = [
    "Certain characters has abilities to block actions, effectively cancelling the action.",
    "Only the player(s) affected by an action can attempt to block", 
    "If an action can be both challenged and blocked, then the challenges are resolved first", 
    "Block can also be challenged", 
]

const SPECIAL_RULES = [
    "If a player starts its turn with 10 coins or more, then it must select the coup action", 
    "If Assasination is successfuly challenged, then the player does not pay 3 coins. However, if it is blocked, then the coins are paid.", 
]

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


export default function RulesModal(props) {
    const [isOpen, setIsOpen] = useState(false);

    function rulesContainer(heading, rules){
        return (
            <div>
                <h3>{heading}</h3>
                <ul>
                {
                    rules.map((rule, index) => {
                    return ( <li key={index}>{rule}</li> )
                    })
                }
                </ul>
            </div>
        )
    }




    function closeModal() {
        setIsOpen(false)
    }

    function openModal(){
        setIsOpen(true)
    }

    function renderButton(){
        if (props.style === "small"){
            return (
                <Button onClick={openModal}>
                <FontAwesomeIcon className="infoIconInline" icon={faInfoCircle} />
                </Button>
            )
        } else{
            return(
                // <div className="rules">
                <ColorButton onClick={openModal}>
                <FontAwesomeIcon className="infoIcon" icon={faInfoCircle} />
                <span>Show rules</span>
                </ColorButton>
                // </div>
            )
        }
    }

    return (
        <>
        {renderButton()}
        <ReactModal
        isOpen={isOpen}
        onRequestClose={closeModal}
        contentLabel=""
        >
        <button onClick={closeModal}>x</button>
        {rulesContainer("General Rules", GENERAL_RULES)}
        {rulesContainer("Actions", ACTIONS)}
        {rulesContainer("Character Abilities", CHARACTER_ABILITIES)}
        {rulesContainer("Challenges", CHALLENGES)}
        {rulesContainer("Blocks", BLOCKS)}
        {rulesContainer("Special Rules", SPECIAL_RULES)}
        </ReactModal >
        </>
    )

}