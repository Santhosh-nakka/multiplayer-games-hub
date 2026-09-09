import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function TicTacToeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060f, 0.028);
    scene.background = new THREE.Color(0x05060f);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountNode.appendChild(renderer.domElement);

    // ---------- Lighting: cool void ambience + colored accents ----------
    // Increased ambient intensity for modern Three.js
    scene.add(new THREE.AmbientLight(0x2a2f55, 2.5));

    // Multiply point light intensities by ~100 for modern physical lighting falloff
    const redLight = new THREE.PointLight(0xef4444, 250, 60);
    redLight.position.set(-15, 8, 10);
    scene.add(redLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 250, 60);
    blueLight.position.set(15, -8, 10);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0x7c3aed, 150, 80);
    purpleLight.position.set(0, 0, -20);
    scene.add(purpleLight);

    // ---------- Materials ----------
    const xMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444, emissive: 0x7a1414, emissiveIntensity: 2.0,
      metalness: 0.2, roughness: 0.2
    });
    const oMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6, emissive: 0x123a7a, emissiveIntensity: 2.0,
      metalness: 0.2, roughness: 0.2
    });

    // ---------- Builders ----------
    function makeX(size) {
      const group = new THREE.Group();
      const barGeo = new THREE.BoxGeometry(size, size * 0.22, size * 0.22);
      const bar1 = new THREE.Mesh(barGeo, xMaterial);
      bar1.rotation.z = Math.PI / 4;
      const bar2 = new THREE.Mesh(barGeo, xMaterial);
      bar2.rotation.z = -Math.PI / 4;
      group.add(bar1, bar2);
      return group;
    }

    function makeO(size) {
      const geo = new THREE.TorusGeometry(size * 0.45, size * 0.14, 16, 32);
      return new THREE.Mesh(geo, oMaterial);
    }

    // ---------- Populate the void ----------
    const symbols = [];
    const COUNT = 70;
    const SPREAD = 45;

    for (let i = 0; i < COUNT; i++) {
      const isX = Math.random() > 0.5;
      const size = THREE.MathUtils.randFloat(1.2, 3.4);
      const mesh = isX ? makeX(size) : makeO(size);

      mesh.position.set(
        THREE.MathUtils.randFloatSpread(SPREAD),
        THREE.MathUtils.randFloatSpread(SPREAD),
        THREE.MathUtils.randFloatSpread(SPREAD) - 5
      );
      mesh.rotation.set(
        Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI
      );

      const scaleJitter = THREE.MathUtils.randFloat(0.7, 1.3);
      mesh.scale.setScalar(scaleJitter);

      symbols.push({
        mesh,
        rotSpeed: new THREE.Vector3(
          THREE.MathUtils.randFloat(-0.15, 0.15),
          THREE.MathUtils.randFloat(-0.15, 0.15),
          THREE.MathUtils.randFloat(-0.1, 0.1)
        ),
        floatSpeed: THREE.MathUtils.randFloat(0.2, 0.6),
        floatAmp: THREE.MathUtils.randFloat(0.5, 1.8),
        floatOffset: Math.random() * Math.PI * 2,
        baseY: mesh.position.y
      });

      scene.add(mesh);
    }

    // subtle distant star-like particles for extra depth
    const starGeo = new THREE.BufferGeometry();
    const starCount = 400;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = THREE.MathUtils.randFloatSpread(120);
      starPos[i * 3 + 1] = THREE.MathUtils.randFloatSpread(120);
      starPos[i * 3 + 2] = THREE.MathUtils.randFloatSpread(120) - 40;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x8b93b8, size: 0.15, transparent: true, opacity: 0.5 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ---------- Animate ----------
    const clock = new THREE.Clock();
    let animationFrameId;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      symbols.forEach(s => {
        s.mesh.rotation.x += s.rotSpeed.x * 0.016;
        s.mesh.rotation.y += s.rotSpeed.y * 0.016;
        s.mesh.rotation.z += s.rotSpeed.z * 0.016;
        s.mesh.position.y = s.baseY + Math.sin(t * s.floatSpeed + s.floatOffset) * s.floatAmp;
      });

      stars.rotation.y = t * 0.01;

      // slow camera drift for parallax, looking at center
      camera.position.x = Math.sin(t * 0.05) * 6;
      camera.position.y = Math.cos(t * 0.04) * 3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    
    animate();

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountNode && renderer.domElement) {
        mountNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundColor: '#05060f' }} 
    />
  );
}
