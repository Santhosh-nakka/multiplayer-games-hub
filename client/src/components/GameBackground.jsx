import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GameBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x120b28, 0.02);

    const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 5, 15);

    // ---------- Lights ----------
    scene.add(new THREE.AmbientLight(0x3a2f5a, 0.7));
    const tableLamp = new THREE.PointLight(0xffe8c0, 2.6, 24, 2);
    tableLamp.position.set(0, 7, 0);
    scene.add(tableLamp);

    const overheadSpot = new THREE.SpotLight(0xfff2d8, 3.2, 30, Math.PI / 7, 0.5, 1.5);
    overheadSpot.position.set(0, 14, -3);
    overheadSpot.target.position.set(0, -3.2, -3);
    scene.add(overheadSpot);
    scene.add(overheadSpot.target);

    const spotConeMat = new THREE.MeshBasicMaterial({
      color: 0xfff2d8, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide, depthWrite: false
    });
    const spotCone = new THREE.Mesh(new THREE.ConeGeometry(4.2, 17, 24, 1, true), spotConeMat);
    spotCone.position.set(0, 5.5, -3);
    scene.add(spotCone);

    const rim = new THREE.DirectionalLight(0x8fb8ff, 0.5);
    rim.position.set(-8, 6, -6);
    scene.add(rim);
    const accentA = new THREE.PointLight(0xff5ca8, 1.1, 20, 2);
    accentA.position.set(-9, 2, -8);
    scene.add(accentA);
    const accentB = new THREE.PointLight(0x5cd8ff, 1.1, 20, 2);
    accentB.position.set(9, 3, -6);
    scene.add(accentB);
    const accentC = new THREE.PointLight(0x9aff5c, 0.8, 18, 2);
    accentC.position.set(0, -2, -14);
    scene.add(accentC);

    // ---------- Helpers ----------
    function makeSoftCircleTexture(color) {
      const size = 128;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    }
    function woodTexture() {
      const size = 256;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#3a2a1e';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 40; i++) {
        ctx.strokeStyle = `rgba(0,0,0,${0.06 + Math.random() * 0.08})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        const y = Math.random() * size;
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(size*0.3, y + (Math.random()-0.5)*20, size*0.7, y + (Math.random()-0.5)*20, size, y);
        ctx.stroke();
      }
      return new THREE.CanvasTexture(c);
    }

    // ---------- The Table ----------
    const tableGroup = new THREE.Group();
    const tableMat = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.55, metalness: 0.08 });
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 0.35, 48), tableMat);
    tableTop.position.y = 0;
    tableGroup.add(tableTop);
    const tableRim = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.12, 12, 48), new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 0.4, metalness: 0.3 }));
    tableRim.rotation.x = Math.PI / 2;
    tableRim.position.y = 0.18;
    tableGroup.add(tableRim);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1c130d, roughness: 0.6 });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 5.5, 8), legMat);
      leg.position.set(Math.cos(angle) * 4.4, -2.9, Math.sin(angle) * 4.4);
      tableGroup.add(leg);
    }
    tableGroup.position.y = -3.2;
    scene.add(tableGroup);

    const lightPool = new THREE.Mesh(
      new THREE.CircleGeometry(5.6, 48),
      new THREE.MeshBasicMaterial({ color: 0xffdca8, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    lightPool.rotation.x = -Math.PI / 2;
    lightPool.position.y = -3.0;
    scene.add(lightPool);

    // ---------- Reusable materials ----------
    const matte = (hex, emissive = 0x000000, ei = 0) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.35, metalness: 0.2, emissive: emissive || hex, emissiveIntensity: Math.max(ei, 0.12) });

    // ---------- Piece builders ----------
    const pieces = [];

    function addPiece(build, orbitRadius, orbitHeight, orbitSpeed, phase, glowHue) {
      const obj = build();
      const holder = new THREE.Group();
      holder.add(obj);
      scene.add(holder);

      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeSoftCircleTexture(`#${new THREE.Color(glowHue).getHexString()}`),
        color: glowHue, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      glow.scale.setScalar(1.6);
      holder.add(glow);

      pieces.push({
        holder, obj, glow,
        orbitRadius, orbitHeight, orbitSpeed, phase,
        pull: 0
      });
    }

    // 1. Chess
    addPiece(() => {
      const g = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.18, 16), matte(0xffcf5c, 0xffcf5c, 0.25));
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.26, 0.75, 12), matte(0xffcf5c, 0xffcf5c, 0.25));
      body.position.y = 0.5;
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.08), matte(0xff8ce0, 0xff8ce0, 0.4));
      crossV.position.y = 1.1;
      const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.08), matte(0xff8ce0, 0xff8ce0, 0.4));
      crossH.position.y = 1.14;
      g.add(base, body, crossV, crossH);
      g.scale.setScalar(1.1);
      return g;
    }, 7.5, 2.2, 0.09, 0.0, 0xffe8c0);

    // 2. UNO
    addPiece(() => {
      const g = new THREE.Group();
      const die = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), matte(0x5ce0c8, 0x5ce0c8, 0.2));
      die.rotation.set(0.4, 0.5, 0.1);
      const card = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 0.03), matte(0xd83a3a, 0xd83a3a, 0.25));
      card.position.set(0.55, -0.05, 0.1);
      card.rotation.z = 0.25;
      g.add(die, card);
      return g;
    }, 8.5, 1.4, -0.07, 1.3, 0xff8080);

    // 3. Tic-Tac-Toe
    addPiece(() => {
      const g = new THREE.Group();
      const lineMat = matte(0xb08cff, 0xb08cff, 0.3);
      for (let i = -1; i <= 1; i += 2) {
        const v = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.1, 0.05), lineMat);
        v.position.x = i * 0.35; g.add(v);
        const h = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.05), lineMat);
        h.position.y = i * 0.35; g.add(h);
      }
      const xMat = matte(0x7fe8ff, 0x7fe8ff, 0.8);
      const xBar1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.08), xMat);
      xBar1.rotation.z = Math.PI / 4;
      const xBar2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.08), xMat);
      xBar2.rotation.z = -Math.PI / 4;
      xBar1.position.set(0.35, 0.35, 0.05); xBar2.position.set(0.35, 0.35, 0.05);
      g.add(xBar1, xBar2);
      g.scale.setScalar(1.1);
      return g;
    }, 6.5, 3.0, 0.1, 2.6, 0x7fe8ff);

    // 4. Rock Paper Scissors
    addPiece(() => {
      const g = new THREE.Group();
      const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), matte(0xff9a4a, 0xff9a4a, 0.2));
      rock.position.x = -0.55;
      const paper = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.04), matte(0xb0ff5c, 0xb0ff5c, 0.2));
      const scissors = new THREE.Group();
      const blade1 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.55, 6), matte(0xff5ca8, 0xff5ca8, 0.3));
      blade1.rotation.z = 0.3; blade1.position.set(-0.05, 0.1, 0);
      const blade2 = blade1.clone(); blade2.rotation.z = -0.3; blade2.position.set(0.05, 0.1, 0);
      scissors.add(blade1, blade2);
      scissors.position.x = 0.55;
      g.add(rock, paper, scissors);
      g.scale.setScalar(0.9);
      return g;
    }, 9.5, 0.6, 0.06, 3.9, 0xc8cdd6);

    // 5. Connect 4
    addPiece(() => {
      const g = new THREE.Group();
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.15), matte(0x3d6fff, 0x3d6fff, 0.15));
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.2, 16), matte(0x0a1a3a));
      hole.rotation.x = Math.PI / 2;
      hole.position.z = 0.05;
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16), matte(0xffcc33, 0xffcc33, 0.3));
      disc.rotation.x = Math.PI / 2;
      disc.position.set(0.3, 0.9, 0.15);
      g.add(frame, hole, disc);
      g.userData.disc = disc;
      return g;
    }, 7.0, -0.6, -0.1, 5.1, 0xffcc33);

    // 6. Snake Battle
    addPiece(() => {
      const g = new THREE.Group();
      const segMat = matte(0x4fe07a, 0x4fe07a, 0.35);
      const pts = [[0,0],[0.4,0],[0.4,0.4],[0.8,0.4],[0.8,0],[1.2,0]];
      pts.forEach(([x,y]) => {
        const seg = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), segMat);
        seg.position.set(x - 0.6, y - 0.2, 0);
        g.add(seg);
      });
      return g;
    }, 8.0, 2.6, 0.08, 4.4, 0x4fe07a);

    // 7. Battleship
    addPiece(() => {
      const g = new THREE.Group();
      const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.22, 0.9, 6), matte(0x4a8a9a, 0x4a8a9a, 0.15));
      hull.rotation.z = Math.PI / 2;
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.22), matte(0xffb85c, 0xffb85c, 0.2));
      cabin.position.y = 0.16;
      const peg = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matte(0xff5c5c, 0xff5c5c, 0.4));
      peg.position.set(0.5, -0.3, 0.2);
      g.add(hull, cabin, peg);
      return g;
    }, 6.0, -1.8, 0.11, 0.7, 0x5a6a7a);

    // 8. Pong
    addPiece(() => {
      const g = new THREE.Group();
      const paddleMat = matte(0x5cd8ff, 0x5cd8ff, 0.3);
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), paddleMat);
      p1.position.x = -0.5;
      const p2 = p1.clone(); p2.position.x = 0.5;
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), matte(0xfff45c, 0xfff45c, 0.6));
      g.add(p1, p2, ball);
      g.userData.ball = ball;
      return g;
    }, 9.0, -0.2, -0.13, 1.9, 0xffffff);

    // 9. Racing
    addPiece(() => {
      const g = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 6), matte(0x333333));
      pole.position.y = 0.1;
      const flagCanvas = document.createElement('canvas');
      flagCanvas.width = 32; flagCanvas.height = 32;
      const fctx = flagCanvas.getContext('2d');
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
        fctx.fillStyle = (x + y) % 2 === 0 ? '#111' : '#eee';
        fctx.fillRect(x * 8, y * 8, 8, 8);
      }
      const flagTex = new THREE.CanvasTexture(flagCanvas);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide }));
      flag.position.set(0.27, 0.35, 0);
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 8, 16), matte(0x222222, 0xff8844, 0.2));
      wheel.position.set(-0.5, -0.1, 0);
      g.add(pole, flag, wheel);
      return g;
    }, 7.8, 1.0, 0.095, 4.8, 0xff8844);

    // 10. Fighting Game
    addPiece(() => {
      const g = new THREE.Group();
      const gloveMat = matte(0xcc2b2b, 0xcc2b2b, 0.2);
      const g1 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), gloveMat);
      g1.scale.set(1, 0.85, 1.1);
      g1.position.set(-0.28, 0, 0);
      const g2 = g1.clone(); g2.position.set(0.28, -0.1, 0.1);
      g.add(g1, g2);
      return g;
    }, 8.8, -1.2, -0.085, 5.6, 0xcc2b2b);

    // ---------- Twinkling sparkles filling the void ----------
    const sparkleCount = window.innerWidth < 640 ? 180 : 420;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePos = new Float32Array(sparkleCount * 3);
    const sparkleColor = new Float32Array(sparkleCount * 3);
    const sparklePhase = new Float32Array(sparkleCount);
    const sparkleSpeed = new Float32Array(sparkleCount);
    const sparkleSize = new Float32Array(sparkleCount);
    const sparklePalette = [
      new THREE.Color(0xff8cc8), new THREE.Color(0x8cd8ff), new THREE.Color(0xffe08c),
      new THREE.Color(0xa8ff8c), new THREE.Color(0xc88cff), new THREE.Color(0xffffff)
    ];
    for (let i = 0; i < sparkleCount; i++) {
      sparklePos[i*3]   = (Math.random() - 0.5) * 50;
      sparklePos[i*3+1] = (Math.random() - 0.5) * 34;
      sparklePos[i*3+2] = -6 - Math.random() * 55;
      const col = sparklePalette[i % sparklePalette.length];
      sparkleColor[i*3] = col.r; sparkleColor[i*3+1] = col.g; sparkleColor[i*3+2] = col.b;
      sparklePhase[i] = Math.random() * Math.PI * 2;
      sparkleSpeed[i] = 1.0 + Math.random() * 2.5;
      sparkleSize[i] = 1.4 + Math.random() * 2.6;
    }
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
    sparkleGeo.setAttribute('aColor', new THREE.BufferAttribute(sparkleColor, 3));
    sparkleGeo.setAttribute('aPhase', new THREE.BufferAttribute(sparklePhase, 1));
    sparkleGeo.setAttribute('aSpeed', new THREE.BufferAttribute(sparkleSpeed, 1));
    sparkleGeo.setAttribute('aSize', new THREE.BufferAttribute(sparkleSize, 1));
    const sparkleMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 aColor;
        attribute float aPhase;
        attribute float aSpeed;
        attribute float aSize;
        uniform float uTime;
        varying float vTwinkle;
        varying vec3 vColor;
        void main() {
          vTwinkle = pow(0.5 + 0.5 * sin(uTime * aSpeed + aPhase), 2.5);
          vColor = aColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (0.4 + vTwinkle) * (260.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vTwinkle;
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          float alpha = smoothstep(0.5, 0.0, d) * vTwinkle;
          gl_FragColor = vec4(vColor, alpha);
        }
      `
    });
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
    scene.add(sparkles);

    // ---------- Background: sparse colorful motes ----------
    const moteCount = window.innerWidth < 640 ? 100 : 260;
    const moteGeo = new THREE.BufferGeometry();
    const motePos = new Float32Array(moteCount * 3);
    const moteColor = new Float32Array(moteCount * 3);
    const motePalette = [
      new THREE.Color(0xff8cc8), new THREE.Color(0x8cd8ff), new THREE.Color(0xffe08c),
      new THREE.Color(0xa8ff8c), new THREE.Color(0xc88cff)
    ];
    for (let i = 0; i < moteCount; i++) {
      motePos[i*3]   = (Math.random() - 0.5) * 60;
      motePos[i*3+1] = (Math.random() - 0.5) * 40;
      motePos[i*3+2] = -10 - Math.random() * 60;
      const col = motePalette[i % motePalette.length];
      moteColor[i*3] = col.r; moteColor[i*3+1] = col.g; moteColor[i*3+2] = col.b;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    moteGeo.setAttribute('color', new THREE.BufferAttribute(moteColor, 3));
    const moteMat = new THREE.PointsMaterial({
      size: 0.09, vertexColors: true, transparent: true, opacity: 0.65, sizeAttenuation: true, blending: THREE.AdditiveBlending
    });
    scene.add(new THREE.Points(moteGeo, moteMat));

    // ---------- Mouse tracking ----------
    const raycaster = new THREE.Raycaster();
    const raycastMouse = new THREE.Vector2();
    const cursorPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 2);
    const cursorWorld = new THREE.Vector3(0, 0, -2);
    const mouseTarget = { x: 0, y: 0 };
    let mouseCurrent = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;

      raycastMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      raycastMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(raycastMouse, camera);
      const hit = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(cursorPlane, hit)) {
        cursorWorld.copy(hit);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();
    const tableCenter = new THREE.Vector3(0, -2.5, -3);
    let animationFrameId;

    function animate() {
      const t = clock.getElapsedTime();
      sparkleMat.uniforms.uTime.value = t;

      pieces.forEach((p) => {
        const angle = t * p.orbitSpeed + p.phase;
        const basePos = new THREE.Vector3(
          Math.cos(angle) * p.orbitRadius,
          p.orbitHeight + Math.sin(t * 0.4 + p.phase) * 0.4,
          Math.sin(angle) * p.orbitRadius - 3
        );

        const dist = basePos.distanceTo(cursorWorld);
        const near = THREE.MathUtils.clamp(1 - dist / 5, 0, 1);
        p.pull += (near - p.pull) * (near > p.pull ? 0.1 : 0.03);

        const landSpot = tableCenter.clone().add(new THREE.Vector3(
          Math.cos(p.phase * 1.7) * 2.4,
          0,
          Math.sin(p.phase * 1.7) * 2.4
        ));
        const pulled = basePos.clone().lerp(landSpot, p.pull * 0.85);
        p.holder.position.copy(pulled);
        p.holder.rotation.y = t * 0.3 + p.phase + p.pull * 2;
        p.obj.scale.setScalar(1 + p.pull * 0.25);

        p.glow.material.opacity = 0.18 + p.pull * 0.4;
        p.glow.scale.setScalar(1.5 + p.pull * 1.8);
      });

      const disc = pieces[4].obj.userData.disc;
      if (disc) disc.position.y = 0.9 - ((t * 0.5) % 1.6);
      const ball = pieces[7].obj.userData.ball;
      if (ball) ball.position.x = Math.sin(t * 2.2) * 0.55;

      tableLamp.intensity = 2.2 + Math.sin(t * 1.3) * 0.15;

      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.03;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.03;
      camera.position.x = mouseCurrent.x * 2.8 + Math.sin(t * 0.03) * 1.2;
      camera.position.y = 5 - mouseCurrent.y * 1.6;
      camera.lookAt(0, -1, -3);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    }

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resize);

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: -1, 
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 55%, #1a1330 0%, #100a22 45%, #050310 75%, #000000 100%)'
    }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
