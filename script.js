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

const resetButton = document.querySelector('.reset');
resetButton.addEventListener('click', () => {
    board = [];
    gameOver = false;
    resetStopwatch();
    initializeBoard();
    resetButton.innerHTML = `
        <img src="images/smilie-2.png" alt="img" height="43" style="padding:0 2px; padding-top: 2px;">
    `;
    document.querySelector('.win').innerHTML = '';
    
    bombSound.pause();
    bombSound.currentTime = 0;
    
    winSound.pause();
    winSound.currentTime = 0;

    render();
});

// Game Initialization and Rendering
function initializeBoard() {
    for (let row = 0; row < NUM_ROWS; ++row) {
        const numRow = [];
        for (let col = 0; col < NUM_COLS; ++col) {
            numRow.push({
                isMine: false,
                isRevealed: false,
                count: 0,
            });
        }
        board.push(numRow);
    }

    // Placing mines randomly
    let mines = 0;
    while (mines < NUM_MINES) {
        const randomRow = Math.floor(Math.random() * NUM_ROWS);
        const randomCol = Math.floor(Math.random() * NUM_COLS);

        if (!board[randomRow][randomCol].isMine) {
            board[randomRow][randomCol].isMine = true;
            mines++;
        }
    }

    // Counting adjacent mines
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1], [1, -1],
        [1, 0], [1, 1],
    ];
    for (let row = 0; row < NUM_ROWS; ++row) {
        for (let col = 0; col < NUM_COLS; ++col) {
            if (!board[row][col].isMine) {
                let count = 0;
                for (const [dx, dy] of directions) {
                    const iLoc = row + dx;
                    const jLoc = col + dy;

                    if (isInBounds(iLoc, jLoc) && board[iLoc][jLoc].isMine) {
                        count++;
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
                    tile.style.backgroundImage = 'url("images/bomb.ico")';
                    tile.style.backgroundSize = 'cover';
                    tile.style.backgroundRepeat = 'no-repeat';
                    tile.style.backgroundPosition = 'center';
                    document.querySelector('.reset').innerHTML = `
                        <img src="images/sad.png" alt="img" height="43" style="padding:0 2px; padding-top: 2px;">
                    `;
                    clearInterval(timeInterval);
                } else if (board[row][col].count > 0) {
                    tile.innerText = board[row][col].count;
                    tile.style.color = getColor(board[row][col].count);
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

function getColor(count) {
    switch (count) {
        case 2: return '#74E291';
        case 3: return '#FF6B6B';
        default: return '#96C9F4';
    }
}

// Game Logic
function revealTile(row, col) {
    if (gameOver || !isInBounds(row, col) || board[row][col].isRevealed) return;

    if (!timerStarted) {
        startStopwatch(); 
        timerStarted = true;
    }
    board[row][col].isRevealed = true;

    if (board[row][col].isMine) {
        handleMineReveal();
    } else {
        clickSound.play();
        if (board[row][col].count === 0) {
            revealNeighbors(row, col);
        }
    }
    if (checkForWin()) {
        handleWin();
    }
    render();
}

function isInBounds(row, col) {
    return row >= 0 && row < NUM_ROWS && col >= 0 && col < NUM_COLS;
}

function handleMineReveal() {
    bombSound.play();
    gameOver = true;
    for (let r = 0; r < NUM_ROWS; r++) {
        for (let c = 0; c < NUM_COLS; c++) {
            if (board[r][c].isMine) {
                board[r][c].isRevealed = true;
            }
        }
    }
}

function revealNeighbors(row, col) {
    const queue = [[row, col]]; 

    while (queue.length > 0) { 
        const [r, c] = queue.shift(); 

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const newRow = r + dx;
                const newCol = c + dy;

                if (isInBounds(newRow, newCol) && !board[newRow][newCol].isRevealed && !board[newRow][newCol].isMine) {
                    board[newRow][newCol].isRevealed = true;

                    if (board[newRow][newCol].count === 0) {    
                        queue.push([newRow, newCol]);
                    }
                }
            }
        }
    }
}

function checkForWin() {
    let revealedTiles = 0;
    const totalSafeTiles = NUM_ROWS * NUM_COLS - NUM_MINES;

    for (let r = 0; r < NUM_ROWS; r++) {
        for (let c = 0; c < NUM_COLS; c++) {
            if (board[r][c].isRevealed && !board[r][c].isMine) {
                revealedTiles++;
            }
        }
    }

    return revealedTiles === totalSafeTiles;
}

function handleWin() {
    gameOver = true;
    winSound.play();
    document.querySelector('.win').innerHTML = `<img src="images/crown.png" alt="img" height="55">`;
}

// Initialize and Render the Game Board
initializeBoard();
render();
