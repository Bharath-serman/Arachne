import { useEffect, useRef, useState } from "react";
import { ContactFormModal } from "./ContactFormModal";

const STAGES = [
  { letter: "S", code: "01", label: "SIGNAL", title: "Open a new signal.", detail: "Reach the studio directly through our interactive spiderweb transmitter." },
  { letter: "P", code: "02", label: "PHONE", title: "+91 72000 30913", detail: "Call when the idea needs to move faster than an inbox.", href: "tel:+919876543210" },
  { letter: "I", code: "03", label: "INTERNET", title: "Public channels", detail: "Follow the threads across the studio’s active platforms." },
  { letter: "D", code: "04", label: "LOCATION", title: "Chennai, Tamil Nadu", detail: "" },
  { letter: "E", code: "05", label: "EMAIL", title: "bharathserman@gmail.com", detail: "Send the brief, the rough sketch, or the strange idea that will not leave you alone.", isFormTrigger: true },
  { letter: "Y", code: "06", label: "AVAILABILITY", title: "Mon–Fri / 10:00–19:00 IST", detail: "The receiver is active. Let’s build the next chapter." },
];

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/Bharath-serman" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/bharath-serman-r-7999b8262/" },
  { label: "Itch IO", href: "https://bharath-serman.itch.io/" },
  { label: "Email", href: "bharathserman@gmail.com" },

];

const STAGE_LABEL_ALIGNMENT = [
  "",
  "",
  "md:justify-end",
  "md:justify-end",
  "md:justify-center",
  "justify-center",
];
const STAGE_DETAIL_ALIGNMENT = [
  "",
  "",
  "md:ml-auto",
  "md:ml-auto",
  "md:mx-auto",
  "mx-auto",
];

function SilkWatermark() {
  const paths = [
    "M 48 302 C 242 130, 410 244, 590 334 S 942 492, 1166 196",
    "M 34 492 C 244 412, 402 530, 594 372 S 932 184, 1178 378",
    "M 178 650 C 314 458, 484 570, 602 360 S 848 126, 1048 92",
    "M 178 100 C 352 240, 456 154, 604 360 S 890 594, 1058 650",
    "M 596 46 C 552 182, 638 262, 604 360 S 566 538, 610 672",
    "M 60 384 C 290 328, 438 390, 604 360 S 904 310, 1150 384",
  ];
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1200 720" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id="atelier-silk-glow"><feGaussianBlur stdDeviation="3" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <g fill="none" stroke="#e7eff0" strokeLinecap="round" filter="url(#atelier-silk-glow)">
        {paths.map((path, index) => <path key={path} className={`contact-thread contact-thread-${index}`} d={path} pathLength="1" strokeWidth={index === 4 ? 1.7 : 1.1} />)}
      </g>
      <g fill="none" stroke="#e7eff0" opacity="0.22">
        <ellipse cx="602" cy="360" rx="52" ry="52" strokeDasharray="3 8" />
        <ellipse cx="602" cy="360" rx="103" ry="103" strokeDasharray="2 11" />
      </g>
      <circle cx="602" cy="360" r="4" fill="var(--ember)" />
    </svg>
  );
}

/** Editorial correspondence layout with React Portal SpiderWeb Contact Form overlay. */
export function Contact() {
  const stage = useRef<HTMLElement>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let killed = false;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (killed || !stage.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      ctx = gsap.context(() => {
        const letters = gsap.utils.toArray<HTMLElement>(".spidey-letter");
        const pieces = gsap.utils.toArray<HTMLElement>(".correspondence-piece");
        const threads = gsap.utils.toArray<SVGPathElement>(".contact-thread");

        gsap.set(letters, { opacity: 0.18, y: -40, scale: 1.1, rotationX: -24, filter: "blur(0px)" });
        gsap.set(pieces, { opacity: 0, y: 18, filter: "blur(5px)" });
        gsap.set(threads, { opacity: 0.13, strokeDasharray: 1, strokeDashoffset: 0.3 });
        gsap.set(".atelier-heading", { opacity: 0.95, y: 0, filter: "blur(0px)" });

        const timeline = gsap.timeline({ scrollTrigger: { trigger: stage.current, start: "top top", end: "bottom bottom", scrub: 1.05, invalidateOnRefresh: true } });
        timeline.fromTo(".atelier-atmosphere", { opacity: 0 }, { opacity: 1, duration: 0.08, ease: "none" });
        STAGES.forEach((_, index) => {
          const at = 0.08 + index * 0.13;
          const letter = letters[index];
          const piece = pieces[index];

          if (!letter || !piece) return;
          timeline
            .to(
              letter,
              {
                opacity: 1,
                y: 0,
                scale: 1,
                rotationX: 0,
                filter: "blur(0px)",
                duration: 0.105,
                ease: "none",
              },
              at,
            )
            .to(
              `.contact-thread-${index}`,
              {
                opacity: index === 4 ? 0.65 : 0.38,
                strokeDashoffset: 0,
                duration: 0.105,
                ease: "none",
              },
              at + 0.015,
            )
            .to(
              piece,
              {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.14,
                ease: "power2.out",
              },
              at + 0.025,
            );
        });
        timeline
          .to(letters, { opacity: 1, y: 0, scale: 1, rotationX: 0, filter: "blur(0px)", duration: 0.1, ease: "none" }, 0.86)
          .to(pieces, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.1, ease: "power2.out" }, 0.86)
          .to(threads, { opacity: 0.14, strokeDashoffset: 0, duration: 0.1, ease: "none" }, 0.86)
          .to(".atelier-heading", { opacity: 1, duration: 0.12, ease: "none" }, 0.56);
      }, stage);
    })();
    return () => { killed = true; ctx?.revert(); };
  }, []);

  const pieceClass = [
    "col-start-1 row-start-1 md:col-span-4 md:col-start-1",
    "col-start-1 row-start-2 md:col-span-4 md:col-start-1",
    "col-start-2 row-start-1 text-right md:col-span-4 md:col-start-9",
    "col-start-2 row-start-2 text-right md:col-span-4 md:col-start-9",
    "col-span-2 row-start-3 text-center md:col-span-6 md:col-start-4",
    "col-span-2 row-start-4 text-center md:col-span-6 md:col-start-4",
  ];

  return (
    <section id="contact" ref={stage} className="relative h-[430vh] bg-void">
      <div className="sticky top-0 h-svh overflow-hidden bg-void [perspective:1500px]">
        <div className="atelier-atmosphere pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(181,38,24,.14),transparent_34%),linear-gradient(180deg,#040405,#080607_63%,#030405)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(238,246,247,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(238,246,247,.012)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:linear-gradient(180deg,transparent,black_18%,black_80%,transparent)]" />

        <div className="pointer-events-none absolute inset-x-0 top-[12%] z-10 text-center">
          <p className="atelier-heading label-mono text-foreground/60">Contact Me to connect</p>
        </div>
        
        <div className="spidey-word pointer-events-none absolute inset-x-0 top-[18%] z-30 flex justify-center gap-[.02em] [transform-style:preserve-3d]">
          {STAGES.map((item) => (
            <span key={item.letter} className="spidey-letter font-display text-[clamp(3.15rem,8vw,9rem)] font-extralight leading-none tracking-[-.11em] text-ember drop-shadow-[0_0_17px_rgba(204,42,27,.6)] [text-shadow:0_9px_0_rgba(74,11,9,.82),0_22px_26px_rgba(0,0,0,.8)] [transform-style:preserve-3d]">{item.letter}</span>
          ))}
        </div>

        <div className="relative z-20 mx-auto h-full max-w-[100rem] px-6 pt-16 pb-7 md:px-10 md:pt-20 md:pb-9 flex flex-col justify-between">
          <header className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/75">
            <span>Transmission / 04</span>
            <span className="text-mint font-semibold">Contact Details</span>
          </header>

          <div className="relative my-auto h-[65%] w-full">
            <SilkWatermark />
            <div className="relative grid h-full grid-cols-2 grid-rows-[.8fr_.8fr_1.55fr_.72fr] gap-x-6 gap-y-3 md:grid-cols-12 md:grid-rows-[.8fr_.9fr_1.55fr_.72fr] md:gap-x-12 md:gap-y-5">
              {STAGES.map((item, index) => (
                <article key={item.letter} className={`correspondence-piece relative min-w-0 border-t border-white/25 pt-2.5 md:pt-3 ${pieceClass[index]}`}>
                  <div className={`mb-3 flex items-center gap-3 ${STAGE_LABEL_ALIGNMENT[index]}`}>
                    <span className="label-mono text-ember">{item.letter}</span>
                    <span className="label-mono text-foreground/55">{item.code} / {item.label}</span>
                  </div>

                  {item.href ? (
                    <a href={item.href} className={`font-display font-light text-foreground/95 transition-colors duration-300 hover:text-mint ${index === 4 ? "text-[clamp(1.35rem,2.25vw,2.65rem)] tracking-[-.045em]" : "text-[clamp(1rem,1.55vw,1.55rem)]"}`}>{item.title}</a>
                  ) : (
                    <h3 className="font-display text-[clamp(1rem,1.55vw,1.55rem)] font-light text-foreground/95">{item.title}</h3>
                  )}

                  <p
                    className={`mt-2 text-[11px] leading-relaxed text-muted-foreground ${STAGE_DETAIL_ALIGNMENT[index]} max-w-[20rem]`}
                  >
                    {item.detail}
                  </p>
                  
                  {index === 2 && (
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 md:justify-end">
                      {SOCIALS.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="label-mono text-foreground/65 transition-colors hover:text-mint">{social.label}</a>)}
                    </div>
                  )}

                  {item.isFormTrigger && (
                    <button
                      onClick={() => setShowFormModal(true)}
                      type="button"
                      className="group mt-4 inline-flex items-center gap-3 border-b border-ember/75 pb-1 label-mono text-ember transition-colors hover:text-foreground cursor-pointer"
                    >
                      <span>Start transmission</span>
                    </button>
                  )}
                </article>
              ))}
            </div>
          </div>

          <footer className="atelier-footer relative z-30 flex flex-col gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground opacity-100 md:flex-row md:items-end md:justify-between pt-4 border-t border-white/20">
            <span>Arachne / 2026</span>
            <div className="flex items-center gap-6">
              <a
                href="/privacy"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-mint bg-mint px-5 py-2.5 font-mono text-xs font-bold tracking-[0.2em] text-black shadow-[0_0_22px_rgba(0,245,212,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:shadow-[0_0_26px_rgba(255,255,255,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint cursor-pointer"
              >
                PRIVACY POLICY
              </a>
              <span className="text-mint/90 font-medium">● Full word received / SPIDEY</span>
            </div>
          </footer>
        </div>
      </div>

      {/* SpiderWeb Contact Form Overlay Modal */}
      <ContactFormModal isOpen={showFormModal} onClose={() => setShowFormModal(false)} />
    </section>
  );
}
