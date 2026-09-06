/**
 * Shared, render-free scroll/pointer state.
 * Written by the Lenis loop, read by the 3D render loop (no React re-renders).
 */
export type ScrollState = {
  /** 0..1 progress through the whole document */
  progress: number;
  /** smoothed absolute scroll velocity, roughly 0..1 */
  velocity: number;
  /** signed raw velocity */
  rawVelocity: number;
  /** -1..1 normalized pointer position */
  pointerX: number;
  pointerY: number;
  /** 0..1 intro reveal */
  intro: number;
  /** document progress at which the camera has passed the last television */
  dollyEnd: number;
  /** performance.now() of the last pointer press, for click ripples */
  clickAt: number;
};

export const scrollState: ScrollState = {
  progress: 0,
  velocity: 0,
  rawVelocity: 0,
  pointerX: 0,
  pointerY: 0,
  intro: 0,
  dollyEnd: 1,
  clickAt: -1e6,
};



export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** eased sub-range extraction: maps [start,end] of progress into 0..1 */
export const range = (p: number, start: number, end: number) =>
  clamp((p - start) / (end - start));

export const easeExpoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInOutPow = (t: number, p = 2) =>
  t < 0.5 ? Math.pow(2 * t, p) / 2 : 1 - Math.pow(2 * (1 - t), p) / 2;
