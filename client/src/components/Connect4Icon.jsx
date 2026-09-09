import React from 'react';

export default function Connect4Icon({ size = 80, style = {} }) {
  const scale = size / 400; // Normalize scale assuming a ~400px base design

  const renderCell = (player) => {
    if (!player) {
      return (
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: '#020617',
          boxShadow: 'inset 0 6px 12px rgba(0,0,0,1), inset 0 -1px 3px rgba(255,255,255,0.2)'
        }} />
      );
    }
    const bg = player === 1 
      ? 'radial-gradient(circle at 35% 25%, #fca5a5 0%, #ef4444 40%, #7f1d1d 90%)'
      : 'radial-gradient(circle at 35% 25%, #fef08a 0%, #eab308 40%, #713f12 90%)';
    const shadow = player === 1
      ? '0 3px 0 #7f1d1d, 0 6px 10px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.5)'
      : '0 3px 0 #713f12, 0 6px 10px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.7)';
    const innerBorder = player === 1 ? 'rgba(252, 165, 165, 0.3)' : 'rgba(254, 240, 138, 0.4)';
    
    return (
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: bg, boxShadow: shadow, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          position: 'absolute', inset: '5px', borderRadius: '50%',
          border: `1.5px solid ${innerBorder}`, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
        }} />
        {/* Subtle highlight dot */}
        <div style={{
          position: 'absolute', top: '10px', left: '12px', width: '4px', height: '4px',
          background: 'rgba(255,255,255,0.4)', borderRadius: '50%'
        }} />
      </div>
    );
  };

  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        background: 'linear-gradient(145deg, #2563eb, #1d4ed8)',
        padding: '16px',
        borderRadius: '16px',
        boxShadow: '0 10px 0 #1e3a8a, 0 15px 30px rgba(0,0,0,0.8), inset 0 2px 8px rgba(255,255,255,0.3)',
        display: 'flex', flexDirection: 'column', gap: '8px',
        border: '1.5px solid #3b82f6',
        transformStyle: 'preserve-3d'
      }}>
        {/* Slider Track (Miniature) */}
        <div style={{ position: 'relative', width: '328px', height: '40px', marginBottom: '8px' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '24px', right: '24px', height: '6px',
            marginTop: '-3px', background: 'rgba(0,0,0,0.4)', borderRadius: '3px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)'
          }} />
          <div style={{ position: 'absolute', left: '144px', top: '0' }}>
            {renderCell(2)}
          </div>
        </div>

        {/* Board rows (matching the provided screenshot exactly) */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[0,0,0,0,0,0,0].map((c,i) => <div key={i}>{renderCell(c===0 ? null : c)}</div>)}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[0,0,0,0,0,0,0].map((c,i) => <div key={i}>{renderCell(c===0 ? null : c)}</div>)}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[0,0,0,2,0,0,2].map((c,i) => <div key={i}>{renderCell(c===0 ? null : c)}</div>)}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[0,0,0,1,0,2,1].map((c,i) => <div key={i}>{renderCell(c===0 ? null : c)}</div>)}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[0,1,0,2,0,1,2].map((c,i) => <div key={i}>{renderCell(c===0 ? null : c)}</div>)}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1,2,0,1,2,1,1].map((c,i) => <div key={i}>{renderCell(c===0 ? null : c)}</div>)}
        </div>
      </div>
    </div>
  );
}
