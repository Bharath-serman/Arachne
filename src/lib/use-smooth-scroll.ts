import { useEffect } from "react";
import { scrollState, clamp } from "./scroll-state";

type LenisLike = {
  raf: (time: number) => void;
  isScrolling: boolean | string;
  on: (event: "scroll", handler: ({ progress, velocity }: { progress: number; velocity: number }) => void) => void;
  destroy: () => void;
};

/**
 * Lenis smooth scroll + velocity tracking. Feeds the shared scrollState that
 * both the 3D camera and the DOM choreography read from.
 *
 * Lenis is imported only when this hook is enabled. The landing screen does
 * not need smooth scrolling, so its first paint avoids loading this module.
 */
export function useSmoothScroll(onScroll?: (progress: number) => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let lenis: LenisLike | null = null;
    let raf = 0;
    let wakeFrames = 2;

    const loop = (time: number) => {
      raf = 0;
      if (disposed || !lenis) return;

      lenis.raf(time);

      // Keep the driver alive through Lenis inertia, then sleep until input.
      if (lenis.isScrolling || wakeFrames > 0) {
        wakeFrames = lenis.isScrolling ? 4 : wakeFrames - 1;
        raf = requestAnimationFrame(loop);
      }
    };

    const wake = () => {
      wakeFrames = Math.max(wakeFrames, 4);
      if (!raf && lenis) raf = requestAnimationFrame(loop);
    };

    const pointer = (e: PointerEvent) => {
      const nextX = (e.clientX / window.innerWidth) * 2 - 1;
      const nextY = (e.clientY / window.innerHeight) * 2 - 1;
      // Avoid writing the shared state for sub-pixel pointer noise.
      if (Math.abs(nextX - scrollState.pointerX) > 0.001 || Math.abs(nextY - scrollState.pointerY) > 0.001) {
        scrollState.pointerX = nextX;
        scrollState.pointerY = nextY;
      }
    };
    const press = (e: PointerEvent) => {
      scrollState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      scrollState.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
      scrollState.clickAt = performance.now();
    };

    const inputEvents: Array<keyof WindowEventMap> = ["wheel", "touchstart", "touchmove", "keydown"];
    inputEvents.forEach((event) => window.addEventListener(event, wake, { passive: event !== "keydown" }));
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("pointerdown", press, { passive: true });

    void import("lenis").then(({ default: Lenis }) => {
      if (disposed) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      lenis = new Lenis({
        duration: reduced ? 0.1 : 0.68,
        easing: (t: number) => 1 - Math.pow(1 - t, 2.2),
        wheelMultiplier: 1.05,
        touchMultiplier: 1.1,
        syncTouch: false,
      }) as LenisLike;
      lenis.on("scroll", handle);
      wake();
    });

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      inputEvents.forEach((event) => window.removeEventListener(event, wake));
      window.removeEventListener("scroll", wake);
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("pointerdown", press);
      lenis?.destroy();
    };

    function handle({ progress, velocity }: { progress: number; velocity: number }) {
      scrollState.progress = clamp(progress);
      scrollState.rawVelocity = velocity;
      const mag = clamp(Math.abs(velocity) / 55);
      // asymmetric smoothing: snap up quickly, decay slowly (inertia)
      scrollState.velocity =
        mag > scrollState.velocity
          ? scrollState.velocity + (mag - scrollState.velocity) * 0.4
          : scrollState.velocity + (mag - scrollState.velocity) * 0.06;
      onScroll?.(scrollState.progress);
      window.dispatchEvent(new Event("anemoia:scroll"));
    }
  }, [enabled, onScroll]);
}
