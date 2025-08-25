class Game {
    #boardSize = 10;
    #snake = [];
    #apple = null;
    #direction = 'right';
    #nextDirection = 'right';
    #score = 0;
    #bestScore = 0;
    #gameInterval = null;
    #isGameRunning = false;
    #appleEaten = false;

    constructor() {
        this.boardElement = document.getElementById('gameBoard');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('bestScore');
        this.bestScoreContainer = document.getElementById('bestScoreContainer');
        this.restartBtn = document.getElementById('restartBtn');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gameOverRestartBtn = document.getElementById('gameOverRestartBtn');
        this.startHint = document.getElementById('startHint');

        this.#init();
        this.#loadBestScore();
        this.#setupEventListeners();
    }

    #init() {
        this.#createBoard();
        this.#resetGame();
        this.#render();
        this.#showStartHint();
    }

    #createBoard() {
        this.boardElement.innerHTML = '';
        for (let y = 0; y < this.#boardSize; y++) {
            for (let x = 0; x < this.#boardSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                this.boardElement.appendChild(cell);
            }
        }
    }

    #resetGame() {
        this.#snake = [
            { x: 4, y: 5 },
            { x: 5, y: 5 }
        ];
        this.#direction = 'right';
        this.#nextDirection = 'right';
        this.#score = 0;
        this.#updateScore();
        this.#generateApple();
    }

    #loadBestScore() {
        const savedBestScore = localStorage.getItem('snakeBestScore');
        if (savedBestScore) {
            this.#bestScore = parseInt(savedBestScore);
            this.bestScoreElement.textContent = this.#bestScore;
            this.bestScoreContainer.style.display = 'block';
        } else {
            this.bestScoreContainer.style.display = 'none';
        }
    }

    #saveBestScore() {
        if (this.#score > this.#bestScore) {
            this.#bestScore = this.#score;
            localStorage.setItem('snakeBestScore', this.#bestScore.toString());
            this.bestScoreElement.textContent = this.#bestScore;
            this.bestScoreContainer.style.display = 'block';
        }
    }

    #setupEventListeners() {
        document.addEventListener('keydown', (e) => this.#handleKeyPress(e));
        this.restartBtn.addEventListener('click', () => this.#startGame());
        this.gameOverRestartBtn.addEventListener('click', () => this.#startGame());

        this.boardElement.addEventListener('click', () => {
            if (!this.#isGameRunning) {
                this.#startGame();
            }
        });
    }

    #showStartHint() {
        if (this.startHint) {
            this.startHint.style.display = 'block';
        }
    }

    #hideStartHint() {
        if (this.startHint) {
            this.startHint.style.display = 'none';
        }
    }

    #handleKeyPress(e) {
        if (!this.#isGameRunning) return;

        switch(e.key) {
            case 'ArrowUp':
                if (this.#direction !== 'down') this.#nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (this.#direction !== 'up') this.#nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (this.#direction !== 'right') this.#nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (this.#direction !== 'left') this.#nextDirection = 'right';
                break;
        }
    }

    #startGame() {
        if (this.#isGameRunning) return;

        this.#resetGame();
        this.#isGameRunning = true;
        if (this.gameOverElement) {
            this.gameOverElement.style.display = 'none';
        }
        this.#hideStartHint();

        if (this.#gameInterval) {
            clearInterval(this.#gameInterval);
        }

        this.#gameInterval = setInterval(() => this.#gameLoop(), 500);
    }

    #gameLoop() {
        this.#direction = this.#nextDirection;
        this.#moveSnake();

        if (this.#checkCollision()) {
            this.#endGame();
            return;
        }

        this.#checkApple();
        this.#render();
    }

    #moveSnake() {
        const head = { ...this.#snake[0] };

        switch(this.#direction) {
            case 'up':
                head.y = (head.y - 1 + this.#boardSize) % this.#boardSize;
                break;
            case 'down':
                head.y = (head.y + 1) % this.#boardSize;
                break;
            case 'left':
                head.x = (head.x - 1 + this.#boardSize) % this.#boardSize;
                break;
            case 'right':
                head.x = (head.x + 1) % this.#boardSize;
                break;
        }

        this.#snake.unshift(head);
        if (!this.#appleEaten) {
            this.#snake.pop();
        }
        this.#appleEaten = false;
    }

    #checkCollision() {
        const head = this.#snake[0];

        // Проверяем столкновение с телом (начиная со второго элемента)
        for (let i = 1; i < this.#snake.length; i++) {
            if (head.x === this.#snake[i].x && head.y === this.#snake[i].y) {
                return true;
            }
        }

        return false;
    }

    #checkApple() {
        const head = this.#snake[0];

        if (this.#apple && head.x === this.#apple.x && head.y === this.#apple.y) {
            this.#score++;
            this.#updateScore();
            this.#generateApple();
            this.#appleEaten = true;
        }
    }

    #generateApple() {
        let newApple;
        let attempts = 0;
        const maxAttempts = this.#boardSize * this.#boardSize;

        do {
            newApple = {
                x: Math.floor(Math.random() * this.#boardSize),
                y: Math.floor(Math.random() * this.#boardSize)
            };
            attempts++;
            if (attempts > maxAttempts) {
                // Если не удалось найти свободное место
                newApple = { x: 0, y: 0 };
                break;
            }
        } while (this.#isSnakeAtPosition(newApple.x, newApple.y));

        this.#apple = newApple;
    }

    #isSnakeAtPosition(x, y) {
        return this.#snake.some(segment => segment.x === x && segment.y === y);
    }

    #updateScore() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.#score;
        }
    }

    #render() {
        const cells = this.boardElement.querySelectorAll('.cell');
        // Очищаем все клетки
        cells.forEach(cell => {
            cell.className = 'cell';
        });

        // Рисуем змейку
        this.#snake.forEach((segment, index) => {
            const cell = this.#getCell(segment.x, segment.y);
            if (cell) {
                cell.classList.add('snake');
                if (index === 0) {
                    cell.classList.add('snake-head');
                }
            }
        });

        // Рисуем яблоко
        if (this.#apple) {
            const appleCell = this.#getCell(this.#apple.x, this.#apple.y);
            if (appleCell) {
                appleCell.classList.add('apple');
            }
        }
    }

    #getCell(x, y) {
        return this.boardElement.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    }

    #endGame() {
        if (this.#gameInterval) {
            clearInterval(this.#gameInterval);
        }
        this.#isGameRunning = false;
        this.#saveBestScore();
        this.#showStartHint();

        if (this.finalScoreElement) {
            this.finalScoreElement.textContent = this.#score;
        }
        if (this.gameOverElement) {
            this.gameOverElement.style.display = 'block';
        }
    }
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});