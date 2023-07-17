import React, { useState, useContext, useEffect } from 'react'
import { WarningButton } from '../ColorButton';
import { SocketContext } from "./../Room";

export default function ExchangeSelector(props) {
    const cards = props.cards;
    // let cards = localGameState.pendingExchangeCards.map(card => card.name);
    let numToKeep = cards.length - 2;
    const socket = useContext(SocketContext);

    const [cardStates, setCardStates] = useState(cards.map((_) => false));
    const [cardsToKeep, setCardsToKeep] = useState([]);

    useEffect(() => {
        if (cardsToKeep.length === numToKeep) {
            console.log(`Everything selected`)

            // already selected everything
            socket.emit('action', { source: props.myName, name: "ExchangeResponse", target: null, additionalData: cardsToKeep });
            props.exchangeCallback();
        }
    }, [cardsToKeep]);
    return (
        <div className="selection">
            <h2>Choose {numToKeep} cards to keep </h2>
            {cards.map((item, key) => {
                return (
                    <WarningButton disabled={cardStates[key]} onClick={(event) => onKeepSelected(event, key, item)}>{item}</WarningButton>
                )
            }
            )}
        </div>
    )

    function onKeepSelected(event, key, item) {
        console.log(`event = ${event.currentTarget}`)
        // event.currentTarget.disabled = true;
        setCardStates(cardStates.map((state, index) => {
            if (index === key) return true;
            else if (state === true) return true;
            return false;
        }))
        console.log(`user selected ${item} to keep`)
        setCardsToKeep(cardsToKeep => [...cardsToKeep, item]);
    }
}