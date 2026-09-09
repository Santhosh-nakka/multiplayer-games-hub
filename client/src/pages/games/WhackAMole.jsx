import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Bot, User, Hammer } from 'lucide-react';

const GAME_DURATION = 30; // 30 seconds

export default function WhackAMole() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('idle'); // idle, playing, end
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isBotEnabled, setIsBotEnabled] = useState(true);

  // Array of 9 items, true if mole is active
  const [p1Moles, setP1Moles] = useState(Array(9).fill(false));
  const [p2Moles, setP2Moles] = useState(Array(9).fill(false));

  const gameLoopRef = useRef(null);
  const timerRef = useRef(null);
  const botRef = useRef(null);

  const startGame = () => {
    setGameState('playing');
    setP1Score(0);
    setP2Score(0);
    setTimeLeft(GAME_DURATION);
    setP1Moles(Array(9).fill(false));
    setP2Moles(Array(9).fill(false));
  };

  const endGame = useCallback(() => {
    setGameState('end');
    clearInterval(gameLoopRef.current);
    clearInterval(timerRef.current);
    clearInterval(botRef.current);
    setP1Moles(Array(9).fill(false));
    setP2Moles(Array(9).fill(false));
  }, []);

  // Timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, endGame]);

  // Mole Spawning Logic
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(() => {
        // Spawn for P1
        setP1Moles(prev => {
          const next = [...prev];
          const emptyIndices = next.map((val, i) => !val ? i : -1).filter(i => i !== -1);
          if (emptyIndices.length > 0) {
            const spawnIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            next[spawnIndex] = true;
            // Despawn after random time (700ms - 1500ms)
            setTimeout(() => {
              setP1Moles(current => {
                const c = [...current];
                c[spawnIndex] = false;
                return c;
              });
            }, Math.random() * 800 + 700);
          }
          return next;
        });

        // Spawn for P2
        setP2Moles(prev => {
          const next = [...prev];
          const emptyIndices = next.map((val, i) => !val ? i : -1).filter(i => i !== -1);
          if (emptyIndices.length > 0) {
            const spawnIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            next[spawnIndex] = true;
            setTimeout(() => {
              setP2Moles(current => {
                const c = [...current];
                c[spawnIndex] = false;
                return c;
              });
            }, Math.random() * 800 + 700);
          }
          return next;
        });
      }, 600); // Try to spawn every 600ms
    }
    return () => clearInterval(gameLoopRef.current);
  }, [gameState]);

  // Bot Logic
  useEffect(() => {
    if (gameState === 'playing' && isBotEnabled) {
      botRef.current = setInterval(() => {
        setP2Moles(prev => {
          const activeIndices = prev.map((val, i) => val ? i : -1).filter(i => i !== -1);
          if (activeIndices.length > 0) {
            // 70% chance to hit a mole every 400ms
            if (Math.random() < 0.7) {
              const hitIndex = activeIndices[Math.floor(Math.random() * activeIndices.length)];
              const next = [...prev];
              next[hitIndex] = false;
              setP2Score(s => s + 1);
              return next;
            }
          }
          return prev;
        });
      }, 400);
    }
    return () => clearInterval(botRef.current);
  }, [gameState, isBotEnabled]);

  const whackMole = (player, index) => {
    if (gameState !== 'playing') return;

    if (player === 1) {
      if (p1Moles[index]) {
        const next = [...p1Moles];
        next[index] = false;
        setP1Moles(next);
        setP1Score(s => s + 1);
      }
    } else {
      if (isBotEnabled) return; // Prevent clicking P2 board if bot is playing
      if (p2Moles[index]) {
        const next = [...p2Moles];
        next[index] = false;
        setP2Moles(next);
        setP2Score(s => s + 1);
      }
    }
  };

  // Keyboard mapping
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      const key = e.key.toLowerCase();
      
      const p1Keys = ['q', 'w', 'e', 'a', 's', 'd', 'z', 'x', 'c'];
      const p2Keys = ['7', '8', '9', 'u', 'i', 'o', 'j', 'k', 'l'];

      const p1Index = p1Keys.indexOf(key);
      if (p1Index !== -1) whackMole(1, p1Index);

      if (!isBotEnabled) {
        const p2Index = p2Keys.indexOf(key);
        if (p2Index !== -1) whackMole(2, p2Index);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isBotEnabled, p1Moles, p2Moles]); // Rebind when moles change to get latest state for whackMole

  const toggleBot = () => {
    setIsBotEnabled(!isBotEnabled);
    if (gameState !== 'idle') {
      endGame();
      setGameState('idle');
    }
  };

  const GrayMole = () => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute', bottom: 0, left: 0 }}>
      <path d="M 20 100 Q 20 20 50 20 Q 80 20 80 100 Z" fill="#8a929a" />
      <path d="M 35 100 Q 35 60 50 60 Q 65 60 65 100 Z" fill="#e2e8f0" />
      <circle cx="40" cy="45" r="4" fill="#111" />
      <circle cx="60" cy="45" r="4" fill="#111" />
      <ellipse cx="50" cy="55" rx="8" ry="5" fill="#ff7979" />
      <rect x="44" y="60" width="5" height="10" fill="#fff" stroke="#111" strokeWidth="1" />
      <rect x="51" y="60" width="5" height="10" fill="#fff" stroke="#111" strokeWidth="1" />
      <g transform="translate(15, 80)">
        <circle cx="10" cy="10" r="10" fill="#f5cba7" />
        <path d="M 2 5 L -2 0 M 10 2 L 10 -4 M 18 5 L 22 0" stroke="#fff" strokeWidth="2" />
      </g>
      <g transform="translate(65, 80)">
        <circle cx="10" cy="10" r="10" fill="#f5cba7" />
        <path d="M 2 5 L -2 0 M 10 2 L 10 -4 M 18 5 L 22 0" stroke="#fff" strokeWidth="2" />
      </g>
    </svg>
  );

  const MinerMole = () => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute', bottom: 0, left: 0 }}>
      <path d="M 20 100 Q 20 20 50 20 Q 80 20 80 100 Z" fill="#a0522d" />
      <path d="M 35 100 Q 35 60 50 60 Q 65 60 65 100 Z" fill="#f5cba7" />
      <ellipse cx="50" cy="58" rx="8" ry="5" fill="#ff7979" />
      <rect x="44" y="63" width="5" height="10" fill="#fff" stroke="#111" strokeWidth="1" />
      <rect x="51" y="63" width="5" height="10" fill="#fff" stroke="#111" strokeWidth="1" />
      <circle cx="38" cy="48" r="10" fill="#81ecec" stroke="#555" strokeWidth="3" />
      <circle cx="62" cy="48" r="10" fill="#81ecec" stroke="#555" strokeWidth="3" />
      <path d="M 48 48 L 52 48" stroke="#555" strokeWidth="3" />
      <path d="M 28 48 L 22 45 M 72 48 L 78 45" stroke="#333" strokeWidth="4" />
      <path d="M 25 35 Q 50 5 75 35 Z" fill="#f1c40f" />
      <ellipse cx="50" cy="35" rx="30" ry="8" fill="#f39c12" />
      <circle cx="50" cy="25" r="8" fill="#ecf0f1" stroke="#7f8c8d" strokeWidth="2" />
      <circle cx="50" cy="25" r="4" fill="#f1c40f" />
      <g transform="translate(15, 80)">
        <circle cx="10" cy="10" r="10" fill="#f5cba7" />
        <path d="M 2 5 L -2 0 M 10 2 L 10 -4 M 18 5 L 22 0" stroke="#fff" strokeWidth="2" />
      </g>
      <g transform="translate(65, 80)">
        <circle cx="10" cy="10" r="10" fill="#f5cba7" />
        <path d="M 2 5 L -2 0 M 10 2 L 10 -4 M 18 5 L 22 0" stroke="#fff" strokeWidth="2" />
      </g>
    </svg>
  );

  const renderGrid = (player, moles) => {
    const p1Hints = ['Q', 'W', 'E', 'A', 'S', 'D', 'Z', 'X', 'C'];
    const p2Hints = ['7', '8', '9', 'U', 'I', 'O', 'J', 'K', 'L'];
    const hints = player === 1 ? p1Hints : p2Hints;

    return (
      <div className="mole-grid">
        {moles.map((isActive, index) => (
          <div 
            key={index} 
            className="hole"
            onClick={() => whackMole(player, index)}
          >
            <div className="hole-back"></div>
            <div className={`mole-container ${isActive ? 'active' : ''}`}>
               {player === 1 ? <GrayMole /> : <MinerMole />}
            </div>
            <div className="hole-front"></div>
            <div className="key-hint">{hints[index]}</div>
          </div>
        ))}
      </div>
    );
  };

  let resultText = '';
  if (gameState === 'end') {
    if (p1Score > p2Score) resultText = 'PLAYER 1 WINS!';
    else if (p2Score > p1Score) resultText = isBotEnabled ? 'BOT WINS!' : 'PLAYER 2 WINS!';
    else resultText = "IT'S A TIE!";
  }

  const styles = `
    .whack-wrapper {
      min-height: 100vh;
      background: #e6b840; /* Yellow dirt */
      background-image: radial-gradient(#d4a017 10%, transparent 10%), radial-gradient(#d4a017 10%, transparent 10%);
      background-size: 40px 40px;
      background-position: 0 0, 20px 20px;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', system-ui, sans-serif;
    }
    
    .whack-header {
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
      gap: 1.5rem;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      width: 100%;
      max-width: 900px;
      align-items: center;
      background: #0f172a;
      padding: 1rem 2rem;
      border-radius: 12px;
      border: 1px solid #1e293b;
    }

    .score-display {
      font-size: 2.5rem;
      font-weight: 900;
      font-family: 'Orbitron', sans-serif;
    }

    .p1-score { color: #22d3ee; text-shadow: 0 0 10px rgba(34, 211, 238, 0.5); }
    .p2-score { color: #f472b6; text-shadow: 0 0 10px rgba(244, 114, 182, 0.5); }

    .timer {
      font-size: 3rem;
      font-weight: 900;
      color: #eab308;
      text-shadow: 0 0 15px rgba(234, 179, 8, 0.6);
      font-family: 'Orbitron', sans-serif;
    }

    .boards-container {
      display: flex;
      gap: 4rem;
      width: 100%;
      max-width: 900px;
      justify-content: center;
    }

    .player-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .mole-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 1.5rem;
      background: #3e2723; /* Dark dirt */
      background-image: radial-gradient(#2d1b15 15%, transparent 16%), radial-gradient(#2d1b15 15%, transparent 16%);
      background-size: 30px 30px;
      background-position: 0 0, 15px 15px;
      padding: 2.5rem;
      border-radius: 8px;
      border: 12px solid #8d6e63; /* Wooden fence border */
      box-shadow: inset 0 0 30px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.5);
    }

    .hole {
      width: 100px;
      height: 100px;
      position: relative;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      overflow: hidden;
    }

    .hole-back {
      position: absolute;
      bottom: 15px;
      width: 80px;
      height: 30px;
      background: #1a0f0a;
      border-radius: 50%;
      box-shadow: inset 0 5px 10px rgba(0,0,0,0.9);
      z-index: 1;
    }

    .mole-container {
      width: 80px;
      height: 90px;
      position: absolute;
      bottom: -90px; /* Hidden state */
      left: 10px;
      transition: bottom 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      z-index: 2;
    }

    .mole-container.active {
      bottom: 15px; /* Popped up state */
    }

    .hole-front {
      position: absolute;
      bottom: 0;
      width: 100px;
      height: 35px;
      background: #5d4037;
      border-radius: 50% 50% 20% 20%;
      box-shadow: inset 0 8px 0 rgba(0,0,0,0.4), 0 -2px 5px rgba(0,0,0,0.3);
      z-index: 3;
    }

    .key-hint {
      position: absolute;
      bottom: 5px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.85rem;
      color: rgba(255,255,255,0.8);
      font-weight: 900;
      pointer-events: none;
      z-index: 4;
      text-shadow: 1px 1px 2px #000;
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
    }
    
    .btn-action { 
      background: #10b981; 
      color: #020617; 
      font-size: 1.2rem;
      padding: 1rem 3rem;
    }
    .btn-action:hover { 
      background: #34d399; 
      transform: scale(1.05);
    }

    .overlay-end {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 20;
      backdrop-filter: blur(5px);
    }

    @media (max-width: 850px) {
      .boards-container {
        flex-direction: column;
        gap: 2rem;
        align-items: center;
      }
      .top-bar {
        font-size: 1.5rem;
      }
      .timer {
        font-size: 2rem;
      }
      .score-display {
        font-size: 2rem;
      }
      .whack-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }

    @media (max-width: 450px) {
      .mole-grid {
        gap: 0.5rem;
        padding: 1rem;
        border-width: 8px;
      }
      .hole {
        width: 70px;
        height: 70px;
      }
      .hole-back {
        width: 55px;
        height: 20px;
        bottom: 12px;
      }
      .hole-front {
        width: 70px;
        height: 25px;
      }
      .mole-container {
        width: 60px;
        height: 70px;
        left: 5px;
        bottom: -70px;
      }
      .mole-container.active {
        bottom: 10px;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="whack-wrapper">
        <header className="whack-header">
          <button className="back-btn" onClick={() => navigate('/hub')}>
            <ArrowLeft size={20} /> Back to Game Library
          </button>
          <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '4px', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Hammer size={24} /> WHACK-A-MOLE
          </div>
          <button className="btn-outline" onClick={toggleBot} style={{ background: 'transparent', border: `1px solid ${isBotEnabled ? '#10b981' : '#3b82f6'}`, color: isBotEnabled ? '#10b981' : '#3b82f6', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isBotEnabled ? <Bot size={18} /> : <User size={18} />}
            {isBotEnabled ? 'Playing vs Bot' : '2 Player (Local)'}
          </button>
        </header>

        <div className="game-container" style={{ position: 'relative' }}>
          
          <div className="top-bar">
            <div className="score-display p1-score">{p1Score}</div>
            <div className="timer">00:{timeLeft.toString().padStart(2, '0')}</div>
            <div className="score-display p2-score">{p2Score}</div>
          </div>

          <div className="boards-container">
            <div className="player-section">
              <h2 style={{ color: '#22d3ee', margin: 0 }}>Player 1</h2>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Use Mouse or Keyboard (QWE, ASD, ZXC)</div>
              {renderGrid(1, p1Moles)}
            </div>

            <div className="player-section">
              <h2 style={{ color: '#f472b6', margin: 0 }}>{isBotEnabled ? 'Bot' : 'Player 2'}</h2>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{isBotEnabled ? 'Auto-whacks' : 'Use Keyboard (789, UIO, JKL)'}</div>
              {renderGrid(2, p2Moles)}
            </div>
          </div>

          {gameState === 'idle' && (
            <div className="overlay-end">
              <button className="btn btn-action" onClick={startGame}>
                <Hammer size={24} /> START DUEL
              </button>
            </div>
          )}

          {gameState === 'end' && (
            <div className="overlay-end">
              <div style={{ fontSize: '4rem', fontWeight: 900, color: '#f8fafc', marginBottom: '2rem', textShadow: '0 0 20px rgba(255,255,255,0.5)', fontFamily: 'Orbitron, sans-serif' }}>
                {resultText}
              </div>
              <button className="btn btn-action" onClick={startGame}>
                <RefreshCw size={24} /> Play Again
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
