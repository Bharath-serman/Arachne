import { useEffect, useRef } from "react";
import { scrollState } from "@/lib/scroll-state";

const CHANNELS = [
  "About me",
  "Vital stats",
  "Works",
  "Projects",
  "Disciplines",
  "Experience",
  "Contact",
];

/**
 * Pure travel chapter: the camera dollies past every television here, so no
 * other section enters frame until the last screen has gone by.
 */
export function Channels() {
  const stage = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = Math.min(
        1,
        Math.max(0, scrollState.progress / (scrollState.dollyEnd || 1)),
      );
      const i = Math.min(CHANNELS.length - 1, Math.floor(p * CHANNELS.length));
      if (readout.current) {
        const label = `WEB ${String(i + 1).padStart(2, "0")} — ${CHANNELS[i]}`;
        if (readout.current.textContent !== label) readout.current.textContent = label;
      }
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={stage} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-end px-6 pb-[12vh]">
        <div className="flex items-end justify-between gap-6">
          <span ref={readout} className="label-mono text-mint/80">
            WEB 01 — About me
          </span>
          <span className="label-mono hidden md:block text-muted-foreground">
            Threading through the web
          </span>
        </div>

        <div className="mt-4 h-px w-full bg-border">
          <div
            ref={bar}
            className="h-px w-full origin-left bg-mint/70 will-change-transform"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </section>
  );
}
