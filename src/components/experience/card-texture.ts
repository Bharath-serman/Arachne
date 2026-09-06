import * as THREE from "three";

export type CardContent = {
  kicker: string;
  title: string;
  lines: string[];
};

/**
 * Draws a broadcast-style information card to a canvas and returns it as a
 * texture, so the CRTs in the 3D scene can transmit real content.
 */
export function makeCardTexture(card: CardContent, tint = "#9de8d8"): THREE.Texture {
  const W = 1024;
  const H = 768;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#070806";
  ctx.fillRect(0, 0, W, H);

  // faint grid
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // frame
  ctx.strokeStyle = tint;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 6;
  ctx.strokeRect(44, 44, W - 88, H - 88);
  ctx.globalAlpha = 1;

  ctx.textBaseline = "top";

  // kicker
  ctx.fillStyle = tint;
  ctx.font = "600 34px 'Barlow Condensed', Arial, sans-serif";
  ctx.fillText(card.kicker.toUpperCase(), 90, 96);

  // rec dot
  ctx.fillStyle = "#e0564a";
  ctx.beginPath();
  ctx.arc(W - 112, 112, 13, 0, Math.PI * 2);
  ctx.fill();

  // title
  ctx.fillStyle = "#f4f2ee";
  ctx.font = "300 88px 'Oswald', Arial, sans-serif";
  ctx.fillText(card.title, 88, 152);

  // rule
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(90, 274);
  ctx.lineTo(W - 90, 274);
  ctx.stroke();

  // body
  ctx.font = "400 44px 'Barlow Condensed', Arial, sans-serif";
  card.lines.forEach((line, i) => {
    ctx.fillStyle = i % 2 === 0 ? "#e8e6e1" : "rgba(232,230,225,0.72)";
    ctx.fillText(line, 90, 322 + i * 62);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
