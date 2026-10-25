import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';

const DEMO_PASSWORD = 'demo1234';

const projects = [
  {
    title: 'Smart Attendance System using Face Recognition',
    abstract:
      'An automated attendance system that uses classroom cameras and face recognition to mark student attendance, reducing proxy attendance and manual effort for teachers.',
    domain: 'AI/ML',
    year: 2024,
    supervisor: 'Dr. Adeel Ansari',
    teamMembers: ['Ali Khan', 'Sara Ahmed'],
  },
  {
    title: 'Campus Marketplace Mobile App',
    abstract:
      'A mobile marketplace where students can buy and sell used books, electronics and other items within the university, with in-app chat and verified student accounts.',
    domain: 'Mobile',
    year: 2023,
    supervisor: 'Ms. Hina Shah',
    teamMembers: ['Bilal Raza', 'Fatima Noor'],
  },
  {
    title: 'IoT Based Smart Parking System',
    abstract:
      'Ultrasonic sensors detect free parking slots and a web dashboard shows live availability to drivers, reducing time spent searching for parking on campus.',
    domain: 'IoT',
    year: 2025,
    supervisor: 'Dr. Imran Ali',
    teamMembers: ['Usman Tariq', 'Ayesha Malik'],
  },
  {
    title: 'AI Chatbot for University Admissions',
    abstract:
      'A conversational assistant that answers prospective students’ questions about programs, fees and deadlines using the university’s admission documents.',
    domain: 'AI/ML',
    year: 2025,
    supervisor: 'Dr. Adeel Ansari',
    teamMembers: ['Hamza Iqbal', 'Zainab Hussain'],
  },
  {
    title: 'Online Examination and Proctoring Platform',
    abstract:
      'A web platform for conducting online exams with question banks, auto-grading and webcam-based proctoring to detect suspicious behaviour.',
    domain: 'Web',
    year: 2024,
    supervisor: 'Mr. Kashif Raza',
    teamMembers: ['Daniyal Shah', 'Maryam Javed'],
  },
  {
    title: 'Blockchain Based Degree Verification',
    abstract:
      'Universities publish degree records to a blockchain so employers can instantly verify the authenticity of a graduate’s degree without contacting the university.',
    domain: 'Blockchain',
    year: 2023,
    supervisor: 'Dr. Sadia Khan',
    teamMembers: ['Omer Farooq'],
  },
  {
    title: 'Crop Disease Detection from Leaf Images',
    abstract:
      'A mobile app that lets farmers photograph crop leaves and uses a convolutional neural network to identify common plant diseases and suggest treatments.',
    domain: 'AI/ML',
    year: 2022,
    supervisor: 'Dr. Imran Ali',
    teamMembers: ['Hassan Ali', 'Nimra Saeed'],
  },
  {
    title: 'Hospital Appointment and Queue Management',
    abstract:
      'A web and SMS based system for booking doctor appointments and tracking live queue position, reducing waiting time in hospital outpatient departments.',
    domain: 'Web',
    year: 2022,
    supervisor: 'Ms. Hina Shah',
    teamMembers: ['Saad Ahmed', 'Mahnoor Ali'],
  },
];

async function upsertUser({ name, email, role, avatar }) {
  return prisma.user.upsert({
    where: { email },
    update: { avatar },
    create: { name, email, role, avatar, passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10) },
  });
}

async function main() {
  const faculty = await upsertUser({
    name: 'Dr. Adeel Ansari',
    email: 'faculty@demo.com',
    role: 'faculty',
    avatar: 'avatar4',
  });
  const student = await upsertUser({
    name: 'Syed Kazim Hussain',
    email: 'student@demo.com',
    role: 'student',
    avatar: 'avatar1',
  });
  await upsertUser({
    name: 'System Admin',
    email: 'admin@demo.com',
    role: 'admin',
    avatar: 'avatar7',
  });

  await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      studentId: '2312219',
      department: 'Computer Science',
      bio: 'Full stack developer interested in AI powered web applications.',
      skills: ['Frontend development', 'UI design', 'Databases'],
      technologies: ['Next.js', 'React', 'PostgreSQL'],
      interests: ['Education', 'Research tools'],
      domains: ['AI/ML', 'Web'],
    },
  });

  await prisma.project.deleteMany({ where: { uploadedById: faculty.id } });
  await prisma.project.createMany({
    data: projects.map((p) => ({ ...p, uploadedById: faculty.id })),
  });

  console.log(`Seeded ${projects.length} projects.`);
  console.log(`Demo logins (password "${DEMO_PASSWORD}"): admin@demo.com, faculty@demo.com, student@demo.com`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
