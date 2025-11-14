// Hardcore 2 Global Mode Check - PERSISTENT FOREVER
function isHardcore2() {
    const isActive = localStorage.getItem('hardcore2Global') === 'true';
    // Log on first check to confirm it's active
    if (isActive && !window.hardcore2Logged) {
        console.log('🔥 HARDCORE 2 MODE IS ACTIVE - All games are in hardcore mode!');
        window.hardcore2Logged = true;
    }
    return isActive;
}

// Check on page load and display status
window.addEventListener('DOMContentLoaded', () => {
    if (isHardcore2()) {
        console.log('🔥 HARDCORE 2 MODE PERSISTENT - Active across all games');
    }
});

// Menu Navigation
function showMenu() {
    // Stop all games
    if (snakeGame) snakeGame.stop();
    if (tetrisGame) tetrisGame.stop();
    if (pongGame) pongGame.stop();
    if (breakoutGame) breakoutGame.stop();
    if (flappyGame) flappyGame.stop();
    if (spaceInvadersGame) spaceInvadersGame.stop();
    if (wordleGame) wordleGame.stop();
    if (whackamoleGame) whackamoleGame.stop();
    if (platformerGame) platformerGame.stop();
    if (racingGame) racingGame.stop();
    
    document.getElementById('gameMenu').style.display = 'flex';
    document.getElementById('snakeGame').style.display = 'none';
    document.getElementById('tetrisGame').style.display = 'none';
    document.getElementById('pongGame').style.display = 'none';
    document.getElementById('memoryGame').style.display = 'none';
    document.getElementById('reactionGame').style.display = 'none';
    document.getElementById('breakoutGame').style.display = 'none';
    document.getElementById('game2048Game').style.display = 'none';
    document.getElementById('flappyGame').style.display = 'none';
    document.getElementById('tictactoeGame').style.display = 'none';
    document.getElementById('simonGame').style.display = 'none';
    document.getElementById('calculatorGame').style.display = 'none';
    document.getElementById('spaceinvadersGame').style.display = 'none';
    document.getElementById('wordleGame').style.display = 'none';
    document.getElementById('whackamoleGame').style.display = 'none';
    document.getElementById('platformerGame').style.display = 'none';
    document.getElementById('racingGame').style.display = 'none';
}

function showGame(gameName) {
    document.getElementById('gameMenu').style.display = 'none';
    document.getElementById('snakeGame').style.display = 'none';
    document.getElementById('tetrisGame').style.display = 'none';
    document.getElementById('pongGame').style.display = 'none';
    document.getElementById('memoryGame').style.display = 'none';
    document.getElementById('reactionGame').style.display = 'none';
    document.getElementById('breakoutGame').style.display = 'none';
    document.getElementById('game2048Game').style.display = 'none';
    document.getElementById('flappyGame').style.display = 'none';
    document.getElementById('tictactoeGame').style.display = 'none';
    document.getElementById('simonGame').style.display = 'none';
    document.getElementById('calculatorGame').style.display = 'none';
    document.getElementById('spaceinvadersGame').style.display = 'none';
    document.getElementById('wordleGame').style.display = 'none';
    document.getElementById('whackamoleGame').style.display = 'none';
    document.getElementById('platformerGame').style.display = 'none';
    document.getElementById('racingGame').style.display = 'none';
    
    document.getElementById(gameName + 'Game').style.display = 'block';
    
    // Initialize the game
    if (gameName === 'snake' && snakeGame) snakeGame.init();
    if (gameName === 'tetris' && tetrisGame) tetrisGame.init();
    if (gameName === 'pong' && pongGame) pongGame.init();
    if (gameName === 'memory' && memoryGame) memoryGame.init();
    if (gameName === 'reaction' && reactionGame) reactionGame.init();
    if (gameName === 'breakout' && breakoutGame) breakoutGame.init();
    if (gameName === 'game2048' && game2048) game2048.init();
    if (gameName === 'flappy' && flappyGame) flappyGame.init();
    if (gameName === 'tictactoe' && tictactoeGame) tictactoeGame.init();
    if (gameName === 'simon' && simonGame) simonGame.init();
    if (gameName === 'calculator' && calculatorGame) calculatorGame.init();
    if (gameName === 'spaceinvaders' && spaceInvadersGame) spaceInvadersGame.init();
    if (gameName === 'wordle' && wordleGame) wordleGame.init();
    if (gameName === 'whackamole' && whackamoleGame) whackamoleGame.init();
    if (gameName === 'platformer' && platformerGame) platformerGame.init();
    if (gameName === 'racing' && racingGame) racingGame.init();
}

// Game card click handlers
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
        const game = card.dataset.game;
        showGame(game);
    });
});

// ==================== SNAKE GAME ====================
const snakeGame = {
    canvas: null,
    ctx: null,
    gridSize: 20,
    tileCount: 30,
    snake: [{x: 10, y: 10}],
    food: {x: 15, y: 15},
    dx: 0,
    dy: 0,
    score: 0,
    highScore: 0,
    gameLoop: null,
    paused: false,
    particles: [],
    foodPulse: 0,
    
    init() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.tileCount * this.gridSize;
        this.canvas.height = this.tileCount * this.gridSize;
        
        this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
        document.getElementById('snakeHighScore').textContent = this.highScore;
        
        this.restart();
        this.setupControls();
    },
    
    setupControls() {
        // Remove old handler if it exists
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        this.keyHandler = (e) => {
            // Only process keys if the game is visible
            const gameScreen = document.getElementById('snakeGame');
            if (!gameScreen || gameScreen.style.display === 'none') {
                return;
            }
            
            if (this.paused && e.key !== 'p' && e.key !== 'P') return;
            
            if (e.key === 'p' || e.key === 'P') {
                this.pause();
                return;
            }
            
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                if (this.dy !== 1) { this.dx = 0; this.dy = -1; }
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                if (this.dy !== -1) { this.dx = 0; this.dy = 1; }
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                if (this.dx !== 1) { this.dx = -1; this.dy = 0; }
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                if (this.dx !== -1) { this.dx = 1; this.dy = 0; }
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    },
    
    stop() {
        // Stop the game loop
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        // Remove event listener
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }
        // Reset state
        this.paused = true;
        this.dx = 0;
        this.dy = 0;
    },
    
    restart() {
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.paused = false;
        this.particles = [];
        this.foodPulse = 0;
        this.generateFood();
        document.getElementById('snakeScore').textContent = this.score;
        
        if (this.gameLoop) clearInterval(this.gameLoop);
        // Hardcore 2: Much faster game speed (30ms instead of 100ms) - EXTREME DIFFICULTY
        const gameSpeed = isHardcore2() ? 30 : 100;
        this.gameLoop = setInterval(() => this.update(), gameSpeed);
    },
    
    pause() {
        this.paused = !this.paused;
        if (this.paused) {
            clearInterval(this.gameLoop);
        } else {
            this.gameLoop = setInterval(() => this.update(), 100);
        }
    },
    
    generateFood() {
        this.food.x = Math.floor(Math.random() * this.tileCount);
        this.food.y = Math.floor(Math.random() * this.tileCount);
        
        // Make sure food doesn't spawn on snake
        for (let segment of this.snake) {
            if (segment.x === this.food.x && segment.y === this.food.y) {
                this.generateFood();
                return;
            }
        }
    },
    
    update() {
        if (this.paused || (this.dx === 0 && this.dy === 0)) {
            this.draw();
            return;
        }
        
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('snakeScore').textContent = this.score;
            // Create particles
            for (let i = 0; i < 8; i++) {
                this.particles.push({
                    x: this.food.x * this.gridSize + this.gridSize / 2,
                    y: this.food.y * this.gridSize + this.gridSize / 2,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    life: 20,
                    color: `hsl(${Math.random() * 60 + 0}, 100%, 50%)`
                });
            }
            this.generateFood();
        } else {
            this.snake.pop();
        }
        
        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            return p.life > 0;
        });
        
        // Update food pulse
        this.foodPulse += 0.1;
        
        this.draw();
    },
    
    draw() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#1a1a2e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw snake body with gradient
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const alpha = 0.5 + (i / this.snake.length) * 0.5;
            const size = this.gridSize - 2;
            const x = segment.x * this.gridSize + 1;
            const y = segment.y * this.gridSize + 1;
            
            // Gradient for each segment
            const segGradient = this.ctx.createRadialGradient(
                x + size/2, y + size/2, 0,
                x + size/2, y + size/2, size/2
            );
            segGradient.addColorStop(0, `rgba(76, 175, 80, ${alpha})`);
            segGradient.addColorStop(1, `rgba(46, 125, 50, ${alpha})`);
            
            this.ctx.fillStyle = segGradient;
            this.ctx.fillRect(x, y, size, size);
            
            // Shadow
            this.ctx.shadowColor = 'rgba(76, 175, 80, 0.5)';
            this.ctx.shadowBlur = 5;
            this.ctx.fillRect(x, y, size, size);
            this.ctx.shadowBlur = 0;
        }
        
        // Draw head with special styling
        const head = this.snake[0];
        const headX = head.x * this.gridSize + 1;
        const headY = head.y * this.gridSize + 1;
        const headSize = this.gridSize - 2;
        
        const headGradient = this.ctx.createRadialGradient(
            headX + headSize/2, headY + headSize/2, 0,
            headX + headSize/2, headY + headSize/2, headSize/2
        );
        headGradient.addColorStop(0, '#66bb6a');
        headGradient.addColorStop(1, '#4caf50');
        
        this.ctx.fillStyle = headGradient;
        this.ctx.shadowColor = 'rgba(102, 187, 106, 0.8)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(headX, headY, headSize, headSize);
        this.ctx.shadowBlur = 0;
        
        // Draw eyes on head
        const eyeSize = 3;
        const eyeOffset = 5;
        this.ctx.fillStyle = '#fff';
        if (this.dx === 1) { // Right
            this.ctx.fillRect(headX + headSize - eyeOffset, headY + eyeOffset, eyeSize, eyeSize);
            this.ctx.fillRect(headX + headSize - eyeOffset, headY + headSize - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (this.dx === -1) { // Left
            this.ctx.fillRect(headX + eyeOffset, headY + eyeOffset, eyeSize, eyeSize);
            this.ctx.fillRect(headX + eyeOffset, headY + headSize - eyeOffset - eyeSize, eyeSize, eyeSize);
        } else if (this.dy === -1) { // Up
            this.ctx.fillRect(headX + eyeOffset, headY + eyeOffset, eyeSize, eyeSize);
            this.ctx.fillRect(headX + headSize - eyeOffset - eyeSize, headY + eyeOffset, eyeSize, eyeSize);
        } else if (this.dy === 1) { // Down
            this.ctx.fillRect(headX + eyeOffset, headY + headSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            this.ctx.fillRect(headX + headSize - eyeOffset - eyeSize, headY + headSize - eyeOffset - eyeSize, eyeSize, eyeSize);
        }
        
        // Draw food with pulsing animation
        const foodSize = (this.gridSize - 2) * (1 + Math.sin(this.foodPulse) * 0.2);
        const foodX = this.food.x * this.gridSize + (this.gridSize - foodSize) / 2;
        const foodY = this.food.y * this.gridSize + (this.gridSize - foodSize) / 2;
        
        const foodGradient = this.ctx.createRadialGradient(
            foodX + foodSize/2, foodY + foodSize/2, 0,
            foodX + foodSize/2, foodY + foodSize/2, foodSize/2
        );
        foodGradient.addColorStop(0, '#ff6b6b');
        foodGradient.addColorStop(1, '#ee5a6f');
        
        this.ctx.fillStyle = foodGradient;
        this.ctx.shadowColor = 'rgba(255, 107, 107, 0.8)';
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(foodX, foodY, foodSize, foodSize);
        this.ctx.shadowBlur = 0;
        
        // Draw particles
        for (let particle of this.particles) {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 20;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        }
        this.ctx.globalAlpha = 1;
        
        // Draw pause overlay
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 36px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.shadowBlur = 0;
        }
    },
    
    gameOver() {
        clearInterval(this.gameLoop);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            document.getElementById('snakeHighScore').textContent = this.highScore;
        }
        
        alert(`Game Over! Score: ${this.score}`);
        this.restart();
    }
};

// ==================== TETRIS GAME ====================
const tetrisGame = {
    canvas: null,
    ctx: null,
    nextCanvas: null,
    nextCtx: null,
    board: [],
    boardWidth: 10,
    boardHeight: 20,
    currentPiece: null,
    nextPiece: null,
    score: 0,
    lines: 0,
    level: 1,
    highScore: 0,
    gameLoop: null,
    paused: false,
    dropCounter: 0,
    dropInterval: 1000,
    
    pieces: [
        [[1,1,1,1]], // I
        [[1,1],[1,1]], // O
        [[0,1,0],[1,1,1]], // T
        [[0,1,1],[1,1,0]], // S
        [[1,1,0],[0,1,1]], // Z
        [[1,0,0],[1,1,1]], // J
        [[0,0,1],[1,1,1]]  // L
    ],
    
    colors: ['#000', '#00f0f0', '#f0f000', '#a000f0', '#00f000', '#f00000', '#0000f0', '#f0a000'],
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount * 255);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount * 255);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount * 255);
        return `rgb(${r}, ${g}, ${b})`;
    },
    
    init() {
        this.canvas = document.getElementById('tetrisCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPieceCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.highScore = parseInt(localStorage.getItem('tetrisHighScore') || '0');
        document.getElementById('tetrisHighScore').textContent = this.highScore;
        
        this.restart();
        this.setupControls();
    },
    
    setupControls() {
        // Remove old handler if it exists
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        this.keyHandler = (e) => {
            // Only process keys if the game is visible
            const gameScreen = document.getElementById('tetrisGame');
            if (!gameScreen || gameScreen.style.display === 'none') {
                return;
            }
            
            if (this.paused && e.key !== 'p' && e.key !== 'P') return;
            
            if (e.key === 'p' || e.key === 'P') {
                this.pause();
                return;
            }
            
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.movePiece(-1, 0);
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.movePiece(1, 0);
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.movePiece(0, 1);
            } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.rotatePiece();
            } else if (e.key === ' ') {
                this.hardDrop();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    },
    
    stop() {
        // Stop the game loop
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        // Remove event listener
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }
        // Reset state
        this.paused = true;
    },
    
    restart() {
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropCounter = 0;
        // Hardcore 2: Much faster drop speed (200ms instead of 1000ms) - EXTREME DIFFICULTY
        this.dropInterval = isHardcore2() ? 200 : 1000;
        this.paused = false;
        this.spawnPiece();
        this.spawnNextPiece();
        
        document.getElementById('tetrisScore').textContent = this.score;
        document.getElementById('tetrisLines').textContent = this.lines;
        document.getElementById('tetrisLevel').textContent = this.level;
        
        if (this.gameLoop) clearInterval(this.gameLoop);
        let lastTime = 0;
        const gameLoop = (time = 0) => {
            const deltaTime = time - lastTime;
            lastTime = time;
            
            this.dropCounter += deltaTime;
            if (this.dropCounter > this.dropInterval) {
                this.movePiece(0, 1);
                this.dropCounter = 0;
            }
            
            this.draw();
            if (!this.paused) {
                this.gameLoop = requestAnimationFrame(gameLoop);
            }
        };
        this.gameLoop = requestAnimationFrame(gameLoop);
    },
    
    pause() {
        this.paused = !this.paused;
        if (!this.paused) {
            this.restart();
        }
    },
    
    spawnPiece() {
        this.currentPiece = {
            matrix: this.pieces[Math.floor(Math.random() * this.pieces.length)],
            x: Math.floor(this.boardWidth / 2) - 1,
            y: 0,
            color: Math.floor(Math.random() * 6) + 1
        };
        
        if (this.collision(this.currentPiece)) {
            this.gameOver();
        }
    },
    
    spawnNextPiece() {
        this.nextPiece = {
            matrix: this.pieces[Math.floor(Math.random() * this.pieces.length)],
            color: Math.floor(Math.random() * 6) + 1
        };
    },
    
    movePiece(dx, dy) {
        if (this.paused) return;
        
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;
        
        if (this.collision(this.currentPiece)) {
            this.currentPiece.x -= dx;
            this.currentPiece.y -= dy;
            
            if (dy > 0) {
                this.placePiece();
            }
        }
    },
    
    rotatePiece() {
        if (this.paused) return;
        
        const rotated = this.currentPiece.matrix[0].map((_, i) =>
            this.currentPiece.matrix.map(row => row[i]).reverse()
        );
        
        const original = this.currentPiece.matrix;
        this.currentPiece.matrix = rotated;
        
        if (this.collision(this.currentPiece)) {
            this.currentPiece.matrix = original;
        }
    },
    
    hardDrop() {
        if (this.paused) return;
        
        while (!this.collision({...this.currentPiece, y: this.currentPiece.y + 1})) {
            this.currentPiece.y++;
        }
        this.placePiece();
    },
    
    collision(piece) {
        for (let y = 0; y < piece.matrix.length; y++) {
            for (let x = 0; x < piece.matrix[y].length; x++) {
                if (piece.matrix[y][x]) {
                    const boardX = piece.x + x;
                    const boardY = piece.y + y;
                    
                    if (boardX < 0 || boardX >= this.boardWidth ||
                        boardY >= this.boardHeight ||
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    
    placePiece() {
        for (let y = 0; y < this.currentPiece.matrix.length; y++) {
            for (let x = 0; x < this.currentPiece.matrix[y].length; x++) {
                if (this.currentPiece.matrix[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    if (boardY >= 0) {
                        this.board[boardY][this.currentPiece.x + x] = this.currentPiece.color;
                    }
                }
            }
        }
        
        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.currentPiece.x = Math.floor(this.boardWidth / 2) - 1;
        this.currentPiece.y = 0;
        this.spawnNextPiece();
        
        if (this.collision(this.currentPiece)) {
            this.gameOver();
        }
    },
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.boardHeight - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.boardWidth).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 50);
            
            document.getElementById('tetrisScore').textContent = this.score;
            document.getElementById('tetrisLines').textContent = this.lines;
            document.getElementById('tetrisLevel').textContent = this.level;
        }
    },
    
    draw() {
        const blockSize = this.canvas.width / this.boardWidth;
        
        // Clear canvas with gradient
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#0a0a1a');
        bgGradient.addColorStop(1, '#1a1a2e');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.boardWidth; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * blockSize, 0);
            this.ctx.lineTo(i * blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.boardHeight; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * blockSize);
            this.ctx.lineTo(this.canvas.width, i * blockSize);
            this.ctx.stroke();
        }
        
        // Draw board with 3D effect
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x]) {
                    const drawX = x * blockSize;
                    const drawY = y * blockSize;
                    const size = blockSize - 1;
                    
                    // Block gradient
                    const gradient = this.ctx.createLinearGradient(drawX, drawY, drawX + size, drawY + size);
                    const color = this.colors[this.board[y][x]];
                    gradient.addColorStop(0, color);
                    gradient.addColorStop(1, this.darkenColor(color, 0.3));
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.shadowColor = color;
                    this.ctx.shadowBlur = 5;
                    this.ctx.fillRect(drawX, drawY, size, size);
                    
                    // Highlight
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.fillRect(drawX, drawY, size, 3);
                    this.ctx.shadowBlur = 0;
                }
            }
        }
        
        // Draw current piece with shadow
        if (this.currentPiece) {
            const color = this.colors[this.currentPiece.color];
            for (let y = 0; y < this.currentPiece.matrix.length; y++) {
                for (let x = 0; x < this.currentPiece.matrix[y].length; x++) {
                    if (this.currentPiece.matrix[y][x]) {
                        const drawX = (this.currentPiece.x + x) * blockSize;
                        const drawY = (this.currentPiece.y + y) * blockSize;
                        if (drawY >= 0) {
                            const size = blockSize - 1;
                            
                            // Shadow
                            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                            this.ctx.fillRect(drawX + 2, drawY + 2, size, size);
                            
                            // Block gradient
                            const gradient = this.ctx.createLinearGradient(drawX, drawY, drawX + size, drawY + size);
                            gradient.addColorStop(0, color);
                            gradient.addColorStop(1, this.darkenColor(color, 0.3));
                            
                            this.ctx.fillStyle = gradient;
                            this.ctx.shadowColor = color;
                            this.ctx.shadowBlur = 8;
                            this.ctx.fillRect(drawX, drawY, size, size);
                            
                            // Highlight
                            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                            this.ctx.fillRect(drawX, drawY, size, 3);
                            this.ctx.shadowBlur = 0;
                        }
                    }
                }
            }
        }
        
        // Draw next piece
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const nextBlockSize = 20;
            this.nextCtx.fillStyle = this.colors[this.nextPiece.color];
            for (let y = 0; y < this.nextPiece.matrix.length; y++) {
                for (let x = 0; x < this.nextPiece.matrix[y].length; x++) {
                    if (this.nextPiece.matrix[y][x]) {
                        this.nextCtx.fillRect(
                            x * nextBlockSize + 20,
                            y * nextBlockSize + 20,
                            nextBlockSize - 2,
                            nextBlockSize - 2
                        );
                    }
                }
            }
        }
        
        // Draw pause overlay
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    },
    
    gameOver() {
        cancelAnimationFrame(this.gameLoop);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('tetrisHighScore', this.highScore);
            document.getElementById('tetrisHighScore').textContent = this.highScore;
        }
        
        alert(`Game Over! Score: ${this.score} | Lines: ${this.lines} | Level: ${this.level}`);
        this.restart();
    }
};

// ==================== PONG GAME ====================
const pongGame = {
    canvas: null,
    ctx: null,
    ball: {x: 400, y: 250, vx: 5, vy: 5, radius: 10},
    player: {x: 50, y: 200, width: 10, height: 100, speed: 7},
    ai: {x: 740, y: 200, width: 10, height: 100, speed: 5},
    playerScore: 0,
    aiScore: 0,
    gameLoop: null,
    paused: false,
    
    init() {
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.restart();
        this.setupControls();
    },
    
    setupControls() {
        const keys = {};
        
        // Remove old handlers if they exist
        if (this.keyDownHandler) {
            document.removeEventListener('keydown', this.keyDownHandler);
        }
        if (this.keyUpHandler) {
            document.removeEventListener('keyup', this.keyUpHandler);
        }
        
        this.keyDownHandler = (e) => {
            // Only process keys if the game is visible
            const gameScreen = document.getElementById('pongGame');
            if (!gameScreen || gameScreen.style.display === 'none') {
                return;
            }
            
            if (e.key === 'p' || e.key === 'P') {
                this.pause();
                return;
            }
            keys[e.key.toLowerCase()] = true;
        };
        
        this.keyUpHandler = (e) => {
            // Only process keys if the game is visible
            const gameScreen = document.getElementById('pongGame');
            if (!gameScreen || gameScreen.style.display === 'none') {
                return;
            }
            
            keys[e.key.toLowerCase()] = false;
        };
        
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        
        // Store keys reference for updatePlayer
        this.keys = keys;
        
        // Stop old updatePlayer loop if it exists
        if (this.updatePlayerLoop) {
            cancelAnimationFrame(this.updatePlayerLoop);
        }
        
        const updatePlayer = () => {
            // Only update if game is visible
            const gameScreen = document.getElementById('pongGame');
            if (!gameScreen || gameScreen.style.display === 'none') {
                return;
            }
            
            if (!this.paused) {
                if ((keys['arrowup'] || keys['w']) && this.player.y > 0) {
                    this.player.y -= this.player.speed;
                }
                if ((keys['arrowdown'] || keys['s']) && this.player.y + this.player.height < this.canvas.height) {
                    this.player.y += this.player.speed;
                }
            }
            this.updatePlayerLoop = requestAnimationFrame(updatePlayer);
        };
        this.updatePlayerLoop = requestAnimationFrame(updatePlayer);
    },
    
    stop() {
        // Stop the game loop
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        // Stop the updatePlayer loop
        if (this.updatePlayerLoop) {
            cancelAnimationFrame(this.updatePlayerLoop);
            this.updatePlayerLoop = null;
        }
        // Remove event listeners
        if (this.keyDownHandler) {
            document.removeEventListener('keydown', this.keyDownHandler);
            this.keyDownHandler = null;
        }
        if (this.keyUpHandler) {
            document.removeEventListener('keyup', this.keyUpHandler);
            this.keyUpHandler = null;
        }
        // Reset state
        this.paused = true;
    },
    
    restart() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        // Hardcore 2: Much faster ball speed (3x) and smaller paddles (third size) - EXTREME DIFFICULTY
        const ballSpeed = isHardcore2() ? 15 : 5;
        this.ball.vx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
        this.ball.vy = (Math.random() - 0.5) * ballSpeed;
        if (isHardcore2()) {
            this.player.height = 30;
            this.ai.height = 30;
        } else {
            this.player.height = 80;
            this.ai.height = 80;
        }
        this.player.y = (this.canvas.height - this.player.height) / 2;
        this.ai.y = (this.canvas.height - this.ai.height) / 2;
        this.paused = false;
        
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.gameLoop = requestAnimationFrame(() => this.update());
    },
    
    pause() {
        this.paused = !this.paused;
        if (!this.paused) {
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    },
    
    update() {
        // Only update if game is visible
        const gameScreen = document.getElementById('pongGame');
        if (!gameScreen || gameScreen.style.display === 'none') {
            return;
        }
        
        if (!this.paused) {
            // Move ball
            this.ball.x += this.ball.vx;
            this.ball.y += this.ball.vy;
            
            // Ball collision with top/bottom
            if (this.ball.y <= this.ball.radius || this.ball.y >= this.canvas.height - this.ball.radius) {
                this.ball.vy = -this.ball.vy;
            }
            
            // Ball collision with player paddle
            if (this.ball.x - this.ball.radius <= this.player.x + this.player.width &&
                this.ball.x - this.ball.radius >= this.player.x &&
                this.ball.y >= this.player.y &&
                this.ball.y <= this.player.y + this.player.height) {
                this.ball.vx = Math.abs(this.ball.vx);
                this.ball.vy = ((this.ball.y - (this.player.y + this.player.height / 2)) / (this.player.height / 2)) * 5;
            }
            
            // Ball collision with AI paddle
            if (this.ball.x + this.ball.radius >= this.ai.x &&
                this.ball.x + this.ball.radius <= this.ai.x + this.ai.width &&
                this.ball.y >= this.ai.y &&
                this.ball.y <= this.ai.y + this.ai.height) {
                this.ball.vx = -Math.abs(this.ball.vx);
                this.ball.vy = ((this.ball.y - (this.ai.y + this.ai.height / 2)) / (this.ai.height / 2)) * 5;
            }
            
            // AI movement
            const aiCenter = this.ai.y + this.ai.height / 2;
            if (aiCenter < this.ball.y - 10) {
                this.ai.y += this.ai.speed;
            } else if (aiCenter > this.ball.y + 10) {
                this.ai.y -= this.ai.speed;
            }
            this.ai.y = Math.max(0, Math.min(this.canvas.height - this.ai.height, this.ai.y));
            
            // Score
            if (this.ball.x < 0) {
                this.aiScore++;
                document.getElementById('pongAIScore').textContent = this.aiScore;
                this.restart();
                return;
            } else if (this.ball.x > this.canvas.width) {
                this.playerScore++;
                document.getElementById('pongPlayerScore').textContent = this.playerScore;
                this.restart();
                return;
            }
        }
        
        this.draw();
        if (!this.paused) {
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    },
    
    draw() {
        // Gradient background
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#0a0a1a');
        bgGradient.addColorStop(1, '#1a1a2e');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line with glow
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        this.ctx.shadowBlur = 5;
        this.ctx.setLineDash([15, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.shadowBlur = 0;
        
        // Draw paddles with gradient
        const playerGradient = this.ctx.createLinearGradient(this.player.x, this.player.y, this.player.x, this.player.y + this.player.height);
        playerGradient.addColorStop(0, '#4a9eff');
        playerGradient.addColorStop(1, '#2563eb');
        this.ctx.fillStyle = playerGradient;
        this.ctx.shadowColor = 'rgba(74, 158, 255, 0.6)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.shadowBlur = 0;
        
        const aiGradient = this.ctx.createLinearGradient(this.ai.x, this.ai.y, this.ai.x, this.ai.y + this.ai.height);
        aiGradient.addColorStop(0, '#ff6b6b');
        aiGradient.addColorStop(1, '#ee5a6f');
        this.ctx.fillStyle = aiGradient;
        this.ctx.shadowColor = 'rgba(255, 107, 107, 0.6)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.ai.x, this.ai.y, this.ai.width, this.ai.height);
        this.ctx.shadowBlur = 0;
        
        // Draw ball with gradient and trail
        const ballGradient = this.ctx.createRadialGradient(
            this.ball.x - 3, this.ball.y - 3, 0,
            this.ball.x, this.ball.y, this.ball.radius
        );
        ballGradient.addColorStop(0, '#fff');
        ballGradient.addColorStop(1, '#aaa');
        this.ctx.fillStyle = ballGradient;
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Draw pause overlay
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 36px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.shadowBlur = 0;
        }
    }
};

// ==================== MEMORY GAME ====================
const memoryGame = {
    board: null,
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    difficulty: 4, // 4x4 grid
    
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'],
    
    init() {
        this.board = document.getElementById('memoryBoard');
        this.restart();
    },
    
    restart() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.board.innerHTML = '';
        
        const totalPairs = (this.difficulty * this.difficulty) / 2;
        const selectedEmojis = this.emojis.slice(0, totalPairs);
        const cardValues = [...selectedEmojis, ...selectedEmojis];
        
        // Shuffle
        for (let i = cardValues.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardValues[i], cardValues[j]] = [cardValues[j], cardValues[i]];
        }
        
        this.board.style.gridTemplateColumns = `repeat(${this.difficulty}, 1fr)`;
        
        cardValues.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.emoji = emoji;
            
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            cardBack.textContent = '?';
            card.appendChild(cardBack);
            
            card.addEventListener('click', () => this.flipCard(card));
            this.board.appendChild(card);
            this.cards.push(card);
        });
        
        document.getElementById('memoryMoves').textContent = this.moves;
        document.getElementById('memoryPairs').textContent = this.matchedPairs;
    },
    
    flipCard(card) {
        if (card.classList.contains('flipped') || card.classList.contains('matched') || this.flippedCards.length >= 2) {
            return;
        }
        
        card.classList.add('flipped');
        card.textContent = card.dataset.emoji;
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            document.getElementById('memoryMoves').textContent = this.moves;
            
            setTimeout(() => {
                if (this.flippedCards[0].dataset.emoji === this.flippedCards[1].dataset.emoji) {
                    this.flippedCards[0].classList.add('matched');
                    this.flippedCards[1].classList.add('matched');
                    this.matchedPairs++;
                    document.getElementById('memoryPairs').textContent = this.matchedPairs;
                    
                    if (this.matchedPairs === (this.difficulty * this.difficulty) / 2) {
                        setTimeout(() => {
                            alert(`Congratulations! You completed the game in ${this.moves} moves!`);
                            this.restart();
                        }, 500);
                    }
                } else {
                    this.flippedCards[0].classList.remove('flipped');
                    this.flippedCards[1].classList.remove('flipped');
                    this.flippedCards[0].innerHTML = '<div class="card-back">?</div>';
                    this.flippedCards[1].innerHTML = '<div class="card-back">?</div>';
                }
                this.flippedCards = [];
            }, 1000);
        }
    },
    
    changeDifficulty() {
        const difficulties = [4, 6, 8];
        const currentIndex = difficulties.indexOf(this.difficulty);
        this.difficulty = difficulties[(currentIndex + 1) % difficulties.length];
        this.restart();
    }
};

// ==================== REACTION TEST ====================
const reactionGame = {
    box: null,
    text: null,
    times: [],
    average: 0,
    best: 0,
    state: 'waiting', // waiting, ready, too-early
    timeout: null,
    startTime: 0,
    
    init() {
        this.box = document.getElementById('reactionBox');
        this.text = document.getElementById('reactionText');
        this.best = parseInt(localStorage.getItem('reactionBest') || '0');
        document.getElementById('reactionBest').textContent = this.best || '0';
        this.updateStats();
        
        this.box.addEventListener('click', () => this.handleClick());
    },
    
    start() {
        this.box.className = 'reaction-box waiting';
        this.text.textContent = 'Wait for green...';
        this.state = 'waiting';
        
        const waitTime = Math.random() * 3000 + 2000; // 2-5 seconds
        
        this.timeout = setTimeout(() => {
            if (this.state === 'waiting') {
                this.box.className = 'reaction-box ready';
                this.text.textContent = 'CLICK NOW!';
                this.state = 'ready';
                this.startTime = Date.now();
            }
        }, waitTime);
    },
    
    handleClick() {
        if (this.state === 'waiting') {
            clearTimeout(this.timeout);
            this.box.className = 'reaction-box too-early';
            this.text.textContent = 'Too early! Wait for green.';
            this.state = 'too-early';
            setTimeout(() => this.start(), 2000);
        } else if (this.state === 'ready') {
            const reactionTime = Date.now() - this.startTime;
            this.times.push(reactionTime);
            
            if (reactionTime < this.best || this.best === 0) {
                this.best = reactionTime;
                localStorage.setItem('reactionBest', this.best);
                document.getElementById('reactionBest').textContent = this.best;
            }
            
            this.updateStats();
            this.text.textContent = `Reaction time: ${reactionTime}ms`;
            this.box.className = 'reaction-box';
            
            setTimeout(() => this.start(), 2000);
        } else if (this.state === 'too-early') {
            // Do nothing, wait for timeout
        }
    },
    
    updateStats() {
        if (this.times.length > 0) {
            this.average = Math.round(this.times.reduce((a, b) => a + b, 0) / this.times.length);
            document.getElementById('reactionAverage').textContent = this.average;
        }
        document.getElementById('reactionTests').textContent = this.times.length;
    },
    
    reset() {
        this.times = [];
        this.average = 0;
        this.updateStats();
        this.box.className = 'reaction-box';
        this.text.textContent = 'Click when the box turns green!';
        this.state = 'waiting';
        if (this.timeout) clearTimeout(this.timeout);
    }
};

// ==================== BREAKOUT GAME ====================
const breakoutGame = {
    canvas: null,
    ctx: null,
    paddle: {x: 350, y: 550, width: 100, height: 15, speed: 8},
    ball: {x: 400, y: 300, radius: 10, vx: 5, vy: -5},
    bricks: [],
    score: 0,
    lives: 3,
    highScore: 0,
    gameLoop: null,
    paused: false,
    brickRows: 5,
    brickCols: 10,
    particles: [],
    trail: [],
    
    init() {
        this.canvas = document.getElementById('breakoutCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.highScore = parseInt(localStorage.getItem('breakoutHighScore') || '0');
        document.getElementById('breakoutHighScore').textContent = this.highScore;
        this.restart();
        this.setupControls();
    },
    
    setupControls() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        const keys = {};
        this.keyHandler = (e) => {
            const gameScreen = document.getElementById('breakoutGame');
            if (!gameScreen || gameScreen.style.display === 'none') return;
            
            if (e.key === 'p' || e.key === 'P') {
                this.pause();
                return;
            }
            
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                keys.left = true;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                keys.right = true;
            }
        };
        
        this.keyUpHandler = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                keys.left = false;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                keys.right = false;
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        
        const updatePaddle = () => {
            const gameScreen = document.getElementById('breakoutGame');
            if (!gameScreen || gameScreen.style.display === 'none') return;
            
            if (!this.paused) {
                if (keys.left && this.paddle.x > 0) {
                    this.paddle.x -= this.paddle.speed;
                }
                if (keys.right && this.paddle.x < this.canvas.width - this.paddle.width) {
                    this.paddle.x += this.paddle.speed;
                }
            }
            requestAnimationFrame(updatePaddle);
        };
        updatePaddle();
    },
    
    restart() {
        this.score = 0;
        this.lives = 3;
        this.paused = false;
        this.particles = [];
        this.trail = [];
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.vx = (Math.random() > 0.5 ? 1 : -1) * 5;
        this.ball.vy = -5;
        this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
        
        this.createBricks();
        document.getElementById('breakoutScore').textContent = this.score;
        document.getElementById('breakoutLives').textContent = this.lives;
        
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.gameLoop = requestAnimationFrame(() => this.update());
    },
    
    createBricks() {
        this.bricks = [];
        const brickWidth = 75;
        const brickHeight = 20;
        const padding = 5;
        const offsetTop = 50;
        const offsetLeft = (this.canvas.width - (this.brickCols * (brickWidth + padding) - padding)) / 2;
        
        for (let row = 0; row < this.brickRows; row++) {
            for (let col = 0; col < this.brickCols; col++) {
                this.bricks.push({
                    x: offsetLeft + col * (brickWidth + padding),
                    y: offsetTop + row * (brickHeight + padding),
                    width: brickWidth,
                    height: brickHeight,
                    visible: true
                });
            }
        }
    },
    
    pause() {
        this.paused = !this.paused;
        if (!this.paused) {
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    },
    
    stop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            document.removeEventListener('keyup', this.keyUpHandler);
            this.keyHandler = null;
            this.keyUpHandler = null;
        }
        this.paused = true;
    },
    
    update() {
        const gameScreen = document.getElementById('breakoutGame');
        if (!gameScreen || gameScreen.style.display === 'none') return;
        
        if (!this.paused) {
            this.ball.x += this.ball.vx;
            this.ball.y += this.ball.vy;
            
            // Wall collision
            if (this.ball.x <= this.ball.radius || this.ball.x >= this.canvas.width - this.ball.radius) {
                this.ball.vx = -this.ball.vx;
            }
            if (this.ball.y <= this.ball.radius) {
                this.ball.vy = -this.ball.vy;
            }
            
            // Paddle collision
            if (this.ball.y + this.ball.radius >= this.paddle.y &&
                this.ball.x >= this.paddle.x &&
                this.ball.x <= this.paddle.x + this.paddle.width) {
                this.ball.vy = -Math.abs(this.ball.vy);
                this.ball.vx = ((this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2)) * 5;
            }
            
            // Brick collision
            for (let brick of this.bricks) {
                if (brick.visible &&
                    this.ball.x + this.ball.radius >= brick.x &&
                    this.ball.x - this.ball.radius <= brick.x + brick.width &&
                    this.ball.y + this.ball.radius >= brick.y &&
                    this.ball.y - this.ball.radius <= brick.y + brick.height) {
                    brick.visible = false;
                    this.ball.vy = -this.ball.vy;
                    this.score += 10;
                    document.getElementById('breakoutScore').textContent = this.score;
                    
                    // Create particles
                    const brickCenterX = brick.x + brick.width / 2;
                    const brickCenterY = brick.y + brick.height / 2;
                    for (let i = 0; i < 12; i++) {
                        this.particles.push({
                            x: brickCenterX,
                            y: brickCenterY,
                            vx: (Math.random() - 0.5) * 6,
                            vy: (Math.random() - 0.5) * 6,
                            life: 30,
                            size: Math.random() * 4 + 2,
                            color: `hsl(${(brick.y / this.canvas.height) * 360}, 70%, 50%)`
                        });
                    }
                    
                    if (this.bricks.every(b => !b.visible)) {
                        this.createBricks();
                        this.ball.x = this.canvas.width / 2;
                        this.ball.y = this.canvas.height / 2;
                    }
                }
            }
            
            // Update trail
            this.trail.push({x: this.ball.x, y: this.ball.y});
            if (this.trail.length > 8) this.trail.shift();
            
            // Update particles
            this.particles = this.particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // gravity
                p.life--;
                return p.life > 0;
            });
            
            // Ball out of bounds
            if (this.ball.y > this.canvas.height) {
                this.lives--;
                document.getElementById('breakoutLives').textContent = this.lives;
                if (this.lives <= 0) {
                    this.gameOver();
                    return;
                }
                this.ball.x = this.canvas.width / 2;
                this.ball.y = this.canvas.height / 2;
                this.ball.vx = (Math.random() > 0.5 ? 1 : -1) * 5;
                this.ball.vy = -5;
            }
        }
        
        this.draw();
        if (!this.paused) {
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    },
    
    draw() {
        // Gradient background
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#0a0a1a');
        bgGradient.addColorStop(1, '#1a1a2e');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw bricks with 3D effect
        this.bricks.forEach(brick => {
            if (brick.visible) {
                const hue = (brick.y / this.canvas.height) * 360;
                const gradient = this.ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
                gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
                gradient.addColorStop(1, `hsl(${hue}, 70%, 40%)`);
                
                this.ctx.fillStyle = gradient;
                this.ctx.shadowColor = `hsla(${hue}, 70%, 50%, 0.5)`;
                this.ctx.shadowBlur = 5;
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                
                // Highlight
                this.ctx.fillStyle = `hsla(${hue}, 70%, 80%, 0.3)`;
                this.ctx.fillRect(brick.x, brick.y, brick.width, 3);
                this.ctx.shadowBlur = 0;
            }
        });
        
        // Draw paddle with gradient
        const paddleGradient = this.ctx.createLinearGradient(this.paddle.x, this.paddle.y, this.paddle.x, this.paddle.y + this.paddle.height);
        paddleGradient.addColorStop(0, '#fff');
        paddleGradient.addColorStop(1, '#ccc');
        this.ctx.fillStyle = paddleGradient;
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.shadowBlur = 0;
        
        // Draw ball trail
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const alpha = i / this.trail.length * 0.5;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, this.ball.radius * alpha, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
        
        // Draw ball with gradient
        const ballGradient = this.ctx.createRadialGradient(
            this.ball.x - 3, this.ball.y - 3, 0,
            this.ball.x, this.ball.y, this.ball.radius
        );
        ballGradient.addColorStop(0, '#fff');
        ballGradient.addColorStop(1, '#aaa');
        this.ctx.fillStyle = ballGradient;
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Draw particles
        for (let particle of this.particles) {
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
        
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 36px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.shadowBlur = 0;
        }
    },
    
    gameOver() {
        cancelAnimationFrame(this.gameLoop);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('breakoutHighScore', this.highScore);
            document.getElementById('breakoutHighScore').textContent = this.highScore;
        }
        alert(`Game Over! Score: ${this.score}`);
        this.restart();
    }
};

// ==================== 2048 GAME ====================
const game2048 = {
    board: [],
    score: 0,
    best: 0,
    size: 4,
    
    init() {
        this.best = parseInt(localStorage.getItem('game2048Best') || '0');
        document.getElementById('game2048Best').textContent = this.best;
        this.restart();
        this.setupControls();
    },
    
    setupControls() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        this.keyHandler = (e) => {
            const gameScreen = document.getElementById('game2048Game');
            if (!gameScreen || gameScreen.style.display === 'none') return;
            
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                this.move(e.key.replace('Arrow', '').toLowerCase());
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
    },
    
    restart() {
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    },
    
    addRandomTile() {
        const empty = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    empty.push({row: i, col: j});
                }
            }
        }
        if (empty.length > 0) {
            const {row, col} = empty[Math.floor(Math.random() * empty.length)];
            this.board[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    },
    
    move(direction) {
        const prevBoard = this.board.map(row => [...row]);
        
        if (direction === 'up') {
            for (let col = 0; col < this.size; col++) {
                let column = [];
                for (let row = 0; row < this.size; row++) {
                    if (this.board[row][col] !== 0) column.push(this.board[row][col]);
                }
                column = this.merge(column);
                while (column.length < this.size) column.push(0);
                for (let row = 0; row < this.size; row++) {
                    this.board[row][col] = column[row];
                }
            }
        } else if (direction === 'down') {
            for (let col = 0; col < this.size; col++) {
                let column = [];
                for (let row = this.size - 1; row >= 0; row--) {
                    if (this.board[row][col] !== 0) column.push(this.board[row][col]);
                }
                column = this.merge(column);
                while (column.length < this.size) column.push(0);
                for (let row = this.size - 1; row >= 0; row--) {
                    this.board[row][col] = column[this.size - 1 - row];
                }
            }
        } else if (direction === 'left') {
            for (let row = 0; row < this.size; row++) {
                let line = this.board[row].filter(val => val !== 0);
                line = this.merge(line);
                while (line.length < this.size) line.push(0);
                this.board[row] = line;
            }
        } else if (direction === 'right') {
            for (let row = 0; row < this.size; row++) {
                let line = this.board[row].filter(val => val !== 0).reverse();
                line = this.merge(line);
                while (line.length < this.size) line.push(0);
                this.board[row] = line.reverse();
            }
        }
        
        if (JSON.stringify(prevBoard) !== JSON.stringify(this.board)) {
            this.addRandomTile();
            this.updateDisplay();
            
            if (this.isGameOver()) {
                setTimeout(() => {
                    alert(`Game Over! Final Score: ${this.score}`);
                    this.restart();
                }, 100);
            }
        }
    },
    
    merge(line) {
        for (let i = 0; i < line.length - 1; i++) {
            if (line[i] === line[i + 1]) {
                line[i] *= 2;
                this.score += line[i];
                line[i + 1] = 0;
            }
        }
        return line.filter(val => val !== 0);
    },
    
    isGameOver() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) return false;
                if (j < this.size - 1 && this.board[i][j] === this.board[i][j + 1]) return false;
                if (i < this.size - 1 && this.board[i][j] === this.board[i + 1][j]) return false;
            }
        }
        return true;
    },
    
    updateDisplay() {
        const board = document.getElementById('game2048Board');
        board.innerHTML = '';
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'game2048-cell';
                const value = this.board[i][j];
                if (value !== 0) {
                    cell.textContent = value;
                    cell.dataset.value = value;
                    cell.classList.add('has-value');
                }
                board.appendChild(cell);
            }
        }
        
        document.getElementById('game2048Score').textContent = this.score;
        if (this.score > this.best) {
            this.best = this.score;
            localStorage.setItem('game2048Best', this.best);
            document.getElementById('game2048Best').textContent = this.best;
        }
    }
};

// ==================== FLAPPY BIRD GAME ====================
const flappyGame = {
    canvas: null,
    ctx: null,
    bird: {x: 50, y: 250, radius: 15, vy: 0, gravity: 0.5, rotation: 0},
    pipes: [],
    score: 0,
    best: 0,
    gameLoop: null,
    gameOver: false,
    frameCount: 0,
    clouds: [],
    particles: [],
    
    init() {
        this.canvas = document.getElementById('flappyCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.best = parseInt(localStorage.getItem('flappyBest') || '0');
        document.getElementById('flappyBest').textContent = this.best;
        this.restart();
        this.setupControls();
    },
    
    setupControls() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.canvas.removeEventListener('click', this.clickHandler);
        }
        
        this.keyHandler = (e) => {
            const gameScreen = document.getElementById('flappyGame');
            if (!gameScreen || gameScreen.style.display === 'none') return;
            
            if (e.key === ' ') {
                e.preventDefault();
                this.flap();
            }
        };
        
        this.clickHandler = () => {
            const gameScreen = document.getElementById('flappyGame');
            if (gameScreen && gameScreen.style.display !== 'none') {
                this.flap();
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
        this.canvas.addEventListener('click', this.clickHandler);
    },
    
    restart() {
        this.bird.y = this.canvas.height / 2;
        this.bird.vy = 0;
        this.bird.rotation = 0;
        this.pipes = [];
        this.score = 0;
        this.gameOver = false;
        this.frameCount = 0;
        this.particles = [];
        this.clouds = [];
        // Create initial clouds
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * 200,
                size: Math.random() * 30 + 20,
                speed: Math.random() * 0.5 + 0.2
            });
        }
        document.getElementById('flappyScore').textContent = this.score;
        
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.gameLoop = requestAnimationFrame(() => this.update());
    },
    
    stop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.canvas.removeEventListener('click', this.clickHandler);
            this.keyHandler = null;
            this.clickHandler = null;
        }
    },
    
    flap() {
        if (this.gameOver) {
            this.restart();
        } else {
            this.bird.vy = -8;
            this.bird.rotation = -0.5;
            // Create flap particles
            for (let i = 0; i < 5; i++) {
                this.particles.push({
                    x: this.bird.x,
                    y: this.bird.y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: Math.random() * 2 + 1,
                    life: 15,
                    size: Math.random() * 3 + 2
                });
            }
        }
    },
    
    update() {
        const gameScreen = document.getElementById('flappyGame');
        if (!gameScreen || gameScreen.style.display === 'none') return;
        
        if (!this.gameOver) {
            this.frameCount++;
            
            // Update bird
            this.bird.vy += this.bird.gravity;
            this.bird.y += this.bird.vy;
            // Rotate bird based on velocity
            this.bird.rotation = Math.min(Math.max(this.bird.vy * 0.05, -0.5), 0.5);
            
            // Update clouds
            for (let cloud of this.clouds) {
                cloud.x -= cloud.speed;
                if (cloud.x < -cloud.size * 2) {
                    cloud.x = this.canvas.width + cloud.size;
                    cloud.y = Math.random() * 200;
                }
            }
            
            // Update particles
            this.particles = this.particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                return p.life > 0;
            });
            
            // Generate pipes
            // Hardcore 2: Faster pipe generation (every 40 frames instead of 100) and smaller gaps - EXTREME DIFFICULTY
            const pipeInterval = isHardcore2() ? 40 : 100;
            const gap = isHardcore2() ? 80 : 150;
            if (this.frameCount % pipeInterval === 0) {
                const pipeHeight = Math.random() * (this.canvas.height - gap - 100) + 50;
                this.pipes.push({
                    x: this.canvas.width,
                    topHeight: pipeHeight,
                    bottomY: pipeHeight + gap,
                    bottomHeight: this.canvas.height - (pipeHeight + gap),
                    passed: false
                });
            }
            
            // Update pipes - Hardcore 2: Much faster pipe movement (3x speed) - EXTREME DIFFICULTY
            const pipeSpeed = isHardcore2() ? 9 : 3;
            for (let pipe of this.pipes) {
                pipe.x -= pipeSpeed;
                
                // Check collision
                if (this.bird.x + this.bird.radius > pipe.x &&
                    this.bird.x - this.bird.radius < pipe.x + 50) {
                    if (this.bird.y - this.bird.radius < pipe.topHeight ||
                        this.bird.y + this.bird.radius > pipe.bottomY) {
                        this.gameOver = true;
                    }
                }
                
                // Score
                if (!pipe.passed && this.bird.x > pipe.x + 50) {
                    pipe.passed = true;
                    this.score++;
                    document.getElementById('flappyScore').textContent = this.score;
                }
            }
            
            // Remove off-screen pipes
            this.pipes = this.pipes.filter(pipe => pipe.x > -50);
            
            // Check boundaries
            if (this.bird.y - this.bird.radius < 0 || this.bird.y + this.bird.radius > this.canvas.height) {
                this.gameOver = true;
            }
        }
        
        this.draw();
        this.gameLoop = requestAnimationFrame(() => this.update());
    },
    
    draw() {
        // Sky gradient
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        skyGradient.addColorStop(0, '#87ceeb');
        skyGradient.addColorStop(0.7, '#98d8f0');
        skyGradient.addColorStop(1, '#b8e6f5');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let cloud of this.clouds) {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 0.6, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
            this.ctx.arc(cloud.x - cloud.size * 0.6, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Pipes with gradient and cap
        for (let pipe of this.pipes) {
            // Top pipe
            const topGradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + 50, 0);
            topGradient.addColorStop(0, '#2e7d32');
            topGradient.addColorStop(1, '#4caf50');
            this.ctx.fillStyle = topGradient;
            this.ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
            // Top cap
            this.ctx.fillStyle = '#1b5e20';
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, 60, 20);
            
            // Bottom pipe
            const bottomGradient = this.ctx.createLinearGradient(pipe.x, pipe.bottomY, pipe.x + 50, pipe.bottomY);
            bottomGradient.addColorStop(0, '#2e7d32');
            bottomGradient.addColorStop(1, '#4caf50');
            this.ctx.fillStyle = bottomGradient;
            this.ctx.fillRect(pipe.x, pipe.bottomY, 50, pipe.bottomHeight);
            // Bottom cap
            this.ctx.fillStyle = '#1b5e20';
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, 60, 20);
        }
        
        // Ground with gradient
        const groundGradient = this.ctx.createLinearGradient(0, this.canvas.height - 50, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#8b7355');
        groundGradient.addColorStop(1, '#6b5b45');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        // Ground pattern
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < this.canvas.width; i += 20) {
            this.ctx.fillRect(i, this.canvas.height - 50, 10, 50);
        }
        
        // Draw particles
        for (let particle of this.particles) {
            this.ctx.globalAlpha = particle.life / 15;
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
        
        // Bird with rotation and gradient
        this.ctx.save();
        this.ctx.translate(this.bird.x, this.bird.y);
        this.ctx.rotate(this.bird.rotation);
        
        const birdGradient = this.ctx.createRadialGradient(-5, -5, 0, 0, 0, this.bird.radius);
        birdGradient.addColorStop(0, '#ffeb3b');
        birdGradient.addColorStop(1, '#fbc02d');
        this.ctx.fillStyle = birdGradient;
        this.ctx.shadowColor = 'rgba(255, 235, 59, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Bird eye
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(3, -3, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird beak
        this.ctx.fillStyle = '#ff9800';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.radius, 0);
        this.ctx.lineTo(this.bird.radius + 5, -3);
        this.ctx.lineTo(this.bird.radius + 5, 3);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
        
        // Game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 28px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '18px Courier New';
            this.ctx.fillText('Click or press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 35);
            this.ctx.shadowBlur = 0;
            
            if (this.score > this.best) {
                this.best = this.score;
                localStorage.setItem('flappyBest', this.best);
                document.getElementById('flappyBest').textContent = this.best;
            }
        }
    }
};

// ==================== TIC-TAC-TOE GAME ====================
const tictactoeGame = {
    board: [],
    currentPlayer: 'X',
    gameOver: false,
    
    init() {
        this.restart();
    },
    
    restart() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameOver = false;
        document.getElementById('tictactoeStatus').textContent = "X's turn";
        this.updateDisplay();
    },
    
    makeMove(index) {
        if (this.gameOver || this.board[index] !== '') return;
        
        this.board[index] = this.currentPlayer;
        this.updateDisplay();
        
        if (this.checkWinner()) {
            document.getElementById('tictactoeStatus').textContent = `${this.currentPlayer} wins!`;
            this.gameOver = true;
            return;
        }
        
        if (this.board.every(cell => cell !== '')) {
            document.getElementById('tictactoeStatus').textContent = "It's a tie!";
            this.gameOver = true;
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        document.getElementById('tictactoeStatus').textContent = `${this.currentPlayer}'s turn`;
        
        // Simple AI for O
        if (this.currentPlayer === 'O' && !this.gameOver) {
            setTimeout(() => this.aiMove(), 500);
        }
    },
    
    aiMove() {
        // Try to win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinner()) {
                    this.updateDisplay();
                    document.getElementById('tictactoeStatus').textContent = 'O wins!';
                    this.gameOver = true;
                    return;
                }
                this.board[i] = '';
            }
        }
        
        // Try to block
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinner()) {
                    this.board[i] = 'O';
                    this.currentPlayer = 'X';
                    this.updateDisplay();
                    document.getElementById('tictactoeStatus').textContent = "X's turn";
                    return;
                }
                this.board[i] = '';
            }
        }
        
        // Random move
        const available = this.board.map((cell, i) => cell === '' ? i : null).filter(i => i !== null);
        if (available.length > 0) {
            const move = available[Math.floor(Math.random() * available.length)];
            this.board[move] = 'O';
            this.currentPlayer = 'X';
            this.updateDisplay();
            document.getElementById('tictactoeStatus').textContent = "X's turn";
            
            if (this.checkWinner()) {
                document.getElementById('tictactoeStatus').textContent = 'O wins!';
                this.gameOver = true;
            } else if (this.board.every(cell => cell !== '')) {
                document.getElementById('tictactoeStatus').textContent = "It's a tie!";
                this.gameOver = true;
            }
        }
    },
    
    checkWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (let line of lines) {
            const [a, b, c] = line;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return true;
            }
        }
        return false;
    },
    
    updateDisplay() {
        const board = document.getElementById('tictactoeBoard');
        board.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'tictactoe-cell';
            if (this.board[i] !== '') {
                cell.textContent = this.board[i];
                cell.classList.add('occupied', this.board[i].toLowerCase());
            }
            cell.addEventListener('click', () => this.makeMove(i));
            board.appendChild(cell);
        }
    }
};

// ==================== SIMON SAYS GAME ====================
const simonGame = {
    sequence: [],
    playerSequence: [],
    level: 1,
    best: 0,
    isPlaying: false,
    isShowing: false,
    currentIndex: 0,
    
    colors: ['red', 'green', 'blue', 'yellow'],
    
    init() {
        this.best = parseInt(localStorage.getItem('simonBest') || '0');
        document.getElementById('simonBest').textContent = this.best;
        document.getElementById('simonStart').addEventListener('click', () => this.start());
        this.setupButtons();
    },
    
    setupButtons() {
        this.colors.forEach(color => {
            const button = document.getElementById(`simon${color.charAt(0).toUpperCase() + color.slice(1)}`);
            button.addEventListener('click', () => this.playerClick(color));
        });
    },
    
    start() {
        this.sequence = [];
        this.playerSequence = [];
        this.level = 1;
        this.isPlaying = true;
        this.isShowing = false;
        this.addToSequence();
        this.showSequence();
        document.getElementById('simonStart').textContent = '...';
        document.getElementById('simonStart').style.pointerEvents = 'none';
    },
    
    restart() {
        this.sequence = [];
        this.playerSequence = [];
        this.level = 1;
        this.isPlaying = false;
        this.isShowing = false;
        document.getElementById('simonLevel').textContent = this.level;
        document.getElementById('simonStart').textContent = 'START';
        document.getElementById('simonStart').style.pointerEvents = 'auto';
        document.getElementById('simonInstructions').textContent = 'Click START to begin. Watch the sequence and repeat it!';
    },
    
    addToSequence() {
        this.sequence.push(this.colors[Math.floor(Math.random() * this.colors.length)]);
    },
    
    async showSequence() {
        this.isShowing = true;
        document.getElementById('simonInstructions').textContent = 'Watch the sequence...';
        
        for (let i = 0; i < this.sequence.length; i++) {
            await this.flashColor(this.sequence[i], 500);
            await this.wait(200);
        }
        
        this.isShowing = false;
        document.getElementById('simonInstructions').textContent = 'Now repeat the sequence!';
        this.playerSequence = [];
    },
    
    flashColor(color, duration) {
        return new Promise(resolve => {
            const button = document.getElementById(`simon${color.charAt(0).toUpperCase() + color.slice(1)}`);
            button.classList.add('active');
            setTimeout(() => {
                button.classList.remove('active');
                resolve();
            }, duration);
        });
    },
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    playerClick(color) {
        if (!this.isPlaying || this.isShowing) return;
        
        this.flashColor(color, 200);
        this.playerSequence.push(color);
        
        const expectedColor = this.sequence[this.playerSequence.length - 1];
        if (color !== expectedColor) {
            this.gameOver();
            return;
        }
        
        if (this.playerSequence.length === this.sequence.length) {
            this.level++;
            document.getElementById('simonLevel').textContent = this.level;
            if (this.level > this.best) {
                this.best = this.level;
                localStorage.setItem('simonBest', this.best);
                document.getElementById('simonBest').textContent = this.best;
            }
            this.addToSequence();
            setTimeout(() => this.showSequence(), 1000);
        }
    },
    
    gameOver() {
        this.isPlaying = false;
        document.getElementById('simonInstructions').textContent = `Game Over! You reached level ${this.level}. Click START to play again.`;
        document.getElementById('simonStart').textContent = 'START';
        document.getElementById('simonStart').style.pointerEvents = 'auto';
    }
};

// ==================== CALCULATOR CLICKER GAME ====================
const calculatorGame = {
    numbers: 0,
    perClick: 1,
    perSecond: 0,
    upgrades: [],
    autoClickers: [],
    autoClickerInterval: null,
    saveInterval: null,
    
    upgradesList: [
        { name: 'Better Calculator', desc: '+1 per click', cost: 10, multiplier: 1, owned: 0 },
        { name: 'Scientific Calc', desc: '+2 per click', cost: 50, multiplier: 2, owned: 0 },
        { name: 'Graphing Calc', desc: '+5 per click', cost: 200, multiplier: 5, owned: 0 },
        { name: 'Quantum Calc', desc: '+10 per click', cost: 1000, multiplier: 10, owned: 0 },
        { name: 'AI Calculator', desc: '+25 per click', cost: 5000, multiplier: 25, owned: 0 },
        { name: 'Super Computer', desc: '+50 per click', cost: 25000, multiplier: 50, owned: 0 },
        { name: 'Quantum Computer', desc: '+100 per click', cost: 100000, multiplier: 100, owned: 0 },
        { name: 'Universe Simulator', desc: '+500 per click', cost: 1000000, multiplier: 500, owned: 0 }
    ],
    
    autoClickersList: [
        { name: 'Auto-Adder', desc: '+1 per second', cost: 50, production: 1, owned: 0 },
        { name: 'Auto-Multiplier', desc: '+5 per second', cost: 250, production: 5, owned: 0 },
        { name: 'Auto-Divider', desc: '+10 per second', cost: 1000, production: 10, owned: 0 },
        { name: 'Auto-Processor', desc: '+25 per second', cost: 5000, production: 25, owned: 0 },
        { name: 'Auto-Computer', desc: '+50 per second', cost: 25000, production: 50, owned: 0 },
        { name: 'Auto-Server', desc: '+100 per second', cost: 100000, production: 100, owned: 0 },
        { name: 'Auto-Cloud', desc: '+250 per second', cost: 500000, production: 250, owned: 0 },
        { name: 'Auto-Quantum', desc: '+1000 per second', cost: 5000000, production: 1000, owned: 0 }
    ],
    
    init() {
        this.load();
        this.setupClickButton();
        this.renderUpgrades();
        this.renderAutoClickers();
        this.updateDisplay();
        this.startAutoClickers();
        this.startAutoSave();
    },
    
    setupClickButton() {
        const button = document.getElementById('calcClickButton');
        button.onclick = () => this.click();
    },
    
    click() {
        this.numbers += this.perClick;
        this.updateDisplay();
        this.showClickAnimation();
        this.updateUpgrades();
        this.updateAutoClickers();
    },
    
    showClickAnimation() {
        const button = document.getElementById('calcClickButton');
        const rect = button.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        const anim = document.createElement('div');
        anim.className = 'click-animation';
        anim.textContent = `+${this.formatNumber(this.perClick)}`;
        anim.style.left = x + 'px';
        anim.style.top = y + 'px';
        document.body.appendChild(anim);
        
        setTimeout(() => anim.remove(), 1000);
    },
    
    buyUpgrade(index) {
        const upgrade = this.upgradesList[index];
        const cost = this.getUpgradeCost(upgrade);
        
        if (this.numbers >= cost) {
            this.numbers -= cost;
            upgrade.owned++;
            this.perClick += upgrade.multiplier;
            this.updateDisplay();
            this.updateUpgrades();
            this.updateAutoClickers();
        }
    },
    
    getUpgradeCost(upgrade) {
        return Math.floor(upgrade.cost * Math.pow(1.5, upgrade.owned));
    },
    
    buyAutoClicker(index) {
        const clicker = this.autoClickersList[index];
        const cost = this.getAutoClickerCost(clicker);
        
        if (this.numbers >= cost) {
            this.numbers -= cost;
            clicker.owned++;
            this.updatePerSecond();
            this.updateDisplay();
            this.updateUpgrades();
            this.updateAutoClickers();
        }
    },
    
    getAutoClickerCost(clicker) {
        return Math.floor(clicker.cost * Math.pow(1.5, clicker.owned));
    },
    
    updatePerSecond() {
        this.perSecond = this.autoClickersList.reduce((total, clicker) => {
            return total + (clicker.owned * clicker.production);
        }, 0);
    },
    
    startAutoClickers() {
        if (this.autoClickerInterval) clearInterval(this.autoClickerInterval);
        this.autoClickerInterval = setInterval(() => {
            if (this.perSecond > 0) {
                this.numbers += this.perSecond;
                this.updateDisplay();
            }
        }, 1000);
    },
    
    startAutoSave() {
        if (this.saveInterval) clearInterval(this.saveInterval);
        this.saveInterval = setInterval(() => {
            this.save();
        }, 30000); // Auto-save every 30 seconds
    },
    
    renderUpgrades() {
        const grid = document.getElementById('upgradesGrid');
        grid.innerHTML = '';
        
        this.upgradesList.forEach((upgrade, index) => {
            const item = document.createElement('div');
            item.className = 'upgrade-item';
            item.innerHTML = `
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-desc">${upgrade.desc}</div>
                <div class="upgrade-cost">Cost: ${this.formatNumber(this.getUpgradeCost(upgrade))}</div>
                <div class="upgrade-level">Level: ${upgrade.owned}</div>
            `;
            
            item.onclick = () => this.buyUpgrade(index);
            grid.appendChild(item);
        });
    },
    
    renderAutoClickers() {
        const grid = document.getElementById('autoClickersGrid');
        grid.innerHTML = '';
        
        this.autoClickersList.forEach((clicker, index) => {
            const item = document.createElement('div');
            item.className = 'auto-clicker-item';
            item.innerHTML = `
                <div class="upgrade-name">${clicker.name}</div>
                <div class="upgrade-desc">${clicker.desc}</div>
                <div class="upgrade-cost">Cost: ${this.formatNumber(this.getAutoClickerCost(clicker))}</div>
                <div class="upgrade-level">Owned: ${clicker.owned}</div>
            `;
            
            item.onclick = () => this.buyAutoClicker(index);
            grid.appendChild(item);
        });
    },
    
    updateUpgrades() {
        const items = document.querySelectorAll('.upgrade-item');
        items.forEach((item, index) => {
            const upgrade = this.upgradesList[index];
            const cost = this.getUpgradeCost(upgrade);
            const costEl = item.querySelector('.upgrade-cost');
            const levelEl = item.querySelector('.upgrade-level');
            
            costEl.textContent = `Cost: ${this.formatNumber(cost)}`;
            levelEl.textContent = `Level: ${upgrade.owned}`;
            
            if (this.numbers >= cost) {
                item.classList.remove('disabled');
            } else {
                item.classList.add('disabled');
            }
            
            if (upgrade.owned > 0) {
                item.classList.add('owned');
            } else {
                item.classList.remove('owned');
            }
        });
    },
    
    updateAutoClickers() {
        const items = document.querySelectorAll('.auto-clicker-item');
        items.forEach((item, index) => {
            const clicker = this.autoClickersList[index];
            const cost = this.getAutoClickerCost(clicker);
            const costEl = item.querySelector('.upgrade-cost');
            const levelEl = item.querySelector('.upgrade-level');
            
            costEl.textContent = `Cost: ${this.formatNumber(cost)}`;
            levelEl.textContent = `Owned: ${clicker.owned}`;
            
            if (this.numbers >= cost) {
                item.classList.remove('disabled');
            } else {
                item.classList.add('disabled');
            }
        });
    },
    
    updateDisplay() {
        document.getElementById('calcNumbers').textContent = this.formatNumber(this.numbers);
        document.getElementById('calcPerClick').textContent = this.formatNumber(this.perClick);
        document.getElementById('calcPerSecond').textContent = this.formatNumber(this.perSecond);
        document.getElementById('calcScreen').textContent = this.formatNumber(this.numbers);
    },
    
    formatNumber(num) {
        if (num >= 1e15) return (num / 1e15).toFixed(2) + 'Q';
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return Math.floor(num).toLocaleString();
    },
    
    save() {
        const saveData = {
            numbers: this.numbers,
            perClick: this.perClick,
            upgrades: this.upgradesList.map(u => u.owned),
            autoClickers: this.autoClickersList.map(c => c.owned)
        };
        localStorage.setItem('calculatorClickerSave', JSON.stringify(saveData));
    },
    
    load() {
        const saveData = localStorage.getItem('calculatorClickerSave');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                this.numbers = data.numbers || 0;
                
                if (data.upgrades) {
                    data.upgrades.forEach((owned, index) => {
                        if (this.upgradesList[index]) {
                            this.upgradesList[index].owned = owned || 0;
                        }
                    });
                    
                    // Recalculate perClick from all upgrades
                    this.perClick = 1;
                    this.upgradesList.forEach(upgrade => {
                        this.perClick += upgrade.owned * upgrade.multiplier;
                    });
                } else {
                    this.perClick = data.perClick || 1;
                }
                
                if (data.autoClickers) {
                    data.autoClickers.forEach((owned, index) => {
                        if (this.autoClickersList[index]) {
                            this.autoClickersList[index].owned = owned || 0;
                        }
                    });
                }
                
                this.updatePerSecond();
            } catch (e) {
                console.error('Error loading save:', e);
            }
        }
    },
    
    reset() {
        if (confirm('Are you sure you want to reset? This will delete all progress!')) {
            this.numbers = 0;
            this.perClick = 1;
            this.perSecond = 0;
            this.upgradesList.forEach(u => u.owned = 0);
            this.autoClickersList.forEach(c => c.owned = 0);
            localStorage.removeItem('calculatorClickerSave');
            this.updateDisplay();
            this.renderUpgrades();
            this.renderAutoClickers();
            this.updateUpgrades();
            this.updateAutoClickers();
        }
    }
};

// ==================== SPACE INVADERS GAME ====================
const spaceInvadersGame = {
    canvas: null,
    ctx: null,
    player: {x: 400, y: 550, width: 60, height: 30, speed: 5},
    bullets: [],
    enemies: [],
    enemyBullets: [],
    score: 0,
    lives: 3,
    level: 1,
    highScore: 0,
    gameLoop: null,
    paused: false,
    direction: 1,
    enemyMoveDown: false,
    particles: [],
    enemyRows: 5,
    enemyCols: 10,
    
    init() {
        this.canvas = document.getElementById('invadersCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.highScore = parseInt(localStorage.getItem('invadersHighScore') || '0');
        document.getElementById('invadersHighScore').textContent = this.highScore;
        this.restart();
        this.setupControls();
    },
    
    setupControls() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        const keys = {};
        this.keyHandler = (e) => {
            const gameScreen = document.getElementById('spaceinvadersGame');
            if (!gameScreen || gameScreen.style.display === 'none') return;
            
            if (e.key === 'p' || e.key === 'P') {
                this.pause();
                return;
            }
            
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                keys.left = true;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                keys.right = true;
            } else if (e.key === ' ') {
                e.preventDefault();
                this.shoot();
            }
        };
        
        this.keyUpHandler = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                keys.left = false;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                keys.right = false;
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        
        const updatePlayer = () => {
            const gameScreen = document.getElementById('spaceinvadersGame');
            if (!gameScreen || gameScreen.style.display === 'none') return;
            
            if (!this.paused) {
                if (keys.left && this.player.x > 0) {
                    this.player.x -= this.player.speed;
                }
                if (keys.right && this.player.x < this.canvas.width - this.player.width) {
                    this.player.x += this.player.speed;
                }
            }
            requestAnimationFrame(updatePlayer);
        };
        updatePlayer();
    },
    
    stop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            document.removeEventListener('keyup', this.keyUpHandler);
            this.keyHandler = null;
            this.keyUpHandler = null;
        }
        this.paused = true;
    },
    
    restart() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.paused = false;
        this.bullets = [];
        this.enemyBullets = [];
        this.particles = [];
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.direction = 1;
        this.enemyMoveDown = false;
        this.createEnemies();
        
        document.getElementById('invadersScore').textContent = this.score;
        document.getElementById('invadersLives').textContent = this.lives;
        document.getElementById('invadersLevel').textContent = this.level;
        
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.gameLoop = requestAnimationFrame(() => this.update());
    },
    
    pause() {
        this.paused = !this.paused;
        if (!this.paused) {
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    },
    
    createEnemies() {
        this.enemies = [];
        const enemyWidth = 40;
        const enemyHeight = 30;
        const spacing = 60;
        const startX = 100;
        const startY = 50;
        
        // Hardcore 2: More enemy rows and columns - EXTREME DIFFICULTY
        const rows = isHardcore2() ? 8 : this.enemyRows;
        const cols = isHardcore2() ? 14 : this.enemyCols;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.enemies.push({
                    x: startX + col * spacing,
                    y: startY + row * spacing,
                    width: enemyWidth,
                    height: enemyHeight,
                    alive: true,
                    type: row < 2 ? 'fast' : row < 4 ? 'medium' : 'slow'
                });
            }
        }
    },
    
    shoot() {
        if (this.paused || this.bullets.length > 0) return;
        this.bullets.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 8
        });
    },
    
    update() {
        const gameScreen = document.getElementById('spaceinvadersGame');
        if (!gameScreen || gameScreen.style.display === 'none') return;
        
        if (!this.paused) {
            // Move enemies
            let moveDown = false;
            for (let enemy of this.enemies) {
                if (!enemy.alive) continue;
                if (enemy.x <= 0 || enemy.x >= this.canvas.width - enemy.width) {
                    moveDown = true;
                    break;
                }
            }
            
            if (moveDown) {
                this.direction *= -1;
                this.enemyMoveDown = true;
            }
            
            // Hardcore 2: Much faster enemy movement (3x speed) - EXTREME DIFFICULTY
            const baseEnemySpeed = isHardcore2() ? 3 : 1;
            const enemySpeed = baseEnemySpeed + this.level * (isHardcore2() ? 0.6 : 0.2);
            for (let enemy of this.enemies) {
                if (!enemy.alive) continue;
                enemy.x += this.direction * enemySpeed;
                if (this.enemyMoveDown) {
                    enemy.y += 20;
                }
                
                // Check if enemy reached bottom
                if (enemy.y + enemy.height >= this.player.y) {
                    this.gameOver();
                    return;
                }
                
                // Random enemy shooting - Hardcore 2: Much more frequent and faster bullets - EXTREME DIFFICULTY
                const shootChance = isHardcore2() ? 0.005 * this.level : 0.001 * this.level;
                if (Math.random() < shootChance) {
                    this.enemyBullets.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height,
                        width: 4,
                        height: 10,
                        speed: (isHardcore2() ? 9 : 3) + this.level * (isHardcore2() ? 1.5 : 0.5)
                    });
                }
            }
            this.enemyMoveDown = false;
            
            // Update bullets
            this.bullets = this.bullets.filter(bullet => {
                bullet.y -= bullet.speed;
                return bullet.y > 0;
            });
            
            // Update enemy bullets
            this.enemyBullets = this.enemyBullets.filter(bullet => {
                bullet.y += bullet.speed;
                if (bullet.y > this.canvas.height) return false;
                
                // Check collision with player
                if (bullet.x >= this.player.x && bullet.x <= this.player.x + this.player.width &&
                    bullet.y >= this.player.y && bullet.y <= this.player.y + this.player.height) {
                    this.lives--;
                    document.getElementById('invadersLives').textContent = this.lives;
                    if (this.lives <= 0) {
                        this.gameOver();
                    }
                    return false;
                }
                return true;
            });
            
            // Bullet-enemy collision
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];
                    if (!enemy.alive) continue;
                    
                    if (bullet.x >= enemy.x && bullet.x <= enemy.x + enemy.width &&
                        bullet.y >= enemy.y && bullet.y <= enemy.y + enemy.height) {
                        enemy.alive = false;
                        this.bullets.splice(i, 1);
                        
                        // Create particles
                        for (let k = 0; k < 8; k++) {
                            this.particles.push({
                                x: enemy.x + enemy.width / 2,
                                y: enemy.y + enemy.height / 2,
                                vx: (Math.random() - 0.5) * 4,
                                vy: (Math.random() - 0.5) * 4,
                                life: 20,
                                color: `hsl(${Math.random() * 60 + 0}, 100%, 50%)`
                            });
                        }
                        
                        // Score based on enemy type
                        const points = enemy.type === 'fast' ? 30 : enemy.type === 'medium' ? 20 : 10;
                        this.score += points;
                        document.getElementById('invadersScore').textContent = this.score;
                        
                        // Check if all enemies destroyed
                        if (this.enemies.every(e => !e.alive)) {
                            this.level++;
                            this.enemyBullets = [];
                            this.bullets = [];
                            document.getElementById('invadersLevel').textContent = this.level;
                            setTimeout(() => this.createEnemies(), 1000);
                        }
                        break;
                    }
                }
            }
            
            // Update particles
            this.particles = this.particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;
                return p.life > 0;
            });
        }
        
        this.draw();
        if (!this.paused) {
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    },
    
    draw() {
        // Starfield background
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#000428');
        bgGradient.addColorStop(1, '#004e92');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 53 + Date.now() * 0.01) % this.canvas.height;
            this.ctx.fillRect(x, y, 2, 2);
        }
        
        // Draw player ship
        const playerGradient = this.ctx.createLinearGradient(this.player.x, this.player.y, this.player.x, this.player.y + this.player.height);
        playerGradient.addColorStop(0, '#4a9eff');
        playerGradient.addColorStop(1, '#2563eb');
        this.ctx.fillStyle = playerGradient;
        this.ctx.shadowColor = 'rgba(74, 158, 255, 0.8)';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
        this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x + this.player.width / 4, this.player.y + this.player.height * 0.7);
        this.ctx.lineTo(this.player.x + this.player.width * 3/4, this.player.y + this.player.height * 0.7);
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            const hue = enemy.type === 'fast' ? 0 : enemy.type === 'medium' ? 30 : 60;
            const enemyGradient = this.ctx.createRadialGradient(
                enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 0,
                enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2
            );
            enemyGradient.addColorStop(0, `hsl(${hue}, 100%, 60%)`);
            enemyGradient.addColorStop(1, `hsl(${hue}, 100%, 40%)`);
            this.ctx.fillStyle = enemyGradient;
            this.ctx.shadowColor = `hsla(${hue}, 100%, 50%, 0.6)`;
            this.ctx.shadowBlur = 8;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            this.ctx.shadowBlur = 0;
        });
        
        // Draw bullets
        this.ctx.fillStyle = '#ffeb3b';
        this.ctx.shadowColor = 'rgba(255, 235, 59, 0.8)';
        this.ctx.shadowBlur = 5;
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
        });
        this.ctx.shadowBlur = 0;
        
        // Draw enemy bullets
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.shadowColor = 'rgba(255, 107, 107, 0.8)';
        this.ctx.shadowBlur = 5;
        this.enemyBullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
        });
        this.ctx.shadowBlur = 0;
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life / 20;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        });
        this.ctx.globalAlpha = 1;
        
        // Pause overlay
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 36px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    },
    
    gameOver() {
        cancelAnimationFrame(this.gameLoop);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('invadersHighScore', this.highScore);
            document.getElementById('invadersHighScore').textContent = this.highScore;
        }
        alert(`Game Over! Score: ${this.score} | Level: ${this.level}`);
        this.restart();
    }
};

// ==================== WORDLE GAME ====================
const wordleGame = {
    board: null,
    keyboard: null,
    wordList: ['APPLE', 'BEACH', 'CHAIR', 'DANCE', 'EARTH', 'FLAME', 'GRACE', 'HEART', 'IMAGE', 'JOKER', 'KNIFE', 'LIGHT', 'MAGIC', 'NIGHT', 'OCEAN', 'PIANO', 'QUART', 'RIVER', 'STORM', 'TIGER', 'UNITY', 'VALUE', 'WATER', 'YOUTH', 'ZEBRA'],
    targetWord: '',
    currentGuess: '',
    currentRow: 0,
    guesses: 0,
    maxGuesses: 6, // Hardcore 2: Will be set to 3 in restart()
    wins: 0,
    streak: 0,
    gameOver: false,
    
    init() {
        this.board = document.getElementById('wordleBoard');
        this.keyboard = document.getElementById('wordleKeyboard');
        this.wins = parseInt(localStorage.getItem('wordleWins') || '0');
        this.streak = parseInt(localStorage.getItem('wordleStreak') || '0');
        document.getElementById('wordleWins').textContent = this.wins;
        document.getElementById('wordleStreak').textContent = this.streak;
        this.restart();
        this.setupKeyboard();
        this.setupControls();
    },
    
    setupControls() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        this.keyHandler = (e) => {
            const gameScreen = document.getElementById('wordleGame');
            if (!gameScreen || gameScreen.style.display === 'none') return;
            
            if (this.gameOver) return;
            
            if (e.key === 'Enter') {
                this.submitGuess();
            } else if (e.key === 'Backspace') {
                this.deleteLetter();
            } else if (e.key.length === 1 && /[A-Za-z]/.test(e.key)) {
                this.addLetter(e.key.toUpperCase());
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
    },
    
    stop() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }
    },
    
    restart() {
        this.targetWord = this.wordList[Math.floor(Math.random() * this.wordList.length)];
        this.currentGuess = '';
        this.currentRow = 0;
        this.guesses = 0;
        // Hardcore 2: Only 2 guesses instead of 6 - EXTREME DIFFICULTY
        this.maxGuesses = isHardcore2() ? 2 : 6;
        this.gameOver = false;
        this.renderBoard();
        this.updateKeyboard();
    },
    
    renderBoard() {
        this.board.innerHTML = '';
        for (let row = 0; row < this.maxGuesses; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'wordle-row';
            for (let col = 0; col < 5; col++) {
                const cell = document.createElement('div');
                cell.className = 'wordle-cell';
                if (row === this.currentRow && col < this.currentGuess.length) {
                    cell.textContent = this.currentGuess[col];
                    cell.classList.add('typing');
                } else if (row < this.currentRow) {
                    const guess = this.getGuessForRow(row);
                    if (guess && col < guess.length) {
                        cell.textContent = guess[col];
                        const status = this.getLetterStatus(guess[col], col, row);
                        cell.classList.add(status);
                    }
                }
                rowDiv.appendChild(cell);
            }
            this.board.appendChild(rowDiv);
        }
        document.getElementById('wordleGuesses').textContent = this.guesses;
    },
    
    getGuessForRow(row) {
        const rows = this.board.querySelectorAll('.wordle-row');
        if (rows[row]) {
            const cells = rows[row].querySelectorAll('.wordle-cell');
            return Array.from(cells).map(cell => cell.textContent).join('');
        }
        return null;
    },
    
    getLetterStatus(letter, position, row) {
        if (this.targetWord[position] === letter) {
            return 'correct';
        } else if (this.targetWord.includes(letter)) {
            return 'present';
        } else {
            return 'absent';
        }
    },
    
    addLetter(letter) {
        if (this.currentGuess.length < 5 && !this.gameOver) {
            this.currentGuess += letter;
            this.renderBoard();
        }
    },
    
    deleteLetter() {
        if (this.currentGuess.length > 0 && !this.gameOver) {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.renderBoard();
        }
    },
    
    submitGuess() {
        if (this.currentGuess.length !== 5 || this.gameOver) return;
        
        this.guesses++;
        const guess = this.currentGuess;
        this.currentGuess = '';
        this.currentRow++;
        this.renderBoard();
        
        // Check win
        if (guess === this.targetWord) {
            this.gameOver = true;
            this.wins++;
            this.streak++;
            localStorage.setItem('wordleWins', this.wins);
            localStorage.setItem('wordleStreak', this.streak);
            document.getElementById('wordleWins').textContent = this.wins;
            document.getElementById('wordleStreak').textContent = this.streak;
            setTimeout(() => alert(`Congratulations! You guessed it in ${this.guesses} tries!`), 500);
            return;
        }
        
        // Check game over
        if (this.currentRow >= this.maxGuesses) {
            this.gameOver = true;
            this.streak = 0;
            localStorage.setItem('wordleStreak', this.streak);
            document.getElementById('wordleStreak').textContent = this.streak;
            setTimeout(() => alert(`Game Over! The word was: ${this.targetWord}`), 500);
        }
        
        this.updateKeyboard();
    },
    
    setupKeyboard() {
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
        ];
        
        this.keyboard.innerHTML = '';
        rows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'wordle-keyboard-row';
            row.forEach(key => {
                const keyBtn = document.createElement('button');
                keyBtn.className = 'wordle-key';
                keyBtn.textContent = key;
                keyBtn.dataset.key = key;
                if (key === 'ENTER' || key === 'BACK') {
                    keyBtn.classList.add('wordle-key-special');
                }
                keyBtn.addEventListener('click', () => {
                    if (key === 'ENTER') {
                        this.submitGuess();
                    } else if (key === 'BACK') {
                        this.deleteLetter();
                    } else {
                        this.addLetter(key);
                    }
                });
                rowDiv.appendChild(keyBtn);
            });
            this.keyboard.appendChild(rowDiv);
        });
    },
    
    updateKeyboard() {
        const keys = this.keyboard.querySelectorAll('.wordle-key');
        keys.forEach(keyBtn => {
            const key = keyBtn.dataset.key;
            if (key === 'ENTER' || key === 'BACK') return;
            
            keyBtn.classList.remove('correct', 'present', 'absent');
            
            // Check if letter is in target word
            if (this.targetWord.includes(key)) {
                // Check if it's in correct position in any guess
                let isCorrect = false;
                for (let row = 0; row < this.currentRow; row++) {
                    const guess = this.getGuessForRow(row);
                    if (guess) {
                        for (let i = 0; i < 5; i++) {
                            if (guess[i] === key && this.targetWord[i] === key) {
                                isCorrect = true;
                                break;
                            }
                        }
                    }
                }
                if (isCorrect) {
                    keyBtn.classList.add('correct');
                } else {
                    keyBtn.classList.add('present');
                }
            } else {
                // Check if letter was used in any guess
                let wasUsed = false;
                for (let row = 0; row < this.currentRow; row++) {
                    const guess = this.getGuessForRow(row);
                    if (guess && guess.includes(key)) {
                        wasUsed = true;
                        break;
                    }
                }
                if (wasUsed) {
                    keyBtn.classList.add('absent');
                }
            }
        });
    }
};

// ==================== WHACK-A-MOLE GAME ====================
const whackamoleGame = {
    board: null,
    moles: [],
    score: 0,
    timeLeft: 30,
    highScore: 0,
    gameActive: false,
    gameInterval: null,
    timerInterval: null,
    moleTimeout: null,
    
    init() {
        this.board = document.getElementById('moleBoard');
        this.highScore = parseInt(localStorage.getItem('moleHighScore') || '0');
        document.getElementById('moleHighScore').textContent = this.highScore;
        this.createBoard();
    },
    
    createBoard() {
        this.board.innerHTML = '';
        this.moles = [];
        for (let i = 0; i < 9; i++) {
            const moleHole = document.createElement('div');
            moleHole.className = 'mole-hole';
            moleHole.dataset.index = i;
            
            const mole = document.createElement('div');
            mole.className = 'mole';
            mole.dataset.index = i;
            mole.style.display = 'none';
            mole.addEventListener('click', () => this.whackMole(i));
            
            moleHole.appendChild(mole);
            this.board.appendChild(moleHole);
            this.moles.push({ element: mole, active: false, timeout: null });
        }
    },
    
    start() {
        if (this.gameActive) return;
        this.gameActive = true;
        this.score = 0;
        // Hardcore 2: Less time (10 seconds instead of 30) - EXTREME DIFFICULTY
        this.timeLeft = isHardcore2() ? 10 : 30;
        document.getElementById('moleScore').textContent = this.score;
        document.getElementById('moleTime').textContent = this.timeLeft;
        
        // Timer
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            document.getElementById('moleTime').textContent = this.timeLeft;
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
        
        // Spawn moles
        this.spawnMole();
    },
    
    spawnMole() {
        if (!this.gameActive) return;
        
        const availableHoles = this.moles.map((mole, index) => !mole.active ? index : null).filter(i => i !== null);
        if (availableHoles.length === 0) {
            this.moleTimeout = setTimeout(() => this.spawnMole(), 500);
            return;
        }
        
        const randomIndex = availableHoles[Math.floor(Math.random() * availableHoles.length)];
        const mole = this.moles[randomIndex];
        
        mole.active = true;
        mole.element.style.display = 'block';
        mole.element.classList.add('mole-up');
        
        // Hardcore 2: Moles stay for much less time and spawn faster - EXTREME DIFFICULTY
        const baseStayTime = isHardcore2() ? 250 : 2000;
        const stayTime = Math.max(isHardcore2() ? 200 : 800, baseStayTime - this.score * (isHardcore2() ? 25 : 10));
        mole.timeout = setTimeout(() => {
            if (mole.active) {
                mole.active = false;
                mole.element.style.display = 'none';
                mole.element.classList.remove('mole-up');
            }
        }, stayTime);
        
        const baseSpawnTime = isHardcore2() ? 100 : 1000;
        const nextSpawn = Math.max(isHardcore2() ? 100 : 300, baseSpawnTime - this.score * (isHardcore2() ? 8 : 5));
        this.moleTimeout = setTimeout(() => this.spawnMole(), nextSpawn);
    },
    
    whackMole(index) {
        const mole = this.moles[index];
        if (!mole.active || !this.gameActive) return;
        
        mole.active = false;
        mole.element.style.display = 'none';
        mole.element.classList.remove('mole-up');
        if (mole.timeout) clearTimeout(mole.timeout);
        
        this.score += 10;
        document.getElementById('moleScore').textContent = this.score;
        
        // Add hit effect
        mole.element.classList.add('mole-hit');
        setTimeout(() => mole.element.classList.remove('mole-hit'), 200);
    },
    
    endGame() {
        this.gameActive = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.moleTimeout) clearTimeout(this.moleTimeout);
        this.moles.forEach(mole => {
            if (mole.timeout) clearTimeout(mole.timeout);
            mole.active = false;
            mole.element.style.display = 'none';
            mole.element.classList.remove('mole-up');
        });
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('moleHighScore', this.highScore);
            document.getElementById('moleHighScore').textContent = this.highScore;
        }
        
        alert(`Time's up! Final Score: ${this.score}`);
    },
    
    restart() {
        this.endGame();
        this.createBoard();
    },
    
    stop() {
        this.endGame();
    }
};

// ==================== PLATFORMER GAME ====================
const platformerGame = {
    canvas: null,
    ctx: null,
    player: {x: 100, y: 300, width: 30, height: 40, vx: 0, vy: 0, speed: 5, jumpPower: 12, onGround: false},
    platforms: [],
    enemies: [],
    coins: [],
    score: 0,
    distance: 0,
    highScore: 0,
    gameLoop: null,
    paused: false,
    gravity: 0.6,
    cameraX: 0,
    
    init() {
        this.canvas = document.getElementById('platformerCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.highScore = parseInt(localStorage.getItem('platformerHighScore') || '0');
        document.getElementById('platformerHighScore').textContent = this.highScore;
        this.restart();
        this.setupControls();
    },
    
    setupControls() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            document.removeEventListener('keyup', this.keyUpHandler);
        }
        
        const keys = {};
        this.keyHandler = (e) => {
            const gameScreen = document.getElementById('platformerGame');
            if (!gameScreen || gameScreen.style.display === 'none') return;
            
            if (e.key === 'p' || e.key === 'P') {
                this.pause();
                return;
            }
            
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                keys.left = true;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                keys.right = true;
            } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                if (this.player.onGround) {
                    this.player.vy = -this.player.jumpPower;
                    this.player.onGround = false;
                }
            }
        };
        
        this.keyUpHandler = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                keys.left = false;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                keys.right = false;
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        
        const updatePlayer = () => {
            const gameScreen = document.getElementById('platformerGame');
            if (!gameScreen || gameScreen.style.display === 'none') return;
            
            if (!this.paused) {
                this.player.vx = 0;
                if (keys.left) this.player.vx = -this.player.speed;
                if (keys.right) this.player.vx = this.player.speed;
            }
            requestAnimationFrame(updatePlayer);
        };
        updatePlayer();
    },
    
    stop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            document.removeEventListener('keyup', this.keyUpHandler);
            this.keyHandler = null;
            this.keyUpHandler = null;
        }
        this.paused = true;
    },
    
    restart() {
        this.score = 0;
        this.distance = 0;
        this.paused = false;
        this.player.x = 100;
        this.player.y = 300;
        this.player.vx = 0;
        this.player.vy = 0;
        this.cameraX = 0;
        this.platforms = [];
        this.enemies = [];
        this.coins = [];
        this.createLevel();
        
        document.getElementById('platformerScore').textContent = this.score;
        document.getElementById('platformerDistance').textContent = this.distance;
        
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.gameLoop = requestAnimationFrame(() => this.update());
    },
    
    createLevel() {
        // Create ground platforms
        for (let i = 0; i < 20; i++) {
            this.platforms.push({
                x: i * 200,
                y: this.canvas.height - 50,
                width: 200,
                height: 50
            });
        }
        
        // Create floating platforms
        for (let i = 0; i < 15; i++) {
            this.platforms.push({
                x: 300 + i * 250,
                y: this.canvas.height - 150 - (i % 3) * 100,
                width: 150,
                height: 20
            });
        }
        
        // Create coins
        for (let i = 0; i < 30; i++) {
            this.coins.push({
                x: 200 + i * 150,
                y: this.canvas.height - 200 - Math.random() * 200,
                collected: false,
                radius: 15
            });
        }
        
        // Create enemies - Hardcore 2: More enemies (30 instead of 10) and faster - EXTREME DIFFICULTY
        const enemyCount = isHardcore2() ? 30 : 10;
        const enemySpeed = isHardcore2() ? -6 : -2;
        for (let i = 0; i < enemyCount; i++) {
            this.enemies.push({
                x: 400 + i * (isHardcore2() ? 150 : 300),
                y: this.canvas.height - 80,
                width: 30,
                height: 30,
                vx: enemySpeed,
                direction: -1
            });
        }
    },
    
    pause() {
        this.paused = !this.paused;
        if (!this.paused) {
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    },
    
    update() {
        const gameScreen = document.getElementById('platformerGame');
        if (!gameScreen || gameScreen.style.display === 'none') return;
        
        if (!this.paused) {
            // Apply gravity
            this.player.vy += this.gravity;
            
            // Update player position
            this.player.x += this.player.vx;
            this.player.y += this.player.vy;
            
            // Check platform collisions
            this.player.onGround = false;
            for (let platform of this.platforms) {
                if (this.player.x < platform.x + platform.width &&
                    this.player.x + this.player.width > platform.x &&
                    this.player.y < platform.y + platform.height &&
                    this.player.y + this.player.height > platform.y) {
                    
                    // Landing on top
                    if (this.player.vy > 0 && this.player.y < platform.y) {
                        this.player.y = platform.y - this.player.height;
                        this.player.vy = 0;
                        this.player.onGround = true;
                    }
                    // Hitting from below
                    else if (this.player.vy < 0) {
                        this.player.y = platform.y + platform.height;
                        this.player.vy = 0;
                    }
                    // Side collision
                    else if (this.player.vx > 0) {
                        this.player.x = platform.x - this.player.width;
                    } else if (this.player.vx < 0) {
                        this.player.x = platform.x + platform.width;
                    }
                }
            }
            
            // Update camera
            if (this.player.x > this.canvas.width / 2) {
                this.cameraX = this.player.x - this.canvas.width / 2;
                this.distance = Math.floor(this.cameraX / 10);
                document.getElementById('platformerDistance').textContent = this.distance;
            }
            
            // Update enemies
            this.enemies.forEach(enemy => {
                enemy.x += enemy.vx;
                // Simple AI - turn around at edges
                if (enemy.x < this.cameraX || enemy.x > this.cameraX + this.canvas.width) {
                    enemy.vx *= -1;
                }
                
                // Check collision with player
                if (this.player.x < enemy.x + enemy.width &&
                    this.player.x + this.player.width > enemy.x &&
                    this.player.y < enemy.y + enemy.height &&
                    this.player.y + this.player.height > enemy.y) {
                    this.gameOver();
                    return;
                }
            });
            
            // Check coin collection
            this.coins.forEach(coin => {
                if (!coin.collected) {
                    const dx = (this.player.x + this.player.width / 2) - coin.x;
                    const dy = (this.player.y + this.player.height / 2) - coin.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < coin.radius + 20) {
                        coin.collected = true;
                        this.score += 50;
                        document.getElementById('platformerScore').textContent = this.score;
                    }
                }
            });
            
            // Check boundaries
            if (this.player.y > this.canvas.height) {
                this.gameOver();
                return;
            }
        }
        
        this.draw();
        if (!this.paused) {
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    },
    
    draw() {
        // Sky gradient
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        skyGradient.addColorStop(0, '#87ceeb');
        skyGradient.addColorStop(1, '#98d8f0');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 5; i++) {
            const cloudX = (this.cameraX * 0.3 + i * 200) % (this.canvas.width + 200) - 100;
            const cloudY = 50 + i * 30;
            this.ctx.beginPath();
            this.ctx.arc(cloudX, cloudY, 30, 0, Math.PI * 2);
            this.ctx.arc(cloudX + 25, cloudY, 35, 0, Math.PI * 2);
            this.ctx.arc(cloudX - 25, cloudY, 35, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw platforms (with camera offset)
        this.ctx.fillStyle = '#8b7355';
        this.platforms.forEach(platform => {
            const screenX = platform.x - this.cameraX;
            if (screenX > -platform.width && screenX < this.canvas.width) {
                this.ctx.fillRect(screenX, platform.y, platform.width, platform.height);
                // Platform highlight
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                this.ctx.fillRect(screenX, platform.y, platform.width, 5);
                this.ctx.fillStyle = '#8b7355';
            }
        });
        
        // Draw coins
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const screenX = coin.x - this.cameraX;
                if (screenX > -coin.radius && screenX < this.canvas.width + coin.radius) {
                    const coinGradient = this.ctx.createRadialGradient(
                        screenX, coin.y, 0,
                        screenX, coin.y, coin.radius
                    );
                    coinGradient.addColorStop(0, '#ffd700');
                    coinGradient.addColorStop(1, '#ffa500');
                    this.ctx.fillStyle = coinGradient;
                    this.ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
                    this.ctx.shadowBlur = 10;
                    this.ctx.beginPath();
                    this.ctx.arc(screenX, coin.y, coin.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            const screenX = enemy.x - this.cameraX;
            if (screenX > -enemy.width && screenX < this.canvas.width + enemy.width) {
                this.ctx.fillStyle = '#ff4444';
                this.ctx.shadowColor = 'rgba(255, 68, 68, 0.6)';
                this.ctx.shadowBlur = 8;
                this.ctx.fillRect(screenX, enemy.y, enemy.width, enemy.height);
                this.ctx.shadowBlur = 0;
            }
        });
        
        // Draw player
        const playerScreenX = this.player.x - this.cameraX;
        const playerGradient = this.ctx.createLinearGradient(
            playerScreenX, this.player.y,
            playerScreenX, this.player.y + this.player.height
        );
        playerGradient.addColorStop(0, '#4a9eff');
        playerGradient.addColorStop(1, '#2563eb');
        this.ctx.fillStyle = playerGradient;
        this.ctx.shadowColor = 'rgba(74, 158, 255, 0.8)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(playerScreenX, this.player.y, this.player.width, this.player.height);
        this.ctx.shadowBlur = 0;
        
        // Pause overlay
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 36px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    },
    
    gameOver() {
        cancelAnimationFrame(this.gameLoop);
        const finalScore = this.score + this.distance;
        if (finalScore > this.highScore) {
            this.highScore = finalScore;
            localStorage.setItem('platformerHighScore', this.highScore);
            document.getElementById('platformerHighScore').textContent = this.highScore;
        }
        alert(`Game Over! Score: ${finalScore} | Distance: ${this.distance}m`);
        this.restart();
    }
};

// ==================== RACING GAME ====================
const racingGame = {
    canvas: null,
    ctx: null,
    player: {x: 300, y: 700, width: 40, height: 60, speed: 0, maxSpeed: 8, acceleration: 0.2, friction: 0.05},
    obstacles: [],
    roadLines: [],
    score: 0,
    distance: 0,
    speed: 0,
    highScore: 0,
    gameLoop: null,
    paused: false,
    roadOffset: 0,
    
    init() {
        this.canvas = document.getElementById('racingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.highScore = parseInt(localStorage.getItem('racingHighScore') || '0');
        document.getElementById('racingHighScore').textContent = this.highScore;
        this.restart();
        this.setupControls();
    },
    
    setupControls() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            document.removeEventListener('keyup', this.keyUpHandler);
        }
        
        const keys = {};
        this.keyHandler = (e) => {
            const gameScreen = document.getElementById('racingGame');
            if (!gameScreen || gameScreen.style.display === 'none') return;
            
            if (e.key === 'p' || e.key === 'P') {
                this.pause();
                return;
            }
            
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                keys.left = true;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                keys.right = true;
            }
        };
        
        this.keyUpHandler = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                keys.left = false;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                keys.right = false;
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        
        const updatePlayer = () => {
            const gameScreen = document.getElementById('racingGame');
            if (!gameScreen || gameScreen.style.display === 'none') return;
            
            if (!this.paused) {
                // Auto-accelerate
                if (this.player.speed < this.player.maxSpeed) {
                    this.player.speed += this.player.acceleration;
                }
                
                // Steering
                if (keys.left && this.player.x > 50) {
                    this.player.x -= 5;
                }
                if (keys.right && this.player.x < this.canvas.width - 50 - this.player.width) {
                    this.player.x += 5;
                }
            }
            requestAnimationFrame(updatePlayer);
        };
        updatePlayer();
    },
    
    stop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            document.removeEventListener('keyup', this.keyUpHandler);
            this.keyHandler = null;
            this.keyUpHandler = null;
        }
        this.paused = true;
    },
    
    restart() {
        this.score = 0;
        this.distance = 0;
        this.speed = 0;
        this.paused = false;
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - 100;
        this.player.speed = 0;
        this.obstacles = [];
        this.roadLines = [];
        this.roadOffset = 0;
        
        document.getElementById('racingScore').textContent = this.score;
        document.getElementById('racingDistance').textContent = this.distance;
        document.getElementById('racingSpeed').textContent = this.speed;
        
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.gameLoop = requestAnimationFrame(() => this.update());
    },
    
    pause() {
        this.paused = !this.paused;
        if (!this.paused) {
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    },
    
    update() {
        const gameScreen = document.getElementById('racingGame');
        if (!gameScreen || gameScreen.style.display === 'none') return;
        
        if (!this.paused) {
            // Update speed and distance
            if (this.player.speed < this.player.maxSpeed) {
                this.player.speed += this.player.acceleration;
            }
            this.speed = Math.floor(this.player.speed * 20);
            this.distance += this.player.speed;
            this.roadOffset += this.player.speed * 2;
            
            document.getElementById('racingSpeed').textContent = this.speed;
            document.getElementById('racingDistance').textContent = Math.floor(this.distance / 10);
            
            // Generate obstacles - Hardcore 2: Much more frequent obstacles - EXTREME DIFFICULTY
            const obstacleChance = isHardcore2() ? 0.08 : 0.02;
            if (Math.random() < obstacleChance) {
                const lane = Math.floor(Math.random() * 3);
                const laneX = [150, 300, 450][lane];
                this.obstacles.push({
                    x: laneX,
                    y: -60,
                    width: 40,
                    height: 60,
                    type: Math.random() > 0.7 ? 'car' : 'barrier'
                });
            }
            
            // Update obstacles - Hardcore 2: Faster obstacle movement - EXTREME DIFFICULTY
            const obstacleSpeed = isHardcore2() ? 7 : 3;
            this.obstacles = this.obstacles.filter(obstacle => {
                obstacle.y += this.player.speed * obstacleSpeed;
                
                // Check collision
                if (this.player.x < obstacle.x + obstacle.width &&
                    this.player.x + this.player.width > obstacle.x &&
                    this.player.y < obstacle.y + obstacle.height &&
                    this.player.y + this.player.height > obstacle.y) {
                    this.gameOver();
                    return false;
                }
                
                return obstacle.y < this.canvas.height + 100;
            });
            
            // Update road lines
            if (this.roadLines.length < 20) {
                for (let i = 0; i < 5; i++) {
                    this.roadLines.push({
                        x: this.canvas.width / 2 - 5,
                        y: -50 - i * 100
                    });
                }
            }
            
            this.roadLines = this.roadLines.filter(line => {
                line.y += this.player.speed * 2;
                return line.y < this.canvas.height + 50;
            });
            
            // Score increases with distance
            this.score = Math.floor(this.distance / 10);
            document.getElementById('racingScore').textContent = this.score;
        }
        
        this.draw();
        if (!this.paused) {
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    },
    
    draw() {
        // Road background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Road
        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(100, 0, 400, this.canvas.height);
        
        // Road lines
        this.ctx.fillStyle = '#ffff00';
        this.ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
        this.ctx.shadowBlur = 5;
        this.roadLines.forEach(line => {
            this.ctx.fillRect(line.x, line.y, 10, 50);
        });
        this.ctx.shadowBlur = 0;
        
        // Road edges
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(100, 0);
        this.ctx.lineTo(100, this.canvas.height);
        this.ctx.moveTo(500, 0);
        this.ctx.lineTo(500, this.canvas.height);
        this.ctx.stroke();
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'car') {
                const carGradient = this.ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height);
                carGradient.addColorStop(0, '#ff4444');
                carGradient.addColorStop(1, '#cc0000');
                this.ctx.fillStyle = carGradient;
            } else {
                this.ctx.fillStyle = '#ffa500';
            }
            this.ctx.shadowColor = obstacle.type === 'car' ? 'rgba(255, 68, 68, 0.6)' : 'rgba(255, 165, 0, 0.6)';
            this.ctx.shadowBlur = 8;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            this.ctx.shadowBlur = 0;
        });
        
        // Draw player car
        const playerGradient = this.ctx.createLinearGradient(this.player.x, this.player.y, this.player.x, this.player.y + this.player.height);
        playerGradient.addColorStop(0, '#4a9eff');
        playerGradient.addColorStop(1, '#2563eb');
        this.ctx.fillStyle = playerGradient;
        this.ctx.shadowColor = 'rgba(74, 158, 255, 0.8)';
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Car details
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.player.x + 5, this.player.y + 10, 30, 15);
        this.ctx.fillRect(this.player.x + 5, this.player.y + 35, 30, 15);
        this.ctx.shadowBlur = 0;
        
        // Pause overlay
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 36px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    },
    
    gameOver() {
        cancelAnimationFrame(this.gameLoop);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('racingHighScore', this.highScore);
            document.getElementById('racingHighScore').textContent = this.highScore;
        }
        alert(`Game Over! Score: ${this.score} | Distance: ${Math.floor(this.distance / 10)}m`);
        this.restart();
    }
};

// Initialize games when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize reaction game
    if (reactionGame) {
        reactionGame.init();
    }
    // Initialize simon game
    if (simonGame) {
        simonGame.init();
    }
});

// Cursor Trail Effect
const trails = [];
const maxTrails = 50;
let lastTime = 0;

function createCursorTrail(x, y, delay = 0) {
    setTimeout(() => {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = x + 'px';
        trail.style.top = y + 'px';
        trail.style.opacity = '0.6';
        document.body.appendChild(trail);
        
        requestAnimationFrame(() => {
            trail.style.opacity = '0';
            trail.style.transform = 'translate(-50%, -50%) scale(0.2)';
        });
        
        setTimeout(() => {
            if (trail.parentNode) {
                trail.remove();
            }
        }, 800);
        
        trails.push(trail);
        if (trails.length > maxTrails) {
            const oldTrail = trails.shift();
            if (oldTrail && oldTrail.parentNode) {
                oldTrail.remove();
            }
        }
    }, delay);
}

let lastX = 0;
let lastY = 0;
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    const now = Date.now();
    const timeSinceLastTrail = now - lastTime;
    
    if (timeSinceLastTrail > 8) {
        const distance = Math.sqrt(
            Math.pow(mouseX - lastX, 2) + Math.pow(mouseY - lastY, 2)
        );
        
        if (distance > 2) {
            createCursorTrail(mouseX, mouseY);
            lastX = mouseX;
            lastY = mouseY;
            lastTime = now;
        }
    }
});

