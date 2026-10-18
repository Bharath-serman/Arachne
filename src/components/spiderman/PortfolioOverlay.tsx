import React from "react";
import { ArrowUpRight, Code, Sparkles, Terminal, Mail, Github, Linkedin } from "lucide-react";

export function PortfolioOverlay() {
  return (
    <div id="spiderman-portfolio-container" className="relative z-10 w-full font-sans">
      {/* Top Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 backdrop-blur-md bg-black/20 border-b border-white/5 pointer-events-auto">
        <a href="#spiderman-hero" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-600/30">
            <span className="font-mono text-sm font-black text-white">SP</span>
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-white/90 group-hover:text-red-400 transition-colors">
            PETER PARKER
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest uppercase text-slate-400">
          <a href="#spiderman-hero" className="hover:text-red-400 transition-colors">
            // 00. Origin
          </a>
          <a href="#spiderman-about" className="hover:text-red-400 transition-colors">
            // 01. Stats
          </a>
          <a href="#spiderman-projects" className="hover:text-red-400 transition-colors">
            // 02. Missions
          </a>
          <a href="#spiderman-contact" className="hover:text-red-400 transition-colors">
            // 03. Signal
          </a>
        </nav>

        <a
          href="#spiderman-contact"
          className="rounded-full border border-red-500/40 bg-red-600/20 px-4 py-1.5 text-xs font-mono font-medium tracking-wider text-red-300 hover:bg-red-600 hover:text-white transition-all duration-300"
        >
          CONNECT
        </a>
      </header>

      {/* SECTION 1: HERO */}
      <section
        id="spiderman-hero"
        className="relative flex min-h-screen flex-col justify-center px-6 md:px-20 lg:px-32 pt-20"
      >
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/30 px-3.5 py-1 text-xs font-mono text-red-400 backdrop-blur-md mb-6">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            LIVE // CREATIVE TECHNOLOGIST & WEBGL ENGINEER
          </div>

          <h1 className="text-5xl font-black uppercase tracking-tight text-white sm:text-7xl lg:text-8xl leading-none">
            Friendly <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-amber-500">
              Neighborhood
            </span>{" "}
            <br />
            Developer
          </h1>

          <p className="mt-8 text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
            Architecting real-time 3D web applications, dynamic shader systems, and responsive user experiences with surgical precision.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4 pointer-events-auto">
            <a
              href="#spiderman-projects"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-red-600/50"
            >
              <span>Explore Missions</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <a
              href="#spiderman-about"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition hover:bg-white/10 hover:border-white/20"
            >
              <Terminal className="h-4 w-4 text-red-400" />
              <span>Bio & Tech Stack</span>
            </a>
          </div>

          <div className="mt-16 flex items-center gap-8 border-t border-white/10 pt-6 text-slate-400 font-mono text-xs">
            <div>
              <span className="block text-xl font-bold text-white">60+ FPS</span>
              <span className="text-slate-500">GPU Optimization</span>
            </div>
            <div>
              <span className="block text-xl font-bold text-white">R3F / Three.js</span>
              <span className="text-slate-500">Spatial Computing</span>
            </div>
            <div>
              <span className="block text-xl font-bold text-white">GSAP</span>
              <span className="text-slate-500">Scroll Choreography</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT / STATS */}
      <section
        id="spiderman-about"
        className="relative flex min-h-screen flex-col justify-center px-6 md:px-20 lg:px-32 py-24"
      >
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red-400 mb-3">
            <Code className="h-3.5 w-3.5" />
            <span>01 // Specification Matrix</span>
          </div>

          <h2 className="text-4xl font-black uppercase tracking-tight text-white sm:text-6xl">
            Great Code. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              Zero Bottlenecks.
            </span>
          </h2>

          <p className="mt-6 text-slate-300 leading-relaxed text-base sm:text-lg">
            Balancing real-time graphics fidelity with lightweight web delivery. Every asset is baked, compressed, and synchronized to the user’s scroll momentum using custom timeline interpolators.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 pointer-events-auto">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
              <span className="font-mono text-xs text-red-400">CORE // 3D</span>
              <h3 className="mt-1 font-bold text-white text-base">Three.js & R3F</h3>
              <p className="mt-2 text-xs text-slate-400 leading-normal">
                Skeletal rigging, custom GLSL vertex/fragment shaders, and procedural PBR material pipelines.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
              <span className="font-mono text-xs text-blue-400">INTERPOLATION</span>
              <h3 className="mt-1 font-bold text-white text-base">GSAP ScrollTrigger</h3>
              <p className="mt-2 text-xs text-slate-400 leading-normal">
                Non-blocking timeline scrubs, cinematic camera rigs, and cross-faded animation mixers.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
              <span className="font-mono text-xs text-rose-400">ENGINEERING</span>
              <h3 className="mt-1 font-bold text-white text-base">React 19 & Vite</h3>
              <p className="mt-2 text-xs text-slate-400 leading-normal">
                Modern modular TypeScript architecture with code-splitting and zero bundle bloat.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
              <span className="font-mono text-xs text-emerald-400">EFFICIENCY</span>
              <h3 className="mt-1 font-bold text-white text-base">DPR Optimization</h3>
              <p className="mt-2 text-xs text-slate-400 leading-normal">
                Adaptive DPR caps, frustum culling, and offscreen canvas throttling for battery preservation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PROJECTS */}
      <section
        id="spiderman-projects"
        className="relative flex min-h-screen flex-col justify-center items-end px-6 md:px-20 lg:px-32 py-24"
      >
        <div className="max-w-2xl text-right">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red-400 mb-3 justify-end">
            <Sparkles className="h-3.5 w-3.5" />
            <span>02 // Mission Deployments</span>
          </div>

          <h2 className="text-4xl font-black uppercase tracking-tight text-white sm:text-6xl">
            Selected Works
          </h2>

          <p className="mt-6 text-slate-300 leading-relaxed text-base sm:text-lg">
            High-impact installations bridging creative direction, interactive narrative, and deep technical execution.
          </p>

          <div className="mt-10 space-y-4 pointer-events-auto text-left">
            <div className="group rounded-2xl border border-white/10 bg-slate-950/80 p-6 backdrop-blur-lg transition-all duration-300 hover:border-red-500/50 hover:bg-slate-900/90">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-red-400">MISSION 01</span>
                <span className="text-xs text-slate-500 font-mono">WEBGL / SHADERS</span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                Multiverse Web Dimension
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Interactive spatial portal simulator with procedural spider-web strand synthesis and raymarching.
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-slate-950/80 p-6 backdrop-blur-lg transition-all duration-300 hover:border-blue-500/50 hover:bg-slate-900/90">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-blue-400">MISSION 02</span>
                <span className="text-xs text-slate-500 font-mono">R3F / RIGGING</span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                Spider-Bot Autonomous Rig
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Inverse kinematics 8-legged robotic crawler traversing interactive non-Euclidean silk geometry.
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-slate-950/80 p-6 backdrop-blur-lg transition-all duration-300 hover:border-rose-500/50 hover:bg-slate-900/90">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-rose-400">MISSION 03</span>
                <span className="text-xs text-slate-500 font-mono">GSAP / EXPERIENCE</span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-white group-hover:text-rose-400 transition-colors">
                Daily Bugle Broadcast Hub
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Retro-futurist terminal interface integrating live audio spectrum analyzers and camera fly-throughs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CONTACT */}
      <section
        id="spiderman-contact"
        className="relative flex min-h-screen flex-col items-center justify-center text-center px-6 md:px-20 py-24"
      >
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/30 px-3.5 py-1 text-xs font-mono text-red-400 backdrop-blur-md mb-6">
            <span>03 // FREQUENCY LOCKED</span>
          </div>

          <h2 className="text-4xl font-black uppercase tracking-tight text-white sm:text-6xl lg:text-7xl">
            Launch Your Next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-amber-500">
              Experience
            </span>
          </h2>

          <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed">
            Available for freelance creative development, WebGL consulting, and technical direction.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <a
              href="mailto:peter@example.com"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-8 py-4 font-bold text-white shadow-xl shadow-red-600/40 transition hover:scale-105"
            >
              <Mail className="h-5 w-5" />
              <span>Send Transmission</span>
            </a>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <footer className="mt-24 border-t border-white/5 pt-8 text-xs font-mono text-slate-500">
            © {new Date().getFullYear()} PETER PARKER // BUILT WITH THREE.JS, R3F & GSAP SCROLLTRIGGER
          </footer>
        </div>
      </section>
    </div>
  );
}
