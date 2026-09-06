const HOME_RETURN_KEY = "anemoia:home-return";

type HomeReturnState = {
  scrollY: number;
  savedAt: number;
};

/** Remember the exact document position before leaving the cinematic archive. */
export function rememberHomePosition(anchor?: Element | null) {
  if (typeof window === "undefined") return;

  try {
    const anchorTop = anchor
      ? anchor.getBoundingClientRect().top + window.scrollY
      : window.scrollY;
    const targetScroll = anchor
      ? anchorTop - window.innerHeight * 0.47
      : anchorTop;
    const state: HomeReturnState = {
      scrollY: Math.max(0, targetScroll),
      savedAt: Date.now(),
    };
    window.sessionStorage.setItem(HOME_RETURN_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable in private browsing; navigation still works normally.
  }
}

/** Read the saved position without clearing it; safe for a state initializer. */
export function peekHomePosition(): HomeReturnState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(HOME_RETURN_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<HomeReturnState>;
    if (!Number.isFinite(parsed.scrollY) || parsed.scrollY! < 0) return null;
    return {
      scrollY: parsed.scrollY!,
      savedAt: Number.isFinite(parsed.savedAt) ? parsed.savedAt! : Date.now(),
    };
  } catch {
    return null;
  }
}

/** Clear the one-shot return marker after the home route has claimed it. */
export function clearHomePosition() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(HOME_RETURN_KEY);
  } catch {
    // Storage can be unavailable in private browsing.
  }
}

/** Read and clear the saved archive position for callers that do not need a two-phase boot. */
export function consumeHomePosition(): HomeReturnState | null {
  const state = peekHomePosition();
  if (state) clearHomePosition();
  return state;
}
