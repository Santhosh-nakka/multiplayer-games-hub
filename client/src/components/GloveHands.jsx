import React from 'react';

// Left-facing hands are default (we build right-facing and use scaleX(-1) for the right side)
// These SVGs create cartoonish gloves with skin-colored arms as requested by the user.

export const HandRock = ({ className, style, flipped }) => (
  <svg 
    viewBox="0 0 200 120" 
    className={className} 
    style={{ ...style, transform: flipped ? 'scaleX(-1)' : 'none', overflow: 'visible' }} 
    width="100%" 
    height="100%"
  >
    {/* Arm */}
    <rect x="-50" y="40" width="120" height="40" fill="#fcd3b6" stroke="#000" strokeWidth="4" />
    
    {/* Cuff */}
    <rect x="55" y="25" width="25" height="70" rx="12" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    
    {/* Palm base */}
    <ellipse cx="110" cy="60" rx="35" ry="45" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    
    {/* Folded Fingers (Pinky to Index) */}
    <rect x="120" y="80" width="35" height="22" rx="11" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    <rect x="130" y="60" width="35" height="22" rx="11" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    <rect x="135" y="40" width="35" height="22" rx="11" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    <rect x="130" y="20" width="35" height="22" rx="11" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    
    {/* Thumb crossing over */}
    <rect x="90" y="30" width="60" height="25" rx="12" fill="#d1d5db" stroke="#000" strokeWidth="4" transform="rotate(25 90 30)" />
  </svg>
);

export const HandPaper = ({ className, style, flipped }) => (
  <svg 
    viewBox="0 0 220 120" 
    className={className} 
    style={{ ...style, transform: flipped ? 'scaleX(-1)' : 'none', overflow: 'visible' }} 
    width="100%" 
    height="100%"
  >
    {/* Arm */}
    <rect x="-50" y="40" width="120" height="40" fill="#fcd3b6" stroke="#000" strokeWidth="4" />
    
    {/* Cuff */}
    <rect x="55" y="25" width="25" height="70" rx="12" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    
    {/* Fingers extended (Bottom to top: Pinky, Ring, Middle, Index) */}
    <rect x="100" y="80" width="65" height="18" rx="9" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    <rect x="105" y="60" width="75" height="18" rx="9" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    <rect x="110" y="40" width="80" height="18" rx="9" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    <rect x="100" y="20" width="70" height="18" rx="9" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    
    {/* Thumb extending up/forward */}
    <rect x="80" y="0" width="18" height="50" rx="9" fill="#d1d5db" stroke="#000" strokeWidth="4" transform="rotate(35 80 0)" />
    
    {/* Palm overlay to connect fingers smoothly */}
    <rect x="75" y="25" width="40" height="65" rx="10" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    
    {/* Erase inner lines of fingers connected to palm */}
    <rect x="90" y="22" width="25" height="74" fill="#d1d5db" />
  </svg>
);

export const HandScissors = ({ className, style, flipped }) => (
  <svg 
    viewBox="0 0 220 120" 
    className={className} 
    style={{ ...style, transform: flipped ? 'scaleX(-1)' : 'none', overflow: 'visible' }} 
    width="100%" 
    height="100%"
  >
    {/* Arm */}
    <rect x="-50" y="40" width="120" height="40" fill="#fcd3b6" stroke="#000" strokeWidth="4" />
    
    {/* Cuff */}
    <rect x="55" y="25" width="25" height="70" rx="12" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    
    {/* Palm base */}
    <ellipse cx="110" cy="60" rx="35" ry="45" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    
    {/* Folded Pinky and Ring */}
    <rect x="120" y="80" width="35" height="22" rx="11" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    <rect x="130" y="60" width="35" height="22" rx="11" fill="#d1d5db" stroke="#000" strokeWidth="4" />
    
    {/* Extended Middle and Index */}
    <rect x="130" y="40" width="70" height="18" rx="9" fill="#d1d5db" stroke="#000" strokeWidth="4" transform="rotate(8 130 40)"/>
    <rect x="120" y="20" width="75" height="18" rx="9" fill="#d1d5db" stroke="#000" strokeWidth="4" transform="rotate(-8 120 20)"/>
    
    {/* Clear base lines of extended fingers to merge with palm */}
    <circle cx="120" cy="40" r="15" fill="#d1d5db" />
    <circle cx="125" cy="55" r="12" fill="#d1d5db" />

    {/* Thumb folded over */}
    <rect x="90" y="50" width="55" height="24" rx="12" fill="#d1d5db" stroke="#000" strokeWidth="4" transform="rotate(20 90 50)" />
  </svg>
);
