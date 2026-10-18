import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scrollState, damp } from "@/lib/scroll-state";
import { SpiderManModel, type SpidermanActionName } from "@/components/spiderman/SpiderManModel";

/**
 * Places the realistic rigged Spider-Man model in the 3D corridor of the main portfolio,
 * complete with dedicated superhero rim and key lighting, reacting dynamically to scroll.
 */
export function SpiderManInBroadcast() {
  const groupRef = useRef<THREE.Group>(null);
  const [currentAction, setCurrentAction] = useState<SpidermanActionName>("Idle");
  const lastAction = useRef<SpidermanActionName>("Idle");

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const p = scrollState.progress;

    // Shift skeletal animations as user journeys down the corridor
    let nextAction: SpidermanActionName = "Idle";
    if (p < 0.15) {
      nextAction = "Idle";
    } else if (p < 0.42) {
      nextAction = "Crouch";
    } else if (p < 0.75) {
      nextAction = "WebSling";
    } else {
      nextAction = "SuperheroLanding";
    }

    if (nextAction !== lastAction.current) {
      lastAction.current = nextAction;
      setCurrentAction(nextAction);
    }

    if (groupRef.current) {
      const cam = state.camera;
      // Keep Spider-Man in clear view ahead of the camera as it dollys through the corridor
      const targetZ = cam.position.z - 3.2;
      groupRef.current.position.z = damp(groupRef.current.position.z, targetZ, 3.2, d);

      // Subtle parallax response to pointer
      const targetX = 0.65 + scrollState.pointerX * 0.45;
      const targetY = -0.25 - scrollState.pointerY * 0.3;
      groupRef.current.position.x = damp(groupRef.current.position.x, targetX, 2.5, d);
      groupRef.current.position.y = damp(groupRef.current.position.y, targetY, 2.5, d);

      // Turn to face the camera lens
      const targetRotY = -0.35 - scrollState.pointerX * 0.25;
      groupRef.current.rotation.y = damp(groupRef.current.rotation.y, targetRotY, 2.5, d);
      groupRef.current.rotation.x = damp(groupRef.current.rotation.x, scrollState.pointerY * 0.12, 2.0, d);
    }
  });

  return (
    <group ref={groupRef} position={[0.65, -0.25, 3.3]} scale={1.05}>
      {/* --- DEDICATED CINEMATIC SUPERHERO LIGHTING RIG --- */}
      {/* 1. Key Light (Crisp daylight fill for suit textures) */}
      <directionalLight position={[3, 4, 3]} intensity={4.5} color="#ffffff" />

      {/* 2. Iconic Crimson Spider-Man Rim Backlight */}
      <directionalLight position={[-3, 2, -2]} intensity={6.5} color="#ff2a3a" />

      {/* 3. Electric Cyan Rim Fill (Backlight contrast) */}
      <directionalLight position={[3, -1, -2]} intensity={4.0} color="#0088ff" />

      {/* 4. Mask & Chest Insignia Fill */}
      <pointLight position={[0, 0.4, 1.8]} intensity={1.8} color="#ffffff" distance={5} />

      {/* Realistic Spider-Man Character */}
      <SpiderManModel currentAction={currentAction} />
    </group>
  );
}

export default SpiderManInBroadcast;
