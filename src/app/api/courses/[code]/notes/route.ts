import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const notes = await prisma.note.findMany({
    where: { course: { code: code.toUpperCase() } },
    orderBy: [{ academicYear: "asc" }, { assessmentType: "asc" }],
  });
  return NextResponse.json(notes);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const body = await request.json();
    const { assessmentType, academicYear, content } = body;

    if (!assessmentType || !academicYear || !content) {
      return NextResponse.json(
        { error: "assessmentType, academicYear, and content are required" },
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

    // Upsert: delete existing note for same combo, then create
    await prisma.note.deleteMany({
      where: {
        courseId: course.id,
        assessmentType,
        academicYear,
      },
    });

    const note = await prisma.note.create({
      data: {
        courseId: course.id,
        assessmentType,
        academicYear,
        content,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to save note";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
