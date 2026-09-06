import * as THREE from "three";
import type { CardContent } from "./card-texture";
import { getWebTopology, rand } from "./web-topology";

/** small jittered polyline between two points — silk never travels perfectly straight */
function silk(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: () => number,
  jitter = 4,
  steps = 10,
) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  const nx = -(y1 - y0);
  const ny = x1 - x0;
  const len = Math.hypot(nx, ny) || 1;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const bow = Math.sin(t * Math.PI) * jitter * (r() - 0.5) * 2;
    ctx.lineTo(
      x0 + (x1 - x0) * t + (nx / len) * bow,
      y0 + (y1 - y0) * t + (ny / len) * bow,
    );
  }
  ctx.stroke();
}

/**
 * A photographic-feeling web: irregular polygonal frame, long taut anchor
 * lines that run off the edge of the frame, uneven sagging capture spiral,
 * torn sections and a few dew nodes. Cool blue-white, matching 3D topological graph.
 */
export function makeWebTexture(seed = 1, strands = 16, rings = 9): THREE.Texture {
  const S = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  const topology = getWebTopology(seed, strands, rings, 1.0);
  const r = rand(seed);

  const toCanvas = (p: THREE.Vector2): [number, number] => [
    (p.x + 0.5) * S,
    (0.5 - p.y) * S,
  ];

  ctx.clearRect(0, 0, S, S);
  ctx.lineCap = "round";

  const [cx, cy] = toCanvas(topology.hub);

  // long anchor threads shooting past the frame edge
  ctx.strokeStyle = "rgba(196,216,240,0.34)";
  for (const anchor of topology.anchorThreads) {
    const [, ] = toCanvas(anchor.p0);
    const [x1, y1] = toCanvas(anchor.p1);
    ctx.lineWidth = anchor.lineWidth;
    silk(ctx, cx, cy, x1, y1, r, 26, 8);
  }

  // radial spokes, thinner toward the rim
  for (const s of topology.spokes) {
    ctx.strokeStyle = `rgba(214,230,248,${0.34 + r() * 0.3})`;
    ctx.lineWidth = 1.1 + r() * 1.5;
    const endPos = new THREE.Vector2(
      topology.hub.x + Math.cos(s.angle) * s.len,
      topology.hub.y - Math.sin(s.angle) * s.len,
    );
    const [x1, y1] = toCanvas(endPos);
    silk(ctx, cx, cy, x1, y1, r, 6, 8);
  }

  // capture spiral: segment-by-segment, sagging, with gaps where silk is torn
  for (const seg of topology.spiralSegments) {
    const ringRatio = seg.ringIndex / rings;
    ctx.strokeStyle = `rgba(222,234,248,${0.4 - ringRatio * 0.2})`;
    ctx.lineWidth = 0.8 + r() * 0.9;
    const [x0, y0] = toCanvas(seg.p0);
    const [x1, y1] = toCanvas(seg.p1);
    const [cpx, cpy] = toCanvas(seg.cp);

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(cpx, cpy, x1, y1);
    ctx.stroke();
  }

  // stray broken threads drifting off
  ctx.strokeStyle = "rgba(210,226,244,0.2)";
  for (const stray of topology.strayThreads) {
    const [x0, y0] = toCanvas(stray.p0);
    const [x2, y2] = toCanvas(stray.p2);
    ctx.lineWidth = stray.lineWidth;
    silk(ctx, x0, y0, x2, y2, r, 18, 7);
  }

  // dew / caught light nodes
  for (const dew of topology.dewNodes) {
    const [x, y] = toCanvas(dew.pos);
    const rad = (dew.radius * 1024) || 2;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad * 3);
    g.addColorStop(0, "rgba(240,248,255,0.85)");
    g.addColorStop(1, "rgba(200,220,245,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** Sparse sheet of long taut strands crossing the frame — used for depth veils. */
export function makeStrandVeilTexture(seed = 1, count = 22): THREE.Texture {
  const S = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  const r = rand(seed);
  ctx.clearRect(0, 0, S, S);
  ctx.lineCap = "round";
  for (let i = 0; i < count; i++) {
    ctx.strokeStyle = `rgba(206,224,246,${0.1 + r() * 0.26})`;
    ctx.lineWidth = 0.7 + r() * 1.8;
    const edge = Math.floor(r() * 4);
    const p = r() * S;
    const q = r() * S;
    const a: [number, number] = edge % 2 === 0 ? [p, edge === 0 ? -20 : S + 20] : [edge === 1 ? -20 : S + 20, p];
    const b: [number, number] = edge % 2 === 0 ? [q, edge === 0 ? S + 20 : -20] : [edge === 1 ? S + 20 : -20, q];
    silk(ctx, a[0], a[1], b[0], b[1], r, 30, 9);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}


/**
 * An information card spun into the web: silk sheet, web strands showing
 * through, threads pinning each corner.
 */
export function makeWebCardTexture(card: CardContent, tint = "#e2242f"): THREE.Texture {
  const W = 1024;
  const H = 768;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const r = rand(card.title.length * 7 + card.lines.length);

  ctx.clearRect(0, 0, W, H);

  // silk sheet
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "rgba(12,14,20,0.9)");
  g.addColorStop(1, "rgba(6,7,10,0.82)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(46, 30);
  ctx.lineTo(W - 34, 52);
  ctx.lineTo(W - 52, H - 34);
  ctx.lineTo(34, H - 54);
  ctx.closePath();
  ctx.fill();

  // web strands across the sheet
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = "rgba(226,234,244,0.16)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 16; i++) {
    ctx.beginPath();
    ctx.moveTo(r() * W, 0);
    ctx.lineTo(r() * W, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, r() * H);
    ctx.quadraticCurveTo(W / 2, r() * H, W, r() * H);
    ctx.stroke();
  }
  ctx.restore();

  // pinning threads at corners
  ctx.strokeStyle = "rgba(240,246,255,0.55)";
  ctx.lineWidth = 3;
  const corners: [number, number][] = [
    [46, 30],
    [W - 34, 52],
    [W - 52, H - 34],
    [34, H - 54],
  ];
  for (const [x, y] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x < W / 2 ? x - 40 : x + 40, y < H / 2 ? y - 34 : y + 34);
    ctx.stroke();
  }

  ctx.strokeStyle = tint;
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(88, 262);
  ctx.lineTo(W - 100, 274);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.textBaseline = "top";

  ctx.fillStyle = tint;
  ctx.font = "600 34px 'Barlow Condensed', Arial, sans-serif";
  ctx.fillText(card.kicker.toUpperCase(), 90, 96);

  ctx.fillStyle = "#f6f4f0";
  ctx.font = "300 88px 'Oswald', Arial, sans-serif";
  ctx.fillText(card.title, 88, 146);

  ctx.font = "400 44px 'Barlow Condensed', Arial, sans-serif";
  card.lines.forEach((line, i) => {
    ctx.fillStyle = i % 2 === 0 ? "#eceae5" : "rgba(236,234,229,0.74)";
    ctx.fillText(line, 90, 320 + i * 62);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
