import { useState } from "react";

type Entry = {
  year: string;
  role: string;
  place: string;
  detail: string;
  tags: string[];
};

const ENTRIES: Entry[] = [
  {
    year: "2026",
    role: "XR Game Tester",
    place: "VRARRI",
    detail: "Tested and provided feedback on various XR games, ensuring optimal performance and user experience.",
    tags: ["XR", "Game Testing", "Quality Assurance"],
  },
  {
    year: "2024",
    role: "Software engineer Intern",
    place: "Chennai Metro Rail Limited — Chennai",
    detail: "Worked on the development of a web-based Travel Planner application for that shows the Fare and other details of the Chennai Metro Rail System.",
    tags: ["Travel Planner", "CMRL", "Website Features"],
  },
  {
    year: "2022",
    role: "B.E Computer Science and Design",
    place: "R.M.K Engineering College — Kavaraipettai",
    detail: "Pursued a Bachelor's degree in Computer Science and Design, focusing on software development, design principles, and emerging XR technologies.",
    tags: ["Computer Science", "Engineering", "Bachelor's Degree"],
  },
];

/** Generated facade positions stay inside the safe frame even when new timeline years are added. */
const WINDOWS = ENTRIES.map((_, visualIndex) => {
  const count = ENTRIES.length;
  const ratio = count <= 1 ? 0.5 : visualIndex / (count - 1);
  const columns = count <= 4 ? count : Math.ceil(Math.sqrt(count * 1.35));
  const rows = Math.ceil(count / columns);
  const col = visualIndex % columns;
  const row = Math.floor(visualIndex / columns);
  const xValue = count <= 4 ? 23 + ratio * 54 : (columns <= 1 ? 50 : 20 + (col / (columns - 1)) * 60);
  const yValue = count <= 4 ? 67 - ratio * 49 : (rows <= 1 ? 42 : 67 - (row / (rows - 1)) * 49);
  return {
    entryIndex: count - 1 - visualIndex,
    id: String(visualIndex + 1).padStart(2, "0"),
    x: `${xValue}%`,
    y: `${yValue}%`,
    xValue,
    yValue,
    start: 0.07 + ratio * 0.74,
    edge: xValue < 50 ? "left" as const : "right" as const,
  };
});

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function FacadeWeb({ progress, active }: { progress: number; active: number }) {
  const silkOpacity = 0.2 + progress * 0.6;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1200 860" aria-hidden="true">
      <defs>
        <filter id="facade-glow" x="-35%" y="-35%" width="170%" height="170%"><feGaussianBlur stdDeviation="6" result="glow" /><feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <linearGradient id="facade-silk" x1="0" x2="1"><stop stopColor="#8e979e" stopOpacity="0.22" /><stop offset="0.48" stopColor="#f2f5f6" stopOpacity="0.95" /><stop offset="1" stopColor="#7e888e" stopOpacity="0.3" /></linearGradient>
        <radialGradient id="facade-red"><stop stopColor="var(--ember)" stopOpacity="0.24" /><stop offset="1" stopColor="var(--ember)" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="64" y="42" width="1072" height="760" rx="4" fill="rgba(5,7,9,.6)" stroke="rgba(202,216,221,.24)" strokeWidth="2" />
      <rect x="64" y="42" width="1072" height="760" fill="url(#facade-red)" opacity={0.22 + progress * 0.42} />
      {Array.from({ length: 11 }, (_, index) => <line key={`v-${index}`} x1={70 + index * 106} y1="44" x2={70 + index * 106} y2="800" stroke="#a9b2b8" strokeWidth="1" opacity="0.13" />)}
      {Array.from({ length: 8 }, (_, index) => <line key={`h-${index}`} x1="66" y1={78 + index * 100} x2="1134" y2={78 + index * 100} stroke="#a9b2b8" strokeWidth="1" opacity="0.12" />)}
      <g fill="none" stroke="url(#facade-silk)" strokeLinecap="round" style={{ filter: "url(#facade-glow)" }}>
        <path d="M 74 736 C 182 608, 272 694, 388 526 S 572 406, 716 296 S 916 200, 1104 114" strokeWidth="2.8" opacity={silkOpacity} strokeDasharray="1800" strokeDashoffset={1800 * (1 - clamp((progress - 0.02) / 0.84))} />
        <path d="M 92 94 C 264 182, 272 408, 390 520 S 620 688, 1042 766" strokeWidth="1.4" opacity={silkOpacity * 0.74} strokeDasharray="1200" strokeDashoffset={1200 * (1 - clamp((progress - 0.16) / 0.68))} />
        <path d="M 116 774 C 320 612, 470 672, 720 292 S 936 160, 1120 86" strokeWidth="1.1" opacity={silkOpacity * 0.62} strokeDasharray="1300" strokeDashoffset={1300 * (1 - clamp((progress - 0.08) / 0.78))} />
        <path d="M 170 72 C 278 246, 234 396, 396 530 S 702 376, 984 718" strokeWidth="1.1" opacity={silkOpacity * 0.54} strokeDasharray="1300" strokeDashoffset={1300 * (1 - clamp((progress - 0.22) / 0.66))} />
        <path d="M 80 448 Q 418 274 746 340 T 1122 554" strokeWidth="1" opacity={silkOpacity * 0.5} strokeDasharray="7 12" />
      </g>
      {WINDOWS.map((window, index) => {
        const node = { x: 64 + (window.xValue / 100) * 1072, y: 42 + (window.yValue / 100) * 760 };
        const isActive = window.entryIndex === active;
        const t = clamp((progress - window.start) / 0.2);
        return <g key={window.id} opacity={0.22 + t * 0.78} style={{ transition: "opacity .35s ease" }}>
          <circle cx={node.x} cy={node.y} r={isActive ? 58 : 42} fill={isActive ? "url(#facade-red)" : "transparent"} opacity={isActive ? 0.95 : 0.25} />
          <circle cx={node.x} cy={node.y} r={isActive ? 14 : 8} fill={isActive ? "var(--ember)" : "#e8eff1"} style={{ filter: isActive ? "url(#facade-glow)" : undefined, transition: "all .35s ease" }} />
        </g>;
      })}
      <text x="86" y="776" className="label-mono" fontSize="15" letterSpacing="4" fill="#aeb7bc" opacity="0.7">FACADE / {ENTRIES.at(-1)?.year}</text>
      <text x="1114" y="74" textAnchor="end" className="label-mono" fontSize="15" letterSpacing="4" fill="#aeb7bc" opacity="0.7">ROOF / {ENTRIES[0]?.year}</text>
    </svg>
  );
}

/** A scroll-steered city facade where career chapters glow behind four webbed windows. */
export function Experience() {
  const [active, setActive] = useState(1);
  const entry = ENTRIES[active]!;

  return (
    <section id="experience" className="relative min-h-svh py-[8vh]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(46%_60%_at_46%_50%,rgba(192,217,223,0.085),transparent_74%),radial-gradient(30%_42%_at_76%_28%,rgba(171,33,21,0.18),transparent_74%)]" />
      <div className="flex min-h-[calc(100svh-16vh)] items-center overflow-hidden">
      <div className="mx-auto w-full max-w-[100rem] px-6 md:px-10">
        <div className="mb-[8vh] flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label-mono mb-4 text-mint/75">Timeline</p>
            <h2 className="experience-title font-display text-5xl font-extralight text-foreground/90 md:text-7xl">Experience</h2>
          </div>
          <span className="experience-readout label-mono max-w-xs text-foreground/60">Four sections.Scroll past the sections to open each chapter.</span>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.28fr_0.72fr] lg:gap-14">
          <div className="experience-city relative mx-auto w-full max-w-[73rem] [transform-style:preserve-3d]" style={{ transform: "perspective(1500px) rotateY(-13deg) rotateX(5deg) translate3d(-14px, 10px, -110px)" }}>
            <div className="relative aspect-[1.4/1] overflow-visible border border-white/10 bg-[#050709]/50 shadow-[0_0_100px_-36px_rgba(203,228,234,.35)] backdrop-blur-sm">
              <FacadeWeb progress={1} active={active} />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(112deg,transparent_12%,rgba(255,255,255,.035)_13%,transparent_15%,transparent_42%,rgba(175,207,216,.04)_43%,transparent_45%),linear-gradient(90deg,rgba(255,255,255,.02),transparent_24%,transparent_72%,rgba(255,255,255,.02))]" />
              {WINDOWS.map((window) => {
                const item = ENTRIES[window.entryIndex]!;
                const isActive = active === window.entryIndex;
                const density = Math.max(0, WINDOWS.length - 4);
                const windowWidth = `${Math.max(9.5, 18 - density * 1.25)}%`;
                const yearSize = `clamp(.95rem, ${Math.max(1.15, 2.2 - density * 0.12)}vw, ${Math.max(1.25, 2.25 - density * 0.1)}rem)`;
                return (
                  <button
                    key={window.id}
                    type="button"
                    onPointerEnter={() => setActive(window.entryIndex)}
                    onFocus={() => setActive(window.entryIndex)}
                    onClick={() => setActive(window.entryIndex)}
                    aria-pressed={isActive}
                    className={`group absolute z-10 min-w-[4.2rem] -translate-x-1/2 -translate-y-1/2 border text-left transition-[transform,border-color,background-color,box-shadow,opacity] duration-300 ${isActive ? "border-ember/90 bg-ember/[0.13] shadow-[0_0_32px_rgba(185,37,24,.42),inset_0_0_28px_rgba(225,237,240,.08)]" : "border-white/30 bg-[#07090b]/55 hover:border-verse/90 hover:bg-[#101519]/75"}`}
                    style={{ left: window.x, top: window.y, width: windowWidth, opacity: 1, transform: `translate(-50%, -50%) translateZ(${isActive ? 28 : 0}px) scale(${isActive ? 1.02 : 1})` }}
                  >
                    <span className="block border-b border-white/15 px-3 py-2 label-mono text-[9px] text-foreground/55">{window.id} / WINDOW</span>
                    <span className="block px-3 pt-3 font-display font-light leading-none text-foreground/95" style={{ fontSize: yearSize }}>{item.year}</span>
                    <span className="block px-3 pb-3 pt-2 label-mono text-[9px] text-foreground/60">{item.place.split(" — ")[0]}</span>
                    <span className={`pointer-events-none absolute -inset-[1px] border transition-opacity duration-300 ${isActive ? "border-ember/80 opacity-100" : "border-transparent opacity-0"}`} />
                  </button>
                );
              })}
              <div className="pointer-events-none absolute bottom-5 left-5 label-mono text-[9px] text-foreground/50">Bachelor Degree Holder</div>
            </div>
          </div>

          <aside className="experience-dossier relative">
            <div className="relative overflow-hidden border border-white/20 bg-void/72 px-7 py-8 backdrop-blur-md md:px-9 md:py-10" style={{ clipPath: "polygon(0 28px,28px 0,100% 0,100% calc(100% - 28px),calc(100% - 28px) 100%,0 100%)", boxShadow: "0 0 82px -30px rgba(220,234,239,.32), inset 0 0 76px -45px rgba(184,39,27,.66)" }}>
              <div className="scanlines pointer-events-none absolute inset-0 opacity-20" />
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/70 to-transparent" />
              <p className="exp-swap label-mono mb-4 text-mint/80">Experience / {entry.year}</p>
              <h3 className="exp-swap font-display text-4xl font-light leading-[0.95] text-foreground/95 md:text-5xl">{entry.role}</h3>
              <p className="exp-swap mt-4 label-mono text-foreground/55">{entry.place}</p>
              <p className="exp-swap mt-6 text-lg leading-relaxed text-muted-foreground">{entry.detail}</p>
              <ul className="exp-swap mt-7 flex flex-wrap gap-2">{entry.tags.map((tag) => <li key={tag} className="label-mono border border-white/20 px-3 py-1 text-foreground/65">{tag}</li>)}</ul>
              <span className="exp-swap pointer-events-none absolute -bottom-5 right-4 font-display text-8xl font-extralight tracking-[-.08em] text-foreground/[0.07]">{entry.year}</span>
            </div>
            <div className="mt-5 grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(4.5rem, 1fr))" }}>
              {WINDOWS.map((window) => {
                const item = ENTRIES[window.entryIndex]!;
                return <button key={item.year} type="button" onClick={() => setActive(window.entryIndex)} aria-pressed={active === window.entryIndex} className={`label-mono border px-2 py-2 transition-colors duration-300 ${active === window.entryIndex ? "border-ember/70 bg-ember/10 text-ember" : "border-white/15 text-foreground/55 hover:border-verse hover:text-signal"}`}>{item.year}</button>;
              })}
            </div>
          </aside>
        </div>
      </div>
      </div>
    </section>
  );
}
