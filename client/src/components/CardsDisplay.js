import React, { useState, useContext, useEffect } from 'react'
import './styles/styles.css';

const allCards = ["duke", "assassin", "captain", "contessa", "ambassador"];

export function CardsDisplay(props) {
    return (
        <div className="cards">
            {allCards.map((card) => {
                return (
                    <CardDisplay card={card} />
                )
            })}
        </div>
    )
}

export function CardDisplay(props) {
    const card = props.card;
    const [flipped, setFlipped] = useState(false);
    const revealed = props.revealed ? 'revealed' : ''; 

    const name = flipped ? 'flipped' : '';

    const handleClick = () => {
        setFlipped(false);
        setTimeout(() => {
            setFlipped(true);
        }, 100);
    }

    return (
        <div className={`cardcontainer ${name}`}>
            <div className={`cardface cardfront ${card} ${revealed}`} onClick={handleClick}></div>
            <div className="cardface cardback">
                <div className={`cardinner`}>{card.toUpperCase()}</div>
            </div>
        </div>
    )
}