import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Users, Trophy, Hash, CircleDot, Worm, Ship, Layers, Crown, MonitorPlay, Car, Swords, Skull, Grid3X3, AlignEndHorizontal, Zap, LayoutGrid, Hammer } from 'lucide-react';
import TicTacToeIcon from '../components/TicTacToeIcon';
import RockPaperScissorsIcon from '../components/RockPaperScissorsIcon';
import Connect4Icon from '../components/Connect4Icon';

const games = [
  { id: 'tic-tac-toe', rank: '#1', title: 'Tic-Tac-Toe', icon: TicTacToeIcon, color: '#ef4444' },
  { id: 'rock-paper-scissors', rank: '#2', title: 'Rock Paper Scissors', icon: RockPaperScissorsIcon, color: '#f59e0b' },
  { id: 'connect-4', rank: '#3', title: 'Connect 4', icon: Connect4Icon, color: '#3b82f6' },
  { id: 'snake-battle', rank: '#4', title: 'Snake Battle', image: '/images/snake_battle_thumbnail.png', icon: Worm, color: '#22c55e' },
  { id: 'battleship', rank: '#5', title: 'Battleship', image: '/images/battleship_bg_straight.png', icon: Ship, color: '#3b82f6' },
  { id: 'uno', rank: '#6', title: 'UNO', image: '/images/uno_bg_new.jpg', icon: Layers, color: '#ec4899' },
  { id: 'chess', rank: '#7', title: 'Chess', image: '/images/chess_bg.png', icon: Crown, color: '#a855f7' },
  { id: 'pong', rank: '#8', title: 'Pong', image: '/images/pingpong_thumbnail.png', icon: MonitorPlay, color: '#14b8a6' },
  { id: 'simple-racing', rank: '#9', title: 'Racing Game', image: '/images/racing_thumbnail.png', icon: Car, color: '#f97316' },
  { id: 'hangman', rank: '#10', title: 'Hangman', image: '/images/hangman_thumbnail.png', icon: Skull, color: '#f43f5e' },
  { id: 'wordle', rank: '#11', title: 'Wordle (vs Bot)', image: '/images/wordle_thumbnail.png', icon: Grid3X3, color: '#10b981' },
  { id: 'nim', rank: '#12', title: 'Nim (Math Game)', image: '/images/nim_thumbnail.jpg', icon: AlignEndHorizontal, color: '#fde047' },
  { id: 'quickdraw', rank: '#13', title: 'Quick Draw', image: '/images/quickdraw_thumbnail.jpg', icon: Zap, color: '#ef4444' },
  { id: '2048', rank: '#14', title: '2048', image: '/images/2048_thumbnail.jpg', icon: LayoutGrid, color: '#eab308' },
  { id: 'whack-a-mole', rank: '#15', title: 'Whack-A-Mole', image: '/images/whack_thumbnail.jpg', icon: Hammer, color: '#a855f7' },
];

export default function Hub() {
  const [hasFallen, setHasFallen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <nav className="nav-bar">
        <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
          <span className="wave-jiggle" style={{ animationDelay: '0s', display: 'flex', marginRight: '0.4rem' }}>
            <Gamepad2 size={28} />
          </span>
          {"Santhosh Games".split('').map((char, index) => (
            <span key={index} className="wave-jiggle" style={{ animationDelay: `${(index + 1) * 0.05}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Users size={20} /> <span style={{ fontWeight: 600 }}>0 Online</span>
          </div>
        </div>
      </nav>

      <main className="container animate-fade-in" style={{ padding: '3rem 2rem' }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '4rem', 
            marginBottom: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '1.5rem',
            color: '#ffffff',
            fontWeight: 900,
            WebkitTextStroke: '2px #000',
            textShadow: '0 5px 0 #000, 0 10px 15px rgba(0,0,0,0.6)',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            <div 
              className={isFlipped ? "animate-flip" : ""}
              onClick={() => {
                setIsFlipped(true);
                setTimeout(() => setIsFlipped(false), 600);
              }}
              style={{ 
                filter: 'drop-shadow(0px 5px 0px #b8860b) drop-shadow(0px 10px 10px rgba(0,0,0,0.5))', 
                display: 'flex',
                cursor: 'pointer'
              }}
            >
              <Trophy size={60} color="#ffcc00" fill="#ffcc00" style={{ transform: 'translateY(-5px)' }} />
            </div>
            <span 
              className={hasFallen ? "animate-fall" : "animate-jiggle"}
              onClick={() => {
                setHasFallen(true);
                setTimeout(() => setHasFallen(false), 1500);
              }}
              style={{ cursor: 'pointer', display: 'inline-block' }}
            >
              Game Library
            </span>
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.4rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.6)', cursor: 'default' }}>
            {"Select a game to create a lobby or join a friend.".split('').map((char, index) => (
              <span key={index} className={char !== ' ' ? "hover-letter" : ""}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </p>
        </div>

        <div className="game-grid">
          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <Link to={`/game/${game.id}`} key={game.id} className="game-card-solid" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'inherit', fontWeight: 'bold', fontSize: '1.2rem', opacity: 0.5, zIndex: 2 }}>
                  {game.rank}
                </div>
                
                <div style={{ height: '160px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                  <div className="cube-container">
                    <div className="cube">
                      <div className="cube-face cube-front">
                        {game.image ? (
                          <img src={game.image} alt={game.title} />
                        ) : (
                          <div className="cube-icon" style={{ display: 'flex', color: game.color }}>
                            <IconComponent size={60} />
                          </div>
                        )}
                      </div>
                      <div className="cube-face cube-back">
                        {game.image ? (
                          <img src={game.image} alt={game.title} />
                        ) : (
                          <div className="cube-icon" style={{ display: 'flex', color: game.color }}>
                            <IconComponent size={60} />
                          </div>
                        )}
                      </div>
                      <div className="cube-face cube-right"></div>
                      <div className="cube-face cube-left"></div>
                      <div className="cube-face cube-top"></div>
                      <div className="cube-face cube-bottom"></div>
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: '700', padding: '1rem 0' }}>
                  {game.title}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
