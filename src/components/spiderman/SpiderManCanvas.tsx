import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, ContactShadows } from "@react-three/drei";
import { SpiderManModel } from "./SpiderManModel";
import { useScrollRig } from "./useScrollRig";

interface SpiderManSceneProps {
  containerId?: string;
  modelUrl?: string;
}

function SceneHierarchy({ containerId, modelUrl }: SpiderManSceneProps) {
  const modelRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cameraPositionTarget = useRef(new THREE.Vector3(0, 1.6, 5.2));

  const { activeAction, lookAtTarget } = useScrollRig({
    modelRef,
    cameraRef,
    containerId,
  });

  // Dynamically lerp camera lookAt toward the hero's chest/head
  useFrame(() => {
    if (!cameraRef.current || !modelRef.current) return;
    const modelPos = modelRef.current.position;

    // Ease the camera into a subtle tracking angle as Spider-Man moves away.
    cameraPositionTarget.current.set(
      modelPos.x * 0.28,
      1.6 + (modelPos.y + 0.2) * 0.28,
      5.2 + Math.min(Math.abs(modelPos.x) * 0.08, 0.35),
    );
    cameraRef.current.position.lerp(cameraPositionTarget.current, 0.045);

    lookAtTarget.current.lerp(
      new THREE.Vector3(modelPos.x * 0.45, modelPos.y + 1.25, modelPos.z * 0.45),
      0.08,
    );

    cameraRef.current.lookAt(lookAtTarget.current);
  });

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 1.6, 5.2]}
        fov={45}
        near={0.1}
        far={60}
      />

      {/* --- CINEMATIC LIGHTING SETUP --- */}
      {/* 1. Base Ambient Fill */}
      <ambientLight intensity={0.45} color="#0c1222" />

      {/* 2. Key Directional Light with High Quality Soft Shadows */}
      <directionalLight
        position={[6, 8, 5]}
        intensity={2.4}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0001}
      />

      {/* 3. Spider-Man Rim Light (Deep Crimson backlight creating razor silhouette edges) */}
      <directionalLight position={[-7, 5, -4]} intensity={4.2} color="#ff2a3a" />

      {/* 4. Secondary Backlight Rim (Electric Cyan/Blue glow for dimensional depth) */}
      <directionalLight position={[5, -2, -5]} intensity={2.8} color="#0084ff" />

      {/* 5. Chest & Mask Fill Light */}
      <pointLight position={[0, 1.4, 3.2]} intensity={0.9} color="#e2e8f0" distance={8} />

      {/* The Rigged Spider-Man Model */}
      <SpiderManModel currentAction={activeAction} modelRef={modelRef} modelUrl={modelUrl} />

      {/* Ground Contact Shadow */}
      <ContactShadows
        position={[0, -1.02, 0]}
        opacity={0.8}
        scale={12}
        blur={2.0}
        far={5}
        color="#05070d"
      />
    </>
  );
}

/**
 * SpiderManCanvas — Hero-only 3D Canvas.
 * The canvas is always fixed but the model itself handles its own visibility
 * via the useScrollRig hook (scales to 0 when leaving hero, scales back when returning).
 */
export function SpiderManCanvas({
  containerId = "spiderman-portfolio-container",
  modelUrl = "/models/spiderman.glb",
}: SpiderManSceneProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden">
      <Canvas
        shadows
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        // DPR clamped to max 2 prevents GPU battery drain on 3x screens while keeping crispness
        dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)]}
      >
        <SceneHierarchy containerId={containerId} modelUrl={modelUrl} />
      </Canvas>
    </div>
  );
}
