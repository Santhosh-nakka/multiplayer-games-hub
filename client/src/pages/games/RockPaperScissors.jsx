import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, User, CheckCircle2, Info, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { HandRock, HandPaper, HandScissors } from '../../components/GloveHands';

const MOVES = {
  ROCK: { name: 'Rock', Component: HandRock, beats: 'SCISSORS' },
  PAPER: { name: 'Paper', Component: HandPaper, beats: 'ROCK' },
  SCISSORS: { name: 'Scissors', Component: HandScissors, beats: 'PAPER' }
};

export default function RockPaperScissors() {
  const navigate = useNavigate();
  const [isBotEnabled, setIsBotEnabled] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const [player1Move, setPlayer1Move] = useState(null);
  const [player2Move, setPlayer2Move] = useState(null);
  const [gameState, setGameState] = useState('idle'); // idle -> shaking -> reveal
  
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [roundWinner, setRoundWinner] = useState(null);
  const WINNING_SCORE = 3;

  const handlePlayer1Move = (move) => {
    if (gameState !== 'idle' || player1Move) return;
    
    setPlayer1Move(move);
    
    if (isBotEnabled) {
      const keys = Object.keys(MOVES);
      const botMove = keys[Math.floor(Math.random() * keys.length)];
      setPlayer2Move(botMove);
      setGameState('shaking');
    } else if (player2Move) {
      setGameState('shaking');
    }
  };

  const handlePlayer2Move = (move) => {
    if (gameState !== 'idle' || isBotEnabled || player2Move) return;
    
    setPlayer2Move(move);
    
    if (player1Move) {
      setGameState('shaking');
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'idle' || showInstructions) return;
      const key = e.key.toLowerCase();
      
      // Player 1 controls (A, S, D)
      if (!player1Move) {
        if (key === 'a') handlePlayer1Move('ROCK');
        if (key === 's') handlePlayer1Move('PAPER');
        if (key === 'd') handlePlayer1Move('SCISSORS');
      }

      // Player 2 controls (J, K, L or Arrows)
      if (!isBotEnabled && !player2Move) {
        if (key === 'j' || key === 'arrowleft') handlePlayer2Move('ROCK');
        if (key === 'k' || key === 'arrowdown') handlePlayer2Move('PAPER');
        if (key === 'l' || key === 'arrowright') handlePlayer2Move('SCISSORS');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, player1Move, player2Move, isBotEnabled, showInstructions]);

  useEffect(() => {
    if (gameState === 'shaking') {
      const timer = setTimeout(() => {
        setGameState('reveal');
        
        let p1Win = false;
        let p2Win = false;
        
        if (player1Move !== player2Move) {
          if (MOVES[player1Move].beats === player2Move) {
            setPlayer1Score(prev => prev + 1);
            p1Win = true;
            setRoundWinner('p1');
          } else {
            setPlayer2Score(prev => prev + 1);
            p2Win = true;
            setRoundWinner('p2');
          }
        } else {
          setRoundWinner('draw');
        }

        const gameOver = player1Score + (p1Win ? 1 : 0) >= WINNING_SCORE || player2Score + (p2Win ? 1 : 0) >= WINNING_SCORE;
        if (gameOver) {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 }
          });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, player1Move, player2Move, player1Score, player2Score]);

  const resetRound = () => {
    setPlayer1Move(null);
    setPlayer2Move(null);
    setRoundWinner(null);
    setGameState('idle');
  };

  const playAgain = () => {
    setPlayer1Score(0);
    setPlayer2Score(0);
    resetRound();
  };

  const toggleMode = () => {
    setIsBotEnabled(!isBotEnabled);
    playAgain();
  };

  const gameOver = player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE;

  return (
    <div className="rps-container">
      {/* Background Panels */}
      <div className="rps-bg-panel rps-bg-green" />
      <div className="rps-bg-panel rps-bg-red" />
      <div className="rps-bg-panel rps-bg-blue" />
      
      {/* Title */}
      <h1 className="rps-title">Rock Paper Scissor</h1>

      {/* Top Bar */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 20 }}>
        <button 
          onClick={() => navigate('/hub')}
          style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem 1rem', borderRadius: '8px' }}
        >
          <ArrowLeft size={20} /> Game Library
        </button>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setShowInstructions(true)}
            style={{ background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem 1rem', borderRadius: '8px' }}
          >
            <Info size={20} /> How to Play
          </button>
          
          <button 
            onClick={toggleMode}
            style={{ background: 'rgba(0,0,0,0.7)', border: `2px solid ${isBotEnabled ? '#3b82f6' : '#10b981'}`, color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem 1.5rem', borderRadius: '12px', fontWeight: 'bold' }}
          >
            {isBotEnabled ? <><Bot size={24} color="#60a5fa" /> VS Bot</> : <><User size={24} color="#34d399" /> 2 Player</>}
          </button>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1.5rem', borderRadius: '12px', display: 'flex', gap: '2rem', color: 'white', fontWeight: 'bold', fontSize: '1.5rem', border: '2px solid white' }}>
          <div style={{ color: '#4ade80' }}>P1: {player1Score}</div>
          <div style={{ color: '#60a5fa' }}>{isBotEnabled ? 'Bot' : 'P2'}: {player2Score}</div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#1e293b', border: '2px solid #3b82f6', borderRadius: '16px', padding: '2.5rem', maxWidth: '600px', width: '90%', color: 'white', position: 'relative' }}>
            <button onClick={() => setShowInstructions(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={28} /></button>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#60a5fa', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>How to Play</h2>
            
            <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Pick a hand sign that beats your opponent! First to {WINNING_SCORE} wins the match.</p>
            
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1.2rem', lineHeight: '2' }}>
                <li>🟢 <strong>Rock</strong> beats Scissors</li>
                <li>🔴 <strong>Paper</strong> beats Rock</li>
                <li>🔵 <strong>Scissors</strong> beats Paper</li>
              </ul>
            </div>

            <h3 style={{ color: '#34d399', fontSize: '1.8rem', marginBottom: '1rem' }}>Keyboard Controls</h3>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Player 1</h4>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '1.1rem', lineHeight: '1.6' }}>
                  <li><strong>A</strong> - Rock</li>
                  <li><strong>S</strong> - Paper</li>
                  <li><strong>D</strong> - Scissors</li>
                </ul>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', opacity: isBotEnabled ? 0.4 : 1 }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Player 2</h4>
                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '1.1rem', lineHeight: '1.6' }}>
                  <li><strong>J</strong> or <strong>←</strong> - Rock</li>
                  <li><strong>K</strong> or <strong>↓</strong> - Paper</li>
                  <li><strong>L</strong> or <strong>→</strong> - Scissors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hands */}
      <div className={`rps-hand-container rps-hand-left ${gameState !== 'idle' ? 'visible' : ''} ${gameState === 'shaking' ? 'rps-shaking-left' : ''}`}>
        {gameState === 'reveal' ? (
          React.createElement(MOVES[player1Move]?.Component, { style: { width: '400px', height: '240px' } })
        ) : (
          <HandRock style={{ width: '400px', height: '240px' }} />
        )}
      </div>

      <div className={`rps-hand-container rps-hand-right ${gameState !== 'idle' ? 'visible' : ''} ${gameState === 'shaking' ? 'rps-shaking-right' : ''}`}>
        {gameState === 'reveal' ? (
          React.createElement(MOVES[player2Move]?.Component, { style: { width: '400px', height: '240px' } })
        ) : (
          <HandRock style={{ width: '400px', height: '240px' }} />
        )}
      </div>

      {/* Round Result Overlay */}
      {gameState === 'reveal' && !gameOver && (
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 30, background: 'rgba(0,0,0,0.8)', padding: '2rem', borderRadius: '16px', textAlign: 'center', border: '4px solid white', animation: 'fadeInDown 0.3s' }}>
          <h2 style={{ color: 'white', fontSize: '3rem', margin: '0 0 1rem 0' }}>
            {roundWinner === 'p1' ? 'Player 1 Wins!' : roundWinner === 'p2' ? (isBotEnabled ? 'Bot Wins!' : 'Player 2 Wins!') : 'Draw!'}
          </h2>
          <button onClick={resetRound} style={{ padding: '1rem 2rem', fontSize: '1.5rem', background: '#e53935', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Next Round
          </button>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameOver && (
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 30, background: 'rgba(0,0,0,0.9)', padding: '3rem', borderRadius: '24px', textAlign: 'center', border: '4px solid #ffcc00', animation: 'fadeInDown 0.5s' }}>
          <h2 style={{ color: '#ffcc00', fontSize: '4rem', margin: '0 0 1rem 0', textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>
            {player1Score >= WINNING_SCORE ? '🎉 PLAYER 1 WON THE GAME! 🎉' : (isBotEnabled ? '💀 BOT WINS THE GAME! 💀' : '🎉 PLAYER 2 WON THE GAME! 🎉')}
          </h2>
          <button onClick={playAgain} style={{ padding: '1rem 3rem', fontSize: '2rem', background: '#3eb53e', color: 'white', border: '4px solid white', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
            Play Again
          </button>
        </div>
      )}

      {/* Controls */}
      {isBotEnabled ? (
        <div className="rps-controls">
          <button className="rps-btn rps-btn-green" disabled={gameState !== 'idle' || gameOver} onClick={() => handlePlayer1Move('ROCK')}>
            ROCK <span className="rps-key-hint">Key: A</span>
          </button>
          <button className="rps-btn rps-btn-red" disabled={gameState !== 'idle' || gameOver} onClick={() => handlePlayer1Move('PAPER')}>
            PAPER <span className="rps-key-hint">Key: S</span>
          </button>
          <button className="rps-btn rps-btn-blue" disabled={gameState !== 'idle' || gameOver} onClick={() => handlePlayer1Move('SCISSORS')}>
            SCISSORS <span className="rps-key-hint">Key: D</span>
          </button>
        </div>
      ) : (
        <>
          <div className="rps-controls-side rps-controls-left">
            {player1Move ? (
              <div className="rps-ready-badge"><CheckCircle2 size={40} /> Ready</div>
            ) : (
              <>
                <button className="rps-btn rps-btn-green" disabled={gameState !== 'idle' || gameOver} onClick={() => handlePlayer1Move('ROCK')}>
                  ROCK <span className="rps-key-hint">A</span>
                </button>
                <button className="rps-btn rps-btn-red" disabled={gameState !== 'idle' || gameOver} onClick={() => handlePlayer1Move('PAPER')}>
                  PAPER <span className="rps-key-hint">S</span>
                </button>
                <button className="rps-btn rps-btn-blue" disabled={gameState !== 'idle' || gameOver} onClick={() => handlePlayer1Move('SCISSORS')}>
                  SCISSORS <span className="rps-key-hint">D</span>
                </button>
              </>
            )}
          </div>
          <div className="rps-controls-side rps-controls-right">
            {player2Move ? (
              <div className="rps-ready-badge"><CheckCircle2 size={40} /> Ready</div>
            ) : (
              <>
                <button className="rps-btn rps-btn-green" disabled={gameState !== 'idle' || gameOver} onClick={() => handlePlayer2Move('ROCK')}>
                  ROCK <span className="rps-key-hint">J or ←</span>
                </button>
                <button className="rps-btn rps-btn-red" disabled={gameState !== 'idle' || gameOver} onClick={() => handlePlayer2Move('PAPER')}>
                  PAPER <span className="rps-key-hint">K or ↓</span>
                </button>
                <button className="rps-btn rps-btn-blue" disabled={gameState !== 'idle' || gameOver} onClick={() => handlePlayer2Move('SCISSORS')}>
                  SCISSORS <span className="rps-key-hint">L or →</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
