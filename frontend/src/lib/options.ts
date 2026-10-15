export const AVATARS = Array.from({ length: 10 }, (_, i) => `avatar${i + 1}`);

export const avatarSrc = (avatar: string) => `/avatars/${avatar}.png`;

export const SKILL_OPTIONS = [
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Mobile App Development",
  "UI/UX Design",
  "Machine Learning",
  "Deep Learning",
  "Computer Vision",
  "Natural Language Processing",
  "Data Analysis",
  "Database Design",
  "Cloud Computing",
  "DevOps",
  "Cybersecurity",
  "IoT & Embedded Systems",
  "Blockchain",
  "Game Development",
  "Software Testing",
  "Project Management",
  "Technical Writing",
];

export const TECHNOLOGY_OPTIONS = [
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring Boot",
  "C#/.NET",
  "Flutter",
  "React Native",
  "Kotlin",
  "Swift",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Firebase",
  "TensorFlow",
  "PyTorch",
  "Docker",
  "AWS",
  "Arduino",
];

export const INTEREST_OPTIONS = [
  "Education",
  "Healthcare",
  "FinTech",
  "E-commerce",
  "Agriculture",
  "Smart Cities",
  "Transportation",
  "Social Good",
  "Entertainment",
  "Research Tools",
];

export const DOMAIN_OPTIONS = [
  "AI/ML",
  "Web",
  "Mobile",
  "IoT",
  "Blockchain",
  "Cybersecurity",
  "Data Science",
  "Cloud",
  "Game Development",
  "AR/VR",
];
