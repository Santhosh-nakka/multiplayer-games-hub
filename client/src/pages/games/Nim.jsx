import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Bot, User, Play } from 'lucide-react';

export default function Nim() {
  const navigate = useNavigate();
  // 4 piles: 1, 3, 5, 7 sticks
  const [piles, setPiles] = useState([1, 3, 5, 7]);
  const [isBotEnabled, setIsBotEnabled] = useState(true);
  const [playerTurn, setPlayerTurn] = useState(1); // 1 = P1, 2 = P2/Bot
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  
  // Hover/Selection state
  const [selectedPile, setSelectedPile] = useState(null);
  const [sticksToRemove, setSticksToRemove] = useState(0);

  const initGame = useCallback(() => {
    setPiles([1, 3, 5, 7]);
    setPlayerTurn(1);
    setGameOver(false);
    setWinner(null);
    setSelectedPile(null);
    setSticksToRemove(0);
  }, []);

  const handleStickClick = (pileIndex, stickIndex) => {
    if (gameOver) return;
    if (isBotEnabled && playerTurn === 2) return; // Bot's turn

    // Calculate how many sticks are from the clicked one to the end of the pile
    const sticksInPile = piles[pileIndex];
    const taking = sticksInPile - stickIndex;
    
    setSelectedPile(pileIndex);
    setSticksToRemove(taking);
  };

  const confirmMove = useCallback(() => {
    if (selectedPile === null || sticksToRemove === 0 || gameOver) return;

    const newPiles = [...piles];
    newPiles[selectedPile] -= sticksToRemove;
    setPiles(newPiles);
    setSelectedPile(null);
    setSticksToRemove(0);

    // Check win condition (whoever takes the last stick wins)
    if (newPiles.every(p => p === 0)) {
      setGameOver(true);
      setWinner(playerTurn);
      return;
    }

    setPlayerTurn(playerTurn === 1 ? 2 : 1);
  }, [gameOver, piles, playerTurn, selectedPile, sticksToRemove]);

  // Bot Logic
  useEffect(() => {
    if (!isBotEnabled || playerTurn === 1 || gameOver) return;

    const botMoveTimer = setTimeout(() => {
      // Calculate nim-sum (XOR sum)
      const nimSum = piles.reduce((acc, val) => acc ^ val, 0);
      
      let movePile = -1;
      let moveAmount = 0;

      if (nimSum !== 0) {
        // Winning position: find a pile where (pile XOR nimSum) < pile
        for (let i = 0; i < piles.length; i++) {
          const targetSize = piles[i] ^ nimSum;
          if (targetSize < piles[i]) {
            movePile = i;
            moveAmount = piles[i] - targetSize;
            break;
          }
        }
      } else {
        // Losing position: just take 1 stick from the first available pile to stall
        for (let i = 0; i < piles.length; i++) {
          if (piles[i] > 0) {
            movePile = i;
            moveAmount = 1;
            break;
          }
        }
      }

      // Execute Bot Move
      const newPiles = [...piles];
      newPiles[movePile] -= moveAmount;
      setPiles(newPiles);

      if (newPiles.every(p => p === 0)) {
        setGameOver(true);
        setWinner(2); // Bot wins
      } else {
        setPlayerTurn(1);
      }
    }, 1000); // 1 second delay for realism

    return () => clearTimeout(botMoveTimer);
  }, [isBotEnabled, playerTurn, gameOver, piles]);

  const toggleBot = () => {
    setIsBotEnabled(!isBotEnabled);
    initGame();
  };

  const styles = `
    .nim-wrapper {
      min-height: 100vh;
      background: url('/images/nim_wood_bg.jpg') center/cover no-repeat;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', system-ui, sans-serif;
    }
    
    .nim-header {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15, 23, 42, 0.8);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #94a3b8;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: color 0.2s;
    }
    .back-btn:hover { color: white; }

    .game-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      gap: 2rem;
    }

    .turn-indicator {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.5rem 2rem;
      border-radius: 8px;
      transition: all 0.3s;
    }

    .turn-p1 {
      color: #22d3ee;
      background: rgba(34, 211, 238, 0.1);
      border: 1px solid rgba(34, 211, 238, 0.3);
      box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);
    }

    .turn-p2 {
      color: #f472b6;
      background: rgba(244, 114, 182, 0.1);
      border: 1px solid rgba(244, 114, 182, 0.3);
      box-shadow: 0 0 15px rgba(244, 114, 182, 0.2);
    }

    .board {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      background: #70b823;
      padding: 3rem 4rem;
      border-radius: 1rem;
      border: 4px solid #4a8014;
      box-shadow: inset 0 0 50px rgba(0,0,0,0.2), 0 10px 30px rgba(0,0,0,0.8);
      width: 100%;
      max-width: 650px;
    }

    .pile-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 110px;
    }

    .pile {
      display: flex;
      gap: 2rem;
      align-items: flex-end;
      justify-content: center;
    }
    
    .row-label {
      position: absolute;
      right: 0;
      background: #ffcc00;
      border: 2px solid #8b0000;
      color: #8b0000;
      padding: 0.3rem 1.2rem;
      font-weight: bold;
      box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      font-size: 1.1rem;
    }

    .stick {
      position: relative;
      width: 14px;
      height: 90px;
      background: linear-gradient(to right, #e0e0e0, #ffffff, #d0d0d0);
      border-radius: 4px;
      cursor: pointer;
      box-shadow: 3px 3px 5px rgba(0,0,0,0.3);
      transition: all 0.2s;
      margin-top: 15px; /* space for the head */
    }

    .stick::before {
      content: '';
      position: absolute;
      top: -14px;
      left: -2px;
      width: 18px;
      height: 24px;
      background: radial-gradient(circle at 30% 30%, #a43cb6, #7a158b);
      border-radius: 50% 50% 40% 40%;
      box-shadow: inset -2px -2px 4px rgba(0,0,0,0.4);
    }

    .stick:hover {
      transform: translateY(-5px);
      box-shadow: 3px 8px 8px rgba(0,0,0,0.4);
    }

    .stick.selected {
      transform: translateY(-20px);
      opacity: 0.6;
      filter: brightness(1.2);
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      font-size: 1rem;
    }
    
    .btn-primary { 
      background: #3b82f6; 
      color: white; 
    }
    .btn-primary:hover:not(:disabled) { 
      background: #2563eb; 
    }
    .btn-primary:disabled {
      background: #1e293b;
      color: #64748b;
      cursor: not-allowed;
    }

    .btn-action {
      background: #10b981;
      color: #020617;
      font-size: 1.2rem;
      padding: 1rem 3rem;
      border-radius: 2rem;
    }
    .btn-action:hover:not(:disabled) {
      background: #34d399;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
      transform: scale(1.05);
    }
    .btn-action:disabled {
      background: #1e293b;
      color: #475569;
      cursor: not-allowed;
    }

    .btn-outline {
      background: transparent;
      border: 1px solid #3b82f6;
      color: #3b82f6;
    }
    .btn-outline:hover {
      background: rgba(59, 130, 246, 0.1);
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="nim-wrapper">
        <header className="nim-header">
          <button className="back-btn" onClick={() => navigate('/hub')}>
            <ArrowLeft size={20} /> Back to Game Library
          </button>
          <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#fde047' }}>
            NIM
          </div>
          <div style={{width: 100}}></div>
        </header>

        <div className="game-container">
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
             <button className="btn btn-outline" onClick={toggleBot} style={{ borderColor: isBotEnabled ? '#10b981' : '#3b82f6', color: isBotEnabled ? '#10b981' : '#3b82f6' }}>
                {isBotEnabled ? <Bot size={18} /> : <User size={18} />}
                {isBotEnabled ? 'Playing vs Bot' : '2 Player (Local)'}
              </button>
          </div>

          {!gameOver ? (
            <div className={`turn-indicator ${playerTurn === 1 ? 'turn-p1' : 'turn-p2'}`}>
              {playerTurn === 1 ? 'Player 1 Turn' : (isBotEnabled ? 'Bot is thinking...' : 'Player 2 Turn')}
            </div>
          ) : (
             <div className="turn-indicator" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', borderColor: '#10b981' }}>
              {winner === 1 ? 'Player 1 Wins!' : (isBotEnabled ? 'Bot Wins!' : 'Player 2 Wins!')}
            </div>
          )}

          <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>
            Rules: Select a pile, then remove 1 or more sticks from it. The player who takes the last stick wins!
          </div>

          <div className="board">
            {piles.map((stickCount, pileIndex) => (
              <div key={pileIndex} className="pile-wrapper">
                <div className="pile">
                  {Array.from({ length: stickCount }).map((_, stickIndex) => {
                    // Determine if this stick is marked for removal
                    const isSelected = selectedPile === pileIndex && (stickCount - stickIndex) <= sticksToRemove;
                    return (
                      <div 
                        key={stickIndex} 
                        className={`stick ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleStickClick(pileIndex, stickIndex)}
                      />
                    );
                  })}
                </div>
                <div className="row-label">Row {pileIndex + 1}</div>
              </div>
            ))}
          </div>

          {!gameOver ? (
            <button 
              className="btn btn-action" 
              disabled={sticksToRemove === 0 || (isBotEnabled && playerTurn === 2)}
              onClick={confirmMove}
            >
              <Play size={20} /> Take {sticksToRemove > 0 ? sticksToRemove : ''} Stick{sticksToRemove > 1 ? 's' : ''}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={initGame} style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
              <RefreshCw size={20} /> Play Again
            </button>
          )}

        </div>
      </div>
    </>
  );
}
