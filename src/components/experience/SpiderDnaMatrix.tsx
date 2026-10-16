// import { useMemo, useRef, useEffect } from "react";
// import * as THREE from "three";
// import { useFrame } from "@react-three/fiber";
// import { scrollState, damp, clamp } from "@/lib/scroll-state";

// // Arachnid silk protein (Spidroin) genetic base pairs
// const NUCLEOTIDES = [
//   { name: "Adenine (A)", code: "A-T", color: "#ff2a3b", glow: "#ff5e6c", label: "MaSp1.Gly" },
//   { name: "Thymine (T)", code: "T-A", color: "#00f0ff", glow: "#70f5ff", label: "MaSp1.Ala" },
//   { name: "Guanine (G)", code: "G-C", color: "#ffb703", glow: "#ffd166", label: "Flag.Pro" },
//   { name: "Cytosine (C)", code: "C-G", color: "#a044ff", glow: "#c77dff", label: "TuSp1.Ser" },
//   { name: "Silk Peptide (S)", code: "S-X", color: "#05ffa1", glow: "#64ffda", label: "Pyr.Gly" },
// ];

// const NUM_RUNGS = 36;
// const HELIX_HEIGHT = 8.8;
// const HELIX_RADIUS = 1.35;
// const TURNS = 2.6;

// export function SpiderDnaMatrix() {
//   const group = useRef<THREE.Group>(null);
//   const strand1Ref = useRef<THREE.Mesh>(null);
//   const strand2Ref = useRef<THREE.Mesh>(null);
//   const rungsRef = useRef<THREE.InstancedMesh>(null);
//   const nodesRef = useRef<THREE.InstancedMesh>(null);
//   const particlesRef = useRef<THREE.Points>(null);
//   const silkTendrilsRef = useRef<THREE.LineSegments>(null);

//   const time = useRef(0);
//   const pulseWave = useRef({ time: 0, active: false });
//   const localSpring = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

//   // Generate Base Pair data
//   const basePairs = useMemo(() => {
//     return Array.from({ length: NUM_RUNGS }, (_, i) => {
//       const frac = i / (NUM_RUNGS - 1);
//       const angle = frac * Math.PI * 2 * TURNS;
//       const y = (frac - 0.5) * HELIX_HEIGHT;
//       const nuc = NUCLEOTIDES[i % NUCLEOTIDES.length]!;
//       return {
//         index: i,
//         frac,
//         angle,
//         y,
//         nuc,
//       };
//     });
//   }, []);

//   // Compute Backbone Curves & Tube Geometries
//   const { curve1, curve2 } = useMemo(() => {
//     const pts1: THREE.Vector3[] = [];
//     const pts2: THREE.Vector3[] = [];
//     const steps = 140;

//     for (let i = 0; i <= steps; i++) {
//       const frac = i / steps;
//       const angle = frac * Math.PI * 2 * TURNS;
//       const y = (frac - 0.5) * HELIX_HEIGHT;
//       const x1 = Math.cos(angle) * HELIX_RADIUS;
//       const z1 = Math.sin(angle) * HELIX_RADIUS;
//       const x2 = Math.cos(angle + Math.PI) * HELIX_RADIUS;
//       const z2 = Math.sin(angle + Math.PI) * HELIX_RADIUS;

//       pts1.push(new THREE.Vector3(x1, y, z1));
//       pts2.push(new THREE.Vector3(x2, y, z2));
//     }

//     const c1 = new THREE.CatmullRomCurve3(pts1);
//     const c2 = new THREE.CatmullRomCurve3(pts2);
//     return { curve1: c1, curve2: c2 };
//   }, []);

//   const tubeGeo1 = useMemo(() => new THREE.TubeGeometry(curve1, 90, 0.05, 8, false), [curve1]);
//   const tubeGeo2 = useMemo(() => new THREE.TubeGeometry(curve2, 90, 0.05, 8, false), [curve2]);

//   // Silk particles cloud orbiting the DNA
//   const { particleGeo, particleCount } = useMemo(() => {
//     const count = 180;
//     const pos = new Float32Array(count * 3);
//     const col = new Float32Array(count * 3);
//     const sizes = new Float32Array(count);
//     const phases = new Float32Array(count);

//     const cCrimson = new THREE.Color("#ff3355");
//     const cCyan = new THREE.Color("#00f0ff");
//     const cGold = new THREE.Color("#ffd166");

//     for (let i = 0; i < count; i++) {
//       const frac = Math.random();
//       const angle = frac * Math.PI * 2 * TURNS + (Math.random() - 0.5) * 1.5;
//       const rad = HELIX_RADIUS * (0.8 + Math.random() * 1.4);
//       const y = (frac - 0.5) * (HELIX_HEIGHT * 1.15) + (Math.random() - 0.5) * 0.8;

//       pos[i * 3] = Math.cos(angle) * rad;
//       pos[i * 3 + 1] = y;
//       pos[i * 3 + 2] = Math.sin(angle) * rad;

//       const pick = Math.random();
//       const chosen = pick < 0.4 ? cCrimson : pick < 0.75 ? cCyan : cGold;
//       col[i * 3] = chosen.r;
//       col[i * 3 + 1] = chosen.g;
//       col[i * 3 + 2] = chosen.b;

//       sizes[i] = 1.2 + Math.random() * 2.5;
//       phases[i] = Math.random() * Math.PI * 2;
//     }

//     const geo = new THREE.BufferGeometry();
//     geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
//     geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
//     geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
//     geo.setAttribute("phase", new THREE.BufferAttribute(phases, 1));
//     return { particleGeo: geo, particleCount: count };
//   }, []);

//   // Web Tendrils bridging from the DNA helix out into the environment
//   const tendrilsGeo = useMemo(() => {
//     const lines: THREE.Vector3[] = [];
//     const numTendrils = 22;

//     for (let i = 0; i < numTendrils; i++) {
//       const frac = (i + 0.5) / numTendrils;
//       const angle = frac * Math.PI * 2 * TURNS;
//       const y = (frac - 0.5) * HELIX_HEIGHT;
//       const isStrand1 = i % 2 === 0;
//       const rootAngle = isStrand1 ? angle : angle + Math.PI;

//       const start = new THREE.Vector3(
//         Math.cos(rootAngle) * HELIX_RADIUS,
//         y,
//         Math.sin(rootAngle) * HELIX_RADIUS,
//       );

//       const outDist = 3.5 + (i % 5) * 1.2;
//       const outAngle = rootAngle + (i % 3 - 1) * 0.6;
//       const end = new THREE.Vector3(
//         Math.cos(outAngle) * outDist,
//         y + ((i % 4) - 2) * 1.1,
//         Math.sin(outAngle) * outDist - 1.5,
//       );

//       lines.push(start, end);
//     }

//     const geo = new THREE.BufferGeometry().setFromPoints(lines);
//     return geo;
//   }, []);

//   // Instance Matrices setup for Rungs (Bridges) and Base Nodes (Spheres)
//   const dummy = useMemo(() => new THREE.Object3D(), []);
//   const dummyNode = useMemo(() => new THREE.Object3D(), []);

//   useEffect(() => {
//     if (!rungsRef.current || !nodesRef.current) return;

//     basePairs.forEach((bp, i) => {
//       const angle = bp.angle;
//       const y = bp.y;
//       const p1 = new THREE.Vector3(Math.cos(angle) * HELIX_RADIUS, y, Math.sin(angle) * HELIX_RADIUS);
//       const p2 = new THREE.Vector3(Math.cos(angle + Math.PI) * HELIX_RADIUS, y, Math.sin(angle + Math.PI) * HELIX_RADIUS);

//       const mid = p1.clone().add(p2).multiplyScalar(0.5);
//       const diff = p2.clone().sub(p1);
//       const len = diff.length();

//       // Rung cylinder
//       dummy.position.copy(mid);
//       dummy.scale.set(0.032, len * 0.94, 0.032);
//       dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), diff.clone().normalize());
//       dummy.updateMatrix();
//       rungsRef.current!.setMatrixAt(i, dummy.matrix);

//       // Node Spheres (2 nodes per rung: index i*2 and i*2+1)
//       const colorA = new THREE.Color(bp.nuc.color);
//       const colorB = new THREE.Color(bp.nuc.glow);

//       dummyNode.position.copy(p1);
//       dummyNode.scale.setScalar(0.125);
//       dummyNode.updateMatrix();
//       nodesRef.current!.setMatrixAt(i * 2, dummyNode.matrix);
//       nodesRef.current!.setColorAt(i * 2, colorA);

//       dummyNode.position.copy(p2);
//       dummyNode.scale.setScalar(0.125);
//       dummyNode.updateMatrix();
//       nodesRef.current!.setMatrixAt(i * 2 + 1, dummyNode.matrix);
//       nodesRef.current!.setColorAt(i * 2 + 1, colorB);
//     });

//     rungsRef.current.instanceMatrix.needsUpdate = true;
//     nodesRef.current.instanceMatrix.needsUpdate = true;
//     if (nodesRef.current.instanceColor) nodesRef.current.instanceColor.needsUpdate = true;
//   }, [basePairs, dummy, dummyNode]);

//   // Click ripple listener
//   useEffect(() => {
//     const onClick = () => {
//       pulseWave.current = { time: performance.now(), active: true };
//     };
//     window.addEventListener("pointerdown", onClick);
//     return () => window.removeEventListener("pointerdown", onClick);
//   }, []);

//   // Materials
//   const backboneMaterial = useMemo(
//     () =>
//       new THREE.MeshStandardMaterial({
//         color: "#ffffff",
//         emissive: "#00f0ff",
//         emissiveIntensity: 0.85,
//         roughness: 0.2,
//         metalness: 0.8,
//         wireframe: false,
//       }),
//     [],
//   );

//   const rungMaterial = useMemo(
//     () =>
//       new THREE.MeshStandardMaterial({
//         color: "#e2242f",
//         emissive: "#ff3344",
//         emissiveIntensity: 0.6,
//         roughness: 0.3,
//         metalness: 0.6,
//       }),
//     [],
//   );

//   const nodeMaterial = useMemo(
//     () =>
//       new THREE.MeshStandardMaterial({
//         roughness: 0.15,
//         metalness: 0.5,
//         emissiveIntensity: 1.2,
//       }),
//     [],
//   );

//   // Main Render & Motion Loop
//   useFrame((_state, dt) => {
//     const d = Math.min(dt, 0.05);
//     time.current += d;

//     // Progress through hero: only fully featured at top (0..0.3 progress)
//     const p = scrollState.progress;
//     const heroWeight = clamp(1 - p * 3.5, 0, 1);
//     if (heroWeight <= 0.001) {
//       if (group.current) group.current.visible = false;
//       return;
//     }
//     if (group.current) group.current.visible = true;

//     // Pointer smoothing & spring physics
//     const targetPx = scrollState.pointerX * 0.7;
//     const targetPy = scrollState.pointerY * 0.5;
//     localSpring.current.x = damp(localSpring.current.x, targetPx, 3.5, d);
//     localSpring.current.y = damp(localSpring.current.y, targetPy, 3.5, d);

//     if (group.current) {
//       // DNA model position in 3D scene (floats in front of camera at z=2.4, smoothly sweeps & unrolls with scroll)
//       const baseZ = 2.4 - p * 24.0;
//       const baseX = 1.35 + localSpring.current.x * 0.6 - p * 4.0;
//       const baseY = 0.2 + localSpring.current.y * 0.4 + Math.sin(time.current * 0.8) * 0.08;

//       group.current.position.set(baseX, baseY, baseZ);

//       // Continuous rotation + scroll unravelling twist
//       const scrollTwist = p * 8.0;
//       group.current.rotation.y = time.current * 0.45 + scrollTwist + localSpring.current.x * 0.35;
//       group.current.rotation.x = Math.sin(time.current * 0.5) * 0.08 + localSpring.current.y * 0.25;
//       group.current.rotation.z = -0.15 + Math.cos(time.current * 0.4) * 0.05 + scrollState.rawVelocity * 0.0015;

//       // Scale breathing and unwinding as scroll deepens
//       const unrollScale = 1.0 + (1 - heroWeight) * 0.4;
//       const breathe = 1 + Math.sin(time.current * 1.5) * 0.015;
//       group.current.scale.setScalar(breathe * (0.88 * heroWeight + 0.12 * unrollScale));
//     }

//     // Dynamic animation of rungs and node pulses
//     if (rungsRef.current && nodesRef.current) {
//       const now = performance.now();
//       const waveElapsed = (now - pulseWave.current.time) / 1000;
//       const waveFront = waveElapsed * 14.0; // speed of pulse wave along height

//       basePairs.forEach((bp, i) => {
//         const angle = bp.angle + Math.sin(time.current * 1.2 + bp.y * 0.8) * 0.06;
//         const waveDist = Math.abs(bp.y + HELIX_HEIGHT * 0.5 - waveFront);
//         const waveBoost = pulseWave.current.active && waveElapsed < 2.0 ? Math.exp(-waveDist * 1.2) * 0.35 : 0;

//         const rad = HELIX_RADIUS * (1.0 + waveBoost * 0.5 + Math.sin(time.current * 2.0 + i * 0.4) * 0.02);
//         const y = bp.y + Math.sin(time.current * 1.5 + i * 0.3) * 0.04;

//         const p1 = new THREE.Vector3(Math.cos(angle) * rad, y, Math.sin(angle) * rad);
//         const p2 = new THREE.Vector3(Math.cos(angle + Math.PI) * rad, y, Math.sin(angle + Math.PI) * rad);

//         const mid = p1.clone().add(p2).multiplyScalar(0.5);
//         const diff = p2.clone().sub(p1);
//         const len = diff.length();

//         dummy.position.copy(mid);
//         dummy.scale.set(0.035 + waveBoost * 0.04, len * 0.95, 0.035 + waveBoost * 0.04);
//         dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), diff.clone().normalize());
//         dummy.updateMatrix();
//         rungsRef.current!.setMatrixAt(i, dummy.matrix);

//         // Nodes
//         const nodeScale = 0.12 + waveBoost * 0.09 + Math.sin(time.current * 3.0 + i) * 0.015;
//         dummyNode.position.copy(p1);
//         dummyNode.scale.setScalar(nodeScale);
//         dummyNode.updateMatrix();
//         nodesRef.current!.setMatrixAt(i * 2, dummyNode.matrix);

//         dummyNode.position.copy(p2);
//         dummyNode.scale.setScalar(nodeScale);
//         dummyNode.updateMatrix();
//         nodesRef.current!.setMatrixAt(i * 2 + 1, dummyNode.matrix);
//       });

//       rungsRef.current.instanceMatrix.needsUpdate = true;
//       nodesRef.current.instanceMatrix.needsUpdate = true;
//     }

//     // Orbiting particle simulation
//     if (particlesRef.current) {
//       const posAttr = particleGeo.getAttribute("position") as THREE.BufferAttribute | undefined;
//       const phaseAttr = particleGeo.getAttribute("phase") as THREE.BufferAttribute | undefined;

//       if (posAttr && phaseAttr) {
//         const posArr = posAttr.array as Float32Array;
//         const phaseArr = phaseAttr.array as Float32Array;

//         for (let i = 0; i < particleCount; i++) {
//           const ph = phaseArr[i] ?? 0;
//           const speed = 0.6 + (i % 5) * 0.15;
//           const currentAngle = ph + time.current * speed;
//           const rad = HELIX_RADIUS * (1.1 + Math.sin(time.current * 0.8 + i) * 0.35);

//           posArr[i * 3] = Math.cos(currentAngle) * rad;
//           posArr[i * 3 + 2] = Math.sin(currentAngle) * rad;
//         }
//         posAttr.needsUpdate = true;
//       }
//     }
//   });

//   return (
//     <group ref={group} position={[1.4, 0.2, 2.4]}>
//       {/* Dynamic Light Casting from the DNA Center */}
//       <pointLight position={[0, 0, 0]} intensity={18} color="#00f0ff" distance={8} decay={2} />
//       <pointLight position={[0, 2.2, 0]} intensity={14} color="#ff3344" distance={7} decay={2} />
//       <pointLight position={[0, -2.2, 0]} intensity={12} color="#ffd166" distance={7} decay={2} />

//       {/* Backbone Helix Strands */}
//       <mesh ref={strand1Ref} geometry={tubeGeo1} material={backboneMaterial} />
//       <mesh ref={strand2Ref} geometry={tubeGeo2} material={backboneMaterial} />

//       {/* Base Pair Rung Rods (Instanced) */}
//       <instancedMesh ref={rungsRef} args={[undefined, undefined, NUM_RUNGS]} material={rungMaterial}>
//         <cylinderGeometry args={[1, 1, 1, 12]} />
//       </instancedMesh>

//       {/* Nucleotide Spheres (Instanced) */}
//       <instancedMesh ref={nodesRef} args={[undefined, undefined, NUM_RUNGS * 2]} material={nodeMaterial}>
//         <sphereGeometry args={[1, 16, 16]} />
//       </instancedMesh>

//       {/* Bio-silk Orbiting Energy Dust */}
//       <points ref={particlesRef} geometry={particleGeo}>
//         <pointsMaterial
//           size={0.08}
//           vertexColors
//           transparent
//           opacity={0.85}
//           blending={THREE.AdditiveBlending}
//           depthWrite={false}
//         />
//       </points>

//       {/* Connecting Web Tendrils reaching out */}
//       <lineSegments ref={silkTendrilsRef} geometry={tendrilsGeo}>
//         <lineBasicMaterial
//           color="#90caf9"
//           transparent
//           opacity={0.32}
//           blending={THREE.AdditiveBlending}
//           depthWrite={false}
//         />
//       </lineSegments>
//     </group>
//   );
// }
