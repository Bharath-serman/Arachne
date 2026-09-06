import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Landing } from "@/components/landing/Landing";
import { scrollState } from "@/lib/scroll-state";
import { consumeHomePosition } from "@/lib/home-return";


const loadHero = () => import("@/components/sections/Hero").then((module) => ({ default: module.Hero }));
const loadChannels = () => import("@/components/sections/Channels").then((module) => ({ default: module.Channels }));
const loadGiantType = () => import("@/components/sections/GiantType").then((module) => ({ default: module.GiantType }));
const loadCases = () => import("@/components/sections/Cases").then((module) => ({ default: module.Cases }));
const loadExperience = () => import("@/components/sections/Experience").then((module) => ({ default: module.Experience }));
const loadAbout = () => import("@/components/sections/About").then((module) => ({ default: module.About }));
const loadContact = () => import("@/components/sections/Contact").then((module) => ({ default: module.Contact }));

const Hero = lazy(loadHero);
const Channels = lazy(loadChannels);
const GiantType = lazy(loadGiantType);
const Cases = lazy(loadCases);
const Experience = lazy(loadExperience);
const About = lazy(loadAbout);
const Contact = lazy(loadContact);
const BroadcastScene = lazy(() => import("@/components/experience/BroadcastScene"));
const HomeRuntime = lazy(() => import("@/components/runtime/HomeRuntime").then((module) => ({ default: module.HomeRuntime })));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARACHNÉ" },
      {
        name: "description",
        content:
          "A creative studio discovered inside an old television broadcast. Film, interface, sound and light — one continuous cinematic shot.",
      },
      { property: "og:title", content: "ARACHNÉ — Cinematic Studio" },
      {
        property: "og:description",
        content:
          "Retro-futurist broadcast studio: title sequences, interactive installs and web experiences built as one continuous camera move.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [showLanding, setShowLanding] = useState(false);
  const [homeVisible, setHomeVisible] = useState(false);
  const [homeRevealReady, setHomeRevealReady] = useState(false);
  const [routeBooting, setRouteBooting] = useState(true);

  useEffect(() => {
    setMounted(true);

    const returnState = consumeHomePosition();
    let restoreFrame: number | null = null;
    let restoreAttempts = 0;
    const restoreProjectsPosition = () => {
      if (!returnState) return;
      const projectsMounted = Boolean(document.querySelector("#cases > section"));
      const pageHasRoom = document.documentElement.scrollHeight > window.innerHeight + 120;
      if ((!projectsMounted || !pageHasRoom) && restoreAttempts < 120) {
        restoreAttempts += 1;
        restoreFrame = window.requestAnimationFrame(restoreProjectsPosition);
        return;
      }
      window.scrollTo({ top: returnState.scrollY, left: 0, behavior: "auto" });
      // Lenis and lazy section layout can settle one frame later; apply the
      // same saved position twice without animating back through the hero.
      restoreFrame = window.requestAnimationFrame(() => {
        window.scrollTo({ top: returnState.scrollY, left: 0, behavior: "auto" });
      });
    };

    if (returnState) {
      setHomeVisible(true);
      setHomeRevealReady(true);
      restoreFrame = window.requestAnimationFrame(restoreProjectsPosition);
    } else {
      setShowLanding(true);
    }
    setRouteBooting(false);

    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (restoreFrame !== null) window.cancelAnimationFrame(restoreFrame);
    };
  }, []);

  // keep GSAP ScrollTrigger in sync with Lenis' virtual scroll
  const sync = useCallback(() => {
    const st = (
      window as unknown as { ScrollTrigger?: { update: () => void } }
    ).ScrollTrigger;
    st?.update();
  }, []);

  useEffect(() => {
    if (!mounted || !homeVisible) return;
    let killed = false;
    (async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (killed) return;
      (window as unknown as { ScrollTrigger: unknown }).ScrollTrigger = ScrollTrigger;
      ScrollTrigger.refresh();
    })();
    return () => {
      killed = true;
    };
  }, [mounted, homeVisible]);

  // the camera must finish passing every television before the next chapter appears
  useEffect(() => {
    if (!mounted || !homeVisible) return;
    const measure = () => {
      const end = document.getElementById("journey-end");
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (!end || scrollable <= 0) return;
      const top = end.getBoundingClientRect().top + window.scrollY;
      scrollState.dollyEnd = Math.min(1, Math.max(0.1, top / scrollable));
    };
    measure();
    const id = window.setTimeout(measure, 600);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", measure);
    };
  }, [mounted, homeVisible]);


  const prepareHome = useCallback(() => {
    // Start loading the home chunks only after the user requests transmission,
    // so an idle landing page does not receive a surprise parse/compile spike.
    window.setTimeout(() => {
      void Promise.all([loadHero(), loadChannels(), loadGiantType(), loadCases(), loadExperience(), loadAbout(), loadContact()]);
    }, 80);
  }, []);

  const enterHome = () => {
    setHomeVisible(true);
    setHomeRevealReady(false);
    setShowLanding(false);

    // Mount the home scene behind a fully opaque curtain first. Only after two
    // paints do we fade the curtain away, preventing a single-frame content flash.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setHomeRevealReady(true));
    });
  };

  return (
    <div className="relative bg-void">
      {/* 3D broadcast environment — fixed behind the entire document */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {mounted && homeVisible && visible ? (
          <Suspense fallback={null}>
            <BroadcastScene />
          </Suspense>
        ) : null}
      </div>

      {homeVisible ? (
        <>
          {/* atmospheric red light bleeding in from outside the scene */}
          <div className="pointer-events-none fixed left-1/2 top-1/3 z-10 h-[70vh] w-[70vw] -translate-x-1/2 ember-light opacity-50" />
          <Suspense fallback={null}>
            <HomeRuntime sync={sync} visible={visible} />
          </Suspense>

          <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6">
            <span className="font-display text-lg font-light tracking-[0.3em] text-foreground/85">
              ARACHNÉ
            </span>
            <span className="label-mono hidden md:block" style={{ animation: "signal-flicker 5s infinite" }}>
              ● On air
            </span>
            <div className="flex items-center gap-5">
              <a href="#cases" className="label-mono text-foreground/70 transition-colors duration-300 hover:text-mint">
                Index
              </a>
              <a href="#contact" className="label-mono text-foreground/70 transition-colors duration-300 hover:text-mint">
                Contact
              </a>
              <a href="/privacy" className="label-mono text-foreground/70 transition-colors duration-300 hover:text-mint">
                Privacy Policy
              </a>
            </div>
          </header>

          <Suspense fallback={<main className="relative z-20 min-h-screen bg-void" aria-hidden="true" />}>
            <main className="relative z-20 origin-center translate-y-0 opacity-100 blur-0 transition-[opacity,transform,filter] duration-700 ease-out">
              <Hero />
              <Channels />
              <div id="journey-end" />
              <GiantType />
              <div id="cases">
                <Cases />
              </div>
              <Experience />
              <About />
              <Contact />
            </main>
          </Suspense>
        </>
      ) : null}
      <div className={`pointer-events-none fixed inset-0 z-[200] bg-void transition-opacity duration-1000 ease-out ${routeBooting || (homeVisible && !homeRevealReady) ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
      {showLanding ? <Landing onEnter={enterHome} onPrepare={prepareHome} /> : null}
    </div>
  );
}
