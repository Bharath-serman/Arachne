import React from "react";
import { SpiderManCanvas } from "./SpiderManCanvas";
import { PortfolioOverlay } from "./PortfolioOverlay";

interface SpidermanPortfolioProps {
  modelUrl?: string;
}

export function SpidermanPortfolio({ modelUrl = "/models/spiderman.glb" }: SpidermanPortfolioProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#05070c] text-slate-100 selection:bg-red-600 selection:text-white">
      {/* 3D Fixed Background Canvas with Cinematic Superhero Lighting */}
      <SpiderManCanvas
        containerId="spiderman-portfolio-container"
        modelUrl={modelUrl}
      />

      {/* Ambient Red Atmospheric Glow in Background */}
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
