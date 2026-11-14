import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import gsap from "gsap";
import { SpiderManModel, type SpidermanActionName } from "./SpiderManModel";

const MODEL_SCALE = 1.05;
// Positive values lift Spider-Man; adjust this value to tune his landing-page height.
const LANDING_MODEL_Y = 0.9;

function LandingSpiderManScene({ leaving }: { leaving: boolean }) {
  const modelRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cameraPositionTarget = useRef(new THREE.Vector3());
  const [modelReady, setModelReady] = useState(false);
  const [activeAction, setActiveAction] = useState<SpidermanActionName>("SuperheroLanding");
  const onModelLoaded = useCallback(() => setModelReady(true), []);

  useFrame(() => {
    const camera = cameraRef.current;
    const model = modelRef.current;
    if (!camera || !model) return;

    cameraPositionTarget.current.set(model.position.x * 0.18, 1.12 + model.position.y * 0.12, 4.35);
    camera.position.lerp(cameraPositionTarget.current, 0.045);
    camera.lookAt(model.position.x * 0.16, 0.98 + model.position.y * 0.12, 0);
  });

  useEffect(() => {
    const model = modelRef.current;
    if (!model || !modelReady || leaving) return;

    model.position.set(0, LANDING_MODEL_Y + 0.72, 0);
    model.rotation.set(-0.5, -0.14, 0);
    model.scale.setScalar(0.2);

    const entrance = gsap.timeline({
      onComplete: () => setActiveAction("Idle"),
    });
    entrance.to(model.position, { y: LANDING_MODEL_Y, duration: 1.4, ease: "power3.out" }, 0);
    entrance.to(model.rotation, { x: 0, y: -0.14, z: 0, duration: 1.4, ease: "power3.out" }, 0);
    entrance.to(
      model.scale,
      { x: MODEL_SCALE, y: MODEL_SCALE, z: MODEL_SCALE, duration: 1.4, ease: "back.out(1.25)" },
      0,
    );

    return () => {
      entrance.kill();
    };
  }, [leaving, modelReady]);

  useEffect(() => {
    if (!leaving || !modelReady) return;

    // Keep the actor rooted in place; only the skeletal Dash animation changes.
    setActiveAction("Dash");
  }, [leaving, modelReady]);

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 1.12, 4.35]}
        fov={38}
        near={0.1}
        far={40}
      />
      <ambientLight intensity={0.55} color="#0c1222" />
      <directionalLight position={[6, 8, 5]} intensity={2.4} color="#ffffff" />
      <directionalLight position={[-7, 5, -4]} intensity={4.2} color="#ff2a3a" />
      <directionalLight position={[5, -2, -5]} intensity={2.8} color="#0084ff" />
      <pointLight position={[0, 1.4, 3.2]} intensity={0.9} color="#e2e8f0" distance={8} />
      <SpiderManModel
        currentAction={activeAction}
        modelRef={modelRef}
        modelUrl="/models/spiderman.glb"
        onLoaded={onModelLoaded}
      />
      <ContactShadows
        position={[0, -1.02, 0]}
        opacity={0.65}
        scale={6}
        blur={2}
        far={4}
        color="#05070d"
      />
    </>
  );
}

export function LandingSpiderManCanvas({ leaving }: { leaving: boolean }) {
  return (
    <div
      className="pointer-events-none absolute right-[3%] top-[7%] z-[1] h-[82%] w-[34%] max-w-[560px] min-w-[320px]"
      aria-hidden="true"
    >
      <Canvas
        shadows
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)]}
      >
        <LandingSpiderManScene leaving={leaving} />
      </Canvas>
    </div>
  );
}
