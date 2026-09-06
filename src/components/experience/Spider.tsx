import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { scrollState, clamp } from "@/lib/scroll-state";
import {
  getWebTopology,
  evaluateWebSegment,
  type WebTopology,
  type WebSegment,
} from "./web-topology";

type SpiderProps = {
  origin?: [number, number, number];
  seed?: number;
  webSize?: number;
  scale?: number;
  speed?: number;
  phase?: number;
  hero?: boolean;
  crawlPoint?: { current: THREE.Vector2 };
  webOffset?: { current: THREE.Vector2 };
};

type LegBoneInfo = {
  bone: THREE.Bone;
  baseQuaternion: THREE.Quaternion;
  chainIndex: number;
  segmentIndex: number;
};

const LEG_CHAINS = [
  // Left 1..4 (front to back)
  ["Bone_L", "Bone001_L", "Bone002_L", "Bone003_L"],
  ["Bone004_L", "Bone005_L", "Bone006_L", "Bone007_L"],
  ["Bone008_L", "Bone009_L", "Bone010_L", "Bone011_L"],
  ["Bone012_L", "Bone013_L", "Bone014_L", "Bone015_L"],
  // Right 1..4 (front to back)
  ["Bone_R", "Bone001_R", "Bone002_R", "Bone003_R"],
  ["Bone004_R", "Bone005_R", "Bone006_R", "Bone007_R"],
  ["Bone008_R", "Bone009_R", "Bone010_R", "Bone011_R"],
  ["Bone012_R", "Bone013_R", "Bone014_R", "Bone015_R"],
];

function visibleBounds(root: THREE.Group) {
  const bounds = new THREE.Box3();
  root.updateMatrixWorld(true);
  root.traverse((object) => {
    const mesh = object as THREE.Mesh & { isMesh?: boolean };
    if (mesh.isMesh) bounds.expandByObject(mesh);
  });
  return bounds;
}

function normalizeSpider(
  root: THREE.Group,
  colorTexture: THREE.Texture,
  normalTexture: THREE.Texture,
  roughnessTexture: THREE.Texture,
  emissiveTexture: THREE.Texture,
  hero: boolean = false,
) {
  root.rotation.x = Math.PI / 2;
  root.updateMatrixWorld(true);
  const bounds = visibleBounds(root);
  const size = bounds.getSize(new THREE.Vector3());
  const largest = Math.max(size.x, size.y, size.z, 0.001);
  root.scale.multiplyScalar(0.92 / largest);
  root.updateMatrixWorld(true);

  const fitted = visibleBounds(root);
  const fittedSize = fitted.getSize(new THREE.Vector3());
  const fittedLargest = Math.max(fittedSize.x, fittedSize.y, fittedSize.z, 0.001);
  root.scale.multiplyScalar(0.92 / fittedLargest);
  root.updateMatrixWorld(true);

  const finalBounds = visibleBounds(root);
  const center = finalBounds.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.y -= center.y;
  root.position.z -= finalBounds.min.z;
  root.updateMatrixWorld(true);

  root.traverse((object) => {
    const mesh = object as THREE.Mesh & { isMesh?: boolean };
    if (!mesh.isMesh) return;
    mesh.visible = true;
    mesh.frustumCulled = false;
    mesh.renderOrder = 50;

    const materialCount = Array.isArray(mesh.material) ? mesh.material.length : 1;
    const materials = Array.from(
      { length: materialCount },
      () =>
        new THREE.MeshStandardMaterial({
          color: hero ? "#ffffff" : "#f5f7fa",
          map: colorTexture,
          normalMap: normalTexture,
          normalScale: new THREE.Vector2(1.3, 1.3),
          roughnessMap: roughnessTexture,
          roughness: hero ? 0.3 : 0.42,
          metalness: hero ? 0.4 : 0.24,
          emissive: new THREE.Color(hero ? "#ff482c" : "#ff3820"),
          emissiveMap: emissiveTexture,
          emissiveIntensity: hero ? 5.6 : 3.4,
          toneMapped: false,
          side: THREE.DoubleSide,
          transparent: false,
          depthTest: true,
          depthWrite: true,
        }),
    );
    mesh.material = Array.isArray(mesh.material) ? materials : materials[0]!;
  });
}

/**
 * Finds all valid adjacent web segments from a given spoke & ring junction node.
 */
function getAvailableTransitions(
  topology: WebTopology,
  spoke: number,
  ring: number,
  lastSegmentType: "spoke" | "spiral" | null,
  lastSpoke: number,
  lastRing: number,
): { segment: WebSegment; forward: boolean; nextSpoke: number; nextRing: number; weight: number }[] {
  const options: {
    segment: WebSegment;
    forward: boolean;
    nextSpoke: number;
    nextRing: number;
    weight: number;
  }[] = [];

  const strands = topology.strands;
  const rings = topology.rings;

  // 1. Outward on same spoke (if ring < rings)
  if (ring < rings) {
    const seg = topology.spokeSegments.find(
      (s) => s.spokeIndex === spoke && s.fromRing === ring && s.toRing === ring + 1,
    );
    if (seg) {
      let weight = 3.0;
      if (ring <= 2) weight = 5.0; // eager to explore outward from hub
      if (ring >= 7) weight = 1.0; // avoid outer rim
      if (lastSegmentType === "spoke" && lastRing < ring) weight = 4.0; // continue outward streak
      options.push({ segment: seg, forward: true, nextSpoke: spoke, nextRing: ring + 1, weight });
    }
  }

  // 2. Inward on same spoke (if ring > 0)
  if (ring > 0) {
    const seg = topology.spokeSegments.find(
      (s) => s.spokeIndex === spoke && s.fromRing === ring - 1 && s.toRing === ring,
    );
    if (seg) {
      let weight = 2.5;
      if (ring >= 8) weight = 5.5; // return from edge
      if (lastSegmentType === "spoke" && lastRing > ring) weight = 4.0; // continue inward dash
      options.push({ segment: seg, forward: false, nextSpoke: spoke, nextRing: ring - 1, weight });
    }
  }

  // 3. Clockwise along spiral ring (if ring > 0)
  if (ring > 0) {
    const nextSp = (spoke + 1) % strands;
    const seg = topology.spiralSegments.find(
      (s) => s.ringIndex === ring && s.fromSpoke === spoke && s.toSpoke === nextSp,
    );
    if (seg) {
      let weight = 4.0;
      if (lastSegmentType === "spiral" && lastSpoke === (spoke - 1 + strands) % strands) {
        weight = 6.0; // maintain clockwise weaving streak
      }
      options.push({ segment: seg, forward: true, nextSpoke: nextSp, nextRing: ring, weight });
    }
  }

  // 4. Counter-clockwise along spiral ring (if ring > 0)
  if (ring > 0) {
    const prevSp = (spoke - 1 + strands) % strands;
    const seg = topology.spiralSegments.find(
      (s) => s.ringIndex === ring && s.fromSpoke === prevSp && s.toSpoke === spoke,
    );
    if (seg) {
      let weight = 4.0;
      if (lastSegmentType === "spiral" && lastSpoke === (spoke + 1) % strands) {
        weight = 6.0; // maintain counter-clockwise weaving streak
      }
      options.push({ segment: seg, forward: false, nextSpoke: prevSp, nextRing: ring, weight });
    }
  }

  return options;
}

export function Spider({
  origin = [0, 0, 0.045],
  seed = 3,
  webSize = 5.1,
  scale = 1,
  speed = 0.55,
  phase = 0,
  hero = false,
  crawlPoint,
  webOffset,
}: SpiderProps) {
  const webOffsetRef = webOffset;
  const group = useRef<THREE.Group>(null);
  const topology = useMemo(() => getWebTopology(seed, 16, 9, webSize), [seed, webSize]);

  const [colorTexture, normalTexture, roughnessTexture, emissiveTexture] = useTexture([
    "/spidey-color.jpg",
    "/spidey-normal.jpg",
    "/spidey-roughness.jpg",
    "/spidey-emissive.jpg",
  ]);

  const asset = useLoader(FBXLoader, "/Mecha_Spider.fbx");

  const { animationRig, legBones } = useMemo(() => {
    colorTexture.colorSpace = THREE.SRGBColorSpace;
    colorTexture.anisotropy = 4;
    colorTexture.needsUpdate = true;

    emissiveTexture.colorSpace = THREE.SRGBColorSpace;
    emissiveTexture.needsUpdate = true;

    const clone = cloneSkinned(asset) as THREE.Group;
    normalizeSpider(clone, colorTexture, normalTexture, roughnessTexture, emissiveTexture, hero);

    const boneMap = new Map<string, THREE.Bone>();
    clone.traverse((object) => {
      if ((object as THREE.Bone).isBone) {
        boneMap.set(object.name, object as THREE.Bone);
      }
    });

    const bones: LegBoneInfo[] = [];
    LEG_CHAINS.forEach((chain, chainIndex) => {
      chain.forEach((boneName, segmentIndex) => {
        const bone = boneMap.get(boneName);
        if (bone) {
          bones.push({
            bone,
            baseQuaternion: bone.quaternion.clone(),
            chainIndex,
            segmentIndex,
          });
        }
      });
    });

    return { animationRig: clone, legBones: bones };
  }, [asset, colorTexture, normalTexture, roughnessTexture, emissiveTexture, hero]);

  useEffect(() => {
    const parent = group.current;
    if (!parent) return;
    animationRig.visible = true;
    animationRig.matrixAutoUpdate = true;
    parent.add(animationRig);
    return () => {
      parent.remove(animationRig);
    };
  }, [animationRig]);

  // Crawling & Behavior State
  const currentSpoke = useRef(Math.floor(phase * topology.strands) % topology.strands);
  const currentRing = useRef(hero ? 2 : Math.max(1, Math.floor(phase * 6)));
  const currentSegment = useRef<WebSegment | null>(null);
  const segmentForward = useRef(true);
  const segmentT = useRef(0);
  const segmentLength = useRef(1);
  const previousSpoke = useRef(currentSpoke.current);
  const previousRing = useRef(currentRing.current);
  const previousType = useRef<"spoke" | "spiral" | null>(null);

  // Behavioral timers
  const behaviorState = useRef<"CRAWL" | "PROBE" | "PAUSE">("CRAWL");
  const stateTimer = useRef(0);
  const gaitCycle = useRef(0);
  const currentHeading = useRef(0);

  // Position & Vectors
  const point = useMemo(() => new THREE.Vector2(), []);
  const tangent = useMemo(() => new THREE.Vector2(), []);
  const tempEuler = useMemo(() => new THREE.Euler(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);

  // Initialize first segment
  useEffect(() => {
    const options = getAvailableTransitions(
      topology,
      currentSpoke.current,
      currentRing.current,
      null,
      currentSpoke.current,
      currentRing.current,
    );
    if (options.length > 0) {
      const chosen = options[Math.floor(Math.random() * options.length)]!;
      currentSegment.current = chosen.segment;
      segmentForward.current = chosen.forward;
      segmentLength.current = chosen.segment.length;
      segmentT.current = 0;
    }
  }, [topology]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);

    if (!group.current) return;
    if (animationRig.parent !== group.current) group.current.add(animationRig);

    // Dynamic crawling speed boosted by scroll or cursor interaction
    const scrollBoost = 1 + clamp(scrollState.velocity * 0.45, 0, 0.25);
    const baseCrawlSpeed = speed * (hero ? 0.65 : 0.55);

    let stepMovement = 0;

    // --- State Machine ---
    if (behaviorState.current === "PROBE" || behaviorState.current === "PAUSE") {
      stateTimer.current -= d;
      if (stateTimer.current <= 0) {
        // Pick next branch at junction
        const options = getAvailableTransitions(
          topology,
          currentSpoke.current,
          currentRing.current,
          previousType.current,
          previousSpoke.current,
          previousRing.current,
        );

        if (options.length > 0) {
          // Weighted random pick
          const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
          let r = Math.random() * totalWeight;
          let chosen = options[0]!;
          for (const opt of options) {
            r -= opt.weight;
            if (r <= 0) {
              chosen = opt;
              break;
            }
          }

          previousSpoke.current = currentSpoke.current;
          previousRing.current = currentRing.current;
          previousType.current = chosen.segment.type;

          currentSegment.current = chosen.segment;
          segmentForward.current = chosen.forward;
          segmentLength.current = Math.max(0.1, chosen.segment.length);
          segmentT.current = 0;
          behaviorState.current = "CRAWL";
        }
      }
    } else if (behaviorState.current === "CRAWL" && currentSegment.current) {
      // Speed multiplier depending on spoke vs spiral
      const isSpoke = currentSegment.current.type === "spoke";
      const strideRate = (isSpoke ? 1.25 : 0.95) * baseCrawlSpeed * scrollBoost;

      const deltaT = (strideRate * d) / segmentLength.current;
      segmentT.current += deltaT;
      stepMovement = strideRate * d;

      if (segmentT.current >= 1.0) {
        // Reached next junction
        segmentT.current = 1.0;
        const seg = currentSegment.current;
        if (seg.type === "spoke") {
          currentSpoke.current = seg.spokeIndex;
          currentRing.current = segmentForward.current ? seg.toRing : seg.fromRing;
        } else {
          currentRing.current = seg.ringIndex;
          currentSpoke.current = segmentForward.current ? seg.toSpoke : seg.fromSpoke;
        }

        // Decide whether to pause & probe silk tension at this junction
        const probeChance = currentRing.current === 0 ? 0.9 : 0.45;
        if (Math.random() < probeChance) {
          behaviorState.current = "PROBE";
          stateTimer.current = 0.35 + Math.random() * 0.55;
        } else {
          behaviorState.current = "PAUSE";
          stateTimer.current = 0.08 + Math.random() * 0.12;
        }
      }
    }

    // Evaluate position & tangent on active strand
    if (currentSegment.current) {
      evaluateWebSegment(
        currentSegment.current,
        segmentT.current,
        segmentForward.current,
        point,
        tangent,
      );
    } else {
      point.copy(topology.hub);
      tangent.set(0, 1);
    }

    // Update 3D position
    const webOffsetVal = webOffsetRef?.current;
    const posX = point.x + (webOffsetVal?.x ?? 0);
    const posY = point.y + (webOffsetVal?.y ?? 0);
    const posZ = origin[2];

    group.current.position.set(posX, posY, posZ);

    if (crawlPoint) {
      crawlPoint.current.set(posX, posY);
    }

    // Smooth heading alignment
    if (tangent.lengthSq() > 0.0001) {
      const targetHeading = Math.atan2(tangent.y, tangent.x) - Math.PI / 2;
      let diff = targetHeading - currentHeading.current;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      currentHeading.current += diff * Math.min(1.0, d * 9.0);
      group.current.rotation.z = currentHeading.current;
    }

    // --- Procedural 8-Legged Gait Kinematics ---
    if (behaviorState.current === "CRAWL" && stepMovement > 0) {
      gaitCycle.current += (stepMovement / 0.18) * Math.PI * 2;
    }

    const cycle = gaitCycle.current;
    const isProbing = behaviorState.current === "PROBE";
    const probeTime = performance.now() * 0.001;

    // Body bobbing and micro pitch/roll
    const bodyBob = Math.sin(cycle * 2) * 0.012;
    const bodyRoll = Math.sin(cycle) * 0.018;
    animationRig.position.z = bodyBob;
    animationRig.rotation.y = bodyRoll;

    legBones.forEach(({ bone, baseQuaternion, chainIndex, segmentIndex }) => {
      // 8 legs: 0..3 Left (front to back), 4..7 Right (front to back)
      const isLeft = chainIndex < 4;
      const legPair = chainIndex % 4; // 0=front, 1=mid-front, 2=mid-rear, 3=rear

      // Alternating Tetrapod Groups:
      // Group A: L1 (0), R2 (5), L3 (2), R4 (7) -> basePhase = 0
      // Group B: R1 (4), L2 (1), R3 (6), L4 (3) -> basePhase = Math.PI
      const isGroupA = (isLeft && legPair % 2 === 0) || (!isLeft && legPair % 2 === 1);
      const groupPhase = isGroupA ? 0 : Math.PI;
      const metachronalOffset = legPair * 0.22;
      const legPhase = cycle + groupPhase + metachronalOffset;

      const swing = Math.cos(legPhase);
      const lift = Math.max(0, Math.sin(legPhase));

      let rotX = 0;
      let rotY = 0;
      let rotZ = 0;

      if (isProbing) {
        // Front feeler legs tap and probe the silk; other legs remain anchored
        if (legPair === 0) {
          const tapPhase = probeTime * 18.0 + (isLeft ? 0 : 1.2);
          const tapLift = Math.max(0, Math.sin(tapPhase)) * 0.26;
          const tapReach = Math.sin(tapPhase * 0.7) * 0.16;

          if (segmentIndex === 0) {
            rotZ = (isLeft ? 1 : -1) * (0.12 + tapReach * 0.3);
            rotY = tapLift * 0.25;
          } else if (segmentIndex === 1) {
            rotX = -tapLift * 0.5;
          } else if (segmentIndex === 2) {
            rotX = tapLift * 0.6;
          } else {
            rotX = -tapLift * 0.3;
          }
        } else {
          // Anchored grip with slight breathing sway
          const anchorSway = Math.sin(probeTime * 3.0 + legPair) * 0.03;
          rotZ = anchorSway;
        }
      } else {
        // Active crawling locomotion
        const amplitude = [0.55, 0.42, 0.32, 0.24][segmentIndex] ?? 0.2;
        const frontFeelerBonus = legPair === 0 ? 1.35 : 1.0;

        if (segmentIndex === 0) {
          // Coxa: forward-backward swing and lateral stance
          rotZ = (isLeft ? 1 : -1) * swing * amplitude * 0.68 * frontFeelerBonus;
          rotY = lift * amplitude * 0.32 * frontFeelerBonus;
        } else if (segmentIndex === 1) {
          // Femur: upward lift during swing phase, downward thrust during stance
          rotX = -lift * amplitude * 0.78 * frontFeelerBonus;
          rotY = (isLeft ? 1 : -1) * swing * amplitude * 0.28;
        } else if (segmentIndex === 2) {
          // Tibia: knee flexion to reach forward and plant down
          rotX = lift * amplitude * 0.85;
          rotZ = (isLeft ? -1 : 1) * swing * amplitude * 0.2;
        } else {
          // Tarsus / claw: downward grip curve onto silk strand
          rotX = -lift * amplitude * 0.55 - 0.08;
        }
      }

      tempEuler.set(rotX, rotY, rotZ);
      tempQuat.setFromEuler(tempEuler);
      bone.quaternion.copy(baseQuaternion).multiply(tempQuat);
    });
  });

  return (
    <group ref={group} scale={scale * 0.58}>
      {hero && (
        <pointLight
          position={[0, 0, 0.45]}
          intensity={22}
          color="#ff4420"
          distance={6}
          decay={2}
        />
      )}
    </group>
  );
}

useTexture.preload("/spidey-color.jpg");
useTexture.preload("/spidey-normal.jpg");
useTexture.preload("/spidey-roughness.jpg");
useTexture.preload("/spidey-emissive.jpg");
