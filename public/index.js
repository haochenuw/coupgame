const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameButton = document.getElementById('newGameButton');
const joinGameButton = document.getElementById('joinGameButton');
const rematchButton = document.getElementById('rematchButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const gameResultDisplay = document.getElementById('gameResultDisplay');
const gameOverPanel = document.getElementById('gameOverPanel');

joinGameButton.addEventListener('click', joinGame);

// const socket = io("http://localhost:3002");


function joinGame(){
    const code = gameCodeInput.value;
    // socket.emit('joinGame', code); 
    // init(); 
}



const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnkownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('rematch', handleRematch);
socket.on('redirect', hanldeRedirect);

function hanldeRedirect(dest){
    console.log(`dest = ${dest}`); 
    window.location.href = dest;
}


let canvas, ctx;
let playerNumber; 
let gameActive = false; 

function handleRematch(){
    console.log('Got rematch response, starting new game...');
    init(); 
}

function init(){
    initialScreen.style.display = "none";
    gameOverPanel.style.display = "none";
    gameScreen.style.display = "block";
    
    document.addEventListener('keydown', keydown);
    gameActive = true; 
}

function keydown(event){
  socket.emit('keydown', event.keyCode)
  console.log(event.keyCode);
}

function paintGame(state){
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0,0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x*size, food.y*size, size, size);

  paintPlayer(state.players[0], size, SNAKE_COLOUR);
  paintPlayer(state.players[1], size, 'red');
}

function paintPlayer(playerState, size, colour){
  const snake = playerState.snake;
  ctx.fillStyle = colour;
  for (let cell of snake){
    ctx.fillRect(cell.x*size, cell.y*size, size, size);
  }
}


function handleInit(number){
  playerNumber = number; 
}

function handleGameState(gameState){
    if(!gameActive){
        return; 
    }
    gameState = JSON.parse(gameState); 
    requestAnimationFrame(() => paintGame(gameState)); 
}

function handleGameOver(data){
    if (gameActive){
        data = JSON.parse(data);
        if (data.winner == playerNumber){
            gameResultDisplay.innerText = "You win"; 
        } else{
            gameResultDisplay.innerText = "You lose"; 
        }
        gameOverPanel.style.display = "block"; 
        gameActive = false; 
        rematch(); 
    }   
}



function rematch() {
    // toggle button visibility
    rematchButton.addEventListener("click",  ()=> {
        socket.emit('rematchRequest'); 
    });
    // once button pressed, 
    // 1. disable button. 
    // 2. send signal to server. 
    // 3. on server response, call init
}


function handleGameCode(gameCode){
    gameCodeDisplay.innerText = gameCode; 
}

function handleUnkownGame() {
    reset(); 
    alert('unknown game code');
}

function handleTooManyPlayers() {
    reset(); 
    alert('this game is already in progress');
}

function reset() {
    playerNumber = null; 
    gameCodeInput.value = ""; 
    gameCodeDisplay.innerText = ""; 
    initialScreen.style.display = "block"; 
    gameScreen.style.display = "none"; 
}
