Saturday, May 22, 2021

Many randome failures

- `io.sockets.adapter.rooms[roomName]` lookup fails although the console log shows that it exists? 

- Typescript does not show types when hovered (only shows `any`). But in another project (multiplayer-snake) it shows, where it's not even using ts. 


Sunday, June 13, 2021

Using React and router to refactor the frontend...currently working great and learning lots about React. Will get the basics of creating and joining rooms ready before June 15. Then work on the game panel frontend. Probably targeting MVP by end of month. 




## Itemized logs

- ~~Show player who is who~~ Monday, May 24, 2021

- Disable action when it's not their turn. 

- ~~Coup action~~ Monday, May 24, 2021

- ~~Game over logic~~ Wednesday, May 26, 2021

- ~~Rematch~~ Wednesday, May 26, 2021

- ~~distribute initial cards to players.~~ Thursday, May 27, 2021

- ~~Randomize initial cards~~ Thursday, May 27, 2021

- ~~Activity log~~ Sunday, May 30, 2021
    - scrollable list 

- ~~Challengable actions. ~~ Friday, June 4, 2021
    - ~~allow defining a new action that's challengable~~ Sunday, May 30, 2021  
    - ~~handle other player's challenge, confirm and display it~~ Sunday, May 30, 2021
    - ~~display skipped challenges also~~ Thursday, June 3, 2021
    - ~~handle reveals from the original player~~  Monday, May 31, 2021
    - ~~compute and send result of legit reveal.~~ Friday, June 4, 2021 
    - ~~compute and send result of successful challenge.~~ Monday, May 31, 2021
    - ~~in challenge state, other actions should be disregarded~~ Monday, May 31, 2021
    - ~~shuffle deck and give back new card~~ Saturday, June 5, 2021
    - ~~handle surrender in case of failed challenge~~ Sunday, June 6, 2021

- ~~Flush activity log upon rematch~~ Friday, June 4, 2021 

- ~~Blockable actions~~ 
    - ~~letting user send block request.~~ Sunday, June 6, 2021
    - ~~validate and display request.~~ Sunday, June 6, 2021
    - ~~make it possible to challenge a block.~~ Monday, June 7, 2021
    - ~~handle blocking success~~ Tuesday, June 8, 2021 
    - ~~handle blocking fail~~ Tuesday, June 8, 2021 

- Add all other action types
    - ~~foreign aid~~ Sunday, June 6, 2021
    - exchange
    - ~~assasinate~~ Monday, June 7, 2021
    - ~~steal~~ Tuesday, June 8, 2021 

- More "reactive" UI 
    - ~~display token and cards~~ Tuesday, June 8, 2021
    - display trucated player ids 
    - ~~display player cards~~ Tuesday, June 8, 2021

- ~~Make user surrender when couped.~~ Tuesday, June 8, 2021

- Fix bug when a user keeps connecting. 

- End to end test scenarios (Explore selenium) 

- Revamp to React instead of EJS
    - ~~Setup basic react landing page~~ Thursday, June 10, 2021
    - ~~setup create~~ Friday, June 11, 2021
    - ~~setup join~~ Friday, June 11, 2021
    - handle connect to socket.io 
    - handle gameplay
    - handle end game and rematch
    - more reactive UI

- ~~Issue that some cards are marked as revealed on rematch.~~ 

- Manual step 2
    - normal action 
    - tax 
    - challenge 
    - reveal false

- Manual step 3
    - coup 
    - coup
    - coup


- ~~Issue with life being -1~~ Thursday, June 10, 2021
Player 0 played Coup on player 1
Player 1 played surrender with 0
Player 1 played Income
Player 0 played Tax
Player zQPBWxq1wikxTIaMAAAD played skip
Player 1 played ForeignAid
Player 1pTkGjC7pD7IBdgRAAAC played skip block
Player 0 played Assasinate on player 1
Player zQPBWxq1wikxTIaMAAAD played skip
Player zQPBWxq1wikxTIaMAAAD played block
Player 1pTkGjC7pD7IBdgRAAAC played challenge
Player zQPBWxq1wikxTIaMAAAD played reveal with Assassin
Player 1pTkGjC7pD7IBdgRAAAC played lost one life
```

- ~~Issue with legit reveal but life point not deducted from challenger~~ Wednesday, June 9, 2021
```
Player 0 played Tax
Player 32qKo3PVxm1EFzucAAAI played challenge
Player 0-27_0uGRC98AAujAAAH played reveal with card Contessa
Player 0-27_0uGRC98AAujAAAH played lost one life
Player 1 played Tax
Player 0-27_0uGRC98AAujAAAH played challenge
Player 32qKo3PVxm1EFzucAAAI played reveal with card Duke
Player 0 played surrender with card 1
```

## React 

- ~~Room with players panel~~ Wednesday, June 16, 2021
- ~~Player set ready~~ Wednesday, June 16, 2021 
- ~~Set startable game when all players are ready~~ Thursday, June 17, 2021
- ~~Display player state when game is in progress~~ Saturday, June 19, 2021
- Action section
    - ~~Income~~ Saturday, June 19, 2021
    - ~~Coup~~ Saturday, June 19, 2021 
    - ~~Coup selection~~ Saturday, June 19, 2021
    - Tax 
    - Challenge 
    - Ass
    - Blocking
    - Steal
    - Exchange 
- Player name selection 
- status section (wait for action from ...)

### nice-to-haves 
- Event logs 
- Room code copying



