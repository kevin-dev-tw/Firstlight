// Interactive dot grid: spotlight + soft magnetic repulsion around the cursor.
// WebGL2 fullscreen pass. Falls back to the CSS dot grid when unavailable.

const VERT = `#version 300 es
layout(location=0) in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision mediump float;

uniform vec2 uRes;      // css px
uniform vec2 uMouse;    // css px, y-down
uniform float uPresence;
uniform float uSpacing;
uniform float uDpr;
out vec4 outColor;

const vec3 BG     = vec3(253.0, 253.0, 253.0) / 255.0;
const vec3 DOT    = vec3(24.0, 24.0, 27.0) / 255.0;
const vec3 ACCENT = vec3(47.0, 87.0, 217.0) / 255.0;
const vec3 L2_COL = vec3(148.0, 142.0, 132.0) / 255.0; // warm gray
const float BASE_R = 1.4;
const float BASE_A = 0.16;
const float L2_R   = 1.9;   // coarse lattice: larger, fainter
const float L2_A   = 0.055;
const float PUSH_R = 120.0;  // magnetic radius, css px
const float SPOT_R = 150.0;  // spotlight radius, css px

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr; // css px, y-down

  // --- coarse lattice (3x spacing, half-cell offset): the "far" layer ---
  float s2 = uSpacing * 3.0;
  vec2 c2 = (floor(p / s2) + 0.5) * s2 + uSpacing * 0.5;
  vec2 toDot2 = c2 - uMouse;
  float dist2 = length(toDot2);
  float push2 = (1.0 - smoothstep(0.0, PUSH_R, dist2)) * uPresence;
  c2 += (dist2 > 0.001 ? toDot2 / dist2 : vec2(0.0)) * push2 * 5.0; // half push = depth
  float spot2 = (1.0 - smoothstep(0.0, SPOT_R, dist2)) * uPresence;
  float rad2 = L2_R * (1.0 + spot2 * 0.5);
  float a2 = L2_A * (1.0 + spot2 * 1.4);
  vec3 col2 = mix(L2_COL, ACCENT, spot2 * 0.2);
  float m2 = 1.0 - smoothstep(rad2 - 0.8, rad2 + 0.8, length(p - c2));
  vec3 rgb = mix(BG, col2, min(a2 * m2, 1.0));

  // --- base lattice ---
  vec2 cell = floor(p / uSpacing);
  vec2 c0 = (cell + 0.5) * uSpacing;                     // nearest dot center

  vec2 toDot = c0 - uMouse;
  float dist = length(toDot);

  // soft repulsion: dots ease away from the cursor
  float push = (1.0 - smoothstep(0.0, PUSH_R, dist)) * uPresence;
  vec2 c = c0 + (dist > 0.001 ? toDot / dist : vec2(0.0)) * push * 10.0;

  // spotlight: nearer dots grow, darken, pick up a whisper of cobalt
  float spot = (1.0 - smoothstep(0.0, SPOT_R, dist)) * uPresence;
  float rad = BASE_R * (1.0 + spot * 0.9);
  // per-dot brightness jitter: print-grain feel
  float jitter = 0.72 + 0.55 * fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
  float alpha = BASE_A * jitter * (1.0 + spot * 1.6);
  vec3 col = mix(DOT, ACCENT, spot * 0.3);

  float m = 1.0 - smoothstep(rad - 0.8, rad + 0.8, length(p - c));
  rgb = mix(rgb, col, min(alpha * m, 1.0));
  outColor = vec4(rgb, 1.0);
}
`;

export function initDots() {
  const canvas = document.getElementById('dots-canvas');
  const gl = canvas && canvas.getContext('webgl2', { antialias: false });
  if (!gl) return; // CSS dot grid stays as the fallback

  document.documentElement.classList.add('has-dots-gl');

  const SPACING = 40;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // Fullscreen triangle
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');
  const uPresence = gl.getUniformLocation(prog, 'uPresence');
  const uDpr = gl.getUniformLocation(prog, 'uDpr');
  gl.uniform1f(gl.getUniformLocation(prog, 'uSpacing'), SPACING);

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, innerWidth, innerHeight);
    gl.uniform1f(uDpr, dpr);
  };

  const draw = () => gl.drawArrays(gl.TRIANGLES, 0, 3);

  resize();
  gl.uniform2f(uMouse, -9999, -9999);
  gl.uniform1f(uPresence, 0);
  draw();

  if (reducedMotion) {
    window.addEventListener('resize', () => { resize(); draw(); });
    return;
  }

  // Smoothed pointer + presence fade + idle sleep
  let tx = -9999, ty = -9999, mx = -9999, my = -9999;
  let presence = 0, lastMove = -1e9, raf = 0;

  const frame = (t) => {
    const idle = t - lastMove;
    const target = Math.max(0, 1 - Math.max(0, idle - 150) / 900);
    presence += (target - presence) * 0.1;
    mx += (tx - mx) * 0.18;
    my += (ty - my) * 0.18;

    gl.uniform2f(uMouse, mx, my);
    gl.uniform1f(uPresence, presence);
    draw();

    if (presence > 0.004 || target > 0) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = 0;
    }
  };

  const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };

  window.addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    lastMove = performance.now();
    wake();
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', () => {
    lastMove = -1e9;
  });

  window.addEventListener('resize', () => { resize(); draw(); });
}
