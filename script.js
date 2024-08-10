// Global Variables
const NUM_ROWS = 9;
const NUM_COLS = 9;
const NUM_MINES = 10;

let board = [];
let gameOver = false;
let timerStarted = false;

const clickSound = document.getElementById('click-sound');
const bombSound = document.getElementById('bomb-sound');
const winSound = document.getElementById('win-sound');

let seconds = 0;
let minutes = 0;
let timeInterval = null;

// Stopwatch Functions
function startStopwatch() {
    timeInterval = setInterval(() => {
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
        }
        document.getElementById('time').textContent =
            (minutes < 10 ? "0" + minutes : minutes) + ":" +
            (seconds < 10 ? "0" + seconds : seconds);
    }, 1000);
}

function resetStopwatch() {
    clearInterval(timeInterval);
    seconds = 0;
    minutes = 0;
    timerStarted = false;
    document.getElementById('time').textContent = "00:00";
}

// Event Listeners
const resetButton = document.querySelector('.reset');
resetButton.addEventListener('click', () => {
    board = [];
    gameOver = false;
    resetStopwatch();
    initializeBoard();
    resetButton.innerHTML = `
        <img src="images/smilie-2.png" alt="img" height="43" style="padding:0 2px; padding-top: 2px;">
    `;
    
    // Stop and reset sounds
    bombSound.pause();
    bombSound.currentTime = 0;
    
    winSound.pause();
    winSound.currentTime = 0;

    render();
});

// Game Initialization and Rendering
function initializeBoard() {
    for (let row = 0; row < NUM_ROWS; ++row) {
        board[row] = [];
        for (let col = 0; col < NUM_COLS; ++col) {
            board[row][col] = {
                isMine: false,
                isRevealed: false,
                count: 0,
            };
        }
    }

    let mines = 0;
    while (mines < NUM_MINES) {
        const randomRow = Math.floor(Math.random() * NUM_ROWS);
        const randomCol = Math.floor(Math.random() * NUM_COLS);

        if (!board[randomRow][randomCol].isMine) {
            board[randomRow][randomCol].isMine = true;
            mines++;
        }
    }

    for (let row = 0; row < NUM_ROWS; ++row) {
        for (let col = 0; col < NUM_COLS; ++col) {
            if (!board[row][col].isMine) {
                let count = 0;
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const iLoc = row + dx;
                        const jLoc = col + dy;

                        if (
                            iLoc >= 0 &&
                            iLoc < NUM_ROWS &&
                            jLoc >= 0 &&
                            jLoc < NUM_COLS &&
                            board[iLoc][jLoc].isMine
                        ) {
                            count++;
                        }
                    }
                }
                board[row][col].count = count;
            }
        }
    }
}

function render() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = "";
    for (let row = 0; row < NUM_ROWS; ++row) {
        for (let col = 0; col < NUM_COLS; ++col) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            if (board[row][col].isRevealed) {
                tile.classList.add('revealed');
                if (board[row][col].isMine) {
                    tile.classList.add('mine');
                    tile.style.backgroundImage = 'url("/images/bomb.ico")';
                    tile.style.backgroundSize = 'cover';
                    tile.style.backgroundRepeat = 'no-repeat';
                    tile.style.backgroundPosition = 'center';
                    document.querySelector('.reset').innerHTML = `
                        <img src="images/sad.png" alt="img" height="43" style="padding:0 2px; padding-top: 2px;">
                    `;
                    clearInterval(timeInterval); // Pause the timer when a bomb is found
                } else if (board[row][col].count > 0) {
                    tile.innerText = board[row][col].count;
                    if (tile.innerText == '3') {
                        tile.style.color = '#FF6B6B';
                    } else if (tile.innerText == '2') {
                        tile.style.color = '#74E291';
                    } else {
                        tile.style.color = '#96C9F4';
                    }
                }
            }
            tile.addEventListener('click', () => {
                revealTile(row, col);
            });
            gameBoard.appendChild(tile);
        }
        const br = document.createElement('br');
        gameBoard.appendChild(br);
    }
}

// Game Logic
function revealTile(row, col) {
    if (gameOver) return;

    if (
        row >= 0 &&
        row < NUM_ROWS &&
        col >= 0 &&
        col < NUM_COLS &&
        !board[row][col].isRevealed
    ) {
        if (!timerStarted) {
            startStopwatch(); // Start the timer on the first click
            timerStarted = true;
        }
        
        board[row][col].isRevealed = true;

        if (board[row][col].isMine) {
            bombSound.play(); // Play bomb sound if a bomb is revealed
            gameOver = true; // Set the game over flag
            for (let r = 0; r < NUM_ROWS; r++) {
                for (let c = 0; c < NUM_COLS; c++) {
                    if (board[r][c].isMine) {
                        board[r][c].isRevealed = true;
                    }
                }
            }
        } else {
            clickSound.play(); // Play click sound for non-bomb tiles
            if (board[row][col].count === 0) {
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        revealTile(row + dx, col + dy);
                    }
                }
            }

            // Check for a win
            let revealedTiles = 0;
            let totalSafeTiles = NUM_ROWS * NUM_COLS - NUM_MINES;

            for (let r = 0; r < NUM_ROWS; r++) {
                for (let c = 0; c < NUM_COLS; c++) {
                    if (board[r][c].isRevealed && !board[r][c].isMine) {
                        revealedTiles++;
                    }
                }
            }

            if (revealedTiles === totalSafeTiles) {
                gameOver = true;
                winSound.play(); // Play win sound when all non-mine tiles are revealed
            }
        }
        render();
    }
}

// Initialize and Render the Game Board
initializeBoard();
render();
