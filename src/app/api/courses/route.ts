import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const courses = await prisma.course.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json(courses);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, programSlug, description, courseUrl } = body;
    if (!code || !name) {
      return NextResponse.json(
        { error: "code and name are required" },
        { status: 400 }
      );
    }
    const course = await prisma.course.upsert({
      where: { code: code.toUpperCase() },
      update: { name, programSlug: programSlug || "mscdabe", description: description || null, courseUrl: courseUrl || null },
      create: { code: code.toUpperCase(), name, programSlug: programSlug || "mscdabe", description: description || null, courseUrl: courseUrl || null },
    });
    return NextResponse.json(course, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { code, isActive, programSlug } = body;
    const data: Record<string, unknown> = {};
    if (typeof isActive === "boolean") data.isActive = isActive;
    if (programSlug) data.programSlug = programSlug;
    const course = await prisma.course.update({
      where: { code: code.toUpperCase() },
      data,
    });
    return NextResponse.json(course);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;
    await prisma.course.delete({ where: { code: code.toUpperCase() } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
