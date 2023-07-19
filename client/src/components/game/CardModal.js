import ReactModal from "react-modal";
import React, { useState } from 'react'
import '../styles/styles.css';
import { CardDisplay } from "../CardsDisplay";

const getAction = (card) => {
    switch (card) {
        case "Duke":
            return "Tax"
        case "Captain":
            return "Steal"
        case "Ambassador":
            return "Exchange"
        case "Assassin":
            return "Assasinate"
        case "Contessa":
            return "None"
        default: 
            return "???"
    }
}; 

const getBlock = (card) => {
    switch (card) {
        case "Duke":
            return "ForeignAid"
        case "Captain":
            return "Steal"
        case "Ambassador":
            return "Steal"
        case "Assassin":
            return "None"
        case "Contessa":
            return "Assasinate"
        default: 
            return "???"
    }
}; 

export default function CardModal(props) {

    const card = props.card; 

    let revealed = card.isRevealed ? "revealed" : "available" 

    return (
        <>
        <CardDisplay card={card.name.toLowerCase()} revealed={props.revealed}/>
        <div className={`cardouter ${revealed} ${card.name.toLowerCase()}`}>
        </div>
        </>
    )


}