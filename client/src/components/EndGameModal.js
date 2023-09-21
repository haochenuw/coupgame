import ReactModal from "react-modal";
import React, { useState } from 'react'
import './styles/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Button from "@material-ui/core/Button";
import { withStyles } from '@material-ui/core/styles';
import { AdsPanel } from "./Ads";

export function EndGameModal(props) {
    const [isOpen, setIsOpen] = useState(props.open);

    function closeModal() {
        setIsOpen(false)
    }

    return (
        <>
            <ReactModal
                isOpen={isOpen}
                onRequestClose={closeModal}
                contentLabel=""
                style={{
                    content: {
                        backgroundColor: "#abdbe3",
                        height: "20vw",
                        width: "60vw",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    },
                }}
            >
                <div>
                    {/* <button className="closebtn" onClick={closeModal}>x</button> */}
                    <span className="winnertext">Winner is {props.name}!</span>
                    {/* <AdsPanel small={true}/> */}
                </div>
            </ReactModal >
        </>
    )

}