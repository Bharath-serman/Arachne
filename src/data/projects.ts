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
    slug: "SceneScentry",
    title: "SceneScentry-Plugin",
    client: "Unity Plugin",
    year: "2026",
    img: case4,
    tag: "Unity Plugin",
    note: "An Scene Management plugin for Unity Engine.",
    overview: "SceneScentry is a Unity plugin designed to enhance scene management within the Unity Engine, providing developers with tools to streamline their workflow and improve project organization.",
    challenge: "Develop a Unity plugin that simplifies scene management, offering features that improve efficiency and organization for developers working on complex projects.",
    outcome: "A Unity plugin that streamlines scene management and improves project organization for developers.",
    services: ["Unity Development", "Plugin Design", "Plugin Development", "Scene Management"],
    palette: "from-[#a42b1e]/48 via-[#100707]/72 to-[#040506]",
  },
  {
    slug: "Unity-Portfolio",
    title: "Unity Portfolio",
    client: "Unity Project",
    year: "2025",
    img: case4,
    tag: "Unity Portfolio",
    note: "A Unity project showcasing a portfolio of mine.",
    overview: "The Unity Portfolio is a 3D project that showcases a collection of my work, demonstrating my skills and experience in Unity development.",
    challenge: "Create a visually appealing and interactive Unity project that effectively showcases my portfolio.",
    outcome: "A 3D project that effectively showcases my work and skills..",
    services: ["Unity Development", "3D Design", "Portfolio Showcase"],
    palette: "from-[#a42b1e]/48 via-[#100707]/72 to-[#040506]",
  },
  {
    slug: "E-Commerce Site",
    title: "E-Commerce Site",
    client: "Web Development",
    year: "2026",
    img: case2,
    tag: "E-Commerce",
    note: "A modern e-commerce website for selling products online.",
    overview: "The E-Commerce Site is a responsive web application designed to provide users with a seamless shopping experience, featuring product listings, cart functionality, and a secure checkout process.",
    challenge: "Create a user-friendly and scalable e-commerce website that meets the needs of both customers and administrators.",
    outcome: "A fully functional e-commerce website that drives sales and enhances customer satisfaction along with an admin panel.",
    services: ["Web Development", "Full-Stack Development", "E-Commerce", "Admin Panel"],
    palette: "from-[#a42b1e]/48 via-[#100707]/72 to-[#040506]",
  },
  {
    slug: "Musashi-Kana",
    title: "Musashi-Kana",
    client: "Web Development",
    year: "2025",
    img: case1,
    tag: "Web Application",
    note: "A web application for learning and practicing Japanese N5 and N4 level.",
    overview: "Musashi-Kana is a web application designed to help users learn and practice Japanese kana characters, specifically targeting the N5 and N4 levels of the Japanese Language Proficiency Test (JLPT). The application provides interactive exercises, quizzes, and visual aids to enhance the learning experience.",
    challenge: "Develop a web application that effectively teaches Japanese kana characters, ensuring that the content is engaging, educational, and accessible to users of varying skill levels.",
    outcome: "A web application that successfully aids users in learning and practicing Japanese kana characters, improving their proficiency and confidence in the language.",
    services: ["Web Development", "Language Learning", "Responsive Design", "Authentication"],
    palette: "from-[#a42b1e]/48 via-[#100707]/72 to-[#040506]",
  },
  {
    slug: "VR_Masculinity",
    title: "VR_Masculinity",
    client: "Unreal Engine VR",
    year: "2026",
    img: case4,
    tag: "Unreal Engine VR",
    note: "A virtual reality application exploring themes of masculinity and identity.",
    overview: "VR_Masculinity is a virtual reality experience designed to explore and challenge traditional notions of masculinity, providing users with immersive scenarios that encourage reflection and dialogue.",
    challenge: "Create an engaging and thought-provoking virtual reality experience that effectively communicates complex themes related to masculinity and identity.",
    outcome: "A compelling virtual reality application that fosters meaningful discussions about masculinity and identity.",
    services: ["VR Development", "Masculinity", "Unreal Engine", "XR Experience"],
    palette: "from-[#a42b1e]/48 via-[#100707]/72 to-[#040506]",
  },
  {
    slug: "Mini-Mayhem",
    title: "Mini-Mayhem",
    client: "MR Game Development",
    year: "2026",
    img: case4,
    tag: "MR Game",
    note: "A mixed reality game where we shoot enemies.",
    overview: "Mini-Mayhem is a mixed reality game that allows players to shoot and defeat enemies.",
    challenge: "Create an engaging mixed reality game that combines physical and digital elements, providing players with an immersive and interactive experience.",
    outcome: "A compelling mixed reality game that offers players an exciting and immersive gaming experience.",
    services: ["MR Development", "Unity Engine", "Game Design", "XR Development"],
    palette: "from-[#a42b1e]/48 via-[#100707]/72 to-[#040506]",
  },

];

export function getProject(slug: string) {
  return PROJECTS.find((project) => project.slug === slug);
}
