import { useEffect, useRef } from "react";

const MESSAGE = "With Great Practice Comes Great Results.";
const WORDS = MESSAGE.split(" ");
let tetherIndex = 0;
const WORDS_WITH_LETTERS = WORDS.map((word) =>
  Array.from(word).map((letter) => ({ letter, index: tetherIndex++ })),
);
const TETHER_COUNT = tetherIndex;

type LetterStart = {
  x: number;
  y: number;
  z: number;
  rotation: number;
  scale: number;
};

/** Character fragments begin nearest the camera, then recede into the text plane. */
const letterStart = (index: number): LetterStart => ({
  x: (((index * 73) % 17) - 8) * 44,
  y: (((index * 41) % 11) - 5) * 37,
  z: 720 + (index % 5) * 75,
  rotation: (((index * 31) % 15) - 7) * 6.2,
  scale: 1.52 + (index % 4) * 0.12,
});

/** The statement is assembled by visible foreground strands that terminate on the live letter positions. */
export function About() {
  const stage = useRef<HTMLElement>(null);
  const statement = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let removeResizeListener: (() => void) | undefined;
    let killed = false;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (killed || !stage.current || !statement.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      ctx = gsap.context(() => {
        const letters = gsap.utils.toArray<HTMLElement>(".about-letter-cluster");
        const tetherGroups = gsap.utils.toArray<SVGGElement>(".about-tether-group");
        const threads = gsap.utils.toArray<SVGPathElement>(".about-tether-thread");

        /** Keep each strand's endpoint locked to the moving character throughout the pull. */
        const drawTethers = () => {
          const host = statement.current;
          if (!host) return;
          const frame = host.getBoundingClientRect();

          letters.forEach((letter, index) => {
            const group = tetherGroups[index];
            if (!group) return;
            const rect = letter.getBoundingClientRect();
            const targetX = rect.left - frame.left + rect.width * 0.5;
            const targetY = rect.top - frame.top + rect.height * 0.58;
            // A shared focal point in the middle of the screen reads as the viewer-facing
            // Z-axis. Strands burst out from this foreground point toward each letter.
            const sourceX = frame.width * 0.5 + (((index * 47) % 9) - 4) * 5;
            const sourceY = frame.height * 0.5 + (((index * 31) % 7) - 3) * 5;
            const deltaX = targetX - sourceX;
            const deltaY = targetY - sourceY;
            const bend = (index % 2 === 0 ? -1 : 1) * (42 + (index % 4) * 14);
            const silk = `M ${sourceX} ${sourceY} C ${sourceX + deltaX * 0.18 + bend} ${sourceY + deltaY * 0.18 - bend * 0.24}, ${targetX - deltaX * 0.28 - bend * 0.38} ${targetY - deltaY * 0.28 + bend * 0.24}, ${targetX} ${targetY}`;
            const ember = `M ${sourceX} ${sourceY} C ${sourceX + deltaX * 0.12 - bend * 0.3} ${sourceY + deltaY * 0.12 + bend * 0.18}, ${targetX - deltaX * 0.22 + bend * 0.2} ${targetY - deltaY * 0.22 - bend * 0.18}, ${targetX} ${targetY}`;

            group.querySelector<SVGPathElement>(".about-tether-silk")?.setAttribute("d", silk);
            group.querySelector<SVGPathElement>(".about-tether-ember")?.setAttribute("d", ember);
          });
        };

        letters.forEach((letter, index) => {
          gsap.set(letter, {
            ...letterStart(index),
            opacity: 0.08,
            filter: "blur(12px)",
            transformPerspective: 1350,
            transformOrigin: "50% 50%",
          });
        });
        drawTethers();
        gsap.set(tetherGroups, { opacity: 0, scale: 2.2, filter: "blur(8px)", transformOrigin: "50% 50%" });
        gsap.set(threads, { strokeDashoffset: 1000 });

        const pullTimeline = gsap.timeline({ paused: true });
        pullTimeline
          .to(tetherGroups, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.48, stagger: 0.012, ease: "expo.out" })
          .to(threads, { strokeDashoffset: 0, duration: 1.05, stagger: 0.02, ease: "power2.out" }, "<0.02")
          ;

        // Each character gets its own long pull tween. The strand endpoint is redrawn
        // on every frame, so the web and its letter visibly travel as one object.
        letters.forEach((letter, index) => {
          pullTimeline.to(
            letter,
            {
              x: 0,
              y: 0,
              z: 0,
              rotation: 0,
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
              duration: 2.05,
              ease: "power3.inOut",
              onStart: drawTethers,
              onUpdate: drawTethers,
              onComplete: drawTethers,
            },
            0.78 + (index % 8) * 0.07 + Math.floor(index / 8) * 0.035,
          );
        });

        pullTimeline.to(tetherGroups, { opacity: 0, duration: 0.7, stagger: 0.014, ease: "power2.in" }, ">0.42");

        ScrollTrigger.create({
          trigger: statement.current,
          start: "top 72%",
          once: true,
          onEnter: () => pullTimeline.play(0),
        });

        const statementFade = gsap.to(".about-statement", {
          opacity: 0.07,
          y: -34,
          filter: "blur(7px)",
          ease: "none",
          paused: true,
        });
        ScrollTrigger.create({
          trigger: stage.current,
          start: "center 42%",
          end: "bottom 30%",
          scrub: 1.2,
          animation: statementFade,
          invalidateOnRefresh: true,
        });

        gsap.fromTo(
          ".about-foot",
          { opacity: 0, y: 30, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            ease: "power2.out",
            scrollTrigger: { trigger: ".about-foot", start: "top 92%", end: "top 60%", scrub: 1 },
          },
        );

        removeResizeListener = () => {
          drawTethers();
          ScrollTrigger.refresh();
        };
        window.addEventListener("resize", removeResizeListener);
      }, stage);
    })();

    return () => {
      killed = true;
      removeResizeListener && window.removeEventListener("resize", removeResizeListener);
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={stage} className="relative overflow-hidden bg-void/70 py-[24vh]">
      <div className="mx-auto max-w-[86rem] px-6">
        <p className="label-mono mb-16">Arachnophobia</p>
        <h2
          ref={statement}
          className="about-statement relative max-w-none [perspective:1350px] [transform-style:preserve-3d] font-display text-[clamp(2.4rem,7vw,7rem)] font-extralight leading-[0.92] text-foreground/90"
          aria-label={MESSAGE}
        >
          <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible" aria-hidden="true">
            {Array.from({ length: TETHER_COUNT }, (_, index) => (
              <g key={index} className="about-tether-group">
                <path
                  className="about-tether-thread about-tether-silk"
                  fill="none"
                  stroke="#f2f4f5"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                />
                <path
                  className="about-tether-thread about-tether-ember"
                  fill="none"
                  stroke="#89929a"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                  opacity="0.72"
                />

              </g>
            ))}
          </svg>

          {WORDS_WITH_LETTERS.map((word, wordIndex) => (
            <span key={`word-${wordIndex}`} className="relative z-10 inline-block whitespace-nowrap" aria-hidden="true">
              {word.map(({ letter, index }) => (
                <span key={`${letter}-${index}`} className="about-letter-cluster relative inline-block will-change-transform">
                  {letter}
                </span>
              ))}
              {wordIndex < WORDS_WITH_LETTERS.length - 1 ? <span className="inline-block w-[0.28em]" /> : null}
            </span>
          ))}
        </h2>

        <div className="about-foot mt-[18vh] grid gap-12 border-t border-border pt-12 md:grid-cols-3">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Pursued B.E Computer science and design at RMK Engineering college.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Currently working as an XR Game Tester at VRARRI.
          </p>
          <div className="flex flex-col gap-4">
            <span className="label-mono">Currently</span>
            <p className="font-display text-2xl font-light text-foreground/85">
              Open for Game Dev Opportunities - 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
