class Game2048 {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = this.loadBestScore();
        this.gameOver = false;
        
        this.gridContainer = document.getElementById('grid-container');
        this.tileContainer = document.getElementById('tile-container');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.gameMessage = document.getElementById('game-message');
        this.messageText = document.getElementById('message-text');
        
        this.initGrid();
        this.updateDisplay();
        this.addRandomTile();
        this.addRandomTile();
        this.render();
        
        this.setupEventListeners();
    }
    
    initGrid() {
        this.gridContainer.innerHTML = '';
        this.grid = [];
        
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            this.gridContainer.appendChild(cell);
        }
        
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.grid[row][col] = 0;
            }
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            let moved = false;
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    moved = this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    moved = this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    moved = this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    moved = this.move('right');
                    break;
            }
            
            if (moved) {
                this.addRandomTile();
                this.render();
                this.updateDisplay();
                
                if (this.isGameOver()) {
                    this.gameOver = true;
                    this.showGameOver();
                }
            }
        });
        
        document.getElementById('new-game').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('retry-button').addEventListener('click', () => {
            this.restart();
        });
        
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (this.gameOver) return;
            
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        });
    }
    
    handleSwipe(startX, startY, endX, endY) {
        const diffX = endX - startX;
        const diffY = endY - startY;
        const minSwipeDistance = 30;
        
        if (Math.abs(diffX) < minSwipeDistance && Math.abs(diffY) < minSwipeDistance) {
            return;
        }
        
        let moved = false;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                moved = this.move('right');
            } else {
                moved = this.move('left');
            }
        } else {
            if (diffY > 0) {
                moved = this.move('down');
            } else {
                moved = this.move('up');
            }
        }
        
        if (moved) {
            this.addRandomTile();
            this.render();
            this.updateDisplay();
            
            if (this.isGameOver()) {
                this.gameOver = true;
                this.showGameOver();
            }
        }
    }
    
    addRandomTile() {
        const emptyCells = [];
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[randomCell.row][randomCell.col] = value;
        }
    }
    
    move(direction) {
        const oldGrid = JSON.stringify(this.grid);
        
        switch(direction) {
            case 'left':
                this.moveLeft();
                break;
            case 'right':
                this.moveRight();
                break;
            case 'up':
                this.moveUp();
                break;
            case 'down':
                this.moveDown();
                break;
        }
        
        return oldGrid !== JSON.stringify(this.grid);
    }
    
    moveLeft() {
        for (let row = 0; row < this.gridSize; row++) {
            let line = this.grid[row].filter(cell => cell !== 0);
            line = this.mergeLine(line);
            
            while (line.length < this.gridSize) {
                line.push(0);
            }
            
            this.grid[row] = line;
        }
    }
    
    moveRight() {
        for (let row = 0; row < this.gridSize; row++) {
            let line = this.grid[row].filter(cell => cell !== 0);
            line = this.mergeLine(line.reverse()).reverse();
            
            while (line.length < this.gridSize) {
                line.unshift(0);
            }
            
            this.grid[row] = line;
        }
    }
    
    moveUp() {
        for (let col = 0; col < this.gridSize; col++) {
            let line = [];
            for (let row = 0; row < this.gridSize; row++) {
                if (this.grid[row][col] !== 0) {
                    line.push(this.grid[row][col]);
                }
            }
            
            line = this.mergeLine(line);
            
            for (let row = 0; row < this.gridSize; row++) {
                this.grid[row][col] = line[row] || 0;
            }
        }
    }
    
    moveDown() {
        for (let col = 0; col < this.gridSize; col++) {
            let line = [];
            for (let row = 0; row < this.gridSize; row++) {
                if (this.grid[row][col] !== 0) {
                    line.push(this.grid[row][col]);
                }
            }
            
            line = this.mergeLine(line.reverse()).reverse();
            
            for (let row = 0; row < this.gridSize; row++) {
                this.grid[row][col] = line[row] || 0;
            }
        }
    }
    
    mergeLine(line) {
        const newLine = [];
        let i = 0;
        
        while (i < line.length) {
            if (i + 1 < line.length && line[i] === line[i + 1]) {
                const mergedValue = line[i] * 2;
                newLine.push(mergedValue);
                this.score += mergedValue;
                i += 2;
            } else {
                newLine.push(line[i]);
                i++;
            }
        }
        
        return newLine;
    }
    
    isGameOver() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === 0) {
                    return false;
                }
                
                if (col < this.gridSize - 1 && this.grid[row][col] === this.grid[row][col + 1]) {
                    return false;
                }
                
                if (row < this.gridSize - 1 && this.grid[row][col] === this.grid[row + 1][col]) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    render() {
        this.tileContainer.innerHTML = '';
        const cellSize = (this.gridContainer.offsetWidth - (15 * (this.gridSize + 1))) / this.gridSize;
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const value = this.grid[row][col];
                
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value > 2048 ? 'super' : value}`;
                    tile.textContent = value;
                    
                    const top = row * (cellSize + 15);
                    const left = col * (cellSize + 15);
                    
                    tile.style.width = `${cellSize}px`;
                    tile.style.height = `${cellSize}px`;
                    tile.style.top = `${top}px`;
                    tile.style.left = `${left}px`;
                    
                    this.tileContainer.appendChild(tile);
                    
                    setTimeout(() => {
                        tile.classList.remove('tile-new');
                    }, 200);
                }
            }
        }
    }
    
    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore();
        }
        
        this.bestScoreDisplay.textContent = this.bestScore;
    }
    
    showGameOver() {
        this.messageText.textContent = '游戏结束!';
        this.gameMessage.classList.add('show');
    }
    
    restart() {
        this.score = 0;
        this.gameOver = false;
        this.gameMessage.classList.remove('show');
        this.initGrid();
        this.updateDisplay();
        this.addRandomTile();
        this.addRandomTile();
        this.render();
    }
    
    saveBestScore() {
        localStorage.setItem('2048-best-score', this.bestScore);
    }
    
    loadBestScore() {
        const saved = localStorage.getItem('2048-best-score');
        return saved ? parseInt(saved) : 0;
    }
}

window.addEventListener('load', () => {
    new Game2048();
});
