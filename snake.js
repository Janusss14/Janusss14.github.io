const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game Variables
const box = 20;
let snake = [];
let direction = "RIGHT";
let nextDirection = "RIGHT";
let food = {};
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 100;
let gameInterval;

// Update high score display
document.getElementById("highScore").textContent = highScore;

// Initialize game
function initGame() {
  snake = [{ x: 9 * box, y: 9 * box }];
  direction = "RIGHT";
  nextDirection = "RIGHT";
  score = 0;
  gameSpeed = 100;
  generateFood();
  document.getElementById("score").textContent = score;
  draw();
}

// Generate food at random position
function generateFood() {
  let newFood;
  let foodOnSnake = true;
  
  while (foodOnSnake) {
    newFood = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box
    };
    
    foodOnSnake = snake.some(segment => 
      segment.x === newFood.x && segment.y === newFood.y
    );
  }
  
  food = newFood;
}

// Handle keyboard input
document.addEventListener("keydown", handleInput);

function handleInput(event) {
  // Prevent default scroll behavior for arrow keys
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }

  const key = event.key.toUpperCase();
  
  // Arrow keys
  if (event.keyCode === 37 && direction !== "RIGHT") nextDirection = "LEFT";
  else if (event.keyCode === 38 && direction !== "DOWN") nextDirection = "UP";
  else if (event.keyCode === 39 && direction !== "LEFT") nextDirection = "RIGHT";
  else if (event.keyCode === 40 && direction !== "UP") nextDirection = "DOWN";
  
  // WASD keys
  else if (key === "A" && direction !== "RIGHT") nextDirection = "LEFT";
  else if (key === "W" && direction !== "DOWN") nextDirection = "UP";
  else if (key === "D" && direction !== "LEFT") nextDirection = "RIGHT";
  else if (key === "S" && direction !== "UP") nextDirection = "DOWN";
  
  // Spacebar for pause
  else if (event.code === "Space") {
    togglePause();
  }
}

// Draw game
function draw() {
  // Draw background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, 400, 400);
  
  // Draw grid
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 20; i++) {
    ctx.beginPath();
    ctx.moveTo(i * box, 0);
    ctx.lineTo(i * box, 400);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, i * box);
    ctx.lineTo(400, i * box);
    ctx.stroke();
  }

  // Update direction
  direction = nextDirection;

  // Calculate new head position
  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "UP") headY -= box;
  if (direction === "DOWN") headY += box;

  // Check collision with walls
  if (headX < 0 || headY < 0 || headX >= 400 || headY >= 400) {
    gameOver();
    return;
  }

  // Check collision with self
  if (collision({ x: headX, y: headY }, snake)) {
    gameOver();
    return;
  }

  let newHead = { x: headX, y: headY };

  // Check if food is eaten
  if (headX === food.x && headY === food.y) {
    score++;
    document.getElementById("score").textContent = score;
    
    // Increase speed slightly
    if (score % 5 === 0 && gameSpeed > 50) {
      gameSpeed -= 5;
      updateGameSpeed();
    }
    
    generateFood();
  } else {
    snake.pop();
  }

  snake.unshift(newHead);

  // Draw food
  drawFood();

  // Draw snake
  drawSnake();
}

// Draw snake
function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    if (i === 0) {
      // Head
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(snake[i].x + 1, snake[i].y + 1, box - 2, box - 2);
      ctx.strokeStyle = "#16a34a";
      ctx.lineWidth = 2;
      ctx.strokeRect(snake[i].x + 1, snake[i].y + 1, box - 2, box - 2);
      
      // Eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(snake[i].x + 5, snake[i].y + 5, 3, 3);
      ctx.fillRect(snake[i].x + 12, snake[i].y + 5, 3, 3);
    } else {
      // Body
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(snake[i].x + 1, snake[i].y + 1, box - 2, box - 2);
      ctx.strokeStyle = "#15803d";
      ctx.lineWidth = 1;
      ctx.strokeRect(snake[i].x + 1, snake[i].y + 1, box - 2, box - 2);
    }
  }
}

// Draw food
function drawFood() {
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Food shine
  ctx.fillStyle = "#fca5a5";
  ctx.beginPath();
  ctx.arc(food.x + box / 3, food.y + box / 3, box / 6, 0, Math.PI * 2);
  ctx.fill();
}

// Check collision
function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) {
      return true;
    }
  }
  return false;
}

// Game over
function gameOver() {
  clearInterval(gameInterval);
  gameRunning = false;
  gamePaused = false;
  
  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("snakeHighScore", highScore);
    document.getElementById("highScore").textContent = highScore;
  }
  
  // Draw game over screen
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, 400, 400);
  
  ctx.fillStyle = "#fff";
  ctx.font = "bold 40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER!", 200, 150);
  
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 200, 210);
  ctx.fillText(`High Score: ${highScore}`, 200, 250);
  
  // Update button states
  document.getElementById("startBtn").disabled = false;
  document.getElementById("startBtn").textContent = "Start Game";
  document.getElementById("pauseBtn").disabled = true;
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
    
    gameInterval = setInterval(draw, gameSpeed);
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
    
    // Draw pause overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GEPAUZEERD", 200, 200);
  } else {
    document.getElementById("pauseBtn").textContent = "Pauze";
    gameInterval = setInterval(draw, gameSpeed);
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

// Update game speed
function updateGameSpeed() {
  if (gameRunning && !gamePaused) {
    clearInterval(gameInterval);
    gameInterval = setInterval(draw, gameSpeed);
  }
}

// Initial draw
initGame();
