import React from 'react';

export default function RockPaperScissorsIcon({ size = 80, style = {} }) {
  return (
    <div style={{
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '2px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
      ...style
    }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Background Bands */}
        <rect x="0" y="0" width="33.3" height="100" fill="#32a832" />
        <rect x="33.3" y="0" width="33.4" height="100" fill="#d93838" />
        <rect x="66.7" y="0" width="33.3" height="100" fill="#3268d6" />
        
        {/* Polka Dots */}
        <circle cx="16" cy="20" r="5" fill="rgba(0,0,0,0.08)" />
        <circle cx="16" cy="50" r="5" fill="rgba(0,0,0,0.08)" />
        <circle cx="50" cy="35" r="5" fill="rgba(0,0,0,0.08)" />
        <circle cx="50" cy="65" r="5" fill="rgba(0,0,0,0.08)" />
        <circle cx="83" cy="20" r="5" fill="rgba(0,0,0,0.08)" />
        <circle cx="83" cy="50" r="5" fill="rgba(0,0,0,0.08)" />
        
        {/* Bottom Buttons */}
        <rect x="2" y="82" width="29.3" height="16" rx="3" fill="#72ca1f" stroke="#fff" strokeWidth="1" />
        <rect x="33.3" y="82" width="33.4" height="16" rx="3" fill="#e53935" stroke="#fff" strokeWidth="1" />
        <rect x="68.7" y="82" width="29.3" height="16" rx="3" fill="#29b6f6" stroke="#fff" strokeWidth="1" />
        
        {/* Button Text (Simulated) */}
        <g fill="#fff" fontSize="5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
          <text x="16.5" y="90">GREEN</text>
          <text x="16.5" y="95">WINS</text>
          <text x="50" y="93" fontSize="6">DRAW</text>
          <text x="83.5" y="90">BLUE</text>
          <text x="83.5" y="95">WINS</text>
        </g>
        
        {/* Left Hand (Rock) */}
        <g transform="translate(10, 45)">
          {/* Arm */}
          <rect x="-15" y="-4" width="20" height="8" fill="#fcd3b6" stroke="#000" strokeWidth="1" />
          {/* Cuff */}
          <rect x="2" y="-6" width="4" height="12" rx="2" fill="#d1d5db" stroke="#000" strokeWidth="1" />
          {/* Fist */}
          <circle cx="12" cy="0" r="7" fill="#d1d5db" stroke="#000" strokeWidth="1" />
          <circle cx="16" cy="-4" r="3" fill="#d1d5db" stroke="#000" strokeWidth="0.5" />
          <circle cx="17" cy="0" r="3" fill="#d1d5db" stroke="#000" strokeWidth="0.5" />
          <circle cx="16" cy="4" r="3" fill="#d1d5db" stroke="#000" strokeWidth="0.5" />
        </g>
        
        {/* Right Hand (Scissors) */}
        <g transform="translate(90, 45) scale(-1, 1)">
          {/* Arm */}
          <rect x="-15" y="-4" width="20" height="8" fill="#fcd3b6" stroke="#000" strokeWidth="1" />
          {/* Cuff */}
          <rect x="2" y="-6" width="4" height="12" rx="2" fill="#d1d5db" stroke="#000" strokeWidth="1" />
          {/* Base Hand */}
          <circle cx="12" cy="0" r="6" fill="#d1d5db" stroke="#000" strokeWidth="1" />
          {/* Extended Fingers */}
          <rect x="12" y="-5" width="14" height="3" rx="1.5" fill="#d1d5db" stroke="#000" strokeWidth="1" transform="rotate(-10 12 -5)" />
          <rect x="12" y="-1" width="14" height="3" rx="1.5" fill="#d1d5db" stroke="#000" strokeWidth="1" transform="rotate(10 12 -1)" />
        </g>
      </svg>
    </div>
  );
}
