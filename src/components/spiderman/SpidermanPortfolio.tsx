import { PortfolioOverlay } from "./PortfolioOverlay";

export function SpidermanPortfolio() {
  return (
    <div className="relative min-h-screen w-full bg-[#05070c] text-slate-100 selection:bg-red-600 selection:text-white">
      {/* Keep the portfolio text page separate from the landing-page 3D figure. */}
      <div
        className="pointer-events-none fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-red-600/10 blur-[140px] z-0"
        aria-hidden="true"
      />

      {/* HTML Content Overlay (Properly layered with pointer-events) */}
      <PortfolioOverlay />
    </div>
  );
}

export default SpidermanPortfolio;
