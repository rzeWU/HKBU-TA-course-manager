// Seed script: run with `npx tsx scripts/seed.ts`
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import ws from "ws";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({
  adapter: new PrismaNeon(pool),
});

async function main() {
  // Seed courses
  const econ7880 = await prisma.course.upsert({
    where: { code: "ECON7880" },
    update: {},
    create: {
      code: "ECON7880",
      name: "Big Data Analytics",
    },
  });

  const econ3105 = await prisma.course.upsert({
    where: { code: "ECON3105" },
    update: {},
    create: {
      code: "ECON3105",
      name: "Applied Business Data Mining",
    },
  });

  console.log("Seeded courses:", econ7880.code, econ3105.code);

  // Seed ECON7880 2025-2026 Semester 1 with sample data
  const ay7880 = await prisma.academicYear.upsert({
    where: {
      courseId_yearLabel_semester: {
        courseId: econ7880.id,
        yearLabel: "2025-2026",
        semester: "Semester 1",
      },
    },
    update: {},
    create: {
      courseId: econ7880.id,
      yearLabel: "2025-2026",
      semester: "Semester 1",
    },
  });

  // Seed sample assessments for ECON7880
  const sampleAssessments = [
    { type: "Assignment 1", mean: 91.26, median: 97, count: 62, max: 100, min: 60 },
    { type: "Assignment 2", mean: 88.50, median: 92, count: 60, max: 100, min: 55 },
    { type: "Assignment 3", mean: 92.09, median: 97, count: 60, max: 100, min: 50 },
    { type: "Midterm", mean: 89.53, median: 92, count: 58, max: 100, min: 55 },
    { type: "Final", mean: 85.30, median: 88, count: 55, max: 100, min: 50 },
  ];

  for (const a of sampleAssessments) {
    await prisma.assessment.upsert({
      where: {
        academicYearId_type: {
          academicYearId: ay7880.id,
          type: a.type,
        },
      },
      update: {},
      create: {
        academicYearId: ay7880.id,
        courseId: econ7880.id,
        type: a.type,
        totalPoints: 100,
        studentCount: a.count,
        meanScore: a.mean,
        medianScore: a.median,
        maxScore: a.max,
        minScore: a.min,
      },
    });
  }

  // Seed ECON3105 2025-2026 Semester 1
  const ay3105_2526 = await prisma.academicYear.upsert({
    where: {
      courseId_yearLabel_semester: {
        courseId: econ3105.id,
        yearLabel: "2025-2026",
        semester: "Semester 1",
      },
    },
    update: {},
    create: {
      courseId: econ3105.id,
      yearLabel: "2025-2026",
      semester: "Semester 1",
    },
  });

  const sampleAssessments3105 = [
    { type: "Assignment 1", mean: 88.00, median: 90, count: 65 },
    { type: "Assignment 2", mean: 86.50, median: 89, count: 63 },
    { type: "Assignment 3", mean: 85.20, median: 87, count: 61 },
    { type: "Midterm", mean: 89.59, median: 92, count: 65 },
    { type: "Final", mean: 82.50, median: 85, count: 60 },
  ];

  for (const a of sampleAssessments3105) {
    await prisma.assessment.upsert({
      where: {
        academicYearId_type: {
          academicYearId: ay3105_2526.id,
          type: a.type,
        },
      },
      update: {},
      create: {
        academicYearId: ay3105_2526.id,
        courseId: econ3105.id,
        type: a.type,
        totalPoints: 100,
        studentCount: a.count,
        meanScore: a.mean,
        medianScore: a.median,
        maxScore: 100,
        minScore: 50,
      },
    });
  }

  // Seed ECON3105 2024-2025 Semester 1
  const ay3105_2425 = await prisma.academicYear.upsert({
    where: {
      courseId_yearLabel_semester: {
        courseId: econ3105.id,
        yearLabel: "2024-2025",
        semester: "Semester 1",
      },
    },
    update: {},
    create: {
      courseId: econ3105.id,
      yearLabel: "2024-2025",
      semester: "Semester 1",
    },
  });

  const prevAssessments = [
    { type: "Assignment 1", mean: 87.00, median: 89, count: 60 },
    { type: "Assignment 2", mean: 84.50, median: 87, count: 58 },
    { type: "Assignment 3", mean: 83.00, median: 85, count: 57 },
    { type: "Midterm", mean: 88.00, median: 91, count: 61 },
    { type: "Final", mean: 81.00, median: 83, count: 58 },
  ];

  for (const a of prevAssessments) {
    await prisma.assessment.upsert({
      where: {
        academicYearId_type: {
          academicYearId: ay3105_2425.id,
          type: a.type,
        },
      },
      update: {},
      create: {
        academicYearId: ay3105_2425.id,
        courseId: econ3105.id,
        type: a.type,
        totalPoints: 100,
        studentCount: a.count,
        meanScore: a.mean,
        medianScore: a.median,
        maxScore: 100,
        minScore: 50,
      },
    });
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
