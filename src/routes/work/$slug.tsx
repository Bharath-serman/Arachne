import { createFileRoute } from "@tanstack/react-router";
import { getProject } from "@/data/projects";
import { SilkOverlay } from "@/components/decor/SilkOverlay";

export const Route = createFileRoute("/work/$slug")({
  head: ({ params }) => {
    const project = getProject(params.slug);
    return {
      meta: [
        { title: project ? `${project.title} — ARACHNÉ` : "Case file — ARACHNÉ" },
        { name: "description", content: project?.note ?? "ARACHNÉ case study." },
      ],
    };
  },
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const project = getProject(slug);

  if (!project) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-void px-6 text-center text-foreground">
        <div><p className="label-mono text-mint/80">Case file / unavailable</p><h1 className="mt-5 font-display text-5xl font-extralight">Signal not found.</h1><a href="/#cases" className="mt-8 inline-flex border-b border-ember pb-1 label-mono text-ember">Return to archive ↗</a></div>
      </main>
    );
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-void text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <img src={project.img} alt="" aria-hidden="true" className="absolute inset-[-12%] h-[124%] w-[124%] object-cover opacity-[0.13] blur-3xl grayscale" />
        <div className={`absolute inset-0 bg-gradient-to-b ${project.palette}`} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(238,246,247,.018)_1px,transparent_1px),linear-gradient(rgba(238,246,247,.012)_1px,transparent_1px)] bg-[size:7rem_7rem] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
        <SilkOverlay variant="detail" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(88rem,120vh)] overflow-hidden opacity-90"><SilkOverlay variant="detail" /></div>

      <header className="relative z-20 mx-auto flex max-w-[108rem] items-center justify-between px-6 py-7 md:px-10 md:py-9">
        <a href="/" className="font-display text-lg font-light tracking-[.28em] text-foreground/90">ARACHNÉ</a>
        <a href="/#cases" className="label-mono text-foreground/65 transition-colors hover:text-mint">
            ← Return to archive
        </a>
      </header>

      <section className="relative z-10 mx-auto max-w-[108rem] px-6 pb-16 pt-[7vh] md:px-10 md:pb-24 md:pt-[11vh]">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8"><p className="label-mono text-mint/80">Case file / {project.year} / {project.client}</p><h1 className="mt-6 font-display text-[clamp(4.2rem,10vw,12rem)] font-extralight leading-[.78] tracking-[-.075em] text-foreground/95">{project.title}</h1><p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-foreground/75 md:text-2xl">{project.overview}</p></div>
          <div className="border-l border-white/20 pl-5 md:col-span-3 md:col-start-10"><p className="label-mono text-ember">Project index</p><p className="mt-4 font-display text-5xl font-extralight text-foreground/95">{project.year}</p><p className="mt-4 label-mono text-foreground/60">{project.client}</p><p className="mt-2 label-mono text-foreground/45">{project.tag}</p></div>
        </div>

        <div className="relative mt-14 border border-white/30 bg-black/25 p-2 shadow-[0_38px_100px_rgba(0,0,0,.56)] md:mt-20 md:p-4">
          <span className="absolute left-5 top-5 z-10 h-12 w-12 border-l border-t border-white/80" />
          <span className="absolute bottom-5 right-5 z-10 h-12 w-12 border-b border-r border-white/80" />
          <span className="absolute right-7 top-7 z-10 label-mono text-ember">FOLIO / {project.year}</span>
          <img src={project.img} alt={`${project.title} project visual`} width={1600} height={1000} className="aspect-[16/9] w-full object-cover brightness-[1.05] contrast-[1.06]" />
        </div>

        <div className="mt-20 grid gap-12 border-t border-white/20 pt-10 md:grid-cols-12 md:pt-14">
          <div className="md:col-span-7"><p className="label-mono text-mint/80">The brief</p><h2 className="mt-4 font-display text-4xl font-extralight md:text-6xl"></h2><p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">{project.challenge}</p></div>
          <div className="md:col-span-4 md:col-start-9"><p className="label-mono text-mint/80">Outcome</p><p className="mt-4 text-base leading-relaxed text-foreground/80">{project.outcome}</p></div>
        </div>

        <div className="mt-20 grid gap-10 border-t border-white/20 pt-10 md:grid-cols-12 md:pt-14">
          <div className="md:col-span-6"><p className="label-mono text-mint/80">Services</p><ul className="mt-5 divide-y divide-white/15 border-y border-white/15">{project.services.map((service, index) => <li key={service} className="flex items-center justify-between py-3 font-display text-2xl font-light text-foreground/90"><span>{service}</span><span className="label-mono text-foreground/40">0{index + 1}</span></li>)}</ul></div>
          {/* <div className="md:col-span-4 md:col-start-9"><p className="label-mono text-mint/80">Credits</p><ul className="mt-5 space-y-3">{project.credits.map((credit) => <li key={credit} className="border-l border-ember/70 pl-4 text-sm text-foreground/70">{credit}</li>)}</ul><a href="/#contact" className="mt-10 inline-flex border-b border-ember pb-1 label-mono text-ember transition-colors hover:text-foreground">Start a related project ↗</a></div> */}
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-[108rem] items-center justify-between border-t border-white/15 px-6 py-8 text-[10px] font-medium uppercase tracking-[.18em] text-foreground/45 md:px-10">
        <span>ARACHNÉ / case archive</span>
        <div className="flex items-center gap-6">
          <a href="/privacy" className="text-foreground/60 transition-colors hover:text-mint">Privacy Policy</a>
          <a href="/#cases" className="text-mint/80">Back to all folios</a>
        </div>
      </footer>
    </main>
  );
}
