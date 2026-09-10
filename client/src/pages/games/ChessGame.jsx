import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { ArrowLeft, RefreshCw, Bot, User } from 'lucide-react';

export default function ChessGame() {
  const navigate = useNavigate();
  const [game, setGame] = useState(new Chess());
  const [isBotEnabled, setIsBotEnabled] = useState(false);
  const [status, setStatus] = useState('White to move');
  const [history, setHistory] = useState([]);
  
  // Click-to-move state
  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});
  const [pendingPromotion, setPendingPromotion] = useState(null);

  const isPromotion = (from, to) => {
    const moves = game.moves({ verbose: true });
    return moves.some(m => m.from === from && m.to === to && m.promotion);
  };

  const handlePromotion = (pieceType) => {
    if (!pendingPromotion) return;
    safeGameMutate((g) => {
      g.move({
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion: pieceType
      });
    });
    setPendingPromotion(null);
  };

  // Safely mutate the game state while preserving history
  const safeGameMutate = useCallback((modify) => {
    setGame((g) => {
      const update = new Chess();
      update.loadPgn(g.pgn());
      modify(update);
      return update;
    });
  }, []);

  const updateGameStatus = useCallback(() => {
    let newStatus = '';
    if (game.isCheckmate()) {
      newStatus = `Game over, ${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate.`;
    } else if (game.isDraw()) {
      newStatus = 'Game over, drawn position.';
    } else {
      newStatus = `${game.turn() === 'w' ? 'White' : 'Black'} to move`;
      if (game.isCheck()) {
        newStatus += ', ' + (game.turn() === 'w' ? 'White' : 'Black') + ' is in check!';
      }
    }
    setStatus(newStatus);
    setHistory(game.history({ verbose: true }));
  }, [game]);

  useEffect(() => {
    updateGameStatus();
  }, [updateGameStatus]);

  const makeRandomMove = useCallback(() => {
    if (game.isGameOver() || game.isDraw() || game.moves().length === 0) return;
    const possibleMoves = game.moves();
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    const move = possibleMoves[randomIndex];
    safeGameMutate((g) => g.move(move));
    setMoveFrom('');
    setOptionSquares({});
  }, [game, safeGameMutate]);

  useEffect(() => {
    if (isBotEnabled && game.turn() === 'b' && !game.isGameOver()) {
      const timer = setTimeout(makeRandomMove, 500);
      return () => clearTimeout(timer);
    }
  }, [game, isBotEnabled, makeRandomMove]);

  function getMoveOptions(square) {
    const moves = game.moves({
      square,
      verbose: true
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.3) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.3) 25%, transparent 25%)',
        borderRadius: '50%'
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    setOptionSquares(newSquares);
  }

  function onSquareClick({ square }) {
    if (isBotEnabled && game.turn() === 'b') return;
    
    // If no piece is currently selected, select this one (if it has valid moves)
    if (!moveFrom) {
      const hasMoveOptions = game.moves({ square, verbose: true }).length > 0;
      if (hasMoveOptions) {
        setMoveFrom(square);
        getMoveOptions(square);
      }
      return;
    }

    // If a piece is already selected, try to move it to the clicked square
    if (isPromotion(moveFrom, square)) {
      setPendingPromotion({ from: moveFrom, to: square, color: game.turn() });
      setMoveFrom('');
      setOptionSquares({});
      return;
    }

    let moveObj = null;
    safeGameMutate((g) => {
      try {
        moveObj = g.move({
          from: moveFrom,
          to: square,
          promotion: 'q'
        });
      } catch (e) {
        moveObj = null;
      }
    });

    // If the move was invalid (e.g. clicking another own piece), change selection
    if (moveObj === null) {
      const hasMoveOptions = game.moves({ square, verbose: true }).length > 0;
      if (hasMoveOptions) {
        setMoveFrom(square);
        getMoveOptions(square);
      } else {
        setMoveFrom('');
        setOptionSquares({});
      }
      return;
    }

    // Move was valid
    setMoveFrom('');
    setOptionSquares({});
  }

  function onPieceDrop({ sourceSquare, targetSquare }) {
    if (isBotEnabled && game.turn() === 'b') return false; 
    
    if (isPromotion(sourceSquare, targetSquare)) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare, color: game.turn() });
      return false;
    }

    let moveObj = null;
    safeGameMutate((g) => {
      try {
        moveObj = g.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q', 
        });
      } catch (e) {
        moveObj = null;
      }
    });
    
    if (moveObj !== null) {
      setMoveFrom('');
      setOptionSquares({});
      return true;
    }
    return false;
  }

  const resetGame = () => {
    setGame(new Chess());
    setMoveFrom('');
    setOptionSquares({});
  };

  const toggleBot = () => {
    setIsBotEnabled(!isBotEnabled);
  };

  // Custom styling string
  const styles = `
    .chess-wrapper {
      min-height: 100vh;
      background-color: #0f172a;
      background-image: 
        linear-gradient(45deg, rgba(30, 41, 59, 0.7) 25%, transparent 25%, transparent 75%, rgba(30, 41, 59, 0.7) 75%, rgba(30, 41, 59, 0.7)),
        linear-gradient(45deg, rgba(30, 41, 59, 0.7) 25%, transparent 25%, transparent 75%, rgba(30, 41, 59, 0.7) 75%, rgba(30, 41, 59, 0.7));
      background-position: 0 0, 40px 40px;
      background-size: 80px 80px;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', system-ui, sans-serif;
      position: absolute;
      inset: 0;
      z-index: 100;
      overflow-y: auto;
    }

    .chess-header {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .chess-back-btn {
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
    .chess-back-btn:hover {
      color: white;
    }

    .chess-main {
      flex: 1;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: 4rem;
      padding: 2rem;
      flex-wrap: wrap;
    }

    .chess-board-container {
      width: 100%;
      max-width: 600px;
      background: rgba(255, 255, 255, 0.05);
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .chess-panel {
      width: 100%;
      max-width: 350px;
      background: rgba(15, 23, 42, 0.8);
      padding: 1.5rem;
      border-radius: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .status-box {
      background: rgba(59, 130, 246, 0.1);
      border-left: 4px solid #3b82f6;
      padding: 1rem;
      border-radius: 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: white;
    }

    .status-box.game-over {
      background: rgba(239, 68, 68, 0.1);
      border-left-color: #ef4444;
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      font-size: 1rem;
      width: 100%;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-outline {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #e2e8f0;
    }
    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .btn-active {
      background: #10b981;
      border-color: #10b981;
      color: white;
    }
    .btn-active:hover {
      background: #059669;
    }

    .history-box {
      flex: 1;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 0.5rem;
      padding: 1rem;
      overflow-y: auto;
      max-height: 250px;
    }

    .history-box h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
    }

    .move-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      font-family: monospace;
      font-size: 1.1rem;
    }

    .move-item {
      color: #e2e8f0;
      background: rgba(255,255,255,0.05);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }
  `;

  // Pair up moves for display (White, Black)
  const pairedHistory = [];
  for (let i = 0; i < history.length; i += 2) {
    pairedHistory.push([history[i], history[i + 1]]);
  }

  const getCapturedPieces = () => {
    const initialCounts = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const currentCounts = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };
    
    game.board().forEach(row => {
      row.forEach(piece => {
        if (piece && currentCounts[piece.color] && currentCounts[piece.color][piece.type] !== undefined) {
          currentCounts[piece.color][piece.type]++;
        }
      });
    });

    const capturedByWhite = [];
    const capturedByBlack = [];
    const pieceTypes = ['q', 'r', 'b', 'n', 'p'];
    
    for (let type of pieceTypes) {
      const missingBlack = initialCounts[type] - currentCounts.b[type];
      for (let i = 0; i < missingBlack; i++) capturedByWhite.push({ type, color: 'b' });
      
      const missingWhite = initialCounts[type] - currentCounts.w[type];
      for (let i = 0; i < missingWhite; i++) capturedByBlack.push({ type, color: 'w' });
    }
    
    return { capturedByWhite, capturedByBlack };
  };

  const { capturedByWhite, capturedByBlack } = getCapturedPieces();

  const pieceUnicode = {
    w: { q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
  };

  const renderCaptured = (pieces) => (
    <div style={{ display: 'flex', gap: '2px', minHeight: '30px', fontSize: '24px', alignItems: 'center' }}>
      {pieces.length === 0 ? <span style={{ opacity: 0 }}>none</span> : pieces.map((p, i) => (
        <span key={i} style={{ 
          color: p.color === 'w' ? '#ffffff' : '#000000', 
          textShadow: p.color === 'w' ? '0 0 2px #000' : '0 0 2px #fff',
          lineHeight: 1
        }}>
          {pieceUnicode[p.color][p.type]}
        </span>
      ))}
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="chess-wrapper">
        <header className="chess-header">
          <button className="chess-back-btn" onClick={() => navigate('/hub')}>
            <ArrowLeft size={20} /> Back to Game Library
          </button>
          
          <div style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Grandmaster Chess
          </div>
        </header>

        <main className="chess-main">
          <div className="chess-board-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontWeight: '600', color: '#cbd5e1' }}>Black {isBotEnabled && '(Bot)'}</div>
              {renderCaptured(capturedByBlack)}
            </div>

            <Chessboard 
              options={{
                position: game.fen(),
                onPieceDrop: onPieceDrop,
                onSquareClick: onSquareClick,
                squareStyles: optionSquares,
                darkSquareStyle: { backgroundColor: '#475569' },
                lightSquareStyle: { backgroundColor: '#cbd5e1' },
                boardStyle: {
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
              <div style={{ fontWeight: '600', color: '#cbd5e1' }}>White</div>
              {renderCaptured(capturedByWhite)}
            </div>
          </div>

          <div className="chess-panel">
            <div className={`status-box ${game.isGameOver() ? 'game-over' : ''}`}>
              {status}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" onClick={resetGame}>
                <RefreshCw size={18} /> Restart
              </button>
              
              <button 
                className={`btn ${isBotEnabled ? 'btn-active' : 'btn-outline'}`}
                onClick={toggleBot}
              >
                {isBotEnabled ? <Bot size={18} /> : <User size={18} />}
                {isBotEnabled ? 'Bot Enabled' : 'Play vs Bot'}
              </button>
            </div>

            <div className="history-box">
              <h3>Move History</h3>
              {pairedHistory.length === 0 ? (
                <div style={{ color: '#64748b', fontStyle: 'italic' }}>No moves yet.</div>
              ) : (
                <div className="move-list">
                  {pairedHistory.map((pair, index) => (
                    <React.Fragment key={index}>
                      <div className="move-item"><span style={{color: '#94a3b8', marginRight: '8px'}}>{index + 1}.</span>{pair[0].san}</div>
                      {pair[1] && <div className="move-item">{pair[1].san}</div>}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {pendingPromotion && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            background: '#1e293b', padding: '1rem', borderRadius: '1rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)', textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>Promote Pawn To:</h2>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {['q', 'r', 'b', 'n'].map(p => (
                <button
                  key={p}
                  onClick={() => handlePromotion(p)}
                  style={{
                    fontSize: '3rem', padding: '1rem', background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem',
                    cursor: 'pointer', color: pendingPromotion.color === 'w' ? 'white' : 'black',
                    textShadow: pendingPromotion.color === 'w' ? '0 0 2px black' : '0 0 2px white'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  {pieceUnicode[pendingPromotion.color][p]}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setPendingPromotion(null)}
              style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
