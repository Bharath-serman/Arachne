import { useEffect, useRef } from "react";
import { scrollState } from "@/lib/scroll-state";

/**
 * Full-viewport analog post-processing: grain, scanlines, vignette,
 * chromatic edge, occasional tearing band. Purely decorative.
 *
 * The overlay does not need a frame loop: its only runtime input is scroll
 * velocity, so it updates on the same coalesced scroll signal as the rest of
 * the DOM choreography.
 */
export function FilmOverlay() {
  const tear = useRef<HTMLDivElement>(null);
  const aberration = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateAberration = () => {
      const next = String(0.1 + scrollState.velocity * 0.55);
      if (aberration.current && aberration.current.style.opacity !== next) {
        aberration.current.style.opacity = next;
      }
    };

    const triggerTear = () => {
      const v = scrollState.velocity;
      if (tear.current && Math.random() < 0.03 + v * 0.15) {
        tear.current.style.animation = "none";
        void tear.current.offsetHeight;
        tear.current.style.animation = "tear-sweep 700ms ease-out";
      }
    };

    updateAberration();
    window.addEventListener("anemoia:scroll", updateAberration, { passive: true });
    // A 120ms scheduler preserves the analog instability while avoiding a
    // full-time RAF that only performs one opacity write per frame.
    const tearTimer = window.setInterval(triggerTear, 120);

    return () => {
      window.removeEventListener("anemoia:scroll", updateAberration);
      window.clearInterval(tearTimer);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <div className="film-grain absolute -inset-8 opacity-[0.16] mix-blend-overlay" />
      <div className="scanlines absolute inset-0 opacity-45" />
      <div className="vignette-frame absolute inset-0" />
      <div
        ref={aberration}
        className="absolute inset-0 opacity-10 mix-blend-screen"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--ember) 22%, transparent) 0%, transparent 12%, transparent 88%, color-mix(in oklab, var(--mint) 20%, transparent) 100%)",
        }}
      />
      <div
        ref={tear}
        className="absolute inset-x-0 h-[3.5rem] opacity-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--foreground) 12%, transparent), transparent)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent" />
    </div>
  );
}
