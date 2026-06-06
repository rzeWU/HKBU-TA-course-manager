import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";

export async function GET() {
  const records = await prisma.tAManpower.findMany({
    orderBy: [{ academicYear: "desc" }, { semester: "asc" }],
  });
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || file?.name || "";
    const academicYear = formData.get("academicYear") as string;
    const semester = formData.get("semester") as string;

    if (!file || !academicYear || !semester) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const blob = await put(
      `manpower/${academicYear}/${semester}/${file.name}`,
      file,
      { access: "public" }
    );

    // Upsert: delete existing for same year+semester, then create
    await prisma.tAManpower.deleteMany({
      where: { academicYear, semester },
    });
    const record = await prisma.tAManpower.create({
      data: {
        title,
        academicYear,
        semester,
        fileUrl: blob.url,
        fileSize: file.size,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
