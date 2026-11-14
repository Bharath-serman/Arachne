import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const LandingSpiderManCanvas = lazy(() =>
  import("@/components/spiderman/LandingSpiderManCanvas").then((module) => ({
    default: module.LandingSpiderManCanvas,
  })),
);

const NAME = "Bharath serman R";  //The Name the web pulls in the landing page.
const CHARACTERS = Array.from(NAME);

const REVEAL_TETHER_DURATION = 4_700;
const LEAVE_TETHER_DURATION = 2_250;

type LandingProps = {
  onEnter: () => void;
  onPrepare?: () => void;
};

type Start = { x: number; y: number; z: number; rotation: number; scale: number };
type TetherNode = {
  silk: SVGPathElement;
  echo: SVGPathElement;
  bend: number;
};
type TetherLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
};
type TetherNodes = {
  tethers: TetherNode[];
  layouts: TetherLayout[];
  frameWidth: number;
  frameHeight: number;
};
type TetherMotion = {
  mode: "reveal" | "leave";
  startedAt: number;
};

const letterStart = (index: number): Start => ({
  // Pull the letters farther through foreground space while keeping the
  // existing timing and tether animation unchanged.
  x: (((index * 61) % 17) - 8) * 50,
  y: (((index * 37) % 13) - 6) * 43,
  z: 760 + (index % 5) * 82,
  rotation: (((index * 23) % 15) - 7) * 5.4,
  scale: 1.38 + (index % 3) * 0.1,
});

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easePower3InOut = (value: number) => {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const easePower4In = (value: number) => 1 - Math.pow(1 - clamp01(value), 4);

const startStyle = (index: number): CSSProperties => {
  const start = letterStart(index);
  return {
    "--landing-index": index,
    "--landing-start-x": `${start.x}px`,
    "--landing-start-y": `${start.y}px`,
    "--landing-start-z": `${start.z}px`,
    "--landing-start-rotation": `${start.rotation}deg`,
    "--landing-start-scale": start.scale,
    "--landing-letter-reveal-delay": `${0.86 + index * 0.075}s`,
    "--landing-letter-leave-delay": `${0.02 + index * 0.024}s`,
  } as CSSProperties;
};

const tetherStyle = (index: number): CSSProperties => ({
  "--landing-group-reveal-delay": `${0.18 + index * 0.018}s`,
  "--landing-group-exit-delay": `${4.025 + index * 0.016}s`,
  "--landing-group-pull-delay": `${index * 0.018}s`,
  "--landing-silk-reveal-delay": `${0.2 + index * 0.025}s`,
  "--landing-echo-reveal-delay": `${0.2 + index * 0.025}s`,
  "--landing-silk-leave-delay": `${0.02 + index * 0.024}s`,
  "--landing-echo-leave-delay": `${0.02 + index * 0.024}s`,
} as CSSProperties);

const metaStyle = (index: number): CSSProperties => ({
  "--landing-meta-reveal-delay": `${4.065 + index * 0.08}s`,
} as CSSProperties);

/** First-screen station ID: every letter is pulled out of foreground space by its own silk tether. */
export function Landing({ onEnter, onPrepare }: LandingProps) {
  const stage = useRef<HTMLElement>(null);
  const name = useRef<HTMLHeadingElement>(null);
  const tetherFrame = useRef<number | null>(null);
  const tetherNodes = useRef<TetherNodes | null>(null);
  const tetherMotion = useRef<TetherMotion | null>(null);
  const [leaving, setLeaving] = useState(false);

  const drawTethersAt = useCallback((timestamp: number, motion: TetherMotion) => {
    const nodes = tetherNodes.current;
    if (!nodes) return;

    const elapsed = timestamp - motion.startedAt;
    nodes.layouts.forEach((layout, index) => {
      const tether = nodes.tethers[index];
      if (!tether) return;

      const start = letterStart(index);
      const delay = motion.mode === "reveal" ? 860 + index * 75 : 24 + index * 35;
      const duration = motion.mode === "reveal" ? 1_850 : 1_550;
      const progress = clamp01((elapsed - delay) / duration);
      const eased = motion.mode === "reveal" ? easePower3InOut(progress) : easePower4In(progress);
      const travel = motion.mode === "reveal" ? 1 - eased : eased;
      const x = start.x * travel;
      const y = start.y * travel;
      const z = start.z * travel;
      const rotation = start.rotation * travel * Math.PI / 180;
      const scale = 1 + (start.scale - 1) * travel;
      const perspectiveScale = 1350 / Math.max(160, 1350 - z);
      const centerX = layout.left + layout.width * 0.5;
      const centerY = layout.top + layout.height * 0.5;
      const localY = (layout.height * 0.58 - layout.height * 0.5) * scale * perspectiveScale;
      const targetX = centerX + x * perspectiveScale - localY * Math.sin(rotation);
      const targetY = centerY + y * perspectiveScale + localY * Math.cos(rotation);
      const sourceX = nodes.frameWidth * 0.5 + (((index * 41) % 9) - 4) * 6;
      const sourceY = nodes.frameHeight * 0.52 + (((index * 29) % 7) - 3) * 6;
      const dx = targetX - sourceX;
      const dy = targetY - sourceY;
      const silk = `M ${sourceX} ${sourceY} C ${sourceX + dx * .18 + tether.bend} ${sourceY + dy * .18 - tether.bend * .24}, ${targetX - dx * .27 - tether.bend * .34} ${targetY - dy * .27 + tether.bend * .24}, ${targetX} ${targetY}`;
      tether.silk.setAttribute("d", silk);
      tether.echo.setAttribute("d", silk);
    });
  }, []);

  const startTetherMotion = useCallback((mode: TetherMotion["mode"]) => {
    tetherMotion.current = { mode, startedAt: performance.now() };
    if (tetherFrame.current !== null) return;

    const tick = (timestamp: number) => {
      tetherFrame.current = null;
      const motion = tetherMotion.current;
      if (!motion) return;
      drawTethersAt(timestamp, motion);
      const duration = motion.mode === "reveal" ? REVEAL_TETHER_DURATION : LEAVE_TETHER_DURATION;
      if (timestamp - motion.startedAt < duration) {
        tetherFrame.current = window.requestAnimationFrame(tick);
      } else {
        tetherMotion.current = null;
      }
    };

    tetherFrame.current = window.requestAnimationFrame(tick);
  }, [drawTethersAt]);

  useEffect(() => {
    let removeResize: (() => void) | undefined;
    let killed = false;

    const root = stage.current;
    const host = name.current;
    if (!root || !host) return;

    const letters = Array.from(root.querySelectorAll<HTMLElement>(".landing-letter"));
    const groups = Array.from(root.querySelectorAll<SVGGElement>(".landing-tether-group"));
    const measureTethers = () => {
      const frame = host.getBoundingClientRect();
      tetherNodes.current = {
        tethers: groups.map((group, index) => ({
          silk: group.querySelector<SVGPathElement>(".landing-tether-silk")!,
          echo: group.querySelector<SVGPathElement>(".landing-tether-echo")!,
          bend: (index % 2 ? 1 : -1) * (36 + (index % 4) * 11),
        })),
        layouts: letters.map((letter) => {
          const rect = letter.getBoundingClientRect();
          return {
            left: rect.left - frame.left,
            top: rect.top - frame.top,
            width: rect.width,
            height: rect.height,
          };
        }),
        frameWidth: frame.width,
        frameHeight: frame.height,
      };
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("landing-overlay--reduced-motion");
      return () => root.classList.remove("landing-overlay--reduced-motion");
    }

    measureTethers();
    removeResize = () => {
      measureTethers();
      const motion = tetherMotion.current;
      if (motion) drawTethersAt(performance.now(), motion);
    };
    window.addEventListener("resize", removeResize);

    const revealFrame = window.requestAnimationFrame(() => {
      if (killed) return;
      root.classList.add("landing-overlay--reveal-active");
      startTetherMotion("reveal");
    });

    return () => {
      killed = true;
      window.cancelAnimationFrame(revealFrame);
      removeResize && window.removeEventListener("resize", removeResize);
      if (tetherFrame.current !== null) {
        window.cancelAnimationFrame(tetherFrame.current);
        tetherFrame.current = null;
      }
      tetherMotion.current = null;
      tetherNodes.current = null;
      root.classList.remove("landing-overlay--reveal-active", "landing-overlay--reduced-motion");
    };
  }, [drawTethersAt, startTetherMotion]);

  useEffect(() => {
    if (!leaving) return;

    let killed = false;
    let completed = false;
    const root = stage.current;
    if (!root) return;

    const finish = () => {
      if (killed || completed) return;
      completed = true;
      onEnter();
    };
    const finishTimer = window.setTimeout(finish, 3_050);

    root.classList.remove("landing-overlay--reveal-active");
    root.classList.add("landing-overlay--leave-active");
    startTetherMotion("leave");

    return () => {
      killed = true;
      window.clearTimeout(finishTimer);
      root.classList.remove("landing-overlay--leave-active");
      if (tetherFrame.current !== null) {
        window.cancelAnimationFrame(tetherFrame.current);
        tetherFrame.current = null;
      }
      tetherMotion.current = null;
    };
  }, [leaving, onEnter, startTetherMotion]);

  const enter = () => {
    if (leaving) return;
    onPrepare?.();
    setLeaving(true);
  };

  return (
    <section ref={stage} className={`landing-overlay fixed inset-0 z-[100] overflow-hidden bg-[#030405] ${leaving ? "pointer-events-none landing-overlay--leaving" : "scale-100"}`}
 aria-label="ARACHNÉ landing page">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(176,33,21,.2),transparent_28%),radial-gradient(ellipse_at_50%_50%,rgba(235,244,246,.045),transparent_58%),linear-gradient(150deg,#030405,#080708_56%,#020304)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(238,246,247,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(238,246,247,.012)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_at_center,black,transparent_76%)]" />
      <Suspense fallback={null}>
        <LandingSpiderManCanvas leaving={leaving} />
      </Suspense>
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-45" viewBox="0 0 1200 720" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke="#e8eff1" strokeLinecap="round">
          <path d="M -44 154 C 146 80, 238 282, 404 210 S 654 104, 784 272 S 1018 522, 1254 406" strokeWidth="1.1" opacity=".42" />
          <path d="M -52 512 C 154 398, 296 616, 472 458 S 676 196, 860 370 S 1080 638, 1250 510" strokeWidth="1.4" opacity=".46" strokeDasharray="7 13" />
          <path d="M 170 -20 C 286 164, 212 274, 390 346 S 616 504, 516 704" strokeWidth="1" opacity=".25" />
          <path d="M 1010 -20 C 916 166, 1052 280, 886 356 S 734 548, 900 738" strokeWidth="1" opacity=".25" />
        </g>
      </svg>

      <div className="relative z-10 flex h-full flex-col px-6 py-7 md:px-10 md:py-9">
        <header style={metaStyle(0)} className="landing-meta flex items-center justify-between opacity-0"><span className="font-display text-base font-light tracking-[.3em] text-foreground/85">ARACHNÉ</span><span className="label-mono text-foreground/55">Web ID / 2026</span></header>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[100rem] text-center">
            <p style={metaStyle(1)} className="landing-meta mb-9 label-mono text-mint/80 opacity-0">Unity Game Developer / XR Game Tester / AI Assisted Full Stack Developer</p>
            <h1 ref={name} className="relative mx-auto inline-block max-w-full whitespace-nowrap [perspective:1350px] [transform-style:preserve-3d] font-display text-[clamp(2rem,6.8vw,8.5rem)] font-extralight leading-[.86] tracking-[-.06em] text-foreground/95" aria-label={NAME}>
              <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible" aria-hidden="true">
                <defs><filter id="landing-silk-glow"><feGaussianBlur stdDeviation="3" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
                {CHARACTERS.map((_, index) => <g key={index} style={tetherStyle(index)} className="landing-tether-group" filter="url(#landing-silk-glow)"><path className="landing-tether-thread landing-tether-silk" fill="none" stroke="#f2f4f5" strokeWidth="1.7" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset="1000" /><path className="landing-tether-thread landing-tether-echo" fill="none" stroke="#8f9aa1" strokeWidth=".9" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset="1000" opacity=".72" /></g>)}
              </svg>
              {CHARACTERS.map((character, index) => <span key={`${character}-${index}`} style={startStyle(index)} className={`landing-letter relative z-10 inline-block will-change-transform ${character === " " ? "w-[.23em]" : ""}`} aria-hidden="true">{character === " " ? " " : character}</span>)}
            </h1>
          </div>
        </div>
        <footer style={metaStyle(2)} className="landing-meta flex flex-col gap-5 border-t border-white/15 pt-5 opacity-0 sm:flex-row sm:items-end sm:justify-between">
          <p className="label-mono max-w-xs text-foreground/55">Weaving real-time 3D, Extended Reality testing, and modern AI-driven web architectures.</p>
          <button type="button" onClick={enter} className="group inline-flex items-center justify-center gap-4 self-start border border-ember/70 px-5 py-3 label-mono text-ember transition-[border-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-foreground hover:text-foreground active:translate-y-0 sm:self-auto"><span>INTERTWINE</span></button>
        </footer>
      </div>
    </section>
  );
}
