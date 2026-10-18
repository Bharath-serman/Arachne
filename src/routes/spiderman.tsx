import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const SpidermanPortfolio = lazy(
  () => import("@/components/spiderman/SpidermanPortfolio")
);

export const Route = createFileRoute("/spiderman")({
  head: () => ({
    meta: [
      { title: "Spider-Man 3D Experience — Interactive Portfolio" },
      {
        name: "description",
        content:
          "Interactive 3D Spider-Man model that responds dynamically to page scrolling using Three.js, React Three Fiber, and GSAP ScrollTrigger.",
      },
    ],
  }),
  component: SpidermanRoute,
});

function SpidermanRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-[#05070c] text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
            <p className="font-mono text-xs tracking-widest text-slate-400">
              SYNCHRONIZING SKELETAL RIG...
            </p>
          </div>
        </div>
      }
    >
      <SpidermanPortfolio />
    </Suspense>
  );
}
