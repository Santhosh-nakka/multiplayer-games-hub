import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function RockPaperScissorsBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x152a70, 0.022);
    // Keep scene background transparent so the CSS radial gradient shows through!
    // scene.background = new THREE.Color(0x1a3480); 

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 32);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountNode.appendChild(renderer.domElement);

    // ---------- Lighting (Scaled for modern physically correct rendering) ----------
    scene.add(new THREE.AmbientLight(0xaebfff, 2.8));
    scene.add(new THREE.HemisphereLight(0xbfd0ff, 0x14245e, 1.8));

    const orangeLight = new THREE.PointLight(0xf59e0b, 250, 70);
    orangeLight.position.set(-15, 8, 14);
    scene.add(orangeLight);

    const whiteLight = new THREE.PointLight(0xffffff, 160, 70);
    whiteLight.position.set(15, -8, 14);
    scene.add(whiteLight);

    const skyLight = new THREE.PointLight(0x5b8def, 130, 90);
    skyLight.position.set(0, 10, -20);
    scene.add(skyLight);

    // ---------- Materials ----------
    const rockMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x8a7c6a, roughness: 0.95, metalness: 0.02, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: 0x716552, roughness: 0.95, metalness: 0.02, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: 0x9a8f7d, roughness: 0.95, metalness: 0.02, flatShading: true })
    ];
    const paperMaterial = new THREE.MeshStandardMaterial({
      color: 0xf3ead9, roughness: 0.6, metalness: 0.0, side: THREE.DoubleSide
    });
    const scissorMetal = new THREE.MeshStandardMaterial({
      color: 0xc7ccd6, roughness: 0.25, metalness: 0.85
    });
    const scissorHandle = new THREE.MeshStandardMaterial({
      color: 0xef4444, roughness: 0.5, metalness: 0.2
    });
    const rivetMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, roughness: 0.3, metalness: 0.7
    });

    // ---------- Builders ----------
    function hash3(x, y, z) {
      const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
      return s - Math.floor(s);
    }

    function makeRock(size) {
      const geo = new THREE.IcosahedronGeometry(size * 0.55, 1);
      const pos = geo.attributes.position;

      const sx = THREE.MathUtils.randFloat(0.85, 1.25);
      const sy = THREE.MathUtils.randFloat(0.75, 1.1);
      const sz = THREE.MathUtils.randFloat(0.85, 1.2);

      for (let i = 0; i < pos.count; i++) {
        const ox = pos.getX(i), oy = pos.getY(i), oz = pos.getZ(i);
        const n = hash3(ox * 3.1, oy * 3.1, oz * 3.1);
        const bump = 1 + (n - 0.5) * 0.32;
        pos.setXYZ(i, ox * sx * bump, oy * sy * bump, oz * sz * bump);
      }
      geo.computeVertexNormals();

      const material = rockMaterials[Math.floor(Math.random() * rockMaterials.length)];
      return new THREE.Mesh(geo, material);
    }

    function makePaper(size) {
      const geo = new THREE.PlaneGeometry(size * 0.9, size * 1.15, 6, 6);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const bend = Math.sin(x * 0.6) * size * 0.05;
        pos.setZ(i, pos.getZ(i) + bend);
      }
      geo.computeVertexNormals();
      return new THREE.Mesh(geo, paperMaterial);
    }

    function makeScissors(size) {
      const group = new THREE.Group();

      function blade() {
        const bladeGroup = new THREE.Group();
        const metal = new THREE.Mesh(
          new THREE.ConeGeometry(size * 0.09, size * 0.55, 8),
          scissorMetal
        );
        metal.position.y = size * 0.32;
        metal.rotation.x = Math.PI;

        const handle = new THREE.Mesh(
          new THREE.TorusGeometry(size * 0.14, size * 0.045, 8, 16),
          scissorHandle
        );
        handle.position.y = -size * 0.28;

        const shaft = new THREE.Mesh(
          new THREE.CylinderGeometry(size * 0.03, size * 0.03, size * 0.35, 8),
          scissorHandle
        );
        shaft.position.y = -size * 0.05;

        bladeGroup.add(metal, handle, shaft);
        return bladeGroup;
      }

      const blade1 = blade();
      blade1.rotation.z = Math.PI / 10;
      const blade2 = blade();
      blade2.rotation.z = -Math.PI / 10 + Math.PI;

      const rivet = new THREE.Mesh(
        new THREE.SphereGeometry(size * 0.06, 12, 12),
        rivetMaterial
      );

      group.add(blade1, blade2, rivet);
      return group;
    }

    const builders = [makeRock, makePaper, makeScissors];

    // ---------- Populate the void ----------
    const symbols = [];
    const COUNT = 55;
    const SPREAD = 45;

    for (let i = 0; i < COUNT; i++) {
      const builder = builders[Math.floor(Math.random() * builders.length)];
      const size = THREE.MathUtils.randFloat(1.6, 3.6);
      const mesh = builder(size);

      mesh.position.set(
        THREE.MathUtils.randFloatSpread(SPREAD),
        THREE.MathUtils.randFloatSpread(SPREAD),
        THREE.MathUtils.randFloatSpread(SPREAD) - 5
      );
      mesh.rotation.set(
        Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI
      );

      symbols.push({
        mesh,
        rotSpeed: new THREE.Vector3(
          THREE.MathUtils.randFloat(-0.15, 0.15),
          THREE.MathUtils.randFloat(-0.15, 0.15),
          THREE.MathUtils.randFloat(-0.1, 0.1)
        ),
        floatSpeed: THREE.MathUtils.randFloat(0.2, 0.6),
        floatAmp: THREE.MathUtils.randFloat(0.6, 2.0),
        floatOffset: Math.random() * Math.PI * 2,
        baseY: mesh.position.y
      });

      scene.add(mesh);
    }

    // subtle distant particles for extra depth
    const starGeo = new THREE.BufferGeometry();
    const starCount = 400;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = THREE.MathUtils.randFloatSpread(120);
      starPos[i * 3 + 1] = THREE.MathUtils.randFloatSpread(120);
      starPos[i * 3 + 2] = THREE.MathUtils.randFloatSpread(120) - 40;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xdfe8ff, size: 0.15, transparent: true, opacity: 0.45 });
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
