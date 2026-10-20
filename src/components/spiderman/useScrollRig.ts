
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SpidermanActionName } from "./SpiderManModel";

gsap.registerPlugin(ScrollTrigger);

interface UseScrollRigProps {
  modelRef: React.RefObject<THREE.Group | null>;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  containerId?: string;
}

export function useScrollRig({
  modelRef,
  cameraRef,
  containerId = "spiderman-portfolio-container",
}: UseScrollRigProps) {
  const [activeAction, setActiveAction] =
    useState<SpidermanActionName>("Idle");

  const lookAtTarget = useRef(new THREE.Vector3(0, 1.2, 0));

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    let retryId: number | undefined;

    // The GLB model may not be mounted on the first effect pass.
    const initialize = () => {
      if (cancelled) return;

      const model = modelRef.current;
      const camera = cameraRef.current;

      if (!model || !camera) {
        retryId = window.setTimeout(initialize, 100);
        return;
      }

      const container =
        document.getElementById(containerId) ?? document.body;

      const hero =
        document.getElementById("spiderman-hero") ??
        container.querySelector("section:first-of-type") ??
        container;

      console.log("[SpiderMan] Rig initialized", {
        model,
        camera,
        hero,
      });

      const home = {
        x: 1.2,
        y: -0.2,
        z: 0.5,
        rx: 0,
        ry: -0.25,
        rz: 0,
      };

      let exitTimeline: gsap.core.Timeline | null = null;
      let entranceTimeline: gsap.core.Timeline | null = null;
      let exiting = false;

      // Build a cinematic overlay in the DOM.
      const overlay = document.createElement("div");

      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        zIndex: "9999",
        pointerEvents: "none",
        overflow: "hidden",
        opacity: "0",
        visibility: "hidden",
        background:
          "radial-gradient(ellipse at 60% 45%, rgba(80,20,35,0.2), transparent 55%), #05060d",
      });

      const web = document.createElement("div");

      Object.assign(web.style, {
        position: "absolute",
        left: "-20%",
        top: "48%",
        width: "140%",
        height: "4px",
        transform: "rotate(-28deg) scaleX(0)",
        transformOrigin: "left center",
        background:
          "linear-gradient(90deg, transparent, white, #c8e5ff, white, transparent)",
        boxShadow: "0 0 12px white, 0 0 28px #6cb8ff",
      });

      overlay.appendChild(web);

      const streaks: HTMLDivElement[] = [];

      for (let i = 0; i < 8; i++) {
        const streak = document.createElement("div");

        Object.assign(streak.style, {
          position: "absolute",
          top: `${12 + i * 10}%`,
          left: "-70%",
          width: `${35 + (i % 3) * 15}vw`,
          height: "2px",
          opacity: "0",
          transform: "rotate(-25deg)",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,.9), rgba(130,190,255,.8), transparent)",
          boxShadow: "0 0 8px rgba(160,205,255,.6)",
        });

        overlay.appendChild(streak);
        streaks.push(streak);
      }

      const wipe = document.createElement("div");

      Object.assign(wipe.style, {
        position: "absolute",
        inset: "0",
        opacity: "0",
        background:
          "linear-gradient(120deg, #03040a, #151522, #03040a)",
      });

      overlay.appendChild(wipe);
      document.body.appendChild(overlay);

      // Always animate the exact outer group supplied by modelRef.
      const resetModel = () => {
        gsap.killTweensOf(model.position);
        gsap.killTweensOf(model.rotation);
        gsap.killTweensOf(model.scale);

        model.position.set(home.x, home.y, home.z);
        model.rotation.set(home.rx, home.ry, home.rz);
        model.scale.set(1, 1, 1);
        model.updateMatrix();
      };

      const clearTimelines = () => {
        exitTimeline?.kill();
        entranceTimeline?.kill();

        exitTimeline = null;
        entranceTimeline = null;
      };

      const playEntrance = () => {
        clearTimelines();
        exiting = false;

        gsap.killTweensOf(overlay);
        gsap.killTweensOf(web);
        gsap.killTweensOf(wipe);
        streaks.forEach((s) => gsap.killTweensOf(s));

        gsap.set(overlay, { autoAlpha: 0 });
        gsap.set(web, { scaleX: 0 });
        gsap.set(wipe, { opacity: 0 });
        streaks.forEach((s) => gsap.set(s, { opacity: 0 }));

        gsap.killTweensOf(model.position);
        gsap.killTweensOf(model.rotation);
        gsap.killTweensOf(model.scale);

        model.position.set(home.x, 4, -1.5);
        model.rotation.set(-0.6, home.ry, 0);
        model.scale.setScalar(0.2);

        setActiveAction("SuperheroLanding");

        entranceTimeline = gsap.timeline({
          onComplete: () => setActiveAction("Idle"),
        });

        entranceTimeline.to(
          model.position,
          {
            x: home.x,
            y: home.y,
            z: home.z,
            duration: 1.4,
            ease: "power3.out",
          },
          0,
        );

        entranceTimeline.to(
          model.rotation,
          {
            x: 0,
            y: home.ry,
            z: 0,
            duration: 1.4,
            ease: "power3.out",
          },
          0,
        );

        entranceTimeline.to(
          model.scale,
          {
            x: 1,
            y: 1,
            z: 1,
            duration: 1.4,
            ease: "back.out(1.25)",
          },
          0,
        );
      };


      const playExit = () => {
        if (exiting) return;

        console.log("[SpiderMan] EXIT TRIGGER FIRED");
        exiting = true;

        clearTimelines();
        setActiveAction("Dash");

        gsap.killTweensOf(model.position);
        gsap.killTweensOf(model.rotation);
        gsap.killTweensOf(model.scale);

        exitTimeline = gsap.timeline({
          onComplete: () => {
            console.log("[SpiderMan] Exit animation completed");
            setActiveAction("Idle");
          },
        });

        // 1. Hold the initial pose so the player can see Spider-Man.
        exitTimeline.to({}, { duration: 0.6 });

        // 2. Crouch and lean forward slowly.
        exitTimeline.to(
          model.position,
          {
            x: home.x + 0.25,
            y: home.y - 0.12,
            z: home.z,
            duration: 1.0,
            ease: "power1.inOut",
          },
          0.6,
        );

        exitTimeline.to(
          model.rotation,
          {
            x: -0.2,
            y: home.ry - 0.3,
            z: -0.15,
            duration: 1.0,
            ease: "power1.inOut",
          },
          0.6,
        );

        // 3. Begin the web sweep while he prepares to launch.
        exitTimeline.set(overlay, { autoAlpha: 1 }, 1.2);

        exitTimeline.to(
          web,
          {
            scaleX: 1,
            duration: 1.2,
            ease: "power1.inOut",
          },
          1.2,
        );

        // 4. Move diagonally upward and away, not straight down.
        // This longer duration makes the Dash animation easier to see.
        exitTimeline.to(
          model.position,
          {
            x: home.x + 2.4,
            y: home.y + 1.0,
            z: home.z - 2.0,
            duration: 2.2,
            ease: "power1.inOut",
          },
          1.6,
        );

        exitTimeline.to(
          model.rotation,
          {
            x: -0.45,
            y: home.ry - 1.2,
            z: 0.35,
            duration: 2.2,
            ease: "power1.inOut",
          },
          1.6,
        );

        // Keep Spider-Man full-size during most of the movement.
        exitTimeline.to(
          model.scale,
          {
            x: 0.7,
            y: 0.7,
            z: 0.7,
            duration: 1.8,
            ease: "power1.inOut",
          },
          1.8,
        );

        // 5. Streaks accompany the launch rather than hiding it immediately.
        streaks.forEach((streak, i) => {
          exitTimeline!.fromTo(
            streak,
            {
              xPercent: -20,
              opacity: 0,
            },
            {
              xPercent: 180,
              opacity: 0.65,
              duration: 1.5,
              ease: "power1.inOut",
            },
            1.7 + i * 0.1,
          );

          exitTimeline!.to(
            streak,
            {
              opacity: 0,
              duration: 0.6,
            },
            2.8 + i * 0.1,
          );
        });

        // 6. Only shrink him near the end of the exit.
        exitTimeline.to(
          model.position,
          {
            x: home.x + 4.0,
            y: home.y + 1.8,
            z: home.z - 4.0,
            duration: 1.5,
            ease: "power2.in",
          },
          3.6,
        );

        exitTimeline.to(
          model.rotation,
          {
            x: -0.7,
            y: home.ry - Math.PI,
            z: 0.6,
            duration: 1.5,
            ease: "power1.inOut",
          },
          3.6,
        );

        exitTimeline.to(
          model.scale,
          {
            x: 0.001,
            y: 0.001,
            z: 0.001,
            duration: 1.2,
            ease: "power2.in",
          },
          3.9,
        );

        // 7. Reveal the next section with a slower cinematic wipe.
        exitTimeline.to(
          wipe,
          {
            opacity: 0.96,
            duration: 0.6,
            ease: "power1.inOut",
          },
          4.2,
        );

        exitTimeline.to(
          overlay,
          {
            autoAlpha: 0,
            duration: 1.0,
            ease: "power1.out",
          },
          4.9,
        );
      };


      camera.position.set(0, 1.6, 5.2);
      camera.lookAt(lookAtTarget.current);

      resetModel();
      setActiveAction("Idle");

      const trigger = ScrollTrigger.create({
        trigger: hero,
        start: "60% top",
        end: "bottom top",
        onEnter: playExit,
        onLeaveBack: playEntrance,
        markers: false,
      });

      cleanup = () => {
        trigger.kill();
        clearTimelines();

        gsap.killTweensOf(model.position);
        gsap.killTweensOf(model.rotation);
        gsap.killTweensOf(model.scale);
        gsap.killTweensOf(overlay);
        gsap.killTweensOf(web);
        gsap.killTweensOf(wipe);
        streaks.forEach((s) => gsap.killTweensOf(s));

        overlay.remove();
        resetModel();
      };

      ScrollTrigger.refresh();
    };

    initialize();

    return () => {
      cancelled = true;

      if (retryId !== undefined) {
        window.clearTimeout(retryId);
      }

      cleanup?.();
    };
  }, [modelRef, cameraRef, containerId]);

  return {
    activeAction,
    lookAtTarget,
  };
}

export default useScrollRig;
