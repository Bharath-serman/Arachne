import { useEffect, useRef, useState } from "react";
import { scrollState } from "@/lib/scroll-state";

const CODON_SEQUENCES = [
  "5'-GGC-CAA-GGC-CCG-TAT-GGT-3'",
  "SPIDROIN-1 [MaSp1] // ENCODED",
  "TENSILE STRENGTH: 1.45 GPa",
  "ELASTIC EXTENSION: 38.2%",
  "BETA-SHEET NANOCRYSTALS: 42%",
];

export function Hero() {
  const line1 = useRef<HTMLSpanElement>(null);
  const line2 = useRef<HTMLSpanElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  const [activeCodonIndex, setActiveCodonIndex] = useState(0);
  const [pulseCount, setPulseCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCodonIndex((prev) => (prev + 1) % CODON_SEQUENCES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const triggerResonance = () => {
    setPulseCount((c) => c + 1);
    window.dispatchEvent(new CustomEvent("dna-pulse", { detail: { count: pulseCount + 1 } }));
    scrollState.clickAt = performance.now();
  };

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
        const badges = gsap.utils.toArray<HTMLElement>(".hero-badge");

        gsap.set(words, {
          filter: "blur(18px)",
          opacity: 0,
          yPercent: 25,
          letterSpacing: "0.15em",
          scale: 1.05,
        });

        gsap.set(badges, {
          opacity: 0,
          y: -10,
          filter: "blur(6px)",
        });

        const tl = gsap.timeline({ delay: 0.25 });

        tl.to(badges, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          stagger: 0.1,
          ease: "power2.out",
        })
          .to(
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
            "-=0.8",
          )
          .fromTo(
            meta.current,
            { opacity: 0, y: 18, filter: "blur(10px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.3, ease: "power3.out" },
            "-=1.0",
          );

        // scroll-linked: type and hud recede gracefully into the 3D corridor
        gsap.to(".hero-type", {
          scale: 1.18,
          yPercent: -15,
          opacity: 0,
          filter: "blur(16px)",
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

  return (
    <section ref={stage} className="relative h-[220vh]" aria-label="Arachné Hero Experience">
      <div className="sticky top-0 flex h-screen flex-col justify-center px-6 md:px-12 pointer-events-none">
        <div className="hero-type relative mx-auto w-full max-w-[96rem] will-change-transform pointer-events-auto">

          {/* Main Title Heading */}
          <h1 className="font-display text-[clamp(2.4rem,7vw,7.8rem)] font-light leading-[0.9] tracking-[-0.04em] text-foreground/95">
            <span className="block overflow-visible">
              <span ref={line1} className="hero-word inline-block">
                BRIDGING REALITY
              </span>{" "}
              <span className="hero-word inline-block bg-gradient-to-r from-mint via-teal-300 to-cyan-400 bg-clip-text text-transparent font-normal">
                &amp; CODE
              </span>
            </span>
            <span className="mt-1 block md:pl-[6vw]">
              <span ref={line2} className="hero-word inline-block font-extralight text-foreground/80">
                THROUGH
              </span>{" "}
              <span className="hero-word inline-block font-serif italic text-ember">
                SILK &amp; GENETICS
              </span>
            </span>
          </h1>

          {/* Subtitle & Interactive DNA HUD Bar */}
          <div
            ref={meta}
            className="mt-10 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-end md:justify-between"
          >
            <div className="space-y-1.5 max-w-md">
              <p className="label-mono text-mint/90 flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-ember animate-pulse" />
                Transmission 01 — Biomimetic Studio
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-foreground/70">
                Interactive drag &amp; scroll responsive
                genetic strands that weave into the web matrix.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
