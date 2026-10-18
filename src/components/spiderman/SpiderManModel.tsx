import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useAnimations } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type SpidermanActionName = "Idle" | "Crouch" | "WebSling" | "SuperheroLanding";

interface SpiderManModelProps {
  currentAction?: SpidermanActionName;
  modelRef?: React.RefObject<THREE.Group | null>;
  modelUrl?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * Maps high-level action names to the skeletal clips embedded in the realistic Spider-Man GLB.
 */
const ANIM_CLIP_KEYWORDS: Record<SpidermanActionName, string[]> = {
  Idle: ["@idle", "idle", "@wait", "wait"],
  Crouch: ["@wait", "wait", "@stun", "@idle"],
  WebSling: ["@skill02", "@skill01", "@skill03", "@atk-01", "dash", "skill"],
  SuperheroLanding: ["@skill06", "@skill05-03", "@atk-02", "hit", "skill"],
};

/**
 * Component that binds and plays realistic skeletal animations from the loaded GLB.
 */
function RealisticGltfSpiderMan({
  scene,
  animations,
  currentAction = "Idle",
}: {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  currentAction?: SpidermanActionName;
}) {
  const localRef = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animations, localRef);
  const prevActionRef = useRef<SpidermanActionName | null>(null);

  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    // Find the best matching skeletal animation clip
    const keywords = ANIM_CLIP_KEYWORDS[currentAction] || [];
    let matchedActionName: string | null = null;

    for (const kw of keywords) {
      const found = Object.keys(actions).find((name) =>
        name.toLowerCase().includes(kw.toLowerCase())
      );
      if (found) {
        matchedActionName = found;
        break;
      }
    }

    if (!matchedActionName) {
      matchedActionName = Object.keys(actions)[0]!;
    }

    const currentClip = matchedActionName ? actions[matchedActionName] : null;

    // Previous clip for cross-fade blending
    const prevKeywords = prevActionRef.current ? ANIM_CLIP_KEYWORDS[prevActionRef.current] : [];
    let prevActionName: string | null = null;
    for (const kw of prevKeywords) {
      const found = Object.keys(actions).find((name) =>
        name.toLowerCase().includes(kw.toLowerCase())
      );
      if (found) {
        prevActionName = found;
        break;
      }
    }
    const prevClip = prevActionName ? actions[prevActionName] : null;

    if (currentClip) {
      currentClip.reset();
      currentClip.enabled = true;
      currentClip.setEffectiveTimeScale(1);
      currentClip.setEffectiveWeight(1);

      if (currentAction === "SuperheroLanding") {
        currentClip.setLoop(THREE.LoopOnce, 1);
        currentClip.clampWhenFinished = true;
      } else {
        currentClip.setLoop(THREE.LoopRepeat, Infinity);
      }

      if (prevClip && prevClip !== currentClip) {
        currentClip.crossFadeFrom(prevClip, 0.45, true);
      } else {
        currentClip.fadeIn(0.25);
      }

      currentClip.play();
    }

    prevActionRef.current = currentAction;
  }, [currentAction, actions]);

  return (
    <group ref={localRef}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * Universal Spider-Man Component
 * - Automatically loads the advanced rigged realistic Spider-Man 3D model (/models/spiderman.glb).
 * - Properly configured at natural human scale (~1.95m height).
 * - Filters out detached street props (such as subterranean manhole geometry at y = -17).
 * - Enables shadow casting/receiving on all suit segments.
 * - Handles smooth skeletal animation cross-fading for Idle, Crouch, WebSling, and SuperheroLanding.
 */
export function SpiderManModel({
  currentAction = "Idle",
  modelRef,
  modelUrl = "/models/spiderman.glb",
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: SpiderManModelProps) {
  const [modelState, setModelState] = useState<{
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
  } | null>(null);

  useEffect(() => {
    let canceled = false;
    const loader = new GLTFLoader();

    loader.load(
      modelUrl,
      (gltf) => {
        if (canceled) return;

        const cloneScene = gltf.scene;

        // Traverse meshes to configure shadows, materials, and hide offscreen props
        cloneScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const name = mesh.name.toLowerCase();

            // Calculate mesh bounding box
            mesh.geometry.computeBoundingBox();
            const center = mesh.geometry.boundingBox?.getCenter(new THREE.Vector3()) || new THREE.Vector3();

            // Hide detached floor props like the manhole cover or anything subterranean below y = -5
            if (name.includes("manhole") || name.includes("ground") || name.includes("floor") || center.y < -5) {
              mesh.visible = false;
              return;
            }

            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.material instanceof THREE.MeshStandardMaterial) {
              mesh.material.roughness = 0.35;
              mesh.material.metalness = 0.25;
              mesh.material.envMapIntensity = 1.5;
              mesh.material.needsUpdate = true;
            }
          }
        });

        // The model's natural character size is already exactly human scale (~1.96m tall)
        // Center the character vertically on waist/chest at y = 0 with feet resting at y = -0.98
        cloneScene.scale.set(1.0, 1.0, 1.0);
        cloneScene.position.set(0, -0.98, 0);

        setModelState({ scene: cloneScene, animations: gltf.animations });
      },
      undefined,
      (err) => {
        console.warn("Could not load Spider-Man glb model:", err);
      }
    );

    return () => {
      canceled = true;
    };
  }, [modelUrl]);

  return (
    <group ref={modelRef} position={position} rotation={rotation} scale={scale} dispose={null}>
      {modelState ? (
        <RealisticGltfSpiderMan
          scene={modelState.scene}
          animations={modelState.animations}
          currentAction={currentAction}
        />
      ) : null}
    </group>
  );
}

export default SpiderManModel;
