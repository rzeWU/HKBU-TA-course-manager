import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const files = await prisma.courseFile.findMany({
    where: { course: { code: code.toUpperCase() } },
    orderBy: [{ academicYear: "desc" }, { type: "asc" }],
  });
  return NextResponse.json(files);
}

// File upload handled client-side via Supabase; this just records metadata
export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const body = await request.json();
    const { name, type, academicYear, semester, fileUrl, fileSize } = body;

    if (!name || !type || !academicYear || !semester || !fileUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const file = await prisma.courseFile.create({
      data: {
        courseId: course.id,
        name,
        type,
        academicYear,
        semester,
        fileUrl,
        fileSize: fileSize || 0,
      },
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to add file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
