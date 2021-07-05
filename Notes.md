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
```
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


## React 

- ~~Room with players panel~~ Wednesday, June 16, 2021
- ~~Player set ready~~ Wednesday, June 16, 2021 
- ~~Set startable game when all players are ready~~ Thursday, June 17, 2021
- ~~Display player state when game is in progress~~ Saturday, June 19, 2021
- Action section
    - ~~Income~~ Saturday, June 19, 2021
    - ~~Coup~~ Saturday, June 19, 2021 
    - ~~Coup selection~~ Saturday, June 19, 2021
    - ~~Coup surrender selection~~ Sunday, June 20, 2021
    - ~~Tax~~ Monday, June 21, 2021 
    - Challenge 
        - ~~Challenge an action~~ Saturday, June 26, 2021 
        - ~~Challenge a block~~ Saturday, June 26, 2021 
        - ~~Block after failed challenge~~ Saturday, June 26, 2021 
        - ~~Block after skip challenge~~ Saturday, June 26, 2021 
    - ~~Ass~~ Monday, June 21, 2021
    - ~~Blocking~~ Thursday, June 24, 2021
    - ~~Steal~~ Tuesday, June 22, 2021
    - ~~Exchange~~ Tuesday, June 22, 2021 

- ~~Who can block~~ Friday, June 25, 2021

- ~~Who can challenge~~ Saturday, June 26, 2021

- Player name selection
    - ~~display friendly names~~ Thursday, June 24, 2021 
    - ~~make server recognize names during game~~ Thursday, June 24, 2021 
- ~~More than 2 player mode~~ Tuesday, June 22, 2021 
- ~~End game section~~ Tuesday, June 22, 2021 
   - ~~who won~~ Tuesday, June 22, 2021 
   - ~~rematch~~ Tuesday, June 22, 2021 
   
- ~~Mask other player state~~ Sunday, June 27, 2021

- ~~Event logs~~ Sunday, June 27, 2021 

- ~~Constants change~~ Sunday, June 27, 2021 

- ~~Client action cost validation~~ Sunday, June 27, 2021

- Debug some weird issues (sometimes reveal will freeze the server)

- ~~Consistent masking~~ Monday, June 28, 2021

### ~~Deploy (heroku or digital ocean)~~ Tuesday, June 29, 2021 !!!

### nice-to-haves 
- ~~Make exchange selection look better (disable already selected )~~ Wednesday, June 30, 2021
- ~~Randomize starting player~~ Wednesday, June 30, 2021
- ~~Allow Joining through link~~  
- Room code copying button 
- Remember socket connection after Refresh
- Remember socket connection after Closing browser tab (Check netgames.io see how it saves state)
- Better UI   
    - ~~Logging font families~~ Sunday, July 4, 2021 
    - Token -> pictures 
    - Life -> pictures
    - Card sizing
    - Card background color
- Handle Player disconnection
- Auto reveal if has the right card during challenge. ? 
- ~~number player check~~ Sunday, July 4, 2021

### More Fancy features 

- ~~Custom domain~~ Thursday, July 1, 2021 (got coupgames.xyz)
- Players leave 

## Bugs 

- ~~Challenging a "block" incorrect result, e.g. challenging duke's block foreign aid. ~~ Sunday, June 27, 2021

- ~~Challenging a block no response~~ Friday, July 2, 2021 (do not use while loop!)

- ~~Card not shuffled after revealing duke~~ Monday, June 28, 2021

- multiplayers: 
 - ~~C shouldn't be able to block A stealing/assasinating B~~ Sunday, July 4, 2021
 - ~~Players already dead cannot be targets of steal/coup/etc.~~ Sunday, July 4, 2021
 - player who selected skipped/blocked/challenged should go into waiting mode. 

## Feedbacks 

- ~~Put skip and challenge in one screen~~ Thursday, July 1, 2021

- ~~add "space between skip and challenge" in event log~~ Thursday, July 1, 2021

- ~~disable coup and assasinate when not enough tokens~~ Saturday, July 3, 2021

## Notes 

Can debug mobile device using safari "develop" feature. Select in the "develop" manual the user agent to be iOS. 

There's some issue with getting the initial game state on mobile 


## Tricky situation

in both c and b actions. If someone blocks first, need to "wait" on that block to happen until 
everyone has made decision about challenge. If someone challenges, then the challenge is revealed first
before block can take place. If every skips