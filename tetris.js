// Tetris Game
const canvas = document.getElementById("tetrisCanvas");
const ctx = canvas.getContext("2d");
const nextCanvas = document.getElementById("nextCanvas");
const nextCtx = nextCanvas.getContext("2d");

// Game constants
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 20;

// Colors for Tetris pieces
const COLORS = {
  empty: "#0f172a",
  I: "#06b6d4",
  O: "#fbbf24",
  T: "#a78bfa",
  S: "#10b981",
  Z: "#ef4444",
  J: "#3b82f6",
  L: "#f97316"
};

// Tetris pieces
const PIECES = {
  I: [
    [1, 1, 1, 1]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1]
  ]
};

const PIECE_NAMES = Object.keys(PIECES);

// Game state
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let lines = 0;
let level = 1;
let highScore = localStorage.getItem("tetrisHighScore") || 0;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 600;
let gameInterval = null;

// Initialize
document.getElementById("highScore").textContent = highScore;

// Initialize board
function initBoard() {
  board = [];
  for (let i = 0; i < ROWS; i++) {
    board[i] = [];
    for (let j = 0; j < COLS; j++) {
      board[i][j] = 0;
    }
  }
}

// Get random piece
function getRandomPiece() {
  const name = PIECE_NAMES[Math.floor(Math.random() * PIECE_NAMES.length)];
  return {
    name: name,
    matrix: JSON.parse(JSON.stringify(PIECES[name])),
    x: Math.floor(COLS / 2) - 1,
    y: 0
  };
}

// Initialize game
function initGame() {
  initBoard();
  currentPiece = getRandomPiece();
  nextPiece = getRandomPiece();
  score = 0;
  lines = 0;
  level = 1;
  gameSpeed = 600;
  updateStats();
  draw();
}

// Update stats display
function updateStats() {
  document.getElementById("score").textContent = score;
  document.getElementById("lines").textContent = lines;
  document.getElementById("level").textContent = level;
}

// Draw game
function draw() {
  // Draw board
  ctx.fillStyle = COLORS.empty;
  ctx.fillRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);

  // Draw grid
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= ROWS; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * BLOCK_SIZE);
    ctx.lineTo(COLS * BLOCK_SIZE, i * BLOCK_SIZE);
    ctx.stroke();
  }
  for (let j = 0; j <= COLS; j++) {
    ctx.beginPath();
    ctx.moveTo(j * BLOCK_SIZE, 0);
    ctx.lineTo(j * BLOCK_SIZE, ROWS * BLOCK_SIZE);
    ctx.stroke();
  }

  // Draw placed blocks
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      if (board[i][j]) {
        drawBlock(j, i, board[i][j]);
      }
    }
  }

  // Draw current piece
  if (currentPiece) {
    for (let i = 0; i < currentPiece.matrix.length; i++) {
      for (let j = 0; j < currentPiece.matrix[i].length; j++) {
        if (currentPiece.matrix[i][j]) {
          drawBlock(currentPiece.x + j, currentPiece.y + i, currentPiece.name);
        }
      }
    }
  }

  // Draw next piece
  drawNextPiece();
}

// Draw a block
function drawBlock(x, y, color) {
  const colorValue = typeof color === "string" ? COLORS[color] : color;
  ctx.fillStyle = colorValue;
  ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.strokeRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
}

// Draw next piece preview
function drawNextPiece() {
  nextCtx.fillStyle = "#0f172a";
  nextCtx.fillRect(0, 0, 100, 100);

  if (nextPiece) {
    const offsetX = (100 - nextPiece.matrix[0].length * 20) / 2;
    const offsetY = (100 - nextPiece.matrix.length * 20) / 2;

    for (let i = 0; i < nextPiece.matrix.length; i++) {
      for (let j = 0; j < nextPiece.matrix[i].length; j++) {
        if (nextPiece.matrix[i][j]) {
          nextCtx.fillStyle = COLORS[nextPiece.name];
          nextCtx.fillRect(
            offsetX + j * 20 + 1,
            offsetY + i * 20 + 1,
            18,
            18
          );
          nextCtx.strokeStyle = "#000";
          nextCtx.lineWidth = 1;
          nextCtx.strokeRect(
            offsetX + j * 20 + 1,
            offsetY + i * 20 + 1,
            18,
            18
          );
        }
      }
    }
  }
}

// Check collision
function canMove(piece, dx, dy) {
  const newX = piece.x + dx;
  const newY = piece.y + dy;

  for (let i = 0; i < piece.matrix.length; i++) {
    for (let j = 0; j < piece.matrix[i].length; j++) {
      if (piece.matrix[i][j]) {
        const x = newX + j;
        const y = newY + i;

        if (x < 0 || x >= COLS || y >= ROWS) {
          return false;
        }
        if (y >= 0 && board[y][x]) {
          return false;
        }
      }
    }
  }
  return true;
}

// Rotate piece
function rotatePiece(piece) {
  const rotated = {
    ...piece,
    matrix: []
  };

  const n = piece.matrix.length;
  const m = piece.matrix[0].length;

  for (let j = 0; j < m; j++) {
    const row = [];
    for (let i = n - 1; i >= 0; i--) {
      row.push(piece.matrix[i][j]);
    }
    rotated.matrix.push(row);
  }

  // Check if rotation is valid
  if (canMove(rotated, 0, 0)) {
    return rotated;
  }

  // Try to move left/right to fit
  for (let offset of [-1, 1, -2, 2]) {
    if (canMove(rotated, offset, 0)) {
      rotated.x += offset;
      return rotated;
    }
  }

  return piece;
}

// Place piece on board
function placePiece() {
  for (let i = 0; i < currentPiece.matrix.length; i++) {
    for (let j = 0; j < currentPiece.matrix[i].length; j++) {
      if (currentPiece.matrix[i][j]) {
        const y = currentPiece.y + i;
        const x = currentPiece.x + j;

        if (y < 0) {
          gameOver();
          return;
        }

        board[y][x] = currentPiece.name;
      }
    }
  }

  // Check for completed lines
  clearLines();

  // Next piece
  currentPiece = nextPiece;
  nextPiece = getRandomPiece();

  // Check if new piece can move
  if (!canMove(currentPiece, 0, 0)) {
    gameOver();
  }
}

// Clear completed lines
function clearLines() {
  let linesCleared = 0;

  for (let i = ROWS - 1; i >= 0; i--) {
    let full = true;
    for (let j = 0; j < COLS; j++) {
      if (!board[i][j]) {
        full = false;
        break;
      }
    }

    if (full) {
      board.splice(i, 1);
      board.unshift(new Array(COLS).fill(0));
      linesCleared++;
      i++;
    }
  }

  if (linesCleared > 0) {
    lines += linesCleared;
    const points = [40, 100, 300, 1200];
    score += points[linesCleared - 1] * level;
    updateStats();

    // Update level
    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel > level) {
      level = newLevel;
      gameSpeed = Math.max(200, 600 - (level - 1) * 80);
      updateGameSpeed();
    }
  }
}

// Keyboard input
document.addEventListener("keydown", handleInput);

function handleInput(event) {
  if (!gameRunning || gamePaused) return;

  // Prevent default scroll behavior for arrow keys
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }

  switch (event.key) {
    case "ArrowLeft":
      if (canMove(currentPiece, -1, 0)) {
        currentPiece.x--;
      }
      break;
    case "ArrowRight":
      if (canMove(currentPiece, 1, 0)) {
        currentPiece.x++;
      }
      break;
    case "ArrowDown":
      if (canMove(currentPiece, 0, 1)) {
        currentPiece.y++;
        score += 1;
      } else {
        placePiece();
      }
      break;
    case "ArrowUp":
      currentPiece = rotatePiece(currentPiece);
      break;
    case " ":
      // Hard drop
      while (canMove(currentPiece, 0, 1)) {
        currentPiece.y++;
        score += 2;
      }
      placePiece();
      break;
  }
}

// Game loop
function gameLoop() {
  if (canMove(currentPiece, 0, 1)) {
    currentPiece.y++;
  } else {
    placePiece();
  }
  draw();
}

// Start game
document.getElementById("startBtn").addEventListener("click", startGame);

function startGame() {
  if (!gameRunning) {
    gameRunning = true;
    gamePaused = false;
    initGame();

    document.getElementById("startBtn").disabled = true;
    document.getElementById("pauseBtn").disabled = false;
    document.getElementById("pauseBtn").textContent = "Pauze";

    gameInterval = setInterval(gameLoop, gameSpeed);
  }
}

// Toggle pause
document.getElementById("pauseBtn").addEventListener("click", togglePause);

function togglePause() {
  if (!gameRunning) return;

  gamePaused = !gamePaused;

  if (gamePaused) {
    clearInterval(gameInterval);
    document.getElementById("pauseBtn").textContent = "Hervat";

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GEPAUZEERD", (COLS * BLOCK_SIZE) / 2, (ROWS * BLOCK_SIZE) / 2);
  } else {
    document.getElementById("pauseBtn").textContent = "Pauze";
    gameInterval = setInterval(gameLoop, gameSpeed);
  }
}

// Reset game
document.getElementById("resetBtn").addEventListener("click", resetGame);

function resetGame() {
  clearInterval(gameInterval);
  gameRunning = false;
  gamePaused = false;
  initGame();

  document.getElementById("startBtn").disabled = false;
  document.getElementById("startBtn").textContent = "Start Game";
  document.getElementById("pauseBtn").disabled = true;
  document.getElementById("pauseBtn").textContent = "Pauze";
}

// Game over
function gameOver() {
  clearInterval(gameInterval);
  gameRunning = false;
  gamePaused = false;

  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("tetrisHighScore", highScore);
    document.getElementById("highScore").textContent = highScore;
  }

  // Draw game over
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER!", (COLS * BLOCK_SIZE) / 2, (ROWS * BLOCK_SIZE) / 2 - 30);

  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, (COLS * BLOCK_SIZE) / 2, (ROWS * BLOCK_SIZE) / 2 + 20);
  ctx.fillText(`Level: ${level}`, (COLS * BLOCK_SIZE) / 2, (ROWS * BLOCK_SIZE) / 2 + 50);

  document.getElementById("startBtn").disabled = false;
  document.getElementById("startBtn").textContent = "Start Game";
  document.getElementById("pauseBtn").disabled = true;
}

// Update game speed
function updateGameSpeed() {
  if (gameRunning && !gamePaused) {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
  }
}

// Initial draw
initBoard();
draw();
