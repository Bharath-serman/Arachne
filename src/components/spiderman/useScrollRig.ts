import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SpidermanActionName } from "./SpiderManModel";

gsap.registerPlugin(ScrollTrigger);

interface UseScrollRigProps {
  modelRef: React.RefObject<THREE.Group | null>;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  containerId?: string | undefined;
}

/**
 * Hero-only scroll rig:
 * - Spider-Man is ONLY visible in the hero section.
 * - When user scrolls past ~60% of hero, Spidey plays a Dash exit and
 *   scales to 0 (like web-zipping away off-screen).
 * - When the user scrolls back into the hero section, Spidey performs a
 *   SuperheroLanding entrance (drops from above, scales back to 1) then
 *   settles into Idle.
 * - No Spider-Man appears in any other section.
 */
export function useScrollRig({
  modelRef,
  cameraRef,
  containerId = "spiderman-portfolio-container",
}: UseScrollRigProps) {
  const [activeAction, setActiveAction] = useState<SpidermanActionName>("Idle");
  const lookAtTarget = useRef(new THREE.Vector3(0, 1.2, 0));
  const isVisibleRef = useRef(true);
  const tweensRef = useRef<gsap.core.Tween[]>([]);

  // Kill all running tweens cleanly
  const killTweens = () => {
    tweensRef.current.forEach((t) => t.kill());
    tweensRef.current = [];
  };

  // Track a tween so we can kill it later
  const track = (t: gsap.core.Tween) => {
    tweensRef.current.push(t);
    return t;
  };

  useEffect(() => {
    if (!modelRef.current || !cameraRef.current) return;

    const model = modelRef.current;
    const camera = cameraRef.current;
    const container = document.getElementById(containerId) || document.body;

    // Set initial resting pose: Spider-Man centered in hero, standing
    model.position.set(1.2, -0.2, 0.5);
    model.rotation.set(0, -0.25, 0);
    model.scale.set(1, 1, 1);
    camera.position.set(0, 1.6, 5.2);

    const ctx = gsap.context(() => {
      // Find the hero section
      const heroEl =
        document.getElementById("spiderman-hero") ||
        container.querySelector("section:first-of-type") ||
        container;

      // -- EXIT when scrolling past ~60% of hero section --
      ScrollTrigger.create({
        trigger: heroEl,
        start: "60% top", // when 60% of hero has scrolled past the top
        end: "bottom top",
        onEnter: () => {
          if (!isVisibleRef.current) return;
          isVisibleRef.current = false;

          killTweens();
          setActiveAction("Dash");

          // Zip away: shrink + slide up-right
          track(
            gsap.to(model.scale, {
              x: 0,
              y: 0,
              z: 0,
              duration: 0.4,
              ease: "power3.in",
            })
          );

          track(
            gsap.to(model.position, {
              x: 4,
              y: 3.5,
              z: -3,
              duration: 0.4,
              ease: "power3.in",
            })
          );

          track(
            gsap.to(model.rotation, {
              x: -0.4,
              y: -Math.PI * 0.6,
              z: 0.3,
              duration: 0.4,
              ease: "power3.in",
            })
          );
        },
        onLeaveBack: () => {
          // User scrolled back up past the 60% threshold → re-enter
          if (isVisibleRef.current) return;
          isVisibleRef.current = true;

          killTweens();
          setActiveAction("SuperheroLanding");

          // Start from above and to the right (like dropping from a web line)
          model.position.set(1.2, 4, -1.5);
          model.rotation.set(-0.6, -0.25, 0);
          model.scale.set(0.2, 0.2, 0.2);

          // Animate landing
          track(
            gsap.to(model.scale, {
              x: 1,
              y: 1,
              z: 1,
              duration: 0.6,
              ease: "back.out(1.4)",
            })
          );

          track(
            gsap.to(model.position, {
              x: 1.2,
              y: -0.2,
              z: 0.5,
              duration: 0.65,
              ease: "power2.out",
            })
          );

          track(
            gsap.to(model.rotation, {
              x: 0,
              y: -0.25,
              z: 0,
              duration: 0.65,
              ease: "power2.out",
              onComplete: () => {
                // Settle into Idle after landing
                setTimeout(() => setActiveAction("Idle"), 800);
              },
            })
          );
        },
      });

      // -- Subtle idle micro-motion while in hero (breathing/weight shift) --
      const idleTl = gsap.timeline({ repeat: -1, yoyo: true, paused: false });
      idleTl.to(model.rotation, {
        y: -0.15,
        duration: 4,
        ease: "sine.inOut",
      });
      idleTl.to(
        model.position,
        {
          y: -0.12,
          duration: 4,
          ease: "sine.inOut",
        },
        0
      );
    }, container);

    return () => {
      killTweens();
      ctx.revert();
    };
  }, [modelRef, cameraRef, containerId]);

  return { activeAction, lookAtTarget };
}
