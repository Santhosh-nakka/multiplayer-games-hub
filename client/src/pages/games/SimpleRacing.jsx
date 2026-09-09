import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { 
  Pause, Bomb, Target, Anchor, MapPin, Zap, Plane, 
  Crosshair, RefreshCw, Plus, ArrowLeft, Car
} from 'lucide-react';

const AVAILABLE_CARS = [
  { name: 'INTERCEPTOR', color: 0x111111, isPolice: true, iconColor: '#a8a8a8', image: '/images/interceptor.png' },
  { name: 'CRIMSON', color: 0xff0000, isPolice: false, iconColor: '#ff0000', image: '/images/crimson.png' },
  { name: 'EMERALD', color: 0x00ff00, isPolice: false, iconColor: '#00ff00', image: '/images/emerald.png' },
  { name: 'AZURE', color: 0x0000ff, isPolice: false, iconColor: '#3b82f6', image: '/images/azure.png' },
  { name: 'GOLD', color: 0xffcc00, isPolice: false, iconColor: '#eab308', image: '/images/gold.png' },
];

export default function SimpleRacing() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  const [showMenu, setShowMenu] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);

  const [speed, setSpeed] = useState(0);
  const [gear, setGear] = useState('D');

  const gameState = useRef({
    mode: 'oneway',
    speed: 0,
    maxSpeed: 5.0,
    normalMaxSpeed: 5.0,
    boostMaxSpeed: 10.0,
    boostEndTime: 0,
    acceleration: 0.06,
    friction: 0.015,
    brakeFriction: 0.05,
    turnSpeed: 0.25,
    distance: 0,
    keys: { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false },
    touchGas: false,
    touchBrake: false,
    touchLeft: false,
    touchRight: false,
    isPlaying: false,
    enemies: [],
    bottles: []
  });

  const startGame = (mode) => {
    gameState.current.mode = mode;
    gameState.current.speed = 0;
    gameState.current.distance = 0;
    gameState.current.isPlaying = true;
    gameState.current.boostEndTime = 0;
    setScore(0);
    setSpeed(0);
    setShowMenu(false);
    setGameOver(false);
  };

  const resetGame = () => {
    gameState.current.speed = 0;
    gameState.current.distance = 0;
    gameState.current.isPlaying = true;
    gameState.current.boostEndTime = 0;
    setScore(0);
    setSpeed(0);
    setGameOver(false);
  };

  useEffect(() => {
    if (gameOver) return; // Wait for user to reset

    const container = containerRef.current;
    if (!container) return;
    
    container.innerHTML = ''; // Clear old canvases

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    scene.fog = new THREE.Fog(0x87ceeb, 50, 400);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 8, -20);
    camera.lookAt(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(100, 200, -50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    scene.add(dirLight);

    // Build Road (Treadmill style, centered at origin)
    const roadWidth = 40;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, 10000);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    scene.add(road);

    // Borders
    const borderGeo = new THREE.PlaneGeometry(2, 10000);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    const leftBorder = new THREE.Mesh(borderGeo, borderMat);
    leftBorder.rotation.x = -Math.PI / 2;
    leftBorder.position.x = -roadWidth/2 + 1;
    leftBorder.position.y = 0.01;
    scene.add(leftBorder);
    
    const rightBorder = new THREE.Mesh(borderGeo, borderMat);
    rightBorder.rotation.x = -Math.PI / 2;
    rightBorder.position.x = roadWidth/2 - 1;
    rightBorder.position.y = 0.01;
    scene.add(rightBorder);

    // Grass
    const grassGeo = new THREE.PlaneGeometry(2000, 10000);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.1;
    grass.receiveShadow = true;
    scene.add(grass);

    // Lane lines (dividers at -10, 0, 10)
    const lines = [];
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    
    for(let i = 0; i < 40; i++) {
      for(let j = -1; j <= 1; j++) {
        const isCenter = j === 0;
        const lineGeo = new THREE.PlaneGeometry(0.5, 5);
        const lineMesh = new THREE.Mesh(lineGeo, isCenter ? yellowMat : lineMat);
        lineMesh.rotation.x = -Math.PI / 2;
        lineMesh.position.y = 0.05;
        lineMesh.position.x = j * 10;
        lineMesh.position.z = i * 20; // 0 to 800
        scene.add(lineMesh);
        lines.push({ mesh: lineMesh, isCenter });
      }
    }

    // Trees
    const treeTrunkGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 }); // darker brown
    
    // Pine tree layered cones
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x1e592f, roughness: 0.9 }); // pine green
    const leafGeo1 = new THREE.ConeGeometry(3.5, 4.5, 7);
    const leafGeo2 = new THREE.ConeGeometry(2.8, 4.0, 7);
    const leafGeo3 = new THREE.ConeGeometry(2.0, 3.5, 7);
    
    const trees = [];
    for(let i=0; i<60; i++) {
      const treeGroup = new THREE.Group();
      
      const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
      trunk.position.y = 1;
      trunk.castShadow = true;
      treeGroup.add(trunk);
      
      const l1 = new THREE.Mesh(leafGeo1, leafMat);
      l1.position.y = 3.5;
      l1.castShadow = true;
      
      const l2 = new THREE.Mesh(leafGeo2, leafMat);
      l2.position.y = 6.0;
      l2.castShadow = true;
      
      const l3 = new THREE.Mesh(leafGeo3, leafMat);
      l3.position.y = 8.0;
      l3.castShadow = true;
      
      treeGroup.add(l1, l2, l3);
      
      // Random position outside road
      const isLeft = Math.random() > 0.5;
      const xOffset = 22 + Math.random() * 80; 
      treeGroup.position.x = isLeft ? -xOffset : xOffset;
      treeGroup.position.z = Math.random() * 1000 - 100;
      
      // Random scale for variety
      const scale = 0.6 + Math.random() * 0.7;
      treeGroup.scale.set(scale, scale, scale);
      treeGroup.rotation.y = Math.random() * Math.PI;
      
      scene.add(treeGroup);
      trees.push(treeGroup);
    }

    // Function to create car
    const createCar = (color, isPolice) => {
      const carGroup = new THREE.Group();
      
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
      const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.7 });
      const windowMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1 });
      const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.8 });
      const tailLightMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 });
      
      // Chassis (Bottom)
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 8.4), darkMat);
      chassis.position.set(0, 0.6, 0);
      chassis.castShadow = true;
      carGroup.add(chassis);

      // Main Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.8, 8.0), bodyMat);
      body.position.set(0, 1.2, 0);
      body.castShadow = true;
      carGroup.add(body);
      
      // Front Bumper extension
      const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 1.0), bodyMat);
      frontBumper.position.set(0, 0.9, 4.2);
      frontBumper.castShadow = true;
      carGroup.add(frontBumper);

      // Cabin / Roof
      const cabinGeo = new THREE.BoxGeometry(2.8, 1.2, 4.2);
      const cabin = new THREE.Mesh(cabinGeo, windowMat);
      cabin.position.set(0, 2.2, -0.5);
      cabin.castShadow = true;
      carGroup.add(cabin);
      
      // Roof Top
      const roofTop = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.2, 3.0), bodyMat);
      roofTop.position.set(0, 2.8, -0.8);
      carGroup.add(roofTop);

      // Spoiler (Not for police)
      if (!isPolice) {
        const spoilerBar = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.15, 0.8), darkMat);
        spoilerBar.position.set(0, 2.0, -3.8);
        const strutL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.4), darkMat);
        strutL.position.set(-1.0, 1.7, -3.8);
        const strutR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.4), darkMat);
        strutR.position.set(1.0, 1.7, -3.8);
        carGroup.add(spoilerBar, strutL, strutR);
      }

      // Headlights
      const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.2), lightMat);
      hl1.position.set(-1.2, 1.1, 4.7);
      const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.2), lightMat);
      hl2.position.set(1.2, 1.1, 4.7);
      carGroup.add(hl1, hl2);

      // Taillights
      const tl1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 0.2), tailLightMat);
      tl1.position.set(-1.1, 1.2, -4.0);
      const tl2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 0.2), tailLightMat);
      tl2.position.set(1.1, 1.2, -4.0);
      carGroup.add(tl1, tl2);

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 16);
      const rimGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.52, 12);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8 });
      
      const wheelPositions = [
        [-1.8, 0.7, 2.6], [1.8, 0.7, 2.6],
        [-1.8, 0.7, -2.4], [1.8, 0.7, -2.4]
      ];
      
      wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.z = Math.PI / 2;
        rim.position.set(...pos);
        
        carGroup.add(wheel, rim);
      });

      if (isPolice) {
        // Police lights
        const lightBarGeo = new THREE.BoxGeometry(2, 0.3, 0.6);
        const lightBarMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const lightBar = new THREE.Mesh(lightBarGeo, lightBarMat);
        lightBar.position.set(0, 2.7, -0.5);
        carGroup.add(lightBar);
      }

      // Exhaust pipes (always there, fire comes out of them)
      const pipeGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.6, 12);
      const pipeMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.2 });
      
      const p1 = new THREE.Mesh(pipeGeo, pipeMat);
      p1.rotation.x = Math.PI / 2;
      p1.position.set(-1.2, 0.7, -4.3);
      
      const p2 = new THREE.Mesh(pipeGeo, pipeMat);
      p2.rotation.x = Math.PI / 2;
      p2.position.set(1.2, 0.7, -4.3);
      carGroup.add(p1, p2);

      // Add Particle Fire Exhaust for boost
      const fireGroup = new THREE.Group();
      fireGroup.name = "fireGroup";
      fireGroup.visible = false;
      
      const fireGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
      const fireMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.9 });
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.9 });

      for (let i = 0; i < 40; i++) {
        const isCore = Math.random() > 0.6;
        const particle = new THREE.Mesh(fireGeo, isCore ? coreMat : fireMat);
        const startX = (Math.random() > 0.5 ? -1.2 : 1.2) + (Math.random() * 0.3 - 0.15);
        particle.userData = {
          startX: startX,
          startY: 0.7 + (Math.random() * 0.3 - 0.15),
          zOffset: -4.5,
          speed: 0.2 + Math.random() * 0.5,
          life: Math.random()
        };
        fireGroup.add(particle);
      }
      carGroup.add(fireGroup);

      return carGroup;
    };

    // Player Car
    const selectedCarDef = AVAILABLE_CARS[selectedCarIndex];
    const playerCar = createCar(selectedCarDef.color, selectedCarDef.isPolice);
    scene.add(playerCar);
    
    const redLight = new THREE.PointLight(0xff0000, 2, 20);
    redLight.position.set(-1, 3, -0.5);
    playerCar.add(redLight);
    
    const blueLight = new THREE.PointLight(0x0000ff, 2, 20);
    blueLight.position.set(1, 3, -0.5);
    playerCar.add(blueLight);

    const state = gameState.current;
    state.enemies = []; // reset enemies on remount
    state.bottles = []; // reset bottles on remount
    state.boostEndTime = 0;
    
    // Player always stays at z = 0 in world space
    playerCar.position.set(5, 0, 0); 

    const onKeyDown = (e) => { state.keys[e.key] = true; };
    const onKeyUp = (e) => { state.keys[e.key] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const spawnBottle = () => {
      const bottleGeo = new THREE.CylinderGeometry(0.6, 0.6, 2, 12);
      const bottleMat = new THREE.MeshStandardMaterial({ 
        color: 0x00ffff, 
        emissive: 0x00aaaa, 
        roughness: 0.2 
      });
      const bottle = new THREE.Mesh(bottleGeo, bottleMat);
      
      const lanes = [-15, -5, 5, 15];
      const laneIndex = Math.floor(Math.random() * lanes.length);
      
      bottle.position.x = lanes[laneIndex];
      bottle.position.y = 1.2;
      bottle.position.z = 400 + Math.random() * 200;
      
      scene.add(bottle);
      state.bottles.push(bottle);
    };

    const spawnEnemy = () => {
      const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xff8800];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const enemy = createCar(color, false);
      
      const lanes = [-15, -5, 5, 15]; // Centers of the 4 lanes
      const laneIndex = Math.floor(Math.random() * lanes.length);
      
      const isOncoming = state.mode === 'twoway' && laneIndex < 2;
      
      if (isOncoming) {
        enemy.rotation.y = Math.PI;
      }

      enemy.position.x = lanes[laneIndex];
      // Spawn ahead of the player (who is always at 0)
      enemy.position.z = 400 + Math.random() * 200;
      
      enemy.userData = { 
        isOncoming,
        speed: 0.8 + Math.random() * 0.6 // Absolute world speed
      };

      scene.add(enemy);
      state.enemies.push(enemy);
    };

    // Initial enemies
    for(let i=0; i<6; i++) spawnEnemy();

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!state.isPlaying) {
        renderer.render(scene, camera);
        return; // Keep loop alive but frozen
      }

      // Input logic
      const isGas = state.keys['w'] || state.keys['ArrowUp'] || state.touchGas;
      const isBrake = state.keys['s'] || state.keys['ArrowDown'] || state.touchBrake;
      const isLeft = state.keys['a'] || state.keys['ArrowLeft'] || state.touchLeft;
      const isRight = state.keys['d'] || state.keys['ArrowRight'] || state.touchRight;

      if (isGas) {
        state.speed += state.acceleration;
      } else if (isBrake) {
        state.speed -= state.brakeFriction;
      } else {
        state.speed -= state.friction;
      }
      
      // Check boost status
      if (Date.now() < state.boostEndTime) {
        state.maxSpeed = state.boostMaxSpeed;
        if (state.speed < state.maxSpeed) state.speed += state.acceleration * 2; // Auto accelerate when boosted
      } else {
        state.maxSpeed = state.normalMaxSpeed;
      }

      state.speed = Math.max(0, Math.min(state.speed, state.maxSpeed));
      
      if (Math.random() < 0.1) {
        setSpeed(Math.floor(state.speed * 80));
      }

      // Turning
      if (state.speed > 0) {
        if (isLeft) {
          playerCar.position.x += state.turnSpeed;
          playerCar.rotation.y = Math.min(playerCar.rotation.y + 0.03, 0.15);
        } else if (isRight) {
          playerCar.position.x -= state.turnSpeed;
          playerCar.rotation.y = Math.max(playerCar.rotation.y - 0.03, -0.15);
        } else {
          playerCar.rotation.y *= 0.8;
        }
      }

      // Constrain player to road
      playerCar.position.x = Math.max(-roadWidth/2 + 2, Math.min(roadWidth/2 - 2, playerCar.position.x));

      // Increase distance traveled
      state.distance += state.speed;
      
      if (Math.random() < 0.05) setScore(Math.floor(state.distance / 10));

      // Move road lines BACKWARDS to simulate forward motion
      lines.forEach(lineObj => {
        lineObj.mesh.position.z -= state.speed;
        if (lineObj.mesh.position.z < -25) {
          lineObj.mesh.position.z += 800; // recycle lines forward
        }
      });

      // Move trees BACKWARDS
      trees.forEach(tree => {
        tree.position.z -= state.speed;
        if (tree.position.z < -50) {
          tree.position.z += 800 + Math.random() * 200; // recycle forward with offset
          const isLeft = Math.random() > 0.5;
          const xOffset = 25 + Math.random() * 50;
          tree.position.x = isLeft ? -xOffset : xOffset;
        }
      });

      // Move Camera (slight follow on X)
      camera.position.x = playerCar.position.x * 0.5;
      
      // Flash police lights
      redLight.intensity = Math.sin(Date.now() / 150) > 0 ? 4 : 0;
      blueLight.intensity = Math.cos(Date.now() / 150) > 0 ? 4 : 0;

      // Fire exhaust animation
      const fireGroup = playerCar.getObjectByName("fireGroup");
      if (fireGroup) {
        if (Date.now() < state.boostEndTime) {
          fireGroup.visible = true;
          fireGroup.children.forEach(p => {
            p.userData.life -= 0.04;
            p.position.z = p.userData.zOffset;
            p.position.x = p.userData.startX + (Math.random() * 0.2 - 0.1);
            p.position.y = p.userData.startY + (Math.random() * 0.2 - 0.1);
            
            p.userData.zOffset -= p.userData.speed;
            
            const scale = Math.max(0, p.userData.life * 1.5);
            p.scale.set(scale, scale, scale);
            
            if (p.userData.life <= 0) {
              p.userData.life = 1.0;
              p.userData.zOffset = -4.5;
            }
          });
        } else {
          fireGroup.visible = false;
          fireGroup.children.forEach(p => {
            p.userData.life = Math.random();
            p.userData.zOffset = -4.5;
          });
        }
      }

      // Bottle logic
      if (state.bottles.length < 1 && Math.random() < 0.005) spawnBottle();
      
      for (let i = state.bottles.length - 1; i >= 0; i--) {
        const bottle = state.bottles[i];
        
        bottle.position.z -= state.speed;
        bottle.rotation.x += 0.05;
        bottle.rotation.y += 0.05;
        
        const dx = playerCar.position.x - bottle.position.x;
        const dz = playerCar.position.z - bottle.position.z;
        if (Math.abs(dx) < 3.5 && Math.abs(dz) < 6) {
          // Collected!
          state.boostEndTime = Date.now() + 5000;
          scene.remove(bottle);
          state.bottles.splice(i, 1);
          continue;
        }

        if (bottle.position.z < -50) {
          scene.remove(bottle);
          state.bottles.splice(i, 1);
        }
      }

      // Enemy logic
      if (state.enemies.length < 8 && Math.random() < 0.02) spawnEnemy();
      
      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const enemy = state.enemies[i];
        
        // Treadmill physics: Enemies move by their speed, AND the world moves backward by player speed
        if (enemy.userData.isOncoming) {
          enemy.position.z -= (enemy.userData.speed + state.speed);
        } else {
          enemy.position.z += (enemy.userData.speed - state.speed);
        }
        
        // Simple bounding box collision
        const dx = playerCar.position.x - enemy.position.x;
        const dz = playerCar.position.z - enemy.position.z; // player.z is 0
        if (Math.abs(dx) < 3.5 && Math.abs(dz) < 8) {
          // Crash
          state.speed = 0;
          state.isPlaying = false;
          setGameOver(true);
        }

        // Cleanup
        if (enemy.position.z < -50 || enemy.position.z > 1000) {
          scene.remove(enemy);
          state.enemies.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };
    
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [gameOver, selectedCarIndex]); // Depend on gameOver and selectedCarIndex so we can preview the car on menu

  const handleTouchStart = (key) => () => { gameState.current[key] = true; };
  const handleTouchEnd = (key) => () => { gameState.current[key] = false; };

  const styles = `
    .racing-wrapper {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #000;
      user-select: none;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .canvas-container {
      position: absolute;
      inset: 0;
    }
    .ui-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      padding: 20px;
    }
    .btn-circle {
      pointer-events: auto;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid #fff;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-bottom: 12px;
      backdrop-filter: blur(4px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      transition: transform 0.1s;
    }
    .btn-circle:active {
      transform: scale(0.9);
    }
    .left-col, .right-col {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .right-col {
      align-items: flex-end;
    }
    .top-center {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: auto;
      display: flex;
      gap: 20px;
    }
    .traffic-light {
      background: #111;
      padding: 8px;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 15px;
      border: 2px solid #555;
      pointer-events: auto;
    }
    .light {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #333;
    }
    .light.red { background: #ff0000; box-shadow: 0 0 10px #ff0000; }
    
    .steering-wheel {
      pointer-events: auto;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.8);
      border: 4px solid #777;
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 20px rgba(0,0,0,1);
      position: relative;
    }
    .steering-spoke {
      position: absolute;
      background: #555;
    }
    
    .pedals-container {
      margin-top: auto;
      display: flex;
      gap: 15px;
      pointer-events: auto;
    }
    .pedal {
      width: 45px;
      border-radius: 8px;
      background: linear-gradient(to bottom, #555, #222);
      border: 2px solid #888;
      box-shadow: 0 10px 20px rgba(0,0,0,0.8);
    }
    .pedal-brake {
      height: 70px;
      margin-top: 30px;
    }
    .pedal-gas {
      height: 100px;
    }
    .pedal:active {
      transform: translateY(5px);
      box-shadow: 0 5px 10px rgba(0,0,0,0.8);
    }
    
    .gear-display {
      background: rgba(0,0,0,0.8);
      border: 2px solid #ff0000;
      color: #ff0000;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 900;
      margin-bottom: 12px;
      pointer-events: auto;
    }

    .game-over-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.85);
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
      color: white;
      backdrop-filter: blur(8px);
    }
    .btn-primary {
      background: #ef4444;
      color: white;
      border: none;
      padding: 15px 30px;
      font-size: 1.5rem;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn-primary:hover {
      background: #dc2626;
    }

    .police-bar {
      display: flex;
      width: 200px;
      height: 20px;
      border-radius: 4px;
      overflow: hidden;
    }
    .police-bar-blue { flex: 1; background: #0000ff; opacity: 0.8; }
    .police-bar-red { flex: 1; background: #ff0000; opacity: 0.8; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="racing-wrapper">
        <div className="canvas-container" ref={containerRef}></div>
        
        {/* Game UI Overlay - Hidden when in Menu */}
        {!showMenu && (
          <div className="ui-layer">
            <div className="left-col">
              <div className="btn-circle" onClick={() => navigate('/')}><Pause size={20} /></div>
              <div className="btn-circle"><Bomb size={20} /></div>
              <div className="btn-circle"><Anchor size={20} /></div>
              <div className="btn-circle"><MapPin size={20} /></div>
              <div className="btn-circle"><Zap size={20} /></div>
              <div className="btn-circle"><Plane size={20} /></div>
              
              <div className="steering-wheel">
                <div className="steering-spoke" style={{ width: '100%', height: '10px' }}></div>
                <div className="steering-spoke" style={{ width: '10px', height: '60px', top: '50%' }}></div>
                <div 
                  style={{ position: 'absolute', inset: 0, display: 'flex' }}
                >
                  <div 
                    style={{ flex: 1 }} 
                    onMouseDown={handleTouchStart('touchLeft')} 
                    onMouseUp={handleTouchEnd('touchLeft')}
                    onMouseLeave={handleTouchEnd('touchLeft')}
                    onTouchStart={handleTouchStart('touchLeft')}
                    onTouchEnd={handleTouchEnd('touchLeft')}
                  ></div>
                  <div 
                    style={{ flex: 1 }} 
                    onMouseDown={handleTouchStart('touchRight')} 
                    onMouseUp={handleTouchEnd('touchRight')}
                    onMouseLeave={handleTouchEnd('touchRight')}
                    onTouchStart={handleTouchStart('touchRight')}
                    onTouchEnd={handleTouchEnd('touchRight')}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="top-center">
              <div className="police-bar">
                <div className="police-bar-blue"></div>
                <div className="police-bar-red"></div>
              </div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem', textShadow: '2px 2px 4px #000' }}>
                SCORE: {score}
              </div>
            </div>

            <div className="right-col">
              <div className="traffic-light">
                <div className="light red"></div>
                <div className="light"></div>
                <div className="light"></div>
              </div>
              
              <div className="btn-circle"><Plus size={20} /></div>
              <div className="btn-circle"><Crosshair size={20} /></div>
              
              <div className="gear-display">{gear}</div>
              
              <div className="btn-circle" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>A/C</div>
              <div className="btn-circle" style={{ fontSize: '0.7rem', fontWeight: 'bold', textAlign: 'center', lineHeight: '1' }}>START<br/>ENGINE</div>
              <div className="btn-circle"><RefreshCw size={20} /></div>

              <div className="pedals-container">
                <div 
                  className="pedal pedal-brake"
                  onMouseDown={handleTouchStart('touchBrake')} 
                  onMouseUp={handleTouchEnd('touchBrake')}
                  onMouseLeave={handleTouchEnd('touchBrake')}
                  onTouchStart={handleTouchStart('touchBrake')}
                  onTouchEnd={handleTouchEnd('touchBrake')}
                ></div>
                <div 
                  className="pedal pedal-gas"
                  onMouseDown={handleTouchStart('touchGas')} 
                  onMouseUp={handleTouchEnd('touchGas')}
                  onMouseLeave={handleTouchEnd('touchGas')}
                  onTouchStart={handleTouchStart('touchGas')}
                  onTouchEnd={handleTouchEnd('touchGas')}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Mode Selection Menu */}
        {showMenu && (
          <div className="game-over-overlay" style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.75)' }}>
            <h1 style={{ 
              fontSize: '5rem', 
              color: '#ffffff',
              fontWeight: 900,
              WebkitTextStroke: '2px #000',
              textShadow: '0 5px 0 #000, 0 10px 15px rgba(0,0,0,0.6)',
              letterSpacing: '4px',
              marginBottom: '10px'
            }}>
              {"RACING CLUB".split('').map((char, index) => (
                <span key={index} className={char !== ' ' ? "hover-letter" : ""}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>
            
            <p style={{ fontSize: '1.2rem', marginBottom: '30px', fontWeight: 'bold', textShadow: '0 2px 4px #000', opacity: 0.8 }}>SELECT YOUR VEHICLE</p>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {AVAILABLE_CARS.map((car, index) => (
                <div 
                  key={index} 
                  className={`game-card-solid ${selectedCarIndex === index ? 'selected' : ''}`}
                  onClick={() => setSelectedCarIndex(index)}
                  style={{ 
                    width: '160px', 
                    padding: 0, 
                    cursor: 'pointer',
                    border: selectedCarIndex === index ? `3px solid ${car.iconColor}` : '3px solid #333',
                    boxShadow: selectedCarIndex === index ? `0 0 20px ${car.iconColor}` : '0 10px 15px rgba(0,0,0,0.5)',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="cube-container">
                      <div className="cube">
                        <div className="cube-face cube-front" style={{ background: '#000', padding: 0 }}>
                          <img src={car.image} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="cube-face cube-back" style={{ background: '#fff' }}>
                          <div className="cube-icon" style={{ display: 'flex', color: '#000', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center', lineHeight: '1.2' }}>
                            {car.name}
                          </div>
                        </div>
                        <div className="cube-face cube-right"></div>
                        <div className="cube-face cube-left"></div>
                        <div className="cube-face cube-top"></div>
                        <div className="cube-face cube-bottom"></div>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', padding: '10px 0', borderTop: '1px solid #333' }}>
                    {car.name}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <button className="btn-primary" style={{ background: '#3b82f6', fontSize: '1.2rem' }} onClick={() => startGame('oneway')}>
                <Car size={24} /> One-Way Traffic
              </button>
              <button className="btn-primary" style={{ background: '#ef4444', fontSize: '1.2rem' }} onClick={() => startGame('twoway')}>
                <Zap size={24} /> Two-Way Traffic
              </button>
            </div>
            
            <button className="btn-primary" style={{ background: '#555', marginTop: '20px', fontSize: '1.2rem', padding: '10px 20px' }} onClick={() => navigate('/')}>
              <ArrowLeft size={20} /> Back to Hub
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && !showMenu && (
          <div className="game-over-overlay">
            <h1 style={{ fontSize: '4rem', color: '#ef4444', textShadow: '0 0 20px rgba(239, 68, 68, 0.6)' }}>CRASHED!</h1>
            <div style={{ fontSize: '2rem', margin: '20px 0' }}>Score: {score}</div>
            
            <button className="btn-primary" onClick={resetGame}>
              <RefreshCw size={24} /> Play Again
            </button>
            
            <button className="btn-primary" style={{ background: '#3b82f6', marginTop: '10px' }} onClick={() => { setGameOver(false); setShowMenu(true); }}>
              Change Mode
            </button>
            
            <button className="btn-primary" style={{ background: '#555', marginTop: '10px' }} onClick={() => navigate('/')}>
              <ArrowLeft size={24} /> Back to Hub
            </button>
          </div>
        )}
      </div>
    </>
  );
}
