import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, AlertTriangle, User, Bot, Play, Users } from 'lucide-react';

const COLORS = ['#ef4444', '#facc15', '#22c55e', '#3b82f6']; // Red, Yellow, Green, Blue
const COLOR_NAMES = ['red', 'yellow', 'green', 'blue'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];

const getCardScore = (card) => {
  if (card.type === 'number') return parseInt(card.value);
  if (card.type === 'action') return 20;
  if (card.type === 'wild') return 50;
  return 0;
};

const generateDeck = () => {
  let deck = [];
  let id = 0;
  COLOR_NAMES.forEach((color, cIdx) => {
    deck.push({ id: id++, color, colorCode: COLORS[cIdx], value: '0', type: 'number' });
    for (let i = 1; i <= 12; i++) {
      const val = VALUES[i];
      const type = i > 9 ? 'action' : 'number';
      deck.push({ id: id++, color, colorCode: COLORS[cIdx], value: val, type });
      deck.push({ id: id++, color, colorCode: COLORS[cIdx], value: val, type });
    }
  });
  for (let i = 0; i < 4; i++) {
    deck.push({ id: id++, color: 'black', colorCode: '#1f2937', value: 'wild', type: 'wild' });
    deck.push({ id: id++, color: 'black', colorCode: '#1f2937', value: 'wild4', type: 'wild' });
  }
  return deck.sort(() => Math.random() - 0.5);
};

// SVG Assets for Cards
const SkipIcon = () => (
  <svg viewBox="0 0 100 100" className="uno-action-svg">
    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="15" fill="none" />
    <line x1="25" y1="25" x2="75" y2="75" stroke="currentColor" strokeWidth="15" />
  </svg>
);

const ReverseIcon = () => (
  <svg viewBox="0 0 100 100" className="uno-action-svg">
    <path d="M 30 70 A 30 30 0 0 1 70 30" stroke="currentColor" strokeWidth="10" fill="none" />
    <polygon points="70,20 70,40 85,30" fill="currentColor" />
    <path d="M 70 30 A 30 30 0 0 1 30 70" stroke="currentColor" strokeWidth="10" fill="none" />
    <polygon points="30,80 30,60 15,70" fill="currentColor" />
  </svg>
);

const Draw2Icon = () => (
  <div className="draw-icon-container">
    <div className="draw-card c1">+2</div>
    <div className="draw-card c2">+2</div>
  </div>
);

const WildIcon = () => (
  <div className="wild-icon-container">
    <div className="wild-quad q1" style={{backgroundColor: COLORS[0]}}></div>
    <div className="wild-quad q2" style={{backgroundColor: COLORS[3]}}></div>
    <div className="wild-quad q3" style={{backgroundColor: COLORS[1]}}></div>
    <div className="wild-quad q4" style={{backgroundColor: COLORS[2]}}></div>
  </div>
);

const Draw4Icon = () => (
  <div className="draw4-container">
    <div className="d4-card red" style={{backgroundColor: COLORS[0]}}>+4</div>
    <div className="d4-card blue" style={{backgroundColor: COLORS[3]}}>+4</div>
    <div className="d4-card green" style={{backgroundColor: COLORS[2]}}>+4</div>
    <div className="d4-card yellow" style={{backgroundColor: COLORS[1]}}>+4</div>
  </div>
);

const UnoCard = ({ card, hidden, onClick, isPlayable, small, isDrawn, styleParams }) => {
  if (hidden) {
    return (
      <div className={`uno-card hidden ${small ? 'small' : ''}`} style={styleParams}>
        <div className="uno-card-border" style={{ background: '#1f2937', borderColor: '#1f2937' }}>
          <div className="uno-card-inner hidden-inner">
            <div className="uno-card-oval hidden-oval">
              <span className="uno-logo-text" style={{ color: '#facc15' }}>UNO</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!card) return <div className={`uno-card-empty ${small ? 'small' : ''}`} />;

  const isWild = card.color === 'black';
  let CenterGraphic = () => <span className={`uno-card-center-val ${isWild ? 'wild-text' : ''}`}>{card.value}</span>;
  let CornerGraphic = () => <span>{card.value}</span>;

  if (card.value === 'skip') { CenterGraphic = SkipIcon; CornerGraphic = () => <span className="corner-icon">⊘</span>; }
  if (card.value === 'reverse') { CenterGraphic = ReverseIcon; CornerGraphic = () => <span className="corner-icon">⇄</span>; }
  if (card.value === 'draw2') { CenterGraphic = Draw2Icon; CornerGraphic = () => <span>+2</span>; }
  if (card.value === 'wild') { CenterGraphic = WildIcon; CornerGraphic = () => <div className="corner-wild-sphere"></div>; }
  if (card.value === 'wild4') { CenterGraphic = Draw4Icon; CornerGraphic = () => <span>+4</span>; }

  return (
    <div 
      className={`uno-card ${isPlayable ? 'playable' : ''} ${small ? 'small' : ''} ${isDrawn ? 'drawn-highlight' : ''}`}
      style={{ '--card-color': card.colorCode, ...styleParams }}
      onClick={isPlayable ? onClick : undefined}
    >
      <div className="uno-card-border">
        <div className="uno-card-inner">
          <div className="uno-card-corner top-left"><CornerGraphic /></div>
          <div className="uno-card-oval">
            <CenterGraphic />
          </div>
          <div className="uno-card-corner bottom-right"><CornerGraphic /></div>
        </div>
      </div>
    </div>
  );
};

export default function Uno() {
  const navigate = useNavigate();
  
  const [gameState, setGameState] = useState('menu'); 
  const [menuView, setMenuView] = useState('main'); // main, bots, local
  
  const [deck, setDeck] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  
  const [players, setPlayers] = useState([]); // { name, isBot }
  const [hands, setHands] = useState([]); // Array of card arrays
  const [scores, setScores] = useState([]);
  const [unoStatus, setUnoStatus] = useState([]); // Array of booleans
  
  const [turnIndex, setTurnIndex] = useState(0); 
  const [direction, setDirection] = useState(1); // 1 = clockwise, -1 = counter
  
  const [activeColor, setActiveColor] = useState('');
  const [activeColorCode, setActiveColorCode] = useState('');
  
  const [round, setRound] = useState(1);
  const WINNING_SCORE = 500;
  const [logs, setLogs] = useState([]);
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState(null);
  const [drawnCardState, setDrawnCardState] = useState(null); 
  
  const [challengeState, setChallengeState] = useState(null); 
  const [canCatchState, setCanCatchState] = useState({ active: false, target: -1 }); 
  const [lastPlayedBy, setLastPlayedBy] = useState(null);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const getNextTurn = (current, dir, total) => {
    return (current + dir + total) % total;
  };

  const startGame = (numPlayers, hasBots) => {
    const newPlayers = [];
    if (hasBots) {
      newPlayers.push({ name: 'You', isBot: false });
      for (let i = 1; i < numPlayers; i++) {
        newPlayers.push({ name: `Bot ${i}`, isBot: true });
      }
    } else {
      for (let i = 0; i < numPlayers; i++) {
        newPlayers.push({ name: `Player ${i + 1}`, isBot: false });
      }
    }
    setPlayers(newPlayers);
    setScores(Array(numPlayers).fill(0));
    setRound(1);
    startRound(newPlayers);
  };

  const startRound = (currentPlayers = players) => {
    let newDeck = generateDeck();
    const newHands = [];
    
    for (let i = 0; i < currentPlayers.length; i++) {
      newHands.push(newDeck.splice(0, 7));
    }
    
    let topCardIndex = newDeck.findIndex(c => c.type === 'number');
    if (topCardIndex === -1) topCardIndex = 0; 
    const [topCard] = newDeck.splice(topCardIndex, 1);
    
    setHands(newHands);
    setDiscardPile([topCard]);
    setDeck(newDeck);
    setActiveColor(topCard.color);
    setActiveColorCode(topCard.colorCode);
    
    setTurnIndex(0);
    setDirection(1);
    
    setGameState('playing');
    setUnoStatus(Array(currentPlayers.length).fill(false));
    setCanCatchState({ active: false, target: -1 });
    setDrawnCardState(null);
    setChallengeState(null);
    setLastPlayedBy(null);
    addLog(`Round ${round} started!`);
  };

  const topCard = discardPile[discardPile.length - 1];
  const isCurrentHuman = players[turnIndex] && !players[turnIndex].isBot;

  const isCardPlayable = (card, currentActiveColor, currentTopCard) => {
    if (card.type === 'wild') return true;
    if (card.color === currentActiveColor) return true;
    if (card.value === currentTopCard?.value) return true;
    return false;
  };

  const hasMatchingColor = (hand, color) => {
    return hand.some(c => c.color === color && c.type !== 'wild');
  };

  const drawCards = (num, currentDeck) => {
    let cards = [];
    let d = [...currentDeck];
    for (let i = 0; i < num; i++) {
      if (d.length === 0) {
        if (discardPile.length > 1) {
          d = [...discardPile.slice(0, -1)].sort(() => Math.random() - 0.5);
          setDiscardPile([discardPile[discardPile.length - 1]]);
        } else break;
      }
      cards.push(d.shift());
    }
    return { cards, newDeck: d };
  };

  const handleDrawClick = () => {
    if (!isCurrentHuman || showColorPicker || challengeState || drawnCardState) return;
    
    const { cards, newDeck } = drawCards(1, deck);
    if (cards.length === 0) return;
    
    const drawn = cards[0];
    setDeck(newDeck);
    
    const newHands = [...hands];
    newHands[turnIndex] = [...newHands[turnIndex], drawn];
    setHands(newHands);
    
    const playable = isCardPlayable(drawn, activeColor, topCard);
    addLog(`${players[turnIndex].name} drew a card.`);
    
    const newUnoStatus = [...unoStatus];
    newUnoStatus[turnIndex] = false;
    setUnoStatus(newUnoStatus); 
    
    if (playable) setDrawnCardState({ card: drawn, isPlayable: true });
    else setTurnIndex(getNextTurn(turnIndex, direction, players.length));
  };

  const playDrawnCard = () => {
    if (!drawnCardState) return;
    const { card } = drawnCardState;
    setDrawnCardState(null);
    handlePlayCard(turnIndex, card, true);
  };

  const keepDrawnCard = () => {
    setDrawnCardState(null);
    setTurnIndex(getNextTurn(turnIndex, direction, players.length));
  };

  const callUno = (playerIdx) => {
    if (hands[playerIdx].length <= 2) {
      const newUnoStatus = [...unoStatus];
      newUnoStatus[playerIdx] = true;
      setUnoStatus(newUnoStatus);
      addLog(`${players[playerIdx].name} called UNO!`);
    }
  };

  const catchOpponent = (catcherIdx) => {
    if (canCatchState.active && canCatchState.target !== -1) {
      const targetIdx = canCatchState.target;
      const targetName = players[targetIdx].name;
      addLog(`${players[catcherIdx].name} caught ${targetName}! They draw 2 cards.`);
      const { cards, newDeck } = drawCards(2, deck);
      setDeck(newDeck);
      
      const newHands = [...hands];
      newHands[targetIdx] = [...newHands[targetIdx], ...cards];
      setHands(newHands);
      
      setCanCatchState({ active: false, target: -1 });
      
      const newUnoStatus = [...unoStatus];
      newUnoStatus[targetIdx] = true; // safe now
      setUnoStatus(newUnoStatus); 
    }
  };

  const handlePlayCard = (playerIdx, card, isHuman, chosenWildColor = null, chosenWildColorCode = null) => {
    const playerName = players[playerIdx].name;

    if (isHuman && card.type === 'wild' && !chosenWildColor) {
      setPendingWildCard(card);
      setShowColorPicker(true);
      return;
    }

    const newHands = [...hands];
    newHands[playerIdx] = newHands[playerIdx].filter(c => c.id !== card.id);
    setHands(newHands);

    setDiscardPile([...discardPile, card]);
    setLastPlayedBy(playerIdx);

    // UNO Logic
    if (newHands[playerIdx].length === 1) {
      if (isHuman) {
        if (!unoStatus[playerIdx]) {
          // If human forgets to call UNO, in local multiplayer they can be caught by other humans.
          // In vs bots, bots catch them automatically.
          const botsPresent = players.some(p => p.isBot);
          if (botsPresent) {
            addLog(`Bots caught ${playerName}! Forgot to call UNO. Draw 2.`);
            const { cards, newDeck } = drawCards(2, deck);
            setDeck(newDeck);
            newHands[playerIdx] = [...newHands[playerIdx], ...cards];
            setHands(newHands);
            const newUnoStatus = [...unoStatus];
            newUnoStatus[playerIdx] = true;
            setUnoStatus(newUnoStatus);
          } else {
            // Expose them to be caught by other humans
            setCanCatchState({ active: true, target: playerIdx });
            addLog(`${playerName} has 1 card left! Quick, Catch them!`);
          }
        } else {
          addLog(`${playerName} played their second to last card safely.`);
        }
      } else {
        if (!unoStatus[playerIdx]) {
          // Expose bot to be caught by human
          setCanCatchState({ active: true, target: playerIdx });
          addLog(`${playerName} has 1 card left! Quick, Catch them!`);
        }
      }
    }

    if (newHands[playerIdx].length === 0) {
      handleRoundWin(playerIdx, newHands);
      return;
    }

    // Action Cards Logic
    let nextTurn = getNextTurn(playerIdx, direction, players.length);
    let newDir = direction;
    let newColor = card.color;
    let newColorCode = card.colorCode;

    if (card.type === 'wild') {
      newColor = chosenWildColor;
      newColorCode = chosenWildColorCode;
    }

    const prevActiveColor = activeColor;
    setActiveColor(newColor);
    setActiveColorCode(newColorCode);

    if (card.value === 'reverse') {
      newDir = direction * -1;
      setDirection(newDir);
      nextTurn = getNextTurn(playerIdx, newDir, players.length);
      
      // In a 2-player game, reverse acts as a skip
      if (players.length === 2) {
        nextTurn = getNextTurn(nextTurn, newDir, players.length);
      }
      addLog(`${playerName} reversed!`);
    } else if (card.value === 'skip') {
      nextTurn = getNextTurn(nextTurn, newDir, players.length);
      addLog(`${playerName} played Skip!`);
    } else if (card.value === 'draw2') {
      const victim = nextTurn;
      const { cards, newDeck } = drawCards(2, deck);
      setDeck(newDeck);
      const updatedHands = [...newHands];
      updatedHands[victim] = [...updatedHands[victim], ...cards];
      setHands(updatedHands);
      addLog(`${playerName} played +2! ${players[victim].name} draws 2.`);
      nextTurn = getNextTurn(nextTurn, newDir, players.length); // skip victim
    } else if (card.value === 'wild4') {
      addLog(`${playerName} played +4!`);
      const victim = nextTurn;
      
      // Challenge prompt
      if (!players[victim].isBot) {
        setChallengeState({ active: true, challenger: victim, victim: playerIdx, victimHand: [...newHands[playerIdx]], prevColor: prevActiveColor });
        return; 
      } else {
        // Victim is Bot, decide to challenge
        if (Math.random() < 0.25) {
          setChallengeState({ active: true, challenger: victim, victim: playerIdx, victimHand: [...newHands[playerIdx]], prevColor: prevActiveColor });
          return; 
        } else {
          const { cards, newDeck } = drawCards(4, deck);
          setDeck(newDeck);
          const updatedHands = [...newHands];
          updatedHands[victim] = [...updatedHands[victim], ...cards];
          setHands(updatedHands);
          addLog(`${players[victim].name} accepted the +4.`);
          nextTurn = getNextTurn(victim, newDir, players.length); // skip victim
        }
      }
    }

    setTurnIndex(nextTurn);
  };

  const handleChallenge = (challenge) => {
    const { challenger, victim, victimHand, prevColor } = challengeState;
    const challengerName = players[challenger].name;
    const victimName = players[victim].name;

    if (challenge) {
      addLog(`${challengerName} challenged the +4!`);
      const cheated = hasMatchingColor(victimHand, prevColor);
      
      setChallengeState(prev => ({ ...prev, resolving: true, result: cheated }));

      setTimeout(() => {
        if (cheated) {
          addLog(`${victimName} cheated! Caught holding ${prevColor}. Penalty: Draw 4.`);
          const { cards, newDeck } = drawCards(4, deck);
          setDeck(newDeck);
          const newHands = [...hands];
          newHands[victim] = [...newHands[victim], ...cards];
          setHands(newHands);
          setTurnIndex(victim); 
        } else {
          addLog(`${victimName} played legally! Challenger Penalty: Draw 6.`);
          const { cards, newDeck } = drawCards(6, deck);
          setDeck(newDeck);
          const newHands = [...hands];
          newHands[challenger] = [...newHands[challenger], ...cards];
          setHands(newHands);
          setTurnIndex(getNextTurn(challenger, direction, players.length)); // skip challenger
        }
        setChallengeState(null);
      }, 2000);
    } else {
      addLog(`${challengerName} accepted the +4.`);
      const { cards, newDeck } = drawCards(4, deck);
      setDeck(newDeck);
      const newHands = [...hands];
      newHands[challenger] = [...newHands[challenger], ...cards];
      setHands(newHands);
      setTurnIndex(getNextTurn(challenger, direction, players.length)); // skip challenger
      setChallengeState(null);
    }
  };

  const handleRoundWin = (winnerIdx, finalHands) => {
    let points = 0;
    finalHands.forEach((h, idx) => {
      if (idx !== winnerIdx) {
        points += h.reduce((sum, card) => sum + getCardScore(card), 0);
      }
    });

    const newScores = [...scores];
    newScores[winnerIdx] += points;
    setScores(newScores);
    
    if (newScores[winnerIdx] >= WINNING_SCORE) setGameState('gameOver');
    else setGameState('roundOver');
  };

  useEffect(() => {
    if (gameState === 'playing' && players[turnIndex]?.isBot && !challengeState && !drawnCardState) {
      const timer = setTimeout(() => {
        const botHand = hands[turnIndex];
        const botName = players[turnIndex].name;

        if (botHand.length === 2 && !unoStatus[turnIndex] && Math.random() < 0.8) {
          const newUno = [...unoStatus];
          newUno[turnIndex] = true;
          setUnoStatus(newUno);
          addLog(`${botName} called UNO!`);
        }

        const playableCards = botHand.filter(c => isCardPlayable(c, activeColor, topCard));
        
        if (playableCards.length > 0) {
          playableCards.sort((a, b) => {
            if (a.type === 'wild' && b.type !== 'wild') return 1;
            if (a.type !== 'wild' && b.type === 'wild') return -1;
            return 0;
          });
          const cardToPlay = playableCards[0];
          
          if (cardToPlay.type === 'wild') {
            const colorCounts = { red: 0, yellow: 0, green: 0, blue: 0 };
            botHand.forEach(c => { if (c.color !== 'black') colorCounts[c.color]++; });
            let bestColor = 'red'; let maxCount = -1;
            Object.keys(colorCounts).forEach(col => {
              if (colorCounts[col] > maxCount) { maxCount = colorCounts[col]; bestColor = col; }
            });
            const bestColorCode = COLORS[COLOR_NAMES.indexOf(bestColor)];
            handlePlayCard(turnIndex, cardToPlay, false, bestColor, bestColorCode);
          } else {
            handlePlayCard(turnIndex, cardToPlay, false);
          }
        } else {
          const { cards, newDeck } = drawCards(1, deck);
          if (cards.length > 0) {
            const drawn = cards[0];
            setDeck(newDeck);
            const newHands = [...hands];
            newHands[turnIndex] = [...newHands[turnIndex], drawn];
            setHands(newHands);
            
            const newUno = [...unoStatus];
            newUno[turnIndex] = false;
            setUnoStatus(newUno); 
            addLog(`${botName} drew a card.`);
            
            if (isCardPlayable(drawn, activeColor, topCard)) {
               setTimeout(() => {
                 if (drawn.type === 'wild') handlePlayCard(turnIndex, drawn, false, 'red', COLORS[0]);
                 else handlePlayCard(turnIndex, drawn, false);
               }, 1000);
            } else setTurnIndex(getNextTurn(turnIndex, direction, players.length));
          } else setTurnIndex(getNextTurn(turnIndex, direction, players.length));
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [turnIndex, gameState, hands, activeColor, topCard, challengeState, drawnCardState, players, direction, deck]);

  const styles = `
    .uno-table {
      min-height: 100vh;
      background: url('/images/uno_bg.png') center/cover no-repeat;
      color: white;
      display: flex;
      flex-direction: column;
      font-family: 'Poppins', 'Inter', system-ui, sans-serif;
      position: absolute;
      inset: 0;
      overflow: hidden;
      perspective: 1200px;
    }
    
    .uno-table::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      pointer-events: none;
      z-index: 0;
    }

    .active-color-aura {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 50%, var(--active-glow) 0%, transparent 60%);
      opacity: 0.15;
      mix-blend-mode: screen;
      pointer-events: none;
      transition: background 0.8s ease;
    }

    /* Player Profiles */
    .player-profile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      position: absolute;
      z-index: 20;
    }
    .profile-pos-0 { bottom: 2rem; left: 50%; transform: translateX(-50%); }
    .profile-pos-top { top: 2rem; left: 50%; transform: translateX(-50%); }
    .profile-pos-left { top: 50%; left: 2rem; transform: translateY(-50%); }
    .profile-pos-right { top: 50%; right: 2rem; transform: translateY(-50%); }
    .profile-pos-top-left { top: 2rem; left: 25%; transform: translateX(-50%); }
    .profile-pos-top-right { top: 2rem; right: 25%; transform: translateX(50%); }
    
    .avatar-ring {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      padding: 4px;
      background: rgba(255,255,255,0.1);
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      transition: all 0.3s;
    }
    .avatar-ring.active {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      box-shadow: 0 0 20px #fbbf24;
      transform: scale(1.1);
    }
    
    .avatar-inner {
      width: 100%;
      height: 100%;
      background: #1e293b;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 2px solid #0f172a;
    }

    .profile-info {
      background: rgba(0,0,0,0.6);
      padding: 4px 16px;
      border-radius: 99px;
      font-weight: 600;
      font-size: 0.9rem;
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(4px);
    }

    /* UNO Cards */
    .uno-card {
      width: 110px;
      height: 165px;
      border-radius: 14px;
      position: relative;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: default;
      flex-shrink: 0;
      filter: drop-shadow(0 10px 15px rgba(0,0,0,0.6));
      transform-origin: bottom center;
    }
    
    .uno-card-border {
      width: 100%; height: 100%;
      background: white; border-radius: 14px; padding: 6px; box-sizing: border-box;
      box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
    }
    
    .uno-card-inner {
      width: 100%; height: 100%;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--card-color), color-mix(in srgb, var(--card-color) 70%, black));
      position: relative; overflow: hidden;
      display: flex; justify-content: center; align-items: center;
      box-shadow: inset 0 0 15px rgba(0,0,0,0.2);
    }

    .uno-card.hidden .hidden-inner { background: linear-gradient(135deg, #111827, #030712); border: 2px solid #1f2937; }
    .uno-card.hidden .hidden-oval { background: linear-gradient(135deg, #dc2626, #991b1b); border: 4px solid #facc15; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
    
    .uno-card-corner {
      position: absolute; font-size: 1.5rem; font-weight: 900; color: white;
      font-family: 'Arial Rounded MT Bold', 'Helvetica Rounded', sans-serif;
      text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0px 4px 4px rgba(0,0,0,0.5);
    }
    .top-left { top: 8px; left: 8px; }
    .bottom-right { bottom: 8px; right: 8px; transform: rotate(180deg); }

    .uno-card-oval {
      width: 85%; height: 55%;
      background: linear-gradient(135deg, #ffffff, #e2e8f0);
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      transform: rotate(-30deg);
      display: flex; justify-content: center; align-items: center;
      box-shadow: inset 0 8px 10px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.3);
    }

    .uno-card-center-val {
      font-size: 5rem; font-weight: 900; transform: rotate(30deg); color: var(--card-color);
      font-family: 'Arial Rounded MT Bold', 'Helvetica Rounded', sans-serif;
      -webkit-text-stroke: 2.5px black; text-shadow: 4px 4px 0 rgba(0,0,0,0.4);
    }
    
    .uno-logo-text {
      font-size: 2.2rem; font-weight: 900; transform: rotate(30deg); color: #facc15;
      font-family: 'Arial Rounded MT Bold', sans-serif;
      -webkit-text-stroke: 1.5px black; letter-spacing: -2px; text-shadow: 3px 3px 0 rgba(0,0,0,0.6);
    }

    /* Card Action SVGs */
    .uno-action-svg {
      width: 60px; height: 60px; transform: rotate(30deg); color: var(--card-color);
      filter: drop-shadow(3px 3px 0 black) drop-shadow(-1px -1px 0 black) drop-shadow(1px -1px 0 black) drop-shadow(-1px 1px 0 black);
    }
    .corner-icon { font-size: 1.2rem; }
    
    .draw-icon-container { position: relative; width: 60px; height: 60px; transform: rotate(30deg); }
    .draw-card {
      position: absolute; width: 35px; height: 45px; background: var(--card-color);
      border: 2px solid white; border-radius: 4px; display: flex; justify-content: center; align-items: center;
      color: white; font-weight: bold; font-size: 0.8rem; -webkit-text-stroke: 1px black; box-shadow: 2px 2px 0 black;
    }
    .draw-card.c1 { top: 0; left: 0; z-index: 1; } .draw-card.c2 { bottom: 0; right: 0; z-index: 2; }
    
    .wild-icon-container {
      width: 65px; height: 65px; border-radius: 50%; border: 3px solid white; transform: rotate(30deg);
      position: relative; overflow: hidden; box-shadow: 0 0 0 2px black;
    }
    .wild-quad { position: absolute; width: 50%; height: 50%; }
    .q1 { top: 0; left: 0; } .q2 { top: 0; right: 0; }
    .q3 { bottom: 0; left: 0; } .q4 { bottom: 0; right: 0; }
    
    .corner-wild-sphere {
      width: 20px; height: 20px; border-radius: 50%;
      background: conic-gradient(#ef4444 25%, #3b82f6 0 50%, #facc15 0 75%, #22c55e 0);
      border: 1.5px solid white; box-shadow: 0 0 0 1px black;
    }

    .draw4-container { position: relative; width: 70px; height: 70px; transform: rotate(30deg); }
    .d4-card {
      position: absolute; width: 30px; height: 40px; border: 2px solid white; border-radius: 4px;
      display: flex; justify-content: center; align-items: center;
      color: white; font-weight: bold; font-size: 0.7rem; -webkit-text-stroke: 1px black; box-shadow: 1px 1px 0 black;
    }
    .d4-card.red { top: 0; left: 5px; z-index: 1; transform: rotate(-10deg); }
    .d4-card.blue { top: 10px; right: 5px; z-index: 2; transform: rotate(10deg); }
    .d4-card.green { bottom: 5px; left: 0; z-index: 3; transform: rotate(-5deg); }
    .d4-card.yellow { bottom: 0; right: 10px; z-index: 4; transform: rotate(15deg); }

    .wild-text {
      background: linear-gradient(135deg, #ef4444 25%, #facc15 25% 50%, #22c55e 50% 75%, #3b82f6 75%);
      -webkit-background-clip: text; color: transparent; -webkit-text-stroke: 2px black;
    }

    /* Hands Layout */
    .uno-hand {
      display: flex; justify-content: center; position: absolute; z-index: 50;
    }
    
    .pos-bottom { bottom: 80px; left: 50%; transform: translateX(-50%); }
    .pos-top { top: 80px; left: 50%; transform: translateX(-50%) rotate(180deg); }
    .pos-left { top: 50%; left: -60px; transform: translateY(-50%) rotate(90deg); }
    .pos-right { top: 50%; right: -60px; transform: translateY(-50%) rotate(-90deg); }
    .pos-top-left { top: 80px; left: 25%; transform: translateX(-50%) rotate(135deg); }
    .pos-top-right { top: 80px; right: 25%; transform: translateX(50%) rotate(225deg); }

    .uno-card.playable { cursor: pointer; }
    .uno-card.playable:hover {
      transform: translateY(-30px) scale(1.1) rotate(2deg) !important;
      z-index: 100 !important; box-shadow: 0 0 30px rgba(255,255,255,0.4);
    }
    .drawn-highlight {
      transform: translateY(-40px) scale(1.15) !important;
      box-shadow: 0 0 40px rgba(250, 204, 21, 0.8) !important; z-index: 100 !important;
    }

    /* Center Board Area */
    .uno-board-center {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      display: flex; gap: 3rem; align-items: center;
    }
    
    .direction-indicator {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 400px; height: 400px; border-radius: 50%;
      border: 4px dashed rgba(255,255,255,0.1); pointer-events: none;
      animation: rotate-dir 20s linear infinite;
    }
    @keyframes rotate-dir { 100% { transform: translate(-50%, -50%) rotate(calc(360deg * var(--dir))); } }

    .uno-draw-pile { position: relative; cursor: pointer; transition: all 0.2s; }
    .uno-draw-pile:hover { transform: scale(1.05) translateY(-5px); }
    .uno-draw-pile:active { transform: scale(0.95); }
    .uno-draw-pile.disabled { cursor: default; }

    .uno-discard-pile { position: relative; transform: rotate(5deg); }
    
    .color-hub {
      position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
      background: var(--active-glow); padding: 4px 16px; border-radius: 99px;
      font-weight: 900; text-transform: uppercase;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5), 0 0 20px var(--active-glow);
      border: 2px solid white; text-shadow: 1px 1px 2px black; z-index: 10;
    }

    /* Giant UNO Button */
    .uno-mega-btn-container {
      position: absolute; right: 3rem; bottom: 8rem; z-index: 60;
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
    }
    .uno-mega-btn {
      width: 120px; height: 120px; border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #ef4444, #991b1b);
      border: 6px solid #facc15; color: #facc15; font-size: 2.2rem; font-weight: 900;
      font-family: 'Arial Rounded MT Bold', sans-serif; text-shadow: 2px 2px 0 black;
      box-shadow: 0 10px 20px rgba(0,0,0,0.5), inset 0 4px 15px rgba(255,255,255,0.4), inset 0 -8px 20px rgba(0,0,0,0.5);
      cursor: pointer; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      -webkit-text-stroke: 1.5px black; position: relative;
    }
    .uno-mega-btn::before {
      content: ''; position: absolute; top: 5px; left: 15%; width: 70%; height: 30%;
      background: linear-gradient(rgba(255,255,255,0.6), rgba(255,255,255,0)); border-radius: 50%;
    }
    .uno-mega-btn:hover { transform: scale(1.1) translateY(-5px); box-shadow: 0 15px 25px rgba(0,0,0,0.6), 0 0 30px #ef4444; }
    .uno-mega-btn:active { transform: scale(0.95); box-shadow: 0 5px 10px rgba(0,0,0,0.6); }
    .uno-mega-btn.safe {
      background: radial-gradient(circle at 30% 30%, #22c55e, #14532d); border-color: #4ade80; color: white;
    }
    .uno-mega-btn.disabled { filter: grayscale(100%); opacity: 0.5; pointer-events: none; }

    .catch-btn {
      background: radial-gradient(circle at 30% 30%, #a855f7, #6b21a8); border-color: #d8b4fe;
      animation: pulse-catch 1s infinite alternate;
    }
    @keyframes pulse-catch {
      from { transform: scale(1); box-shadow: 0 0 20px #a855f7; }
      to { transform: scale(1.1); box-shadow: 0 0 40px #a855f7; }
    }

    @keyframes popCenter { 0% { transform: scale(1.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    .played-anim { animation: popCenter 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

    /* Modal Overlays */
    .uno-modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
      z-index: 1000; display: flex; justify-content: center; align-items: center;
    }
    .uno-modal {
      background: linear-gradient(135deg, #1e293b, #0f172a); padding: 3rem; border-radius: 24px;
      border: 2px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 2px 20px rgba(255,255,255,0.05);
      text-align: center; max-width: 500px; width: 90%; animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes popIn { from { opacity: 0; transform: scale(0.8) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    
    .color-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2rem; }
    .color-btn {
      height: 100px; border-radius: 16px; border: 4px solid white; cursor: pointer; transition: all 0.2s;
      box-shadow: 0 8px 15px rgba(0,0,0,0.3); position: relative; overflow: hidden;
    }
    .color-btn::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 40%;
      background: linear-gradient(rgba(255,255,255,0.4), transparent);
    }
    .color-btn:hover { transform: scale(1.05); }

    /* HUD Elements */
    .uno-hud-top {
      position: absolute; top: 1.5rem; left: 1.5rem; right: 1.5rem; display: flex; justify-content: space-between; z-index: 20;
    }
    .uno-btn-flat {
      background: rgba(15,23,42,0.8); padding: 0.75rem 1.5rem; border-radius: 99px;
      border: 1px solid rgba(255,255,255,0.2); color: white; display: flex; align-items: center; gap: 0.5rem;
      cursor: pointer; transition: all 0.2s;
    }
    .uno-btn-flat:hover { background: rgba(30,41,59,0.9); }
    .uno-btn-lg {
      background: rgba(15,23,42,0.8); padding: 1.5rem 2.5rem; border-radius: 12px;
      border: 2px solid rgba(255,255,255,0.2); color: white; font-size: 1.5rem; font-weight: bold;
      cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 1rem;
      width: 300px;
    }
    .uno-btn-lg:hover { background: rgba(30,41,59,1); transform: scale(1.05); border-color: #3b82f6; }

    .score-board {
      display: flex; gap: 1rem; background: rgba(0,0,0,0.5); padding: 0.5rem 1.5rem; border-radius: 99px; flex-wrap: wrap; justify-content: center;
    }
    .score-entry { display: flex; align-items: center; gap: 0.5rem; font-weight: bold; }
    
    .logs-panel {
      position: absolute; left: 1.5rem; bottom: 1.5rem;
      background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0));
      padding: 2rem 1rem 1rem; border-radius: 12px; width: 300px;
      font-size: 0.95rem; color: #cbd5e1; z-index: 10;
      pointer-events: none; display: flex; flex-direction: column; justify-content: flex-end;
      height: 200px;
    }
  `;

  if (gameState === 'menu') {
    return (
      <div style={{ minHeight: '100vh', background: 'url("/images/uno_bg.png") center/cover no-repeat', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)'}}></div>
        <style>{styles}</style>
        <div style={{ textAlign: 'center', color: 'white', position: 'relative', zIndex: 10 }}>
          <div style={{ fontSize: '7rem', fontWeight: '900', color: '#ef4444', textShadow: '6px 6px 0 #facc15, 0 10px 20px rgba(0,0,0,0.8)', fontFamily: "'Arial Rounded MT Bold', sans-serif", letterSpacing: '-5px', marginBottom: '1rem', WebkitTextStroke: '3px black' }}>
            UNO
          </div>
          <p style={{ fontSize: '1.5rem', color: '#94a3b8', marginBottom: '3rem', fontWeight: 'bold' }}>First to {WINNING_SCORE} points wins!</p>
          
          {menuView === 'main' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <button onClick={() => setMenuView('bots')} className="uno-btn-lg" style={{ background: '#3b82f6' }}>
                <Bot size={28}/> Play VS Bots
              </button>
              <button onClick={() => setMenuView('local')} className="uno-btn-lg" style={{ background: '#8b5cf6' }}>
                <Users size={28}/> Local Multiplayer
              </button>
              <button onClick={() => navigate('/hub')} className="uno-btn-flat" style={{ marginTop: '2rem' }}>Back to Game Library</button>
            </div>
          )}

          {menuView === 'bots' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Play VS Bots</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => startGame(2, true)} className="uno-btn-flat" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>1 Bot (2P)</button>
                <button onClick={() => startGame(3, true)} className="uno-btn-flat" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>2 Bots (3P)</button>
                <button onClick={() => startGame(4, true)} className="uno-btn-flat" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>3 Bots (4P)</button>
              </div>
              <button onClick={() => setMenuView('main')} className="uno-btn-flat" style={{ marginTop: '2rem' }}>Back</button>
            </div>
          )}

          {menuView === 'local' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Local Multiplayer (Pass & Play)</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => startGame(2, false)} className="uno-btn-flat" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>2 Players</button>
                <button onClick={() => startGame(3, false)} className="uno-btn-flat" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>3 Players</button>
                <button onClick={() => startGame(4, false)} className="uno-btn-flat" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>4 Players</button>
              </div>
              <button onClick={() => setMenuView('main')} className="uno-btn-flat" style={{ marginTop: '2rem' }}>Back</button>
            </div>
          )}

        </div>
      </div>
    );
  }

  const calculateCardStyle = (index, total, isBotOrHidden = false) => {
    const angleRange = total > 5 ? 40 : total * 8;
    const step = total > 1 ? angleRange / (total - 1) : 0;
    const angle = -angleRange/2 + (index * step);
    const yOffset = Math.abs(angle) * 1.5;
    
    if (isBotOrHidden) {
      return { transform: `scale(0.65) rotate(${angle}deg) translateY(${yOffset}px)`, zIndex: index, marginLeft: index === 0 ? '0' : '-35px' };
    }
    return { transform: `rotate(${angle}deg) translateY(${yOffset}px)`, zIndex: index, marginLeft: index === 0 ? '0' : '-50px' };
  };

  const getHandLayoutClass = (idx, totalPlayers) => {
    if (idx === 0) return 'pos-bottom';
    if (totalPlayers === 2) return 'pos-top';
    if (totalPlayers === 3) return idx === 1 ? 'pos-top-left' : 'pos-top-right';
    if (totalPlayers === 4) return idx === 1 ? 'pos-left' : idx === 2 ? 'pos-top' : 'pos-right';
    return 'pos-top';
  };

  const getProfileLayoutClass = (idx, totalPlayers) => {
    if (idx === 0) return 'profile-pos-0';
    if (totalPlayers === 2) return 'profile-pos-top';
    if (totalPlayers === 3) return idx === 1 ? 'profile-pos-top-left' : 'profile-pos-top-right';
    if (totalPlayers === 4) return idx === 1 ? 'profile-pos-left' : idx === 2 ? 'profile-pos-top' : 'profile-pos-right';
    return 'profile-pos-top';
  };

  const isLocalMultiplayer = !players.some(p => p.isBot);

  return (
    <div className="uno-table" style={{ '--active-glow': activeColorCode || '#0f172a', '--dir': direction }}>
      <style>{styles}</style>
      <div className="active-color-aura" />

      {/* HUD */}
      <div className="uno-hud-top">
        <button className="uno-btn-flat" onClick={() => { setGameState('menu'); setMenuView('main'); }}>
          <ArrowLeft size={20} /> Quit
        </button>
        <div className="score-board">
          {players.map((p, i) => (
            <div key={i} className="score-entry">
              {p.isBot ? <Bot size={18} color="#ef4444"/> : <User size={18} color="#3b82f6"/>} 
              {p.name}: {scores[i]}
            </div>
          ))}
        </div>
        <div style={{ width: '100px' }} />
      </div>

      {/* RENDER PLAYERS */}
      {players.map((p, i) => {
        // Human cards are hidden if it's not their turn in local multiplayer, unless they are the challenge victim.
        const isCurrentTurn = turnIndex === i;
        let hidden = false;
        if (p.isBot) {
          hidden = true;
        } else if (isLocalMultiplayer && !isCurrentTurn) {
          hidden = true;
        }
        
        if (challengeState?.resolving && challengeState.victim === i) {
          hidden = false;
        }

        const canInteract = !p.isBot && isCurrentTurn && !showColorPicker && !challengeState && !drawnCardState;

        return (
          <React.Fragment key={`player-${i}`}>
            <div className={`player-profile ${getProfileLayoutClass(i, players.length)}`}>
              {i !== 0 && <div className="profile-info">{p.name} • {hands[i].length} Cards</div>}
              <div className={`avatar-ring ${turnIndex === i ? 'active' : ''}`}>
                <div className="avatar-inner">
                  {p.isBot ? <Bot size={32} color={turnIndex === i ? '#fcd34d' : '#94a3b8'} /> : <User size={32} color={turnIndex === i ? '#fcd34d' : '#94a3b8'} />}
                </div>
              </div>
              {i === 0 && <div className="profile-info" style={{marginTop:'0.5rem'}}>{p.name} • {hands[i].length} Cards</div>}
            </div>

            <div className={`uno-hand ${getHandLayoutClass(i, players.length)}`}>
              {hands[i].map((c, cIdx) => {
                const isPlayable = canInteract && isCardPlayable(c, activeColor, topCard);
                const isDrawn = canInteract && drawnCardState && drawnCardState.card.id === c.id;
                
                return (
                  <UnoCard 
                    key={c.id} 
                    card={!hidden ? c : null} 
                    hidden={hidden} 
                    small={i !== 0 || hidden}
                    isPlayable={isPlayable || isDrawn}
                    isDrawn={isDrawn}
                    styleParams={calculateCardStyle(cIdx, hands[i].length, i !== 0 || hidden)}
                    onClick={() => {
                      if (isPlayable) handlePlayCard(i, c, true);
                      if (isDrawn) playDrawnCard();
                    }}
                  />
                );
              })}
            </div>
          </React.Fragment>
        );
      })}

      {/* Center Board */}
      <div className="uno-board-center">
        <div className="direction-indicator" />
        
        <div className={`uno-draw-pile ${!isCurrentHuman || showColorPicker || challengeState || drawnCardState ? 'disabled' : ''}`} onClick={handleDrawClick}>
          <div style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 1, filter: 'brightness(0.7)' }}><UnoCard hidden /></div>
          <div style={{ position: 'absolute', top: '3px', left: '3px', zIndex: 2, filter: 'brightness(0.85)' }}><UnoCard hidden /></div>
          <div style={{ position: 'relative', zIndex: 3 }}><UnoCard hidden /></div>
          <div style={{position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', fontWeight: '900', letterSpacing: '0.1em', background: isCurrentHuman ? '#22c55e' : 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 12px', borderRadius: '99px', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', transition: 'all 0.3s', zIndex: 10}}>
            DRAW
          </div>
          {deck.length === 0 && <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 20}}><RefreshCw size={32}/></div>}
        </div>
        
        <div className="uno-discard-pile">
          {topCard && (
            <div key={topCard.id} className="played-anim">
              <UnoCard card={topCard} />
            </div>
          )}
          <div className="color-hub" style={{ color: activeColorCode === '#facc15' ? 'black' : 'white' }}>
            {activeColor}
          </div>
        </div>
      </div>

      {/* Giant UNO Button */}
      <div className="uno-mega-btn-container">
        {isCurrentHuman && (
          <button 
            className={`uno-mega-btn ${unoStatus[turnIndex] ? 'safe' : ''} ${hands[turnIndex]?.length > 2 ? 'disabled' : ''}`}
            onClick={() => callUno(turnIndex)}
          >
            {unoStatus[turnIndex] ? 'SAFE' : 'UNO'}
          </button>
        )}
        
        {canCatchState.active && isCurrentHuman && (
          <button className="uno-mega-btn catch-btn" onClick={() => catchOpponent(turnIndex)} style={{ fontSize: '1.5rem', width: '90px', height: '90px' }}>
            CATCH!
          </button>
        )}
      </div>

      {/* Logs */}
      <div className="logs-panel">
        {logs.slice().reverse().map((log, i) => (
          <div key={i} style={{ marginBottom: '0.5rem', opacity: 1 - (logs.length - 1 - i) * 0.25, fontWeight: i === logs.length - 1 ? 'bold' : 'normal', color: i === logs.length - 1 ? 'white' : 'inherit' }}>
            {log}
          </div>
        ))}
      </div>

      {/* Overlays */}
      {showColorPicker && (
        <div className="uno-modal-overlay">
          <div className="uno-modal">
            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Choose Color</h2>
            <div className="color-grid">
              {COLOR_NAMES.map((col, idx) => (
                <button 
                  key={col} 
                  className="color-btn" 
                  style={{ backgroundColor: COLORS[idx] }}
                  onClick={() => {
                    setShowColorPicker(false);
                    const card = pendingWildCard;
                    setPendingWildCard(null);
                    handlePlayCard(turnIndex, card, true, col, COLORS[idx]);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {drawnCardState && (
        <div className="uno-modal-overlay">
          <div className="uno-modal">
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Drawn Card</h2>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
              <UnoCard card={drawnCardState.card} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {drawnCardState.isPlayable && (
                <button onClick={playDrawnCard} className="uno-btn-flat" style={{ background: '#22c55e', fontSize: '1.2rem', padding: '1rem 2rem' }}>Play It</button>
              )}
              <button onClick={keepDrawnCard} className="uno-btn-flat" style={{ background: '#334155', fontSize: '1.2rem', padding: '1rem 2rem' }}>Keep It</button>
            </div>
          </div>
        </div>
      )}

      {challengeState && !challengeState.resolving && !players[challengeState.challenger].isBot && (
        <div className="uno-modal-overlay">
          <div className="uno-modal">
            <AlertTriangle size={60} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ color: '#ef4444', fontSize: '2.5rem', margin: 0 }}>+4 Challenge!</h2>
            <p style={{ fontSize: '1.2rem', color: '#cbd5e1', margin: '1.5rem 0' }}>
              {players[challengeState.victim].name} played a +4. Challenge them?<br/><br/>
              <span style={{color:'white'}}>Win:</span> They draw 4.<br/>
              <span style={{color:'white'}}>Lose:</span> You draw 6!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => handleChallenge(true)} className="uno-btn-flat" style={{ background: '#ef4444', fontSize: '1.2rem', padding: '1rem 2rem' }}>CHALLENGE</button>
              <button onClick={() => handleChallenge(false)} className="uno-btn-flat" style={{ background: '#3b82f6', fontSize: '1.2rem', padding: '1rem 2rem' }}>ACCEPT (+4)</button>
            </div>
          </div>
        </div>
      )}
      
      {challengeState && challengeState.resolving && (
        <div className="uno-modal-overlay">
          <div className="uno-modal" style={{ maxWidth: '800px' }}>
            <h2>{players[challengeState.victim].name}'s Hand</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: '2rem 0', flexWrap: 'wrap' }}>
              {challengeState.victimHand.map(c => <UnoCard key={c.id} card={c} />)}
            </div>
            <h1 style={{ color: challengeState.result ? '#22c55e' : '#ef4444', fontSize: '3rem', margin: 0 }}>
              {challengeState.result ? `${players[challengeState.victim].name.toUpperCase()} CHEATED!` : 'PLAYED LEGALLY!'}
            </h1>
            <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
              {challengeState.result ? `${players[challengeState.victim].name} draws 4 cards.` : `${players[challengeState.challenger].name} draws 6 cards.`}
            </p>
          </div>
        </div>
      )}

      {(gameState === 'roundOver' || gameState === 'gameOver') && (
        <div className="uno-modal-overlay">
          <div className="uno-modal">
            <Trophy size={80} color="#facc15" style={{ margin: '0 auto 1rem', filter: 'drop-shadow(0 4px 10px rgba(250,204,21,0.5))' }} />
            <h1 style={{ fontSize: '3.5rem', margin: 0 }}>{gameState === 'gameOver' ? 'MATCH OVER' : 'ROUND OVER'}</h1>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-around', margin: '3rem 0', fontSize: '1.5rem', fontWeight: '900' }}>
              {players.map((p, i) => (
                <div key={i} style={{ color: i === 0 ? '#3b82f6' : '#ef4444' }}>
                  {p.name}<br/><span style={{fontSize:'3rem'}}>{scores[i]}</span>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => {
                if (gameState === 'gameOver') {
                  setScores(Array(players.length).fill(0));
                  setRound(1);
                } else {
                  setRound(r => r + 1);
                }
                startRound(players);
              }}
              className="uno-btn-flat" style={{ width: '100%', justifyContent: 'center', background: '#22c55e', fontSize: '1.5rem', padding: '1.5rem', fontWeight: '900' }}
            >
              {gameState === 'gameOver' ? 'PLAY AGAIN' : 'NEXT ROUND'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
