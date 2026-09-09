import React, { useEffect, useRef } from 'react';

export default function Connect4Background() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    mountNode.appendChild(canvas);

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    const vertSrc = `
      attribute vec2 position;
      void main(){ gl_Position = vec4(position, 0.0, 1.0); }
    `;

    const fragSrc = `
      precision highp float;
      uniform vec2 uRes;
      uniform float uTime;

      vec2 hash2(vec2 p){
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
        return mix(
          mix(dot(hash2(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
              dot(hash2(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
          mix(dot(hash2(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
              dot(hash2(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p){
        float v = 0.0;
        float amp = 0.55;
        for(int i = 0; i < 5; i++){
          v += amp * noise(p);
          p *= 2.02;
          amp *= 0.55;
        }
        return v;
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / uRes.xy;
        vec2 aspectUv = uv;
        aspectUv.x *= uRes.x / uRes.y;

        float t = uTime * 0.05;

        // domain warp: liquid flows and folds back on itself
        vec2 warpA = vec2(fbm(aspectUv * 1.5 + vec2(t, -t*0.7)),
                           fbm(aspectUv * 1.5 + vec2(-t*0.6, t*0.9)));
        vec2 warped = aspectUv * 1.3 + warpA * 0.9;

        vec2 warpB = vec2(fbm(warped + vec2(t*0.4, t*0.3)),
                           fbm(warped - vec2(t*0.3, t*0.5)));
        vec2 warped2 = warped + warpB * 0.55;

        // field that decides red vs yellow at this point (flowing marble pattern)
        float mixField = fbm(warped2 * 1.0 + vec2(0.0, t*0.5));
        mixField = mixField * 0.5 + 0.5; // 0..1

        // hard-edged blobs instead of a soft gaseous blend — reads as liquid pools
        float edge = smoothstep(0.46, 0.54, mixField);
        vec3 yellow = vec3(0.980, 0.792, 0.118); // #fac91e
        vec3 red    = vec3(0.859, 0.184, 0.184); // #db2f2f
        vec3 liquid = mix(red, yellow, edge);

        // ---- fake surface height + normal, purely for lighting (liquid bulge) ----
        float eps = 0.0025;
        float hC = fbm(warped2 * 2.2);
        float hX = fbm((warped2 + vec2(eps, 0.0)) * 2.2);
        float hY = fbm((warped2 + vec2(0.0, eps)) * 2.2);
        vec3 normal = normalize(vec3((hC - hX) / eps, (hC - hY) / eps, 1.6));

        vec3 lightDir = normalize(vec3(-0.4, 0.6, 0.7));
        float diffuse = max(dot(normal, lightDir), 0.0);

        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfDir), 0.0), 30.0);

        // shade the liquid: softer diffuse lighting, significantly lower specular gloss
        vec3 shaded = liquid * (0.7 + 0.3 * diffuse) + vec3(1.0) * spec * 0.25;

        // deep red/maroon shadow tint where the surface dips
        vec3 shadowTint = mix(vec3(0.35, 0.05, 0.05), vec3(0.45, 0.2, 0.0), edge);
        shaded = mix(shadowTint, shaded, smoothstep(0.0, 1.0, diffuse + 0.4));

        gl_FragColor = vec4(shaded, 1.0);
      }
    `;

    function compile(type, src) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertSrc));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(program);
    gl.useProgram(program);

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');

    const start = performance.now();
    let animationFrameId;

    function render() {
      const t = (performance.now() - start) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    }
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      if (mountNode && canvas) {
        mountNode.removeChild(canvas);
      }
      // Clean up WebGL resources
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
      
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
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
        background: '#7a1414' 
      }} 
    />
  );
}
