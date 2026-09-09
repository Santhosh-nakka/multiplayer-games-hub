import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Hub from './pages/Hub';
import GameBackground from './components/GameBackground';
import TicTacToeBackground from './components/TicTacToeBackground';
import RockPaperScissorsBackground from './components/RockPaperScissorsBackground';
import Connect4Background from './components/Connect4Background';
import SnakeBattleBackground from './components/SnakeBattleBackground';
import TicTacToe from './pages/games/TicTacToe';
import RockPaperScissors from './pages/games/RockPaperScissors';
import Connect4 from './pages/games/Connect4';
import SnakeBattle from './pages/games/SnakeBattle';
import Battleship from './pages/games/Battleship';
import Uno from './pages/games/Uno';
import ChessGame from './pages/games/ChessGame';
import PingPong from './pages/games/PingPong';
import SimpleRacing from './pages/games/SimpleRacing';
import Hangman from './pages/games/Hangman';
import Wordle from './pages/games/Wordle';
import Nim from './pages/games/Nim';
import QuickDraw from './pages/games/QuickDraw';
import Game2048 from './pages/games/Game2048';
import WhackAMole from './pages/games/WhackAMole';

// Placeholders for games
const GamePlaceholder = ({ title }) => (
  <div className="container text-center animate-fade-in">
    <h2 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>{title}</h2>
    <p className="text-muted">Multiplayer backend and game logic under construction.</p>
    <a href="/hub" className="btn btn-primary" style={{ marginTop: '2rem' }}>Back to Hub</a>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isHub = location.pathname === '/hub';
  const isTicTacToe = location.pathname === '/game/tic-tac-toe';
  const isRPS = location.pathname === '/game/rock-paper-scissors';
  const isConnect4 = location.pathname === '/game/connect-4';
  const isSnakeBattle = location.pathname === '/game/snake-battle';

  return (
    <>
      {isLanding && <GameBackground />}
      {isHub && <div className="hub-image-bg" />}
      {isTicTacToe && <TicTacToeBackground />}
      {isSnakeBattle && <SnakeBattleBackground />}
      {!isLanding && !isHub && !isTicTacToe && !isRPS && !isConnect4 && !isSnakeBattle && (
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, backgroundColor: '#1e3a8a' }} />
      )}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/hub" element={<Hub />} />
        
        {/* Game Routes */}
        <Route path="/game/tic-tac-toe" element={<TicTacToe />} />
        <Route path="/game/rock-paper-scissors" element={<RockPaperScissors />} />
        <Route path="/game/connect-4" element={<Connect4 />} />
        <Route path="/game/snake-battle" element={<SnakeBattle />} />
        <Route path="/game/battleship" element={<Battleship />} />
        <Route path="/game/uno" element={<Uno />} />
        <Route path="/game/chess" element={<ChessGame />} />
        <Route path="/game/pong" element={<PingPong />} />
        <Route path="/game/simple-racing" element={<SimpleRacing />} />
        <Route path="/game/hangman" element={<Hangman />} />
        <Route path="/game/wordle" element={<Wordle />} />
        <Route path="/game/nim" element={<Nim />} />
        <Route path="/game/quickdraw" element={<QuickDraw />} />
        <Route path="/game/2048" element={<Game2048 />} />
        <Route path="/game/whack-a-mole" element={<WhackAMole />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
// Trigger hot reload
