import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Bot, User, Target, ShieldAlert, Users as UsersIcon, Flag, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import trophyImg from '../../assets/trophy_3d.png';

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (!board.includes('')) return 'draw';
  return null;
}

function minimax(board, depth, isMaximizing) {
  const winner = checkWinner(board);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (winner === 'draw') return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'O';
        let score = minimax(board, depth + 1, false);
        board[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'X';
        let score = minimax(board, depth + 1, true);
        board[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function getBestMove(board) {
  let bestScore = -Infinity;
  let move = -1;
  // If first move, just pick center or corner to speed it up
  const emptyCount = board.filter(c => c === '').length;
  if (emptyCount === 9) return 4; 
  
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

export default function TicTacToe() {
  const navigate = useNavigate();
  const [board, setBoard] = useState(Array(9).fill(''));
  const [xIsNext, setXIsNext] = useState(true);
  const [isBotEnabled, setIsBotEnabled] = useState(true);

  const winner = checkWinner(board);
  const currentPlayer = xIsNext ? 'X' : 'O';

  const handleCellClick = (index) => {
    // If cell is already filled, game is over, or it's bot's turn, do nothing
    if (board[index] !== '' || winner || (isBotEnabled && !xIsNext)) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  useEffect(() => {
    if (isBotEnabled && !xIsNext && !winner) {
      const botTimer = setTimeout(() => {
        const move = getBestMove(board);
        if (move !== -1) {
          const newBoard = [...board];
          newBoard[move] = 'O';
          setBoard(newBoard);
          setXIsNext(true);
        }
      }, 500); // 500ms delay for bot "thinking"
      return () => clearTimeout(botTimer);
    }
  }, [xIsNext, board, winner, isBotEnabled]);

  const handlePlayAgain = () => {
    setBoard(Array(9).fill(''));
    setXIsNext(true);
  };

  const isDraw = winner === 'draw';

  useEffect(() => {
    if (winner && winner !== 'draw') {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [winner]);

  return (
    <div className="tictactoe-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/hub')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}
        >
          <ArrowLeft size={20} /> Back to Game Library
        </button>
        <button 
          onClick={() => { setIsBotEnabled(!isBotEnabled); setBoard(Array(9).fill('')); setXIsNext(true); }}
          className="tictactoe-bot-btn"
          style={{ 
            background: isBotEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)', 
            border: `2px solid ${isBotEnabled ? '#10b981' : '#3b82f6'}`, 
            color: isBotEnabled ? '#34d399' : '#60a5fa', 
            padding: '0.5rem 1rem', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: `0 0 15px ${isBotEnabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isBotEnabled ? <Bot size={20} /> : <User size={20} />}
          <span className="hide-on-mobile">{isBotEnabled ? 'Playing vs Bot' : '2 Player (Local)'}</span>
        </button>
      </div>

      <div className="tictactoe-content" style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start', justifyContent: 'center', marginTop: '1.5rem' }}>
        
        {/* Left Side: Game Board */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '260px', maxWidth: '600px' }}>
          
          {/* Game Header */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '1.5rem 2.5rem',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(4px)',
            width: '100%'
          }}>
            <h2 className="text-perfect-style tictactoe-title" style={{ margin: 0, paddingBottom: '0.5rem' }}>Tic-Tac-Toe</h2>
            
            {!winner ? (
              <div style={{ 
                marginTop: '1rem', 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: xIsNext ? '#ef4444' : '#3b82f6',
                transition: 'color 0.3s'
              }}>
                Player {currentPlayer}'s Turn
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
                    <div className="text-perfect-style" style={{ fontSize: '2.5rem' }}>
                      Player {winner} Wins!
                    </div>
                  </>
                )}
              </div>
            )}
            <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              {isBotEnabled ? 'The Bot is UNBEATABLE. Good luck!' : 'Play locally with a friend on the same screen!'}
            </div>
          </div>

          {/* Game Board */}
          <div className="board-3d" style={{ 
            margin: '0 auto'
          }}>
            {board.map((cell, index) => (
              <button
                key={index}
                className="cell-3d"
                onClick={() => handleCellClick(index)}
                disabled={!!winner || cell !== ''}
                style={{
                  border: 'none',
                  cursor: (cell === '' && !winner) ? 'pointer' : 'default',
                  transition: 'transform 0.1s ease',
                }}
                onMouseDown={(e) => { if(cell === '' && !winner) e.currentTarget.style.transform = 'scale(0.95)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {cell === 'X' && <div className="piece-x-3d"></div>}
                {cell === 'O' && <div className="piece-o-3d"></div>}
              </button>
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
                Be the first to get 3 marks in a row horizontally, vertically, or diagonally.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <ShieldAlert color="#ef4444" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.5' }}>
                <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '0.25rem', fontSize: '1.1rem' }}>The Bot</strong>
                Designed to be <span style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>UNBEATABLE</span>. The best you can do is tie!
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <UsersIcon color="#a855f7" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.5' }}>
                <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '0.25rem', fontSize: '1.1rem' }}>Multiplayer</strong>
                Use the top right toggle to switch to a local 2-player match with a friend.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <Flag color="#f59e0b" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.5' }}>
                <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '0.25rem', fontSize: '1.1rem' }}>Draws</strong>
                If the board fills up without any 3-in-a-rows, the game ends in a tie.
              </div>
            </div>
            
          </div>
        </div>
      </div>
      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
