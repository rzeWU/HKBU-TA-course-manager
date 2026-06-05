import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const assessments = await prisma.assessment.findMany({
    where: {
      course: { code: code.toUpperCase() },
      ...(type ? { type } : {}),
    },
    include: {
      academicYear: { select: { yearLabel: true, semester: true } },
      gradeEntries: {
        select: { totalScore: true },
      },
    },
    orderBy: [{ academicYear: { yearLabel: "asc" } }, { type: "asc" }],
  });

  const distribution: Record<string, number[]> = {};
  for (const a of assessments) {
    const key = `${a.academicYear.yearLabel} | ${a.academicYear.semester}`;
    distribution[key] = a.gradeEntries.map((e) => e.totalScore);
  }

  return NextResponse.json(distribution);
}
