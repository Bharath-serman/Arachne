import { useEffect, useState, useRef } from "react";
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
  const [activeAction, setActiveAction] = useState<SpidermanActionName>("Idle");
  const lookAtTarget = useRef(new THREE.Vector3(0, 1.2, 0));

  useEffect(() => {
    if (!modelRef.current || !cameraRef.current) return;

    const model = modelRef.current;
    const camera = cameraRef.current;
    const container = document.getElementById(containerId) || document.body;

    const ctx = gsap.context(() => {
      // Set initial superhero landmarks
      model.position.set(0, -0.2, 0);
      model.rotation.set(0, 0, 0);
      camera.position.set(0, 1.6, 5.2);

      // Master continuous scroll scrub timeline
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      // SECTION 1 -> 2: Transition to right side, turn, crouch
      masterTl.to(
        model.position,
        {
          x: 2.2,
          y: -0.4,
          z: 0.8,
          ease: "power2.inOut",
        },
        "about-phase"
      )
        .to(
          model.rotation,
          {
            x: 0.1,
            y: -Math.PI * 0.38,
            z: 0.05,
            ease: "power2.inOut",
          },
          "about-phase"
        )
        .to(
          camera.position,
          {
            x: 0.4,
            y: 1.5,
            z: 5.6,
            ease: "power2.inOut",
          },
          "about-phase"
        );

      // SECTION 2 -> 3: Swing across to left side in Web-Sling pose
      masterTl.to(
        model.position,
        {
          x: -2.3,
          y: 0.6,
          z: 1.1,
          ease: "power2.inOut",
        },
        "projects-phase"
      )
        .to(
          model.rotation,
          {
            x: 0.2,
            y: Math.PI * 0.42,
            z: -0.15,
            ease: "power2.inOut",
          },
          "projects-phase"
        )
        .to(
          camera.position,
          {
            x: -0.6,
            y: 1.7,
            z: 4.8,
            ease: "power2.inOut",
          },
          "projects-phase"
        );

      // SECTION 3 -> 4: Drop down to center into Superhero Landing
      masterTl.to(
        model.position,
        {
          x: 0,
          y: -0.85,
          z: 1.6,
          ease: "power3.out",
        },
        "contact-phase"
      )
        .to(
          model.rotation,
          {
            x: 0.15,
            y: 0,
            z: 0,
            ease: "power3.out",
          },
          "contact-phase"
        )
        .to(
          camera.position,
          {
            x: 0,
            y: 0.9,
            z: 3.8,
            ease: "power3.out",
          },
          "contact-phase"
        );

      // Collision triggers: Support both custom IDs and fallback sections
      const triggers: { selectors: string[]; action: SpidermanActionName }[] = [
        { selectors: ["#spiderman-hero", "#hero", "main > section:first-of-type"], action: "Idle" },
        { selectors: ["#spiderman-about", "#about", "#channels"], action: "Crouch" },
        { selectors: ["#spiderman-projects", "#cases", "#experience"], action: "WebSling" },
        { selectors: ["#spiderman-contact", "#contact", "footer"], action: "SuperheroLanding" },
      ];

      triggers.forEach(({ selectors, action }) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el) {
            ScrollTrigger.create({
              trigger: el,
              start: "top center",
              end: "bottom center",
              onEnter: () => setActiveAction(action),
              onEnterBack: () => setActiveAction(action),
            });
            break;
          }
        }
      });
    }, container);

    return () => {
      ctx.revert();
    };
  }, [modelRef, cameraRef, containerId]);

  return { activeAction, lookAtTarget };
}
