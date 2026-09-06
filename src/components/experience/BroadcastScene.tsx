import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { scrollState, damp, easeInOutPow } from "@/lib/scroll-state";
import { screenVertex, glowFragment } from "./crt-shaders";
import { makeWebTexture, makeWebCardTexture, makeStrandVeilTexture } from "./web-texture";
import { PROFILE_CARDS } from "./profile-cards";
import { Spider } from "./Spider";

type WebConfig = {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  /** index into PROFILE_CARDS — a silk card spun into this web */
  card?: number;
  tint: string;
  seed: number;
  spider?: boolean;
  hero?: boolean;
};

interface SpiderWebUniforms {
  uMap: { value: THREE.Texture | null };
  uSpiderPos: { value: THREE.Vector2 };
  uSpiderVel: { value: THREE.Vector2 };
  uSpiderWeight: { value: number };
  uTime: { value: number };
  uColor: { value: THREE.Color };
  uOpacity: { value: number };
  uHub: { value: THREE.Vector2 };
  uRippleTime: { value: number };
  uRipplePos: { value: THREE.Vector2 };
}

/** Webs scattered at random angles down the corridor the camera travels through. */
const LAYOUT: WebConfig[] = [
  { pos: [-2.7, -0.3, 3.4], rot: [0.05, 0.42, -0.12], scale: 1.5, card: 0, tint: "#e2242f", seed: 3, spider: true, hero: true },
  { pos: [5.6, -2.4, 2.6], rot: [0.14, -0.7, 0.9], scale: 2.9, tint: "#9dc0ff", seed: 101 },
  { pos: [3.3, 1.1, 1.2], rot: [-0.06, -0.52, 0.31], scale: 1.9, tint: "#7fa8ff", seed: 11, spider: true },
  { pos: [-5.4, 2.8, -0.6], rot: [-0.2, 0.8, -0.5], scale: 3.1, tint: "#c8d8f0", seed: 103 },
  { pos: [-3.9, 1.6, -2.8], rot: [0.03, 0.36, 0.62], scale: 2.4, tint: "#e2242f", seed: 5, spider: true },
  { pos: [2.3, -1.7, -5.6], rot: [-0.04, -0.32, -0.44], scale: 1.6, card: 1, tint: "#7fa8ff", seed: 17 },
  { pos: [6.2, 2.2, -7.4], rot: [0.16, -0.86, 1.2], scale: 3.3, tint: "#9dc0ff", seed: 107, spider: true },
  { pos: [-1.5, 0.4, -9.2], rot: [0.02, 0.18, 1.1], scale: 2.8, tint: "#d8dee8", seed: 23 },
  { pos: [-6.4, -2.6, -11.0], rot: [-0.18, 0.74, -0.36], scale: 3.4, tint: "#c8d8f0", seed: 109 },
  { pos: [4.5, 1.9, -12.6], rot: [-0.07, -0.46, 0.22], scale: 1.7, card: 2, tint: "#e2242f", seed: 29, spider: true },
  { pos: [0.6, 3.4, -14.4], rot: [0.24, 0.1, 0.68], scale: 3.0, tint: "#9dc0ff", seed: 113 },
  { pos: [-4.7, -1.2, -16.2], rot: [0.06, 0.52, -0.75], scale: 2.5, tint: "#7fa8ff", seed: 31, spider: true },
  { pos: [6.8, -3.0, -18.2], rot: [-0.12, -0.9, 0.44], scale: 3.5, tint: "#c8d8f0", seed: 127 },
  { pos: [1.2, 2.4, -20.1], rot: [-0.09, -0.22, 0.36], scale: 1.7, card: 3, tint: "#7fa8ff", seed: 37 },
  { pos: [-6.9, 2.4, -22.0], rot: [0.2, 0.94, -1.0], scale: 3.6, tint: "#9dc0ff", seed: 131 },
  { pos: [-2.1, -2.3, -24.1], rot: [0.07, 0.3, 0.94], scale: 2.6, tint: "#d8dee8", seed: 41, spider: true },
  { pos: [3.0, -3.6, -26.2], rot: [-0.26, -0.5, 0.16], scale: 3.2, tint: "#c8d8f0", seed: 137 },
  { pos: [4.1, -0.6, -28.6], rot: [-0.03, -0.38, -0.28], scale: 2.2, tint: "#e2242f", seed: 43 },
  { pos: [-6.2, 0.2, -30.6], rot: [0.1, 0.86, 0.52], scale: 3.4, tint: "#9dc0ff", seed: 139, spider: true },
  { pos: [-3.3, 2.1, -33.1], rot: [0.04, 0.24, 0.55], scale: 1.75, card: 4, tint: "#e2242f", seed: 47 },
  { pos: [5.9, 3.2, -35.4], rot: [0.22, -0.8, -0.62], scale: 3.5, tint: "#c8d8f0", seed: 149 },
  { pos: [2.7, 1.0, -38.1], rot: [-0.05, -0.28, -0.66], scale: 2.7, tint: "#7fa8ff", seed: 53, spider: true },
  { pos: [-5.8, -3.2, -40.4], rot: [-0.24, 0.66, 1.05], scale: 3.6, tint: "#9dc0ff", seed: 151 },
  { pos: [-1.1, -1.8, -43.1], rot: [0.03, 0.2, 0.18], scale: 1.8, card: 5, tint: "#7fa8ff", seed: 59 },
  { pos: [6.4, 0.8, -45.4], rot: [0.08, -0.92, 0.3], scale: 3.4, tint: "#c8d8f0", seed: 157, spider: true },
  { pos: [3.5, 2.6, -48.1], rot: [-0.06, -0.32, 0.42], scale: 1.8, card: 6, tint: "#e2242f", seed: 61, spider: true },
  { pos: [-4.4, 1.2, -50.6], rot: [0.16, 0.7, -0.84], scale: 3.6, tint: "#9dc0ff", seed: 163 },
];

/** Loose silk strands drifting between the webs. */
function Strand({ from, to, seed }: { from: THREE.Vector3; to: THREE.Vector3; seed: number }) {
  const line = useMemo(() => {
    const mid = from.clone().lerp(to, 0.5);
    mid.y -= 0.8 + (seed % 5) * 0.25;
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));
    const material = new THREE.LineBasicMaterial({ color: "#c9d4e2", transparent: true, opacity: 0.2 });
    return new THREE.Line(geo, material);
  }, [from, to, seed]);

  return <primitive object={line} />;
}

function webHubForSeed(seed: number): [number, number] {
  let s = seed * 9301 + 49297;
  const next = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const cx = 0.4 + next() * 0.2;
  const cy = 0.4 + next() * 0.2;
  return [(cx - 0.5), (0.5 - cy)];
}

const SpiderWebShader = {
  uniforms: {
    uMap: { value: null as THREE.Texture | null },
    uSpiderPos: { value: new THREE.Vector2(0, 0) },
    uSpiderVel: { value: new THREE.Vector2(0, 0) },
    uSpiderWeight: { value: 0.0 },
    uTime: { value: 0.0 },
    uColor: { value: new THREE.Color("#e2242f") },
    uOpacity: { value: 0.75 },
    uHub: { value: new THREE.Vector2(0, 0) },
    uRippleTime: { value: 0.0 },
    uRipplePos: { value: new THREE.Vector2(0, 0) },
  },
  vertexShader: `
    uniform vec2 uSpiderPos;
    uniform vec2 uSpiderVel;
    uniform float uSpiderWeight;
    uniform float uTime;
    uniform vec2 uHub;
    uniform float uRippleTime;
    uniform vec2 uRipplePos;

    varying vec2 vUv;
    varying float vVibration;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vec3 pos = position;

      vec2 dPos = pos.xy - uSpiderPos;
      float dist = length(dPos);

      // Localized weight dip under spider feet/body
      float weightDip = -0.11 * exp(-dist * 2.5) * uSpiderWeight;

      // Footfall high-frequency silk twitching
      float stepVibe = sin(uTime * 46.0 - dist * 22.0) * exp(-dist * 3.4) * uSpiderWeight;

      // Trailing walking wave
      float walkWave = sin(uTime * 28.0 - dist * 12.0) * exp(-dist * 1.8) * uSpiderWeight;

      // Radial spoke tension propagation
      vec2 spiderRad = uSpiderPos - uHub;
      float spiderRadLen = length(spiderRad);
      vec2 vertRad = pos.xy - uHub;
      float vertRadLen = length(vertRad);

      float spokeAlign = 0.0;
      if (spiderRadLen > 0.01 && vertRadLen > 0.01) {
        float cosAngle = dot(spiderRad / spiderRadLen, vertRad / vertRadLen);
        spokeAlign = pow(max(0.0, cosAngle), 28.0);
      }

      float spokeVibe = sin(uTime * 36.0 - vertRadLen * 14.0) * spokeAlign * exp(-abs(vertRadLen - spiderRadLen) * 1.5) * uSpiderWeight;

      // Click ripple effect from cursor interaction
      float rDist = length(pos.xy - uRipplePos);
      float rippleWave = 0.0;
      if (uRippleTime > 0.0 && uRippleTime < 1.5) {
        float waveFront = uRippleTime * 4.5;
        float diff = abs(rDist - waveFront);
        rippleWave = sin(rDist * 16.0 - uRippleTime * 22.0) * exp(-diff * 2.5) * exp(-uRippleTime * 2.2) * 0.14;
      }

      pos.z += weightDip + (stepVibe * 0.045) + (walkWave * 0.025) + (spokeVibe * 0.035) + rippleWave;

      float velMag = length(uSpiderVel);
      if (velMag > 0.0005) {
        pos.xy += (uSpiderVel / velMag) * min(velMag * 2.5, 0.15) * exp(-dist * 2.8) * uSpiderWeight;
      }

      vVibration = (exp(-dist * 3.2) * 1.4 + spokeAlign * 0.7) * uSpiderWeight + abs(rippleWave) * 3.0;

      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D uMap;
    uniform float uOpacity;
    uniform vec3 uColor;

    varying vec2 vUv;
    varying float vVibration;
    varying vec3 vWorldPosition;

    void main() {
      vec4 texColor = texture2D(uMap, vUv);
      if (texColor.a < 0.015) discard;

      vec3 glowColor = mix(texColor.rgb, uColor, min(1.0, vVibration * 0.45));
      float alpha = texColor.a * uOpacity * (1.0 + min(0.6, vVibration * 0.4));

      gl_FragColor = vec4(glowColor, alpha);
    }
  `,
};

function SpiderWeb({ config }: { config: WebConfig }) {
  const webTex = useMemo(() => makeWebTexture(config.seed), [config.seed]);
  const hub = useMemo(() => webHubForSeed(config.seed), [config.seed]);
  const size = 3.4 * config.scale;
  const cardTex = useMemo(
    () =>
      config.card === undefined
        ? null
        : makeWebCardTexture(PROFILE_CARDS[config.card]!, config.tint),
    [config.card, config.tint],
  );

  const group = useRef<THREE.Group>(null);
  const webMesh = useRef<THREE.Mesh>(null);
  const crawlPoint = useRef(new THREE.Vector2());
  const previousCrawlPoint = useRef(new THREE.Vector2());
  const webSpringOffset = useRef(new THREE.Vector2());
  const webSpringVelocity = useRef(new THREE.Vector2());
  const hover = useRef(0);
  const pulse = useRef(0);

  const spiderOrigin: [number, number, number] = useMemo(
    () => [hub[0] * size, hub[1] * size, 0.04],
    [hub, size],
  );

  const silkMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(SpiderWebShader.uniforms),
      vertexShader: SpiderWebShader.vertexShader,
      fragmentShader: SpiderWebShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const u = mat.uniforms as unknown as SpiderWebUniforms;
    u.uMap.value = webTex;
    u.uColor.value = new THREE.Color(config.tint);
    u.uHub.value.set(spiderOrigin[0], spiderOrigin[1]);
    u.uSpiderWeight.value = config.spider ? 1.0 : 0.0;
    return mat;
  }, [webTex, config.tint, config.spider, spiderOrigin]);

  const glowUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(config.tint) },
      uStrength: { value: 0.28 },
    }),
    [config.tint],
  );
  const seedF = useMemo(() => (config.seed % 10) + Math.random(), [config.seed]);
  const t = useRef(0);
  const ndc = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    t.current += d;

    const cp = crawlPoint.current;
    const prev = previousCrawlPoint.current;
    const vx = cp.x - prev.x;
    const vy = cp.y - prev.y;

    const u = silkMaterial.uniforms as unknown as SpiderWebUniforms;
    u.uSpiderPos.value.copy(cp);
    u.uSpiderVel.value.set(vx, vy);
    u.uTime.value = t.current;
    prev.copy(cp);

    const v = scrollState.velocity;

    // ---- cursor proximity ----
    let proximity = 0;
    if (group.current) {
      ndc.set(group.current.position.x, group.current.position.y, group.current.position.z);
      ndc.project(state.camera);
      if (ndc.z < 1) {
        const dx = ndc.x - scrollState.pointerX;
        const dy = ndc.y + scrollState.pointerY;
        const r = Math.sqrt(dx * dx + dy * dy);
        const reach = 0.34 + config.scale * 0.09;
        proximity = Math.max(0, 1 - r / reach);
        proximity *= proximity;
      }
    }
    hover.current = damp(hover.current, proximity, proximity > hover.current ? 9 : 4, d);

    // ---- click ripple ----
    const since = (performance.now() - scrollState.clickAt) / 1000;
    if (since >= 0 && since < 0.08 && proximity > 0.05) {
      pulse.current = Math.max(pulse.current, proximity);
      u.uRipplePos.value.set(
        scrollState.pointerX * size * 0.5,
        scrollState.pointerY * size * 0.5,
      );
      u.uRippleTime.value = 0.001;
    }
    if (u.uRippleTime.value > 0.0) {
      u.uRippleTime.value += d;
      if (u.uRippleTime.value > 1.5) {
        u.uRippleTime.value = 0.0;
      }
    }
    pulse.current = damp(pulse.current, 0, 2.2, d);

    const h = hover.current;
    const shimmer = h * (0.55 + Math.sin(t.current * 22 + seedF * 3) * 0.45);
    const ripple = pulse.current * Math.sin(Math.min(since, 2.0) * 26) * Math.exp(-Math.min(since, 2.0) * 3.2);

    glowUniforms.uStrength.value = damp(
      glowUniforms.uStrength.value,
      0.22 +
        Math.sin(t.current * 1.6 + seedF) * 0.05 +
        v * 0.35 +
        shimmer * 0.85 +
        Math.abs(ripple) * 1.4,
      6,
      d,
    );

    u.uOpacity.value = damp(
      u.uOpacity.value,
      0.75 + shimmer * 0.55 + Math.abs(ripple) * 0.5,
      8,
      d,
    );

    if (webMesh.current) {
      const offset = webSpringOffset.current;
      const velocity = webSpringVelocity.current;
      const targetX = -cp.x * 0.28 - vx * 2.2;
      const targetY = -cp.y * 0.28 - vy * 2.2;
      velocity.x += (targetX - offset.x) * 28 * d;
      velocity.y += (targetY - offset.y) * 28 * d;
      velocity.multiplyScalar(Math.exp(-7.5 * d));
      offset.x += velocity.x * d;
      offset.y += velocity.y * d;
      webMesh.current.position.x = offset.x;
      webMesh.current.position.y = offset.y;
      webMesh.current.rotation.z = velocity.x * 0.035;
      webMesh.current.rotation.x = velocity.y * 0.035;
      const tension = Math.min(
        0.09,
        Math.hypot(velocity.x, velocity.y) * 0.04 + Math.hypot(vx, vy) * 0.5,
      );
      webMesh.current.scale.x = 1 + tension;
      webMesh.current.scale.y = 1 - tension * 0.45;
    }

    if (group.current) {
      const dist = Math.abs(state.camera.position.z - config.pos[2]);
      const near = 1 / (1 + dist * 0.16);
      const px = scrollState.pointerX;
      const py = scrollState.pointerY;

      group.current.position.x = damp(
        group.current.position.x,
        config.pos[0] - px * 2.6 * near + ripple * 0.22,
        3.4,
        d,
      );
      group.current.position.y = damp(
        group.current.position.y,
        config.pos[1] +
          Math.sin(t.current * 0.45 + seedF) * 0.09 +
          py * 1.7 * near +
          scrollState.rawVelocity * 0.004 * near -
          ripple * 0.18,
        3.4,
        d,
      );

      group.current.rotation.z =
        config.rot[2] +
        Math.sin(t.current * 0.5 + seedF) * 0.03 +
        scrollState.rawVelocity * 0.0016 * near +
        ripple * 0.05;
      group.current.rotation.y = damp(
        group.current.rotation.y,
        config.rot[1] - px * 0.34 * near,
        3,
        d,
      );
      group.current.rotation.x = damp(
        group.current.rotation.x,
        config.rot[0] + py * 0.24 * near,
        3,
        d,
      );

      const stretch = 1 + scrollState.velocity * 0.55 * near;
      const breathe = 1 + Math.sin(t.current * 1.1 + seedF) * 0.008;
      const pull = h * 0.06 + Math.abs(ripple) * 0.1;
      group.current.scale.set(
        breathe * (1 + scrollState.velocity * 0.12 * near) * (1 + pull * 0.6),
        breathe * stretch * (1 + pull),
        breathe,
      );
    }
  });

  return (
    <group ref={group} position={config.pos} rotation={config.rot}>
      {/* the web mesh with 48x48 vertex resolution for local physical silk deformation */}
      <mesh ref={webMesh} material={silkMaterial}>
        <planeGeometry args={[size, size, 48, 48]} />
      </mesh>

      {/* faint colour bloom behind the silk */}
      <mesh position={[0, 0, -0.35]}>
        <planeGeometry args={[size * 1.5, size * 1.4]} />
        <shaderMaterial
          vertexShader={screenVertex}
          fragmentShader={glowFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={glowUniforms}
        />
      </mesh>

      {/* information card stuck in the silk */}
      {cardTex ? (
        <mesh position={[0, 0, 0.12]} rotation={[0, 0, -0.04]}>
          <planeGeometry args={[size * 0.62, size * 0.465]} />
          <meshBasicMaterial map={cardTex} transparent depthWrite={false} />
        </mesh>
      ) : null}

      {config.spider ? (
        <>
          {config.hero && (
            <pointLight
              position={[0, 0, 1.2]}
              intensity={28}
              color="#ff4422"
              distance={8}
              decay={2}
            />
          )}
          <Spider
            origin={spiderOrigin}
            seed={config.seed}
            webSize={size}
            scale={config.scale * (config.hero ? 2.5 : 1.8)}
            speed={0.45 + (config.seed % 4) * 0.05}
            phase={(config.seed % 7) / 7}
            hero={config.hero}
            crawlPoint={crawlPoint}
            webOffset={webSpringOffset}
          />
        </>
      ) : null}
    </group>
  );
}

/** Huge soft red light that lives "outside" the scene and breathes with scroll. */
function EmberLight() {
  const mesh = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#c0331f") },
      uStrength: { value: 0.35 },
    }),
    [],
  );

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    t.current += d;
    uniforms.uStrength.value = damp(
      uniforms.uStrength.value,
      0.35 + scrollState.progress * 0.7 + scrollState.velocity * 0.4,
      2.5,
      d,
    );
    if (mesh.current) {
      mesh.current.position.x = damp(
        mesh.current.position.x,
        Math.sin(t.current * 0.12) * 8 + scrollState.pointerX * 3,
        1.2,
        d,
      );
      mesh.current.position.y = damp(
        mesh.current.position.y,
        Math.cos(t.current * 0.09) * 4 - scrollState.pointerY * 2,
        1.2,
        d,
      );
      mesh.current.position.z = state.camera.position.z - 26;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -30]}>
      <planeGeometry args={[70, 50]} />
      <shaderMaterial
        vertexShader={screenVertex}
        fragmentShader={glowFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/** Scroll-linked dolly: one continuous camera shot through the whole document. */
function CameraRig() {
  const { camera } = useThree();
  const t = useRef(0);
  const shake = useRef(0);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    t.current += d;
    const p = Math.min(1, Math.max(0, scrollState.progress / (scrollState.dollyEnd || 1)));
    const eased = easeInOutPow(p, 1.7);

    const targetZ = 6.5 - eased * 56;
    const targetX =
      Math.sin(eased * Math.PI * 2.2) * 1.6 + scrollState.pointerX * 0.55;
    const targetY =
      Math.sin(eased * Math.PI * 1.4) * 0.7 - scrollState.pointerY * 0.35 + 0.2;

    camera.position.z = damp(camera.position.z, targetZ, 3.2, d);
    camera.position.x = damp(camera.position.x, targetX, 2.2, d);
    camera.position.y = damp(camera.position.y, targetY, 2.2, d);

    shake.current = damp(shake.current, scrollState.velocity, 5, d);

    const rotY =
      -scrollState.pointerX * 0.052 + Math.sin(eased * Math.PI * 1.8) * 0.09;
    const rotX = scrollState.pointerY * 0.036 + Math.sin(t.current * 0.2) * 0.006;
    const rotZ =
      Math.sin(eased * Math.PI * 3.0) * 0.02 + scrollState.rawVelocity * 0.0009;

    camera.rotation.y = damp(camera.rotation.y, rotY, 2.6, d);
    camera.rotation.x = damp(camera.rotation.x, rotX, 2.6, d);
    camera.rotation.z = damp(camera.rotation.z, rotZ, 2.0, d);

    const fov = 42 + shake.current * 5;
    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = damp(cam.fov, fov, 3, d);
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

/**
 * Sheets of long taut silk that ride with the camera at fixed depths, so the
 * whole frame is laced with strands rushing past — the parallax spine.
 */
function DepthVeils({ count = 5 }: { count?: number }) {
  const layers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        tex: makeStrandVeilTexture(71 + i * 13, 20 + i * 4),
        depth: 1.6 + i * 3.4,
        size: 9 + i * 9,
        opacity: 0.34 - i * 0.045,
        drift: 0.45 + i * 0.18,
        sign: i % 2 === 0 ? 1 : -1,
      })),
    [count],
  );
  const refs = useRef<(THREE.Group | null)[]>([]);
  const t = useRef(0);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    t.current += d;
    layers.forEach((l, i) => {
      const g = refs.current[i];
      if (!g) return;
      // strand sheets are anchored ahead of the lens, nearest ones swing most
      const near = 1 / (1 + l.depth * 0.14);
      g.position.z = state.camera.position.z - l.depth;
      g.position.x = damp(
        g.position.x,
        state.camera.position.x - scrollState.pointerX * 3.4 * near + Math.sin(t.current * 0.12 * l.drift) * l.sign * 1.4,
        2.6,
        d,
      );
      g.position.y = damp(
        g.position.y,
        state.camera.position.y +
          scrollState.pointerY * 2.2 * near +
          Math.cos(t.current * 0.1 * l.drift) * l.sign * 0.9,
        2.6,
        d,
      );
      g.rotation.z = l.sign * (0.2 + Math.sin(t.current * 0.07 + i) * 0.06) - scrollState.pointerX * 0.12 * near;
      g.scale.set(1 + scrollState.velocity * 0.08 * near, 1 + scrollState.velocity * 0.7 * near, 1);
    });
  });

  return (
    <>
      {layers.map((l, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }}>
          <mesh>
            <planeGeometry args={[l.size, l.size]} />
            <meshBasicMaterial
              map={l.tex}
              transparent
              depthWrite={false}
              depthTest={false}
              opacity={l.opacity}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Environment({ mobile }: { mobile: boolean }) {
  const layout = useMemo(
    () => (mobile ? LAYOUT.filter((c, i) => c.card !== undefined || i % 3 === 0) : LAYOUT),
    [mobile],
  );
  const fogFar = mobile ? 34 : 46;

  const strands = useMemo(
    () =>
      layout.slice(0, -1).map((c, i) => ({
        from: new THREE.Vector3(...c.pos),
        to: new THREE.Vector3(...layout[i + 1]!.pos),
        seed: c.seed,
      })),
    [layout],
  );

  return (
    <>
      <fog attach="fog" args={["#050505", 6, fogFar]} />
      <ambientLight intensity={0.52} />
      <pointLight position={[-6, 4, 4]} intensity={22} color="#ff442a" distance={45} decay={2} />
      <pointLight position={[7, -3, -12]} intensity={14} color="#6f9dff" distance={40} decay={2} />
      <EmberLight />
      {strands.map((s, i) => (
        <Strand key={i} from={s.from} to={s.to} seed={s.seed} />
      ))}
      {layout.map((c, i) => (
        <SpiderWeb key={i} config={c} />
      ))}
      <DepthVeils count={mobile ? 3 : 5} />
      <CameraRig />
    </>
  );
}

export default function BroadcastScene() {
  const mobile =
    typeof window !== "undefined" &&
    (window.innerWidth < 820 || window.matchMedia("(pointer: coarse)").matches);

  return (
    <Canvas
      dpr={mobile ? [1, 1.3] : [1, 1.75]}
      gl={{ antialias: !mobile, powerPreference: "high-performance", alpha: false }}
      camera={{ position: [0, 0.2, 6.5], fov: 42, near: 0.1, far: 120 }}
      onCreated={({ gl }) => {
        gl.setClearColor("#050505");
      }}
    >
      <Environment mobile={mobile} />
    </Canvas>
  );
}
