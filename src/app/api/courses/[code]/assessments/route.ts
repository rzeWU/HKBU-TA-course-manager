import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { AssessmentUploadPayload } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { searchParams } = new URL(_request.url);
  const type = searchParams.get("type");

  const assessments = await prisma.assessment.findMany({
    where: {
      course: { code: code.toUpperCase() },
      ...(type ? { type } : {}),
    },
    include: {
      academicYear: { select: { yearLabel: true, semester: true } },
    },
    orderBy: [{ academicYear: { yearLabel: "asc" } }, { type: "asc" }],
  });

  return NextResponse.json(assessments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const body: AssessmentUploadPayload = await request.json();
    const { academicYear, semester, type, totalPoints, students, summaryStats } =
      body;

    const course = await prisma.course.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Guard: files must exist for this assessment type before uploading grades
    const fileCount = await prisma.courseFile.count({
      where: { courseId: course.id, type },
    });
    if (fileCount === 0) {
      return NextResponse.json(
        {
          error: `No files uploaded for "${type}". Please upload question paper / criteria files via Manage Files first.`,
        },
        { status: 400 }
      );
    }

    // Find or create academic year
    let ay = await prisma.academicYear.findUnique({
      where: {
        courseId_yearLabel_semester: {
          courseId: course.id,
          yearLabel: academicYear,
          semester,
        },
      },
    });

    if (!ay) {
      ay = await prisma.academicYear.create({
        data: {
          courseId: course.id,
          yearLabel: academicYear,
          semester,
        },
      });
    }

    // Upsert: delete existing assessment and its entries, then recreate
    const existing = await prisma.assessment.findUnique({
      where: {
        academicYearId_type: {
          academicYearId: ay.id,
          type,
        },
      },
    });

    if (existing) {
      await prisma.gradeEntry.deleteMany({
        where: { assessmentId: existing.id },
      });
      await prisma.assessment.delete({
        where: { id: existing.id },
      });
    }

    // Create assessment with grade entries
    const assessment = await prisma.assessment.create({
      data: {
        academicYearId: ay.id,
        courseId: course.id,
        type,
        totalPoints,
        studentCount: summaryStats.studentCount,
        meanScore: summaryStats.mean,
        medianScore: summaryStats.median,
        maxScore: summaryStats.max,
        minScore: summaryStats.min,
        gradeEntries: {
          create: students.map((s) => ({
            studentId: s.studentId,
            surname: s.surname,
            firstName: s.firstName,
            totalScore: s.totalScore,
            subScores: s.subScores,
            comments: s.comments,
            specialIssue: s.specialIssue,
          })),
        },
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to upload assessment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
