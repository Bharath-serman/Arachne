import * as THREE from "three";

export const rand = (seed: number) => {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

export type Spoke = {
  index: number;
  angle: number;
  len: number; // in 3D local units
};

export type WebNode = {
  spokeIndex: number;
  ringIndex: number; // 0 = hub, 1..rings
  radius: number;
  pos: THREE.Vector2; // 3D local position relative to web center
};

export type SpokeSegment = {
  type: "spoke";
  spokeIndex: number;
  fromRing: number;
  toRing: number;
  p0: THREE.Vector2;
  p1: THREE.Vector2;
  length: number;
};

export type SpiralSegment = {
  type: "spiral";
  ringIndex: number;
  fromSpoke: number;
  toSpoke: number;
  p0: THREE.Vector2;
  p1: THREE.Vector2;
  cp: THREE.Vector2; // Quadratic bezier control point for sagging catenary curve
  length: number;
};

export type WebSegment = SpokeSegment | SpiralSegment;

export type AnchorThread = {
  angle: number;
  lineWidth: number;
  p0: THREE.Vector2;
  p1: THREE.Vector2;
};

export type StrayThread = {
  lineWidth: number;
  p0: THREE.Vector2;
  p1: THREE.Vector2;
  p2: THREE.Vector2;
};

export type DewNode = {
  pos: THREE.Vector2;
  radius: number;
};

export interface WebTopology {
  seed: number;
  strands: number;
  rings: number;
  size: number;
  hub: THREE.Vector2; // 3D local position of web hub
  hubNormalized: [number, number]; // [-0.5..0.5] range
  maxRadius: number;
  spokes: Spoke[];
  nodes: Map<string, WebNode>; // key: `${spokeIndex}_${ringIndex}`
  spokeSegments: SpokeSegment[];
  spiralSegments: SpiralSegment[];
  anchorThreads: AnchorThread[];
  strayThreads: StrayThread[];
  dewNodes: DewNode[];
}

const topologyCache = new Map<string, WebTopology>();

/**
 * Builds deterministic topological spider web data for a given seed, strand count, and ring count.
 */
export function getWebTopology(
  seed = 1,
  strands = 16,
  rings = 9,
  size = 3.4,
): WebTopology {
  const cacheKey = `${seed}_${strands}_${rings}_${size.toFixed(3)}`;
  const cached = topologyCache.get(cacheKey);
  if (cached) return cached;

  const r = rand(seed);
  // Normalized hub center (0..1 range)
  const normCx = 0.4 + r() * 0.2;
  const normCy = 0.4 + r() * 0.2;
  const normR = 0.4 + r() * 0.1;

  // 3D local coordinates (where center of plane is (0,0), spans [-size/2, size/2])
  // In canvas texture: x=0 is left (-size/2), x=S is right (+size/2).
  // y=0 is top (+size/2 in 3D), y=S is bottom (-size/2 in 3D).
  const hubX = (normCx - 0.5) * size;
  const hubY = (0.5 - normCy) * size;
  const hub = new THREE.Vector2(hubX, hubY);
  const maxRadius = normR * size;

  const spokes: Spoke[] = [];
  for (let i = 0; i < strands; i++) {
    spokes.push({
      index: i,
      angle: (i / strands) * Math.PI * 2 + (r() - 0.5) * 0.36,
      len: maxRadius * (0.62 + r() * 0.55),
    });
  }

  // Anchor threads shooting out past frame
  const anchorThreads: AnchorThread[] = [];
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2;
    anchorThreads.push({
      angle: a,
      lineWidth: 1.2 + r() * 1.6,
      p0: hub.clone(),
      p1: new THREE.Vector2(
        hub.x + Math.cos(a) * size * 1.4,
        hub.y - Math.sin(a) * size * 1.4, // -sin because canvas y is down, 3D y is up
      ),
    });
  }

  // Generate nodes at spoke/ring intersections
  const nodes = new Map<string, WebNode>();

  // Hub node
  nodes.set(`hub`, {
    spokeIndex: -1,
    ringIndex: 0,
    radius: 0,
    pos: hub.clone(),
  });

  for (let i = 0; i < strands; i++) {
    nodes.set(`${i}_0`, {
      spokeIndex: i,
      ringIndex: 0,
      radius: 0,
      pos: hub.clone(),
    });
  }

  const ringRadii: number[][] = []; // [ring][spoke]
  for (let ring = 1; ring <= rings; ring++) {
    const base = Math.pow(ring / rings, 1.12);
    ringRadii[ring] = [];
    for (let i = 0; i < strands; i++) {
      const spoke = spokes[i]!;
      const rr = Math.min(spoke.len, base * maxRadius * (0.94 + r() * 0.12));
      ringRadii[ring]![i] = rr;

      const posX = hub.x + Math.cos(spoke.angle) * rr;
      const posY = hub.y - Math.sin(spoke.angle) * rr; // canvas y is down, 3D y is up
      nodes.set(`${i}_${ring}`, {
        spokeIndex: i,
        ringIndex: ring,
        radius: rr,
        pos: new THREE.Vector2(posX, posY),
      });
    }
  }

  // Radial spoke segments
  const spokeSegments: SpokeSegment[] = [];
  for (let i = 0; i < strands; i++) {
    for (let ring = 0; ring < rings; ring++) {
      const n0 = nodes.get(`${i}_${ring}`)!;
      const n1 = nodes.get(`${i}_${ring + 1}`)!;
      if (n0 && n1) {
        spokeSegments.push({
          type: "spoke",
          spokeIndex: i,
          fromRing: ring,
          toRing: ring + 1,
          p0: n0.pos.clone(),
          p1: n1.pos.clone(),
          length: n0.pos.distanceTo(n1.pos),
        });
      }
    }
  }

  // Capture spiral sagging segments
  const spiralSegments: SpiralSegment[] = [];
  for (let ring = 1; ring <= rings; ring++) {
    for (let i = 0; i < strands; i++) {
      const nextSpoke = (i + 1) % strands;
      const isTorn = r() < 0.09; // Torn gap in silk
      if (isTorn) continue;

      const n0 = nodes.get(`${i}_${ring}`)!;
      const n1 = nodes.get(`${nextSpoke}_${ring}`)!;
      const s0 = spokes[i]!;
      const s1 = spokes[nextSpoke]!;
      const rr0 = ringRadii[ring]![i]!;
      const rr1 = ringRadii[ring]![nextSpoke]!;

      let a1 = s1.angle;
      if (a1 < s0.angle) a1 += Math.PI * 2;
      const am = (s0.angle + a1) / 2;
      const sag = ((rr0 + rr1) / 2) * (0.84 - r() * 0.07);

      const cpX = hub.x + Math.cos(am) * sag;
      const cpY = hub.y - Math.sin(am) * sag;
      const cp = new THREE.Vector2(cpX, cpY);

      // Approximate bezier length
      const d0 = n0.pos.distanceTo(cp);
      const d1 = cp.distanceTo(n1.pos);
      const length = (d0 + d1 + n0.pos.distanceTo(n1.pos)) * 0.5;

      spiralSegments.push({
        type: "spiral",
        ringIndex: ring,
        fromSpoke: i,
        toSpoke: nextSpoke,
        p0: n0.pos.clone(),
        p1: n1.pos.clone(),
        cp,
        length,
      });
    }
  }

  // Stray broken threads
  const strayThreads: StrayThread[] = [];
  for (let i = 0; i < 10; i++) {
    const a = r() * Math.PI * 2;
    const r0 = maxRadius * (0.3 + r() * 0.5);
    const r1 = maxRadius * (1.15 + r() * 0.5);
    const a1 = a + (r() - 0.5) * 0.7;
    strayThreads.push({
      lineWidth: 0.8 + r(),
      p0: new THREE.Vector2(hub.x + Math.cos(a) * r0, hub.y - Math.sin(a) * r0),
      p1: new THREE.Vector2(
        hub.x + Math.cos((a + a1) * 0.5) * (r0 + r1) * 0.5,
        hub.y - Math.sin((a + a1) * 0.5) * (r0 + r1) * 0.5,
      ),
      p2: new THREE.Vector2(hub.x + Math.cos(a1) * r1, hub.y - Math.sin(a1) * r1),
    });
  }

  // Dew light nodes
  const dewNodes: DewNode[] = [];
  for (let i = 0; i < 26; i++) {
    const s = spokes[Math.floor(r() * spokes.length)]!;
    const rr = s.len * r();
    dewNodes.push({
      pos: new THREE.Vector2(hub.x + Math.cos(s.angle) * rr, hub.y - Math.sin(s.angle) * rr),
      radius: (1 + r() * 2.6) * (size / 1024),
    });
  }

  const result: WebTopology = {
    seed,
    strands,
    rings,
    size,
    hub,
    hubNormalized: [normCx - 0.5, 0.5 - normCy],
    maxRadius,
    spokes,
    nodes,
    spokeSegments,
    spiralSegments,
    anchorThreads,
    strayThreads,
    dewNodes,
  };

  topologyCache.set(cacheKey, result);
  return result;
}

/**
 * Evaluates the position and tangent heading along any web segment for parameter t in [0, 1].
 */
export function evaluateWebSegment(
  segment: WebSegment,
  t: number,
  forward: boolean,
  outPos: THREE.Vector2,
  outTangent: THREE.Vector2,
) {
  const param = THREE.MathUtils.clamp(forward ? t : 1 - t, 0, 1);

  if (segment.type === "spoke") {
    outPos.lerpVectors(segment.p0, segment.p1, param);
    if (forward) {
      outTangent.subVectors(segment.p1, segment.p0).normalize();
    } else {
      outTangent.subVectors(segment.p0, segment.p1).normalize();
    }
  } else {
    // Quadratic Bezier: P(t) = (1-t)^2 P0 + 2(1-t)t CP + t^2 P1
    const p0 = segment.p0;
    const cp = segment.cp;
    const p1 = segment.p1;
    const u = 1 - param;
    const tt = param * param;
    const uu = u * u;
    const tu2 = 2 * u * param;

    outPos.set(
      uu * p0.x + tu2 * cp.x + tt * p1.x,
      uu * p0.y + tu2 * cp.y + tt * p1.y,
    );

    // Tangent: P'(t) = 2(1-t)(CP - P0) + 2t(P1 - CP)
    const tx = 2 * u * (cp.x - p0.x) + 2 * param * (p1.x - cp.x);
    const ty = 2 * u * (cp.y - p0.y) + 2 * param * (p1.y - cp.y);
    outTangent.set(tx, ty).normalize();
    if (!forward) {
      outTangent.negate();
    }
  }
}

