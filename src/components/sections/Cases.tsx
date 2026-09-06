import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { PROJECTS } from "@/data/projects";
import { SilkOverlay } from "@/components/decor/SilkOverlay";
import { rememberHomePosition } from "@/lib/home-return";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** A chaptered Black Frame Gallery: each folio holds the focal plane before the next one enters. */
export function Cases() {
  const stage = useRef<HTMLElement>(null);
  const lastChapter = useRef(-1);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const selected = PROJECTS[active]!;

  const handleCaseNavigation = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      rememberHomePosition(event.currentTarget);
    }
  };

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    let raf = 0;
    const tick = () => {
      const bounds = element.getBoundingClientRect();
      // Map the full sticky travel distance to 0–1 so no project is skipped before the section ends.
      const travel = Math.max(1, bounds.height - window.innerHeight);
      const nextProgress = clamp(-bounds.top / travel);
      const chapter = Math.min(PROJECTS.length - 1, Math.floor(nextProgress * PROJECTS.length));
      setProgress(nextProgress);
      if (chapter !== lastChapter.current) { lastChapter.current = chapter; setActive(chapter); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let killed = false;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (killed || !stage.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      ctx = gsap.context(() => {
        gsap.timeline({ scrollTrigger: { trigger: stage.current, start: "top 82%", end: "top 32%", scrub: 1, invalidateOnRefresh: true } })
          .fromTo(".frame-gallery-heading", { opacity: 0, y: 38, filter: "blur(14px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4, ease: "power3.out" })
          .fromTo(".frame-gallery-stage", { opacity: 0, y: 68, scale: 0.84, filter: "blur(16px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.68, ease: "power3.out" }, "<0.04")
          .fromTo(".frame-gallery-caption", { opacity: 0, y: 18, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.32, ease: "power2.out" }, "<0.14");
      }, stage);
    })();
    return () => { killed = true; ctx?.revert(); };
  }, []);

  const chapterPosition = progress * PROJECTS.length;
  const currentChapter = Math.min(PROJECTS.length - 1, Math.floor(chapterPosition));
  const withinChapter = chapterPosition - currentChapter;
  // The active project holds centre stage, then moves during only the final 28% of its chapter.
  const transfer = clamp((withinChapter - 0.72) / 0.28);
  const camera = Math.min(PROJECTS.length - 1, currentChapter + transfer);

  return (
    <section id="cases" ref={stage} className="relative h-[360vh] overflow-clip bg-void">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img src={selected.img} alt="" aria-hidden="true" className="absolute inset-[-12%] h-[124%] w-[124%] scale-110 object-cover opacity-[0.12] blur-3xl grayscale transition-all duration-150" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_47%,rgba(232,242,244,.08),transparent_31%),radial-gradient(ellipse_at_50%_50%,rgba(176,33,21,.24),transparent_58%),linear-gradient(180deg,#050506,rgba(6,7,8,.84)_72%,#030405)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(238,246,247,.02)_1px,transparent_1px),linear-gradient(rgba(238,246,247,.014)_1px,transparent_1px)] bg-[size:7rem_7rem] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <div className="sticky top-0 flex h-svh items-center overflow-hidden py-[6vh] [perspective:1900px]">
        <div className="mx-auto flex h-full w-full max-w-[108rem] flex-col px-6 md:px-10">
          <div className="frame-gallery-heading z-20 flex items-end justify-between gap-6">
            <div><p className="label-mono mb-4 text-mint/75">Selected works / black frame archive</p><h2 className="font-display text-5xl font-extralight text-foreground/95 md:text-7xl">Our cases</h2></div>
            <p className="hidden max-w-xs text-right text-[11px] leading-relaxed text-foreground/58 md:block">Four case studies. Every folio holds focus before the archive moves on.</p>
          </div>

          <div className="frame-gallery-stage relative min-h-0 flex-1 [transform-style:preserve-3d]">
            <SilkOverlay variant="gallery" active={active} />
            <div className="pointer-events-none absolute left-1/2 top-[49%] h-px w-[118%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent [box-shadow:0_0_18px_rgba(226,240,242,.28)] [transform:translateZ(-90px)]" />
            <div className="pointer-events-none absolute left-1/2 top-[49%] h-[25rem] w-[74rem] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/10 [transform:translateZ(-110px)_rotateX(68deg)]" />
            <div className="pointer-events-none absolute left-1/2 top-[49%] h-[33rem] w-[92rem] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/5 [transform:translateZ(-150px)_rotateX(68deg)]" />
            <span className="pointer-events-none absolute left-[4%] top-[15%] font-display text-[clamp(12rem,27vw,31rem)] font-extralight leading-none tracking-[-.12em] text-white/[.035]">0{active + 1}</span>

            {PROJECTS.map((item, index) => {
              const relative = index - camera;
              const distance = Math.abs(relative);
              const isActive = active === index;
              const x = relative * 17;
              const z = Math.max(-430, 360 - distance * 410);
              const y = distance * 16;
              const opacity = Math.max(0.18, 1 - distance * 0.38);
              const scale = Math.max(0.57, 1 - distance * 0.18);
              const transform = `translateX(${x}vw) translateY(${y}px) translateZ(${z}px) rotateY(${-relative * 27}deg) rotateZ(${relative * 2.6}deg) scale(${scale})`;
              return (
                <a key={item.slug} href={`/work/${item.slug}`} onClick={handleCaseNavigation} aria-current={isActive ? "page" : undefined} className="absolute left-1/2 top-[47%] w-[min(57vw,42rem)] -translate-x-1/2 -translate-y-1/2 text-left [backface-visibility:hidden] [transform-style:preserve-3d]" style={{ zIndex: 20 - Math.round(distance * 7), opacity, transform, transition: "transform .14s linear, opacity .12s linear" }}>
                  <span className={`group relative block bg-[#08090a] p-[clamp(.45rem,.9vw,.8rem)] shadow-[0_36px_80px_rgba(0,0,0,.58)] transition-all duration-500 ${isActive ? "[box-shadow:0_36px_100px_rgba(0,0,0,.72),0_0_0_1px_rgba(225,50,30,.75)]" : "[box-shadow:0_24px_58px_rgba(0,0,0,.48)] hover:[box-shadow:0_30px_80px_rgba(0,0,0,.66),0_0_0_1px_rgba(232,242,244,.54)]"}`}>
                    <span className="absolute inset-0 border border-white/45" />
                    <span className="absolute left-3 top-3 z-20 h-9 w-9 border-l border-t border-white/80" />
                    <span className="absolute bottom-3 right-3 z-20 h-9 w-9 border-b border-r border-white/80" />
                    <span className="relative block overflow-hidden border border-white/15 bg-black">
                      <img src={item.img} alt={`${item.title} — ${item.tag} for ${item.client}`} loading="lazy" width={1024} height={768} className={`aspect-[16/10] w-full object-cover transition-[filter,transform] duration-150 ${isActive ? "scale-[1.025] brightness-[1.12] contrast-[1.08]" : "brightness-[.52] grayscale-[.3] group-hover:brightness-[.75]"}`} />
                      <span className="absolute inset-0 bg-[linear-gradient(115deg,rgba(4,5,6,.04),rgba(4,5,6,.66))]" />
                      <span className="absolute inset-x-0 bottom-0 h-[36%] bg-gradient-to-t from-black/80 to-transparent" />
                      <span className="absolute left-5 top-5 flex items-center gap-2"><i className={`h-2 w-2 rounded-full ${isActive ? "bg-ember shadow-[0_0_12px_rgba(224,51,30,1)]" : "bg-white/35"}`} /><b className="label-mono text-foreground/85">Folio 0{index + 1}</b></span>
                      <span className="absolute bottom-5 left-5 label-mono text-[9px] text-foreground/75">{item.client} / {item.year}</span>
                    </span>
                    <span className="absolute -right-10 top-1/2 hidden -translate-y-1/2 -rotate-90 label-mono text-white/40 md:block">{item.tag}</span>
                  </span>
                </a>
              );
            })}
          </div>

          <div className="frame-gallery-caption grid grid-cols-1 gap-5 border-t border-white/20 pt-5 md:grid-cols-12 md:items-end">
            <div className="md:col-span-2"><p className="label-mono text-mint/80">Folio 0{active + 1} / 04</p><p className="mt-2 label-mono text-foreground/45">{selected.year}</p></div>
            <div className="md:col-span-6"><h3 className="font-display text-[clamp(2.25rem,4.4vw,5.4rem)] font-extralight leading-[.86] tracking-[-.055em] text-foreground/95">{selected.title}</h3><p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{selected.note}</p></div>
            <div className="md:col-span-4 md:pb-1 md:text-right"><p className="label-mono text-foreground/60">{selected.client} / {selected.tag}</p><a href={`/work/${selected.slug}`} onClick={handleCaseNavigation} className="mt-4 inline-flex border-b border-ember/75 pb-1 label-mono text-ember transition-colors hover:text-foreground">Open case file ↗</a></div>
          </div>
          <nav aria-label="Project folios" className="mt-4 flex justify-between border-t border-white/10 pt-3">
            {PROJECTS.map((project, index) => <a key={project.slug} href={`/work/${project.slug}`} onClick={handleCaseNavigation} className={`group flex items-center gap-2 label-mono transition-colors ${active === index ? "text-ember" : "text-foreground/42 hover:text-foreground"}`}><span className={`h-1.5 w-1.5 rounded-full transition-colors ${active === index ? "bg-ember shadow-[0_0_9px_rgba(222,49,29,1)]" : "bg-white/30 group-hover:bg-white"}`} />0{index + 1}<span className="hidden sm:inline"> / {project.title}</span></a>)}
          </nav>
        </div>
      </div>
    </section>
  );
}
