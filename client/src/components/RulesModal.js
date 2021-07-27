import ReactModal from "react-modal";
import React, { useState } from 'react'
import './styles/styles.css';

const GENERAL_RULES = [
    "Supports 2-6 player. The deck contains 15 cartds, 3 of each character.", 
    "The game starts with each player having two random cards from the deck and two coins. Each player can see its own cards but not others cards. The last player who still has a card(influence) wins",  
    "At each turn, a player choose an action granted by its cards truthfully, or lie and claim an action it does not posess", 
    "Other players may challenge or block the action", 
    "When a player loses an influence, it selects a card to surrender. That card becomes visible to all players and is out of the game."
]; 

const ACTIONS = [
    "Income: get one coin", 
    "Coup: pay 7 coins; select on player to lose an influence", 
    "Foreign Aid: get two coins",
    "Tax: get 3 coins", 
    "Assasinate: select a player, pay 3 coins and that player loses an influence", 
    "Exchange: draw 2 cards from the deck and return 2 cards to the deck secretly. Card in hand can be returned as well as the newly drawn cards.", 
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
    "Otherwise, the challenge succeeds and the chalengee will lose an influence. The action is canceled.", 
]

const BLOCKS = [
    "Certain characters has abilities to block actions, effectively cancelling the action.",
    "Only the player(s) affected by an action can attempt to block", 
    "If an action can be both challenged and blocked, then the challenges will be resolved before blocks", 
    "Note: block can also be challenged", 
]

const SPECIAL_RULES = [
    "If a player has 10 coins or more when then it must select the coup action", 
    "If a", 
]

export default function RulesModal(props) {
    const [isOpen, setIsOpen] = useState(false);

    function rulesContainer(heading, rules){
        return (
            <div>
                <h3>{heading}</h3>
                <ul>
                {
                    rules.map((rule, index) => {
                    return ( <li>{rule}</li> )
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

    return (
        <>
        <div className="rules">
            <button  onClick={openModal}>Show rules</button>
        </div>
        <ReactModal
        isOpen={isOpen}
        onRequestClose={closeModal}
        contentLabel=""
        >
        <button onClick={closeModal}>x</button>
        {rulesContainer("General Rules", GENERAL_RULES)}
        {rulesContainer("Character Abilities", CHARACTER_ABILITIES)}
        {rulesContainer("Challenges", CHALLENGES)}
        {rulesContainer("Blocks", BLOCKS)}
        {rulesContainer("Special Rules", SPECIAL_RULES)}
        </ReactModal >
        </>
    )

}