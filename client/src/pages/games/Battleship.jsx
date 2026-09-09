import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const RAW_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@500;600;700&display=swap');

:root{
  --bg:#060b1f;
  --bg-grad:#0b1740;
  --panel:#0e1840;
  --panel-2:#132152;
  --line: rgba(120,170,255,.16);
  --line-strong: rgba(140,190,255,.32);
  --cyan:#2fe2ff;
  --cyan-dim:#1a8fae;
  --cyan-soft: rgba(47,226,255,.14);
  --amber:#ffb43d;
  --danger:#ff4d63;
  --danger-soft: rgba(255,77,99,.18);
  --ok:#35f2a6;
  --ink:#e9f1ff;
  --ink-dim:#8391c4;
  --fog:#4c5a99;
  --cell: 38px;
  --cell-sm: 20px;
}
.broadside-wrapper * {box-sizing:border-box;}
.broadside-wrapper {
  position: fixed;
  inset: 0;
  z-index: 100;
  overflow-y: auto;
  overflow-x: hidden;
  background:
    radial-gradient(1200px 700px at 20% -10%, rgba(47,226,255,.2), transparent 60%),
    linear-gradient(to bottom, rgba(6,11,31,0.65) 0%, rgba(11,23,64,0.85) 100%),
    url('/images/battleship_bg.png') center/cover no-repeat fixed;
  color:var(--ink);
  font-family:'Rajdhani', sans-serif;
  -webkit-font-smoothing:antialiased;
}
.broadside-wrapper .noise{
  position:fixed; inset:0; pointer-events:none; z-index:0; opacity:.035; mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.broadside-wrapper .wrap{position:relative; z-index:1; max-width:1180px; margin:0 auto; padding:18px 20px 60px;}

/* Top bar */
.broadside-wrapper .topbar{display:flex; align-items:center; justify-content:space-between; padding:6px 2px 22px;}
.broadside-wrapper .back{
  display:flex; align-items:center; gap:8px; color:var(--ink-dim); text-decoration:none;
  font-weight:600; letter-spacing:.03em; font-size:15px; cursor:pointer; background:none; border:none;
  font-family:inherit;
}
.broadside-wrapper .back:hover{color:var(--ink);}
.broadside-wrapper .status-chip{
  display:flex; align-items:center; gap:10px; padding:7px 16px; border-radius:999px;
  background:var(--panel); border:1px solid var(--line); font-size:13px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-dim);
}
.broadside-wrapper .status-dot{width:8px; height:8px; border-radius:50%; background:var(--cyan); box-shadow:0 0 8px var(--cyan); animation:pulse-dot 1.8s ease-in-out infinite;}
@keyframes pulse-dot{0%,100%{opacity:1; transform:scale(1);} 50%{opacity:.4; transform:scale(.7);}}

/* Header / turn title */
.broadside-wrapper .turn-head{text-align:center; margin-bottom:6px;}
.broadside-wrapper .eyebrow{
  display:inline-flex; align-items:center; gap:8px; font-size:12.5px; letter-spacing:.28em; text-transform:uppercase;
  color:var(--cyan); font-weight:700; margin-bottom:10px;
}
.broadside-wrapper .eyebrow .ring{width:9px;height:9px;border:2px solid var(--cyan); border-radius:50%; position:relative;}
.broadside-wrapper h1.turn-title{
  font-family:'Orbitron', sans-serif; font-weight:900; font-size:clamp(28px,4.4vw,44px);
  margin:0 0 4px; letter-spacing:.02em;
  background:linear-gradient(180deg,#ffffff, var(--cyan));
  -webkit-background-clip:text; background-clip:text; color:transparent;
  text-shadow:0 0 40px rgba(47,226,255,.25);
}
.broadside-wrapper .turn-sub{color:var(--ink-dim); font-size:15px; letter-spacing:.04em; margin-bottom:22px;}

/* stage card */
.broadside-wrapper .stage{
  position:relative; max-width:960px; margin:0 auto; border-radius:22px;
  background:linear-gradient(180deg, var(--panel), var(--panel-2));
  border:1px solid var(--line); padding:26px 24px 30px; overflow:hidden;
  box-shadow: 0 30px 80px -30px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.03);
}
.broadside-wrapper .sweep{
  position:absolute; inset:-40%; z-index:0; opacity:.5; pointer-events:none;
  background:conic-gradient(from 0deg, transparent 0deg, rgba(47,226,255,.12) 18deg, transparent 40deg, transparent 360deg);
  animation:sweep-rot 6s linear infinite;
}
@keyframes sweep-rot{ to{ transform:rotate(360deg); } }
.broadside-wrapper .stage > *:not(.sweep){position:relative; z-index:1;}

.broadside-wrapper .panel-label{
  display:flex; align-items:center; justify-content:center; gap:8px;
  font-size:13.5px; letter-spacing:.18em; text-transform:uppercase; color:var(--ink-dim); font-weight:700;
  margin-bottom:14px;
}
.broadside-wrapper .panel-label svg{width:15px;height:15px;}

/* layout: board + tray */
.broadside-wrapper .setup-layout{display:flex; gap:30px; align-items:flex-start; justify-content:center; flex-wrap:wrap;}
.broadside-wrapper .board-col{display:flex; flex-direction:column; align-items:center; gap:14px;}

.broadside-wrapper .board{
  display:grid; grid-template-columns:repeat(10, var(--cell)); grid-template-rows:repeat(10, var(--cell));
  gap:3px; position:relative; padding:10px; background:rgba(4,9,26,.5); border-radius:12px; border:1px solid var(--line);
  touch-action:none;
  transform: perspective(1000px) rotateX(55deg) rotateZ(-45deg);
  transform-style: preserve-3d;
  box-shadow: -4px 4px 0 rgba(4,9,26,0.8), -8px 8px 15px rgba(0,0,0,0.8);
  margin: 60px 100px;
}
.broadside-wrapper .board.enemy{cursor:crosshair;}
.broadside-wrapper .cell{
  width:var(--cell); height:var(--cell); border-radius:5px; background:#101d49;
  border:1px solid rgba(47,226,255,.2); position:relative; transition:background .15s, border-color .15s, box-shadow .15s;
  transform-style: preserve-3d;
}
.broadside-wrapper .board.setup .cell.valid-drop{background:rgba(53,242,166,.18); border-color:var(--ok);}
.broadside-wrapper .board.setup .cell.invalid-drop{background:rgba(255,77,99,.18); border-color:var(--danger);}
.broadside-wrapper .board.enemy .cell:not(.taken):hover{background:var(--danger-soft); border-color:var(--danger); box-shadow:0 0 0 1px var(--danger) inset;}
.broadside-wrapper .board.enemy .cell.taken{cursor:default;}

/* ship visuals (own board, absolutely positioned overlay) */
.broadside-wrapper .ship-layer{position:absolute; left:10px; top:10px; pointer-events:none; transform-style: preserve-3d; transform: translateZ(5px);}
.broadside-wrapper .ship-piece{
  position:absolute; pointer-events:auto; cursor:grab;
  transition:filter .15s;
  transform-style: preserve-3d;
}
.broadside-wrapper .ship-piece.dragging{opacity:.6;}
.broadside-wrapper .ship-piece.placed:hover .top-slice{ filter: brightness(1.2); }

.broadside-wrapper .voxel-slice {
  position:absolute; inset:0;
}
.broadside-wrapper .voxel-slice::after{
  content:''; position:absolute; inset:0; border-radius:inherit;
  background:linear-gradient(180deg, rgba(255,255,255,.15), transparent 60%);
  pointer-events:none;
}

/* --- Ship silhouettes by class --- */
.broadside-wrapper .voxel-slice.hull-carrier{
  background:linear-gradient(135deg,#7c8bb3,#33406a); border-radius:7px;
}
.broadside-wrapper .voxel-slice.hull-battleship{
  background:linear-gradient(135deg,#57647c,#20283b); border-radius:6px;
}
.broadside-wrapper .voxel-slice.hull-cruiser{
  background:linear-gradient(135deg,#3f74e0,#193a86); border-radius:9px;
}
.broadside-wrapper .voxel-slice.hull-cruiser.h{ clip-path:polygon(0 14%, 84% 14%, 100% 50%, 84% 86%, 0 86%); }
.broadside-wrapper .voxel-slice.hull-cruiser.v{ clip-path:polygon(14% 0, 86% 0, 86% 84%, 50% 100%, 14% 84%); }
.broadside-wrapper .voxel-slice.hull-submarine{
  background:linear-gradient(135deg,#454c63,#15182a); border-radius:999px;
}
.broadside-wrapper .voxel-slice.hull-destroyer{
  background:linear-gradient(135deg,#c2646f,#5f232c); border-radius:6px;
}
.broadside-wrapper .voxel-slice.hull-destroyer.h{ clip-path:polygon(0 22%, 90% 8%, 100% 50%, 90% 92%, 0 78%); }
.broadside-wrapper .voxel-slice.hull-destroyer.v{ clip-path:polygon(22% 0, 8% 90%, 50% 100%, 92% 90%, 78% 0); }

.broadside-wrapper .voxel-slice.sunk-hull{
  background:linear-gradient(135deg,#5a2c33,#22131c) !important; filter:saturate(.55) brightness(.85);
}

/* deck decorations, positioned within the ship box via inline left/top */
.broadside-wrapper .deck-runway{ position:absolute; border-radius:2px; background:repeating-linear-gradient(90deg, rgba(255,255,255,.6) 0 6px, transparent 6px 12px); }
.broadside-wrapper .deck-runway.h{ left:8%; right:8%; top:50%; height:3px; transform:translateY(-50%); }
.broadside-wrapper .deck-runway.v{ top:8%; bottom:8%; left:50%; width:3px; transform:translateX(-50%); background:repeating-linear-gradient(0deg, rgba(255,255,255,.6) 0 6px, transparent 6px 12px); }
.broadside-wrapper .deck-tower{ position:absolute; width:22%; height:38%; background:transparent; border-radius:2px; transform:translate(-50%,-50%); transform-style:preserve-3d; }
.broadside-wrapper .deck-tower .top-slice { background: #151b2c; border:1px solid rgba(255,255,255,.3); }
.broadside-wrapper .deck-turret{ position:absolute; width:10px; height:10px; border-radius:50%; background:transparent; transform:translate(-50%,-50%); transform-style:preserve-3d; }
.broadside-wrapper .deck-turret .top-slice { background: #171c2c; border-radius:50%; border:1px solid rgba(255,255,255,.35); box-shadow:inset 0 1px 1px rgba(255,255,255,.35); }
.broadside-wrapper .deck-turret.small{ width:7px; height:7px; }
.broadside-wrapper .deck-fin{ position:absolute; width:20%; height:46%; background:transparent; border-radius:3px; transform:translate(-50%,-50%); transform-style:preserve-3d; }
.broadside-wrapper .deck-fin .top-slice { background: #12151f; border:1px solid rgba(255,255,255,.3); }

/* attack marks */
.broadside-wrapper .mark{position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; transform-style: preserve-3d; transform: translateZ(6px);}
.broadside-wrapper .mark.miss::before{
  content:''; width:9px; height:9px; border-radius:50%; background:var(--fog);
  box-shadow:0 0 0 4px rgba(76,90,153,.18);
}
.broadside-wrapper .ripple{
  position:absolute; width:8px; height:8px; border-radius:50%; border:2px solid var(--cyan);
  animation:ripple-out .6s ease-out forwards;
}
@keyframes ripple-out{ to{ width:46px; height:46px; opacity:0; } }

.broadside-wrapper .mark.hit .flame{
  font-size:18px; filter:drop-shadow(0 0 6px rgba(255,120,60,.8));
  animation:flame-pop .35s ease-out;
}
@keyframes flame-pop{ from{ transform:scale(.3); opacity:0;} to{ transform:scale(1); opacity:1;} }

.broadside-wrapper .smoke{position:absolute; inset:0; pointer-events:none; overflow:visible;}
.broadside-wrapper .puff{
  position:absolute; bottom:6px; left:50%; width:14px; height:14px; border-radius:50%;
  background:radial-gradient(circle at 35% 35%, rgba(255,255,255,.5), rgba(90,95,110,.65) 55%, transparent 75%);
  transform:translate(-50%,0) scale(.4); opacity:0;
  animation:puff-rise 900ms ease-out forwards;
}
@keyframes puff-rise{
  0%{ transform:translate(-50%,0) scale(.3); opacity:0;}
  15%{ opacity:.9;}
  100%{ transform:translate(calc(-50% + var(--dx,0px)), -46px) scale(1.9); opacity:0;}
}
.broadside-wrapper .flash{
  position:absolute; inset:0; border-radius:5px; background:radial-gradient(circle, #fff, #ffb43d 40%, transparent 70%);
  animation:flash-pop .3s ease-out forwards; pointer-events:none;
}
@keyframes flash-pop{ from{ opacity:1; transform:scale(.3);} to{ opacity:0; transform:scale(2.2);} }

.broadside-wrapper .shock{
  position:absolute; border:3px solid var(--amber); border-radius:14px; pointer-events:none;
  animation:shock-out .55s ease-out forwards;
}
@keyframes shock-out{ from{ opacity:1; transform:scale(.6);} to{ opacity:0; transform:scale(1.35);} }

.broadside-wrapper .cannonball{
  position:absolute; width:13px; height:13px; border-radius:50%; z-index:40; pointer-events:none;
  background:radial-gradient(circle at 32% 28%, #dfe6f2, #6a7591 45%, #23283a 85%);
  box-shadow:0 0 6px rgba(0,0,0,.5), inset -2px -2px 3px rgba(0,0,0,.5);
  transform:translate(-50%,-50%);
}
.broadside-wrapper .ball-shadow{
  position:absolute; width:20px; height:8px; border-radius:50%; z-index:5; pointer-events:none;
  background:radial-gradient(ellipse, rgba(0,0,0,.55), transparent 70%);
  transform:translate(-50%,-50%);
}
.broadside-wrapper .impact-burst{
  position:absolute; inset:0; pointer-events:none; z-index:30;
  border-radius:5px;
  background:radial-gradient(circle, rgba(255,255,255,.85), rgba(180,200,255,.35) 45%, transparent 72%);
  animation:impact-pop .35s ease-out forwards;
}
@keyframes impact-pop{ from{ opacity:1; transform:scale(.2);} to{ opacity:0; transform:scale(1.7);} }

.broadside-wrapper .shake{ animation:board-shake .35s; }
@keyframes board-shake{
  0%,100%{ transform: perspective(1000px) rotateX(55deg) rotateZ(-45deg) translateX(0);}
  20%{transform: perspective(1000px) rotateX(55deg) rotateZ(-45deg) translateX(-4px);}
  40%{transform: perspective(1000px) rotateX(55deg) rotateZ(-45deg) translateX(4px);}
  60%{transform: perspective(1000px) rotateX(55deg) rotateZ(-45deg) translateX(-3px);}
  80%{transform: perspective(1000px) rotateX(55deg) rotateZ(-45deg) translateX(3px);}
}

/* tray */
.broadside-wrapper .tray{
  width:230px; background:rgba(6,12,32,.55); border:1px solid var(--line); border-radius:14px; padding:16px;
}
.broadside-wrapper .tray h3{
  margin:0 0 12px; font-family:'Orbitron',sans-serif; font-size:13px; letter-spacing:.16em; color:var(--cyan); text-transform:uppercase;
}
.broadside-wrapper .tray-list{display:flex; flex-direction:column; gap:12px;}
.broadside-wrapper .tray-ship{
  display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:10px;
  background:var(--panel-2); border:1px solid var(--line); user-select:none;
}
.broadside-wrapper .tray-ship.placed{opacity:.4;}
.broadside-wrapper .tray-ship .cells-preview{display:flex; gap:3px;}
.broadside-wrapper .tray-ship .cells-preview .c{width:14px; height:14px; border-radius:3px; background:linear-gradient(135deg,#3f74e0,#193a86); border:1px solid rgba(170,205,255,.5);}
.broadside-wrapper .tray-ship .meta{flex:1; font-size:13.5px; font-weight:600; letter-spacing:.03em;}
.broadside-wrapper .tray-ship .meta small{display:block; color:var(--ink-dim); font-weight:500; font-size:11.5px; letter-spacing:.06em;}
.broadside-wrapper .grab-handle{
  width:34px; height:34px; border-radius:8px; background:rgba(47,226,255,.1); border:1px solid var(--line);
  display:flex; align-items:center; justify-content:center; cursor:grab; touch-action:none; color:var(--cyan); font-size:15px;
}
.broadside-wrapper .grab-handle:active{cursor:grabbing;}
.broadside-wrapper .tray-ship.placed .grab-handle{pointer-events:none; opacity:.3;}

.broadside-wrapper .tray-actions{display:flex; flex-direction:column; gap:10px; margin-top:16px;}
.broadside-wrapper .hint{font-size:12px; color:var(--ink-dim); line-height:1.5; margin-top:14px; letter-spacing:.02em;}

/* buttons */
.broadside-wrapper button{font-family:inherit;}
.broadside-wrapper .btn{
  appearance:none; border:none; cursor:pointer; border-radius:10px; padding:12px 20px;
  font-weight:700; letter-spacing:.06em; font-size:14.5px; text-transform:uppercase;
  transition:transform .12s, box-shadow .12s, opacity .12s, filter .12s;
}
.broadside-wrapper .btn:active{transform:translateY(1px) scale(.98);}
.broadside-wrapper .btn-primary{background:linear-gradient(135deg,#2fe2ff,#1a8fae); color:#03151c; box-shadow:0 8px 22px -8px rgba(47,226,255,.6);}
.broadside-wrapper .btn-primary:disabled{opacity:.35; cursor:not-allowed; box-shadow:none;}
.broadside-wrapper .btn-ghost{background:rgba(255,255,255,.05); color:var(--ink); border:1px solid var(--line);}
.broadside-wrapper .btn-ghost:hover{border-color:var(--line-strong); background:rgba(255,255,255,.08);}
.broadside-wrapper .btn-danger-ghost{background:rgba(255,77,99,.08); color:#ffb0ba; border:1px solid rgba(255,77,99,.3);}
.broadside-wrapper .btn-block{width:100%;}

/* handoff & gameover overlays */
.broadside-wrapper .center-panel{
  max-width:520px; margin:0 auto; text-align:center; padding:50px 20px;
}
.broadside-wrapper .badge-shield{
  width:74px; height:74px; margin:0 auto 22px; border-radius:50%;
  background:radial-gradient(circle at 35% 30%, rgba(47,226,255,.35), rgba(47,226,255,.05) 60%);
  border:1px solid var(--line-strong); display:flex; align-items:center; justify-content:center; font-size:30px;
  animation:float-badge 3s ease-in-out infinite;
}
@keyframes float-badge{ 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
.broadside-wrapper .center-panel h2{
  font-family:'Orbitron', sans-serif; font-size:clamp(22px,3.4vw,30px); margin:0 0 10px; letter-spacing:.02em;
  color:#fff;
}
.broadside-wrapper .center-panel p{color:var(--ink-dim); font-size:15.5px; line-height:1.6; margin:0 0 26px;}

/* battle layout */
.broadside-wrapper .battle-layout{display:flex; flex-direction:column; align-items:center; gap:26px;}
.broadside-wrapper .fleet-strip{display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-top:4px;}
.broadside-wrapper .fleet-chip{
  display:flex; align-items:center; gap:7px; padding:6px 12px; border-radius:999px; font-size:12px; font-weight:700;
  letter-spacing:.05em; background:rgba(255,255,255,.04); border:1px solid var(--line); color:var(--ink-dim);
}
.broadside-wrapper .fleet-chip.sunk{color:#ffb0ba; border-color:rgba(255,77,99,.35); background:rgba(255,77,99,.08); text-decoration:line-through;}
.broadside-wrapper .fleet-chip .sq{width:8px;height:8px;border-radius:2px; background:var(--cyan);}
.broadside-wrapper .fleet-chip.sunk .sq{background:var(--danger);}

.broadside-wrapper .mini-board-wrap{display:flex; flex-direction:column; align-items:center; gap:10px;}
.broadside-wrapper .board.mini{grid-template-columns:repeat(10, var(--cell-sm)); grid-template-rows:repeat(10, var(--cell-sm)); gap:2px; padding:8px;}
.broadside-wrapper .board.mini .cell{width:var(--cell-sm); height:var(--cell-sm); border-radius:3px;}
.broadside-wrapper .board.mini .ship-layer{left:8px; top:8px;}

.broadside-wrapper .toast{
  position:fixed; top:22px; left:50%; transform:translateX(-50%) translateY(-16px); z-index:50;
  background:linear-gradient(135deg,#132152,#0e1840); border:1px solid var(--amber); color:var(--amber);
  padding:12px 22px; border-radius:12px; font-weight:700; letter-spacing:.05em; font-size:14px;
  box-shadow:0 12px 30px -10px rgba(0,0,0,.6); opacity:0; pointer-events:none;
  transition:opacity .3s, transform .3s; text-transform:uppercase;
}
.broadside-wrapper .toast.show{opacity:1; transform:translateX(-50%) translateY(0);}

.broadside-wrapper .confetti-wrap{position:absolute; inset:0; overflow:hidden; pointer-events:none; border-radius:22px;}
.broadside-wrapper .confetti{position:absolute; top:-10px; width:7px; height:11px; border-radius:1px; opacity:.9; animation:confetti-fall linear forwards;}
@keyframes confetti-fall{ to{ transform:translateY(420px) rotate(540deg); opacity:0; } }

.broadside-wrapper .hidden{display:none !important;}

@media (max-width:720px){
  :root{ --cell:30px; --cell-sm:16px; }
  .broadside-wrapper .setup-layout{flex-direction:column; align-items:center;}
  .broadside-wrapper .tray{width:100%; max-width:340px;}
}
`;

const RAW_HTML = `
<div class="noise"></div>
<div class="wrap">
  <div class="topbar">
    <button class="back" id="backBtn">&#8592; Back to Game Library</button>
    <div class="status-chip"><span class="status-dot"></span><span id="statusChipText">Fleet Deployment</span></div>
  </div>

  <div class="turn-head">
    <div class="eyebrow"><span class="ring"></span><span id="eyebrowText">Setup Phase</span></div>
    <h1 class="turn-title" id="turnTitle">Player 1's Turn</h1>
    <div class="turn-sub" id="turnSub">Deploy your fleet on the grid below</div>
  </div>

  <!-- SETUP SCREEN -->
  <div class="stage" id="setupStage">
    <div class="sweep"></div>
    <div class="panel-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg><span id="setupLabel">Your Waters</span></div>
    <div class="setup-layout">
      <div class="board-col">
        <div class="board setup" id="setupBoard"></div>
        <div class="tray-actions" style="flex-direction:row;">
          <button class="btn btn-ghost" id="clearBtn">Clear Grid</button>
          <button class="btn btn-ghost" id="shuffleBtn">&#9860; Randomize</button>
        </div>
      </div>
      <div class="tray">
        <h3>Torpedo Rack</h3>
        <div class="tray-list" id="trayList"></div>
        <div class="tray-actions">
          <button class="btn btn-primary btn-block" id="readyBtn" disabled>Ready for Battle</button>
        </div>
        <div class="hint">Drag a ship onto the grid to place it. Tap a placed ship to rotate it. Use Randomize for an instant fleet.</div>
      </div>
    </div>
  </div>

  <!-- HANDOFF SCREEN -->
  <div class="stage hidden" id="handoffStage">
    <div class="sweep"></div>
    <div class="center-panel">
      <div class="badge-shield" id="handoffIcon">&#128274;</div>
      <h2 id="handoffTitle">Pass the device to Player 2</h2>
      <p id="handoffText">Player 1's fleet is hidden. Hand over the device, then confirm you're ready to deploy your ships.</p>
      <button class="btn btn-primary" id="handoffBtn">I'm Ready</button>
    </div>
  </div>

  <!-- BATTLE SCREEN -->
  <div class="stage hidden" id="battleStage">
    <div class="sweep"></div>
    <div class="battle-layout">
      <div class="board-col">
        <div class="panel-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>Enemy Waters</div>
        <div class="board enemy" id="enemyBoard"></div>
      </div>
    </div>
  </div>

  <!-- GAME OVER SCREEN -->
  <div class="stage hidden" id="overStage">
    <div class="confetti-wrap" id="confettiWrap"></div>
    <div class="center-panel">
      <div class="badge-shield" id="overIcon">&#127942;</div>
      <h2 id="overTitle">Player 1 Wins the Battle!</h2>
      <p id="overText">Every enemy vessel has been sent to the bottom of the sea.</p>
      <button class="btn btn-primary" id="restartBtn">Play Again</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>
`;

export default function Battleship() {
  const navigate = useNavigate();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Wait a tick to ensure the DOM elements are actually mounted before running script
    setTimeout(() => {
      "use strict";

      const SIZE = 10;
      const SHIP_DEFS = [
        {name:'Carrier', size:5},
        {name:'Battleship', size:4},
        {name:'Cruiser', size:3},
        {name:'Submarine', size:3},
        {name:'Destroyer', size:2},
      ];

      function freshPlacement(){
        const g = [];
        for(let y=0;y<SIZE;y++){ g.push(new Array(SIZE).fill(null)); }
        return g;
      }
      function freshAttacks(){
        const g = [];
        for(let y=0;y<SIZE;y++){ g.push(new Array(SIZE).fill(null)); } 
        return g;
      }
      function makePlayer(name){
        return {
          name,
          placement: freshPlacement(),
          ships: SHIP_DEFS.map((d,i)=>({
            id: 's'+i, name:d.name, size:d.size, orientation:'h', x:null, y:null,
            hits:0, sunk:false, placed:false
          })),
          attacks: freshAttacks(), 
        };
      }

      let state = {
        phase: 'setup', 
        setupPlayerIndex: 0, 
        attackerIndex: 0,
        players: [makePlayer('Player 1'), makePlayer('Player 2')],
        boardLocked: false,
      };

      function opponentIndex(i){ return i===0?1:0; }
      function currentSetupPlayer(){ return state.players[state.setupPlayerIndex]; }

      // ---------- Placement logic ----------
      function shipCells(size, x, y, orientation){
        const cells = [];
        for(let k=0;k<size;k++){
          cells.push(orientation==='h' ? [x+k,y] : [x,y+k]);
        }
        return cells;
      }
      function inBounds(x,y){ return x>=0 && y>=0 && x<SIZE && y<SIZE; }

      function canPlace(player, shipId, size, x, y, orientation){
        const cells = shipCells(size,x,y,orientation);
        for(const [cx,cy] of cells){
          if(!inBounds(cx,cy)) return false;
          const occ = player.placement[cy][cx];
          if(occ && occ!==shipId) return false;
        }
        return true;
      }

      function clearShipFromGrid(player, ship){
        if(!ship.placed) return;
        const cells = shipCells(ship.size, ship.x, ship.y, ship.orientation);
        for(const [cx,cy] of cells){ player.placement[cy][cx] = null; }
      }
      function stampShipOnGrid(player, ship){
        const cells = shipCells(ship.size, ship.x, ship.y, ship.orientation);
        for(const [cx,cy] of cells){ player.placement[cy][cx] = ship.id; }
      }
      function commitPlacement(player, ship, x, y, orientation){
        clearShipFromGrid(player, ship);
        ship.x=x; ship.y=y; ship.orientation=orientation; ship.placed=true;
        stampShipOnGrid(player, ship);
      }

      function randomizeAll(player){
        player.placement = freshPlacement();
        player.ships.forEach(s=>{ s.placed=false; s.x=null; s.y=null; });
        for(const ship of player.ships){
          let done=false, tries=0;
          while(!done && tries<400){
            tries++;
            const orientation = Math.random()<0.5?'h':'v';
            const maxX = orientation==='h' ? SIZE-ship.size : SIZE-1;
            const maxY = orientation==='v' ? SIZE-ship.size : SIZE-1;
            const x = Math.floor(Math.random()*(maxX+1));
            const y = Math.floor(Math.random()*(maxY+1));
            if(canPlace(player, ship.id, ship.size, x, y, orientation)){
              commitPlacement(player, ship, x, y, orientation);
              done = true;
            }
          }
        }
      }

      function clearAll(player){
        player.placement = freshPlacement();
        player.ships.forEach(s=>{ s.placed=false; s.x=null; s.y=null; });
      }

      // ---------- Rendering: setup ----------
      const setupBoardEl = document.getElementById('setupBoard');
      const trayListEl = document.getElementById('trayList');
      const readyBtn = document.getElementById('readyBtn');
      const setupLabel = document.getElementById('setupLabel');
      if(!setupBoardEl) return;

      function cellPx(){ return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell')) || 38; }
      function cellGap(){ return 3; }

      function buildGridCells(container, size, extraClass){
        container.innerHTML = '';
        for(let y=0;y<size;y++){
          for(let x=0;x<size;x++){
            const c = document.createElement('div');
            c.className = 'cell' + (extraClass?(' '+extraClass):'');
            c.dataset.x = x; c.dataset.y = y;
            container.appendChild(c);
          }
        }
        const layer = document.createElement('div');
        layer.className = 'ship-layer';
        container.appendChild(layer);
        return layer;
      }

      let setupShipLayer = null;

      function renderSetup(){
        const player = currentSetupPlayer();
        setupLabel.textContent = player.name + "'s Waters";
        setupShipLayer = buildGridCells(setupBoardEl, SIZE);
        renderShipsOnLayer(setupShipLayer, player, true);
        renderTray(player);
        updateReadyState(player);
      }

      function buildVoxelStack(baseClass, depth, isH, isTower) {
        const stack = document.createElement('div');
        stack.className = 'voxel-stack';
        stack.style.width = '100%';
        stack.style.height = '100%';
        stack.style.position = 'absolute';
        stack.style.transformStyle = 'preserve-3d';
        
        for(let i=0; i<=depth; i++) {
          const slice = document.createElement('div');
          slice.className = 'voxel-slice ' + baseClass + ' ' + (isH?'h':'v');
          slice.style.position = 'absolute';
          slice.style.inset = '0';
          slice.style.transform = `translateZ(${i}px)`;
          if(i < depth) {
            slice.style.background = isTower ? '#0f1422' : '#1b233a';
            slice.style.border = 'none';
            slice.style.boxShadow = 'none';
          }
          if(i === depth) slice.classList.add('top-slice');
          stack.appendChild(slice);
        }
        return stack;
      }

      function renderShipsOnLayer(layer, player, editable){
        layer.innerHTML = '';
        const cs = cellPx(), gap = cellGap();
        player.ships.forEach(ship=>{
          if(!ship.placed) return;
          const el = document.createElement('div');
          const isH = ship.orientation==='h';
          el.className = 'ship-piece placed';
          el.dataset.shipId = ship.id;
          const w = isH ? ship.size*cs + (ship.size-1)*gap : cs;
          const h = !isH ? ship.size*cs + (ship.size-1)*gap : cs;
          el.style.width = w+'px';
          el.style.height = h+'px';
          el.style.left = (ship.x*(cs+gap))+'px';
          el.style.top = (ship.y*(cs+gap))+'px';
          
          const depth = ship.name === 'Submarine' ? 4 : (ship.name==='Carrier' ? 10 : 8);
          const stack = buildVoxelStack('hull-'+ship.name.toLowerCase(), depth, isH, false);
          addDeckDecorations(stack.lastChild, ship, isH);
          el.appendChild(stack);
          
          if(editable){
            attachDrag(el, player, ship);
            el.addEventListener('dblclick', ()=>tryRotateInPlace(player, ship));
          }
          layer.appendChild(el);
        });
      }

      function addDeckDecorations(el, ship, isH){
        const along = isH ? 'left' : 'top';
        const across = isH ? 'top' : 'left';
        if(ship.name==='Carrier'){
          const runway = document.createElement('div');
          runway.className = 'deck-runway '+(isH?'h':'v');
          el.appendChild(runway);
          const tower = document.createElement('div');
          tower.className = 'deck-tower';
          tower.style[along] = '74%';
          tower.style[across] = '22%';
          tower.appendChild(buildVoxelStack('', 12, isH, true));
          el.appendChild(tower);
        } else if(ship.name==='Battleship'){
          [0.28, 0.68].forEach(p=>{
            const t = document.createElement('div');
            t.className = 'deck-turret';
            t.style[along] = (p*100)+'%';
            t.style[across] = '50%';
            t.appendChild(buildVoxelStack('', 4, isH, true));
            el.appendChild(t);
          });
        } else if(ship.name==='Submarine'){
          const fin = document.createElement('div');
          fin.className = 'deck-fin';
          fin.style[along] = '50%';
          fin.style[across] = '50%';
          fin.appendChild(buildVoxelStack('', 4, isH, true));
          el.appendChild(fin);
        } else if(ship.name==='Cruiser'){
          const t = document.createElement('div');
          t.className = 'deck-turret small';
          t.style[along] = '24%';
          t.style[across] = '50%';
          t.appendChild(buildVoxelStack('', 4, isH, true));
          el.appendChild(t);
        }
      }

      function renderTray(player){
        trayListEl.innerHTML = '';
        player.ships.forEach(ship=>{
          const row = document.createElement('div');
          row.className = 'tray-ship' + (ship.placed?' placed':'');
          const preview = document.createElement('div');
          preview.className='cells-preview';
          for(let i=0;i<ship.size;i++){ const c=document.createElement('div'); c.className='c'; preview.appendChild(c); }
          const meta = document.createElement('div');
          meta.className='meta';
          meta.innerHTML = ship.name + '<small>' + ship.size + ' cells &middot; ' + (ship.placed? 'Deployed':'Awaiting deployment') + '</small>';
          const handle = document.createElement('div');
          handle.className='grab-handle';
          handle.innerHTML = '&#10021;';
          handle.title = 'Drag to place';
          row.appendChild(preview); row.appendChild(meta); row.appendChild(handle);
          trayListEl.appendChild(row);
          if(!ship.placed){
            attachTrayDrag(handle, player, ship);
          }
          row.addEventListener('click', (e)=>{
            if(ship.placed && e.target===row || e.target===meta){ /* no-op, rotate via board dblclick */ }
          });
        });
      }

      function updateReadyState(player){
        const allPlaced = player.ships.every(s=>s.placed);
        readyBtn.disabled = !allPlaced;
      }

      function tryRotateInPlace(player, ship){
        const newOrientation = ship.orientation==='h'?'v':'h';
        clearShipFromGrid(player, ship);
        if(canPlace(player, ship.id, ship.size, ship.x, ship.y, newOrientation)){
          commitPlacement(player, ship, ship.x, ship.y, newOrientation);
        } else {
          stampShipOnGrid(player, ship); // revert
          setupBoardEl.classList.add('shake');
          setTimeout(()=>setupBoardEl.classList.remove('shake'), 350);
        }
        renderShipsOnLayer(setupShipLayer, player, true);
        updateReadyState(player);
      }

      // ---- Drag & drop (pointer events) ----
      let dragState = null;

      function boardRect(){ return setupBoardEl.getBoundingClientRect(); }

      function cellFromPoint(clientX, clientY){
        const el = document.elementFromPoint(clientX, clientY);
        if(el && el.classList.contains('cell')) {
           return {
             x: parseInt(el.getAttribute('data-x')),
             y: parseInt(el.getAttribute('data-y'))
           };
        }
        return {x:-1, y:-1};
      }

      function clearDropHighlights(){
        setupBoardEl.querySelectorAll('.cell').forEach(c=>{ c.classList.remove('valid-drop','invalid-drop'); });
      }
      function highlightFootprint(player, shipId, size, x, y, orientation){
        clearDropHighlights();
        const cells = shipCells(size,x,y,orientation);
        const ok = canPlace(player, shipId, size, x, y, orientation);
        cells.forEach(([cx,cy])=>{
          if(!inBounds(cx,cy)) return;
          const el = setupBoardEl.querySelector('.cell[data-x="'+cx+'"][data-y="'+cy+'"]');
          if(el) el.classList.add(ok?'valid-drop':'invalid-drop');
        });
        return ok;
      }

      function attachTrayDrag(handle, player, ship){
        handle.addEventListener('pointerdown', (ev)=>{
          ev.preventDefault();
          startGhostDrag(ev, player, ship, true);
        });
      }
      function attachDrag(el, player, ship){
        el.addEventListener('pointerdown', (ev)=>{
          ev.preventDefault();
          startGhostDrag(ev, player, ship, false);
        });
      }

      function startGhostDrag(ev, player, ship, fromTray){
        const cs = cellPx(), gap = cellGap();
        const w = ship.orientation==='h' ? ship.size*cs+(ship.size-1)*gap : cs;
        const h = ship.orientation==='v' ? ship.size*cs+(ship.size-1)*gap : cs;

        const ghost = document.createElement('div');
        ghost.className = 'broadside-wrapper'; // trick to borrow styles
        const innerGhost = document.createElement('div');
        innerGhost.className = 'ship-piece dragging';
        innerGhost.style.position='fixed'; innerGhost.style.zIndex=999; innerGhost.style.width=w+'px'; innerGhost.style.height=h+'px';
        innerGhost.style.pointerEvents='none'; innerGhost.style.opacity='.85';
        innerGhost.style.left = '0'; innerGhost.style.top = '0';
        
        // Match the ship hull style using 3D voxel stacks
        const isH = ship.orientation==='h';
        const depth = ship.name === 'Submarine' ? 4 : (ship.name==='Carrier' ? 10 : 8);
        const stack = buildVoxelStack('hull-'+ship.name.toLowerCase(), depth, isH, false);
        addDeckDecorations(stack.lastChild, ship, isH);
        innerGhost.appendChild(stack);
        
        ghost.appendChild(innerGhost);
        ghost.style.position='fixed'; ghost.style.pointerEvents='none'; ghost.style.zIndex=9999;
        ghost.style.background = 'transparent';
        ghost.style.inset = 'auto';
        ghost.style.width = '0';
        ghost.style.height = '0';
        ghost.style.overflow = 'visible';
        ghost.style.transform = 'perspective(1000px) rotateX(55deg) rotateZ(-45deg)';
        ghost.style.transformOrigin = '0 0';
        document.body.appendChild(ghost);

        if(!fromTray){
          // hide original while dragging
          const orig = setupShipLayer.querySelector('.ship-piece[data-ship-id="'+ship.id+'"]');
          if(orig) orig.style.visibility='hidden';
          clearShipFromGrid(player, ship);
        }

        function move(clientX, clientY){
          innerGhost.style.left = (clientX - w/2)+'px';
          innerGhost.style.top = (clientY - h/2)+'px';
          const {x,y} = cellFromPoint(clientX, clientY);
          highlightFootprint(player, ship.id, ship.size, x, y, ship.orientation);
        }
        move(ev.clientX, ev.clientY);

        function onMove(e){ move(e.clientX, e.clientY); }
        function onUp(e){
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup', onUp);
          document.removeEventListener('keydown', onKey);
          ghost.remove();
          clearDropHighlights();
          const {x,y} = cellFromPoint(e.clientX, e.clientY);
          if(canPlace(player, ship.id, ship.size, x, y, ship.orientation)){
            commitPlacement(player, ship, x, y, ship.orientation);
          } else if(!fromTray && ship.x!==null){
            // snap back to previous spot (was already cleared) - restore last valid
            commitPlacement(player, ship, ship.x, ship.y, ship.orientation);
          }
          renderSetup();
        }
        function onKey(e){
          if(e.key==='r' || e.key==='R'){
            ship.orientation = ship.orientation==='h'?'v':'h';
            const nw = ship.orientation==='h' ? ship.size*cs+(ship.size-1)*gap : cs;
            const nh = ship.orientation==='v' ? ship.size*cs+(ship.size-1)*gap : cs;
            innerGhost.style.width=nw+'px'; innerGhost.style.height=nh+'px';
            innerGhost.classList.remove('h','v'); innerGhost.classList.add(ship.orientation);
          }
        }
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
        document.addEventListener('keydown', onKey);
      }

      document.getElementById('shuffleBtn').addEventListener('click', ()=>{
        randomizeAll(currentSetupPlayer());
        renderSetup();
      });
      document.getElementById('clearBtn').addEventListener('click', ()=>{
        clearAll(currentSetupPlayer());
        renderSetup();
      });

      // ---------- Phase transitions ----------
      const setupStage = document.getElementById('setupStage');
      const handoffStage = document.getElementById('handoffStage');
      const battleStage = document.getElementById('battleStage');
      const overStage = document.getElementById('overStage');
      const turnTitle = document.getElementById('turnTitle');
      const turnSub = document.getElementById('turnSub');
      const eyebrowText = document.getElementById('eyebrowText');
      const statusChipText = document.getElementById('statusChipText');

      function showStage(el){
        [setupStage, handoffStage, battleStage, overStage].forEach(s=>s.classList.add('hidden'));
        el.classList.remove('hidden');
      }

      let pendingAfterHandoff = null;

      function goHandoff(title, text, icon, after){
        showStage(handoffStage);
        document.getElementById('handoffTitle').textContent = title;
        document.getElementById('handoffText').textContent = text;
        document.getElementById('handoffIcon').innerHTML = icon;
        eyebrowText.textContent = 'Handoff';
        turnTitle.textContent = 'Device Handoff';
        turnSub.textContent = 'Make sure the other player looks away first';
        statusChipText.textContent = 'Waiting';
        pendingAfterHandoff = after;
      }
      document.getElementById('handoffBtn').addEventListener('click', ()=>{
        if(pendingAfterHandoff) pendingAfterHandoff();
      });

      readyBtn.addEventListener('click', ()=>{
        if(state.setupPlayerIndex===0){
          goHandoff(
            "Pass the device to Player 2",
            "Player 1's fleet is now hidden. Hand the device to Player 2 and confirm when you're ready to deploy.",
            '&#128274;',
            ()=>{
              state.setupPlayerIndex = 1;
              eyebrowText.textContent = 'Setup Phase';
              turnTitle.textContent = "Player 2's Turn";
              turnSub.textContent = 'Deploy your fleet on the grid below';
              statusChipText.textContent = 'Fleet Deployment';
              showStage(setupStage);
              renderSetup();
            }
          );
        } else {
          goHandoff(
            "Pass the device to Player 1",
            "Both fleets are deployed. Hand the device to Player 1 to fire the first shot.",
            '&#9875;',
            ()=>{
              startBattle();
            }
          );
        }
      });

      document.getElementById('backBtn').addEventListener('click', ()=>{
        navigate('/hub');
      });

      // ---------- Battle ----------
      const enemyBoardEl = document.getElementById('enemyBoard');

      function startBattle(){
        state.phase='battle';
        state.attackerIndex = 0;
        showStage(battleStage);
        renderBattle();
      }

      function renderBattle(){
        const attacker = state.players[state.attackerIndex];
        const defender = state.players[opponentIndex(state.attackerIndex)];

        eyebrowText.textContent = 'Battle Phase';
        turnTitle.textContent = attacker.name + "'s Turn";
        turnSub.textContent = 'Fire on enemy waters — a hit lets you fire again';
        statusChipText.textContent = 'Turn: ' + attacker.name;

        // enemy board = attacker.attacks against defender.placement
        buildGridCells(enemyBoardEl, SIZE, 'enemy');
        paintAttacks(enemyBoardEl, attacker.attacks, defender);
        enemyBoardEl.querySelectorAll('.cell').forEach(cell=>{
          const x=+cell.dataset.x, y=+cell.dataset.y;
          if(attacker.attacks[y][x]) cell.classList.add('taken');
          cell.onclick = ()=>handleAttack(x,y);
        });
        // reveal sunk ships on enemy board
        renderSunkShipsOverlay(enemyBoardEl, defender);
      }

      function paintAttacks(boardEl, attacksGrid, defenderPlayer, dimHits){
        boardEl.querySelectorAll('.cell').forEach(cell=>{
          cell.querySelectorAll('.mark').forEach(m=>m.remove());
          const x=+cell.dataset.x, y=+cell.dataset.y;
          const res = attacksGrid[y][x];
          if(res==='miss'){
            const m = document.createElement('div'); m.className='mark miss'; cell.appendChild(m);
          } else if(res==='hit'){
            const m = document.createElement('div'); m.className='mark hit';
            m.innerHTML = '<span class="flame">&#128293;</span>';
            cell.appendChild(m);
          }
        });
      }

      function renderSunkShipsOverlay(boardEl, defenderPlayer){
        const layer = document.createElement('div');
        layer.className='ship-layer';
        const cs = boardEl===enemyBoardEl ? cellPx() : 20;
        const gap = 3;
        defenderPlayer.ships.forEach(ship=>{
          if(!ship.sunk) return;
          const isH = ship.orientation==='h';
          const el = document.createElement('div');
          el.className='ship-piece placed';
          const w = isH ? ship.size*cs+(ship.size-1)*gap : cs;
          const h = !isH ? ship.size*cs+(ship.size-1)*gap : cs;
          el.style.width=w+'px'; el.style.height=h+'px';
          el.style.left=(ship.x*(cs+gap))+'px'; el.style.top=(ship.y*(cs+gap))+'px';
          
          const depth = ship.name === 'Submarine' ? 4 : (ship.name==='Carrier' ? 10 : 8);
          const stack = buildVoxelStack('sunk-hull hull-'+ship.name.toLowerCase(), depth, isH, false);
          addDeckDecorations(stack.lastChild, ship, isH);
          el.appendChild(stack);
          
          layer.appendChild(el);
        });
        boardEl.appendChild(layer);
      }

      function showToast(text){
        const t = document.getElementById('toast');
        t.textContent = text;
        t.classList.add('show');
        clearTimeout(window._toastTm);
        window._toastTm = setTimeout(()=>t.classList.remove('show'), 2200);
      }

      function handleAttack(x,y){
        if(state.boardLocked || state.phase!=='battle') return;
        const attacker = state.players[state.attackerIndex];
        const defIndex = opponentIndex(state.attackerIndex);
        const defender = state.players[defIndex];
        if(attacker.attacks[y][x]) return; // already fired here

        state.boardLocked = true;
        const cellEl = enemyBoardEl.querySelector('.cell[data-x="'+x+'"][data-y="'+y+'"]');
        const shipId = defender.placement[y][x];

        spawnCannonball(enemyBoardEl, cellEl, ()=>{
          spawnImpactDust(cellEl);

          if(!shipId){
            // MISS
            attacker.attacks[y][x] = 'miss';
            const ripple = document.createElement('div');
            ripple.className='ripple';
            ripple.style.left='calc(50% - 4px)'; ripple.style.top='calc(50% - 4px)';
            cellEl.appendChild(ripple);
            setTimeout(()=>{
              paintAttacks(enemyBoardEl, attacker.attacks, defender);
              enemyBoardEl.querySelector('.cell[data-x="'+x+'"][data-y="'+y+'"]').classList.add('taken');
              state.boardLocked = false;
              switchTurn();
            }, 420);
            return;
          }

          // HIT
          attacker.attacks[y][x] = 'hit';
          const ship = defender.ships.find(s=>s.id===shipId);
          ship.hits++;

          spawnSmoke(cellEl);
          const flash = document.createElement('div'); flash.className='flash'; cellEl.appendChild(flash);

          setTimeout(()=>{
            paintAttacks(enemyBoardEl, attacker.attacks, defender);
            enemyBoardEl.querySelector('.cell[data-x="'+x+'"][data-y="'+y+'"]').classList.add('taken');

            if(ship.hits >= ship.size){
              ship.sunk = true;
              spawnShockwave(cellEl);
              showToast(attacker.name + ' sank the ' + ship.name + '!');
              renderBattle();
            }

            if(checkGameOver(defender)){
              setTimeout(()=>endGame(attacker), 500);
              return;
            }

            state.boardLocked = false;
            turnSub.textContent = 'Direct hit! Fire again.';
            showToast('Hit! Fire again.');
          }, 420);
        });
      }

      function spawnCannonball(boardEl, cellEl, onImpact){
        const targetX = cellEl.offsetLeft + cellEl.offsetWidth/2;
        const targetY = cellEl.offsetTop + cellEl.offsetHeight/2;
        
        const drift = (Math.random()*30-15);
        const startX = targetX + drift;
        const startY = targetY + drift;
        const startZ = 200; // Drop from 200px above

        const ball = document.createElement('div');
        ball.className = 'cannonball';
        ball.style.left = startX+'px';
        ball.style.top = startY+'px';
        boardEl.appendChild(ball);
        
        const shadow = document.createElement('div');
        shadow.className = 'ball-shadow';
        shadow.style.left = targetX+'px';
        shadow.style.top = targetY+'px';
        boardEl.appendChild(shadow);

        const duration = 380;
        const t0 = performance.now();

        function frame(now){
          const t = Math.min(1, (now-t0)/duration);
          const fall = t*t; // ease-in, gravity feel
          const curX = startX + (targetX-startX)*t;
          const curY = startY + (targetY-startY)*t;
          const curZ = startZ * (1 - fall);
          const scale = 0.55 + 0.55*t;
          
          ball.style.left = curX+'px';
          ball.style.top = curY+'px';
          ball.style.transform = `translate(-50%,-50%) translateZ(${curZ}px) scale(${scale})`;
          
          shadow.style.opacity = String(0.12 + 0.38*t);
          shadow.style.transform = `translate(-50%,-50%) scale(${0.3+0.7*t})`;
          if(t<1){
            requestAnimationFrame(frame);
          } else {
            ball.remove(); shadow.remove();
            onImpact();
          }
        }
        requestAnimationFrame(frame);
      }

      function spawnImpactDust(cellEl){
        const burst = document.createElement('div');
        burst.className = 'impact-burst';
        cellEl.appendChild(burst);
        enemyBoardEl.classList.add('shake');
        setTimeout(()=>enemyBoardEl.classList.remove('shake'), 300);
        setTimeout(()=>burst.remove(), 350);
      }

      function spawnSmoke(cellEl){
        const smoke = document.createElement('div'); smoke.className='smoke';
        for(let i=0;i<5;i++){
          const p = document.createElement('div'); p.className='puff';
          const dx = (Math.random()*20-10).toFixed(1)+'px';
          p.style.setProperty('--dx', dx);
          p.style.animationDelay = (i*70)+'ms';
          p.style.left = (45+Math.random()*10)+'%';
          smoke.appendChild(p);
        }
        cellEl.appendChild(smoke);
        setTimeout(()=>smoke.remove(), 1200);
      }
      function spawnShockwave(cellEl){
        const s = document.createElement('div'); s.className='shock';
        s.style.inset='-6px';
        cellEl.appendChild(s);
        setTimeout(()=>s.remove(), 600);
      }

      function checkGameOver(defender){
        return defender.ships.every(s=>s.sunk);
      }

      function switchTurn(){
        state.attackerIndex = opponentIndex(state.attackerIndex);
        const nextPlayer = state.players[state.attackerIndex];
        goHandoff(
          "Pass the device to " + nextPlayer.name,
          "Miss! It's now " + nextPlayer.name + "'s turn to fire.",
          '&#128165;',
          ()=>{ showStage(battleStage); renderBattle(); }
        );
      }

      function endGame(winner){
        state.phase='over';
        showStage(overStage);
        eyebrowText.textContent='Battle Complete';
        turnTitle.textContent = winner.name + ' Wins!';
        turnSub.textContent = 'The enemy fleet has been destroyed';
        statusChipText.textContent = 'Game Over';
        document.getElementById('overTitle').textContent = winner.name + ' Wins the Battle!';
        document.getElementById('overText').textContent = 'Every enemy vessel has been sent to the bottom of the sea.';
        launchConfetti();
      }

      function launchConfetti(){
        const wrap = document.getElementById('confettiWrap');
        wrap.innerHTML='';
        const colors = ['#2fe2ff','#ffb43d','#35f2a6','#ff4d63','#ffffff'];
        for(let i=0;i<60;i++){
          const c = document.createElement('div');
          c.className='confetti';
          c.style.left = Math.random()*100+'%';
          c.style.background = colors[Math.floor(Math.random()*colors.length)];
          c.style.animationDuration = (1.4+Math.random()*1.4)+'s';
          c.style.animationDelay = (Math.random()*0.6)+'s';
          wrap.appendChild(c);
        }
      }

      document.getElementById('restartBtn').addEventListener('click', restartGame);

      function restartGame(){
        state = {
          phase:'setup', setupPlayerIndex:0, attackerIndex:0,
          players:[makePlayer('Player 1'), makePlayer('Player 2')],
          boardLocked:false
        };
        eyebrowText.textContent='Setup Phase';
        turnTitle.textContent="Player 1's Turn";
        turnSub.textContent='Deploy your fleet on the grid below';
        statusChipText.textContent='Fleet Deployment';
        showStage(setupStage);
        renderSetup();
      }

      // init
      renderSetup();

    }, 0);
  }, [navigate]);

  return (
    <>
      <style>{RAW_CSS}</style>
      <div className="broadside-wrapper" dangerouslySetInnerHTML={{ __html: RAW_HTML }} />
    </>
  );
}
