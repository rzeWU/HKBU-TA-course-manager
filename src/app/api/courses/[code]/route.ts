import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const course = await prisma.course.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      academicYears: {
        include: {
          assessments: {
            select: {
              type: true,
              meanScore: true,
              medianScore: true,
              maxScore: true,
              minScore: true,
              studentCount: true,
              totalPoints: true,
            },
            orderBy: { type: "asc" },
          },
        },
        orderBy: { yearLabel: "asc" },
      },
      notes: { orderBy: [{ academicYear: "asc" }, { assessmentType: "asc" }] },
      courseFiles: {
        orderBy: [{ academicYear: "desc" }, { type: "asc" }],
      },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json(course);
}
