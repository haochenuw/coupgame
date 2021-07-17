import ReactModal from "react-modal";
import React, { useState } from 'react'

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
    console.log(`props = ${JSON.stringify(props)}`)

    const [isOpen, setIsOpen] = useState(false);

    const card = props.card; 
    const revealedColor = "red";
    const availableColor = "green";

    function closeModal() {
        setIsOpen(false)
    }

    function cardClicked(){
        setIsOpen(true)
    }

    return (
        <>
        <div className="mycard w-10" onClick={cardClicked} style={{ color: card.isRevealed ? revealedColor : availableColor }}>
        <div className="content">
            {card.name}
            {/* <img src="data:image/svg+xml;base64,PHN2ZyBpZD0iQ2FwYV8xIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PHBhdGggZD0ibTQzNC42MTggODQuNTk2Yy0uMDA4LS4wMDctLjAxNC0uMDEyLS4wMjItLjAxOWwtNzUuMDM5LTI1LjgyMS0xMzAuOTk0IDI1LjgyMnY1Ny4xNDFsMjE0LjU4NSAzNS40MDIgMzguMjY2LTM1LjQwMmMtMTIuNDQtMjEuNDk2LTI4LjI5MS00MC43ODktNDYuNzk2LTU3LjEyM3oiIGZpbGw9IiNlN2E1MmUiLz48ZyBmaWxsPSIjZTdhNTJlIj48cGF0aCBkPSJtNDM0LjU5OCA0MjcuNDIyLTk3Ljk0My0xOC42MzUtMTA4LjA5MiAxOC42MzV2NTcuMTQxaDU0Ljg3NGM1Ny4zODcgMCAxMDkuODMtMjEuMTUyIDE0OS45NjYtNTYuMDgyIi8+PHBhdGggZD0ibTIyOC41NjMgMzcwLjI4MiAxNTQuNTM3IDIyLjM3IDk4LjMxNS0yMi4zNzFjMTAuMjMxLTE3LjY4NiAxOC4xNjYtMzYuODY4IDIzLjM4NC01Ny4xNDFsLTExNC45NjYtMzMuMTQ0LTE2MS4yNyAzMy4xNDR6Ii8+PC9nPjxwYXRoIGQ9Im01MDQuNzk5IDE5OC44NTktNzAuMjAxLTQxLjkyOS0yMDYuMDM1IDQxLjkyOXY1Ny4xNDFsMjI0Ljk2MyA0MC42MiA1OC40NzQtNDAuNjJjMC0xOS43MzQtMi40OTgtMzguODc2LTcuMjAxLTU3LjE0MXoiIGZpbGw9IiNlN2E1MmUiLz48cGF0aCBkPSJtNDgwLjEzMSAyNTZjMC0xMjYuMjMyLTEwMi4zMzEtMjI4LjU2My0yMjguNTYzLTIyOC41NjMtNy43NjUgMC0xNS40MzguMzkxLTIzLjAwNCAxLjE0OHY0NTUuOTc5aDIzLjAwNGMxMjYuMjMxLS4wMDEgMjI4LjU2My0xMDIuMzMyIDIyOC41NjMtMjI4LjU2NHoiIGZpbGw9IiNlMjg0MjQiLz48ZyBmaWxsPSIjYzg1OTI5Ij48cGF0aCBkPSJtNDM0LjU5OCA4NC41NzhjLTQwLjI5LTM1LjU1Ni05My4yMDEtNTcuMTQxLTE1MS4xNjEtNTcuMTQxaC01NC44NzR2NTcuMTQxeiIvPjxwYXRoIGQ9Im0yMjguNTYzIDE5OC44NTloMjc2LjIzNmMtNS4yMTgtMjAuMjczLTEzLjE1My0zOS40NTQtMjMuMzg0LTU3LjE0MWgtMjUyLjg1MnoiLz48cGF0aCBkPSJtMjI4LjU2MyAzMTMuMTQxaDI3Ni4yMzZjNC43MDEtMTguMjY0IDcuMjAxLTM3LjQxIDcuMjAxLTU3LjE0MWgtMjgzLjQzN3oiLz48cGF0aCBkPSJtMjI4LjU2MyA0MjcuNDIyaDIwNi4wMzVjMTguNTE4LTE2LjM0MiAzNC4zNzMtMzUuNjI5IDQ2LjgxNy01Ny4xNDFoLTI1Mi44NTJ6Ii8+PC9nPjxwYXRoIGQ9Im00NDkuNTQ1IDM3MC4yODJoLTIyMC45ODJ2NTcuMTQxaDE3NC4xNjVjMTguNTE4LTE2LjM0MiAzNC4zNzMtMzUuNjMgNDYuODE3LTU3LjE0MXoiIGZpbGw9IiNiOTQwMjkiLz48cGF0aCBkPSJtNDgwLjEzMSAyNTZoLTI1MS41Njd2NTcuMTQxaDI0NC4zNjZjNC43LTE4LjI2NCA3LjIwMS0zNy40MSA3LjIwMS01Ny4xNDF6IiBmaWxsPSIjYjk0MDI5Ii8+PHBhdGggZD0ibTQ0OS41NDUgMTQxLjcxOGgtMjIwLjk4MnY1Ny4xNDFoMjQ0LjM2N2MtNS4yMTgtMjAuMjczLTEzLjE1My0zOS40NTQtMjMuMzg1LTU3LjE0MXoiIGZpbGw9IiNiOTQwMjkiLz48cGF0aCBkPSJtMjUxLjU2NyAyNy40MzdjLTcuNzY1IDAtMTUuNDM4LjM5MS0yMy4wMDQgMS4xNDh2NTUuOTkzaDE3NC4xNjVjLTQwLjI5LTM1LjU1Ni05My4yMDEtNTcuMTQxLTE1MS4xNjEtNTcuMTQxeiIgZmlsbD0iI2I5NDAyOSIvPjxjaXJjbGUgY3g9IjIyOC41NjMiIGN5PSIyNTYiIGZpbGw9IiNmNmUyNjYiIHI9IjIyOC41NjMiLz48cGF0aCBkPSJtNzYuODU3IDQyNi45MzljMTEuNTU1IDEwLjI2MiAyNC4xNDggMTkuMzc5IDM3LjYxNyAyNy4xNTNsNjIuNjk3LTQyMC44NTJjLTE1LjI3MyAzLjUwOS0yOS45NTYgOC41NTctNDMuODkgMTQuOTU3eiIgZmlsbD0iI2ZiZjRhZiIvPjxwYXRoIGQ9Im0yMjguNTYzIDI3LjQzN2MtNC4xNTQgMC04LjI4LjExOC0xMi4zOC4zMzcgMTIwLjQ3NSA2LjQzMSAyMTYuMTgzIDEwNi4xNDggMjE2LjE4MyAyMjguMjI2cy05NS43MDkgMjIxLjc5NS0yMTYuMTgzIDIyOC4yMjdjNC4xLjIxOSA4LjIyNi4zMzcgMTIuMzguMzM3IDEyNi4yMzIgMCAyMjguNTYzLTEwMi4zMzEgMjI4LjU2My0yMjguNTYzcy0xMDIuMzMxLTIyOC41NjQtMjI4LjU2My0yMjguNTY0eiIgZmlsbD0iI2VhYjE0ZCIvPjxjaXJjbGUgY3g9IjIyOC41NjMiIGN5PSIyNTYiIGZpbGw9IiNlN2E1MmUiIHI9IjE4NC4wNzciLz48cGF0aCBkPSJtMjI4LjU2MyA3MS45MjNjLTQuNjA0IDAtOS4xNjguMTc0LTEzLjY4Ny41MDcgOTUuMjcgNy4wMDMgMTcwLjM5IDg2LjUxMiAxNzAuMzkgMTgzLjU3cy03NS4xMTkgMTc2LjU2Ny0xNzAuMzkgMTgzLjU3YzQuNTIuMzMyIDkuMDgzLjUwNyAxMy42ODcuNTA3IDEwMS42NjMgMCAxODQuMDc3LTgyLjQxNCAxODQuMDc3LTE4NC4wNzdzLTgyLjQxNC0xODQuMDc3LTE4NC4wNzctMTg0LjA3N3oiIGZpbGw9IiNlMjg0MjQiLz48cGF0aCBkPSJtODUuMTM2IDM3MS4zNzFjMTAuNTQxIDEzLjA4OCAyMi44MyAyNC43MDggMzYuNTIzIDM0LjQ5NGw0OC4zMzEtMzI0LjQyMmMtMTYuMTA5IDUuNDAzLTMxLjIyMSAxMi45NzUtNDQuOTk0IDIyLjM2NnoiIGZpbGw9IiNlYWIxNGQiLz48cGF0aCBkPSJtMjM0LjE4MyAxNTQuNTkyIDM0Ljc0OSA1My4zODVjLjkwMSAxLjM4NSAyLjI4MiAyLjM4OCAzLjg3OCAyLjgxN2w2MS41MSAxNi41NTFjNC42ODIgMS4yNiA2LjUyMSA2LjkxOSAzLjQ3MyAxMC42OWwtNDAuMDM0IDQ5LjU0NWMtMS4wMzggMS4yODUtMS41NjYgMi45MDgtMS40ODEgNC41NThsMy4yNjYgNjMuNjE0Yy4yNDkgNC44NDItNC41NjUgOC4zMzktOS4wOTMgNi42MDdsLTU5LjQ5MS0yMi43NjRjLTEuNTQzLS41OS0zLjI1LS41OS00Ljc5MyAwbC01OS40OTEgMjIuNzY0Yy00LjUyOCAxLjczMy05LjM0Mi0xLjc2NS05LjA5My02LjYwN2wzLjI2Ni02My42MTRjLjA4NS0xLjY1LS40NDMtMy4yNzMtMS40ODEtNC41NThsLTQwLjAzNC00OS41NDVjLTMuMDQ3LTMuNzcxLTEuMjA5LTkuNDMgMy40NzMtMTAuNjlsNjEuNTEtMTYuNTUxYzEuNTk1LS40MjkgMi45NzYtMS40MzMgMy44NzgtMi44MTdsMzQuNzQ5LTUzLjM4NWMyLjY0NC00LjA2MyA4LjU5NC00LjA2MyAxMS4yMzkgMHoiIGZpbGw9IiNjODU5MjkiLz48cGF0aCBkPSJtMzM0LjMyIDIyNy4zNDYtNjEuNTEtMTYuNTUxYy0xLjU5NS0uNDMtMi45NzYtMS40MzMtMy44NzgtMi44MTdsLTIuOTI2LTQuNDk1Yy0uMjk0IDMzLjkxOS01LjE4OCA4OC41MzItMjkuMjE3IDEzOC4zNDRsNTMuNjYyIDIwLjUzNGM0LjUyOCAxLjczMyA5LjM0Mi0xLjc2NSA5LjA5My02LjYwN2wtMy4yNjYtNjMuNjE0Yy0uMDg1LTEuNjUuNDQzLTMuMjczIDEuNDgxLTQuNTU4bDQwLjAzNC00OS41NDVjMy4wNDctMy43NzMgMS4yMDgtOS40MzEtMy40NzMtMTAuNjkxeiIgZmlsbD0iI2I5NDAyOSIvPjwvZz48L3N2Zz4=" /> */}
        </div>
        </div>
        <ReactModal
        isOpen={isOpen}
        onRequestClose={closeModal}
        contentLabel="My dialog"
        >
        <div>Card: {card.name}</div>
        <div>Action: {getAction(card.name)}</div>
        <div>Blocks: {getBlock(card.name)}</div>
        <button onClick={closeModal}>Close modal</button>
        </ReactModal >
        </>
    )


}