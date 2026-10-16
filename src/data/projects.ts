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
  palette: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "BlackHole",
    title: "VR-Black Hole",
    client: "Virtual Reality",
    year: "2025",
    img: case1,
    tag: "Black Hole",
    note: "An VR simulation fo falling into a black hole.",
    overview: "Black Hole is a virtual reality experience that simulates the journey of falling into a black hole, allowing users to explore the physics and visual phenomena associated with these cosmic entities.",
    challenge: "Create an immersive VR experience that accurately represents the complex physics of black holes while maintaining user engagement and comfort.",
    outcome: "A VR experience that immerses users in the awe-inspiring and mysterious environment of a black hole, providing both educational and entertainment value.",
    services: ["VR Simulation", "Black Hole", "Unity VR"],
    palette: "from-[#b21d18]/45 via-[#110607]/70 to-[#040506]",
  },
  {
    slug: "Verdantia",
    title: "Verdantia",
    client: "Augmented Reality",
    year: "2026",
    img: case2,
    tag: "AR-Garden",
    note: "An augmented reality experience that responds to user interaction.",
    overview: "Verdantia is an augmented reality experience that allows users to interact with a virtual garden props and sea fishes.",
    challenge: "Design an AR experience that seamlessly blends virtual elements with the real world, providing an engaging and interactive environment for users.",
    outcome: "An AR experience that captivates users with its interactive elements, allowing them to explore and manipulate a virtual garden in a real-world setting.",
    services: ["AR Development", "AR Design", "Unity AR", "Interactive Experience"],
    palette: "from-[#355d50]/45 via-[#071011]/70 to-[#040506]",
  },
  {
    slug: "GreenVoid",
    title: "The Green Void",
    client: "3D Game",
    year: "2025",
    img: case3,
    tag: "Thrilling Experience",
    note: "A 3D game that explores the concept of a green void.",
    overview: "The Green Void is a 3D game that immerses players in a mysterious green void, exploring themes of isolation and discovery.",
    challenge: "Create a compelling 3D gaming experience that captures the essence of a green void while providing engaging gameplay.",
    outcome: "A 3D game that offers players an immersive and thought-provoking experience within the unique setting of a green void.",
    services: ["3D Game Development", "Game Design", "Unity", "Interactive Experience"],
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
    palette: "from-[#a42b1e]/48 via-[#100707]/72 to-[#040506]",
  },
];

export function getProject(slug: string) {
  return PROJECTS.find((project) => project.slug === slug);
}
