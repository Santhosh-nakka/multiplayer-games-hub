import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Bot } from 'lucide-react';

const WORDS = [
  { word: 'REACT', hint: 'A popular UI library by Meta' },
  { word: 'GAMES', hint: 'What you are playing right now' },
  { word: 'LIGHT', hint: 'Without this, it is dark' },
  { word: 'SUPER', hint: 'Above average, like a certain Mario' },
  { word: 'LASER', hint: 'A highly focused beam of light' },
  { word: 'ROBOT', hint: 'A mechanical machine or AI' },
  { word: 'PIXEL', hint: 'A single dot on a digital screen' },
  { word: 'SPACE', hint: 'The final frontier' },
  { word: 'CYBER', hint: 'Relating to computers and the internet' },
  { word: 'BOARD', hint: 'A flat piece of wood, or type of classic game' },
  { word: 'MOUSE', hint: 'A small rodent, or a computer peripheral' },
  { word: 'SOUND', hint: 'Vibrations that travel through the air' },
  { word: 'CRASH', hint: 'When your car hits something, or your code breaks' },
  { word: 'LEVEL', hint: 'A stage in a video game' },
  { word: 'SCORE', hint: 'The number of points you have' },
  { word: 'CHEAT', hint: 'Using a code to win easily' },
  { word: 'MAGIC', hint: 'Supernatural powers or illusions' },
  { word: 'PARTY', hint: 'A fun gathering with friends' },
  { word: 'GHOST', hint: 'A spooky spirit' },
  { word: 'POWER', hint: 'Energy, or political control' },
  { word: 'SKILL', hint: 'Ability acquired through practice' },
  { word: 'TRACK', hint: 'A path for racing' },
  { word: 'FIGHT', hint: 'To battle against an opponent' },
  { word: 'BLOCK', hint: 'A square shape, or to stop an attack' },
  { word: 'HEART', hint: 'The organ that pumps blood, or a symbol of love' },
  { word: 'CRAZY', hint: 'Wild and unpredictable' },
  { word: 'SPEED', hint: 'How fast you are going' },
  { word: 'GLOWS', hint: 'What neon light does' },
  { word: 'BLAST', hint: 'An explosion or a great time' },
  { word: 'ALIEN', hint: 'An extraterrestrial being' },
  { word: 'NINJA', hint: 'A stealthy warrior from Japan' },
  { word: 'STEEL', hint: 'A strong metal alloy' },
  { word: 'SWORD', hint: 'A sharp weapon used by knights' },
  { word: 'FLAME', hint: 'The visible part of a fire' },
  { word: 'BLOOD', hint: 'The red liquid in your veins' }
];

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

export default function Wordle() {
  const navigate = useNavigate();
  const [targetWord, setTargetWord] = useState('');
  const [hint, setHint] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  const initGame = useCallback(() => {
    const randomItem = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(randomItem.word);
    setHint(randomItem.hint);
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setWin(false);
    setShowHint(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const onKeyPress = useCallback((key) => {
    if (gameOver) return;

    if (key === 'ENTER') {
      if (currentGuess.length === WORD_LENGTH) {
        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        if (currentGuess === targetWord) {
          setWin(true);
          setGameOver(true);
        } else if (newGuesses.length >= MAX_GUESSES) {
          setGameOver(true);
        }
        setCurrentGuess('');
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < WORD_LENGTH && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, gameOver, guesses, targetWord]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      let key = e.key.toUpperCase();
      if (e.key === 'Backspace') key = 'BACKSPACE';
      if (e.key === 'Enter') key = 'ENTER';
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        onKeyPress(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);

  const getLetterStatus = (letter, index, guessStr) => {
    if (targetWord[index] === letter) return 'correct';
    if (targetWord.includes(letter)) {
      // Logic for yellow: check how many occurrences of the letter exist in the target word
      // vs how many we've already marked as correct or yellow in this guess
      let targetCount = targetWord.split('').filter(c => c === letter).length;
      let usedCount = 0;
      for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessStr[i] === letter && targetWord[i] === letter) {
          targetCount--;
        }
      }
      for (let i = 0; i <= index; i++) {
        if (guessStr[i] === letter && targetWord[i] !== letter) {
          usedCount++;
        }
      }
      return usedCount <= targetCount ? 'present' : 'absent';
    }
    return 'absent';
  };

  const getKeyboardStatus = () => {
    const status = {};
    guesses.forEach(guess => {
      guess.split('').forEach((letter, i) => {
        const s = getLetterStatus(letter, i, guess);
        if (status[letter] !== 'correct') {
          if (s === 'correct' || (s === 'present' && status[letter] !== 'correct') || (s === 'absent' && !status[letter])) {
            status[letter] = s;
          }
        }
      });
    });
    return status;
  };

  const keyboardStatus = getKeyboardStatus();

  const Keyboard = () => {
    const rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
    ];

    return (
      <div className="keyboard">
        {rows.map((row, i) => (
          <div key={i} className="keyboard-row">
            {row.map(key => {
              const status = keyboardStatus[key];
              let className = "key-btn";
              if (key === 'ENTER' || key === 'BACKSPACE') className += " action-key";
              if (status === 'correct') className += " correct";
              if (status === 'present') className += " present";
              if (status === 'absent') className += " absent";

              return (
                <button key={key} className={className} onClick={() => onKeyPress(key)}>
                  {key === 'BACKSPACE' ? '⌫' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const styles = `
    .wordle-wrapper {
      min-height: 100vh;
      background: black;
      color: #39ff14;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', system-ui, sans-serif;
    }
    
    .wordle-header {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: black;
      border-bottom: 1px solid #39ff14;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #39ff14;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
      transition: color 0.2s;
    }
    .back-btn:hover { color: #32cd32; text-shadow: 0 0 5px #39ff14; }

    .game-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      gap: 2rem;
    }

    .grid {
      display: grid;
      grid-template-rows: repeat(6, 1fr);
      gap: 8px;
    }

    .row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }

    .tile {
      width: 4rem;
      height: 4rem;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 2rem;
      font-weight: 700;
      font-family: 'Orbitron', sans-serif;
      text-transform: uppercase;
      border: 2px solid #39ff14;
      background: black;
      color: #39ff14;
      transition: all 0.3s ease;
      box-shadow: inset 0 0 5px #39ff14, 0 0 5px #39ff14;
    }

    .tile.active {
      border-color: #39ff14;
      animation: pop 0.1s;
      box-shadow: inset 0 0 15px #39ff14, 0 0 15px #39ff14;
    }

    .tile.correct {
      background: #6aaa64;
      border-color: #6aaa64;
      color: white;
      box-shadow: none;
    }

    .tile.present {
      background: #c9b458;
      border-color: #c9b458;
      color: white;
      box-shadow: none;
    }

    .tile.absent {
      background: #787c7e;
      border-color: #787c7e;
      color: white;
      box-shadow: none;
    }

    @keyframes pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .keyboard {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
      margin-top: 1rem;
    }

    .keyboard-row {
      display: flex;
      gap: 8px;
    }

    .key-btn {
      min-width: 2.5rem;
      height: 3.5rem;
      background: black;
      border: 1px solid #39ff14;
      border-radius: 4px;
      color: #39ff14;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 0.5rem;
      transition: all 0.2s;
    }

    .key-btn.action-key {
      min-width: 4rem;
      font-size: 0.9rem;
    }

    .key-btn:hover { 
      background: #39ff14; 
      color: black;
      box-shadow: 0 0 10px #39ff14; 
    }
    
    .key-btn.correct { background: #6aaa64; color: white; border: none; box-shadow: none; }
    .key-btn.present { background: #c9b458; color: white; border: none; box-shadow: none; }
    .key-btn.absent { background: #787c7e; color: white; border: none; box-shadow: none; }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid #39ff14;
      background: black;
      color: #39ff14;
      font-size: 1.2rem;
      transition: all 0.2s;
      box-shadow: 0 0 10px #39ff14;
    }
    .btn-primary:hover { 
      background: #39ff14; 
      color: black;
      box-shadow: 0 0 20px #39ff14;
    }

    .bot-speech {
      background: black;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      border: 1px solid #39ff14;
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      max-width: 500px;
      box-shadow: 0 0 10px rgba(57,255,20,0.2);
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="wordle-wrapper">
        <header className="wordle-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} /> Back to Hub
          </button>
          <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#39ff14', textShadow: '0 0 10px #39ff14' }}>
            WORDLE
          </div>
          <div style={{width: 100}}></div>
        </header>

        <div className="main-layout" style={{ display: 'flex', flex: 1, justifyContent: 'center', padding: '1rem', gap: '2rem', flexWrap: 'wrap' }}>
          <div className="instruction-panel" style={{ flex: 1, minWidth: '250px', maxWidth: '300px', color: '#39ff14', border: '1px solid #39ff14', padding: '1.5rem', borderRadius: '8px', height: 'fit-content', boxShadow: '0 0 10px rgba(57,255,20,0.2)' }}>
            <h3 style={{ borderBottom: '1px solid #39ff14', paddingBottom: '0.5rem', marginTop: 0, textShadow: '0 0 5px #39ff14' }}>How to Play</h3>
            <p style={{ lineHeight: '1.5' }}>Guess the Wordle in 6 tries.</p>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.5' }}>
              <li>Each guess must be a valid 5-letter word.</li>
              <li>Hit the enter button to submit.</li>
              <li>After each guess, the color of the tiles will change to show how close your guess was to the word.</li>
            </ul>
          </div>
          
          <div className="game-container" style={{ padding: 0, flex: 2, minWidth: '350px' }}>
          
          <div className="bot-speech">
            <div style={{ background: '#39ff14', padding: '0.75rem', borderRadius: '50%', display: 'flex', boxShadow: '0 0 10px #39ff14' }}>
              <Bot size={24} color="black" />
            </div>
            <div style={{ color: '#39ff14' }}>
              {gameOver ? (
                win ? 
                <span style={{ color: '#39ff14', fontWeight: 'bold', textShadow: '0 0 5px #39ff14' }}>Beep Boop! You cracked my code! Outstanding.</span> : 
                <span style={{ color: '#ff3333', fontWeight: 'bold', textShadow: '0 0 5px #ff3333' }}>Game Over! The word was {targetWord}. Better luck next time!</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span>I have chosen a secret 5-letter word. You have 6 attempts to guess it.</span>
                  {showHint ? (
                    <span style={{ color: '#32cd32', fontStyle: 'italic' }}><strong>Hint:</strong> {hint}</span>
                  ) : (
                    <button 
                      style={{ background: 'transparent', border: '1px solid #39ff14', color: '#39ff14', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', width: 'fit-content', fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 0 5px rgba(57,255,20,0.5)' }} 
                      onClick={() => setShowHint(true)}
                    >
                      Get a Hint 💡
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid">
            {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
              const isCurrentRow = rowIndex === guesses.length;
              const guessStr = guesses[rowIndex] || (isCurrentRow ? currentGuess : '');
              
              return (
                <div key={rowIndex} className="row">
                  {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                    const letter = guessStr[colIndex] || '';
                    let statusClass = '';
                    
                    if (rowIndex < guesses.length) {
                      statusClass = getLetterStatus(letter, colIndex, guessStr);
                    } else if (isCurrentRow && letter) {
                      statusClass = 'active';
                    }

                    return (
                      <div key={colIndex} className={`tile ${statusClass}`}>
                        {letter}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {gameOver && (
            <button className="btn-primary" onClick={initGame} style={{ marginTop: '1rem' }}>
              <RefreshCw size={20} /> Play Again
            </button>
          )}

          {!gameOver && <Keyboard />}
          </div>

          <div className="instruction-panel" style={{ flex: 1, minWidth: '250px', maxWidth: '300px', color: '#39ff14', border: '1px solid #39ff14', padding: '1.5rem', borderRadius: '8px', height: 'fit-content', boxShadow: '0 0 10px rgba(57,255,20,0.2)' }}>
            <h3 style={{ borderBottom: '1px solid #39ff14', paddingBottom: '0.5rem', marginTop: 0, textShadow: '0 0 5px #39ff14' }}>Color Legend</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="tile correct" style={{ width: '3rem', height: '3rem', minWidth: '3rem', fontSize: '1.5rem', border: 'none', boxShadow: 'none' }}>W</div>
              <span style={{ lineHeight: '1.4' }}><strong>Green</strong>: The letter is in the word and in the correct spot.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="tile present" style={{ width: '3rem', height: '3rem', minWidth: '3rem', fontSize: '1.5rem', border: 'none', boxShadow: 'none' }}>O</div>
              <span style={{ lineHeight: '1.4' }}><strong>Yellow</strong>: The letter is in the word but in the wrong spot.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="tile absent" style={{ width: '3rem', height: '3rem', minWidth: '3rem', fontSize: '1.5rem', border: 'none', boxShadow: 'none' }}>R</div>
              <span style={{ lineHeight: '1.4' }}><strong>Gray/White</strong>: The letter is not in the word in any spot.</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
