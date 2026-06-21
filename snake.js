const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;

let snake = [];
snake[0] = { x: 9 * box, y: 9 * box };

let direction = "RIGHT";

let food = {
  x: Math.floor(Math.random() * 19) * box,
  y: Math.floor(Math.random() * 19) * box
};

document.addEventListener("keydown", updateDirection);

function updateDirection(event) {
  if (event.keyCode == 37 && direction != "RIGHT") direction = "LEFT";
  else if (event.keyCode == 38 && direction != "DOWN") direction = "UP";
  else if (event.keyCode == 39 && direction != "LEFT") direction = "RIGHT";
  else if (event.keyCode == 40 && direction != "UP") direction = "DOWN";
}

function draw() {
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, 400, 400);

  // snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i == 0 ? "#22c55e" : "#16a34a";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // food
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(food.x, food.y, box, box);

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction == "LEFT") headX -= box;
  if (direction == "RIGHT") headX += box;
  if (direction == "UP") headY -= box;
  if (direction == "DOWN") headY += box;

  // eet food
  if (headX == food.x && headY == food.y) {
    food = {
      x: Math.floor(Math.random() * 19) * box,
      y: Math.floor(Math.random() * 19) * box
    };
  } else {
    snake.pop();
  }

  let newHead = { x: headX, y: headY };

  // game over
  if (
    headX < 0 || headY < 0 ||
    headX >= 400 || headY >= 400 ||
    collision(newHead, snake)
  ) {
    clearInterval(game);
    alert("Game Over!");
  }

  snake.unshift(newHead);
}

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x == array[i].x && head.y == array[i].y) {
      return true;
    }
  }
  return false;
}

let game = setInterval(draw, 100);
