
import { useEffect, useRef, useState } from "react";
import { scrollState } from "@/lib/scroll-state";

export function Hero() {
  const line1 = useRef<HTMLSpanElement>(null);
  const line2 = useRef<HTMLSpanElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLElement>(null);
  const heroType = useRef<HTMLDivElement>(null);

  const [activeCodonIndex, setActiveCodonIndex] = useState(0);
  const [pulseCount, setPulseCount] = useState(0);
  const triggerResonance = () => {
    setPulseCount((count) => {
      const nextCount = count + 1;

      window.dispatchEvent(
        new CustomEvent("dna-pulse", {
          detail: { count: nextCount },
        }),
      );

      return nextCount;
    });

    scrollState.clickAt = performance.now();
  };

  useEffect(() => {
    let context: { revert: () => void } | undefined;
    let cancelled = false;

    async function initializeAnimations() {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      if (cancelled || !stage.current) return;

      gsap.registerPlugin(ScrollTrigger);

      const stageElement = stage.current;
      const typeElement = heroType.current;
      const metaElement = meta.current;

      if (!typeElement || !metaElement) {
        console.warn("[Hero] Animation elements are not mounted.");
        return;
      }

      context = gsap.context(() => {
        // Scope selectors to this Hero instance.
        const words = [
          line1.current,
          line2.current,
          ...Array.from(
            stageElement.querySelectorAll<HTMLElement>(
              ".hero-word:not([data-primary-line])",
            ),
          ),
        ].filter(
          (element): element is HTMLElement => element !== null,
        );

        const badges =
          stageElement.querySelectorAll<HTMLElement>(".hero-badge");

        // Animate only elements that actually exist.
        if (words.length > 0) {
          gsap.set(words, {
            filter: "blur(18px)",
            opacity: 0,
            yPercent: 25,
            letterSpacing: "0.15em",
            scale: 1.05,
          });
        }

        if (badges.length > 0) {
          gsap.set(badges, {
            opacity: 0,
            y: -10,
            filter: "blur(6px)",
          });
        }

        const intro = gsap.timeline({ delay: 0.25 });

        if (badges.length > 0) {
          intro.to(badges, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.2,
            stagger: 0.1,
            ease: "power2.out",
          });
        }

        if (words.length > 0) {
          intro.to(
            words,
            {
              filter: "blur(0px)",
              opacity: 0.95,
              yPercent: 0,
              letterSpacing: "-0.02em",
              scale: 1,
              duration: 1.8,
              ease: "expo.out",
              stagger: 0.09,
            },
            badges.length > 0 ? "-=0.8" : 0,
          );
        }

        intro.fromTo(
          metaElement,
          {
            opacity: 0,
            y: 18,
            filter: "blur(10px)",
          },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.3,
            ease: "power3.out",
          },
          "-=1.0",
        );

        // Hero typography recedes as the user scrolls.
        gsap.to(typeElement, {
          scale: 1.18,
          yPercent: -15,
          opacity: 0,
          filter: "blur(16px)",
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: stageElement,
            start: "top top",
            end: "bottom top",
            scrub: 1.1,
            invalidateOnRefresh: true,
          },
        });
      }, stageElement);

      ScrollTrigger.refresh();
    }

    void initializeAnimations();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, []);

  return (
    <section
      ref={stage}
      id="spiderman-hero"
      className="relative h-[220vh]"
      aria-label="Arachné Hero Experience"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center px-6 md:px-12 pointer-events-none">
        <div
          ref={heroType}
          className="hero-type relative mx-auto w-full max-w-[96rem] will-change-transform pointer-events-auto"
        >
          <h1 className="font-display text-[clamp(2.4rem,7vw,7.8rem)] font-light leading-[0.9] tracking-[-0.04em] text-foreground/95">
            <span className="block overflow-visible">
              <span
                ref={line1}
                data-primary-line
                className="hero-word inline-block"
              >
                BRIDGING REALITY
              </span>{" "}
              <span className="hero-word inline-block bg-gradient-to-r from-mint via-teal-300 to-cyan-400 bg-clip-text text-transparent font-normal">
                &amp; CODE
              </span>
            </span>

            <span className="mt-1 block md:pl-[6vw]">
              <span
                ref={line2}
                data-primary-line
                className="hero-word inline-block font-extralight text-foreground/80"
              >
                THROUGH
              </span>{" "}
              <span className="hero-word inline-block font-serif italic text-ember">
                SILK &amp; GENETICS
              </span>
            </span>
          </h1>

          <div
            ref={meta}
            className="mt-10 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-end md:justify-between"
          >
          </div>
        </div>
      </div>
    </section>
  );
}
