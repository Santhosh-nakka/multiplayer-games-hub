import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        :root {
          --void: #030308;
          --deep: #0a0a16;
          --text: #f2f0fa;
          --muted: #8f8ba8;
          --amber: #ffb870;
          --ice: #7fc8ff;
        }
        .content {
          position: relative; z-index: 2; min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; color: var(--text); padding: 2rem 24px; pointer-events: none;
        }
        .eyebrow {
          letter-spacing: 0.3em; text-transform: uppercase; font-size: 14px;
          color: var(--amber); margin-bottom: 24px; font-weight: 700;
          text-shadow: 0 0 10px rgba(255, 184, 112, 0.5);
        }
        .title-game-night {
          font-size: clamp(40px, 8vw, 90px); margin: 0 0 24px; font-weight: 800; letter-spacing: -0.02em;
          filter: drop-shadow(0px 4px 20px rgba(0,0,0,0.5));
          display: flex; justify-content: center;
        }
        .title-game-night span {
          background: linear-gradient(120deg, #ffffff 15%, var(--amber) 55%, var(--ice) 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          padding-bottom: 0.2em;
        }
        p.sub { 
          max-width: 600px; 
          color: rgba(255, 255, 255, 0.85); 
          font-size: 18px; 
          line-height: 1.8; 
          margin: 0; 
          text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        }
        
        .text-golden {
          font-family: 'Times New Roman', serif;
          font-weight: 900;
          letter-spacing: 3px;
          text-transform: uppercase;
          background: linear-gradient(to bottom, #d4af37 0%, #fff2cd 25%, #d4af37 50%, #f3e5ab 75%, #aa771c 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0px 3px 2px rgba(0,0,0,0.8)) drop-shadow(0px -1px 1px rgba(255,255,255,0.4));
          display: inline-block;
        }
        
        #hint {
          position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%);
          z-index: 2; font-size: 13px; color: rgba(255,255,255,0.6); letter-spacing: 0.1em;
          text-transform: uppercase; pointer-events: none;
          text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        }

        .enter-btn-wrapper {
          margin-top: 50px;
          pointer-events: auto;
        }

        .enter-btn {
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.5);
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.4), inset 0 0 10px rgba(212, 175, 55, 0.2);
          color: #ffffff;
          padding: 1rem 3rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 3px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        }

        .enter-btn:hover {
          background: rgba(212, 175, 55, 0.25);
          border-color: rgba(212, 175, 55, 0.8);
          box-shadow: 0 0 25px rgba(212, 175, 55, 0.6), inset 0 0 15px rgba(212, 175, 55, 0.4);
          transform: translateY(-2px);
        }
      `}</style>
      
      <div className="content">
        <div className="eyebrow" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span className="text-golden" style={{ fontSize: '48px', margin: '0' }}>SANTHOSH</span>
          <span style={{ fontSize: '18px', letterSpacing: '4px' }}>Multiplayer Games</span>
        </div>
        <h1 className="title-game-night" style={{ display: 'flex', justifyContent: 'center' }}>
          {"Game Night".split('').map((char, index) => (
            <span key={index} className="wave-jiggle" style={{ animationDelay: `${(index + 1) * 0.05}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
        <p className="sub" style={{ cursor: 'default', pointerEvents: 'auto' }}>
          {"More games, one table. Move your cursor near a piece and it drifts closer, catching the light.".split('').map((char, index) => (
            <span key={index} className={char !== ' ' ? "hover-letter" : ""}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </p>
        
        <div className="enter-btn-wrapper">
          <button 
            onClick={() => navigate('/hub')} 
            className="enter-btn"
          >
            Enter Hub
          </button>
        </div>
      </div>
      <div id="hint">Move mouse near a piece to draw it in</div>
    </>
  );
}
