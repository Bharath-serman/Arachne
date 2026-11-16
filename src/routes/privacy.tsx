import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ARACHNÉ Studio" },
      {
        name: "description",
        content:
          "Privacy policy and data transparency details for ARACHNÉ Studio web visitors and contact form communications.",
      },
    ],
  }),
  component: PrivacyPolicy,
});

/**
 * Generates realistic sagging spiderweb spiral arcs between radial spokes.
 */
function RealisticWebHub({
  cx,
  cy,
  radius,
  spokes = 16,
  rings = 7,
}: {
  cx: number;
  cy: number;
  radius: number;
  spokes?: number;
  rings?: number;
}) {
  const spokeAngles: number[] = [];
  const baseStep = (Math.PI * 2) / spokes;

  // Create natural irregular spoke angles
  for (let i = 0; i < spokes; i++) {
    const jitter = Math.sin(i * 3.7 + cx) * 0.15;
    spokeAngles.push(i * baseStep + jitter);
  }

  // Anchor endpoints for spokes
  const spokeEnds = spokeAngles.map((angle) => {
    const r = radius * (0.85 + Math.cos(angle * 4) * 0.15);
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      angle,
    };
  });

  // Generate sagging catenary spiral arcs between adjacent spokes
  const spiralPaths: string[] = [];
  for (let rIdx = 1; rIdx <= rings; rIdx++) {
    const ringRatio = Math.pow(rIdx / rings, 1.2); // Exponential spacing (closer near center)
    const sagAmount = 8 + ringRatio * 18;

    for (let i = 0; i < spokes; i++) {
      const nextIdx = (i + 1) % spokes;
      // Skip some random segments to simulate natural web tears
      if ((i * rIdx + cx) % 7 === 0) continue;

      const p1Angle = spokeAngles[i] ?? 0;
      const p2Angle = spokeAngles[nextIdx] ?? 0;

      const x1 = cx + Math.cos(p1Angle) * radius * ringRatio;
      const y1 = cy + Math.sin(p1Angle) * radius * ringRatio;
      const x2 = cx + Math.cos(p2Angle) * radius * ringRatio;
      const y2 = cy + Math.sin(p2Angle) * radius * ringRatio;

      // Sag control point pulling inward towards center (natural gravity bow)
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const dirX = cx - midX;
      const dirY = cy - midY;
      const len = Math.hypot(dirX, dirY) || 1;

      const ctrlX = midX + (dirX / len) * sagAmount;
      const ctrlY = midY + (dirY / len) * sagAmount;

      spiralPaths.push(
        `M ${x1.toFixed(1)},${y1.toFixed(1)} Q ${ctrlX.toFixed(1)},${ctrlY.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`,
      );
    }
  }

  return (
    <g className="realistic-web-hub">
      {/* Radial Anchor Lines stretching out */}
      {spokeEnds.map((end, i) => (
        <line
          key={`spoke-${i}`}
          x1={cx}
          y1={cy}
          x2={end.x}
          y2={end.y}
          stroke="#d1d5db"
          strokeWidth="0.9"
          strokeOpacity="0.32"
        />
      ))}

      {/* Sagging Spiral Capture Threads */}
      {spiralPaths.map((d, i) => (
        <path
          key={`ring-${i}`}
          d={d}
          fill="none"
          stroke={i % 3 === 0 ? "#ffffff" : i % 2 === 0 ? "#e5e7eb" : "#9ca3af"}
          strokeWidth="0.85"
          strokeOpacity={i % 4 === 0 ? "0.38" : "0.22"}
        />
      ))}

      {/* Small Glistening Dew Nodes */}
      {spokeEnds
        .filter((_, idx) => idx % 3 === 0)
        .map((end, i) => (
          <circle
            key={`dew-${i}`}
            cx={cx + (end.x - cx) * 0.6}
            cy={cy + (end.y - cy) * 0.6}
            r="1.8"
            fill="#ffffff"
            fillOpacity="0.45"
          />
        ))}
    </g>
  );
}

/**
 * Detailed corner spiderweb with radial spokes and sagging capture threads.
 */
function CornerSpiderWeb({
  className = "",
  orientation = "top-left",
  size = 56,
}: {
  className?: string;
  orientation?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size?: number;
}) {
  const spokes = 5;
  const rings = 4;
  const isRight = orientation.includes("right");
  const isBottom = orientation.includes("bottom");

  const originX = isRight ? size : 0;
  const originY = isBottom ? size : 0;

  const angleStart = isRight
    ? isBottom
      ? Math.PI
      : Math.PI / 2
    : isBottom
      ? (Math.PI * 3) / 2
      : 0;

  const spokePaths: { x2: number; y2: number }[] = [];
  for (let i = 0; i <= spokes; i++) {
    const angle = angleStart + (i / spokes) * (Math.PI / 2);
    spokePaths.push({
      x2: originX + Math.cos(angle) * (size * 0.96),
      y2: originY + Math.sin(angle) * (size * 0.96),
    });
  }

  const arcPaths: string[] = [];
  for (let r = 1; r <= rings; r++) {
    const ratio = Math.pow(r / rings, 1.25);
    const sag = 2.5 + ratio * 5.5;
    for (let i = 0; i < spokes; i++) {
      const a1 = angleStart + (i / spokes) * (Math.PI / 2);
      const a2 = angleStart + ((i + 1) / spokes) * (Math.PI / 2);

      const x1 = originX + Math.cos(a1) * (size * ratio);
      const y1 = originY + Math.sin(a1) * (size * ratio);
      const x2 = originX + Math.cos(a2) * (size * ratio);
      const y2 = originY + Math.sin(a2) * (size * ratio);

      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const dirX = originX - midX;
      const dirY = originY - midY;
      const len = Math.hypot(dirX, dirY) || 1;

      const ctrlX = midX + (dirX / len) * sag;
      const ctrlY = midY + (dirY / len) * sag;

      arcPaths.push(
        `M ${x1.toFixed(1)},${y1.toFixed(1)} Q ${ctrlX.toFixed(1)},${ctrlY.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`,
      );
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`pointer-events-none absolute overflow-visible ${className}`}
      aria-hidden="true"
    >
      <g stroke="#ffffff" fill="none">
        {spokePaths.map((spoke, idx) => (
          <line
            key={`spoke-${idx}`}
            x1={originX}
            y1={originY}
            x2={spoke.x2}
            y2={spoke.y2}
            stroke="#d1d5db"
            strokeWidth="0.8"
            strokeOpacity="0.34"
          />
        ))}
        {arcPaths.map((d, idx) => (
          <path
            key={`arc-${idx}`}
            d={d}
            strokeWidth="0.75"
            strokeOpacity={idx % 2 === 0 ? "0.32" : "0.22"}
          />
        ))}
        {/* Subtle dew drop on spoke */}
        {spokePaths[2] && (
          <circle
            cx={originX + (spokePaths[2].x2 - originX) * 0.65}
            cy={originY + (spokePaths[2].y2 - originY) * 0.65}
            r="1.4"
            fill="#ffffff"
            opacity="0.65"
            className="animate-web-dew"
          />
        )}
      </g>
    </svg>
  );
}

/**
 * Hanging kicker badge suspended from overhead silk threads.
 */
function HangingHeroKicker() {
  return (
    <div className="group relative inline-flex items-center gap-3 pt-3 pb-1">
      {/* Overhead anchor thread */}
      <svg
        className="pointer-events-none absolute -top-3 left-0 w-56 h-6 overflow-visible"
        viewBox="0 0 220 24"
        aria-hidden="true"
      >
        <path
          d="M 0 4 Q 110 10 220 5"
          fill="none"
          stroke="#f3a7a7"
          strokeWidth="0.75"
          strokeOpacity="0.32"
        />
        <path d="M 12 4 L 14 20" stroke="#a7f3d0" strokeWidth="0.85" strokeOpacity="0.5" />
        <circle cx="14" cy="20" r="1.3" fill="#a7f3d0" opacity="0.85" className="animate-web-dew" />
        <path d="M 120 7 L 122 20" stroke="#a7f3d0" strokeWidth="0.65" strokeOpacity="0.38" />
        <circle cx="122" cy="20" r="1.1" fill="#a7f3d0" opacity="0.7" />
      </svg>
      <span className="label-mono text-xs font-semibold tracking-[0.2em] text-mint">
        INTO THE POLICY SECTION
      </span>
    </div>
  );
}

/**
 * Hero H1 Heading with the exact same stylish hanging web design as the subheadings:
 * overhead sagging silk strands, corner web, slanted drop cords, word-level hanging,
 * and bottom trailing threads with dew droplets.
 */
function HangingHeroHeading() {
  const words = ["PRIVACY", "POLICY"];
  const wordOffsets = [-4, 8];
  const wordTilts = [-3, 4];
  const cordSlants = [-12, 14];

  return (
    <div className="group relative pt-10 pb-6 inline-block max-w-full select-none">
      {/* Overhead Spiderweb Suspension Strands */}
      <svg
        className="pointer-events-none absolute top-0 left-0 right-0 w-full h-12 overflow-visible"
        viewBox="0 0 640 48"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Overhead sagging, drooping anchor thread line */}
        <path
          d="M 0 8 Q 160 26 320 10 Q 480 28 640 12"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.9"
          strokeOpacity="0.35"
        />
        <path
          d="M 20 14 Q 180 4 340 22 Q 500 6 620 18"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="0.65"
          strokeOpacity="0.25"
        />

        {/* Slanted drop cords to word positions */}
        <path
          d="M 120 10 Q 140 28 150 46"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.1"
          strokeOpacity="0.55"
        />
        <path
          d="M 280 12 Q 270 28 260 46"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="0.75"
          strokeOpacity="0.32"
        />
        <path
          d="M 420 12 Q 440 30 450 46"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.1"
          strokeOpacity="0.55"
        />

        {/* Tangled catenary loops bridging points */}
        <path
          d="M 10 46 Q 80 26 150 46"
          fill="none"
          stroke="#d1d5db"
          strokeWidth="0.75"
          strokeOpacity="0.3"
        />
        <path
          d="M 150 46 Q 205 28 260 46"
          fill="none"
          stroke="#d1d5db"
          strokeWidth="0.75"
          strokeOpacity="0.3"
        />
        <path
          d="M 260 46 Q 355 24 450 46"
          fill="none"
          stroke="#d1d5db"
          strokeWidth="0.75"
          strokeOpacity="0.3"
        />
        <path
          d="M 450 46 Q 545 28 630 46"
          fill="none"
          stroke="#d1d5db"
          strokeWidth="0.75"
          strokeOpacity="0.3"
        />

        {/* Dew drops at attachment junctions */}
        <circle cx="150" cy="44" r="2.2" fill="#ffffff" opacity="0.9" className="animate-web-dew" />
        <circle cx="260" cy="44" r="1.6" fill="#a7f3d0" opacity="0.8" />
        <circle
          cx="450"
          cy="44"
          r="2.2"
          fill="#ffffff"
          opacity="0.9"
          className="animate-web-dew-alt"
        />
      </svg>

      {/* Hanging Content Box with physics sway */}
      <div className="relative animate-web-hang-sway transition-transform duration-500 ease-out group-hover:rotate-[0.6deg] group-hover:translate-y-1">
        {/* Corner Web woven at top-left edge */}
        <CornerSpiderWeb orientation="top-left" size={60} className="-top-5 -left-7 opacity-65" />

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-foreground drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] flex flex-wrap items-center gap-x-6 gap-y-4">
          {words.map((word, wIdx) => {
            const yOff = wordOffsets[wIdx % wordOffsets.length] ?? 0;
            const rot = wordTilts[wIdx % wordTilts.length] ?? 0;
            const slant = cordSlants[wIdx % cordSlants.length] ?? 0;

            return (
              <span
                key={`hero-word-${wIdx}`}
                className="relative inline-flex flex-col items-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:text-white"
                style={{
                  marginTop: `${yOff}px`,
                  transform: `rotate(${rot}deg)`,
                }}
              >
                {/* Micro drop thread attached to word */}
                <svg
                  className="pointer-events-none w-5 h-5 overflow-visible -mb-1"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    d={`M ${10 + slant * 0.4} 0 Q 10 10 10 20`}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="0.9"
                    strokeOpacity="0.45"
                  />
                  <circle cx="10" cy="18" r="1.4" fill="#ffffff" opacity="0.85" />
                </svg>
                <span>{word}</span>
              </span>
            );
          })}
        </h1>

        {/* Tangled bottom slack silk threads with dangling dew droplets */}
        <svg
          className="pointer-events-none absolute -bottom-7 left-10 w-56 h-10 overflow-visible"
          viewBox="0 0 224 40"
          aria-hidden="true"
        >
          <path
            d="M 8 0 Q 32 24 64 6 Q 110 30 160 4 Q 190 26 220 2"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.75"
            strokeOpacity="0.35"
          />
          <path
            d="M 32 16 Q 36 28 34 34"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.45"
          />
          <circle
            cx="34"
            cy="35"
            r="1.6"
            fill="#ffffff"
            opacity="0.85"
            className="animate-web-dew"
          />
          <path
            d="M 110 20 Q 112 30 110 36"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.75"
            strokeOpacity="0.4"
          />
          <circle
            cx="110"
            cy="37"
            r="1.4"
            fill="#a7f3d0"
            opacity="0.8"
            className="animate-web-dew-alt"
          />
          <path
            d="M 190 18 Q 192 28 190 34"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.75"
            strokeOpacity="0.4"
          />
          <circle cx="190" cy="35" r="1.5" fill="#ffffff" opacity="0.8" />
        </svg>
      </div>
    </div>
  );
}

/**
 * ARACHNÉ Studio Security & Governance Telemetry Widget with hanging mechanical spider.
 * Fills the hero section right side.
 */
function HeroGovernanceWidget() {
  return (
    <div className="relative group w-full max-w-lg lg:ml-auto">
      {/* Spiderweb anchor strands connecting card to background and top edges */}
      <svg
        className="pointer-events-none absolute -top-10 -right-6 w-80 h-36 overflow-visible"
        viewBox="0 0 320 144"
        aria-hidden="true"
      >
        <path
          d="M 40 144 Q 140 50 320 0"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="0.85"
          strokeOpacity="0.34"
        />
        <path
          d="M 120 144 Q 220 70 320 40"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.75"
          strokeOpacity="0.4"
        />
        <path
          d="M 0 70 Q 160 30 320 15"
          fill="none"
          stroke="#d1d5db"
          strokeWidth="0.65"
          strokeOpacity="0.25"
        />
        <circle cx="140" cy="50" r="1.6" fill="#ffffff" opacity="0.8" className="animate-web-dew" />
        <circle cx="220" cy="70" r="1.4" fill="#a7f3d0" opacity="0.75" />
      </svg>

      {/* Main Telemetry Box */}
      <div className="relative rounded-lg border border-white/20 bg-black/65 p-6 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-500 group-hover:border-white/35 group-hover:shadow-[0_0_35px_rgba(255,70,40,0.18)]">
        {/* Corner spiderwebs inside the card */}
        <CornerSpiderWeb orientation="top-right" size={60} className="-top-3 -right-3 opacity-60" />
        <CornerSpiderWeb
          orientation="bottom-left"
          size={46}
          className="-bottom-3 -left-3 opacity-40"
        />

        {/* Card Header with Status */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="label-mono text-xs font-semibold text-mint tracking-[0.2em]">
              Datas Used in this site
            </span>
          </div> 
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded border border-white/10 bg-white/[0.03] p-3">
            <span className="label-mono text-[9px] text-foreground/50 block">MAIL SENDING...</span>
            <span className="font-mono text-xs font-semibold text-foreground/90 mt-0.5 flex items-center gap-1.5">
              RESEND API
            </span>
          </div>
          <div className="rounded border border-white/10 bg-white/[0.03] p-3">
            <span className="label-mono text-[9px] text-foreground/50 block">WEBGL MEMORY</span>
            <span className="font-mono text-xs font-semibold text-foreground/90 mt-0.5 flex items-center gap-1.5">
              LOCAL ZERO-LOG
            </span>
          </div>
          <div className="rounded border border-white/10 bg-white/[0.03] p-3">
            <span className="label-mono text-[9px] text-foreground/50 block">COOKIES / ADS</span>
            <span className="font-mono text-xs font-semibold text-ember mt-0.5 flex items-center gap-1.5">
              100% EXCLUDED
            </span>
          </div>
          <div className="rounded border border-white/10 bg-white/[0.03] p-3">
            <span className="label-mono text-[9px] text-foreground/50 block">COMPLIANCE</span>
            <span className="font-mono text-xs font-semibold text-foreground/90 mt-0.5 flex items-center gap-1.5">
              GDPR & CCPA
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between text-[10px] label-mono text-foreground/60 pt-2 border-t border-white/10">
          <span>ARACHNÉ SILK PROTOCOL</span>
          <span className="text-mint font-semibold">STATUS: VERIFIED</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Section H2 Heading suspended from overhead spiderweb harness with corner webbing,
 * individual word drop threads, glistening dew nodes, and interactive hover sway.
 */
function HangingSectionHeading({ number, title }: { number: string; title: string }) {
  const words = title.split(" ");
  // Messy offsets & tilts per word in section headings
  const wordOffsets = [-6, 12, -4, 10, -8, 8, -3, 6];
  const wordTilts = [-4, 6, -3, 5, -5, 4, -2, 3];
  const cordSlants = [-12, 14, -8, 16, -10, 10, -6, 8];

  return (
    <div className="group relative pt-8 pb-8 mb-2 inline-block max-w-full select-none">
      {/* Chaotic Overhead Spiderweb Suspension Strands */}
      <svg
        className="pointer-events-none absolute top-0 left-0 right-0 w-full h-10 overflow-visible"
        viewBox="0 0 640 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Overhead sagging, drooping anchor thread line */}
        <path
          d="M 0 6 Q 160 22 320 8 Q 480 24 640 10"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.85"
          strokeOpacity="0.32"
        />
        <path
          d="M 20 12 Q 180 2 340 18 Q 500 4 620 16"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="0.6"
          strokeOpacity="0.22"
        />

        {/* Slanted suspension cord to number badge */}
        <path
          d="M 14 6 Q 24 22 28 38"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1.1"
          strokeOpacity="0.55"
        />
        {/* Tangled crossing thread */}
        <path
          d="M 55 8 Q 40 22 28 38"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="0.75"
          strokeOpacity="0.3"
        />

        {/* Slanted drop cords to word positions */}
        <path
          d="M 140 8 Q 155 24 160 38"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.9"
          strokeOpacity="0.45"
        />
        <path
          d="M 290 10 Q 280 24 270 38"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.85"
          strokeOpacity="0.4"
        />
        <path
          d="M 440 12 Q 455 26 460 38"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="0.8"
          strokeOpacity="0.35"
        />

        {/* Tangled catenary loops bridging points */}
        <path
          d="M 28 38 Q 94 24 160 38"
          fill="none"
          stroke="#d1d5db"
          strokeWidth="0.65"
          strokeOpacity="0.28"
        />
        <path
          d="M 160 38 Q 215 22 270 38"
          fill="none"
          stroke="#d1d5db"
          strokeWidth="0.65"
          strokeOpacity="0.28"
        />
        <path
          d="M 270 38 Q 365 20 460 38"
          fill="none"
          stroke="#d1d5db"
          strokeWidth="0.65"
          strokeOpacity="0.28"
        />

        {/* Dew drops at attachment junctions */}
        <circle cx="28" cy="36" r="2.0" fill="#ffffff" opacity="0.85" className="animate-web-dew" />
        <circle cx="160" cy="36" r="1.5" fill="#a7f3d0" opacity="0.75" />
        <circle cx="270" cy="36" r="1.4" fill="#ffffff" opacity="0.7" />
        <circle
          cx="460"
          cy="36"
          r="1.5"
          fill="#ffffff"
          opacity="0.7"
          className="animate-web-dew-alt"
        />
      </svg>

      {/* Hanging Content Box with physics sway */}
      <div className="relative animate-web-hang-sway transition-transform duration-500 ease-out group-hover:rotate-[0.6deg] group-hover:translate-y-1">
        {/* Corner Web woven around the section number */}
        <CornerSpiderWeb orientation="top-left" size={48} className="-top-4 -left-5 opacity-60" />

        <div className="flex flex-wrap items-center gap-4">
          <span
            className="relative label-mono text-ember font-semibold text-sm drop-shadow-[0_0_8px_rgba(255,90,30,0.35)] transition-transform duration-300 inline-block"
            style={{ transform: "rotate(-6deg)" }}
          >
            {number}
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-light text-foreground drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] inline-flex flex-wrap items-center gap-x-2.5 gap-y-3">
            {words.map((word, wIdx) => {
              const yOff = wordOffsets[wIdx % wordOffsets.length] ?? 0;
              const rot = wordTilts[wIdx % wordTilts.length] ?? 0;
              const slant = cordSlants[wIdx % cordSlants.length] ?? 0;

              return (
                <span
                  key={`word-${wIdx}`}
                  className="relative inline-flex flex-col items-center transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:text-white"
                  style={{
                    marginTop: `${yOff}px`,
                    transform: `rotate(${rot}deg)`,
                  }}
                >
                  {/* Micro drop thread attached to word */}
                  <svg
                    className="pointer-events-none w-4 h-4 overflow-visible -mb-1"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d={`M ${8 + slant * 0.4} 0 Q 8 8 8 16`}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="0.8"
                      strokeOpacity="0.4"
                    />
                    <circle cx="8" cy="15" r="1.2" fill="#ffffff" opacity="0.8" />
                  </svg>
                  <span>{word}</span>
                </span>
              );
            })}
          </h2>
        </div>

        {/* Tangled bottom slack silk threads with dangling dew droplets */}
        <svg
          className="pointer-events-none absolute -bottom-6 left-8 w-44 h-8 overflow-visible"
          viewBox="0 0 176 32"
          aria-hidden="true"
        >
          <path
            d="M 6 0 Q 24 22 48 4 Q 80 26 120 2"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.7"
            strokeOpacity="0.32"
          />
          <path
            d="M 24 16 Q 28 26 26 30"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.75"
            strokeOpacity="0.4"
          />
          <circle
            cx="26"
            cy="31"
            r="1.5"
            fill="#ffffff"
            opacity="0.8"
            className="animate-web-dew"
          />
          <path
            d="M 80 18 Q 82 27 80 31"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.7"
            strokeOpacity="0.35"
          />
          <circle cx="80" cy="31" r="1.3" fill="#a7f3d0" opacity="0.75" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Sidebar SECTION INDEX heading hanging from top spiderweb tethers.
 */
function HangingSidebarHeading() {
  return (
    <div className="group relative pt-4 pb-1 inline-block">
      {/* Mini suspension threads */}
      <svg
        className="pointer-events-none absolute top-0 left-0 right-0 w-full h-5 overflow-visible"
        viewBox="0 0 160 20"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M 0 3 Q 80 8 160 4"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.7"
          strokeOpacity="0.3"
        />
        <path d="M 16 4 L 14 18" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.45" />
        <path d="M 140 4 L 142 18" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.45" />
        <circle cx="14" cy="18" r="1.3" fill="#ffffff" opacity="0.7" className="animate-web-dew" />
        <circle
          cx="142"
          cy="18"
          r="1.3"
          fill="#ffffff"
          opacity="0.7"
          className="animate-web-dew-alt"
        />
      </svg>

      <div className="relative animate-web-hang-sway transition-transform duration-500 group-hover:rotate-[0.8deg]">
        <CornerSpiderWeb orientation="top-left" size={28} className="-top-2 -left-2 opacity-45" />
        <span className="label-mono text-xs font-semibold text-ember">SECTION INDEX</span>
      </div>
    </div>
  );
}

function PrivacyPolicy() {
  const navigate = useNavigate();

  const handleReturn = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <main className="relative min-h-svh bg-[#040405] text-foreground overflow-x-hidden">
      {/* Quiet Background Atmosphere */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(181,38,24,.15),transparent_45%),linear-gradient(180deg,#040405,#080607_63%,#030405)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(238,246,247,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(238,246,247,.015)_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_at_center,black,transparent_85%)]" />

      {/* Realistic & Subtle Grey/White Spider Web SVG Overlay */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-30 overflow-visible z-0"
        viewBox="0 0 1400 1200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="subtleSilkGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#subtleSilkGlow)">
          {/* Primary Top-Left Realistic Web Hub */}
          <RealisticWebHub cx={280} cy={220} radius={460} spokes={16} rings={9} />

          {/* Secondary Bottom-Right Realistic Web Hub */}
          <RealisticWebHub cx={1120} cy={740} radius={520} spokes={18} rings={10} />

          {/* Taut Long Frame Anchor Filaments connecting web to corners */}
          <g fill="none" stroke="#e5e7eb" strokeWidth="0.9" strokeOpacity="0.25">
            <path d="M -50,140 Q 280,220 700,-50" />
            <path d="M -50,620 Q 520,420 1450,180" />
            <path d="M 220,1250 Q 800,680 1450,1100" />
            <path d="M 680,1250 Q 1120,740 1450,520" />
          </g>
        </g>
      </svg>

      {/* Content Container (z-10 above atmosphere & webs) */}
      <div className="relative z-10">
        {/* Header */}
        <header className="mx-auto flex max-w-[90rem] items-center justify-between px-6 py-8 md:px-10">
          <Link
            to="/"
            className="font-display text-xl font-light tracking-[0.3em] text-foreground/90 transition-colors hover:text-ember"
          >
            ARACHNÉ
          </Link>
          <button
            onClick={handleReturn}
            type="button"
            className="label-mono text-xs text-foreground/70 transition-colors hover:text-mint cursor-pointer"
          >
            Return to Home
          </button>
        </header>

        {/* Hero Header */}
        <section className="mx-auto max-w-[90rem] px-6 pt-8 pb-12 md:px-10 md:pt-14 md:pb-16 border-b border-white/15">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* Left Column: Letter-by-letter Hanging Heading and Context */}
            <div className="lg:col-span-7">
              <div>
                <HangingHeroKicker />
              </div>
              <div className="mt-2">
                <HangingHeroHeading />
              </div>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/90 md:text-lg font-light">
                Detailed breakdown of data collected across the ARACHNÉ website, including contact form submissions.
              </p>
              <p className="mt-2 label-mono text-xs text-foreground/60">
                Last Updated: November 2026
              </p>
            </div>

            {/* Right Column: Marked Empty Region Filled with Studio Governance & Spider Telemetry */}
            <div className="lg:col-span-5">
              <HeroGovernanceWidget />
            </div>
          </div>
        </section>

        {/* Policy Content Grid */}
        <section className="mx-auto max-w-[90rem] px-6 py-12 md:px-10 md:py-20">
          <div className="grid gap-12 md:grid-cols-12">
            {/* Navigation Sidebar */}
            <aside className="md:col-span-4 md:sticky md:top-10 md:h-fit">
              <div className="rounded-lg border border-white/20 bg-black/60 p-6 backdrop-blur-md shadow-xl">
                <HangingSidebarHeading />
                <ul className="mt-4 space-y-3 label-mono text-xs md:text-sm text-foreground/85">
                  <li>
                    <a href="#contact-data" className="hover:text-mint transition-colors">
                      01. Contact Form Data
                    </a>
                  </li>
                  <li>
                    <a href="#resend-integration" className="hover:text-mint transition-colors">
                      02. Email Infrastructure (Resend)
                    </a>
                  </li>
                  <li>
                    <a href="#technical-data" className="hover:text-mint transition-colors">
                      03. Technical & Canvas Data
                    </a>
                  </li>
                  <li>
                    <a href="#data-usage" className="hover:text-mint transition-colors">
                      04. Data Usage & Rights
                    </a>
                  </li>
                  <li>
                    <a href="#contact-us" className="hover:text-mint transition-colors">
                      05. Inquiry & Governance
                    </a>
                  </li>
                </ul>
              </div>
            </aside>

            {/* Main Policy Content */}
            <div className="md:col-span-8 space-y-16 text-foreground/90">
              {/* Section 1 */}
              <article id="contact-data" className="space-y-4 border-b border-white/15 pb-12">
                <HangingSectionHeading
                  number="01 /"
                  title="Information Collected via Contact Form"
                />
                <p className="text-base md:text-lg leading-relaxed text-foreground/90 font-light">
                  When you submit a message or project brief through our contact form, we
                  collect specific personal data required to respond to your inquiry:
                </p>
                <ul className="mt-4 space-y-3.5 rounded-md border border-white/15 bg-black/50 p-6 text-sm md:text-base leading-relaxed text-foreground/90 backdrop-blur-sm">
                  <li className="flex items-start gap-3">
                    <span className="text-ember font-bold text-base">•</span>
                    <span>
                      <strong className="text-white font-medium">Full Name:</strong> Provided by you
                      to identify sender identity.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-ember font-bold text-base">•</span>
                    <span>
                      <strong className="text-white font-medium">Email Address:</strong> Used
                      strictly to deliver replies to your inbox.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-ember font-bold text-base">•</span>
                    <span>
                      <strong className="text-white font-medium">Message Content:</strong> The text
                      brief, inquiry details, or project description.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-ember font-bold text-base">•</span>
                    <span>
                      <strong className="text-white font-medium">Submission Timestamp:</strong> UTC
                      server timestamp recorded during email dispatch.
                    </span>
                  </li>
                </ul>
              </article>

              {/* Section 2 */}
              <article id="resend-integration" className="space-y-4 border-b border-white/15 pb-12">
                <HangingSectionHeading number="02 /" title="Email Dispatch Service (Resend)" />
                <p className="text-base md:text-lg leading-relaxed text-foreground/90 font-light">
                  Contact form messages are transmitted to our official email inbox (
                  <code className="text-mint font-mono font-semibold text-sm md:text-base">
                    bharathserman@gmail.com
                  </code>
                  ) via <strong className="text-white font-medium">Resend</strong>, an
                  enterprise-grade email delivery service API.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-foreground/90 font-light">
                  Resend processes message payloads over encrypted TLS connections. We do not store
                  your message content in public advertising databases or sell contact details to
                  third parties.
                </p>
              </article>

              {/* Section 3 */}
              <article id="technical-data" className="space-y-4 border-b border-white/15 pb-12">
                <HangingSectionHeading
                  number="03 /"
                  title="Technical Parameters & WebGL Canvas Data"
                />
                <p className="text-base md:text-lg leading-relaxed text-foreground/90 font-light">
                  Our site features interactive 3D WebGL scenes (Three.js spider web physics and
                  camera controllers).
                </p>
                <div className="space-y-4 rounded-md border border-white/15 bg-black/50 p-6 text-sm md:text-base leading-relaxed text-foreground/90 backdrop-blur-sm">
                  <p>
                    <strong className="text-white font-medium">
                      Local Browser Storage & Memory:
                    </strong>{" "}
                    Pointer coordinates, scroll velocity, and 3D web mesh spring physics
                    calculations are processed strictly within your browser&apos;s local memory
                    during active session rendering. No personal telemetry or screen recordings are
                    collected from WebGL canvas interactions.
                  </p>
                  <p>
                    <strong className="text-white font-medium">Hosting Request Logs:</strong>{" "}
                    Standard web server request logs (IP address, User-Agent, HTTP request header)
                    may be recorded by our edge deployment host solely for DDoS protection and
                    server security.
                  </p>
                </div>
              </article>

              {/* Section 4 */}
              <article id="data-usage" className="space-y-4 border-b border-white/15 pb-12">
                <HangingSectionHeading number="04 /" title="Data Rights & Retention" />
                <p className="text-base md:text-lg leading-relaxed text-foreground/90 font-light">
                  You retain complete rights over any personal information submitted to ARACHNÉ
                  Studio:
                </p>
                <ul className="space-y-3.5 text-sm md:text-base leading-relaxed text-foreground/90">
                  <li className="flex items-start gap-3">
                    <span className="text-mint font-bold text-base md:text-lg leading-none mt-0.5">
                      ✓
                    </span>
                    <span>Right to request access to records of past correspondence.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-mint font-bold text-base md:text-lg leading-none mt-0.5">
                      ✓
                    </span>
                    <span>
                      Right to request complete erasure of your contact details from studio inboxes.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-mint font-bold text-base md:text-lg leading-none mt-0.5">
                      ✓
                    </span>
                    <span>Right to decline marketing or newsletter communications.</span>
                  </li>
                </ul>
              </article>

              {/* Section 5 */}
              <article id="contact-us" className="space-y-4">
                <HangingSectionHeading number="05 /" title="Contact Privacy Officer" />
                <p className="text-base md:text-lg leading-relaxed text-foreground/90 font-light">
                  For questions regarding this privacy notice or to request data removal, please
                  contact the privacy desk:
                </p>
                <div className="rounded-md border border-white/30 bg-white/1 px-5 py-3.5 label-mono text-sm md:text-base text-ember inline-block backdrop-blur-sm font-semibold tracking-wide">
                  EMAIL: bharathserman@gmail.com
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mx-auto flex max-w-[90rem] items-center justify-between border-t border-white/15 px-6 py-8 text-[14px] uppercase tracking-[0.18em] text-foreground/60 md:px-10">
          <span>ARACHNÉ — Privacy Policy / 2026</span>
          <button
            onClick={handleReturn}
            type="button"
            className="text-mint font-semibold transition-colors hover:text-white cursor-pointer"
          >
            Return to Home
          </button>
        </footer>
      </div>
    </main>
  );
}