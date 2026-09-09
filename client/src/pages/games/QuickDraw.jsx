import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Crosshair, Bot, User, Play } from 'lucide-react';

const Cowboy = ({ direction, state }) => {
  const isRight = direction === 'right';
  const transform = isRight ? 'scaleX(-1)' : 'none';
  
  return (
    <svg width="220" height="260" viewBox="0 0 220 260" style={{ transform, overflow: 'visible', filter: 'drop-shadow(4px 4px 2px rgba(0,0,0,0.4))' }}>
      <defs>
        <linearGradient id="coatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4a3b32" />
          <stop offset="100%" stopColor="#2c211b" />
        </linearGradient>
        <linearGradient id="hatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2c2c2c" />
          <stop offset="100%" stopColor="#111" />
        </linearGradient>
      </defs>

      {/* Shadow under feet */}
      <ellipse cx="110" cy="250" rx="40" ry="8" fill="rgba(0,0,0,0.3)" />

      {/* Back leg */}
      <rect x="90" y="170" width="16" height="70" fill="#1c2833" />
      <path d="M 85 240 L 108 240 L 108 230 L 90 225 Z" fill="#111" />
      
      {/* Coat back piece (duster) */}
      <path d="M 80 100 L 130 100 L 140 220 L 75 220 Z" fill="#2c211b" />

      {/* Front leg */}
      <rect x="110" y="170" width="18" height="75" fill="#2c3e50" />
      {/* Boot */}
      <path d="M 105 245 L 135 245 L 135 230 L 110 225 Z" fill="#222" />
      {/* Spur */}
      <circle cx="105" cy="240" r="3" fill="silver" />
      <path d="M 100 240 L 105 240" stroke="silver" strokeWidth="2" />

      {/* Torso & Vest */}
      <rect x="85" y="90" width="45" height="85" fill="#784212" rx="5" />
      {/* Shirt */}
      <rect x="95" y="90" width="15" height="80" fill="#e5e7e9" />
      {/* Vest */}
      <path d="M 85 90 L 100 150 L 85 175 Z" fill="#5c2e0e" />
      <path d="M 130 90 L 110 150 L 130 175 Z" fill="#5c2e0e" />

      {/* Belt and Buckle */}
      <rect x="82" y="165" width="50" height="12" fill="#111" rx="2" />
      <rect x="100" y="163" width="14" height="16" fill="#f1c40f" rx="2" />
      <rect x="103" y="166" width="8" height="10" fill="#111" />

      {/* Coat front pieces */}
      <path d="M 75 95 L 95 95 L 90 200 L 65 210 Z" fill="url(#coatGrad)" />
      
      {/* Gun Holster */}
      <path d="M 125 170 L 140 170 L 135 205 L 120 205 Z" fill="#3e2723" />
      <rect x="120" y="175" width="20" height="5" fill="#111" />
      
      {/* Head */}
      <rect x="90" y="50" width="35" height="45" fill="#f5cba7" rx="12" />
      
      {/* Bandana */}
      <path d="M 85 85 Q 107 110 130 85 L 130 95 Q 107 125 85 95 Z" fill="#800" />
      <path d="M 85 85 L 75 100 L 85 95 Z" fill="#600" />

      {/* Face details (eyes hidden in hat shadow) */}
      <rect x="90" y="50" width="35" height="20" fill="rgba(0,0,0,0.4)" rx="5" />
      
      {state !== 'dead' && (
         <g>
           {/* Glowing eye */}
           <circle cx="115" cy="62" r="2" fill="#fff" />
           <path d="M 110 58 L 122 62" stroke="#111" strokeWidth="2" />
           {/* Cigar */}
           <rect x="110" y="78" width="18" height="3" fill="#8b4513" transform="rotate(-15, 110, 78)" />
           <circle cx="128" cy="74" r="2" fill="#e74c3c" />
           {/* Smoke */}
           <path d="M 130 70 Q 135 60 128 50" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />
         </g>
      )}
      
      {state === 'dead' && (
         <g>
           {/* Dead eyes */}
           <path d="M 100 60 L 106 66 M 106 60 L 100 66" stroke="#111" strokeWidth="2" />
           <path d="M 112 60 L 118 66 M 118 60 L 112 66" stroke="#111" strokeWidth="2" />
           <path d="M 105 78 Q 110 73 115 78" stroke="#111" strokeWidth="2" fill="none" />
           {/* Bullet hole */}
           <circle cx="110" cy="120" r="5" fill="#800" />
           <circle cx="110" cy="120" r="2" fill="#300" />
           <path d="M 110 120 L 105 135 M 110 120 L 115 135" stroke="#800" strokeWidth="2" />
         </g>
      )}

      {/* Hat */}
      <ellipse cx="107" cy="48" rx="45" ry="10" fill="#1a1a1a" />
      <path d="M 85 48 Q 107 10 130 48" fill="url(#hatGrad)" />
      <ellipse cx="107" cy="46" rx="23" ry="5" fill="#111" />

      {/* Arm logic */}
      {(state === 'idle' || state === 'dead') && (
        <g>
          {/* Relaxed Arm */}
          <path d="M 95 100 Q 115 130 110 160" stroke="url(#coatGrad)" strokeWidth="18" strokeLinecap="round" fill="none" />
          {/* Hand */}
          <circle cx="108" cy="165" r="8" fill="#f5cba7" />
          {/* Gun in holster */}
          <path d="M 135 165 L 125 185 L 140 185 Z" fill="#222" />
        </g>
      )}
      
      {state === 'ready' && (
        <g>
          {/* Hovering Arm */}
          <path d="M 95 100 Q 130 120 125 155" stroke="url(#coatGrad)" strokeWidth="18" strokeLinecap="round" fill="none" />
          {/* Hand spread */}
          <circle cx="125" cy="160" r="8" fill="#f5cba7" />
          <path d="M 125 160 L 120 170 M 125 160 L 125 172 M 125 160 L 130 170" stroke="#f5cba7" strokeWidth="3" />
          {/* Gun in holster */}
          <path d="M 135 165 L 125 185 L 140 185 Z" fill="#222" />
        </g>
      )}
      
      {state === 'shoot' && (
        <g>
          {/* Shooting Arm straight forward */}
          <path d="M 95 105 L 160 105" stroke="url(#coatGrad)" strokeWidth="16" strokeLinecap="round" />
          {/* Hand */}
          <circle cx="165" cy="105" r="7" fill="#f5cba7" />
          
          {/* Revolver */}
          <path d="M 160 110 L 160 125 L 170 125 L 170 112 L 195 112 L 195 103 L 165 103 Z" fill="#222" />
          <circle cx="170" cy="115" r="4" fill="#111" />
          
          {/* Muzzle Flash */}
          <path d="M 197 107 L 215 95 L 205 110 L 220 115 L 205 120 L 215 135 L 197 115 Z" fill="#f1c40f" className="muzzle-flash" />
          <path d="M 197 107 L 205 100 L 200 110 L 210 115 L 200 117 L 205 125 L 197 112 Z" fill="#e67e22" className="muzzle-flash" />
        </g>
      )}
    </svg>
  );
};

export default function QuickDraw() {
  const navigate = useNavigate();
  // State: 'idle', 'ready', 'draw', 'end', 'match_over'
  const [gameState, setGameState] = useState('idle'); 
  const [result, setResult] = useState('');
  const [reactionTime, setReactionTime] = useState(0);
  const [isBotEnabled, setIsBotEnabled] = useState(true);
  
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundWinner, setRoundWinner] = useState(null); // 'P1' or 'P2' or null
  const [falseStart, setFalseStart] = useState(false);
  
  const timeoutRef = useRef(null);
  const drawTimeRef = useRef(0);
  
  const startGame = () => {
    setGameState('ready');
    setResult('');
    setReactionTime(0);
    setRoundWinner(null);
    setFalseStart(false);
    
    // Random delay between 2 and 6 seconds
    const delay = Math.floor(Math.random() * 4000) + 2000;
    
    timeoutRef.current = setTimeout(() => {
      setGameState('draw');
      drawTimeRef.current = Date.now();
    }, delay);
  };

  const handleEnd = useCallback((winner, isFalseStart = false) => {
    setGameState('end');
    clearTimeout(timeoutRef.current);
    
    const elapsed = Date.now() - drawTimeRef.current;
    
    let newP1Score = p1Score;
    let newP2Score = p2Score;

    if (isFalseStart) {
      setFalseStart(true);
      if (winner === 'P1') {
        setResult('P1 FALSE START! P2 WINS ROUND!');
        setRoundWinner('P2');
        newP2Score += 1;
      } else {
        setResult('P2 FALSE START! P1 WINS ROUND!');
        setRoundWinner('P1');
        newP1Score += 1;
      }
    } else {
      setReactionTime(elapsed);
      setRoundWinner(winner);
      if (winner === 'P1') {
        setResult('PLAYER 1 WINS ROUND!');
        newP1Score += 1;
      } else if (winner === 'P2') {
        setResult(isBotEnabled ? 'BOT WINS ROUND!' : 'PLAYER 2 WINS ROUND!');
        newP2Score += 1;
      }
    }

    setP1Score(newP1Score);
    setP2Score(newP2Score);

    if (newP1Score >= 2 || newP2Score >= 2) {
      setTimeout(() => {
         setGameState('match_over');
      }, 1500);
    }

  }, [isBotEnabled, p1Score, p2Score]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      
      if (gameState === 'ready') {
        if (key === 'a') handleEnd('P1', true);
        if (key === 'l' && !isBotEnabled) handleEnd('P2', true);
      } else if (gameState === 'draw') {
        if (key === 'a') handleEnd('P1', false);
        if (key === 'l' && !isBotEnabled) handleEnd('P2', false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleEnd, isBotEnabled]);

  // Bot Logic
  useEffect(() => {
    let botTimer;
    if (gameState === 'draw' && isBotEnabled) {
      // Bot reaction time: between 250ms and 450ms
      const botReaction = Math.floor(Math.random() * 200) + 250;
      botTimer = setTimeout(() => {
        handleEnd('P2', false);
      }, botReaction);
    } else if (gameState === 'ready' && isBotEnabled) {
      // Very small chance (5%) for bot false start
      if (Math.random() < 0.05) {
        const falseStartDelay = Math.floor(Math.random() * 2000) + 1000;
        botTimer = setTimeout(() => {
           handleEnd('P2', true);
        }, falseStartDelay);
      }
    }
    return () => clearTimeout(botTimer);
  }, [gameState, isBotEnabled, handleEnd]);

  const toggleBot = () => {
    setIsBotEnabled(!isBotEnabled);
    if (gameState !== 'idle') {
      clearTimeout(timeoutRef.current);
    }
    resetMatch();
  };

  const resetMatch = () => {
    setGameState('idle');
    setResult('');
    setP1Score(0);
    setP2Score(0);
    setCurrentRound(1);
    setRoundWinner(null);
  };

  const nextRound = () => {
    setCurrentRound(prev => prev + 1);
    startGame();
  };

  const getP1State = () => {
    if (gameState === 'idle') return 'idle';
    if (gameState === 'ready' || gameState === 'draw') return 'ready';
    if (gameState === 'end' || gameState === 'match_over') {
      if (roundWinner === 'P1') return 'shoot';
      if (roundWinner === 'P2') return 'dead';
    }
    return 'idle';
  };

  const getP2State = () => {
    if (gameState === 'idle') return 'idle';
    if (gameState === 'ready' || gameState === 'draw') return 'ready';
    if (gameState === 'end' || gameState === 'match_over') {
      if (roundWinner === 'P2') return 'shoot';
      if (roundWinner === 'P1') return 'dead';
    }
    return 'idle';
  };

  const styles = `
    .quickdraw-wrapper {
      min-height: 100vh;
      background: url('/images/quickdraw_bg.jpg') no-repeat center center;
      background-size: cover;
      color: #3b2f2f;
      display: flex;
      flex-direction: column;
      font-family: 'Courier New', Courier, monospace;
      position: relative;
      overflow: hidden;
    }
    


    .quickdraw-header {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(139, 69, 19, 0.9); 
      border-bottom: 4px solid #5c2e0e;
      color: #fff;
      z-index: 10;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ffdead;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 900;
      transition: color 0.2s;
    }
    .back-btn:hover { color: white; }

    .game-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      gap: 2rem;
      position: relative;
      z-index: 10;
    }

    .score-board {
      display: flex;
      gap: 3rem;
      background: rgba(92, 46, 14, 0.8);
      padding: 1rem 3rem;
      border-radius: 10px;
      border: 4px solid #8b4513;
      color: white;
      font-size: 1.5rem;
      font-weight: 900;
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }
    .score {
      font-size: 2.5rem;
      color: #f1c40f;
    }

    .duel-scene {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 900px;
      margin-top: 2rem;
      padding: 2rem;
      border-bottom: 4px solid #5c2e0e;
      position: relative;
    }

    .cowboy-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .bullet-line {
      position: absolute;
      top: 100px;
      left: 20%;
      right: 20%;
      height: 2px;
      background: rgba(0,0,0,0);
      z-index: 5;
    }
    
    .bullet-p1 {
      position: absolute;
      left: 0;
      top: -2px;
      width: 20px;
      height: 6px;
      background: #f1c40f;
      border-radius: 10px;
      animation: shootP1 0.15s linear forwards;
    }
    .bullet-p2 {
      position: absolute;
      right: 0;
      top: -2px;
      width: 20px;
      height: 6px;
      background: #f1c40f;
      border-radius: 10px;
      animation: shootP2 0.15s linear forwards;
    }

    @keyframes shootP1 {
      0% { left: 0%; opacity: 1; }
      100% { left: 100%; opacity: 0; }
    }
    @keyframes shootP2 {
      0% { right: 0%; opacity: 1; }
      100% { right: 100%; opacity: 0; }
    }
    
    .muzzle-flash {
      animation: flash 0.1s alternate 3;
    }
    @keyframes flash {
      0% { opacity: 1; transform: scale(1); }
      100% { opacity: 0.5; transform: scale(1.2); }
    }

    .status-text {
      font-size: 4rem;
      font-weight: 900;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-align: center;
      transition: all 0.2s;
      text-shadow: 3px 3px 0px #fff, 6px 6px 0px #8b4513;
    }

    .status-idle { color: #5c2e0e; }
    .status-ready { color: #e67e22; text-shadow: 2px 2px 0px #000, 4px 4px 0px #5c2e0e; }
    .status-draw { color: #e74c3c; transform: scale(1.5); text-shadow: 3px 3px 0px #000, 6px 6px 0px #5c2e0e; animation: pulse 0.5s infinite alternate; }
    
    @keyframes pulse {
      0% { transform: scale(1.3); }
      100% { transform: scale(1.5); }
    }

    .status-end { color: #8b0000; font-size: 2.5rem; text-shadow: 2px 2px 0px #fff, 4px 4px 0px #000; }

    .instructions {
      position: absolute;
      bottom: 2rem;
      left: 2rem;
      right: 2rem;
      display: flex;
      justify-content: space-between;
      pointer-events: none;
    }

    .player-card {
      background: #deb887;
      padding: 1.5rem 2rem;
      border-radius: 8px;
      border: 4px solid #8b4513;
      text-align: center;
      min-width: 220px;
      pointer-events: auto;
      box-shadow: 4px 4px 0 rgba(0,0,0,0.3);
    }

    .key-hint {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.5rem 1.5rem;
      background: #8b4513;
      border-radius: 4px;
      font-size: 1.5rem;
      font-weight: 900;
      color: white;
      border: 2px solid #5c2e0e;
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem 2.5rem;
      border-radius: 0.5rem;
      font-weight: 900;
      cursor: pointer;
      border: 4px solid #5c2e0e;
      transition: all 0.2s;
      font-size: 1.2rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      box-shadow: 4px 4px 0 #5c2e0e;
    }
    
    .btn-action { 
      background: #d2691e; 
      color: #fff; 
    }
    .btn-action:hover { 
      background: #cd853f; 
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0 #5c2e0e;
    }
    .btn-outline {
      background: #deb887;
      color: #5c2e0e;
    }
    
    .match-over-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    
    .match-over-text {
      font-size: 5rem;
      color: #f1c40f;
      text-shadow: 4px 4px 0 #d35400, 8px 8px 0 #000;
      margin-bottom: 2rem;
      animation: bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    @keyframes bounceIn {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); opacity: 1; }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="quickdraw-wrapper">
        
        <header className="quickdraw-header">
          <button className="back-btn" onClick={() => navigate('/hub')}>
            <ArrowLeft size={20} /> Back to Game Library
          </button>
          <div style={{ fontWeight: 900, fontSize: '1.8rem', letterSpacing: '4px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', textShadow: '2px 2px 0 #000' }}>
            <Crosshair size={28} /> WILD WEST QUICK DRAW
          </div>
          <button className="btn btn-outline" onClick={toggleBot} style={{ padding: '0.5rem 1rem', fontSize: '1rem', border: '2px solid #5c2e0e', boxShadow: '2px 2px 0 #5c2e0e' }}>
            {isBotEnabled ? <Bot size={18} /> : <User size={18} />}
            {isBotEnabled ? 'Playing vs Bot' : '2 Player (Local)'}
          </button>
        </header>

        <div className="game-container">
          
          <div className="score-board">
            <div style={{ textAlign: 'center' }}>
              <div>P1 SCORE</div>
              <div className="score">{p1Score}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '2rem', color: '#d35400' }}>
              ROUND {currentRound}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div>{isBotEnabled ? 'BOT SCORE' : 'P2 SCORE'}</div>
              <div className="score">{p2Score}</div>
            </div>
          </div>

          <div className="duel-scene">
            <div className="cowboy-container">
               <Cowboy direction="left" state={getP1State()} />
            </div>
            
            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100px' }}>
               
               <div className="bullet-line">
                 {(gameState === 'end' || gameState === 'match_over') && roundWinner === 'P1' && !falseStart && <div className="bullet-p1"></div>}
                 {(gameState === 'end' || gameState === 'match_over') && roundWinner === 'P2' && !falseStart && <div className="bullet-p2"></div>}
               </div>

               <div style={{ position: 'absolute', top: '-60px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {gameState === 'idle' && (
                    <>
                      <div className="status-text status-idle">STANDOFF</div>
                      <button className="btn btn-action" onClick={startGame} style={{ marginTop: '2rem' }}>
                        <Play fill="white" size={20} /> Ready
                      </button>
                    </>
                  )}

                  {gameState === 'ready' && (
                    <div className="status-text status-ready">STEADY...</div>
                  )}

                  {gameState === 'draw' && (
                    <div className="status-text status-draw">DRAW!</div>
                  )}

                  {gameState === 'end' && (
                    <>
                      <div className="status-text status-end">
                        {result}
                      </div>
                      {reactionTime > 0 && (
                        <div style={{ fontSize: '1.5rem', color: '#8b0000', fontWeight: '900', marginTop: '0.5rem', textShadow: '1px 1px 0 #fff' }}>
                          Reaction Time: {reactionTime} ms
                        </div>
                      )}
                      <button className="btn btn-action" onClick={nextRound} style={{ marginTop: '1.5rem', zIndex: 10 }}>
                        Next Round <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }}/>
                      </button>
                    </>
                  )}
               </div>
            </div>

            <div className="cowboy-container">
               <Cowboy direction="right" state={getP2State()} />
            </div>
          </div>

          <div className="instructions">
            <div className="player-card">
              <h3 style={{ color: '#5c2e0e', margin: '0 0 1rem 0', fontSize: '1.5rem' }}>The Law (P1)</h3>
              <div style={{ color: '#8b4513', fontSize: '1rem', fontWeight: 'bold' }}>Press when DRAW appears</div>
              <div className="key-hint">A</div>
            </div>

            <div className="player-card">
              <h3 style={{ color: '#5c2e0e', margin: '0 0 1rem 0', fontSize: '1.5rem' }}>{isBotEnabled ? 'The Bandit (Bot)' : 'The Bandit (P2)'}</h3>
              <div style={{ color: '#8b4513', fontSize: '1rem', fontWeight: 'bold' }}>{isBotEnabled ? 'Has lightning reflexes' : 'Press when DRAW appears'}</div>
              <div className="key-hint" style={{ opacity: isBotEnabled ? 0.5 : 1 }}>L</div>
            </div>
          </div>
          
          {gameState === 'match_over' && (
            <div className="match-over-overlay">
              <div className="match-over-text">
                {p1Score >= 2 ? 'PLAYER 1 WINS THE MATCH!' : (isBotEnabled ? 'BOT WINS THE MATCH!' : 'PLAYER 2 WINS THE MATCH!')}
              </div>
              <button className="btn btn-action" onClick={resetMatch} style={{ padding: '1.5rem 3rem', fontSize: '1.5rem' }}>
                <RefreshCw size={28} /> Play Again
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
