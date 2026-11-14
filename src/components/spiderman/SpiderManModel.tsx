import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type SpidermanActionName =
  "Idle" | "Crouch" | "WebSling" | "WebShoot" | "Dash" | "Flip" | "Attack" | "SuperheroLanding";

export interface SpiderManModelProps {
  currentAction?: SpidermanActionName;
  timeScale?: number;
  modelRef?: React.RefObject<THREE.Group | null>;
  modelUrl?: string | undefined;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onClick?: () => void;
  onHandBone?: ((bone: THREE.Object3D) => void) | undefined;
  onLoaded?: () => void;
}

/**
 * Maps high-level action names to the skeletal clips embedded in the realistic Spider-Man GLB.
 * WebSling uses @skill04 (acrobatic forward leap) and @dash (aerodynamic web dive),
 * excluding the @skill02 weapon-twirling prop animation.
 */
const ANIM_CLIP_KEYWORDS: Record<SpidermanActionName, string[]> = {
  Idle: ["@idle", "idle"],
  Crouch: ["@wait", "wait", "@stun"],
  WebSling: ["@skill04", "skill04"],
  WebShoot: ["@skill01", "skill01", "@atk-01"],
  Dash: ["@dash", "dash"],
  Flip: ["@skill03", "skill03", "@skill04"],
  Attack: ["@atk-01", "atk-01", "@atk-02", "atk-02"],
  SuperheroLanding: ["@skill06", "skill06", "@skill05-03"],
};

/**
 * Direct AnimationMixer directly mounted on the loaded scene root.
 */
function DirectMixerSpiderMan({
  scene,
  animations,
  currentAction = "Idle",
  timeScale = 1.0,
  onHandBone,
}: {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  currentAction?: SpidermanActionName;
  timeScale?: number;
  onHandBone?: ((bone: THREE.Object3D) => void) | undefined;
}) {
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  const actionsMap = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    const map = actionsMap.current;
    map.clear();

    animations.forEach((clip) => {
      // Exclude camera helper tracks
      if (!clip.name.includes("_cam")) {
        // Keep each clip's pose but remove pelvis root travel. The cinematic
        // rig controls actor movement; skeletal root translation can otherwise
        // make Spider-Man appear to drop or jump during an action transition.
        const playableClip = clip.clone();
        playableClip.tracks = playableClip.tracks.filter(
          (track) =>
            !(/pelvis/i.test(track.name) && /(\.position|\.translation)$/i.test(track.name)),
        );
        const action = mixer.clipAction(playableClip, scene);
        map.set(clip.name, action);
      }
    });

    // Locate the right hand bone (Bip001_R_Hand_047)
    const rightHand =
      scene.getObjectByName("Bip001_R_Hand_047") ||
      scene.getObjectByName("Bip001_L_Hand_020") ||
      scene.getObjectByName("Bip001_R_Forearm_046");
    if (rightHand && onHandBone) {
      onHandBone(rightHand);
    }

    return () => {
      mixer.stopAllAction();
    };
  }, [mixer, scene, animations, onHandBone]);

  useFrame((_, dt) => {
    mixer.update(dt * Math.max(0.2, timeScale));
  });

  useEffect(() => {
    const map = actionsMap.current;
    if (map.size === 0) return;

    const keywords = ANIM_CLIP_KEYWORDS[currentAction] || [];
    let matchedAction: THREE.AnimationAction | null = null;

    for (const kw of keywords) {
      for (const [name, act] of map.entries()) {
        if (!name.includes("_cam") && name.toLowerCase().includes(kw.toLowerCase())) {
          matchedAction = act;
          break;
        }
      }
      if (matchedAction) break;
    }

    if (!matchedAction) {
      console.warn(
        `[SpiderMan] No animation clip found for "${currentAction}".`,
        "Available clips:",
        [...map.keys()],
      );
      return;
    }

    if (matchedAction && matchedAction !== activeActionRef.current) {
      const prev = activeActionRef.current;
      matchedAction.reset();
      matchedAction.enabled = true;
      matchedAction.setEffectiveTimeScale(1);
      matchedAction.setEffectiveWeight(1);

      if (currentAction === "SuperheroLanding") {
        matchedAction.setLoop(THREE.LoopOnce, 1);
        matchedAction.clampWhenFinished = true;
      } else if (currentAction === "Attack" || currentAction === "WebShoot") {
        matchedAction.setLoop(THREE.LoopOnce, 1);
      } else {
        matchedAction.setLoop(THREE.LoopRepeat, Infinity);
      }

      if (prev && prev !== matchedAction) {
        matchedAction.crossFadeFrom(prev, 0.35, true);
      } else {
        matchedAction.fadeIn(0.2);
      }

      matchedAction.play();
      activeActionRef.current = matchedAction;
    }
  }, [currentAction, mixer]);

  return <primitive object={scene} />;
}

/**
 * Universal Spider-Man Component
 * - Automatically loads the advanced rigged realistic Spider-Man 3D model (/models/spiderman.glb).
 * - Filters out all weapon/street props (wp, weapon, manhole) to keep his hands clean.
 * - Normalized to natural human scale (~1.95m height).
 * - Tracks right hand bone for authentic web attachment.
 */
export function SpiderManModel({
  currentAction = "Idle",
  timeScale = 1.0,
  modelRef,
  modelUrl = "/models/spiderman.glb",
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onClick,
  onHandBone,
  onLoaded,
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

        // Traverse meshes to configure shadows, materials, and hide weapon/floor props
        cloneScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const name = mesh.name.toLowerCase();

            // Calculate mesh bounding box
            mesh.geometry.computeBoundingBox();
            const center =
              mesh.geometry.boundingBox?.getCenter(new THREE.Vector3()) || new THREE.Vector3();

            // Hide detached weapon props (wp, weapon) and subterranean geometry
            if (
              name.includes("wp") ||
              name.includes("weapon") ||
              name.includes("manhole") ||
              name.includes("ground") ||
              name.includes("floor") ||
              center.y < -5
            ) {
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

        // Center the character vertically on waist/chest at y = 0 with feet resting at y = -0.98
        cloneScene.scale.set(1.0, 1.0, 1.0);
        cloneScene.position.set(0, -0.98, 0);

        setModelState({ scene: cloneScene, animations: gltf.animations });
        onLoaded?.();
      },
      undefined,
      (err) => {
        console.warn("Could not load Spider-Man glb model:", err);
      },
    );

    return () => {
      canceled = true;
    };
  }, [modelUrl, onLoaded]);

  return (
    <group
      {...(modelRef ? { ref: modelRef } : {})}
      position={position}
      rotation={rotation}
      scale={scale}
      dispose={null}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {modelState ? (
        <DirectMixerSpiderMan
          scene={modelState.scene}
          animations={modelState.animations}
          currentAction={currentAction}
          timeScale={timeScale}
          onHandBone={onHandBone}
        />
      ) : null}
    </group>
  );
}

export default SpiderManModel;
