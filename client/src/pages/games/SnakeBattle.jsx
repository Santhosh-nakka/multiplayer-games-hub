import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, Bot, User, Users } from 'lucide-react';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;
const SNAKE_SPEED = 12;
const TURN_SPEED = 0.12;
const SEG_SPACING = 2;
const INITIAL_LENGTH = 1;
const HEAD_RADIUS = 16;
const BODY_RADIUS = 14;
const FRUITS = ['🍎', '🍌', '🍉', '🍇', '🍓', '🍒', '🍍', '🥝'];

const generateFood = () => ({
  x: 50 + Math.random() * (CANVAS_WIDTH - 100),
  y: 50 + Math.random() * (CANVAS_HEIGHT - 100),
  radius: 12 + Math.random() * 4,
  type: FRUITS[Math.floor(Math.random() * FRUITS.length)],
  id: Math.random()
});

const PLAYER_CONFIG = [
  { id: 1, color: '#06b6d4', headColor: '#22d3ee', leftKey: 'a', rightKey: 'd', label: 'P1 (A/D)' },
  { id: 2, color: '#ef4444', headColor: '#f87171', leftKey: 'arrowleft', rightKey: 'arrowright', label: 'P2 (←/→)' },
  { id: 3, color: '#22c55e', headColor: '#4ade80', leftKey: 'v', rightKey: 'b', label: 'P3 (V/B)' },
  { id: 4, color: '#eab308', headColor: '#fde047', leftKey: '1', rightKey: '2', label: 'P4 (1/2)' },
  { id: 5, color: '#a855f7', headColor: '#c084fc', leftKey: 'i', rightKey: 'o', label: 'P5 (I/O)' },
];

const getInitialPlayers = (mode) => {
  const numPlayers = mode === 1 ? 2 : mode;
  
  const players = [];
  for (let i = 0; i < numPlayers; i++) {
    const config = PLAYER_CONFIG[i];
    const angle = (Math.PI * 2 / numPlayers) * i;
    const dist = 200;
    const startX = CANVAS_WIDTH / 2 + Math.cos(angle) * dist;
    const startY = CANVAS_HEIGHT / 2 + Math.sin(angle) * dist;
    
    players.push({
      id: config.id,
      x: startX,
      y: startY,
      angle: angle + Math.PI, 
      length: INITIAL_LENGTH,
      history: [],
      color: config.color,
      headColor: config.headColor,
      leftKey: config.leftKey,
      rightKey: config.rightKey,
      isBot: mode === 1 && i === 1,
      isDead: false,
      label: config.label
    });
  }
  return players;
};

export default function SnakeBattle() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const lastTimeRef = useRef(0);

  const [gameOver, setGameOver] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState(null);
  const [scores, setScores] = useState({});
  const [gameMode, setGameMode] = useState(1); 

  const stateRef = useRef({
    gameOver: false,
    gameMode: 1,
    players: getInitialPlayers(1),
    foods: Array.from({ length: 25 }).map(generateFood),
    keys: {},
    lastScores: {}
  });

  const handlePlayAgain = () => {
    const wasGameOver = stateRef.current.gameOver;
    
    stateRef.current = {
      ...stateRef.current,
      gameOver: false,
      players: getInitialPlayers(stateRef.current.gameMode),
      foods: Array.from({ length: 25 }).map(generateFood),
      keys: stateRef.current.keys,
      lastScores: {}
    };
    
    const initScores = {};
    stateRef.current.players.forEach(p => initScores[p.id] = p.length);
    setScores(initScores);
    setWinnerMessage(null);
    setGameOver(false);
    
    if (wasGameOver) {
      cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = 0;
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const changeMode = (mode) => {
    stateRef.current.gameMode = mode;
    setGameMode(mode);
    handlePlayAgain();
  };

  useEffect(() => {
    const handleKeyDown = (e) => { stateRef.current.keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e) => { stateRef.current.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const updatePhysics = (snake, keys, foods) => {
    if (snake.isDead) return;

    if (snake.isBot) {
      let targetX = CANVAS_WIDTH / 2;
      let targetY = CANVAS_HEIGHT / 2;
      
      let closestFood = null;
      let minFoodDist = Infinity;
      for (const food of foods) {
        let dx = Math.abs(food.x - snake.x);
        let dy = Math.abs(food.y - snake.y);
        if (dx > CANVAS_WIDTH / 2) dx = CANVAS_WIDTH - dx;
        if (dy > CANVAS_HEIGHT / 2) dy = CANVAS_HEIGHT - dy;
        const d = Math.hypot(dx, dy);
        if (d < minFoodDist) {
          minFoodDist = d;
          closestFood = food;
        }
      }
      
      if (closestFood) {
        let dx = closestFood.x - snake.x;
        let dy = closestFood.y - snake.y;
        if (Math.abs(dx) > CANVAS_WIDTH / 2) dx = dx > 0 ? dx - CANVAS_WIDTH : dx + CANVAS_WIDTH;
        if (Math.abs(dy) > CANVAS_HEIGHT / 2) dy = dy > 0 ? dy - CANVAS_HEIGHT : dy + CANVAS_HEIGHT;
        targetX = snake.x + dx;
        targetY = snake.y + dy;
      }

      const targetAngle = Math.atan2(targetY - snake.y, targetX - snake.x);
      let diff = targetAngle - snake.angle;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      while (diff > Math.PI) diff -= 2 * Math.PI;

      if (diff > 0.05) snake.angle += TURN_SPEED;
      else if (diff < -0.05) snake.angle -= TURN_SPEED;
    } else {
      if (keys[snake.leftKey]) snake.angle -= TURN_SPEED;
      if (keys[snake.rightKey]) snake.angle += TURN_SPEED;
    }

    snake.x += Math.cos(snake.angle) * SNAKE_SPEED;
    snake.y += Math.sin(snake.angle) * SNAKE_SPEED;

    if (snake.x < -HEAD_RADIUS) snake.x = CANVAS_WIDTH + HEAD_RADIUS;
    else if (snake.x > CANVAS_WIDTH + HEAD_RADIUS) snake.x = -HEAD_RADIUS;
    if (snake.y < -HEAD_RADIUS) snake.y = CANVAS_HEIGHT + HEAD_RADIUS;
    else if (snake.y > CANVAS_HEIGHT + HEAD_RADIUS) snake.y = -HEAD_RADIUS;

    snake.history.unshift({ x: snake.x, y: snake.y });
    const maxHistory = snake.length * SEG_SPACING;
    if (snake.history.length > maxHistory) {
      snake.history.pop();
    }
  };

  const drawSnake = (ctx, snake) => {
    if (snake.isDead) return;
    const time = Date.now();
    
    for (let i = snake.history.length - 1; i >= 0; i -= SEG_SPACING) {
      const pos = snake.history[i];
      if (!pos) continue;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, BODY_RADIUS, 0, Math.PI * 2);
      
      const grad = ctx.createRadialGradient(pos.x - 5, pos.y - 5, 2, pos.x, pos.y, BODY_RADIUS);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, snake.color);
      grad.addColorStop(1, '#000000');
      
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
      ctx.fill();
      
      ctx.save();
      ctx.translate(pos.x, pos.y);
      let angle = snake.angle;
      if (i > 0) {
        const nextPos = snake.history[i - 1];
        let dx = nextPos.x - pos.x;
        let dy = nextPos.y - pos.y;
        if (dx > CANVAS_WIDTH / 2) dx -= CANVAS_WIDTH;
        else if (dx < -CANVAS_WIDTH / 2) dx += CANVAS_WIDTH;
        if (dy > CANVAS_HEIGHT / 2) dy -= CANVAS_HEIGHT;
        else if (dy < -CANVAS_HEIGHT / 2) dy += CANVAS_HEIGHT;
        angle = Math.atan2(dy, dx);
      }
      ctx.rotate(angle);
      
      ctx.beginPath();
      ctx.moveTo(-BODY_RADIUS + 4, -BODY_RADIUS + 8);
      ctx.lineTo(BODY_RADIUS - 8, 0);
      ctx.lineTo(-BODY_RADIUS + 4, BODY_RADIUS - 8);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(snake.x, snake.y);
    ctx.rotate(snake.angle);

    const tongueExt = Math.sin(time / 100) * 8;
    if (tongueExt > 0) {
      ctx.beginPath();
      ctx.moveTo(HEAD_RADIUS, 0);
      ctx.lineTo(HEAD_RADIUS + 10 + tongueExt, 0);
      ctx.lineTo(HEAD_RADIUS + 15 + tongueExt, -4);
      ctx.moveTo(HEAD_RADIUS + 10 + tongueExt, 0);
      ctx.lineTo(HEAD_RADIUS + 15 + tongueExt, 4);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(HEAD_RADIUS + 2, 0);
    ctx.quadraticCurveTo(HEAD_RADIUS - 2, HEAD_RADIUS + 4, -HEAD_RADIUS + 4, HEAD_RADIUS);
    ctx.lineTo(-HEAD_RADIUS - 2, 0);
    ctx.lineTo(-HEAD_RADIUS + 4, -HEAD_RADIUS);
    ctx.quadraticCurveTo(HEAD_RADIUS - 2, -HEAD_RADIUS - 4, HEAD_RADIUS + 2, 0);
    
    const headGrad = ctx.createRadialGradient(-5, -5, 4, 0, 0, HEAD_RADIUS * 1.5);
    headGrad.addColorStop(0, '#ffffff');
    headGrad.addColorStop(0.3, snake.headColor);
    headGrad.addColorStop(1, '#000000');

    ctx.fillStyle = headGrad;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(4, -10, 5, 3, Math.PI / 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, 10, 5, 3, -Math.PI / 8, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.arc(5, -10, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, 10, 1.5, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath(); ctx.arc(HEAD_RADIUS - 4, -3, 1, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(HEAD_RADIUS - 4, 3, 1, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.font = '900 22px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    
    const text = `Lv${snake.length}`;
    ctx.strokeText(text, snake.x, snake.y - 35);
    ctx.fillText(text, snake.x, snake.y - 35);
  };

  const drawFood = (ctx, food) => {
    ctx.beginPath();
    ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 15;
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = `${food.radius * 2}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(food.type, food.x, food.y + 2); 
  };

  const checkCollisions = (state) => {
    const { players } = state;
    const active = players.filter(p => !p.isDead);
    const newlyDead = new Set();

    for (let i = 0; i < active.length; i++) {
      const snake = active[i];
      for (let j = 0; j < active.length; j++) {
        const other = active[j];
        if (snake.id === other.id) continue;

        let dx = Math.abs(snake.x - other.x);
        let dy = Math.abs(snake.y - other.y);
        if (dx > CANVAS_WIDTH / 2) dx = CANVAS_WIDTH - dx;
        if (dy > CANVAS_HEIGHT / 2) dy = CANVAS_HEIGHT - dy;
        if (Math.hypot(dx, dy) < HEAD_RADIUS * 2) {
           newlyDead.add(snake.id);
           newlyDead.add(other.id);
        }

        for (let k = 0; k < other.history.length; k += SEG_SPACING) {
          const pos = other.history[k];
          let hdx = Math.abs(snake.x - pos.x);
          let hdy = Math.abs(snake.y - pos.y);
          if (hdx > CANVAS_WIDTH / 2) hdx = CANVAS_WIDTH - hdx;
          if (hdy > CANVAS_HEIGHT / 2) hdy = CANVAS_HEIGHT - hdy;
          if (Math.hypot(hdx, hdy) < HEAD_RADIUS + BODY_RADIUS - 2) {
            newlyDead.add(snake.id);
            break;
          }
        }
      }
    }

    newlyDead.forEach(id => {
      const p = players.find(p => p.id === id);
      if (p) p.isDead = true;
    });
  };

  const checkFood = (snake, foods) => {
    if (snake.isDead) return;
    for (let i = foods.length - 1; i >= 0; i--) {
      const food = foods[i];
      let dx = Math.abs(snake.x - food.x);
      let dy = Math.abs(snake.y - food.y);
      if (dx > CANVAS_WIDTH / 2) dx = CANVAS_WIDTH - dx;
      if (dy > CANVAS_HEIGHT / 2) dy = CANVAS_HEIGHT - dy;
      if (Math.hypot(dx, dy) < HEAD_RADIUS + food.radius) {
        snake.length += 1;
        foods.splice(i, 1);
        foods.push(generateFood());
      }
    }
  };

  const gameLoop = (timestamp) => {
    const state = stateRef.current;
    if (state.gameOver) return;

    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const elapsed = timestamp - lastTimeRef.current;

    if (elapsed < 16.66) {
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    lastTimeRef.current = timestamp - (elapsed % 16.66);

    state.players.forEach(p => {
      updatePhysics(p, state.keys, state.foods);
      checkFood(p, state.foods);
    });

    const currentScores = {};
    let scoresChanged = false;
    state.players.forEach(p => {
      currentScores[p.id] = p.length;
      if (state.lastScores[p.id] !== p.length) {
        scoresChanged = true;
      }
    });
    if (scoresChanged) {
      setScores(currentScores);
      state.lastScores = currentScores;
    }

    checkCollisions(state);

    const alivePlayers = state.players.filter(p => !p.isDead);
    if (alivePlayers.length <= 1) {
      state.gameOver = true;
      setGameOver(true);
      if (alivePlayers.length === 1) {
        setWinnerMessage(`Player ${alivePlayers[0].id} Wins!`);
      } else {
        setWinnerMessage("It's a Draw!");
      }
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      const hexRadius = 20;
      const hexHeight = hexRadius * Math.sqrt(3);
      for (let y = 0; y < CANVAS_HEIGHT + hexHeight; y += hexHeight) {
        for (let x = 0, odd = 0; x < CANVAS_WIDTH + hexRadius * 3; x += hexRadius * 1.5, odd ^= 1) {
          const cx = x;
          const cy = y + (odd ? hexHeight / 2 : 0);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle_deg = 60 * i;
            const angle_rad = Math.PI / 180 * angle_deg;
            const px = cx + hexRadius * Math.cos(angle_rad);
            const py = cy + hexRadius * Math.sin(angle_rad);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      state.foods.forEach(f => drawFood(ctx, f));
      state.players.forEach(p => drawSnake(ctx, p));
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const initScores = {};
    stateRef.current.players.forEach(p => initScores[p.id] = p.length);
    setScores(initScores);
    
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/hub')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem', alignSelf: 'flex-start' }}
          >
            <ArrowLeft size={20} /> Back to Game Library
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={handlePlayAgain}
              style={{
                background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff',
                padding: '8px 20px', borderRadius: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '1rem', fontWeight: 'bold', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}
            >
              <RefreshCw size={18} /> Restart
            </button>
          </div>
        </div>

        {/* Center UI: Game Mode Toggle */}
        <div style={{ 
          display: 'flex', background: 'rgba(0, 0, 0, 0.5)', borderRadius: '30px', padding: '6px',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5), 0 4px 15px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          {[
            { mode: 1, label: '1P VS AI', icon: <Bot size={18} /> },
            { mode: 2, label: '2P', icon: <User size={18} /> },
            { mode: 3, label: '3P', icon: <Users size={18} /> },
            { mode: 4, label: '4P', icon: <Users size={18} /> },
            { mode: 5, label: '5P', icon: <Users size={18} /> },
          ].map(m => (
            <button
              key={m.mode}
              onClick={() => changeMode(m.mode)}
              style={{
                background: gameMode === m.mode ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'transparent',
                border: 'none', color: gameMode === m.mode ? '#fff' : 'rgba(255,255,255,0.6)',
                padding: '8px 16px', borderRadius: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '0.9rem', fontWeight: 'bold', transition: 'all 0.3s ease'
              }}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Dynamic Scoreboard */}
        <div style={{
          display: 'flex', gap: '1.5rem', background: 'rgba(15, 23, 42, 0.8)',
          padding: '1rem 2rem', borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
        }}>
          {stateRef.current.players.map((p, i) => (
            <React.Fragment key={p.id}>
              <div style={{ textAlign: 'center', opacity: p.isDead ? 0.3 : 1, transition: 'opacity 0.3s' }}>
                <div style={{ fontSize: '0.8rem', color: p.color, fontWeight: 'bold', textTransform: 'uppercase' }}>P{p.id}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>Lv{scores[p.id] || INITIAL_LENGTH}</div>
              </div>
              {i < stateRef.current.players.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                  VS
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2rem', position: 'relative' }}>
        <div style={{
          position: 'relative', padding: '8px', background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 40px rgba(6, 182, 212, 0.2)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{
              background: '#09090b', borderRadius: '16px', display: 'block',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,1)',
              opacity: gameOver ? 0.4 : 1, transition: 'opacity 0.5s ease'
            }}
          />

          {gameOver && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              animation: 'bounce 0.5s ease'
            }}>
              <div style={{
                background: 'rgba(0,0,0,0.85)', padding: '3rem 4rem', borderRadius: '24px',
                textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)'
              }}>
                <h2 style={{ fontSize: '4rem', margin: '0 0 1rem 0', color: '#eab308', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                  {winnerMessage}
                </h2>
                <button className="btn-primary" onClick={handlePlayAgain} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem', padding: '1rem 3rem' }}>
                  <RefreshCw size={24} /> Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        {!gameOver && (
          <>
            <div style={{ position: 'absolute', bottom: '-60px', display: 'flex', gap: '1.5rem', opacity: 0.7, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
              {stateRef.current.players.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: p.color, fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {p.isBot ? (
                    <><Bot size={16} /> AI Bot</>
                  ) : (
                    <>{p.label}</>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile virtual steering for P1 */}
            <div className="mobile-controls">
              <div className="d-pad" style={{ width: '100%', justifyContent: 'space-between', padding: '0 2rem' }}>
                <div 
                  className="mobile-btn" 
                  style={{ width: '70px', height: '70px', fontSize: '2rem' }}
                  onPointerDown={(e) => { e.preventDefault(); stateRef.current.keys['a'] = true; }} 
                  onPointerUp={(e) => { e.preventDefault(); stateRef.current.keys['a'] = false; }}
                  onPointerLeave={(e) => stateRef.current.keys['a'] = false}
                >↺</div>
                <div 
                  className="mobile-btn" 
                  style={{ width: '70px', height: '70px', fontSize: '2rem' }}
                  onPointerDown={(e) => { e.preventDefault(); stateRef.current.keys['d'] = true; }} 
                  onPointerUp={(e) => { e.preventDefault(); stateRef.current.keys['d'] = false; }}
                  onPointerLeave={(e) => stateRef.current.keys['d'] = false}
                >↻</div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
}
