import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react';

const GRID_SIZE = 4;

export default function Game2048() {
  const navigate = useNavigate();
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(parseInt(localStorage.getItem('2048_best') || '0'));
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  // Initialize game
  const initGame = useCallback(() => {
    let initialGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    initialGrid = addRandomTile(initialGrid);
    initialGrid = addRandomTile(initialGrid);
    setGrid(initialGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('2048_best', score.toString());
    }
  }, [score, bestScore]);

  const addRandomTile = (currentGrid) => {
    const emptyCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentGrid[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }
    
    if (emptyCells.length === 0) return currentGrid;
    
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = currentGrid.map(row => [...row]);
    // Increased probability of 4 to 30% for higher difficulty
    newGrid[randomCell.r][randomCell.c] = Math.random() < 0.7 ? 2 : 4;
    return newGrid;
  };

  const checkGameOver = (currentGrid) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentGrid[r][c] === 0) return false;
        if (c < GRID_SIZE - 1 && currentGrid[r][c] === currentGrid[r][c + 1]) return false;
        if (r < GRID_SIZE - 1 && currentGrid[r][c] === currentGrid[r + 1][c]) return false;
      }
    }
    return true;
  };

  const move = useCallback((direction) => {
    if (gameOver || won) return;

    setGrid(prevGrid => {
      let newGrid = prevGrid.map(row => [...row]);
      let changed = false;
      let newScore = score;

      const slide = (row) => {
        let arr = row.filter(val => val !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            newScore += arr[i];
            if (arr[i] === 2048) setWon(true);
            arr.splice(i + 1, 1);
          }
        }
        while (arr.length < GRID_SIZE) arr.push(0);
        return arr;
      };

      if (direction === 'LEFT' || direction === 'RIGHT') {
        for (let r = 0; r < GRID_SIZE; r++) {
          let row = newGrid[r];
          if (direction === 'RIGHT') row.reverse();
          let newRow = slide(row);
          if (direction === 'RIGHT') newRow.reverse();
          if (newGrid[r].join(',') !== newRow.join(',')) changed = true;
          newGrid[r] = newRow;
        }
      } else if (direction === 'UP' || direction === 'DOWN') {
        for (let c = 0; c < GRID_SIZE; c++) {
          let col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
          if (direction === 'DOWN') col.reverse();
          let newCol = slide(col);
          if (direction === 'DOWN') newCol.reverse();
          for (let r = 0; r < GRID_SIZE; r++) {
            if (newGrid[r][c] !== newCol[r]) changed = true;
            newGrid[r][c] = newCol[r];
          }
        }
      }

      if (changed) {
        newGrid = addRandomTile(newGrid);
        setScore(newScore);
        if (checkGameOver(newGrid)) setGameOver(true);
        return newGrid;
      }
      return prevGrid;
    });
  }, [gameOver, won, score]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault(); // Prevent scrolling
      }
      
      switch(e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          move('UP');
          break;
        case 'arrowdown':
        case 's':
          move('DOWN');
          break;
        case 'arrowleft':
        case 'a':
          move('LEFT');
          break;
        case 'arrowright':
        case 'd':
          move('RIGHT');
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const getTileColor = (val) => {
    const colors = {
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
    };
    return colors[val] || '#3c3a32';
  };

  const getTileTextColor = (val) => {
    return val <= 4 ? '#776e65' : '#f9f6f2';
  };

  const styles = `
    .game2048-wrapper {
      min-height: 100vh;
      background: #5c4033;
      color: #f9f6f2;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', system-ui, sans-serif;
    }
    
    .game2048-header {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #5c4033;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #f9f6f2;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
      transition: color 0.2s;
    }
    .back-btn:hover { color: #bbada0; }

    .game-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      gap: 2rem;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      width: 100%;
      max-width: 400px;
      align-items: center;
    }

    .score-box {
      background: #bbada0;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      text-align: center;
      min-width: 100px;
    }

    .score-label {
      font-size: 0.8rem;
      color: #eee4da;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .score-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: white;
    }

    .board {
      background: #bbada0;
      padding: 10px;
      border-radius: 12px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1fr);
      gap: 10px;
      position: relative;
      width: 100%;
      max-width: 380px;
      aspect-ratio: 1;
    }

    .cell {
      width: 100%;
      height: 100%;
      background: #cdc1b4;
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: clamp(1.5rem, 5vw, 2.5rem);
      font-weight: 800;
      transition: all 0.15s ease-in-out;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(238, 228, 218, 0.73);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 10px;
      z-index: 10;
      gap: 1.5rem;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      font-size: 1.1rem;
    }
    
    .btn-primary { 
      background: #8f7a66; 
      color: #f9f6f2; 
    }
    .btn-primary:hover { 
      background: #9f8b77; 
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="game2048-wrapper">
        <header className="game2048-header">
          <button className="back-btn" onClick={() => navigate('/hub')}>
            <ArrowLeft size={20} /> Back to Game Library
          </button>
          <div style={{ fontWeight: 800, fontSize: '2rem', color: '#f9f6f2' }}>
            2048
          </div>
          <div style={{width: 100}}></div>
        </header>

        <div className="game-container">
          
          <div className="header-bar">
            <div className="score-box">
              <div className="score-label">Score</div>
              <div className="score-value">{score}</div>
            </div>
            
            <button className="btn btn-primary" onClick={initGame} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
              <RefreshCw size={16} /> Restart
            </button>

            <div className="score-box">
              <div className="score-label">Best</div>
              <div className="score-value" style={{ color: 'white' }}>{bestScore}</div>
            </div>
          </div>

          <div 
            className="board"
            onTouchStart={(e) => {
              const t = e.touches[0];
              e.currentTarget.dataset.startX = t.clientX;
              e.currentTarget.dataset.startY = t.clientY;
            }}
            onTouchEnd={(e) => {
              const startX = parseFloat(e.currentTarget.dataset.startX);
              const startY = parseFloat(e.currentTarget.dataset.startY);
              if (isNaN(startX) || isNaN(startY)) return;
              
              const t = e.changedTouches[0];
              const dx = t.clientX - startX;
              const dy = t.clientY - startY;
              
              if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > 30) {
                  if (dx > 0) move('RIGHT');
                  else move('LEFT');
                }
              } else {
                if (Math.abs(dy) > 30) {
                  if (dy > 0) move('DOWN');
                  else move('UP');
                }
              }
            }}
          >
            {(gameOver || won) && (
              <div className="overlay">
                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#776e65' }}>
                  {won ? 'YOU WIN!' : 'GAME OVER'}
                </div>
                <button className="btn btn-primary" onClick={initGame} style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
                  <RefreshCw size={20} /> Try Again
                </button>
              </div>
            )}

            {grid.map((row, r) => (
              row.map((val, c) => (
                <div 
                  key={`${r}-${c}`} 
                  className="cell"
                  style={{ 
                    background: getTileColor(val), 
                    color: getTileTextColor(val),
                    transform: val ? 'scale(1)' : 'scale(0.9)',
                  }}
                >
                  {val !== 0 ? val : ''}
                </div>
              ))
            ))}
          </div>

          <div style={{ color: '#f9f6f2', textAlign: 'center', maxWidth: '400px', lineHeight: '1.5' }}>
            <strong>HOW TO PLAY:</strong> Use your <strong>arrow keys</strong> or <strong>WASD</strong> to move the tiles. Tiles with the same number merge into one when they touch. Add them up to reach <strong>2048!</strong>
          </div>

        </div>
      </div>
    </>
  );
}
