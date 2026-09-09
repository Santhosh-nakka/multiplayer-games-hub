import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Bot, User } from 'lucide-react';

export default function PingPong() {
  const navigate = useNavigate();
  
  const boardRef = useRef(null);
  const playerRef = useRef(null);
  const enemyRef = useRef(null);
  const ballRef = useRef(null);
  const shadowRef = useRef(null);
  
  const [isBotEnabled, setIsBotEnabled] = useState(true);
  const [playerScore, setPlayerScore] = useState(0);
  const [enemyScore, setEnemyScore] = useState(0);
  const [winner, setWinner] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');

  // Game dimensions
  const TABLE_W = 500;
  const TABLE_H = 800;
  const PADDLE_W = 80;
  const PADDLE_H = 15;
  const BALL_R = 12;

  const gameState = useRef({
    player: { x: TABLE_W/2 - PADDLE_W/2, y: TABLE_H - 30, score: 0 },
    enemy: { x: TABLE_W/2 - PADDLE_W/2, y: 15, score: 0 },
    ball: { x: TABLE_W/2, y: TABLE_H/2, z: 150, speedX: 5, speedY: 5, speedZ: 5, speed: 7, gravity: 0.5 },
    keys: {},
    isPlaying: true,
    difficulty: 'medium'
  });

  useEffect(() => {
    gameState.current.difficulty = difficulty;
  }, [difficulty]);

  const toggleBot = () => setIsBotEnabled(prev => !prev);

  const resetGame = () => {
    const state = gameState.current;
    state.player.score = 0;
    state.enemy.score = 0;
    state.isPlaying = true;
    setPlayerScore(0);
    setEnemyScore(0);
    setWinner(null);
    resetBall();
  };

  const resetBall = () => {
    const state = gameState.current;
    
    const diff = state.difficulty || 'medium';
    const baseSpeed = diff === 'easy' ? 6 : diff === 'medium' ? 9 : 13;

    const totalPoints = state.player.score + state.enemy.score;
    // Serve alternates every 2 points, unless deuce (10-10 or higher) where it alternates every 1 point.
    const isPlayerServe = totalPoints >= 20 ? (totalPoints % 2 === 0) : (Math.floor(totalPoints / 2) % 2 === 0);
    
    state.ball.z = 50; 
    state.ball.speed = baseSpeed;
    state.ball.speedX = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * (baseSpeed / 3));

    if (isPlayerServe) {
      state.ball.x = state.player.x + PADDLE_W / 2;
      state.ball.y = state.player.y - BALL_R - 10;
      state.ball.speedY = -baseSpeed;
      const t_bounce = Math.abs(state.ball.y - 300) / baseSpeed;
      state.ball.speedZ = (4 * 50) / t_bounce;
      state.ball.gravity = (2 * state.ball.speedZ) / t_bounce;
    } else {
      state.ball.x = state.enemy.x + PADDLE_W / 2;
      state.ball.y = state.enemy.y + PADDLE_H + BALL_R + 10;
      state.ball.speedY = baseSpeed;
      const t_bounce = Math.abs(500 - state.ball.y) / baseSpeed;
      state.ball.speedZ = (4 * 50) / t_bounce;
      state.ball.gravity = (2 * state.ball.speedZ) / t_bounce;
    }
  };

  useEffect(() => {
    let animationFrameId;

    const handleKeyDown = (e) => { gameState.current.keys[e.key] = true; };
    const handleKeyUp = (e) => { gameState.current.keys[e.key] = false; };
    
    const handlePointerMove = (e) => {
      if(!boardRef.current) return;
      // Prevent scrolling while playing
      if (e.type === 'touchmove') e.preventDefault();
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const state = gameState.current;
      const containerRect = boardRef.current.parentElement.getBoundingClientRect();
      const relativeX = clientX - containerRect.left;
      let mappedX = (relativeX / containerRect.width) * TABLE_W;
      
      const relativeY = clientY - containerRect.top;
      let mappedY = (relativeY / containerRect.height) * TABLE_H;
      
      mappedX -= (PADDLE_W / 2);
      
      if (mappedX < 0) mappedX = 0;
      if (mappedX + PADDLE_W > TABLE_W) mappedX = TABLE_W - PADDLE_W;
      
      // Restrict Y to the player's half of the table (from net down to back edge)
      if (mappedY < TABLE_H / 2 + 20) mappedY = TABLE_H / 2 + 20;
      if (mappedY > TABLE_H - 10) mappedY = TABLE_H - 10;
      
      state.player.x = mappedX;
      state.player.y = mappedY;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });

    const update = () => {
      const state = gameState.current;
      if (!state.isPlaying) return;

      // Calculate paddle velocities for spin
      state.player.dx = state.player.x - (state.player.lastX || state.player.x);
      state.player.lastX = state.player.x;
      state.enemy.dx = state.enemy.x - (state.enemy.lastX || state.enemy.x);
      state.enemy.lastX = state.enemy.x;

      // Update ball
      state.ball.x += state.ball.speedX;
      state.ball.y += state.ball.speedY;
      state.ball.z += state.ball.speedZ;
      state.ball.speedZ -= state.ball.gravity;

      // Floor bounce
      if (state.ball.z < 0) {
        state.ball.z = 0;
        state.ball.speedZ = Math.abs(state.ball.speedZ) * 0.85;
      }

      // Bounce left/right walls
      if (state.ball.x - BALL_R < 0) {
        state.ball.x = BALL_R;
        state.ball.speedX = Math.abs(state.ball.speedX);
      } else if (state.ball.x + BALL_R > TABLE_W) {
        state.ball.x = TABLE_W - BALL_R;
        state.ball.speedX = -Math.abs(state.ball.speedX);
      }

      // Paddles Collision
      let hitPaddle = null;
      if (state.ball.speedY > 0 && state.ball.y + BALL_R > state.player.y && state.ball.y - BALL_R < state.player.y + PADDLE_H) {
        if (state.ball.x + BALL_R > state.player.x && state.ball.x - BALL_R < state.player.x + PADDLE_W) {
          hitPaddle = state.player;
        }
      } else if (state.ball.speedY < 0 && state.ball.y - BALL_R < state.enemy.y + PADDLE_H && state.ball.y + BALL_R > state.enemy.y) {
        if (state.ball.x + BALL_R > state.enemy.x && state.ball.x - BALL_R < state.enemy.x + PADDLE_W) {
          hitPaddle = state.enemy;
        }
      }

      if (hitPaddle) {
        let collidePoint = (state.ball.x - (hitPaddle.x + PADDLE_W / 2));
        collidePoint = Math.max(-1, Math.min(1, collidePoint / (PADDLE_W / 2)));
        const angleRad = (Math.PI / 4) * collidePoint;
        const direction = state.ball.y > TABLE_H / 2 ? -1 : 1;
        
        state.ball.speed += 0.4; // speed up
        
        // Add spin (english) based on paddle's lateral movement
        const spinEffect = (hitPaddle.dx || 0) * 0.25;
        
        state.ball.speedX = (state.ball.speed * Math.sin(angleRad)) + spinEffect;
        state.ball.speedY = direction * state.ball.speed * Math.cos(angleRad);
        
        // Arc physics: make the ball bounce just past the net
        let distanceToBounce;
        if (direction === -1) {
          distanceToBounce = Math.abs(state.player.y - 300);
        } else {
          distanceToBounce = Math.abs(500 - state.enemy.y);
        }
        
        const t_bounce = distanceToBounce / Math.abs(state.ball.speedY);
        const TARGET_HEIGHT = 50; // Just above net height
        state.ball.speedZ = (4 * TARGET_HEIGHT) / t_bounce;
        state.ball.gravity = (2 * state.ball.speedZ) / t_bounce;
        
        if (state.ball.z < 0) state.ball.z = 0;
        
        if(direction === -1) {
           state.ball.y = state.player.y - BALL_R;
        } else {
           state.ball.y = state.enemy.y + PADDLE_H + BALL_R;
        }
      }

      // Scoring (Ping Pong rules: up to 11, win by 2)
      if (state.ball.y - BALL_R > TABLE_H) {
        state.enemy.score++;
        setEnemyScore(state.enemy.score);
        if (state.enemy.score >= 11 && state.enemy.score - state.player.score >= 2) {
          setWinner(isBotEnabled ? 'Bot Wins!' : 'Player 2 Wins!');
          state.isPlaying = false;
        } else resetBall();
      } else if (state.ball.y + BALL_R < 0) {
        state.player.score++;
        setPlayerScore(state.player.score);
        if (state.player.score >= 11 && state.player.score - state.enemy.score >= 2) {
          setWinner('Player 1 Wins!');
          state.isPlaying = false;
        } else resetBall();
      }

      // Enemy Bot logic
      if (isBotEnabled) {
        const diff = state.difficulty || 'medium';
        const botSpeed = diff === 'easy' ? 4.5 : diff === 'medium' ? 6.5 : 11;
        
        const enemyCenter = state.enemy.x + PADDLE_W / 2;
        if (state.ball.speedY < 0) {
            // Ball moving towards bot: track ball precisely
            if (enemyCenter < state.ball.x - 10) state.enemy.x += botSpeed;
            else if (enemyCenter > state.ball.x + 10) state.enemy.x -= botSpeed;
        } else {
            // Ball moving away from bot: return to center slowly
            if (enemyCenter < TABLE_W/2 - 10) state.enemy.x += botSpeed/2;
            else if (enemyCenter > TABLE_W/2 + 10) state.enemy.x -= botSpeed/2;
        }
      } else {
        if (state.keys['ArrowLeft']) state.enemy.x -= 8;
        if (state.keys['ArrowRight']) state.enemy.x += 8;
      }
      
      if (state.enemy.x < 0) state.enemy.x = 0;
      if (state.enemy.x + PADDLE_W > TABLE_W) state.enemy.x = TABLE_W - PADDLE_W;
    };

    const draw = () => {
      const state = gameState.current;
      if(playerRef.current) playerRef.current.style.transform = `translateX(${state.player.x}px) translateY(${state.player.y}px)`;
      if(enemyRef.current) enemyRef.current.style.transform = `translateX(${state.enemy.x}px) translateY(${state.enemy.y}px)`;
      
      if(ballRef.current) {
        ballRef.current.style.transform = `translateX(${state.ball.x - BALL_R}px) translateY(${state.ball.y - BALL_R}px) translateZ(${12 + state.ball.z}px) rotateX(-60deg)`;
      }
      if(shadowRef.current) {
        const scale = Math.max(0.2, 1 - state.ball.z / 300);
        shadowRef.current.style.transform = `translateX(${state.ball.x - BALL_R}px) translateY(${state.ball.y - BALL_R}px) scale(${scale})`;
        shadowRef.current.style.opacity = scale;
      }
    };

    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, [isBotEnabled]);

  const styles = `
    .pong-wrapper {
      min-height: 100vh;
      background: #E0705E; 
      color: white;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', system-ui, sans-serif;
      overflow: hidden;
    }

    .pong-header {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0,0,0, 0.2);
      z-index: 100;
    }

    .pong-back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-weight: bold;
    }

    .pong-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    
    .hud {
      position: absolute;
      top: 50px;
      left: 0; right: 0;
      display: flex;
      justify-content: space-between;
      padding: 0 50px;
      pointer-events: none;
      z-index: 50;
    }
    
    .hud-side {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    
    .flag-circle {
      width: 80px; height: 80px;
      border-radius: 50%;
      background: white;
      border: 4px solid #f1f5f9;
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem; font-weight: bold; color: black;
    }
    
    .score-text {
      font-size: 5rem;
      font-weight: 900;
      color: white;
      -webkit-text-stroke: 3px black;
      text-shadow: 0 10px 10px rgba(0,0,0,0.3);
    }
    
    /* Background Walls */
    .wall-container {
      position: absolute;
      top: 50px;
      width: 100%;
      display: flex;
      justify-content: center;
      gap: 20px;
      pointer-events: none;
    }
    .wall-panel {
      width: 200px;
      height: 120px;
      background: #2A61B5;
      border-radius: 10px;
      border: 4px solid rgba(255,255,255,0.2);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: white; opacity: 0.9;
    }
    .wall-stars { letter-spacing: 5px; font-size: 1.2rem; }
    .wall-num { font-size: 2rem; font-weight: 900; }

    /* 3D Scene */
    .scene-container {
      perspective: 1200px;
      margin-top: 100px;
      width: 600px;
    }
    
    .table-3d {
      width: ${TABLE_W}px;
      height: ${TABLE_H}px;
      background: #4568C3; 
      border: 10px solid white;
      margin: 0 auto;
      transform: rotateX(60deg);
      transform-style: preserve-3d;
      box-shadow: 0 30px 40px rgba(0,0,0,0.5);
      position: relative;
    }
    
    .table-3d::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 0; bottom: 0;
      width: 4px;
      background: white;
      transform: translateX(-50%);
    }

    .net-3d {
      position: absolute;
      left: -15px; right: -15px;
      top: 50%;
      height: 30px;
      background: repeating-linear-gradient(
        45deg,
        rgba(255,255,255,0.4),
        rgba(255,255,255,0.4) 2px,
        transparent 2px,
        transparent 4px
      ), rgba(0,0,0,0.2);
      border-top: 3px solid white;
      transform-origin: bottom center;
      transform: rotateX(-90deg) translateY(15px);
      z-index: 5;
    }

    .paddle-3d {
      position: absolute;
      top: 0; left: 0;
      width: ${PADDLE_W}px; height: ${PADDLE_H}px;
      transform-style: preserve-3d;
      z-index: 10;
    }
    .paddle-visual {
      position: absolute;
      bottom: 0; left: 50%;
      transform-origin: bottom center;
      transform: translateX(-50%) rotateX(-60deg);
      display: flex; flex-direction: column; align-items: center;
    }
    .paddle-blade {
      width: 60px; height: 60px;
      background: #E3242B;
      border-radius: 50%;
      border: 2px solid #b91c22;
      box-shadow: inset -5px -5px 15px rgba(0,0,0,0.3);
    }
    .paddle-handle {
      width: 14px; height: 30px;
      background: #8B5A2B;
      border-radius: 4px;
      margin-top: -5px;
      z-index: -1;
    }

    .ball-3d {
      position: absolute;
      top: 0; left: 0;
      width: ${BALL_R * 2}px; height: ${BALL_R * 2}px;
      background: radial-gradient(circle at 30% 30%, #fff, #ffdf00 60%);
      border-radius: 50%;
      box-shadow: inset -2px -2px 5px rgba(0,0,0,0.2);
      z-index: 8;
    }
    .ball-shadow {
      position: absolute;
      top: 0; left: 0;
      width: ${BALL_R * 2}px; height: ${BALL_R * 2}px;
      background: rgba(0,0,0,0.3);
      border-radius: 50%;
      filter: blur(2px);
      z-index: 4;
    }

    .wall-3d-left {
      position: absolute;
      top: 0; bottom: 0; left: 0;
      width: 40px;
      background: rgba(255, 255, 255, 0.15);
      border-right: 4px solid rgba(255,255,255,0.8);
      border-top: 4px solid rgba(255,255,255,0.8);
      transform-origin: left center;
      transform: rotateY(-90deg);
      z-index: 6;
      box-shadow: inset 0 0 10px rgba(255,255,255,0.2);
    }

    .wall-3d-right {
      position: absolute;
      top: 0; bottom: 0; right: 0;
      width: 40px;
      background: rgba(255, 255, 255, 0.15);
      border-left: 4px solid rgba(255,255,255,0.8);
      border-top: 4px solid rgba(255,255,255,0.8);
      transform-origin: right center;
      transform: rotateY(90deg);
      z-index: 6;
      box-shadow: inset 0 0 10px rgba(255,255,255,0.2);
    }

    .controls-panel {
      background: rgba(0,0,0,0.5);
      padding: 15px 30px;
      border-radius: 20px;
      display: flex;
      gap: 15px;
      z-index: 100;
    }
    .btn {
      padding: 10px 20px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer;
      display: flex; align-items: center; gap: 8px;
    }
    .btn-primary { background: white; color: black; }
    .btn-primary:hover { background: #f1f5f9; }
    .btn-outline { background: transparent; border: 2px solid white; color: white; }

    .winner-overlay {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.8);
      z-index: 200;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="pong-wrapper">
        <header className="pong-header">
          <button className="pong-back-btn" onClick={() => navigate('/hub')}>
            <ArrowLeft size={20} /> Back to Library
          </button>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            TABLE TENNIS 3D
          </div>
        </header>

        <div className="wall-container">
          {[1,2,3,4].map(i => (
             <div key={i} className="wall-panel">
                <div className="wall-stars">★★★</div>
                <div className="wall-num">40</div>
             </div>
          ))}
        </div>

        <main className="pong-main">
          
          <div className="hud">
            <div className="hud-side">
               <div className="flag-circle" style={{background: `url('https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg') center/cover`}}></div>
               <div className="score-text">{playerScore}</div>
            </div>
            <div className="hud-side">
               <div className="flag-circle">
                 <div style={{width: '40px', height: '40px', background: '#E3242B', borderRadius: '50%'}}></div>
               </div>
               <div className="score-text">{enemyScore}</div>
            </div>
          </div>
          
          <div className="scene-container" ref={boardRef}>
            <div className="table-3d">
              <div className="wall-3d-left"></div>
              <div className="wall-3d-right"></div>
              <div className="net-3d"></div>
              
              <div className="ball-shadow" ref={shadowRef}></div>
              <div className="ball-3d" ref={ballRef}></div>
              
              <div className="paddle-3d" ref={enemyRef}>
                 <div className="paddle-visual">
                    <div className="paddle-blade"></div>
                    <div className="paddle-handle"></div>
                 </div>
              </div>
              
              <div className="paddle-3d" ref={playerRef}>
                 <div className="paddle-visual">
                    <div className="paddle-blade"></div>
                    <div className="paddle-handle"></div>
                 </div>
              </div>
            </div>
          </div>

          {winner && (
            <div className="winner-overlay">
              <h2 className="score-text" style={{marginBottom: '2rem', WebkitTextStroke: '0px'}}>{winner}</h2>
              <button className="btn btn-primary" onClick={resetGame} style={{fontSize: '1.5rem', padding: '15px 30px'}}>
                Play Again
              </button>
            </div>
          )}

        </main>
        
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'absolute', top: '220px', zIndex: 150 }}>
          <div className="controls-panel">
            <button className="btn btn-primary" onClick={resetGame}>
              <RefreshCw size={18} /> Reset
            </button>
            <button className="btn btn-outline" onClick={toggleBot}>
              {isBotEnabled ? <Bot size={18} /> : <User size={18} />}
              {isBotEnabled ? 'Playing Bot' : '2 Player'}
            </button>
            
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginLeft: '20px', color: 'white' }}>
              <span style={{fontWeight: 'bold', marginRight: '10px'}}>Difficulty:</span>
              <button className="btn btn-outline" style={{padding: '5px 10px', background: difficulty==='easy'?'white':'', color: difficulty==='easy'?'black':''}} onClick={() => { setDifficulty('easy'); resetGame(); }}>Easy</button>
              <button className="btn btn-outline" style={{padding: '5px 10px', background: difficulty==='medium'?'white':'', color: difficulty==='medium'?'black':''}} onClick={() => { setDifficulty('medium'); resetGame(); }}>Med</button>
              <button className="btn btn-outline" style={{padding: '5px 10px', background: difficulty==='hard'?'white':'', color: difficulty==='hard'?'black':''}} onClick={() => { setDifficulty('hard'); resetGame(); }}>Hard</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
