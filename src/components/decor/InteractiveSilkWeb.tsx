import { useEffect, useRef } from "react";

interface InteractiveSilkWebProps {
  activeField?: "name" | "email" | "subject" | "message" | null;
  density?: number; // 0..100
  className?: string;
}

interface WebNode {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  spoke: number;
  ring: number;
  glow: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
}

export function InteractiveSilkWeb({
  activeField,
  density = 0,
  className = "",
}: InteractiveSilkWebProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    nodes: WebNode[];
    spokes: { angle: number; len: number }[];
    ripples: Ripple[];
    pointer: { x: number; y: number; active: boolean; px: number; py: number };
    hub: { x: number; y: number; baseX: number; baseY: number; vx: number; vy: number };
    microSpider: { x: number; y: number; tx: number; ty: number; angle: number };
    width: number;
    height: number;
  }>({
    nodes: [],
    spokes: [],
    ripples: [],
    pointer: { x: -1000, y: -1000, active: false, px: -1000, py: -1000 },
    hub: { x: 0, y: 0, baseX: 0, baseY: 0, vx: 0, vy: 0 },
    microSpider: { x: 0, y: 0, tx: 0, ty: 0, angle: 0 },
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const STRANDS = 16;
    const RINGS = 8;

    const buildWeb = (w: number, h: number) => {
      const state = stateRef.current;
      state.width = w;
      state.height = h;

      const cx = w * 0.5;
      const cy = h * 0.44;
      state.hub = { x: cx, y: cy, baseX: cx, baseY: cy, vx: 0, vy: 0 };
      state.microSpider.x = cx;
      state.microSpider.y = cy;
      state.microSpider.tx = cx;
      state.microSpider.ty = cy;

      const maxR = Math.min(w, h) * 0.58;

      const spokes: { angle: number; len: number }[] = [];
      for (let i = 0; i < STRANDS; i++) {
        // Natural slight spoke variance
        const angleOffset = Math.sin(i * 2.3) * 0.08;
        const angle = (i / STRANDS) * Math.PI * 2 + angleOffset;
        const len = maxR * (0.85 + Math.cos(i * 1.7) * 0.18);
        spokes.push({ angle, len });
      }
      state.spokes = spokes;

      const nodes: WebNode[] = [];
      for (let ring = 1; ring <= RINGS; ring++) {
        const ringDist = Math.pow(ring / RINGS, 1.15) * maxR;
        for (let i = 0; i < STRANDS; i++) {
          const spoke = spokes[i]!;
          const r = Math.min(spoke.len, ringDist * (0.95 + Math.sin(i * 3 + ring) * 0.05));
          const nx = cx + Math.cos(spoke.angle) * r;
          const ny = cy + Math.sin(spoke.angle) * r;
          nodes.push({
            x: nx,
            y: ny,
            baseX: nx,
            baseY: ny,
            vx: 0,
            vy: 0,
            spoke: i,
            ring,
            glow: 0,
          });
        }
      }
      state.nodes = nodes;
    };

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      buildWeb(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const ptr = stateRef.current.pointer;
      ptr.px = ptr.x;
      ptr.py = ptr.y;
      ptr.x = x;
      ptr.y = y;
      ptr.active = true;
    };

    const onPointerLeave = () => {
      stateRef.current.pointer.active = false;
      stateRef.current.pointer.x = -1000;
      stateRef.current.pointer.y = -1000;
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      stateRef.current.ripples.push({
        x,
        y,
        radius: 0,
        maxRadius: Math.max(stateRef.current.width, stateRef.current.height) * 0.9,
        strength: 1.0,
      });
    };

    const container = canvas.parentElement;
    if (container) {
      container.addEventListener("mousemove", onPointerMove);
      container.addEventListener("mouseleave", onPointerLeave);
      container.addEventListener("click", onClick);
    }

    // Animation Render Loop
    let lastTime = performance.now();
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const { nodes, spokes, ripples, pointer, hub, width, height } = stateRef.current;
      if (width === 0 || height === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Update Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]!;
        r.radius += dt * 320;
        r.strength *= Math.pow(0.96, dt * 60);
        if (r.radius > r.maxRadius || r.strength < 0.01) {
          ripples.splice(i, 1);
        }
      }

      // 2. Hub Spring Physics
      if (pointer.active) {
        const hdx = pointer.x - hub.baseX;
        const hdy = pointer.y - hub.baseY;
        const hdist = Math.hypot(hdx, hdy);
        if (hdist < 180 && hdist > 1) {
          const force = ((180 - hdist) / 180) * 16;
          hub.vx += (hdx / hdist) * force * dt * 25;
          hub.vy += (hdy / hdist) * force * dt * 25;
        }
      }
      hub.vx += (hub.baseX - hub.x) * 8.0 * dt;
      hub.vy += (hub.baseY - hub.y) * 8.0 * dt;
      hub.vx *= Math.pow(0.88, dt * 60);
      hub.vy *= Math.pow(0.88, dt * 60);
      hub.x += hub.vx * dt * 60;
      hub.y += hub.vy * dt * 60;

      // 3. Node Spring & Interactive Physics
      const pvelX = pointer.x - pointer.px;
      const pvelY = pointer.y - pointer.py;
      const pSpeed = Math.hypot(pvelX, pvelY);

      nodes.forEach((node) => {
        // Pointer influence (elastic silk deflection)
        if (pointer.active) {
          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const dist = Math.hypot(dx, dy);
          const reach = 90;
          if (dist < reach && dist > 0.1) {
            const pull = Math.pow(1 - dist / reach, 2);
            // Push gently away from cursor path
            const pushX = (dx / dist) * pull * (pSpeed > 1 ? 14 : 6);
            const pushY = (dy / dist) * pull * (pSpeed > 1 ? 14 : 6);
            node.vx += pushX * dt * 25;
            node.vy += pushY * dt * 25;
            node.glow = Math.min(1, node.glow + pull * 0.4);
          }
        }

        // Ripple influence
        ripples.forEach((r) => {
          const rdx = node.x - r.x;
          const rdy = node.y - r.y;
          const rdist = Math.hypot(rdx, rdy);
          const diff = Math.abs(rdist - r.radius);
          if (diff < 40) {
            const wave = Math.sin((diff / 40) * Math.PI) * r.strength;
            node.vx += (rdx / (rdist || 1)) * wave * 18 * dt * 30;
            node.vy += (rdy / (rdist || 1)) * wave * 18 * dt * 30;
            node.glow = Math.min(1, node.glow + wave * 0.6);
          }
        });

        // Spring back to base position
        const k = 10.0;
        const damp = 0.86;
        node.vx += (node.baseX - node.x) * k * dt;
        node.vy += (node.baseY - node.y) * k * dt;
        node.vx *= Math.pow(damp, dt * 60);
        node.vy *= Math.pow(damp, dt * 60);
        node.x += node.vx * dt * 60;
        node.y += node.vy * dt * 60;

        // Glow decay
        node.glow = Math.max(0, node.glow - dt * 1.5);
      });

      // 4. Determine Active Field Bias (Quadrant / Spoke Focus)
      let activeSpokeTarget = -1;
      if (activeField === "name") activeSpokeTarget = 14; // Top-left
      else if (activeField === "email") activeSpokeTarget = 2; // Top-right
      else if (activeField === "subject") activeSpokeTarget = 10; // Mid-left
      else if (activeField === "message") activeSpokeTarget = 6; // Bottom

      // 5. Draw Long Anchor Corner Threads (Taut Silver/Grey Lines)
      ctx.save();
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";

      const corners = [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: 0, height },
        { x: width, y: height },
        { x: width * 0.5, y: 0 },
        { x: width * 0.5, y: height },
        { x: 0, y: height * 0.5 },
        { x: width, y: height * 0.5 },
      ];

      corners.forEach((c) => {
        const grad = ctx.createLinearGradient(c.x, c.y, hub.x, hub.y);
        grad.addColorStop(0, "rgba(180, 195, 210, 0.45)");
        grad.addColorStop(0.5, "rgba(230, 240, 250, 0.28)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0.55)");
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(hub.x, hub.y);
        ctx.stroke();
      });

      // 6. Draw Radial Spokes
      for (let i = 0; i < STRANDS; i++) {
        const spokeNodes = nodes.filter((n) => n.spoke === i).sort((a, b) => a.ring - b.ring);
        const isActiveSpoke = i === activeSpokeTarget;

        ctx.beginPath();
        ctx.moveTo(hub.x, hub.y);

        spokeNodes.forEach((n) => {
          ctx.lineTo(n.x, n.y);
        });

        // Continue spoke to outer edge
        const spoke = spokes[i]!;
        const outerX = hub.x + Math.cos(spoke.angle) * spoke.len;
        const outerY = hub.y + Math.sin(spoke.angle) * spoke.len;
        ctx.lineTo(outerX, outerY);

        if (isActiveSpoke) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
          ctx.lineWidth = 1.8;
          ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = `rgba(215, 225, 235, ${0.25 + (density / 100) * 0.2})`;
          ctx.lineWidth = 1.0;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 7. Draw Concentric Sagging Spiral Rings
      for (let ring = 1; ring <= RINGS; ring++) {
        const ringNodes = nodes.filter((n) => n.ring === ring).sort((a, b) => a.spoke - b.spoke);
        const ringRatio = ring / RINGS;

        for (let i = 0; i < ringNodes.length; i++) {
          const n0 = ringNodes[i]!;
          const n1 = ringNodes[(i + 1) % ringNodes.length]!;

          // Sagging midpoint
          const midX = (n0.x + n1.x) * 0.5;
          const midY = (n0.y + n1.y) * 0.5;
          const sagRatio = 0.86 + Math.sin(ring * 1.5 + i) * 0.04;
          const cpX = hub.x + (midX - hub.x) * sagRatio;
          const cpY = hub.y + (midY - hub.y) * sagRatio;

          const activeGlow = Math.max(n0.glow, n1.glow);
          const isQuadrantActive =
            activeSpokeTarget >= 0 &&
            (n0.spoke === activeSpokeTarget || n1.spoke === activeSpokeTarget);

          ctx.beginPath();
          ctx.moveTo(n0.x, n0.y);
          ctx.quadraticCurveTo(cpX, cpY, n1.x, n1.y);

          if (isQuadrantActive || activeGlow > 0.2) {
            const glowAlpha = Math.min(1.0, 0.45 + activeGlow * 0.55);
            ctx.strokeStyle = `rgba(255, 255, 255, ${glowAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = "rgba(240, 248, 255, 0.75)";
            ctx.shadowBlur = 6;
          } else {
            const baseAlpha = (0.28 - ringRatio * 0.12) * (1 + (density / 100) * 0.4);
            ctx.strokeStyle = `rgba(195, 210, 225, ${Math.max(0.1, baseAlpha)})`;
            ctx.lineWidth = 0.85;
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // 8. Draw Junction Nodes & Dew Drops (White & Silver Glow)
      nodes.forEach((n) => {
        const radius = 1.5 + n.glow * 2.5;
        const radGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius * 3.5);
        radGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        radGrad.addColorStop(0.4, `rgba(220, 235, 245, ${0.6 + n.glow * 0.4})`);
        radGrad.addColorStop(1, "rgba(180, 200, 220, 0)");

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // 9. Draw Central Silk Hub
      const hubGrad = ctx.createRadialGradient(hub.x, hub.y, 0, hub.x, hub.y, 18);
      hubGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      hubGrad.addColorStop(0.3, "rgba(215, 230, 245, 0.5)");
      hubGrad.addColorStop(1, "rgba(160, 180, 200, 0)");
      ctx.fillStyle = hubGrad;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Outer hub ring
      ctx.strokeStyle = "rgba(240, 248, 255, 0.6)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 10. Interactive Micro Geometric Silk Spider / Signal Pulse
      const mSpider = stateRef.current.microSpider;
      if (pointer.active) {
        mSpider.tx = pointer.x;
        mSpider.ty = pointer.y;
      } else if (activeSpokeTarget >= 0) {
        const targetNode = nodes.find((n) => n.spoke === activeSpokeTarget && n.ring === 3);
        if (targetNode) {
          mSpider.tx = targetNode.x;
          mSpider.ty = targetNode.y;
        }
      } else {
        // Idle gentle wander around hub
        const wanderAngle = time * 0.0012;
        mSpider.tx = hub.x + Math.cos(wanderAngle) * 55;
        mSpider.ty = hub.y + Math.sin(wanderAngle) * 45;
      }

      const mdx = mSpider.tx - mSpider.x;
      const mdy = mSpider.ty - mSpider.y;
      const mdist = Math.hypot(mdx, mdy);
      if (mdist > 1) {
        mSpider.x += (mdx / mdist) * Math.min(mdist, dt * 140);
        mSpider.y += (mdy / mdist) * Math.min(mdist, dt * 140);
        const targetAngle = Math.atan2(mdy, mdx);
        let aDiff = targetAngle - mSpider.angle;
        while (aDiff < -Math.PI) aDiff += Math.PI * 2;
        while (aDiff > Math.PI) aDiff -= Math.PI * 2;
        mSpider.angle += aDiff * Math.min(1, dt * 10);
      }

      // Draw Micro Spider (Geometric White/Grey)
      ctx.save();
      ctx.translate(mSpider.x, mSpider.y);
      ctx.rotate(mSpider.angle);

      // Body glow
      const spGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
      spGlow.addColorStop(0, "rgba(255, 255, 255, 0.85)");
      spGlow.addColorStop(0.5, "rgba(200, 220, 240, 0.35)");
      spGlow.addColorStop(1, "rgba(200, 220, 240, 0)");
      ctx.fillStyle = spGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // Spider cephalothorax + abdomen
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(2, 0, 3.5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.ellipse(-3.5, 0, 4.5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // 8 micro legs
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 0.9;
      const legCycle = time * 0.015 * (mdist > 2 ? 1 : 0.2);
      const legAngles = [0.4, 0.8, -0.4, -0.8];
      [-1, 1].forEach((side) => {
        legAngles.forEach((la, idx) => {
          const lWave = Math.sin(legCycle + idx * 1.5) * 2.2;
          ctx.beginPath();
          ctx.moveTo(0, side * 2);
          const kneeX = Math.cos(la) * 5;
          const kneeY = side * (5 + lWave);
          const tipX = Math.cos(la) * 9;
          const tipY = side * (9 - lWave * 0.5);
          ctx.lineTo(kneeX, kneeY);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();
        });
      });

      ctx.restore();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("mousemove", onPointerMove);
        container.removeEventListener("mouseleave", onPointerLeave);
        container.removeEventListener("click", onClick);
      }
    };
  }, [activeField, density]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-auto absolute inset-0 h-full w-full ${className}`}
      style={{ touchAction: "none" }}
      aria-hidden="true"
    />
  );
}

