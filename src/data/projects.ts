import case1 from "@/assets/case-1.jpg";
import case2 from "@/assets/case-2.jpg";
import case3 from "@/assets/case-3.jpg";
import case4 from "@/assets/case-4.jpg";

export type Project = {
  slug: string;
  title: string;
  client: string;
  year: string;
  img: string;
  tag: string;
  note: string;
  overview: string;
  challenge: string;
  outcome: string;
  services: string[];
  credits: string[];
  palette: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "redshift-chapter",
    title: "Redshift Chapter",
    client: "Anemoia Films",
    year: "2025",
    img: case1,
    tag: "Title sequence",
    note: "An origin signal rebuilt as a title system.",
    overview: "Redshift Chapter translates a fictional transmission archive into an elastic title language, where typography, flare, and mechanical rhythm develop as one continuous signal.",
    challenge: "Create a title world that could carry an entire series without losing the fragile, analog character of its source material.",
    outcome: "A modular film-title toolkit with opening, interstitial, and end-card states designed to adapt across moving-image formats.",
    services: ["Title design", "Motion system", "Typography", "Film finish"],
    credits: ["Direction / Anemoia", "Motion / Signal Unit", "Sound / Helix Room"],
    palette: "from-[#b21d18]/45 via-[#110607]/70 to-[#040506]",
  },
  {
    slug: "signal-garden",
    title: "Signal Garden",
    client: "Vector Radio",
    year: "2025",
    img: case2,
    tag: "Interactive install",
    note: "A living broadcast environment tuned by touch.",
    overview: "Signal Garden is an interactive field of sound, light, and reactive graphics that lets each visitor tune a short-lived broadcast through touch and proximity.",
    challenge: "Build an exhibition system that feels physical and immediate while preserving a refined visual language at every possible interaction state.",
    outcome: "A responsive installation with a durable visual operating system for live behavior, environmental lighting, and screen content.",
    services: ["Interaction design", "Spatial graphics", "Creative technology", "Installation system"],
    credits: ["Commission / Vector Radio", "Art direction / Anemoia", "Systems / Field Unit"],
    palette: "from-[#355d50]/45 via-[#071011]/70 to-[#040506]",
  },
  {
    slug: "chrome-requiem",
    title: "Chrome Requiem",
    client: "Studio Halcyon",
    year: "2024",
    img: case3,
    tag: "Brand film",
    note: "A visual identity seen through moving metal and light.",
    overview: "Chrome Requiem distils a studio identity into an atmospheric brand film, observing reflections, surfaces, and type as materials under a controlled moving light.",
    challenge: "Give a new identity a cinematic point of view without reducing it to a conventional logo reveal.",
    outcome: "A calibrated brand-film language that moves from macro material studies to a precise, memorable final mark.",
    services: ["Brand film", "Look development", "3D direction", "Edit and sound"],
    credits: ["Studio / Halcyon", "Film direction / Anemoia", "CG / Night Shift"],
    palette: "from-[#697174]/42 via-[#0d0f11]/72 to-[#040506]",
  },
  {
    slug: "long-corridor",
    title: "Long Corridor",
    client: "Nocturne Lab",
    year: "2024",
    img: case4,
    tag: "Web experience",
    note: "A spatial web story for an after-hours archive.",
    overview: "Long Corridor turns an archival site into a nocturnal passage. Visitors move through a sequence of rooms, signals, and materials rather than a conventional portfolio grid.",
    challenge: "Make a dense archive inviting to explore while giving every project enough atmosphere and independent narrative weight.",
    outcome: "A web experience where navigation behaves like a camera move and each archive entry feels discovered rather than listed.",
    services: ["Digital art direction", "Experience design", "Motion design", "Frontend system"],
    credits: ["Client / Nocturne Lab", "Digital direction / Anemoia", "Development / Studio Signal"],
    palette: "from-[#a42b1e]/48 via-[#100707]/72 to-[#040506]",
  },
];

export function getProject(slug: string) {
  return PROJECTS.find((project) => project.slug === slug);
}
