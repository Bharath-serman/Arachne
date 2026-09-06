import * as THREE from "three";

export const screenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** CRT screen: curvature, scanlines, chromatic separation, static, tearing, bloom-ish falloff. */
export const screenFragment = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform sampler2D uTex;
  uniform float uHasTex;
  uniform float uStatic;
  uniform float uBright;
  uniform float uGlitch;
  uniform vec3 uTint;

  float hash(vec2 c) {
    return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 c = vUv * 2.0 - 1.0;
    c *= 1.0 + 0.055 * dot(c, c);
    vec2 uv = c * 0.5 + 0.5;

    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // horizontal tearing, rare and short
    float band = floor(uv.y * 90.0);
    float tear = step(0.992, hash(vec2(floor(uTime * 9.0), band)));
    uv.x = fract(uv.x + tear * (0.02 + uGlitch * 0.06));

    vec3 col;
    if (uHasTex > 0.5) {
      float ab = 0.0018 + uGlitch * 0.006;
      col.r = texture2D(uTex, uv + vec2(ab, 0.0)).r;
      col.g = texture2D(uTex, uv).g;
      col.b = texture2D(uTex, uv - vec2(ab, 0.0)).b;
      col *= 1.25;
    } else {
      float n = hash(uv * vec2(280.0, 180.0) + uTime * 1.7);
      float sweep = smoothstep(0.35, 0.0, abs(fract(uv.y - uTime * 0.06) - 0.5));
      col = mix(vec3(n * 0.55), uTint * (0.35 + n * 0.5), 0.45) + sweep * uTint * 0.12;
    }

    // static / white noise
    float st = hash(uv * vec2(420.0, 320.0) + uTime * 11.0);
    col = mix(col, vec3(st), uStatic * 0.55 + uGlitch * 0.35);

    // pixel blocks during glitch
    if (uGlitch > 0.01) {
      vec2 bl = floor(uv * vec2(60.0, 40.0));
      float b = step(0.985 - uGlitch * 0.02, hash(bl + floor(uTime * 12.0)));
      col += b * uGlitch * 0.5;
    }

    float scan = 0.82 + 0.18 * sin(uv.y * 620.0);
    col *= scan;

    float flicker = 0.93 + 0.07 * sin(uTime * 37.0 + uv.y * 3.0);
    col *= flicker * uBright;

    float vig = smoothstep(1.25, 0.25, length(uv * 2.0 - 1.0));
    col *= 0.35 + 0.65 * vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const glowFragment = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uStrength;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(max(0.0, 1.0 - d), 3.0) * uStrength;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

export const makeScreenUniforms = (tex: THREE.Texture | null, tint: string, stat: number) => ({
  uTime: { value: Math.random() * 100 },
  uTex: { value: tex },
  uHasTex: { value: tex ? 1 : 0 },
  uStatic: { value: stat },
  uBright: { value: 1 },
  uGlitch: { value: 0 },
  uTint: { value: new THREE.Color(tint) },
});
