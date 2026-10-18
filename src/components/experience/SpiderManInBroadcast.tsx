import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scrollState, damp } from "@/lib/scroll-state";
import { SpiderManModel, type SpidermanActionName } from "@/components/spiderman/SpiderManModel";

/**
 * Camera-anchored idle character: waits for scrolling to stop, zips in from
 * above, holds the full idle animation, then zips upward out as soon as the
 * user scrolls again.
 */
export function SpiderManInBroadcast() {
  const groupRef = useRef<THREE.Group>(null);
  const jumpPoseRef = useRef<THREE.Group>(null);
  const [currentAction, setCurrentAction] = useState<SpidermanActionName>("Idle");
  const lastProgress = useRef<number | null>(null);
  const lastScrollTime = useRef(0);
  const visibleAmount = useRef(0);
  const previousShowTarget = useRef<boolean | null>(null);
  const takeoffStartedAt = useRef(0);

  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const delta = Math.min(dt, 0.05);
    const now = performance.now();
    const progress = scrollState.progress;
    const previousProgress = lastProgress.current;
    const progressChanged =
      previousProgress !== null && Math.abs(progress - previousProgress) > 0.000003;
    lastProgress.current = progress;

    // Use real movement signals, not the decaying velocity tail, so the idle
    // entrance starts predictably after scrolling actually stops.
    const scrollSignal = Math.abs(scrollState.rawVelocity) > 0.35 || progressChanged;
    if (scrollSignal) lastScrollTime.current = now;
    const scrolling = now - lastScrollTime.current < 140;

    // At the top, show the character on initial load. Elsewhere, wait briefly
    // for Lenis to settle before beginning the zip-in.
    const idleLongEnough = now - lastScrollTime.current > 480;
    const shouldShow = !scrolling && idleLongEnough;
    const goal = shouldShow ? 1 : 0;

    // Play the acrobatic leap at takeoff, then blend into Dash for the upward zip.
    if (previousShowTarget.current !== shouldShow) {
      previousShowTarget.current = shouldShow;
      takeoffStartedAt.current = shouldShow ? 0 : now;
      setCurrentAction(shouldShow ? "SuperheroLanding" : "WebSling");
    }

    const takeoffElapsed = now - takeoffStartedAt.current;
    if (
      !shouldShow &&
      takeoffStartedAt.current > 0 &&
      takeoffElapsed > 680 &&
      currentAction !== "Dash"
    ) {
      setCurrentAction("Dash");
    }

    // Hold the actor fully visible through the leap before starting the zip/fade.
    const zipStarted = shouldShow || takeoffElapsed > 340;
    const targetAmount = zipStarted ? goal : visibleAmount.current;
    visibleAmount.current = damp(
      visibleAmount.current,
      targetAmount,
      targetAmount > visibleAmount.current ? 4.2 : 2.8,
      delta,
    );
    if (
      currentAction !== "Idle" &&
      (shouldShow ? visibleAmount.current > 0.97 : visibleAmount.current < 0.025)
    ) {
      setCurrentAction("Idle");
    }

    const actor = groupRef.current;
    if (!actor) return;

    const camera = state.camera;
    camera.updateMatrixWorld();
    camera.getWorldDirection(forward);
    right.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    up.setFromMatrixColumn(camera.matrixWorld, 1).normalize();

    const shown = visibleAmount.current;
    const eased = shown * shown * (3 - 2 * shown);
    const takeoffLift =
      !shouldShow && takeoffStartedAt.current > 0
        ? 0.52 * Math.min(1, Math.max(0, takeoffElapsed / 320))
        : 0;
    // Fixed camera-space depth and bounded horizontal offset keep the idle
    // character framed even while the corridor camera moves and turns.
    target
      .copy(camera.position)
      .addScaledVector(forward, 3.25)
      .addScaledVector(right, 0.1 + scrollState.pointerX * 0.035)
      .addScaledVector(up, 3.35 * (1 - eased) - 0.16 + takeoffLift);

    actor.position.x = damp(actor.position.x, target.x, 16, delta);
    actor.position.y = damp(actor.position.y, target.y, 16, delta);
    actor.position.z = damp(actor.position.z, target.z, 16, delta);
    actor.quaternion.copy(camera.quaternion);
    const scale = 1.25 * (0.24 + 0.76 * eased);
    actor.scale.setScalar(scale);
    actor.visible = shown > 0.012;

    if (jumpPoseRef.current) {
      const jumpWeight =
        !shouldShow && takeoffStartedAt.current > 0 ? Math.max(0, 1 - takeoffElapsed / 360) : 0;
      jumpPoseRef.current.rotation.x = -0.32 * jumpWeight;
      jumpPoseRef.current.rotation.z = 0.08 * jumpWeight;
    }
  });

  return (
    <group ref={groupRef} position={[0.1, 3.2, 3.25]} scale={0.3}>
      <directionalLight position={[3, 4, 3]} intensity={4.5} color="#ffffff" />
      <directionalLight position={[-3, 2, -2]} intensity={6.5} color="#ff2a3a" />
      <directionalLight position={[3, -1, -2]} intensity={4.0} color="#0088ff" />
      <pointLight position={[0, 0.4, 1.8]} intensity={1.8} color="#ffffff" distance={5} />

      <group ref={jumpPoseRef}>
        <SpiderManModel
          currentAction={currentAction}
          timeScale={currentAction === "Dash" ? 0.72 : 0.9}
        />
      </group>
    </group>
  );
}

export default SpiderManInBroadcast;
