import { useEffect, useRef } from "react";

/** Blur-to-sharp, per-word settle. Not a fade-in: letters arrive from depth. */
export function Hero() {
  const line1 = useRef<HTMLSpanElement>(null);
  const line2 = useRef<HTMLSpanElement>(null);
  const meta = useRef<HTMLDivElement>(null);
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
        const words = gsap.utils.toArray<HTMLElement>(".hero-word");

        gsap.set(words, {
          filter: "blur(18px)",
          opacity: 0,
          yPercent: 22,
          letterSpacing: "0.18em",
          scale: 1.06,
        });

        gsap
          .timeline({ delay: 0.35 })
          .to(words, {
            filter: "blur(0px)",
            opacity: 0.92,
            yPercent: 0,
            letterSpacing: "-0.02em",
            scale: 1,
            duration: 2.1,
            ease: "expo.out",
            stagger: 0.11,
          })
          .fromTo(
            meta.current,
            { opacity: 0, y: 14, filter: "blur(8px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.4, ease: "power3.out" },
            "-=1.2",
          );

        // scroll-linked: type recedes into the environment as the camera pushes past
        gsap.to(".hero-type", {
          scale: 1.28,
          yPercent: -12,
          opacity: 0,
          filter: "blur(14px)",
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: stage.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.1,
          },
        });
      }, stage);
    })();

    return () => {
      killed = true;
      ctx?.revert();
    };
  }, []);

  // return (
  //   <section ref={stage} className="relative h-[200vh]">
  //     <div className="sticky top-0 flex h-screen items-center justify-center px-6">
  //       <div className="hero-type relative w-full max-w-[92rem] will-change-transform">
  //         <h1 className="display-xl text-center text-signal/85 md:text-left">
  //           <span className="block overflow-visible">
  //             <span ref={line1} className="hero-word inline-block">
  //               BRIDGING REALITY
  //             </span>{" "}
  //             <span className="hero-word inline-block text-mint/70"></span>
  //           </span>
  //           <span className="mt-2 block md:pl-[14vw]">
  //             <span ref={line2} className="hero-word inline-block">
  //               AND
  //             </span>{" "}
  //             <span className="hero-word inline-block italic">CODE</span>
  //           </span>
  //         </h1>

  //         <div
  //           ref={meta}
  //           className="mt-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
  //         >
  //           <p className="label-mono">Broadcast 01 — Studio reel</p>
  //           <p className="max-w-sm text-lg leading-snug text-muted-foreground">
  //             A studio for moving image, interface and atmosphere. Recorded on old
  //             equipment, transmitted on new signal.
  //           </p>
  //           <p className="label-mono">Scroll to travel ↓</p>
  //         </div>
  //       </div>
  //     </div>
  //   </section>
  // );
}
