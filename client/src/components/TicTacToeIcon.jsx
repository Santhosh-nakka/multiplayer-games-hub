import React from 'react';

export default function TicTacToeIcon({ size = 80, style = {} }) {
  const scale = size / 400;

  return (
    <div style={{
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    }}>
      <div 
        className="board-3d" 
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'center',
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 120px)',
          gap: '12px',
          padding: '12px'
        }}
      >
        <div className="cell-3d" style={{ width: '120px', height: '120px' }}>
          <div className="piece-o-3d"></div>
        </div>
        <div className="cell-3d" style={{ width: '120px', height: '120px' }}>
          <div className="piece-x-3d"></div>
        </div>
        <div className="cell-3d" style={{ width: '120px', height: '120px' }}>
          <div className="piece-o-3d"></div>
        </div>
        <div className="cell-3d" style={{ width: '120px', height: '120px' }}>
          <div className="piece-x-3d"></div>
        </div>
        <div className="cell-3d" style={{ width: '120px', height: '120px' }}>
          <div className="piece-x-3d"></div>
        </div>
        <div className="cell-3d" style={{ width: '120px', height: '120px' }}></div>
        <div className="cell-3d" style={{ width: '120px', height: '120px' }}>
          <div className="piece-o-3d"></div>
        </div>
        <div className="cell-3d" style={{ width: '120px', height: '120px' }}></div>
        <div className="cell-3d" style={{ width: '120px', height: '120px' }}>
          <div className="piece-x-3d"></div>
        </div>
      </div>
    </div>
  );
}
