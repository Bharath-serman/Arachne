import { useEffect, useRef } from "react";

/**
 * Oversized editorial title sequence. Lines drift horizontally on scroll and
 * settle with letter-spacing easing — film title card, not a card grid.
 */
export function GiantType() {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let killed = false;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (killed) return;

      ctx = gsap.context(() => {
        const st = {
          trigger: stage.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        } as const;

        gsap.fromTo(
          ".giant-a",
          {
            xPercent: 4,
            filter: "blur(12px)",
            opacity: 1,
            letterSpacing: "0.06em",
          },
          {
            xPercent: -5,
            filter: "blur(0px)",
            opacity: 1,
            letterSpacing: "-0.03em",
            ease: "power2.inOut",
            scrollTrigger: st,
          },
        );

        gsap.fromTo(
          ".giant-b",
          {
            xPercent: -6,
            filter: "blur(14px)",
            opacity: 1,
          },
          {
            xPercent: 4,
            filter: "blur(0px)",
            opacity: 0.9,
            ease: "power2.inOut",
            scrollTrigger: st,
          },
        );

        gsap.fromTo(
          ".giant-note",
          { opacity: 0, y: 40, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".giant-note",
              start: "top 85%",
              end: "top 45%",
              scrub: 1,
            },
          },
        );
      }, stage);
    })();

    return () => {
      killed = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={stage} className="relative h-[150vh] overflow-hidden">
      <div className="giant-word-stage sticky top-0 flex h-screen flex-col justify-center">
       <span className="giant-a giant-word giant-word-light display-giant block text-foreground/95 will-change-transform">
          DON'T FOLLOW ONE PATH
        </span>
        <span className="giant-b giant-word giant-word-ember display-giant block text-ember/85 will-change-transform">
          WEAVE YOUR OWN
        </span>
        <p className="giant-note mx-auto mt-16 max-w-md px-6 text-center text-lg text-muted-foreground">
          Every frame is captured through analog hardware, then rebuilt frame by
          frame until the signal feels alive again.
        </p>
      </div>
    </section>
  );
}
