import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const records = await prisma.weeklyHour.findMany({
    orderBy: [{ academicYear: "asc" }, { semester: "asc" }],
  });
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { academicYear, semester, hours } = body;

  const record = await prisma.weeklyHour.upsert({
    where: {
      academicYear_semester: { academicYear, semester },
    },
    update: { hours },
    create: { academicYear, semester, hours },
  });

  return NextResponse.json(record);
}
