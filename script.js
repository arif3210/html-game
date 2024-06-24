const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvasSize = 400;
const snakeSize = 20;
const gameSpeed = 100;

let snake = [{ x: 160, y: 200 }, { x: 140, y: 200 }, { x: 120, y: 200 }];
let foodX;
let foodY;
let dx = snakeSize;
let dy = 0;
let score = 0;
let changingDirection = false;
let gameRunning = true;

// Create initial food position
createFood();

function gameLoop() {
    if (didGameEnd()) {
        gameRunning = false;
        return;
    }

    setTimeout(function onTick() {
        if (gameRunning) {
            changingDirection = false;
            clearCanvas();
            drawFood();
            moveSnake();
            drawSnake();
            gameLoop();
        }
    }, gameSpeed);
}

// Start the game loop
gameLoop();

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
}

function drawSnakePart(snakePart) {
    ctx.fillStyle = 'lightgreen';
    ctx.strokeStyle = 'darkgreen';
    ctx.fillRect(snakePart.x, snakePart.y, snakeSize, snakeSize);
    ctx.strokeRect(snakePart.x, snakePart.y, snakeSize, snakeSize);
}

function drawSnake() {
    snake.forEach(drawSnakePart);
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(foodX, foodY, snakeSize, snakeSize);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    const hasEatenFood = snake[0].x === foodX && snake[0].y === foodY;
    if (hasEatenFood) {
        score += 10;
        createFood();
    } else {
        snake.pop();
    }
}

function randomTen(min, max) {
    return Math.round((Math.random() * (max - min) + min) / snakeSize) * snakeSize;
}

function createFood() {
    foodX = randomTen(0, canvasSize - snakeSize);
    foodY = randomTen(0, canvasSize - snakeSize);

    snake.forEach(function isFoodOnSnake(part) {
        const foodIsOnSnake = part.x === foodX && part.y === foodY;
        if (foodIsOnSnake) createFood();
    });
}

function didGameEnd() {
    for (let i = 4; i < snake.length; i++) {
        const didCollide = snake[i].x === snake[0].x && snake[i].y === snake[0].y;
        if (didCollide) return true;
    }

    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > canvasSize - snakeSize;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > canvasSize - snakeSize;
    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
        endGame();
        return true;
    }
    return false;
}

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    if (changingDirection) return;
    changingDirection = true;
    const keyPressed = event.keyCode;
    const goingUp = dy === -snakeSize;
    const goingDown = dy === snakeSize;
    const goingRight = dx === snakeSize;
    const goingLeft = dx === -snakeSize;

    if (keyPressed === 37 && !goingRight) {
        dx = -snakeSize;
        dy = 0;
    }
    if (keyPressed === 38 && !goingDown) {
        dx = 0;
        dy = -snakeSize;
    }
    if (keyPressed === 39 && !goingLeft) {
        dx = snakeSize;
        dy = 0;
    }
    if (keyPressed === 40 && !goingUp) {
        dx = 0;
        dy = snakeSize;
    }
}

function endGame() {
    const playerName = prompt('Enter your name:');
    const data = { name: playerName, score: score };

    fetch('http://localhost:3000/leaderboard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        updateLeaderboard();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function updateLeaderboard() {
    fetch('http://localhost:3000/leaderboard')
        .then(response => response.json())
        .then(entries => {
            const leaderboardDiv = document.getElementById('leaderboard');
            leaderboardDiv.innerHTML = entries.map(entry => `<p>${entry.name}: ${entry.score}</p>`).join('');
        })
        .catch(error => console.error('Error:', error));
}

document.getElementById('restartButton').addEventListener('click', restartGame);
document.getElementById('endGameButton').addEventListener('click', endGame);

function restartGame() {
    snake = [{ x: 160, y: 200 }, { x: 140, y: 200 }, { x: 120, y: 200 }];
    dx = snakeSize;
    dy = 0;
    score = 0;
    changingDirection = false;
    gameRunning = true;
    gameLoop();
}

updateLeaderboard();
