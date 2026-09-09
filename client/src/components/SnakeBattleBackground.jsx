import React, { useEffect, useRef } from 'react';

export default function SnakeBattleBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    mountNode.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // ---------- faint grid, echoing the game board ----------
    function drawGrid() {
      const size = 42;
      ctx.strokeStyle = 'rgba(255,255,255,0.035)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += size) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += size) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
    }

    // ---------- Snake: a head that steers smoothly + a body that follows the trail ----------
    class Snake {
      constructor(color, glow, length, speed, startX, startY, startAngle) {
        this.color = color;
        this.glow = glow;
        this.length = length;
        this.speed = speed;
        this.segSpacing = 14;
        this.x = startX;
        this.y = startY;
        this.angle = startAngle;
        this.turnSeed = Math.random() * 1000;
        this.trail = [{ x: this.x, y: this.y }];
        this.foodTimer = Math.random() * 6 + 4;
        this.food = null;
        this.placeFood();
      }

      placeFood() {
        const margin = 80;
        this.food = {
          x: margin + Math.random() * (canvas.width - margin * 2),
          y: margin + Math.random() * (canvas.height - margin * 2)
        };
      }

      update(t) {
        // smooth wandering steer using layered sine noise (cheap, no libraries needed)
        const wander = Math.sin(t * 0.6 + this.turnSeed) * 0.9
                     + Math.sin(t * 0.23 + this.turnSeed * 2.1) * 0.5;

        // gentle steering toward its own "food" dot for purposeful movement
        const dx = this.food.x - this.x;
        const dy = this.food.y - this.y;
        const targetAngle = Math.atan2(dy, dx);
        let angleDiff = targetAngle - this.angle;
        angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

        this.angle += angleDiff * 0.01 + wander * 0.02;

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // soft wrap around edges so it never gets stuck at a wall
        const pad = 60;
        if (this.x < -pad) this.x = canvas.width + pad;
        if (this.x > canvas.width + pad) this.x = -pad;
        if (this.y < -pad) this.y = canvas.height + pad;
        if (this.y > canvas.height + pad) this.y = -pad;

        // reached food: grow a little and pick a new spot
        const distToFood = Math.hypot(dx, dy);
        if (distToFood < 22) {
          this.length += 1;
          this.placeFood();
        }

        this.trail.unshift({ x: this.x, y: this.y });
        const maxTrail = this.length * this.segSpacing + 40;
        if (this.trail.length > maxTrail) this.trail.length = maxTrail;
      }

      segmentPositions() {
        const positions = [];
        let dist = 0;
        let prev = this.trail[0];
        for (let i = 1; i < this.trail.length && positions.length < this.length; i++) {
          const p = this.trail[i];
          dist += Math.hypot(p.x - prev.x, p.y - prev.y);
          if (dist >= this.segSpacing) {
            positions.push(p);
            dist = 0;
          }
          prev = p;
        }
        return positions;
      }

      draw() {
        const segs = this.segmentPositions();

        // body, tail-first so head overlaps on top
        for (let i = segs.length - 1; i >= 0; i--) {
          const s = segs[i];
          const shrink = 1 - (i / (segs.length + 4)) * 0.55;
          const r = 9 * shrink;

          ctx.beginPath();
          ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.shadowColor = this.glow;
          ctx.shadowBlur = 14 * shrink;
          ctx.globalAlpha = 0.85;
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // head, slightly bigger with a stronger glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, 11, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.glow;
        ctx.shadowBlur = 22;
        ctx.fill();
        ctx.shadowBlur = 0;

        // food dot for this snake, small pulsing glow
        const pulse = 4 + Math.sin(performance.now() * 0.006) * 1.2;
        ctx.beginPath();
        ctx.arc(this.food.x, this.food.y, pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const snakes = [
      new Snake('#22d3ee', '#22d3ee', 6, 1.4, canvas.width * 0.3, canvas.height * 0.4, 0.4),
      new Snake('#ef4444', '#ef4444', 6, 1.25, canvas.width * 0.7, canvas.height * 0.65, 3.6)
    ];

    const clock = { start: performance.now() };
    let animationFrameId;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const t = (performance.now() - clock.start) / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();

      snakes.forEach(s => { s.update(t); s.draw(); });
    }
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      if (mountNode && canvas) {
        mountNode.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: -1, 
        pointerEvents: 'none', 
        background: 'radial-gradient(ellipse 90% 80% at 50% 30%, #2547a8 0%, #1a3480 45%, #0f2159 100%)' 
      }} 
    />
  );
}
