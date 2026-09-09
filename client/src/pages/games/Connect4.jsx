import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, GripHorizontal, Bot, User, Target, ShieldAlert, Users as UsersIcon, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import trophyImg from '../../assets/trophy_3d.png';

const ROWS = 6;
const COLS = 7;

function checkWin(board, row, col, player) {
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal right-down
    [1, -1]   // diagonal left-down
  ];

  for (let [dr, dc] of directions) {
    let count = 1;
    
    // Check positive direction
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
      count++;
      r += dr;
      c += dc;
    }

    // Check negative direction
    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
      count++;
      r -= dr;
      c -= dc;
    }

    if (count >= 4) {
      return true;
    }
  }
  return false;
}

const getAvailableRow = (colIndex, currentBoard) => {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (currentBoard[r][colIndex] === null) return r;
  }
  return -1;
};

export default function Connect4() {
  const navigate = useNavigate();
  // board[row][col], where row 0 is the top, row 5 is the bottom
  const [board, setBoard] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 = Red, 2 = Yellow
  const [winner, setWinner] = useState(null); // 1, 2, or 'draw'
  const [sliderCol, setSliderCol] = useState(3); // Start in middle column
  const [gameMode, setGameMode] = useState('pvp'); // 'pvp' or 'pve'

  const handleColumnClick = (colIndex) => {
    if (winner) return;
    
    // Prevent clicking during Bot's turn in PvE mode
    if (gameMode === 'pve' && currentPlayer === 2) return;

    processMove(colIndex);
  };

  const processMove = (colIndex) => {
    const targetRow = getAvailableRow(colIndex, board);

    // Column is full
    if (targetRow === -1) return;

    const newBoard = board.map(row => [...row]);
    newBoard[targetRow][colIndex] = currentPlayer;
    setBoard(newBoard);

    // Check for win
    if (checkWin(newBoard, targetRow, colIndex, currentPlayer)) {
      setWinner(currentPlayer);
      return;
    }

    // Check for draw
    if (newBoard.every(row => row.every(cell => cell !== null))) {
      setWinner('draw');
      return;
    }

    // Switch turns
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  // Bot Logic
  useEffect(() => {
    if (gameMode === 'pve' && currentPlayer === 2 && !winner) {
      const timer = setTimeout(() => {
        makeBotMove();
      }, 600); // 600ms delay for realism
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, winner, board]);

  const makeBotMove = () => {
    // 1. Try to win (Player 2)
    for (let c = 0; c < COLS; c++) {
      const r = getAvailableRow(c, board);
      if (r !== -1) {
        let tempBoard = board.map(row => [...row]);
        tempBoard[r][c] = 2;
        if (checkWin(tempBoard, r, c, 2)) {
          // Animate slider to winning column before dropping
          setSliderCol(c);
          setTimeout(() => processMove(c), 300);
          return;
        }
      }
    }

    // 2. Try to block (Player 1)
    for (let c = 0; c < COLS; c++) {
      const r = getAvailableRow(c, board);
      if (r !== -1) {
        let tempBoard = board.map(row => [...row]);
        tempBoard[r][c] = 1;
        if (checkWin(tempBoard, r, c, 1)) {
          setSliderCol(c);
          setTimeout(() => processMove(c), 300);
          return;
        }
      }
    }

    // 3. Play strategic center or random
    const preferredOrder = [3, 2, 4, 1, 5, 0, 6];
    for (let c of preferredOrder) {
      if (getAvailableRow(c, board) !== -1) {
        // Add a bit of randomness so it doesn't always play the exact same center game
        if (Math.random() > 0.2) {
          setSliderCol(c);
          setTimeout(() => processMove(c), 300);
          return;
        }
      }
    }
    
    // Fallback: just play the first available
    for (let c of preferredOrder) {
      if (getAvailableRow(c, board) !== -1) {
        setSliderCol(c);
        setTimeout(() => processMove(c), 300);
        return;
      }
    }
  };

  // Confetti Effect
  useEffect(() => {
    if (winner && winner !== 'draw') {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [winner]);

  const handlePlayAgain = () => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setCurrentPlayer(1);
    setWinner(null);
  };

  const isDraw = winner === 'draw';

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '2rem',
      background: 'linear-gradient(135deg, #991b1b 0%, #ef4444 50%, #eab308 50%, #854d0e 100%)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/hub')}
          style={{ background: 'none', border: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}
        >
          <ArrowLeft size={20} /> Back to Game Library
        </button>
        
        {/* Game Mode Toggle */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(0, 0, 0, 0.5)', 
          borderRadius: '30px', 
          padding: '6px',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5), 0 4px 15px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <button
            onClick={() => { setGameMode('pvp'); handlePlayAgain(); }}
            style={{
              background: gameMode === 'pvp' ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'transparent',
              border: 'none', 
              color: gameMode === 'pvp' ? '#fff' : 'rgba(255,255,255,0.6)', 
              padding: '10px 24px', 
              borderRadius: '24px',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: gameMode === 'pvp' ? '0 4px 15px rgba(239, 68, 68, 0.5)' : 'none'
            }}
          >
            <User size={22} /> VS Friend
          </button>
          <button
            onClick={() => { setGameMode('pve'); handlePlayAgain(); }}
            style={{
              background: gameMode === 'pve' ? 'linear-gradient(135deg, #eab308, #a16207)' : 'transparent',
              border: 'none', 
              color: gameMode === 'pve' ? '#fff' : 'rgba(255,255,255,0.6)', 
              padding: '10px 24px', 
              borderRadius: '24px',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: gameMode === 'pve' ? '0 4px 15px rgba(234, 179, 8, 0.5)' : 'none'
            }}
          >
            <Bot size={22} /> VS AI
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: '3rem', alignItems: 'flex-start', justifyContent: 'center', marginTop: '2rem' }}>
        
        {/* Left Side: Game Board */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '600px' }}>
        
        {/* Game Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '1rem',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '1.5rem 2.5rem',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(4px)'
        }}>
          <h2 style={{ fontSize: '2.5rem', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Connect 4</h2>
          
          {!winner ? (
            <div style={{ 
              marginTop: '1rem', 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              color: currentPlayer === 1 ? '#ef4444' : '#eab308',
              transition: 'color 0.3s'
            }}>
              {currentPlayer === 1 ? 'Red' : 'Yellow'}'s Turn {gameMode === 'pve' && currentPlayer === 2 && '(Bot thinking...)'}
            </div>
          ) : (
            <div style={{ 
              marginTop: '1rem', 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: 'bounce 0.5s ease'
            }}>
              {isDraw ? (
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>
                  🤝 It's a Draw!
                </div>
              ) : (
                <>
                  <img src={trophyImg} alt="Trophy" style={{ width: '120px', height: '120px', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(255, 215, 0, 0.5))', marginBottom: '1rem' }} />
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold',
                    color: winner === 1 ? '#ef4444' : '#eab308'
                  }}>
                    {winner === 1 ? 'Red' : 'Yellow'} Wins!
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div style={{
          background: 'linear-gradient(145deg, #2563eb, #1d4ed8)', // Richer 3D blue
          padding: '20px',
          borderRadius: '20px',
          boxShadow: '0 15px 0 #1e3a8a, 0 25px 40px rgba(0,0,0,0.8), inset 0 2px 10px rgba(255,255,255,0.3)', // Thick 3D edge
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          border: '2px solid #3b82f6',
          transform: 'perspective(800px) rotateX(5deg)', // Slight 3D tilt
          transformStyle: 'preserve-3d'
        }}>
          
          {/* Slider Track */}
          {!winner && (
            <div style={{ position: 'relative', width: '527px', height: '65px', marginBottom: '10px' }}>
              
              {/* The visible track line */}
              <div style={{
                position: 'absolute', top: '50%', left: '32px', right: '32px', height: '8px',
                marginTop: '-4px',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '4px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.2)'
              }} />

              {/* The visual Coin following the slider */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: `calc(${sliderCol * (65 + 12)}px)`, // 65px width + 12px gap
                width: '65px',
                height: '65px',
                borderRadius: '50%',
                background: currentPlayer === 1 ? 'radial-gradient(circle at 35% 25%, #fca5a5 0%, #ef4444 40%, #7f1d1d 90%)' 
                          : 'radial-gradient(circle at 35% 25%, #fef08a 0%, #eab308 40%, #713f12 90%)',
                boxShadow: currentPlayer === 1 ? '0 5px 0 #7f1d1d, 0 10px 15px rgba(0,0,0,0.6), inset 0 2px 5px rgba(255,255,255,0.5)'
                         : '0 5px 0 #713f12, 0 10px 15px rgba(0,0,0,0.6), inset 0 2px 5px rgba(255,255,255,0.7)',
                transition: 'left 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                pointerEvents: 'none', // Let the range input capture clicks
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  position: 'absolute', inset: '8px', borderRadius: '50%',
                  border: `2px solid ${currentPlayer === 1 ? 'rgba(252, 165, 165, 0.3)' : 'rgba(254, 240, 138, 0.4)'}`,
                  boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)'
                }} />
                {/* Only show grip if it's player's turn to slide */}
                {!(gameMode === 'pve' && currentPlayer === 2) && (
                  <GripHorizontal size={24} color="rgba(255,255,255,0.6)" style={{ zIndex: 2 }} />
                )}
              </div>

              {/* The invisible range input to handle dragging logic */}
              {!(gameMode === 'pve' && currentPlayer === 2) && (
                <input 
                  type="range" 
                  min="0" 
                  max="6" 
                  step="1" 
                  value={sliderCol}
                  onChange={(e) => setSliderCol(parseInt(e.target.value))}
                  onMouseUp={() => { if(board[0][sliderCol] === null) handleColumnClick(sliderCol); }}
                  onTouchEnd={() => { if(board[0][sliderCol] === null) handleColumnClick(sliderCol); }}
                  style={{
                    position: 'absolute',
                    top: '0', left: '0', right: '0', bottom: '0',
                    width: '100%', height: '100%',
                    opacity: 0,
                    cursor: 'grab'
                  }}
                />
              )}
            </div>
          )}

          {/* Grid Rows */}
          {board.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: 'flex', gap: '12px' }}>
              {row.map((cell, colIndex) => (
                <div 
                  key={`${rowIndex}-${colIndex}-${cell}`}
                  onClick={() => handleColumnClick(colIndex)}
                  style={{
                    width: '65px',
                    height: '65px',
                    borderRadius: '50%',
                    background: cell === 1 ? 'radial-gradient(circle at 35% 25%, #fca5a5 0%, #ef4444 40%, #7f1d1d 90%)' 
                              : cell === 2 ? 'radial-gradient(circle at 35% 25%, #fef08a 0%, #eab308 40%, #713f12 90%)' 
                              : '#020617',
                    boxShadow: cell === 1 ? '0 5px 0 #7f1d1d, 0 10px 15px rgba(0,0,0,0.6), inset 0 2px 5px rgba(255,255,255,0.5)'
                             : cell === 2 ? '0 5px 0 #713f12, 0 10px 15px rgba(0,0,0,0.6), inset 0 2px 5px rgba(255,255,255,0.7)'
                             : 'inset 0 10px 20px rgba(0,0,0,1), inset 0 -2px 5px rgba(255,255,255,0.2)', // Deep hole effect
                    cursor: (winner || (gameMode === 'pve' && currentPlayer === 2)) ? 'default' : 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    animation: cell !== null ? 'dropAnim 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    if (!winner && cell === null && board[0][colIndex] === null && !(gameMode === 'pve' && currentPlayer === 2)) {
                      e.currentTarget.style.transform = 'translateZ(10px) scale(1.05)';
                      e.currentTarget.style.boxShadow = `0 0 20px ${currentPlayer === 1 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(234, 179, 8, 0.6)'}, inset 0 10px 20px rgba(0,0,0,1)`;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (cell === null) {
                      e.currentTarget.style.transform = 'translateZ(0) scale(1)';
                      e.currentTarget.style.boxShadow = 'inset 0 10px 20px rgba(0,0,0,1), inset 0 -2px 5px rgba(255,255,255,0.2)';
                    }
                  }}
                >
                  {/* Subtle inner ring to make the chip look more realistic */}
                  {cell !== null && (
                    <div style={{
                      position: 'absolute',
                      inset: '8px',
                      borderRadius: '50%',
                      border: `2px solid ${cell === 1 ? 'rgba(252, 165, 165, 0.3)' : 'rgba(254, 240, 138, 0.4)'}`,
                      boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)'
                    }} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Play Again */}
        {winner && (
          <div style={{ marginTop: '3rem', animation: 'fadeInUp 0.5s ease' }}>
            <button className="btn-primary" onClick={handlePlayAgain} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', padding: '1rem 2rem' }}>
              <RefreshCw size={24} /> Play Again
            </button>
          </div>
        )}

        </div>

        {/* Right Side: Instructions */}
        <div style={{ 
          maxWidth: '380px',
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
          padding: '2rem',
          borderRadius: '24px',
          border: '1px solid rgba(78, 176, 249, 0.3)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 2px 10px rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          animation: 'fadeInUp 0.6s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '2px solid rgba(78, 176, 249, 0.2)', paddingBottom: '1rem' }}>
            <div style={{ background: 'rgba(78, 176, 249, 0.2)', padding: '0.5rem', borderRadius: '12px' }}>
              <Info color="#4eb0f9" size={24} />
            </div>
            <h3 style={{ fontSize: '1.8rem', color: '#f8fafc', margin: 0, textShadow: '0 2px 10px rgba(78, 176, 249, 0.5)' }}>
              How to Play
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <Target color="#10b981" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.5' }}>
                <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '0.25rem', fontSize: '1.1rem' }}>Objective</strong>
                Be the first to connect 4 of your colored chips in a row (horizontally, vertically, or diagonally).
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <GripHorizontal color="#3b82f6" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.5' }}>
                <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '0.25rem', fontSize: '1.1rem' }}>How to Drop</strong>
                Drag the chip along the top slider track and release it above the column you want to drop it into.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <UsersIcon color="#a855f7" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.5' }}>
                <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '0.25rem', fontSize: '1.1rem' }}>Multiplayer</strong>
                Toggle "VS Friend" in the top right to play locally with a friend, passing the mouse back and forth.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <ShieldAlert color="#ef4444" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.5' }}>
                <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '0.25rem', fontSize: '1.1rem' }}>The Bot</strong>
                Toggle "VS AI" to challenge the computer. The Bot plays Yellow and uses strategy to block your wins!
              </div>
            </div>
            
          </div>
        </div>

      </div>
      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dropAnim {
          0% { transform: translateY(-300px); opacity: 0; }
          60% { transform: translateY(15px); opacity: 1; }
          80% { transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
