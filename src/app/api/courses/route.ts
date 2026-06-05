import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });
  return NextResponse.json(courses);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name } = body;
    if (!code || !name) {
      return NextResponse.json(
        { error: "code and name are required" },
        { status: 400 }
      );
    }
    const course = await prisma.course.create({
      data: { code: code.toUpperCase(), name },
    });
    return NextResponse.json(course, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
