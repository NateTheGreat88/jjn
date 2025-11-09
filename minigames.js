// Menu Navigation
function showMenu() {
    // Stop all games
    if (snakeGame) snakeGame.stop();
    if (tetrisGame) tetrisGame.stop();
    if (pongGame) pongGame.stop();
    if (breakoutGame) breakoutGame.stop();
    if (flappyGame) flappyGame.stop();
    
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
            if (this.frameCount % 100 === 0) {
                const gap = 150;
                const pipeHeight = Math.random() * (this.canvas.height - gap - 100) + 50;
                this.pipes.push({
                    x: this.canvas.width,
                    topHeight: pipeHeight,
                    bottomY: pipeHeight + gap,
                    bottomHeight: this.canvas.height - (pipeHeight + gap),
                    passed: false
                });
            }
            
            // Update pipes
            for (let pipe of this.pipes) {
                pipe.x -= 3;
                
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

