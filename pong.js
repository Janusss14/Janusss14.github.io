// Pong Game
const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 8;
const PADDLE_SPEED = 6;
const WIN_SCORE = 11;

// Game state
let gameRunning = false;
let gamePaused = false;
let gameInterval = null;

// Paddles
const paddle1 = {
  x: 10,
  y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0,
  score: 0
};

const paddle2 = {
  x: CANVAS_WIDTH - PADDLE_WIDTH - 10,
  y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0,
  score: 0
};

// Ball
const ball = {
  x: CANVAS_WIDTH / 2,
  y: CANVAS_HEIGHT / 2,
  size: BALL_SIZE,
  dx: 5,
  dy: 5,
  speed: 5
};

// Key states
const keys = {};

document.addEventListener("keydown", (event) => {
  keys[event.key.toUpperCase()] = true;
  
  // Prevent default scroll behavior
  if (["ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }

  if (event.code === "Space") {
    if (!gameRunning) {
      startGame();
    } else {
      togglePause();
    }
  }
});

document.addEventListener("keyup", (event) => {
  keys[event.key.toUpperCase()] = false;
});

// Initialize game
function initGame() {
  paddle1.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
  paddle2.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
  paddle1.score = 0;
  paddle2.score = 0;
  
  resetBall();
  updateScore();
  draw();
}

// Reset ball
function resetBall() {
  ball.x = CANVAS_WIDTH / 2;
  ball.y = CANVAS_HEIGHT / 2;
  ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
  ball.dy = (Math.random() - 0.5) * 8;
}

// Update score display
function updateScore() {
  document.getElementById("score1").textContent = paddle1.score;
  document.getElementById("score2").textContent = paddle2.score;
}

// Draw game
function draw() {
  // Clear canvas with black background
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw center line (dashed)
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, 0);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw paddles
  ctx.fillStyle = "#fff";
  ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
  ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);

  // Draw ball
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fill();

  // Draw border
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// Update game state
function update() {
  // Update paddle 1 movement
  if (keys["W"] || keys["ARROWUP"]) {
    paddle1.dy = -PADDLE_SPEED;
  } else if (keys["S"] || keys["ARROWDOWN"]) {
    paddle1.dy = PADDLE_SPEED;
  } else {
    paddle1.dy = 0;
  }

  // Update paddle 2 movement
  if (keys["I"]) {
    paddle2.dy = -PADDLE_SPEED;
  } else if (keys["K"]) {
    paddle2.dy = PADDLE_SPEED;
  } else {
    paddle2.dy = 0;
  }

  // Move paddles
  paddle1.y += paddle1.dy;
  paddle2.y += paddle2.dy;

  // Paddle boundaries
  if (paddle1.y < 0) paddle1.y = 0;
  if (paddle1.y + paddle1.height > CANVAS_HEIGHT) {
    paddle1.y = CANVAS_HEIGHT - paddle1.height;
  }

  if (paddle2.y < 0) paddle2.y = 0;
  if (paddle2.y + paddle2.height > CANVAS_HEIGHT) {
    paddle2.y = CANVAS_HEIGHT - paddle2.height;
  }

  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ball collision with top/bottom
  if (ball.y - ball.size <= 0 || ball.y + ball.size >= CANVAS_HEIGHT) {
    ball.dy = -ball.dy;
    ball.y = Math.max(ball.size, Math.min(CANVAS_HEIGHT - ball.size, ball.y));
  }

  // Ball collision with paddles
  // Paddle 1
  if (
    ball.x - ball.size <= paddle1.x + paddle1.width &&
    ball.y >= paddle1.y &&
    ball.y <= paddle1.y + paddle1.height &&
    ball.dx < 0
  ) {
    ball.dx = -ball.dx;
    ball.x = paddle1.x + paddle1.width + ball.size;
    // Add spin based on where ball hits paddle
    ball.dy += (ball.y - (paddle1.y + paddle1.height / 2)) / 5;
  }

  // Paddle 2
  if (
    ball.x + ball.size >= paddle2.x &&
    ball.y >= paddle2.y &&
    ball.y <= paddle2.y + paddle2.height &&
    ball.dx > 0
  ) {
    ball.dx = -ball.dx;
    ball.x = paddle2.x - ball.size;
    // Add spin based on where ball hits paddle
    ball.dy += (ball.y - (paddle2.y + paddle2.height / 2)) / 5;
  }

  // Ball out of bounds
  if (ball.x - ball.size < 0) {
    paddle2.score++;
    updateScore();
    checkWin();
    resetBall();
  }

  if (ball.x + ball.size > CANVAS_WIDTH) {
    paddle1.score++;
    updateScore();
    checkWin();
    resetBall();
  }
}

// Check if someone won
function checkWin() {
  if (paddle1.score >= WIN_SCORE) {
    endGame("Player 1 wint!");
  } else if (paddle2.score >= WIN_SCORE) {
    endGame("Player 2 wint!");
  }
}

// Game loop
function gameLoop() {
  update();
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

    gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
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

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GEPAUZEERD", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  } else {
    document.getElementById("pauseBtn").textContent = "Pauze";
    gameInterval = setInterval(gameLoop, 1000 / 60);
  }
}

// End game
function endGame(message) {
  clearInterval(gameInterval);
  gameRunning = false;
  gamePaused = false;

  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 50px Arial";
  ctx.textAlign = "center";
  ctx.fillText(message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${paddle1.score} - ${paddle2.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);

  document.getElementById("startBtn").disabled = false;
  document.getElementById("startBtn").textContent = "Nieuw Spel";
  document.getElementById("pauseBtn").disabled = true;
  document.getElementById("pauseBtn").textContent = "Pauze";
}

// Initial draw
initGame();
