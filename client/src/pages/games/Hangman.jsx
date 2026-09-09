import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const WORD_LIST = [
  // Tollywood / Indian Cinema
  { word: 'BAAHUBALI', hint: 'Tollywood: A prince reclaims his throne in a two-part epic' },
  { word: 'RRR', hint: 'Tollywood: Two revolutionaries fight the British rule (and tigers)' },
  { word: 'PUSHPA', hint: 'Tollywood: A red sandalwood smuggler rises to power' },
  { word: 'KGF', hint: 'Sandalwood: Rocky Bhai takes over the gold mines' },
  { word: 'SALAAR', hint: 'Tollywood: A tale of two friends turned enemies in Khansaar' },
  { word: 'EGA', hint: 'Tollywood: A murdered man reincarnates as a housefly for revenge' },
  
  // Cricket / IPL
  { word: 'CHENNAI SUPER KINGS', hint: 'IPL: The yellow army led by Captain Cool' },
  { word: 'MUMBAI INDIANS', hint: 'IPL: The most successful team in blue and gold' },
  { word: 'ROYAL CHALLENGERS BENGALURU', hint: 'IPL: Ee Sala Cup Namde! (Hopefully)' },
  { word: 'MS DHONI', hint: 'Cricket: Thala, known for his helicopter shot' },
  { word: 'VIRAT KOHLI', hint: 'Cricket: King of modern cricket, chase master' },
  { word: 'ROHIT SHARMA', hint: 'Cricket: The Hitman, loves pulling short balls' },
  { word: 'JASPRIT BUMRAH', hint: 'Cricket: Yorker specialist with a unique action' },
  { word: 'SUNRISERS HYDERABAD', hint: 'IPL: The Orange Army from the city of pearls' },

  // Other Movies & Series
  { word: 'TITANIC', hint: 'Movie: A giant ship hits an iceberg' },
  { word: 'AVATAR', hint: 'Movie: Blue aliens on the planet Pandora' },
  { word: 'GLADIATOR', hint: 'Movie: A betrayed Roman general seeks revenge' },
  { word: 'STRANGER THINGS', hint: 'Web Series: Kids fighting monsters in the 80s' },
  { word: 'MONEY HEIST', hint: 'Web Series: A group of thieves rob the Royal Mint of Spain' },
  { word: 'SQUID GAME', hint: 'Web Series: Deadly children games for a massive cash prize' }
];

const MAX_MISTAKES = 6;

export default function Hangman() {
  const navigate = useNavigate();
  const [wordObj, setWordObj] = useState({ word: '', hint: '' });
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  
  const initGame = useCallback(() => {
    const randomItem = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setWordObj(randomItem);
    setGuessedLetters(new Set());
  }, []);

  const { word, hint } = wordObj;

  useEffect(() => {
    initGame();
  }, [initGame]);

  const mistakes = Array.from(guessedLetters).filter(letter => letter !== ' ' && !word.includes(letter)).length;
  const isWinner = word && word.split('').every(letter => letter === ' ' || guessedLetters.has(letter));
  const isLoser = mistakes >= MAX_MISTAKES;

  const guess = useCallback((letter) => {
    if (isWinner || isLoser || guessedLetters.has(letter)) return;
    setGuessedLetters(prev => new Set(prev).add(letter));
  }, [guessedLetters, isWinner, isLoser]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        guess(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guess]);

  const Keyboard = () => {
    const rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    return (
      <div className="keyboard">
        {rows.map((row, i) => (
          <div key={i} className="keyboard-row">
            {row.map(key => {
              const isGuessed = guessedLetters.has(key);
              const isCorrect = isGuessed && word.includes(key);
              const isWrong = isGuessed && !word.includes(key);
              
              let className = "key-btn";
              if (isCorrect) className += " correct";
              if (isWrong) className += " wrong";

              return (
                <button 
                  key={key} 
                  className={className} 
                  onClick={() => guess(key)}
                  disabled={isGuessed || isWinner || isLoser}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const HangmanFigure = () => {
    return (
      <svg height="250" width="200" className="figure-svg">
        {/* Stand */}
        <line x1="10" y1="240" x2="190" y2="240" stroke="#5c4033" strokeWidth="12" strokeLinecap="round" />
        <line x1="50" y1="240" x2="50" y2="20" stroke="#5c4033" strokeWidth="12" strokeLinecap="round" />
        <line x1="50" y1="20" x2="150" y2="20" stroke="#5c4033" strokeWidth="12" strokeLinecap="round" />
        <line x1="150" y1="20" x2="150" y2="50" stroke="#8b5a2b" strokeWidth="6" />
        
        {/* Head */}
        {mistakes > 0 && <circle cx="150" cy="75" r="25" stroke="#3e2723" strokeWidth="6" fill="transparent" />}
        {/* Body */}
        {mistakes > 1 && <line x1="150" y1="100" x2="150" y2="160" stroke="#3e2723" strokeWidth="6" strokeLinecap="round" />}
        {/* Left Arm */}
        {mistakes > 2 && <line x1="150" y1="120" x2="120" y2="150" stroke="#3e2723" strokeWidth="6" strokeLinecap="round" />}
        {/* Right Arm */}
        {mistakes > 3 && <line x1="150" y1="120" x2="180" y2="150" stroke="#3e2723" strokeWidth="6" strokeLinecap="round" />}
        {/* Left Leg */}
        {mistakes > 4 && <line x1="150" y1="160" x2="120" y2="200" stroke="#3e2723" strokeWidth="6" strokeLinecap="round" />}
        {/* Right Leg */}
        {mistakes > 5 && <line x1="150" y1="160" x2="180" y2="200" stroke="#3e2723" strokeWidth="6" strokeLinecap="round" />}
      </svg>
    );
  };

  const styles = `
    .hangman-wrapper {
      min-height: 100vh;
      background: #f4e4bc;
      color: #3e2723;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', system-ui, sans-serif;
    }
    
    .hangman-header {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #deb887;
      border-bottom: 4px solid #8b4513;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #5c4033;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
      transition: color 0.2s;
    }
    .back-btn:hover { color: #3e2723; }

    .game-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      gap: 3rem;
    }

    .word-display {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      min-height: 4rem;
      max-width: 800px;
    }

    .letter-box {
      border-bottom: 4px solid #5c4033;
      width: 3rem;
      text-align: center;
      color: #3e2723;
      text-transform: uppercase;
      transition: all 0.3s;
    }
    
    .letter-box.revealed {
      border-color: #2e7d32;
      color: #2e7d32;
    }
    
    .letter-box.missed {
      border-color: #c62828;
      color: #c62828;
    }

    .keyboard {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: center;
    }

    .keyboard-row {
      display: flex;
      gap: 0.5rem;
    }

    .key-btn {
      width: 3rem;
      height: 3.5rem;
      background: #e6c280;
      border: 2px solid #8b5a2b;
      border-radius: 6px;
      color: #3e2723;
      font-size: 1.2rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 2px 2px 0 #8b5a2b;
    }

    .key-btn:not(:disabled):hover {
      background: #deb887;
      transform: translateY(2px);
      box-shadow: 0 0 0 #8b5a2b;
    }

    .key-btn.correct {
      background: #81c784;
      border-color: #2e7d32;
      color: #1b5e20;
      box-shadow: none;
      transform: translateY(2px);
    }

    .key-btn.wrong {
      background: #e57373;
      border-color: #c62828;
      color: #b71c1c;
      opacity: 0.8;
      box-shadow: none;
      transform: translateY(2px);
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary { 
      background: #8b4513; 
      color: #f4e4bc; 
      border: 2px solid #5c4033;
    }
    .btn-primary:hover { background: #5c4033; }

    .status-text {
      font-size: 2.5rem;
      font-weight: 900;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="hangman-wrapper">
        <header className="hangman-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} /> Back to Hub
          </button>
          <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#3e2723' }}>
            CLASSIC HANGMAN
          </div>
          <div style={{width: 100}}></div>
        </header>

        <div className="game-container">
          
          <div style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
            <div style={{ background: '#deb887', padding: '2rem', borderRadius: '1rem', border: '4px solid #8b4513', boxShadow: '4px 4px 0 rgba(0,0,0,0.1)' }}>
              <HangmanFigure />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
              <div style={{ color: '#5c4033', fontSize: '1.2rem', fontWeight: 700 }}>
                Mistakes: <span style={{ color: mistakes > 3 ? '#c62828' : '#3e2723' }}>{mistakes} / {MAX_MISTAKES}</span>
              </div>
              
              <div style={{ background: '#fff8dc', padding: '1rem 2rem', borderRadius: '12px', border: '2px dashed #8b4513', color: '#8b5a2b', fontStyle: 'italic', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '2px 2px 0 rgba(0,0,0,0.05)' }}>
                <strong>Hint:</strong> {hint}
              </div>
              
              <div className="word-display">
                {word.split('').map((letter, i) => {
                  if (letter === ' ') {
                    return <div key={i} style={{ width: '2rem' }}></div>;
                  }
                  const isRevealed = guessedLetters.has(letter);
                  const isMissed = isLoser && !isRevealed;
                  return (
                    <div key={i} className={`letter-box ${isRevealed ? 'revealed' : ''} ${isMissed ? 'missed' : ''}`}>
                      {isRevealed || isMissed ? letter : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {(isWinner || isLoser) ? (
            <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
              <div className="status-text" style={{ color: isWinner ? '#2e7d32' : '#c62828' }}>
                {isWinner ? 'YOU SURVIVED!' : 'GAME OVER'}
              </div>
              <button className="btn btn-primary" onClick={initGame} style={{ margin: '0 auto', fontSize: '1.2rem' }}>
                <RefreshCw size={20} /> Play Again
              </button>
            </div>
          ) : (
            <Keyboard />
          )}

        </div>
      </div>
    </>
  );
}
