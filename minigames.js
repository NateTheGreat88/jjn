// Menu Navigation
function showMenu() {
    // Stop all games
    if (snakeGame) snakeGame.stop();
    if (tetrisGame) tetrisGame.stop();
    if (pongGame) pongGame.stop();
    
    document.getElementById('gameMenu').style.display = 'flex';
    document.getElementById('snakeGame').style.display = 'none';
    document.getElementById('tetrisGame').style.display = 'none';
    document.getElementById('pongGame').style.display = 'none';
    document.getElementById('memoryGame').style.display = 'none';
    document.getElementById('reactionGame').style.display = 'none';
}

function showGame(gameName) {
    document.getElementById('gameMenu').style.display = 'none';
    document.getElementById('snakeGame').style.display = 'none';
    document.getElementById('tetrisGame').style.display = 'none';
    document.getElementById('pongGame').style.display = 'none';
    document.getElementById('memoryGame').style.display = 'none';
    document.getElementById('reactionGame').style.display = 'none';
    
    document.getElementById(gameName + 'Game').style.display = 'block';
    
    // Initialize the game
    if (gameName === 'snake' && snakeGame) snakeGame.init();
    if (gameName === 'tetris' && tetrisGame) tetrisGame.init();
    if (gameName === 'pong' && pongGame) pongGame.init();
    if (gameName === 'memory' && memoryGame) memoryGame.init();
    if (gameName === 'reaction' && reactionGame) reactionGame.init();
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
        this.generateFood();
        document.getElementById('snakeScore').textContent = this.score;
        
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), 100);
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
            this.generateFood();
        } else {
            this.snake.pop();
        }
        
        this.draw();
    },
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        this.ctx.fillStyle = '#4caf50';
        for (let segment of this.snake) {
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        }
        
        // Draw head
        this.ctx.fillStyle = '#66bb6a';
        this.ctx.fillRect(this.snake[0].x * this.gridSize, this.snake[0].y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        
        // Draw food
        this.ctx.fillStyle = '#ff4444';
        this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        
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
        this.dropInterval = 1000;
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
        
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x]) {
                    this.ctx.fillStyle = this.colors[this.board[y][x]];
                    this.ctx.fillRect(x * blockSize, y * blockSize, blockSize - 1, blockSize - 1);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            this.ctx.fillStyle = this.colors[this.currentPiece.color];
            for (let y = 0; y < this.currentPiece.matrix.length; y++) {
                for (let x = 0; x < this.currentPiece.matrix[y].length; x++) {
                    if (this.currentPiece.matrix[y][x]) {
                        const drawX = (this.currentPiece.x + x) * blockSize;
                        const drawY = (this.currentPiece.y + y) * blockSize;
                        if (drawY >= 0) {
                            this.ctx.fillRect(drawX, drawY, blockSize - 1, blockSize - 1);
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
        this.ball.vx = (Math.random() > 0.5 ? 1 : -1) * 5;
        this.ball.vy = (Math.random() - 0.5) * 5;
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
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw paddles
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.fillRect(this.ai.x, this.ai.y, this.ai.width, this.ai.height);
        
        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw pause overlay
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
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

// Initialize games when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize reaction game
    if (reactionGame) {
        reactionGame.init();
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

