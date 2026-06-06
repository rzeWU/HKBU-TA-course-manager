import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const details = await prisma.tAManpowerDetail.findMany({
    where: { manpowerId: id },
    orderBy: { courseCode: "asc" },
  });
  return NextResponse.json(details);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { courseCode, weeklyHours, duties, skills } = body;

  const detail = await prisma.tAManpowerDetail.upsert({
    where: {
      manpowerId_courseCode: { manpowerId: id, courseCode: courseCode.toUpperCase() },
    },
    update: { weeklyHours, duties, skills },
    create: { manpowerId: id, courseCode: courseCode.toUpperCase(), weeklyHours, duties, skills },
  });

  return NextResponse.json(detail, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const courseCode = searchParams.get("courseCode");
  if (courseCode) {
    await prisma.tAManpowerDetail.deleteMany({
      where: { manpowerId: id, courseCode: courseCode.toUpperCase() },
    });
  }
  return NextResponse.json({ success: true });
}
